import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tags',
  imports: [],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (tag of tags(); track tag) {
        <span class="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
          {{ tag }}
        </span>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsComponent {
  readonly tags = input.required<readonly string[]>();
}
