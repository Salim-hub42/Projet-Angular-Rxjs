export type Role = 'assault' | 'medic' | 'sniper' | 'engineer';
export interface Soldier {
  id: number;
  name: string;
  role: Role;
  health: number;
  deployed: boolean;
}
