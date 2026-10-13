import { Routes } from '@angular/router';

export const routes: Routes = [
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
