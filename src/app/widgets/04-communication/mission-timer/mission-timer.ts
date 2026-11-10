import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';

const TICK_INTERVAL_MS = 1000;

@Component({
  selector: 'app-mission-timer',
  imports: [],
  templateUrl: './mission-timer.html',
  styleUrl: './mission-timer.scss',
})
export class MissionTimer implements OnInit {
  readonly soldierName = input.required<string>();

  protected readonly elapsedSeconds = signal(0);
  private readonly destroyRef = inject(DestroyRef);

  // DestroyRef plutôt que ngOnDestroy : le démarrage du minuteur et son arrêt sont écrits
  // côte à côte, impossible d'oublier l'un en modifiant l'autre
  constructor() {
    const timerId = setInterval(
      () => this.elapsedSeconds.update((seconds) => seconds + 1),
      TICK_INTERVAL_MS,
    );
    // Cette fonction n'est exécutée qu'à la destruction : l'input a alors sa valeur
    this.destroyRef.onDestroy(() => {
      clearInterval(timerId);
      console.log(`Chrono arrêté pour ${this.soldierName()}`);
    });
  }

  // Pas dans le constructeur : l'input n'y a pas encore de valeur (NG0950)
  ngOnInit(): void {
    console.log(`Chrono démarré pour ${this.soldierName()}`);
  }
}
