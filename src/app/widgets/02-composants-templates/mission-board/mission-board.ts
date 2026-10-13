import { NgOptimizedImage } from '@angular/common';
import { Component, signal } from '@angular/core';

export type MissionStatus = 'in-progress' | 'accomplished' | 'failed';

export interface Mission {
  id: number;
  title: string;
  status: MissionStatus;
  progress: number;
}

@Component({
  selector: 'app-mission-board',
  imports: [NgOptimizedImage],
  templateUrl: './mission-board.html',
  styleUrl: './mission-board.scss',
})
export class MissionBoard {
  protected readonly missions = signal<Mission[]>([
    {
      id: 1,
      title: "La conquête de l'espace",
      status: 'in-progress',
      progress: 60,
    },
    {
      id: 2,
      title: 'Sécuriser la planète',
      status: 'accomplished',
      progress: 100,
    },
    {
      id: 3,
      title: 'Trouver des ressources',
      status: 'failed',
      progress: 25,
    },
  ]);
}
