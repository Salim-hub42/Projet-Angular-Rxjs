import { NgOptimizedImage } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

interface Supply {
  id: number;
  name: string;
  quantity: number;
  unitWeight: number;
}

@Component({
  selector: 'app-supply-depot',
  imports: [NgOptimizedImage],
  templateUrl: './supply-depot.html',
  styleUrl: './supply-depot.scss',
})
export class SupplyDepot {
  protected readonly supplies = signal<Supply[]>([
    { id: 1, name: 'Rations', quantity: 100, unitWeight: 3 },
    { id: 2, name: 'Munitions', quantity: 150, unitWeight: 2.5 },
    { id: 3, name: "Cellules d'énergie", quantity: 10, unitWeight: 1.5 },
    { id: 4, name: 'Médikits', quantity: 25, unitWeight: 3 },
  ]);

  protected readonly truckCapacity = signal(800);

  // Total weight of all supplies in the truck
  protected readonly totalWeight = computed(() =>
    this.supplies().reduce((acc, supply) => acc + supply.quantity * supply.unitWeight, 0),
  );

  // Percentage of truck capacity used
  protected readonly loadPercent = computed(() =>
    Math.round((this.totalWeight() / this.truckCapacity()) * 100),
  );

  // Check if the truck is overloaded
  protected readonly isOverloaded = computed(() => this.totalWeight() > this.truckCapacity());

  // Check if the truck can depart (not overloaded and has supplies)
  protected readonly canDepart = computed(
    () => !this.isOverloaded() && this.supplies().some((supply) => supply.quantity > 0),
  );

  protected readonly supplyLines = computed(() =>
    this.supplies().map((supply) => ({
      ...supply,
      totalWeight: supply.quantity * supply.unitWeight,
    })),
  );

  protected addUnit(id: number): void {
    this.supplies.update((list) => {
      return list.map((supply) => {
        if (supply.id !== id) {
          return supply;
        }
        return {
          ...supply,
          quantity: supply.quantity + 1,
        };
      });
    });
  }

  protected removeUnit(id: number): void {
    this.supplies.update((list) => {
      return list.map((supply) => {
        if (supply.id !== id) {
          return supply;
        }
        return {
          ...supply,
          quantity: Math.max(supply.quantity - 1, 0),
        };
      });
    });
  }

  protected emptyTruck(): void {
    this.supplies.update((list) => {
      return list.map((supply) => ({
        ...supply,
        quantity: 0,
      }));
    });
  }

  protected depart(): void {
    console.log('Le camion peut partir !');
  }
}
