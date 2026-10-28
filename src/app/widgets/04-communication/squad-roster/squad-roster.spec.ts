import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadRoster } from './squad-roster';

describe('SquadRoster', () => {
  let component: SquadRoster;
  let fixture: ComponentFixture<SquadRoster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SquadRoster],
    }).compileComponents();

    fixture = TestBed.createComponent(SquadRoster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
