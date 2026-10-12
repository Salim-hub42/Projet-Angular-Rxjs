export type Category = 'Angular' | 'RxJS' | 'Pont' | 'Tests';

export interface HomeWidget {
  number: number;
  title: string;
  label: Category;
  // URL du widget ; absent pour le module 1, qui est la page d'accueil elle-même
  path?: string;
}
