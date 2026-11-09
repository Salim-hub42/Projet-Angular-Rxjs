import { Component, model } from '@angular/core';

const VOLUME_MIN = 0;
const VOLUME_MAX = 100;
const VOLUME_STEP = 10;

@Component({
  imports: [],
  selector: 'app-volume-control',
  styleUrl: './volume-control.scss',
  templateUrl: './volume-control.html',
})
export class VolumeControl {
  readonly volume = model(50);

  // Les constantes ne sont pas visibles dans le template : on les expose en propriétés
  protected readonly minVolume = VOLUME_MIN;
  protected readonly maxVolume = VOLUME_MAX;

  protected increaseVolume(): void {
    this.volume.update((vol) => Math.min(vol + VOLUME_STEP, VOLUME_MAX));
  }

  protected decreaseVolume(): void {
    this.volume.update((vol) => Math.max(vol - VOLUME_STEP, VOLUME_MIN));
  }

  protected mute(): void {
    this.volume.set(VOLUME_MIN);
  }
}
