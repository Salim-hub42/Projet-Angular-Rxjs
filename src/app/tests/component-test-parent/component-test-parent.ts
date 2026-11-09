import { Component, computed, signal } from '@angular/core';
import { Track } from '../model';
import { TrackCard } from '../track-card/track-card';
import { VolumeControl } from '../volume-control/volume-control';

const MAX_VOLUME = 100;

@Component({
  selector: 'app-component-test-parent',
  imports: [TrackCard, VolumeControl],
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

  protected readonly volume = signal(50);

  protected readonly currentTrack = computed(() => {
    const current = this.tracks().find((track) => track.id === this.currentTrackId());
    return current;
  });

  protected readonly likedCount = computed(() => {
    const likedTracks = this.tracks().filter((track) => track.liked);
    return likedTracks.length;
  });

  protected readonly totalDuration = computed(() => {
    const totalSeconds = this.tracks().reduce((total, track) => total + track.duration, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  protected playTrack(id: number): void {
    this.currentTrackId.set(id);
  }

  protected removeTrack(id: number): void {
    this.tracks.update((list) => list.filter((track) => track.id !== id));
    if (id === this.currentTrackId()) {
      this.currentTrackId.set(null);
    }
  }

  protected inverseLike(id: number): void {
    this.tracks.update((list) =>
      list.map((track) => (track.id === id ? { ...track, liked: !track.liked } : track)),
    );
  }

  protected setMaxVolume(): void {
    this.volume.set(MAX_VOLUME);
  }
}
