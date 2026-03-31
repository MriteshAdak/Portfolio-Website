import { Component, input } from '@angular/core';
import { Project } from '../../interfaces/project';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <div class="card">
      @if (project().imageUrl) {
        <img [src]="project().imageUrl" [alt]="project().name" />
      }
      <div class="content">
        <h3>{{ project().name }}</h3>
        <span class="tag">{{ project().tag }}</span>
        <p>{{ project().description }}</p>
        <a [href]="project().projectUrl" target="_blank" rel="noopener">View Project</a>
      </div>
    </div>
  `,
  styles: ``,
})
export class Card {
  project = input.required<Project>();
}
