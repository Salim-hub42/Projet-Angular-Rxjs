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

  private nextId = 4;

  protected advanceMission(id: number): void {
    this.missions.update((list) =>
      list.map((mission) => {
        if (mission.id !== id) {
          return mission;
        }
        if (mission.status !== 'in-progress') {
          return mission;
        }
        const progress = Math.min(mission.progress + 10, 100);
        const status = progress === 100 ? 'accomplished' : mission.status;
        return {
          ...mission,
          progress,
          status,
        };
      }),
    );
  }

  protected abandonMission(id: number): void {
    this.missions.update((list) =>
      list.map((mission) => {
        if (mission.id !== id) {
          return mission;
        }
        if (mission.status !== 'in-progress') {
          return mission;
        }

        return {
          ...mission,
          status: 'failed',
        };
      }),
    );
  }

  protected launchMission(event: SubmitEvent, input: HTMLInputElement): void {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) {
      return;
    }
    const mission: Mission = {
      id: this.nextId++,
      title,
      status: 'in-progress',
      progress: 0,
    };
    this.missions.update((list) => [...list, mission]);
    input.value = '';
  }

  protected archiveMission(id: number): void {
    this.missions.update((list) =>
      list.filter((mission) => mission.id !== id || mission.status === 'in-progress'),
    );
  }
}
