import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'test-component',
    loadComponent: () =>
      import('./tests/component-test/component-test').then((m) => m.ComponentTest),
  },
  {
    path: '04-communication',
    loadComponent: () =>
      import('./widgets/04-communication/squad-roster/squad-roster').then((m) => m.SquadRoster),
  },
  {
    path: '03-signals',
    loadComponent: () =>
      import('./widgets/03-signals/supply-depot/supply-depot').then((m) => m.SupplyDepot),
  },
  {
    path: '02-composants-templates',
    loadComponent: () =>
      import('./widgets/02-composants-templates/mission-board/mission-board').then(
        (m) => m.MissionBoard,
      ),
  },
  {
    path: '',
    loadComponent: () => import('./home/home-lab/home-lab').then((m) => m.HomeLab),
  },
];
