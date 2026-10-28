import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HudPanel } from './hud-panel';

describe('HudPanel', () => {
  let component: HudPanel;
  let fixture: ComponentFixture<HudPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HudPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(HudPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
