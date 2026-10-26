import { NgOptimizedImage } from '@angular/common';
import { Component, computed, effect, linkedSignal, signal } from '@angular/core';

const STORAGE_KEY = 'supply-depot';
interface Supply {
  id: number;
  name: string;
  quantity: number;
  unitWeight: number;
}

const DEFAULT_SUPPLIES: Supply[] = [
  { id: 1, name: 'Rations', quantity: 100, unitWeight: 3 },
  { id: 2, name: 'Munitions', quantity: 150, unitWeight: 2.5 },
  { id: 3, name: "Cellules d'énergie", quantity: 10, unitWeight: 1.5 },
  { id: 4, name: 'Médikits', quantity: 25, unitWeight: 3 },
];

interface Vehicle {
  id: number;
  name: string;
  capacity: number;
}

const VEHICLES: Vehicle[] = [
  { id: 1, name: 'Camion gbc', capacity: 800 },
  { id: 2, name: 'Camion ppld', capacity: 1000 },
  { id: 3, name: 'Transporteur blindé griffon', capacity: 1200 },
];

// Step used by the buttons that change the allowed load, and the lowest allowed load
// (never 0: loadPercent would divide by zero)
const LOAD_STEP = 50;
const MIN_LOAD = 50;

@Component({
  selector: 'app-supply-depot',
  imports: [NgOptimizedImage],
  templateUrl: './supply-depot.html',
  styleUrl: './supply-depot.scss',
})
export class SupplyDepot {
  protected readonly supplies = signal<Supply[]>(this.readSupplies());

  protected readonly selectedVehicle = signal<Vehicle>(VEHICLES[0]);

  protected readonly truckCapacity = linkedSignal<number>(() => this.selectedVehicle().capacity);

  protected readonly vehicles = VEHICLES;

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

  // Check if the allowed load can still go up (it never exceeds the vehicle's capacity)
  protected readonly canIncreaseCapacity = computed(
    () => this.truckCapacity() < this.selectedVehicle().capacity,
  );

  // Check if the allowed load can still go down (it never goes below MIN_LOAD)
  protected readonly canDecreaseCapacity = computed(() => this.truckCapacity() > MIN_LOAD);

  // List of supplies with their total weight
  protected readonly supplyLines = computed(() =>
    this.supplies().map((supply) => ({
      ...supply,
      totalWeight: supply.quantity * supply.unitWeight,
    })),
  );

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.supplies()));
    });
  }

  // Read the list of supplies from local storage or use default supplies if not found
  protected readSupplies(): Supply[] {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(DEFAULT_SUPPLIES),
      ) as Supply[];
    } catch {
      return DEFAULT_SUPPLIES;
    }
  }

  // Add a unit of supply to the truck
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

  // Remove a unit of supply from the truck
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

  // Increase the allowed load by LOAD_STEP kg, up to the selected vehicle's capacity
  protected addCapacity(): void {
    this.truckCapacity.update((cap) => Math.min(cap + LOAD_STEP, this.selectedVehicle().capacity));
  }

  // Decrease the allowed load by LOAD_STEP kg, down to MIN_LOAD kg
  protected removeCapacity(): void {
    this.truckCapacity.update((cap) => Math.max(cap - LOAD_STEP, MIN_LOAD));
  }

  // Empty the truck by setting all supply quantities to zero
  protected emptyTruck(): void {
    this.supplies.update((list) => {
      return list.map((supply) => ({
        ...supply,
        quantity: 0,
      }));
    });
  }

  protected selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
  }

  protected depart(): void {
    console.log('Le camion peut partir !');
  }
}
