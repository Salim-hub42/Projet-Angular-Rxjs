import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'testComponent',
    loadComponent: () =>
      import('./tests/component-test/component-test').then((m) => m.ComponentTest),
  },
  {
    path: '03-signals',
    loadComponent: () =>
      import('./widgets/03-components-template/supply-depot/supply-depot').then(
        (m) => m.SupplyDepot,
      ),
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
