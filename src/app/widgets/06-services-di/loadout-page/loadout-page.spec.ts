import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadoutPage } from './loadout-page';

describe('LoadoutPage', () => {
  let component: LoadoutPage;
  let fixture: ComponentFixture<LoadoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadoutPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadoutPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
