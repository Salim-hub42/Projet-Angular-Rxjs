export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Equipment {
  id: number;
  name: string; // en minuscules : le pipe titlecase met les majuscules à l'affichage
  price: number; // en euros
  weight: number; // en kg
  discount: number; // la remise, entre 0 et 1 (0.15 = 15 %)
  rarity: Rarity;
  arrivalDate: string; // date ISO : année-mois-jour
  stats: Record<string, number>;
}
