import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionTimer } from './mission-timer';

describe('MissionTimer', () => {
  let component: MissionTimer;
  let fixture: ComponentFixture<MissionTimer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionTimer],
    }).compileComponents();

    fixture = TestBed.createComponent(MissionTimer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
