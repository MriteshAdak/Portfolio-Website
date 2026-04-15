import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section',
  imports: [],
  template: `
    <section [id]="id()" class="scroll-mt-8 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            {{ eyebrow() }}
          </p>
          <h2 class="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {{ title() }}
          </h2>
          @if (description()) {
            <p class="detail-text mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              {{ description() }}
            </p>
          }
        </div>

        @if (actionLabel()) {
          <a
            [href]="actionHref()"
            class="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            {{ actionLabel() }}
          </a>
        }
      </div>

      <ng-content></ng-content>
    </section>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionComponent {
  readonly id = input.required<string>();
  readonly eyebrow = input('Overview');
  readonly title = input<String>('');
  readonly description = input('');
  readonly actionLabel = input('');
  readonly actionHref = input('#');
}
