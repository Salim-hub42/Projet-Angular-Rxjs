import { booleanAttribute, Component, computed, input, output } from '@angular/core';
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

  readonly healSoldier = output<number>();
  readonly toggleDeploy = output<number>();
  readonly dismiss = output<number>();

  protected readonly deployLabel = computed(() =>
    this.soldier().deployed ? 'Rappeler' : 'Déployer',
  );

  protected readonly deploymentStatus = computed(() =>
    this.soldier().deployed ? 'En mission' : 'Camp de base',
  );

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

  protected requestHeal(): void {
    this.healSoldier.emit(this.soldier().id);
  }

  protected requestToggleDeploy(): void {
    this.toggleDeploy.emit(this.soldier().id);
  }

  protected requestDismiss(): void {
    this.dismiss.emit(this.soldier().id);
  }
}
