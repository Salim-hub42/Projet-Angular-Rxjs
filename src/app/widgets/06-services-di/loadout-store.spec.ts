import { TestBed } from '@angular/core/testing';
import { LoadoutStore } from './loadout-store';

describe('LoadoutStore', () => {
  let service: LoadoutStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadoutStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
