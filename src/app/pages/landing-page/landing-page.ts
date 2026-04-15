import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CarouselComponent } from '../../components/carousel/carousel';
import { HeaderComponent } from '../../components/header/header';
import { SectionComponent } from '../../components/section/section';
import { TagsComponent } from '../../components/tags/tags';
import { Experience } from '../../interfaces/experience';
import { PortfolioData } from '../../interfaces/portfolio-data';
import { PortfolioDataService } from '../../services/portfolio-data.service';

@Component({
  selector: 'app-landing-page',
  imports: [HeaderComponent, SectionComponent, CarouselComponent, TagsComponent],
  template: `
    <main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <app-header [heading]="portfolio()?.profile?.fullName ?? 'Portfolio'" />

      @if (loading()) {
        <section class="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-8">
          <p class="detail-text text-sm text-slate-300">Loading portfolio data...</p>
        </section>
      } @else if (errorMessage()) {
        <section class="rounded-[2rem] border border-rose-400/30 bg-rose-400/10 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-8">
          <p class="detail-text text-sm text-rose-100">{{ errorMessage() }}</p>
        </section>
      } @else if (portfolio(); as data) {
        <app-section
          id="about"
          eyebrow="About Me"
          [title]="'M.Sc. Computer Science Student'"
          [description]="data.profile?.summary ?? ''"
          actionLabel="Jump to projects"
          actionHref="#projects"
        >
          <div class="grid gap-4">
            <div class="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <p class="text-sm uppercase tracking-[0.35em] text-cyan-300">Summary</p>
              <p class="detail-text mt-4 mb-4 text-base leading-7 text-slate-200">
                {{ data.profile?.headline }}
              </p>
              <app-tags class="mt-5" [tags]="data.highlights ?? []" />
            </div>

            <!-- <div class="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
              <p class="text-sm uppercase tracking-[0.35em] text-cyan-100">What I build</p>
              <ul class="detail-text mt-4 space-y-3 text-sm leading-6 text-slate-100">
                <li>Products that balance strong UI, clean Angular architecture, and practical backend flow.</li>
                <li>Single-page experiences that keep recruiter scanning fast and focused.</li>
                <li>Admin tooling that keeps content easy to update once the dashboard is connected.</li>
              </ul>
            </div> -->
          </div>
        </app-section>

        <app-section
          id="projects"
          eyebrow="Projects"
          title="Personal Projects"
          description="The projects built so far as a computer science student, with more to come as I continue to learn and grow in my skills."
        >
          <app-carousel [projects]="data.projects" />
        </app-section>

        <app-section
          id="experiences"
          eyebrow="Experiences"
          title="Employment Timeline"
          description="A concise timeline of the roles and responsibilities that shape the skills you see above."
        >
          <div class="space-y-4">
            @for (experience of data.experiences; track experience.id) {
              <article class="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:grid-cols-[0.85fr_1.15fr] sm:p-6">
                <div>
                  <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">{{ formatPeriod(experience) }}</p>
                  <h3 class="mt-2 text-xl font-semibold text-white">{{ experience.role }}</h3>
                  <p class="detail-text mt-1 text-sm text-slate-300">{{ experience.company }}</p>
                </div>

                <p class="detail-text text-sm leading-6 text-slate-200">{{ experience.summary }}</p>
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
            <a [href]="'mailto:' + (data.contact?.email ?? '')" class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-white/10">
              <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">Email</p>
              <p class="mt-3 text-lg font-medium text-white">{{ data.contact?.email }}</p>
            </a>
            <a [href]="data.contact?.linkedinUrl ?? '#'" target="_blank" rel="noopener noreferrer" class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-white/10">
              <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">LinkedIn</p>
              <p class="mt-3 text-lg font-medium text-white">Open profile</p>
            </a>
            <a [href]="data.contact?.githubUrl ?? '#'" target="_blank" rel="noopener noreferrer" class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-white/10">
              <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">GitHub</p>
              <p class="mt-3 text-lg font-medium text-white">Browse source</p>
            </a>
          </div>
        </app-section>
      }
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit {
  private readonly portfolioDataService = inject(PortfolioDataService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly portfolio = signal<PortfolioData | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadPortfolioData();
  }

  private async loadPortfolioData(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const data = await this.portfolioDataService.getPortfolioData();
      this.portfolio.set(data);
    } catch {
      this.errorMessage.set('Unable to load portfolio data from data file.');
    } finally {
      this.loading.set(false);
    }
  }

  protected formatPeriod(experience: Experience): string {
    const start = new Date(experience.startDate).getFullYear();
    const end = experience.isCurrent || !experience.endDate ? 'Present' : new Date(experience.endDate).getFullYear();
    return `${start} — ${end}`;
  }
}