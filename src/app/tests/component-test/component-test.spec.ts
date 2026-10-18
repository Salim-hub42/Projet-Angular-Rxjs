import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentTest } from './component-test';

describe('ComponentTest', () => {
  let component: ComponentTest;
  let fixture: ComponentFixture<ComponentTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentTest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
