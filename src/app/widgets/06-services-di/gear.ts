export interface Gear {
  id: number;
  name: string;
  weight: number;
}

export const GEAR_CATALOG: Gear[] = [
  { id: 1, name: 'Trousse de soins', weight: 1.2 },
  { id: 2, name: 'Radio longue portée', weight: 6 },
  { id: 3, name: 'Casque de protection', weight: 2.9 },
  { id: 4, name: 'Bouclier de protection', weight: 1.5 },
  { id: 5, name: 'Boussole', weight: 0.6 },
  { id: 6, name: 'Lampe de poche', weight: 1.8 },
];
