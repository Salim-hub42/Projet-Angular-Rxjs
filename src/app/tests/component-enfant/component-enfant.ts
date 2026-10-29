import { Component, computed, input, output } from '@angular/core';
import { Book } from '../model';

@Component({
  selector: 'app-component-enfant',
  imports: [],
  templateUrl: './component-enfant.html',
  styleUrl: './component-enfant.scss',
})
export class ComponentEnfant {
  readonly book = input.required<Book>();

  readonly toggleLoan = output<number>();

  // Le texte du button dépend de l'état (computed) .
  protected readonly buttonLabel = computed(() => (this.book().borrowed ? 'Rendre' : 'Emprunter'));

  protected readonly statusLabel = computed(() =>
    this.book().borrowed ? 'Emprunté' : 'Disponible',
  );

  protected requestToggle(): void {
    this.toggleLoan.emit(this.book().id);
    console.log("L'id est envoyer !");
  }
}
