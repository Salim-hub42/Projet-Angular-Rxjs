import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HomeWidget } from '../../models/model-widgets';

@Component({
  selector: 'app-home-lab',
  imports: [NgOptimizedImage],
  templateUrl: './home-lab.html',
  styleUrl: './home-lab.scss',
})
export class HomeLab {
  protected readonly widgets: HomeWidget[] = [
    { number: 1, title: 'Architecture et outillage', label: 'Angular' },
  ];
}
