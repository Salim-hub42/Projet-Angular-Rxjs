import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentTestParent } from './component-test-parent';

describe('ComponentTest', () => {
  let component: ComponentTestParent;
  let fixture: ComponentFixture<ComponentTestParent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTestParent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentTestParent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
