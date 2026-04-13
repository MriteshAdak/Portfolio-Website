import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <header class="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Portfolio</p>
        <h1 class="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          {{ heading() }}
        </h1>
      </div>

      <a
        href="#contact"
        class="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
      >
        Contact
      </a>
    </header>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly heading = input.required<string>();
}
