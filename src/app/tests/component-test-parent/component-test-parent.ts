import { Component, signal } from '@angular/core';
import { Track } from '../model';
import { TrackCard } from '../track-card/track-card';

@Component({
  selector: 'app-component-test-parent',
  imports: [TrackCard],
  templateUrl: './component-test-parent.html',
  styleUrl: './component-test-parent.scss',
})
export class ComponentTestParent {
  protected readonly tracks = signal<Track[]>([
    {
      id: 1,
      title: 'Rhythm  of the Night',
      artist: 'Mattafix',
      duration: 185,
      liked: true,
    },
    {
      id: 2,
      title: 'Forgot About Dre',
      artist: 'Dr Dre',
      duration: 240,
      liked: false,
    },
    {
      id: 3,
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      duration: 300,
      liked: false,
    },
    {
      id: 4,
      title: 'Bad Guy',
      artist: 'Billie Eilish',
      duration: 220,
      liked: true,
    },
    {
      id: 5,
      title: 'Shake It Off',
      artist: 'Taylor Swift',
      duration: 260,
      liked: false,
    },
  ]);

  protected readonly currentTrackId = signal<number | null>(null);

  protected playTrack(id: number): void {
    this.currentTrackId.set(id);
  }

  protected removeTrack(id: number): void {
    this.tracks.update((list) => list.filter((track) => track.id !== id));
  }
}
