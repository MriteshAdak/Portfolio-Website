import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PortfolioData } from '../../interfaces/portfolio-data';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <main class="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section class="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-8">
        <div class="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Admin dashboard</p>
            <h1 class="mt-3 text-3xl font-semibold text-white">Portfolio management</h1>
            <p class="detail-text mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              This shell is connected to the server session endpoint and the public portfolio API. CRUD screens will be layered on top of it next.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a routerLink="/" class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
              View landing page
            </a>
            <button type="button" (click)="logout()" class="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20">
              Sign out
            </button>
          </div>
        </div>

        @if (loading()) {
          <p class="detail-text py-8 text-sm text-slate-300">Loading portfolio data...</p>
        } @else if (portfolio()) {
          <div class="mt-6 grid gap-4 lg:grid-cols-2">
            <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">User info</p>
              <h2 class="mt-3 text-2xl font-semibold text-white">{{ portfolio()?.profile?.fullName }}</h2>
              <p class="detail-text mt-3 text-sm leading-6 text-slate-300">{{ portfolio()?.profile?.summary }}</p>
            </article>

            <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">Contact</p>
              <div class="detail-text mt-3 space-y-2 text-sm text-slate-200">
                <p>{{ portfolio()?.contact?.email }}</p>
                <p>{{ portfolio()?.contact?.linkedinUrl }}</p>
                <p>{{ portfolio()?.contact?.githubUrl }}</p>
              </div>
            </article>

            <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">Projects</p>
              <div class="mt-4 space-y-3">
                @for (project of portfolio()?.projects ?? []; track project.id) {
                  <div class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p class="text-sm font-medium text-white">{{ project.name }}</p>
                    <p class="detail-text mt-1 text-sm text-slate-300">{{ project.description }}</p>
                  </div>
                }
              </div>
            </article>

            <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">Experiences</p>
              <div class="mt-4 space-y-3">
                @for (experience of portfolio()?.experiences ?? []; track experience.id) {
                  <div class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p class="text-sm font-medium text-white">{{ experience.role }} · {{ experience.company }}</p>
                    <p class="detail-text mt-1 text-sm text-slate-300">{{ experience.summary }}</p>
                  </div>
                }
              </div>
            </article>
          </div>
        } @else if (errorMessage()) {
          <p class="py-8 text-sm text-rose-200">{{ errorMessage() }}</p>
        }
      </section>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly portfolio = signal<PortfolioData | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadPortfolio();
  }

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => null);

    await this.router.navigateByUrl('/admin/login');
  }

  private async loadPortfolio(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await fetch('/api/public/portfolio', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load portfolio data');
      }

      this.portfolio.set((await response.json()) as PortfolioData);
    } catch {
      this.errorMessage.set('Unable to load portfolio data from the server.');
    } finally {
      this.loading.set(false);
    }
  }
}