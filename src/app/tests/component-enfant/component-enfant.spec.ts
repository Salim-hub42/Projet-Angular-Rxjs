import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentEnfant } from './component-enfant';

describe('ComponentEnfant', () => {
  let component: ComponentEnfant;
  let fixture: ComponentFixture<ComponentEnfant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentEnfant],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentEnfant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
