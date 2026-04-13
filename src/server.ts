import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

type PrismaClientType = typeof import('@prisma/client').PrismaClient;
type PrismaClientInstance = InstanceType<PrismaClientType>;

const currentDirname = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(currentDirname, '../browser');
const sessionCookieName = 'admin_session';
const sessionDurationMs = 1000 * 60 * 60 * 12;
let prismaClient: PrismaClientInstance | null = null;

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['localhost', '127.0.0.1', '::1'],
});

app.use(express.json());
app.use(cookieParser());

const loginRateLimiter = rateLimit({
  windowMs: 1000 * 60 * 10,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(2000),
  headline: z.string().trim().max(160).optional(),
});

const contactSchema = z.object({
  email: z.string().trim().email(),
  linkedinUrl: z.string().trim().url(),
  githubUrl: z.string().trim().url(),
});

const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1200),
  projectUrl: z.string().trim().url(),
  imageUrl: z.string().trim().url().optional(),
  tag: z.string().trim().min(1).max(40),
});

const projectUpdateSchema = projectCreateSchema.partial();

const experienceCreateSchema = z.object({
  company: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(1200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().optional(),
});

const experienceUpdateSchema = experienceCreateSchema.partial();

function parseId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getAdminCredentials() {
  return {
    id: process.env['ADMIN_ID'],
    passwordHash: process.env['ADMIN_PASSWORD_HASH'],
    passwordFallback: process.env['ADMIN_PASSWORD'],
  };
}

function setSessionCookie(res: express.Response, token: string): void {
  res.cookie(sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env['NODE_ENV'] === 'production',
    maxAge: sessionDurationMs,
    path: '/',
  });
}

function clearSessionCookie(res: express.Response): void {
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env['NODE_ENV'] === 'production',
    path: '/',
  });
}

async function getPrismaClient(): Promise<PrismaClientInstance> {
  if (!prismaClient) {
    const { PrismaClient } = await import('@prisma/client');
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

function isPrismaNotFoundError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2025';
}

async function validateAdminPassword(password: string): Promise<boolean> {
  const credentials = getAdminCredentials();
  if (!credentials.id) {
    return false;
  }

  if (credentials.passwordHash) {
    const { compare } = await import('bcryptjs');
    return compare(password, credentials.passwordHash);
  }

  return credentials.passwordFallback === password;
}

async function getValidSession(token: string | undefined) {
  if (!token) {
    return null;
  }

  const prisma = await getPrismaClient();

  return prisma.adminSession.findFirst({
    where: {
      sessionToken: token,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

const requireAdminSession: express.RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies[sessionCookieName] as string | undefined;
    const session = await getValidSession(token);

    if (!session) {
      clearSessionCookie(res);
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

app.post('/api/auth/login', loginRateLimiter, async (req, res, next) => {
  try {
    const input = z
      .object({
        id: z.string().trim().min(1),
        password: z.string().min(1),
      })
      .safeParse(req.body);

    if (!input.success) {
      res.status(400).json({ message: 'Invalid login payload' });
      return;
    }

    const credentials = getAdminCredentials();
    const idMatches = credentials.id === input.data.id;
    const passwordMatches = await validateAdminPassword(input.data.password);

    if (!idMatches || !passwordMatches) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + sessionDurationMs);
    const prisma = await getPrismaClient();

    await prisma.adminSession.create({
      data: {
        sessionToken,
        expiresAt,
      },
    });

    setSessionCookie(res, sessionToken);
    res.status(200).json({ authenticated: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    const token = req.cookies[sessionCookieName] as string | undefined;
    if (token) {
      const prisma = await getPrismaClient();
      await prisma.adminSession.deleteMany({
        where: {
          sessionToken: token,
        },
      });
    }

    clearSessionCookie(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/session', async (req, res, next) => {
  try {
    const token = req.cookies[sessionCookieName] as string | undefined;
    const session = await getValidSession(token);
    res.status(200).json({ authenticated: Boolean(session) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/public/portfolio', async (_req, res, next) => {
  try {
    const prisma = await getPrismaClient();
    const [profile, projects, experiences] = await Promise.all([
      prisma.userProfile.findFirst({ include: { contact: true } }),
      prisma.project.findMany({ orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }] }),
      prisma.experience.findMany({
        orderBy: [{ displayOrder: 'asc' }, { startDate: 'desc' }],
      }),
    ]);

    res.status(200).json({
      profile,
      contact: profile?.contact ?? null,
      projects,
      experiences,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/profile', requireAdminSession, async (_req, res, next) => {
  try {
    const prisma = await getPrismaClient();
    const profile = await prisma.userProfile.findFirst({ include: { contact: true } });
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/profile', requireAdminSession, async (req, res, next) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid profile payload', issues: parsed.error.issues });
      return;
    }

    const prisma = await getPrismaClient();
    const current = await prisma.userProfile.findFirst({ select: { id: true } });
    const profile = current
      ? await prisma.userProfile.update({
          where: { id: current.id },
          data: parsed.data,
        })
      : await prisma.userProfile.create({ data: parsed.data });

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/contact', requireAdminSession, async (_req, res, next) => {
  try {
    const prisma = await getPrismaClient();
    const profile = await prisma.userProfile.findFirst({ include: { contact: true } });
    res.status(200).json(profile?.contact ?? null);
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/contact', requireAdminSession, async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid contact payload', issues: parsed.error.issues });
      return;
    }

    const prisma = await getPrismaClient();
    const profile = await prisma.userProfile.findFirst({ select: { id: true } });
    if (!profile) {
      res.status(400).json({ message: 'Create profile before adding contact details' });
      return;
    }

    const existing = await prisma.contact.findUnique({
      where: { userId: profile.id },
      select: { id: true },
    });

    const contact = existing
      ? await prisma.contact.update({ where: { id: existing.id }, data: parsed.data })
      : await prisma.contact.create({ data: { ...parsed.data, userId: profile.id } });

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/projects', requireAdminSession, async (_req, res, next) => {
  try {
    const prisma = await getPrismaClient();
    const projects = await prisma.project.findMany({
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/projects', requireAdminSession, async (req, res, next) => {
  try {
    const parsed = projectCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid project payload', issues: parsed.error.issues });
      return;
    }

    const prisma = await getPrismaClient();
    const highestOrder = await prisma.project.findFirst({
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' },
    });

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        displayOrder: (highestOrder?.displayOrder ?? -1) + 1,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/projects/:id', requireAdminSession, async (req, res, next) => {
  try {
    const id = parseId(String(req.params['id']));
    if (!id) {
      res.status(400).json({ message: 'Invalid project id' });
      return;
    }

    const parsed = projectUpdateSchema.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(400).json({ message: 'Invalid project update payload', issues: parsed.success ? [] : parsed.error.issues });
      return;
    }

    const prisma = await getPrismaClient();
    const project = await prisma.project.update({ where: { id }, data: parsed.data });
    res.status(200).json(project);
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    next(error);
  }
});

app.delete('/api/admin/projects/:id', requireAdminSession, async (req, res, next) => {
  try {
    const id = parseId(String(req.params['id']));
    if (!id) {
      res.status(400).json({ message: 'Invalid project id' });
      return;
    }

    const prisma = await getPrismaClient();
    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    next(error);
  }
});

app.get('/api/admin/experiences', requireAdminSession, async (_req, res, next) => {
  try {
    const prisma = await getPrismaClient();
    const experiences = await prisma.experience.findMany({
      orderBy: [{ displayOrder: 'asc' }, { startDate: 'desc' }],
    });
    res.status(200).json(experiences);
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/experiences', requireAdminSession, async (req, res, next) => {
  try {
    const parsed = experienceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid experience payload', issues: parsed.error.issues });
      return;
    }

    const prisma = await getPrismaClient();
    const highestOrder = await prisma.experience.findFirst({
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' },
    });

    const experience = await prisma.experience.create({
      data: {
        company: parsed.data.company,
        role: parsed.data.role,
        summary: parsed.data.summary,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        isCurrent: parsed.data.isCurrent ?? false,
        displayOrder: (highestOrder?.displayOrder ?? -1) + 1,
      },
    });

    res.status(201).json(experience);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/admin/experiences/:id', requireAdminSession, async (req, res, next) => {
  try {
    const id = parseId(String(req.params['id']));
    if (!id) {
      res.status(400).json({ message: 'Invalid experience id' });
      return;
    }

    const parsed = experienceUpdateSchema.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(400).json({ message: 'Invalid experience update payload', issues: parsed.success ? [] : parsed.error.issues });
      return;
    }

    const prisma = await getPrismaClient();
    const experience = await prisma.experience.update({
      where: { id },
      data: {
        company: parsed.data.company,
        role: parsed.data.role,
        summary: parsed.data.summary,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : parsed.data.endDate,
        isCurrent: parsed.data.isCurrent,
      },
    });

    res.status(200).json(experience);
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }

    next(error);
  }
});

app.delete('/api/admin/experiences/:id', requireAdminSession, async (req, res, next) => {
  try {
    const id = parseId(String(req.params['id']));
    if (!id) {
      res.status(400).json({ message: 'Invalid experience id' });
      return;
    }

    const prisma = await getPrismaClient();
    await prisma.experience.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }

    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Internal Server Error' });
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
