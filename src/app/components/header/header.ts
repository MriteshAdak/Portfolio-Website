import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <header>
      <h1>{{ heading() }}</h1>
    </header>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly heading = input.required<string>();
}
