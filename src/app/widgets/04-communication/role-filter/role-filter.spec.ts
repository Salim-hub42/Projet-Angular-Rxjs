import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleFilter } from './role-filter';

describe('RoleFilter', () => {
  let component: RoleFilter;
  let fixture: ComponentFixture<RoleFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
