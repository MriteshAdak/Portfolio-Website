import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Project } from '../../interfaces/project';
import { TagsComponent } from '../tags/tags';

@Component({
  selector: 'app-card',
  imports: [TagsComponent],
  template: `
    <article class="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/30 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-950/20">
      @if (project().imageUrl) {
        <img [src]="project().imageUrl ?? ''" [alt]="project().name" class="h-44 w-full object-cover" />
      }
      <div class="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs uppercase tracking-[0.3em] text-cyan-300">Project {{ project().displayOrder + 1 }}</p>
          <span class="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{{ project().tag }}</span>
        </div>

        <div class="space-y-3">
          <h3 class="text-xl font-semibold text-white">{{ project().name }}</h3>
          <p class="detail-text text-sm leading-6 text-slate-300">{{ project().description }}</p>
        </div>

        <div class="mt-auto flex items-center justify-between gap-4">
          <app-tags [tags]="[project().tag]" />
          <a
            [href]="project().projectUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
          >
            View project
          </a>
        </div>
      </div>
    </article>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  project = input.required<Project>();
}
