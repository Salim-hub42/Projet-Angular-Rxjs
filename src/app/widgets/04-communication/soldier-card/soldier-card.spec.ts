import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldierCard } from './soldier-card';

describe('SoldierCard', () => {
  let component: SoldierCard;
  let fixture: ComponentFixture<SoldierCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldierCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SoldierCard);
    fixture.componentRef.setInput('soldier', {
      id: 1,
      name: 'Capitain Rouge',
      role: 'assault',
      health: 90,
      deployed: true,
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
