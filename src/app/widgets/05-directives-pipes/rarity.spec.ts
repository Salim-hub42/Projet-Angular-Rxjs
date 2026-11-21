import { TestBed } from '@angular/core/testing';
import { RarityGlow } from './rarity';

describe('RarityGlow', () => {
  it('should create an instance', () => {
    // input() doit être créé par Angular (dans un « contexte d'injection »).
    // runInInjectionContext exécute la fonction comme si Angular créait la directive
    const directive = TestBed.runInInjectionContext(() => new RarityGlow());
    expect(directive).toBeTruthy();
  });
});
