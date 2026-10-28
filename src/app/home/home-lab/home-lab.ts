import { Component } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeWidget } from '../../models/model-widgets';

@Component({
  selector: 'app-home-lab',
  imports: [NgOptimizedImage, RouterLink, DecimalPipe],
  templateUrl: './home-lab.html',
  styleUrl: './home-lab.scss',
})
export class HomeLab {
  protected readonly widgets: HomeWidget[] = [
    { number: 1, title: 'Architecture et outillage', label: 'Angular' },
    {
      number: 2,
      title: 'Composants et templates',
      label: 'Angular',
      path: '/02-composants-templates',
    },
    {
      number: 3,
      title: 'Signals',
      label: 'Angular',
      path: '/03-signals',
    },
    {
      number: 4,
      title: 'Communication entre composants',
      label: 'Angular',
      path: '/04-communication',
    },
  ];
}
