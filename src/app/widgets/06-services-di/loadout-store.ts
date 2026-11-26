import { Service, signal } from '@angular/core';
import { Gear } from './gear';
@Service()
export class LoadoutStore {
  private readonly items = signal<Gear[]>([]);

  readonly selectedItems = this.items.asReadonly();

  addItem(item: Gear): void {
    const isPresent = this.items().some((gear) => gear.id === item.id);
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
