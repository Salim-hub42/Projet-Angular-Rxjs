import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLab } from './home-lab';
import { provideRouter } from '@angular/router';

describe('HomeLab', () => {
  let component: HomeLab;
  let fixture: ComponentFixture<HomeLab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLab],
      // routerLink a besoin du routeur : on le fournit avec une table de routes vide
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeLab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
