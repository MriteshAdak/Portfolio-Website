import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CarouselComponent } from '../../components/carousel/carousel';
import { HeaderComponent } from '../../components/header/header';
import { SectionComponent } from '../../components/section/section';
import { TagsComponent } from '../../components/tags/tags';
import { Contact } from '../../interfaces/contact';
import { Experience } from '../../interfaces/experience';
import { Project } from '../../interfaces/project';
import { UserProfile } from '../../interfaces/user-profile';

@Component({
  selector: 'app-landing-page',
  imports: [HeaderComponent, SectionComponent, CarouselComponent, TagsComponent],
  template: `
    <main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <app-header [heading]="profile.fullName" />

      <app-section
        id="about"
        eyebrow="User info"
        [title]="profile.fullName"
        [description]="profile.summary"
        actionLabel="Jump to projects"
        actionHref="#projects"
      >
        <div class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div class="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p class="text-sm uppercase tracking-[0.35em] text-cyan-300">Summary</p>
            <p class="mt-4 text-base leading-7 text-slate-200">
              {{ profile.headline }}
            </p>
            <app-tags class="mt-5" [tags]="highlights" />
          </div>

          <div class="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <p class="text-sm uppercase tracking-[0.35em] text-cyan-100">What I build</p>
            <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-100">
              <li>Products that balance strong UI, clean Angular architecture, and practical backend flow.</li>
              <li>Single-page experiences that keep recruiter scanning fast and focused.</li>
              <li>Admin tooling that keeps content easy to update once the dashboard is connected.</li>
            </ul>
          </div>
        </div>
      </app-section>

      <app-section
        id="projects"
        eyebrow="Projects"
        title="Carousel of featured work"
        description="A scannable project carousel with compact cards so the work stays front and center."
      >
        <app-carousel [projects]="projects" />
      </app-section>

      <app-section
        id="experiences"
        eyebrow="Experiences"
        title="Recent experience"
        description="A concise timeline of the roles and responsibilities that shape the work above."
      >
        <div class="space-y-4">
          @for (experience of experiences; track experience.id) {
            <article class="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:grid-cols-[0.85fr_1.15fr] sm:p-6">
              <div>
                <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">{{ formatPeriod(experience) }}</p>
                <h3 class="mt-2 text-xl font-semibold text-white">{{ experience.role }}</h3>
                <p class="mt-1 text-sm text-slate-300">{{ experience.company }}</p>
              </div>

              <p class="text-sm leading-6 text-slate-200">{{ experience.summary }}</p>
            </article>
          }
        </div>
      </app-section>

      <app-section
        id="contact"
        eyebrow="Contact details"
        title="Reach me directly"
        description="Email, LinkedIn, and GitHub are the primary public contact channels for this V1 landing page."
      >
        <div class="grid gap-4 md:grid-cols-3">
          <a [href]="'mailto:' + contact.email" class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-white/10">
            <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">Email</p>
            <p class="mt-3 text-lg font-medium text-white">{{ contact.email }}</p>
          </a>
          <a [href]="contact.linkedinUrl" target="_blank" rel="noopener noreferrer" class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-white/10">
            <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">LinkedIn</p>
            <p class="mt-3 text-lg font-medium text-white">Open profile</p>
          </a>
          <a [href]="contact.githubUrl" target="_blank" rel="noopener noreferrer" class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-white/10">
            <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">GitHub</p>
            <p class="mt-3 text-lg font-medium text-white">Browse source</p>
          </a>
        </div>
      </app-section>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  protected readonly profile: UserProfile = {
    fullName: 'Mritesh Adak',
    headline: 'Angular and backend-focused engineer building clean, fast, recruiter-friendly portfolio experiences.',
    summary:
      'I build modern interfaces with Angular, backed by practical server architecture and content flows that are easy to maintain. This landing page is intentionally compact: it surfaces who I am, the work I have done, where I have worked, and how to reach me.',
  };

  protected readonly contact: Contact = {
    email: 'mritesh@example.com',
    linkedinUrl: 'https://www.linkedin.com/in/mritesh-adak',
    githubUrl: 'https://github.com/mritesh-adak',
  };

  protected readonly highlights = ['Angular', 'Express', 'Prisma', 'Supabase'];

  protected readonly projects: Project[] = [
    {
      id: 1,
      name: 'Portfolio orchestrator',
      description: 'A polished single-page portfolio shell with a responsive card carousel and content sections tuned for recruiter scanning.',
      projectUrl: 'https://example.com/portfolio-orchestrator',
      tag: 'Angular',
      imageUrl: null,
      displayOrder: 0,
    },
    {
      id: 2,
      name: 'Content dashboard scaffold',
      description: 'An admin-ready backend and UI foundation for updating projects, experiences, and profile content from one place.',
      projectUrl: 'https://example.com/content-dashboard',
      tag: 'Express',
      imageUrl: null,
      displayOrder: 1,
    },
    {
      id: 3,
      name: 'Server + Prisma data layer',
      description: 'A Supabase PostgreSQL backend design with Prisma schemas for portfolio records, sessions, and future expansion.',
      projectUrl: 'https://example.com/server-prisma-layer',
      tag: 'Prisma',
      imageUrl: null,
      displayOrder: 2,
    },
  ];

  protected readonly experiences: Experience[] = [
    {
      id: 1,
      company: 'Independent work',
      role: 'Frontend and platform engineering',
      summary:
        'Built Angular interfaces, planned backend integration points, and shaped dashboard-style workflows that can scale with content management.',
      startDate: '2024-01-01',
      endDate: null,
      isCurrent: true,
      displayOrder: 0,
    },
    {
      id: 2,
      company: 'Previous product teams',
      role: 'UI focused engineer',
      summary:
        'Delivered responsive user interfaces, cleaned up shared component patterns, and worked on data-heavy screens with practical performance tradeoffs.',
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      isCurrent: false,
      displayOrder: 1,
    },
  ];

  protected formatPeriod(experience: Experience): string {
    const start = new Date(experience.startDate).getFullYear();
    const end = experience.isCurrent || !experience.endDate ? 'Present' : new Date(experience.endDate).getFullYear();
    return `${start} — ${end}`;
  }
}