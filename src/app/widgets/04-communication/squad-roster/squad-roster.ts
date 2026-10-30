import { NgOptimizedImage } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Soldier } from '../soldier';
import { SoldierCard } from '../soldier-card/soldier-card';

const HEAL_AMOUNT = 20;
const MAX_HEALTH = 100;
@Component({
  selector: 'app-squad-roster',
  imports: [NgOptimizedImage, SoldierCard],
  templateUrl: './squad-roster.html',
  styleUrl: './squad-roster.scss',
})
export class SquadRoster {
  protected readonly compactView = signal(false);

  protected readonly soldiers = signal<Soldier[]>([
    { id: 1, name: 'Capitain Rouge', role: 'assault', health: 90, deployed: true },
    { id: 2, name: 'Sergent Bleu', role: 'medic', health: 65, deployed: false },
    { id: 3, name: 'Soldat Tomy', role: 'sniper', health: 75, deployed: false },
    { id: 4, name: 'Soldat Salim', role: 'engineer', health: 98, deployed: true },
    { id: 5, name: 'Soldat Sin', role: 'sniper', health: 22, deployed: true },
  ]);

  protected toggleCompactView(): void {
    this.compactView.update((isCompact) => !isCompact);
  }

  protected careSoldier(id: number): void {
    this.soldiers.update((list) =>
      list.map((soldier) => {
        if (soldier.id !== id) {
          return soldier;
        }
        return { ...soldier, health: Math.min(soldier.health + HEAL_AMOUNT, MAX_HEALTH) };
      }),
    );
  }

  protected toggleDeployment(id: number): void {
    this.soldiers.update((list) =>
      list.map((soldier) => {
        if (soldier.id !== id) {
          return soldier;
        }
        return { ...soldier, deployed: !soldier.deployed };
      }),
    );
  }

  protected dismissSoldier(id: number): void {
    this.soldiers.update((list) => list.filter((soldier) => soldier.id !== id));
  }
}
