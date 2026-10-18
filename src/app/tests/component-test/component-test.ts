import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-component-test',
  imports: [],
  templateUrl: './component-test.html',
  styleUrl: './component-test.scss',
})
export class ComponentTest {
  protected readonly ammo = signal(30);

  constructor() {
    setTimeout(() => {
      this.ammo.set(0);
    }, 3000);
  }
}
