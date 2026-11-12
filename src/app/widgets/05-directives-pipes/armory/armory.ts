import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Equipment } from '../equipment';

@Component({
  imports: [DatePipe, CurrencyPipe],
  selector: 'app-armory',
  styleUrl: './armory.scss',
  templateUrl: './armory.html',
})
export class Armory {
  protected readonly equipment = signal<Equipment[]>([
    {
      id: 1,
      name: 'fusil plasma',
      price: 1249.99,
      weight: 4.25,
      discount: 0.15,
      rarity: 'common',
      arrivalDate: '2026-12-05',
      stats: { dégâts: 80, portée: 60, cadence: 45 },
    },
    {
      id: 2,
      name: 'grenade ionique',
      price: 80,
      weight: 0.6,
      discount: 0,
      rarity: 'common',
      arrivalDate: '2026-11-04',
      stats: { dégâts: 120, rayon: 35 },
    },
    {
      id: 3,
      name: 'fusil de précision à lunette thermique',
      price: 3499.5,
      weight: 9.85,
      discount: 0.1,
      rarity: 'rare',
      arrivalDate: '2026-10-03',
      stats: { dégâts: 200, portée: 95, cadence: 10 },
    },
    {
      id: 4,
      name: 'jet pack',
      price: 5200,
      weight: 15.4,
      discount: 0.25,
      rarity: 'epic',
      arrivalDate: '2026-09-02',
      stats: { saut: 50, vitesse: 70, autonomie: 30 },
    },
    {
      id: 5,
      name: 'bouclier énergétique',
      price: 12000,
      weight: 1.8,
      discount: 0.05,
      rarity: 'legendary',
      arrivalDate: '2026-08-01',
      stats: { protection: 100, mobilité: 85 },
    },
  ]);
}
