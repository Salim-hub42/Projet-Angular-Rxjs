import { Directive, input, signal } from '@angular/core';
import { Rarity } from './equipment';

@Directive({
  selector: '[appRarity]',
  host: {
    class: 'rarity',
    '[class.rarity--rare]': "appRarity() === 'rare'",
    '[class.rarity--epic]': "appRarity() === 'epic'",
    '[class.rarity--legendary]': "appRarity() === 'legendary'",
    '[class.rarity--highlighted]': 'highlighted()',
    '(mouseenter)': 'highlight()',
    '(mouseleave)': 'unhighlight()',
    '(focusin)': 'highlight()',
    '(focusout)': 'unhighlight()',
  },
})
export class RarityGlow {
  readonly appRarity = input.required<Rarity>();
  protected readonly highlighted = signal(false);

  protected highlight(): void {
    this.highlighted.set(true);
  }

  protected unhighlight(): void {
    this.highlighted.set(false);
  }
}
