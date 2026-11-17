import { Pipe, PipeTransform } from '@angular/core';
import { Rarity } from './equipment';

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export function toRarityLabel(rarity: Rarity): string {
  return RARITY_LABELS[rarity];
}

@Pipe({
  name: 'rarityLabel',
})
export class RarityLabelPipe implements PipeTransform {
  transform(rarity: Rarity): string {
    return toRarityLabel(rarity);
  }
}
