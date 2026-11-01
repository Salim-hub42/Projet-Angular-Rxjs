import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpeedControl } from './speed-control';

describe('SpeedControl', () => {
  let component: SpeedControl;
  let fixture: ComponentFixture<SpeedControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeedControl],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeedControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
