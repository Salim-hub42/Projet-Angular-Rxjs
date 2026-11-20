import { Directive, input } from '@angular/core';
import { Rarity } from './equipment';

@Directive({
  selector: '[appRarity]',
})
export class RarityGlow {
  readonly appRarity = input.required<Rarity>();
}
