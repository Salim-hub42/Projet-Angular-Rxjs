import { Component, signal } from '@angular/core';
import { Book } from '../model';
import { ComponentEnfant } from '../component-enfant/component-enfant';

@Component({
  selector: 'app-component-test',
  imports: [ComponentEnfant],
  templateUrl: './component-test.html',
  styleUrl: './component-test.scss',
})
export class ComponentTest {
  // La SEULE vraie liste des livres : c'est le parent qui la possède
  protected readonly books = signal<Book[]>([
    { id: 1, title: 'Dune', borrowed: false },
    { id: 2, title: 'Fondation', borrowed: true },
    { id: 3, title: 'Hypérion', borrowed: false },
  ]);

  protected toggleBookLoan(id: number): void {
    this.books.update((list) =>
      list.map((book) => {
        if (book.id !== id) {
          return book;
        }

        return { ...book, borrowed: !book.borrowed };
      }),
    );
  }
}
