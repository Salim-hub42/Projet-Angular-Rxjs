import { booleanAttribute, Component, computed, input } from '@angular/core';
import { Soldier } from '../soldier';

const CRITICAL_HEALTH = 30;
const WOUNDED_HEALTH = 70;
@Component({
  selector: 'app-soldier-card',
  imports: [],
  templateUrl: './soldier-card.html',
  styleUrl: './soldier-card.scss',
})
export class SoldierCard {
  readonly soldier = input.required<Soldier>();

  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly healthStatus = computed(() => {
    const health = this.soldier().health;
    if (health < CRITICAL_HEALTH) {
      return 'Critique';
    }
    if (health < WOUNDED_HEALTH) {
      return 'Blessé';
    }
    return 'Opérationnel';
  });
}
