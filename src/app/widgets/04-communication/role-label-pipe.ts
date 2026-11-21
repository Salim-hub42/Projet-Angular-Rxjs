import { Pipe, PipeTransform } from '@angular/core';
import { Role } from './soldier';

const ROLE_LABELS: Record<Role, string> = {
  assault: 'Combattant',
  engineer: 'Ingénieur',
  medic: 'Médecin',
  sniper: 'Sniper',
};

export function toRoleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

@Pipe({
  name: 'roleLabel',
})
export class RoleLabelPipe implements PipeTransform {
  transform(role: Role): string {
    return toRoleLabel(role);
  }
}
