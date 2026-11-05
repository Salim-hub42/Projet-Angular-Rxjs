import { booleanAttribute, Component, computed, input } from '@angular/core';
import { Track } from '../model';

@Component({
  imports: [],
  selector: 'app-track-card',
  styleUrl: './track-card.scss',
  templateUrl: './track-card.html',
})
export class TrackCard {
  readonly track = input.required<Track>();
  readonly rank = input.required({ transform: (value: number) => value + 1 });
  readonly isCurrent = input(false, { transform: booleanAttribute, alias: 'current' });

  protected readonly formattedDuration = computed(() => {
    const duration = this.track().duration;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });
}
