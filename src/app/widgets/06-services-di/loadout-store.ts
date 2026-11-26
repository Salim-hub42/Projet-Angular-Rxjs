import { computed, Service, signal } from '@angular/core';
import { Gear } from './gear';
@Service()
export class LoadoutStore {
  private readonly items = signal<Gear[]>([]);

  readonly selectedItems = this.items.asReadonly();

  readonly itemCount = computed(() => this.items().length);
  readonly totalWeight = computed(() => {
    return this.items().reduce((sum, gear) => sum + gear.weight, 0);
  });
  readonly selectedIds = computed(() => {
    const ids = this.items().map((item) => item.id);
    return new Set(ids);
  });

  addItem(item: Gear): void {
    const isPresent = this.selectedIds().has(item.id);
    if (isPresent) {
      return;
    }
    this.items.update((currentItems) => [...currentItems, item]);
  }

  removeItem(id: number): void {
    this.items.update((currentItems) => currentItems.filter((gear) => gear.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }
}
