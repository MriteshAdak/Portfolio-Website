import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardComponent } from '../card/card';
import { Project } from '../../interfaces/project';

@Component({
  selector: 'app-carousel',
  imports: [CardComponent],
  template: `
    <div class="overflow-x-auto pb-2">
      <div class="flex snap-x snap-mandatory gap-4">
        @for (project of projects(); track project.id) {
          <div class="min-w-[86%] snap-start sm:min-w-[60%] lg:min-w-[31%]">
            <app-card [project]="project" />
          </div>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent {
  projects = input.required<Project[]>();
}
