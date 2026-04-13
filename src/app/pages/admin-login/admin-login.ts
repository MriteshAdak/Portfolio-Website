import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-6">
      <section class="w-full rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-8">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Admin access</p>
        <h1 class="mt-3 text-3xl font-semibold text-white">Sign in</h1>
        <p class="mt-3 text-sm leading-6 text-slate-300">
          Use the server-validated credentials for the temporary V1 admin flow.
        </p>

        <form class="mt-8 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-200">Admin id</span>
            <input
              type="text"
              formControlName="id"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/10"
              placeholder="admin"
            />
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              formControlName="password"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/10"
              placeholder="••••••••"
            />
          </label>

          @if (errorMessage()) {
            <p class="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {{ errorMessage() }}
            </p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="inline-flex w-full items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <a routerLink="/" class="mt-6 inline-flex text-sm text-slate-300 transition hover:text-white">
          Back to landing page
        </a>
      </section>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.formBuilder.group({
    id: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.form.getRawValue()),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        this.errorMessage.set(payload?.message ?? 'Unable to sign in. Check your credentials and try again.');
        return;
      }

      await this.router.navigateByUrl('/admin');
    } catch {
      this.errorMessage.set('Unable to reach the authentication endpoint.');
    } finally {
      this.loading.set(false);
    }
  }
}