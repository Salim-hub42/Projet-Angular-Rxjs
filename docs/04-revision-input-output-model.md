# Module 4 — Révision : `input`, `output`, `model`

> Exercice de révision des sections 3, 4 et 5 de la leçon, à faire dans `src/app/tests/`, avant l'étape 6 du Registre de l'escouade.
> ⚠️ Pas de solution ici : demande-moi un indice si tu bloques.

**Thème** : un lecteur de musique. Le parent possède une playlist ; chaque morceau s'affiche sur une carte ; un réglage de volume et un réglage de vitesse de lecture complètent le lecteur.

```
Parent (le lecteur : possède la playlist)
├── VolumeControl     model()              : le volume, modifiable dans les deux sens
├── SpeedControl      input + output        : la vitesse, écrite « à la main »
└── TrackCard × n     input / output        : une carte par morceau
```

**Où coder** :
- le parent : ton `component-test-parent` existant (la route `test-component` y mène déjà) ;
- les enfants : génère-les avec la CLI dans `src/app/tests/` (`track-card`, `volume-control`, `speed-control`) ;
- le modèle : dans `src/app/tests/model.ts`.

Durée indicative : 2 h.

---

## Partie A — `input()` : le parent donne, l'enfant affiche

### A1. Le modèle et la playlist

- Dans `model.ts`, une interface `Track` **exportée** : `id`, `title`, `artist`, `duration` (en secondes, un nombre) et `liked` (booléen).
- Dans le parent, un signal `tracks` avec 5 morceaux de départ, de durées différentes, dont au moins un déjà aimé.

### A2. La carte : un input requis et un `computed`

- `TrackCard` a un input **requis** `track`.
- Elle affiche le titre, l'artiste et la durée.
- La durée ne s'affiche **pas** en secondes : un `computed` **dans la carte**, `formattedDuration`, transforme `205` en `"3:25"` (et `62` en `"1:02"`, attention au zéro).
- Dans le parent, un `@for` affiche une carte par morceau.

> Question : pourquoi peut-on écrire un `computed` à partir d'un input ?

### A3. Un input avec `transform`

- `TrackCard` reçoit un input `rank` : le parent lui passe le `$index` du `@for` (qui commence à 0).
- La carte doit afficher `#1`, `#2`… : utilise un **`transform`** sur l'input pour ajouter 1 à la valeur reçue. La carte ne fait **aucun** calcul dans son template.

### A4. Un input booléen avec `alias`

- Dans la classe de la carte, l'input s'appelle `isCurrent` (« est-ce le morceau en cours de lecture ? »), faux par défaut, avec `booleanAttribute`.
- **Vu de l'extérieur**, le parent doit écrire `current`, pas `isCurrent` : utilise un **`alias`**.
- Quand il est vrai, la carte a une classe CSS `current` (bordure ou fond différent).
- Pour l'instant, le parent le met à vrai sur le premier morceau seulement. À la partie B, ce sera le morceau en cours de lecture.

### A5. Deux expériences (puis tu effaces)

Fais-les vraiment, observe, et note dans un commentaire ce qui s'est passé :

1. Dans une méthode de la carte, essaie de faire `this.track.set(...)`. Que dit TypeScript ? Pourquoi est-ce une bonne chose ?
2. Dans le constructeur de la carte, fais un `console.log(this.track())`. Que se passe-t-il dans la console du navigateur ? Quel code d'erreur ? Pourquoi ?

---

## Partie B — `output()` : l'enfant prévient, le parent décide

### B1. Trois actions sur la carte

- Trois boutons sur chaque carte :
  - « Lire » ;
  - « J'aime » / « Je n'aime plus » (le texte dépend de `liked`) ;
  - « Retirer ».
- Chacun **émet un output** avec l'id du morceau. **La carte ne modifie jamais le morceau elle-même.**
- Nomme bien tes outputs (relis « Bien nommer un output », section 4) et tes méthodes (des verbes).

### B2. Le parent réagit

- « J'aime » inverse `liked` sur le bon morceau.
- « Retirer » enlève le morceau de la playlist.
- « Lire » range l'id dans un signal `currentTrackId` du parent (aucun morceau en cours au départ : quelle valeur et quel type ?).
- L'input `current` de A4 est maintenant vrai **seulement** pour le morceau en cours.

> Réfléchis à `map`, `filter`, `set` ou `update` pour chaque action.

### B3. Des `computed` dans le parent

- `currentTrack` : le morceau en cours (ou rien), affiché au-dessus de la liste : « En lecture : *titre* — *artiste* », ou « Aucune lecture » sinon.
- `likedCount` : « 2 morceaux aimés ».
- `totalDuration` : la durée totale de la playlist, en minutes.

Vérifie : retire le morceau en cours de lecture. Que devient « En lecture » ? Est-ce le comportement que tu veux ?

---

## Partie C — `model()` et `[( )]` : une valeur partagée dans les deux sens

### C1. `VolumeControl` avec un `model`

- Un `model` `volume`, à 50 par défaut.
- Trois boutons : « − 10 », « + 10 » et « Muet » (remet à 0).
- Le volume reste toujours entre 0 et 100 : pas de nombres magiques, des constantes.
- Le composant affiche une barre de volume avec ses attributs ARIA (tu l'as déjà fait pour la santé).
- Dans le parent : un signal `volume`, relié avec `[( )]`, et l'affichage « Volume : 50 % ».

### C2. La preuve des deux sens

- Ajoute dans le **parent** un bouton « Volume max », qui met le signal `volume` du parent à 100.
- Vérifie que la barre **dans l'enfant** se met à jour.
- Clique ensuite « − 10 » dans l'enfant : l'affichage du **parent** doit suivre.

### C3. `SpeedControl` sans `model` : la version longue

Cette fois, interdiction d'utiliser `model` : tu écris le binding dans les deux sens **à la main**.

- Quatre boutons de vitesse : 0,5×, 1×, 1,5×, 2× (une liste + `@for`, comme ton `RoleFilter`), le bouton actif a `aria-pressed`.
- Dans l'enfant : un **`input`** `speed` et un **`output`** `speedChange`.
- Au clic, l'enfant **n'a pas le droit** de modifier `speed` (c'est un input) : il émet la nouvelle vitesse.
- Dans le parent : un signal `speed` (1 au départ), et sur la balise un `[speed]="..."` **et** un `(speedChange)="..."` séparés. Affiche « Vitesse : 1× » dans le parent.

### C4. La découverte

Une fois C3 fonctionnel, remplace les deux bindings du parent par **un seul** `[(speed)]="..."`.

- Est-ce que ça marche encore ? Pourquoi ? (Indice : regarde bien les noms `speed` et `speedChange`.)
- Qu'est-ce que `model` t'a donc évité d'écrire dans `VolumeControl` ?

---

## Partie D — Questions de réflexion

Réponds avec tes mots (dans un commentaire ou dans la conversation) :

1. Pourquoi les inputs, outputs et models sont-ils publics (`readonly`) et pas `protected` ?
2. Pour chaque composant de l'exercice (`TrackCard`, `VolumeControl`, `SpeedControl`), justifie le choix entre `input`, `output` et `model`.
3. Dans `[(volume)]="volume"`, pourquoi pas de parenthèses après `volume` ? Et pourquoi y en a-t-il dans `[speed]="speed()"` ?
4. Dans B3, tu n'as écrit aucun code pour mettre à jour `likedCount` après un clic sur « J'aime ». Qui le recalcule, et comment sait-il qu'il faut le faire ?
5. Pourquoi « Lire » émet-il un id et pas directement un ordre du genre « mets `currentTrackId` à 3 » ?

---

## Critères de réussite

- [ ] La route `test-component` affiche le lecteur, sans erreur dans la console
- [ ] **Seul le parent modifie `tracks`, `currentTrackId` et `speed`** : aucun enfant ne fait de `set` ou d'`update` sur une donnée qui ne lui appartient pas
- [ ] `TrackCard` reçoit **un** morceau et émet des ids, elle ne connaît pas la playlist
- [ ] `formattedDuration` affiche `1:02` pour 62 secondes
- [ ] Le rang affiché commence à `#1`, sans calcul dans le template de la carte
- [ ] Le parent écrit `current`, la classe de la carte écrit `isCurrent`
- [ ] Le volume ne sort jamais de 0–100, et « Volume max » dans le parent met à jour l'enfant
- [ ] `SpeedControl` fonctionne d'abord avec deux bindings séparés, puis avec `[(speed)]`
- [ ] Inputs, outputs et models sont publics (`readonly`) ; le reste est `protected` ou `private`
- [ ] Accessibilité : les boutons des cartes précisent le morceau (« Lire *titre* »), les vitesses ont `aria-pressed`, la barre de volume a ses attributs ARIA

## Bonus (facultatif)

- **Morceau suivant** : un bouton « Suivant » dans le parent, qui lance le morceau d'après (et revient au premier après le dernier).
- **Filtre « Aimés seulement »** : une case à cocher sous forme de composant `LikedFilter` avec un `model<boolean>`, et un `computed` `visibleTracks` dans le parent. Attention : le `rank` doit-il suivre la liste filtrée ou la playlist complète ?
