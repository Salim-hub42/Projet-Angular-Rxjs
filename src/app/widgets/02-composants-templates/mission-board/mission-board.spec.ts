import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionBoard } from './mission-board';

describe('MissionBoard', () => {
  let component: MissionBoard;
  let fixture: ComponentFixture<MissionBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(MissionBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
