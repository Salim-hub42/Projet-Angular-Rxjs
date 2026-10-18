import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplyDepot } from './supply-depot';

describe('SupplyDepot', () => {
  let component: SupplyDepot;
  let fixture: ComponentFixture<SupplyDepot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplyDepot],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplyDepot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
