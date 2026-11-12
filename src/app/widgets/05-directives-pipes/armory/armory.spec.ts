import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Armory } from './armory';

describe('Armory', () => {
  let component: Armory;
  let fixture: ComponentFixture<Armory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Armory],
    }).compileComponents();

    fixture = TestBed.createComponent(Armory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
