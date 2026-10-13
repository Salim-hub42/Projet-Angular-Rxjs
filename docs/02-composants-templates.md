# Module 2 — [Angular] Composants et templates

> Durée estimée : 4–5 h · Widget : le Tableau des missions (exercice, à coder toi-même)

## Ce que tu sauras faire à la fin

- Lire et écrire un `@Component` complet
- Faire circuler les données entre la classe et le template : `{{ }}`, `[prop]`, `(event)`
- Changer l'apparence selon les données : `[class.x]`, `[style.x]`, `[attr.x]`
- Afficher selon une condition, répéter une liste, choisir parmi plusieurs cas : `@if`, `@for`, `@switch`
- Comprendre pourquoi les styles d'un composant ne « débordent » pas sur les autres

| Priorité | Notions |
| --- | --- |
| ★ cœur | Anatomie d'un `@Component`, interpolation `{{ }}`, property binding `[prop]`, event binding `(event)`, `[class.x]` / `[style.x]` / `[attr.x]`, `@if` / `@else`, `@for` (`track`, `$index`, `@empty`), `@switch` |
| ○ courant | Variables de template `#ref`, `@let`, encapsulation des styles (`:host`, `ViewEncapsulation`) |
| · référence | Accès aux membres privés dans les templates (v22.2) |

Fil rouge des exemples : **le sac à dos d'une recrue de l'Escouade**, qui contient de l'équipement (armes, boucliers, médikits).

---

## 1. ★ Anatomie d'un `@Component`

Un composant, c'est **une classe TypeScript** décorée par `@Component`. Le décorateur dit à Angular comment l'afficher.

```ts
import { Component, signal } from '@angular/core';
import { BackpackPanel } from '../backpack-panel/backpack-panel';

@Component({
  selector: 'app-armory-page',                             // ① la balise qui représente ce composant
  imports: [BackpackPanel],                                // ② ce que le template a le droit d'utiliser
  template: `<h1>{{ title() }}</h1> <app-backpack-panel />`, // ③ le HTML (ou templateUrl)
  styles: `:host { display: block; }`,                     // ④ les styles (ou styleUrl)
})
export class ArmoryPage {                                  // ⑤ les données et la logique
  protected readonly title = signal('Armurerie');
}
```

| Clé | Rôle | À savoir |
| --- | --- | --- |
| `selector` | Le nom de la balise : `<app-backpack-panel />` | Préfixe `app-` par convention. Balise auto-fermante `<x />` autorisée |
| `imports` | Composants, directives et pipes utilisés **dans le template** | Oublier un import → `'app-backpack-panel' is not a known element` |
| `template` / `templateUrl` | Le HTML, en ligne ou dans un fichier | En ligne pour les petits composants, fichier `.html` au-delà d'une vingtaine de lignes |
| `styles` / `styleUrl` | Le CSS/SCSS, en ligne ou dans un fichier | Limités à ce composant (voir section 8) |

**Utiliser un composant dans un autre** se fait en deux temps :

```
   backpack-panel.ts                          armory-page.ts
  ┌────────────────────────────────┐        ┌──────────────────────────────────────┐
  │ selector: 'app-backpack-panel' │        │ imports: [BackpackPanel]             │ ◄── ① importer la CLASSE
  │ export class BackpackPanel {}  │        │ template: `<app-backpack-panel />`   │ ◄── ② utiliser la BALISE
  └────────────────────────────────┘        └──────────────────────────────────────┘
```

> 💡 **Visibilité des membres** : ce que le template lit est en `protected` (accessible au template, pas à l'extérieur). Ce qui ne sert qu'à la classe est en `private`. Ce qui doit être lu par un autre composant ou un test est `public` (rare).

---

## 2. ★ Les liaisons (bindings) : le schéma à retenir

Le template et la classe se parlent par des **liaisons**. Chaque syntaxe a un sens de circulation :

```
            CLASSE (TypeScript)                         TEMPLATE (HTML)
  ┌──────────────────────────────┐                ┌──────────────────────────────────┐
  │ squadName = 'Escouade Alpha' │ ──── {{ }} ──► │ <h2>{{ squadName }}</h2>         │  texte
  │ count = 4                    │ ──── [ ] ────► │ <button [disabled]="count >= 4"> │  propriété
  │                              │                │                                  │
  │ addGear(name) { ... }        │ ◄─── ( ) ───── │ <button (click)="addGear(..)">   │  événement
  └──────────────────────────────┘                └──────────────────────────────────┘

  {{ }} et [ ]  : de la classe VERS le template (afficher)
  ( )           : du template VERS la classe (réagir)
  [( )]         : les deux à la fois → module 4 (model())
```

Moyen mnémotechnique : les **crochets** `[ ]` _poussent_ une valeur dans l'élément, les **parenthèses** `( )` _attrapent_ ce qui en sort. La « banane dans la boîte » `[( )]` fait les deux.

---

## 3. ★ Interpolation `{{ }}`

Affiche une valeur **sous forme de texte**.

```html
<h2>{{ squadName }}</h2>
<p>{{ count }} / {{ capacity }} objets ({{ capacity - count }} emplacements libres)</p>
<p>Mode furtif : {{ stealthMode() ? 'activé' : 'désactivé' }}</p>
```

- Entre les accolades, on écrit une **expression** : une variable, un calcul, un appel de méthode, un ternaire.
- Un **signal se lit en l'appelant** : `{{ stealthMode() }}`, pas `{{ stealthMode }}` (qui afficherait le code de la fonction).
- Le résultat est **toujours converti en texte** et échappé : `{{ '<b>gras</b>' }}` affiche les balises telles quelles, sans les interpréter. C'est une protection contre les injections XSS (module 23).

**Ce qui est interdit dans une expression de template** :
- les affectations (`=`), `++`, `--`, `new` ;
- les globales du navigateur : `Math`, `Date`, `window`, `console`… Le template ne voit **que les membres de la classe**. Besoin de `Math.round` ? Fais le calcul dans la classe.

> 🧠 Règle d'or : **le template affiche, la classe calcule.** Si une expression devient longue, déplace-la dans la classe (au module 3, on utilisera `computed()` pour ça).

---

## 4. ★ Property binding `[prop]`

Lie une **propriété DOM** d'un élément à une expression. Quand l'expression change, Angular met la propriété à jour.

```html
<button [disabled]="count >= capacity">Équiper</button>
<img [src]="avatarUrl" [alt]="soldierName" />
<input [value]="defaultName" />
```

**Avec ou sans crochets, ce n'est pas pareil :**

```html
<app-card title="gear" />       <!-- la chaîne littérale "gear" -->
<app-card [title]="gear" />     <!-- la VALEUR de la propriété gear de la classe -->
<app-card [title]="'gear'" />   <!-- la chaîne "gear" (guillemets simples dedans) -->
```

> ⚠️ Piège classique : `disabled="{{ isFull }}"` ne marche pas comme prévu, car l'attribut HTML `disabled` désactive le bouton dès qu'il est présent, même avec la valeur `"false"`. Utilise toujours `[disabled]="isFull"`.

**Propriété DOM vs attribut HTML** : l'attribut est écrit dans le HTML (texte, valeur initiale), la propriété vit dans l'objet JavaScript de l'élément (valeur courante, typée). `[x]` cible **la propriété**. Pour la plupart des cas, les deux portent le même nom, d'où la confusion. Quand il n'existe **pas** de propriété DOM, il faut `[attr.x]` (section 6).

---

## 5. ★ Event binding `(event)`

Exécute une instruction quand l'élément émet un événement.

```html
<button (click)="emptyBackpack()">Tout vider</button>
<button (click)="dropGear(gear.id)">🗑️</button>
<input (input)="onInput($event)" />
<form (submit)="addGear($event, gearName)">…</form>
```

- On appelle une **méthode de la classe**, avec des arguments si besoin.
- **`$event`** contient l'objet événement du navigateur (`MouseEvent`, `KeyboardEvent`, `InputEvent`…).
- **Filtres de touches** : `(keydown.escape)`, `(keydown.shift.enter)`… Angular ne déclenche le handler que pour cette touche. Utile pour un raccourci clavier, mais **pas pour valider une saisie** : pour ça, on utilise un formulaire (ci-dessous).
- Exception à la règle « pas d'affectation » : dans un event binding, `gearName.value = ''` est autorisé, et on peut enchaîner plusieurs instructions avec `;`.

**Récupérer le texte d'un champ** : le template ne permet pas d'écrire `($event.target as HTMLInputElement).value` (pas de `as` en template). On passe donc l'événement (ou l'élément, section 9) à la classe, et on type là-bas :

```html
<input (input)="onInput($event)" />
```

```ts
protected onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
}
```

### Valider une saisie : un `<form>` et l'événement `(submit)`

Pour « taper un texte puis valider », la bonne pratique est un **formulaire HTML** : le navigateur déclenche `submit` **à la fois** quand on appuie sur Entrée dans le champ **et** quand on clique sur le bouton `type="submit"`. Un seul handler, et un comportement que les lecteurs d'écran connaissent.

```html
<form (submit)="addGear($event, gearName)">
  <label for="gear-name">Nom de l'équipement</label>
  <input id="gear-name" #gearName type="text" />
  <button type="submit">Équiper</button>
</form>
```

```ts
protected addGear(event: SubmitEvent, input: HTMLInputElement): void {
  event.preventDefault(); // ⚠️ sinon le navigateur envoie le formulaire et RECHARGE la page
  const name = input.value.trim();
  if (!name) {
    return;
  }
  // … ajouter l'équipement
  input.value = ''; // vider le champ
}
```

> ⚠️ Le piège : sans `event.preventDefault()`, la page se recharge et tu perds tout l'état. Les formulaires Angular (Reactive Forms au module 15, Signal Forms au module 16) fournissent l'événement `(ngSubmit)`, qui fait ce `preventDefault()` à ta place et ajoutent la validation. Ici, on reste en HTML simple.

> En zoneless (module 1), un event binding du template déclenche une mise à jour de l'affichage. Mais l'état modifié doit être dans un **signal** pour qu'Angular sache précisément quoi rafraîchir. C'est pour ça que les exemples utilisent `signal()` : on les étudie en détail au module 3.

---

## 6. ★ `[class.x]`, `[style.x]`, `[attr.x]`

Trois variantes du property binding pour l'apparence et l'accessibilité.

### `[class.x]` : ajouter ou retirer UNE classe CSS

```html
<li [class.gear--heavy]="gear.heavy">…</li>
<!-- heavy = true  → <li class="gear--heavy"> -->
<!-- heavy = false → <li>                     -->
```

Pour plusieurs classes d'un coup :

```html
<li [class]="{ 'gear--heavy': gear.heavy, selected: isSelected }">…</li>
```

### `[style.x]` : UN style CSS, avec unité facultative

```html
<span [style.background-color]="gear.color"></span>
<div [style.width.%]="progress"></div>      <!-- progress = 40 → width: 40% -->
<p [style.font-size.px]="size"></p>         <!-- size = 18     → font-size: 18px -->
```

Préfère les classes (`[class.x]`) quand c'est possible : le CSS reste dans le fichier de styles. Garde `[style.x]` pour les valeurs vraiment calculées (une couleur venue des données, un pourcentage).

### `[attr.x]` : un ATTRIBUT HTML (quand il n'y a pas de propriété DOM)

```html
<button [attr.aria-pressed]="stealthMode()">Mode furtif</button>
<button [attr.aria-label]="'Jeter ' + gear.name">🗑️</button>
<td [attr.colspan]="columns">…</td>
```

Indispensable pour les attributs **`aria-*`** (accessibilité) et quelques attributs comme `colspan`. Si la valeur vaut `null` ou `undefined`, Angular **retire** l'attribut.

> 💡 Un bouton qui contient seulement un emoji (🗑️) doit avoir un `aria-label`, sinon un lecteur d'écran annonce « bouton » sans dire à quoi il sert. C'est une exigence AXE du projet.

---

## 7. ★ Le control flow : `@if`, `@for`, `@switch`

Des blocs intégrés au template (depuis Angular 17) pour structurer l'affichage. Pas d'import nécessaire.

### `@if` / `@else if` / `@else`

```html
@if (count === 0) {
  <p>Sac à dos vide.</p>
} @else if (count >= capacity) {
  <p>Sac à dos plein !</p>
} @else {
  <p>Il reste de la place.</p>
}
```

Le bloc non retenu n'est **pas caché, il n'existe pas** dans le DOM. Pour mémoriser le résultat de la condition sous un nom :

```html
@if (selectedGear(); as gear) {
  <p>Équipement choisi : {{ gear.name }}</p>
}
```

### `@for` avec `track` et `@empty`

```html
@for (gear of backpack(); track gear.id; let i = $index, last = $last) {
  <li>{{ i + 1 }}. {{ gear.name }} @if (last) { (le plus récent) }</li>
} @empty {
  <li>Aucun équipement.</li>
}
```

**`track` est obligatoire.** Il donne à Angular l'**identité** de chaque élément. Quand la liste change, Angular compare les identités pour réutiliser les éléments DOM existants au lieu de tout recréer :

```
 Avant : [ #1 Fusil plasma, #2 Bouclier ]     Après suppression de #1 : [ #2 Bouclier ]

 track gear.id  → Angular voit que #2 existe déjà : il supprime seulement le <li> de #1  ✅
 track $index   → Angular voit « l'index 0 a changé, l'index 1 a disparu » :
                  il réécrit le <li> 0 et supprime le <li> 1  ⚠️ plus de travail,
                  et un champ en cours de saisie peut se retrouver sur la mauvaise ligne
```

| Que tracker ? | Quand |
| --- | --- |
| `track item.id` | Objets avec un identifiant unique : **le cas normal** |
| `track item` | Liste de valeurs simples et uniques (`string`, `number`) |
| `track $index` | Liste statique qui ne change jamais d'ordre |

**Variables disponibles dans `@for`** (renommables avec `let x = $variable`) :

| Variable | Valeur |
| --- | --- |
| `$index` | Position (commence à 0) |
| `$count` | Nombre total d'éléments |
| `$first` / `$last` | `true` pour le premier / le dernier |
| `$even` / `$odd` | `true` pour les positions paires / impaires (pratique pour des lignes zébrées) |

**`@empty`** (facultatif) s'affiche quand la liste est vide.

### `@switch` / `@case` / `@default`

Choisir **un** bloc selon **une** valeur :

```html
@switch (gear.type) {
  @case ('attack') { <span>🔫 attaque</span> }
  @case ('defense') { <span>🛡️ défense</span> }
  @default { <span>💉 soin</span> }
}
```

- La comparaison est stricte (`===`).
- Pas de `break` : un seul bloc s'exécute, il n'y a pas de « fall-through » comme en JavaScript.
- Plus lisible qu'une chaîne de `@else if` quand on teste toujours la même valeur.

---

## 8. ○ Encapsulation des styles : `:host` et `ViewEncapsulation`

Les styles d'un composant **ne s'appliquent qu'à lui**. Écrire `button { … }` dans `backpack-panel.scss` ne touche pas les boutons des autres composants. Comment ? Angular ajoute des attributs uniques au HTML et réécrit ton CSS :

```
 Ce que tu écris (backpack-panel.scss)    Ce que le navigateur reçoit
 ┌──────────────────────────┐           ┌───────────────────────────────────────────┐
 │ button { color: red; }   │   ──►     │ button[_ngcontent-abc-c12] { color: red } │
 └──────────────────────────┘           └───────────────────────────────────────────┘

 Et dans le DOM :  <app-backpack-panel _nghost-abc-c12>
                     <button _ngcontent-abc-c12>…</button>   ← seuls CES boutons sont ciblés
```

Tu pourras le vérifier sur ton propre composant, dans les DevTools du navigateur (onglet Éléments).

**`:host`** cible l'élément du composant lui-même (`<app-backpack-panel>`), vu de l'extérieur :

```scss
:host {
  display: block; // ⚠️ une balise inconnue est "inline" par défaut : padding et largeur se comportent mal
  padding: 1.25rem;
}
:host(.compact) { padding: 0.5rem; } // seulement si <app-backpack-panel class="compact">
```

**Les trois modes** (`encapsulation` dans `@Component`) :

| Mode | Effet | Quand |
| --- | --- | --- |
| `ViewEncapsulation.Emulated` (défaut) | Attributs `_ngcontent` comme ci-dessus | Toujours, sauf raison précise |
| `ViewEncapsulation.None` | Les styles deviennent globaux | Rare : surcharger une bibliothèque tierce |
| `ViewEncapsulation.ShadowDom` | Vrai Shadow DOM du navigateur | Web components, isolation totale |

Et `styles.scss` ? Il est **global** : c'est là qu'on met le thème (variables CSS, polices, styles de base). Les variables CSS (`var(--hud-accent)`) traversent l'encapsulation : c'est ce qui permet à tous les composants de partager le thème.

> **Legacy (·)** : tu croiseras `::ng-deep` pour styliser l'intérieur d'un composant enfant. Il est **déprécié** ; préfère les variables CSS ou les styles globaux.

---

## 9. ○ Variables de template `#ref`

`#nom` sur un élément crée une variable utilisable **ailleurs dans le même template**. Elle pointe vers l'élément DOM (ou vers l'instance du composant si on la pose sur un composant).

```html
<input #gearName type="text" />
<button type="button" (click)="gearName.focus()">Aller au champ</button>
<form (submit)="addGear($event, gearName)">…</form>  <!-- on passe l'élément à la classe -->
```

Pratique pour donner le focus à un champ, ou **transmettre l'élément à une méthode** comme dans le formulaire de la section 5. Pour accéder à un élément depuis la classe, on utilisera `viewChild()` au module 4.

---

## 10. ○ `@let` : une variable locale au template

```html
@let count = backpack().length;

<p>{{ count }} objets</p>
<button [disabled]="count >= capacity">Équiper</button>
```

- Évite de répéter la même expression à plusieurs endroits.
- Visible à partir de sa déclaration, dans le bloc où elle est déclarée et ses blocs enfants.
- En lecture seule : impossible de la réaffecter depuis un event binding.
- Elle est recalculée automatiquement quand ce qu'elle lit change (ici le signal `backpack`).

Pour une logique plus complexe, préfère `computed()` dans la classe (module 3).

---

## 11. · Référence : membres privés dans les templates (v22.2)

À partir d'Angular 22.2, le template pourra lire les membres `private` de la classe. *Quand y penser* : en lisant du code récent qui n'utilise plus `protected` pour le template. Ton projet est en 22.0, donc reste sur `protected`.

---

> ### Legacy : ce que tu verras en entreprise (·)
>
> Avant Angular 17, l'affichage conditionnel et les boucles passaient par des **directives structurelles** avec une étoile `*`, à importer depuis `CommonModule` :
>
> ```html
> <!-- AVANT -->
> <p *ngIf="count === 0; else full">Vide</p>
> <ng-template #full><p>Il y a de l'équipement</p></ng-template>
>
> <li *ngFor="let gear of backpack; let i = index; trackBy: trackById">{{ i }} {{ gear.name }}</li>
>
> <div [ngSwitch]="gear.type">
>   <span *ngSwitchCase="'attack'">attaque</span>
>   <span *ngSwitchDefault>autre</span>
> </div>
>
> <li [ngClass]="{ heavy: gear.heavy }" [ngStyle]="{ 'background-color': gear.color }"></li>
> ```
>
> | Ancien | Moderne |
> | --- | --- |
> | `*ngIf="cond; else tpl"` + `<ng-template #tpl>` | `@if (cond) { } @else { }` |
> | `*ngFor="let x of list; trackBy: fn"` (trackBy facultatif) | `@for (x of list; track x.id) { }` (track obligatoire) |
> | `let i = index` | `$index` (ou `let i = $index`) |
> | `[ngSwitch]` + `*ngSwitchCase` + `*ngSwitchDefault` | `@switch` / `@case` / `@default` |
> | `[ngClass]="{ a: cond }"` | `[class.a]="cond"` ou `[class]="{ a: cond }"` |
> | `[ngStyle]="{ width: w + 'px' }"` | `[style.width.px]="w"` |
> | `imports: [CommonModule]` ou `NgIf`, `NgFor` | rien à importer |
>
> La CLI propose une migration automatique : `ng generate @angular/core:control-flow`.

---

## Exemple générique : le sac à dos de la recrue

Voici un petit composant complet qui réunit les notions du module. **Lis-le, ne le recopie pas** : l'exercice te demandera d'écrire le tien, sur un autre sujet. Les `§` renvoient aux sections de la leçon.

```ts
// backpack-panel.ts
import { Component, signal } from '@angular/core';

type GearType = 'attack' | 'defense' | 'heal';

interface Gear {
  id: number;
  name: string;
  type: GearType;
  heavy: boolean;
}

// Couleur de la pastille selon le type d'équipement
const GEAR_COLORS: Record<GearType, string> = {
  attack: '#ff8a3d',
  defense: '#38e0d0',
  heal: '#7dff6a',
};

@Component({
  selector: 'app-backpack-panel', // §1 : la balise <app-backpack-panel />
  imports: [],
  templateUrl: './backpack-panel.html',
  styleUrl: './backpack-panel.scss',
})
export class BackpackPanel {
  protected readonly capacity = 4; // valeur fixe, lue par le template
  protected readonly colors = GEAR_COLORS;
  protected readonly backpack = signal<Gear[]>([
    { id: 1, name: 'Fusil plasma', type: 'attack', heavy: true },
    { id: 2, name: 'Bouclier énergétique', type: 'defense', heavy: false },
  ]);
  private nextId = 3; // privé : seule la classe s'en sert

  protected addGear(event: SubmitEvent, input: HTMLInputElement): void {
    event.preventDefault(); // §5 : pas de rechargement de la page
    const name = input.value.trim();
    if (!name || this.backpack().length >= this.capacity) {
      return;
    }
    // Tout nouvel objet est un médikit léger
    const gear: Gear = { id: this.nextId++, name, type: 'heal', heavy: false };
    // update + spread : on crée un NOUVEAU tableau, on ne modifie pas l'ancien
    this.backpack.update((list) => [...list, gear]);
    input.value = '';
  }

  protected dropGear(id: number): void {
    this.backpack.update((list) => list.filter((gear) => gear.id !== id));
  }
}
```

```html
<!-- backpack-panel.html -->
<h2>Sac à dos</h2>

<!-- §10 : @let -->
@let count = backpack().length;

<!-- §3 : interpolation -->
<p>{{ count }} / {{ capacity }} objets</p>

<!-- §7 : @if / @else -->
@if (count >= capacity) {
  <p>Sac à dos plein !</p>
} @else {
  <p>Encore {{ capacity - count }} emplacements.</p>
}

<!-- §5 : (submit) · §9 : #gearName · §4 : [disabled] -->
<form (submit)="addGear($event, gearName)">
  <label for="gear-name">Nom de l'équipement</label>
  <input id="gear-name" #gearName type="text" />
  <button type="submit" [disabled]="count >= capacity">Équiper</button>
</form>

<ul>
  <!-- §7 : @for avec track, $last et @empty -->
  @for (gear of backpack(); track gear.id; let last = $last) {
    <!-- §6 : [class.x] -->
    <li [class.heavy]="gear.heavy">
      <!-- §6 : [style.x] -->
      <span class="dot" [style.background-color]="colors[gear.type]"></span>
      {{ gear.name }}

      <!-- §7 : @switch -->
      @switch (gear.type) {
        @case ('attack') { 🔫 attaque }
        @case ('defense') { 🛡️ défense }
        @default { 💉 soin }
      }

      @if (last) {
        <small>(le plus récent)</small>
      }

      <!-- §5 : (click) avec argument · §6 : [attr.x] -->
      <button
        type="button"
        [attr.aria-label]="'Jeter ' + gear.name"
        (click)="dropGear(gear.id)"
      >
        🗑️
      </button>
    </li>
  } @empty {
    <li>Aucun équipement.</li>
  }
</ul>
```

```scss
// backpack-panel.scss — §8 : ces styles ne touchent que ce composant
:host {
  display: block; // la balise <app-backpack-panel> se comporte comme un bloc
  padding: 1rem;
  background: var(--hud-surface); // variables du thème global (styles.scss)
  border: var(--hud-border);
}

.heavy {
  border-left: 4px solid var(--hud-accent);
}

.dot {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
}
```

**Ce qu'il faut remarquer :**

1. **Le template affiche, la classe agit** : aucun calcul compliqué dans le HTML. Les changements d'état passent par des méthodes (`addGear`, `dropGear`).
2. **On ne mute jamais le tableau** : `update((list) => [...list, nouveau])` pour ajouter, `filter` pour retirer. Pour *modifier* un élément, on utiliserait `map` : c'est ce que ton exercice te demandera.
3. **Un seul handler pour Entrée et pour le clic**, grâce au `<form (submit)>`.
4. **`track gear.id`** : chaque équipement a un identifiant unique, c'est lui qu'Angular suit.
5. **Le bouton 🗑️ a un `aria-label`** : sans lui, un lecteur d'écran annoncerait seulement « bouton ».

---

## Exercice : le Tableau des missions

> ⚠️ Ne regarde pas de solution : c'est à toi de jouer. Demande-moi des indices si tu bloques.

**Objectif** : le commandement de l'Escouade suit les missions en cours. Crée un composant qui affiche les missions, leur progression, et permet d'en lancer de nouvelles, de les faire avancer… ou de les abandonner.

### Consignes

1. **Créer le widget du module** :
   - génère le composant `mission-board` avec la CLI, dans `src/app/widgets/02-composants-templates/` ;
   - ajoute une **route lazy** `02-composants-templates` qui l'affiche (même principe que la route de `HomeLab` dans `app.routes.ts`) ;
   - ajoute une carte pour le module 2 sur la page d'accueil, dans le tableau `widgets` de `HomeLab`. Le modèle `HomeWidget` a un champ `path` facultatif : renseigne-le pour que la carte devienne un lien ;
   - le composant contient le `<h1>` de la page, puis ton tableau.

2. **Le modèle** : dans le fichier du composant, définis un type `Mission` avec :
   - `id` (nombre), `title` (texte) ;
   - `status` : un type union `'in-progress' | 'accomplished' | 'failed'` ;
   - `progress` : un nombre de 0 à 100.

3. **L'état** : un signal contenant 3 missions de départ, avec des statuts différents. Inspire-toi de `backpack` dans l'exemple : `signal<Mission[]>([...])`, puis `update(...)` pour le modifier **sans muter** le tableau (on crée un nouveau tableau, par exemple avec `map` ou `filter`).

4. **L'affichage** :
   - un sous-titre `<h2>` et, avec `@let`, le nombre total de missions ;
   - la liste avec `@for` (bon `track` !) et un message `@empty` ;
   - des lignes zébrées : une classe CSS sur les lignes impaires grâce à `$odd` ;
   - le statut avec `@switch` : un emoji et un texte différents pour chacun des trois statuts (par exemple ⏳ en cours, 🎖️ accomplie, ☠️ échouée) ;
   - une **barre de progression** : un `<div>` dont la largeur suit `progress` avec `[style.width.%]`.

5. **Les actions** (event binding) :
   - un bouton **« +10 % »** qui fait avancer la mission. Quand `progress` atteint 100, le statut passe à `'accomplished'` (cette logique va dans la classe, pas dans le template) ;
   - ce bouton est **désactivé** (`[disabled]`) si la mission est accomplie ou échouée ;
   - un bouton **« Abandonner la mission ☠️ »** qui passe le statut à `'failed'` ;
   - un **formulaire** (`<form (submit)>`, un champ avec `#ref` et un bouton `type="submit"`) pour lancer une nouvelle mission à 0 %, statut `'in-progress'`. Ignore les titres vides, et n'oublie pas `preventDefault()`.

6. **Le style** :
   - `:host` en `display: block`, et réutilise les variables du thème (`var(--hud-surface)`, `var(--hud-border)`…), et même la forme des panneaux avec `clip-path: var(--hud-clip)` ;
   - une classe `failed` ajoutée avec `[class.x]` sur une mission échouée, avec un style qui se voit (couleur `var(--hud-danger)`, texte barré, effet de brouillage en animation CSS… lâche-toi 😄).

7. **Accessibilité** :
   - la barre de progression a `role="progressbar"` et les attributs `aria-valuenow`, `aria-valuemin`, `aria-valuemax` liés avec `[attr.x]` ;
   - le champ texte a un `<label>` associé ;
   - les boutons ont un texte clair, ou un `aria-label` qui précise de quelle mission il s'agit.

8. **Vérifier** : `npm test` et `npm run build` passent.

### Critères de réussite

- [ ] La carte du module 2 sur l'accueil mène à ton tableau, sans erreur dans la console du navigateur
- [ ] `mission-board` apparaît dans les « Lazy chunk files » de `npm run build`
- [ ] Lancer une mission fonctionne avec Entrée **et** avec le bouton, sans recharger la page
- [ ] `@for` utilise un `track` sur un identifiant unique, et `@empty` s'affiche quand il n'y a plus de mission (prévois un moyen d'y arriver, par exemple un bouton « Archiver »)
- [ ] La barre de progression avance de 10 % à chaque clic, et le statut passe à « accomplie » à 100 %
- [ ] Aucune logique métier dans le template : les calculs et changements d'état sont dans des méthodes de la classe
- [ ] Le tableau n'est jamais muté directement (pas de `push`, ni de `mission.progress += 10`)
- [ ] Pas de `*ngIf`, `*ngFor`, `ngClass` ni `ngStyle`
- [ ] `npm test` passe

### Bonus (facultatif)

- Affiche « Mission accomplie, soldat ! 🎉 » à côté d'une mission réussie, avec `@if`.
- Écris un test dans `mission-board.spec.ts` : clique 10 fois sur « +10 % » et vérifie que le statut affiché est « accomplie ». Inspire-toi de `home-lab.spec.ts`, et cherche dans la doc d'Angular comment lire le DOM rendu (`fixture.nativeElement`).

Quand tu as fini (ou si tu bloques), dis-le-moi : je relirai ton code.
