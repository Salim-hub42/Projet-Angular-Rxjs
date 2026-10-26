# Module 4 — [Angular] Communication entre composants

> Durée estimée : 5–6 h · Widget : le Registre de l'escouade (exercice, à coder toi-même)

## Ce que tu sauras faire à la fin

- **Découper** une page en plusieurs composants, et savoir **qui possède** les données
- Envoyer des données du parent vers l'enfant avec `input()`
- Prévenir le parent depuis l'enfant avec `output()`
- Partager une valeur dans les deux sens avec `model()` et le two-way binding `[( )]`
- Glisser du contenu dans un composant avec `<ng-content>`
- Savoir **quand** un composant naît et meurt, et **nettoyer** derrière lui pour éviter les fuites mémoire

| Priorité    | Notions                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| ★ cœur      | `input()` (requis, valeur par défaut, `transform`, `alias`), `output()`, `model()`, `<ng-content>` (et `select`), cycle de vie (`ngOnInit`, `ngOnDestroy`, `DestroyRef`) |
| ○ courant   | `viewChild()` / `viewChildren()` / `contentChild()`, `afterNextRender` / `afterEveryRender`, `ngOnChanges` (et pourquoi les signals le rendent rare) |
| · référence | `ng-template` + `ngTemplateOutlet`, composants dynamiques (`ViewContainerRef`)                                                                 |

Fil rouge des exemples : **le hangar des mechs**, où l'escouade prépare ses robots de combat avant de les lancer.

---

## 1. ★ Pourquoi découper ?

Jusqu'ici, chaque widget tenait dans **un seul** composant. Ton poste de ravitaillement fait déjà presque 150 lignes de TS, et son template mélange la bannière, les véhicules, les ressources, la barre et les boutons. Imagine une vraie page d'entreprise, avec dix fois plus de choses.

On découpe donc l'écran en **composants plus petits**, chacun avec **une seule responsabilité**. Ils s'emboîtent pour former un **arbre** :

```
                 HangarBay (le parent)
                 ├── PowerDial         (le réglage de puissance)
                 ├── MechCard  Titan   (une carte par mech)
                 ├── MechCard  Faucon
                 ├── MechCard  Golem
                 └── RadarPing         (le radar)
```

Trois avantages :
- **lisibilité** : chaque fichier est court et parle d'une seule chose ;
- **réutilisation** : la même `MechCard` sert trois fois, et pourrait servir sur une autre page ;
- **tests** : on teste une carte toute seule, sans le reste de la page (module 24).

Mais des composants séparés doivent **se parler**. C'est tout le sujet du module, et il tient en une règle :

```
                 ┌─────────────┐
                 │   PARENT    │   possède les données (les signals)
                 └─────────────┘
          données ↓         ↑ événements
           input()           output()
                 ┌─────────────┐
                 │   ENFANT    │   affiche, et prévient quand on agit
                 └─────────────┘
```

> 🧠 **Les données descendent, les événements remontent.** L'enfant ne modifie jamais lui-même les données du parent : il **demande**, et le parent **décide**.

---

## 2. ★ Utiliser un composant dans un autre

Tu l'as déjà fait sans le savoir avec `NgOptimizedImage`. Pour utiliser un composant enfant, il faut deux choses :

**1. L'importer** dans le tableau `imports` du parent :

```ts
import { MechCard } from './mech-card';

@Component({
  selector: 'app-hangar-bay',
  imports: [MechCard], // ← sans ça : erreur « 'app-mech-card' is not a known element »
  templateUrl: './hangar-bay.html',
})
export class HangarBay {}
```

**2. L'écrire dans le template** du parent, avec son **`selector`** comme nom de balise :

```html
<app-mech-card />
```

Le préfixe `app-` vient de la configuration du projet : il évite les conflits avec les vraies balises HTML. Une balise de composant sans contenu peut s'auto-fermer avec `/>`.

> 💡 Où ranger les enfants ? **Au plus près de là où ils servent** : dans le dossier du widget, à côté du parent. On ne les déplace dans un dossier partagé que quand plusieurs widgets en ont besoin.

---

## 3. ★ `input()` : le parent donne une donnée à l'enfant

### Déclarer et lire

Dans l'enfant, on déclare ce qu'il **attend** de son parent :

```ts
import { Component, input } from '@angular/core';

export class MechCard {
  readonly name = input<string>('Inconnu'); // avec une valeur par défaut
}
```

Dans le parent, on lui **passe** la valeur avec un property binding, exactement comme `[disabled]` au module 2 :

```html
<app-mech-card [name]="'Titan'" />
<app-mech-card name="Titan" />          <!-- texte fixe : sans crochets, sans apostrophes -->
<app-mech-card [name]="mech().name" />  <!-- une valeur calculée : avec crochets -->
```

Tu reconnais la règle du module 3 : **des crochets = du code TypeScript, pas de crochets = du texte**.

### Un input est un signal

C'est **la** bonne nouvelle : `input()` renvoie un **signal en lecture seule**. On le lit donc avec des parenthèses, dans le template **et** dans la classe, et on peut en dériver un `computed` :

```ts
readonly armor = input(100);

// se recalcule tout seul quand le parent envoie une nouvelle valeur
protected readonly armorStatus = computed(() => (this.armor() < 30 ? 'critique' : 'opérationnel'));
```

```html
<p>Blindage : {{ armor() }} % ({{ armorStatus() }})</p>
```

Tout ce que tu as appris au module 3 continue de marcher : l'input est une **source** du graphe de dépendances, comme un signal.

### Requis : `input.required()`

Une carte de mech **sans** mech n'a aucun sens. Plutôt qu'inventer une valeur par défaut bidon, on rend l'input **obligatoire** :

```ts
readonly mech = input.required<Mech>();
```

Si le parent oublie `[mech]`, **le build échoue** : `Required input 'mech' from component MechCard must be specified`. L'erreur arrive à la compilation, pas chez l'utilisateur.

> **Valeur par défaut ou requis ?** Si l'enfant a un comportement sensé sans la donnée (une option, un mode d'affichage) : valeur par défaut. Si la donnée est la raison d'être du composant (le mech d'une carte de mech) : `required`.

### ⚠️ L'enfant ne peut pas modifier un input

```ts
this.mech.set(…); // ❌ erreur de compilation : un input n'a ni set ni update
```

C'est voulu : la donnée **appartient au parent**. Si l'enfant pouvait la modifier, deux composants changeraient la même donnée chacun de leur côté, et on ne saurait plus qui a raison. Pour changer quelque chose, l'enfant **demande** au parent avec un `output()` (section 4). Et pour une valeur que les deux doivent modifier, il y a `model()` (section 5).

### `transform` : convertir la valeur reçue

Pour une option booléenne, on aimerait écrire simplement :

```html
<app-mech-card [mech]="mech" compact />
```

Sauf qu'un attribut HTML sans valeur vaut… la chaîne vide `''`, pas `true`. La fonction `booleanAttribute` d'Angular fait la conversion :

```ts
import { booleanAttribute, input } from '@angular/core';

readonly compact = input(false, { transform: booleanAttribute });
```

| Ce qu'écrit le parent           | Ce que reçoit l'enfant |
| ------------------------------- | ---------------------- |
| rien                            | `false` (la valeur par défaut) |
| `compact`                       | `true`                 |
| `[compact]="compactView()"`     | la valeur du signal    |

Il existe aussi `numberAttribute`, qui convertit `level="3"` (une chaîne) en `3` (un nombre). Et `transform` accepte n'importe quelle fonction à toi, par exemple pour borner une valeur entre 0 et 100 avec `Math.min` / `Math.max`.

### `alias` : un autre nom vu de l'extérieur

```ts
readonly level = input(1, { alias: 'mechLevel' });
```

```html
<app-mech-card mechLevel="3" />  <!-- le parent utilise l'alias -->
```

Dans la classe, la propriété s'appelle toujours `level`. C'est rare : ça sert surtout à garder un nom public stable pendant qu'on renomme l'intérieur. **Par défaut, n'en mets pas.**

### Pourquoi les inputs ne sont pas `protected`

Jusqu'ici, tout ce que lisait le template était `protected`. Un input, lui, est utilisé **par le parent**, qui est à l'extérieur de la classe : il doit donc rester **public**. Si tu écris `protected readonly mech = input…`, le build échoue avec `Property 'mech' is protected`. On écrit simplement `readonly`, et ce sera pareil pour `output()` et `model()`.

### ⚠️ Pas d'input dans le constructeur

Le parent ne transmet ses valeurs **qu'après** avoir créé l'enfant. Au moment du `constructor()`, les inputs n'ont donc pas encore de valeur :

```ts
constructor() {
  console.log(this.mech()); // ❌ NG0950 : Input "mech" is required but no value is available yet
}
```

Dans un `computed` ou le template, aucun problème : ils ne sont lus que plus tard. Pour **agir une fois** avec la valeur d'un input au démarrage, on utilise `ngOnInit` (section 7).

---

## 4. ★ `output()` : l'enfant prévient le parent

### Déclarer et émettre

Dans l'enfant, on déclare un événement, avec le **type** de ce qu'il transporte :

```ts
import { output } from '@angular/core';

export class MechCard {
  readonly mech = input.required<Mech>();
  readonly launch = output<number>(); // transportera l'id du mech

  protected requestLaunch(): void {
    this.launch.emit(this.mech().id); // « on a demandé à lancer ce mech »
  }
}
```

```html
<button type="button" (click)="requestLaunch()">Lancer</button>
```

### Écouter dans le parent

Le parent écoute cet événement **exactement comme un `(click)`**. La valeur émise arrive dans **`$event`** :

```html
<app-mech-card [mech]="mech" (launch)="launchMech($event)" />
```

```ts
protected launchMech(id: number): void {
  this.mechs.update((list) => list.map((m) => (m.id === id ? { ...m, ready: false } : m)));
}
```

Le circuit complet :

```
 ENFANT                                     PARENT
 clic sur « Lancer »
   → requestLaunch()
   → launch.emit(2)  ────── (launch) ──────► launchMech($event = 2)
                                              → mechs.update(…)   ← le parent modifie SES données
   ◄────────────── [mech] ─────────────────── la carte reçoit le mech mis à jour
 la carte se redessine (ready: false)
```

L'enfant n'a **jamais** touché aux données. Il a juste dit « on a cliqué sur Lancer pour le mech 2 ». C'est le parent qui a décidé quoi en faire. Demain, le parent pourra afficher une confirmation, vérifier la puissance, appeler une API… sans changer une ligne de la carte.

### Bien nommer un output

- Un nom qui décrit **ce qui s'est passé** ou **ce qui est demandé** : `launch`, `heal`, `selected`, `closed`.
- **Pas de préfixe `on`** : on écrit `launch`, et le parent lira `(launch)="…"`. Le `on…` est réservé, par convention, aux **méthodes** qui réagissent, côté parent.
- Le type entre chevrons dit ce qu'on transporte : `output<number>()` pour un id, `output<Mech>()` pour un objet entier, `output<void>()` quand il n'y a rien à transmettre (on appelle alors `emit()` sans argument).

---

## 5. ★ `model()` : une valeur partagée dans les deux sens

### Le besoin

Prends le réglage de puissance du hangar : un petit composant avec des boutons « − 10 % » et « + 10 % ».
- Le **parent** doit connaître la puissance, pour l'afficher et l'utiliser au lancement.
- L'**enfant** doit pouvoir la **modifier**, puisque c'est lui qui a les boutons.

Avec ce que tu connais, il faudrait un `input()` pour la valeur **et** un `output()` pour dire « elle a changé », puis une méthode dans le parent pour recopier la nouvelle valeur. `model()` fait les deux d'un coup.

### Côté enfant

```ts
import { model } from '@angular/core';

export class PowerDial {
  readonly power = model(50); // un signal MODIFIABLE, relié au parent

  protected increase(): void {
    this.power.update((p) => Math.min(p + 10, 100)); // ← l'enfant a le droit de le modifier
  }
}
```

Contrairement à un input, un `model` a `set` et `update`. Et chaque modification est **automatiquement renvoyée** au parent.

### Côté parent : la « banane dans une boîte » `[( )]`

```ts
protected readonly power = signal(50);
```

```html
<app-power-dial [(power)]="power" />
<p>Puissance : {{ power() }} %</p>
```

On écrit le **signal lui-même**, `power`, **sans parenthèses** : on ne passe pas sa valeur, on passe la **boîte**, pour que l'enfant puisse y écrire.

La syntaxe `[( )]` s'appelle « banana in a box », parce que les parenthèses ressemblent à une banane dans une boîte de crochets. Elle combine les deux sens :

```
[(power)]="power"   =   [power]="power()"   +   (powerChange)="power.set($event)"
                         données ↓               événement ↑
```

Le `model` crée en effet tout seul un output nommé `powerChange` : c'est ce que tu verras dans du code plus ancien, écrit à la main.

### `input` + `output` ou `model` ?

| Situation | Outil |
| --- | --- |
| L'enfant affiche une donnée sans la modifier (une carte de mech) | `input()` |
| L'enfant signale une **action**, et le parent décide (lancer, soigner, supprimer) | `output()` |
| L'enfant est un **contrôle** qui édite une **valeur** (un curseur, une case à cocher, un filtre, un sélecteur) | `model()` |

> 🧠 Un `model` reste rare : il est fait pour les **composants de saisie** réutilisables. Si tu hésites, commence par `input` + `output`, c'est plus explicite.

---

## 6. ★ `<ng-content>` : glisser du contenu dans un composant

### Le besoin

Un `input()` transmet une **donnée** : un nombre, un texte, un objet. Mais parfois, le parent veut transmettre **du HTML** : un badge, une icône, des boutons, un paragraphe mis en forme. C'est la **projection de contenu**.

### Un seul emplacement

Dans l'enfant, `<ng-content />` marque **l'endroit** où s'affichera le contenu :

```html
<!-- template de MechCard -->
<article class="card">
  <h3>{{ mech().name }}</h3>
  <ng-content />          <!-- ← ici -->
  <button type="button">Lancer</button>
</article>
```

Dans le parent, tout ce qu'on écrit **entre** les balises de l'enfant est projeté à cet endroit :

```html
<app-mech-card [mech]="mech">
  <span class="badge">Prêt au combat</span>    <!-- ← ce contenu va dans le <ng-content /> -->
</app-mech-card>
```

Le contenu projeté appartient **au parent** : il peut y utiliser ses propres signals, son `@if`, ses méthodes. La carte, elle, ne fait que lui réserver une place.

### Plusieurs emplacements : `select`

Un panneau avec un titre et un corps a besoin de **deux** emplacements. L'attribut `select` dit quel contenu va où, avec un **sélecteur CSS** :

```html
<!-- template d'un composant HudPanel -->
<section class="panel">
  <header>
    <ng-content select="[panel-title]" />   <!-- les éléments qui ont l'attribut panel-title -->
  </header>
  <ng-content />                            <!-- tout le reste -->
</section>
```

```html
<!-- dans le parent -->
<app-hud-panel>
  <h2 panel-title>Hangar</h2>                <!-- → va dans le header -->
  <p>Trois mechs en maintenance.</p>         <!-- → va dans le <ng-content /> sans select -->
</app-hud-panel>
```

`select` accepte un attribut (`[panel-title]`), une classe (`.actions`) ou un nom de balise (`h2`). Le `<ng-content />` **sans** `select` récupère tout ce qui n'a été pris par aucun autre.

### Un contenu par défaut

Ce qu'on écrit **à l'intérieur** de `<ng-content>` s'affiche quand le parent ne projette rien :

```html
<ng-content select="[panel-title]">Sans titre</ng-content>
```

> **`input()` ou `<ng-content>` ?** Une **donnée** que l'enfant met en forme lui-même → `input()`. Un **morceau d'interface** que le parent veut composer librement → `<ng-content>`. Les composants « coquilles » réutilisables (panneaux, cartes, fenêtres) reposent presque toujours sur la projection.

---

## 7. ★ Le cycle de vie : naître, vivre, mourir

### Quand un composant est-il créé et détruit ?

Un composant **naît** quand Angular l'ajoute à l'écran, et **meurt** quand il l'en retire. C'est le cas avec :
- un `@if` qui devient vrai, puis faux ;
- un élément ajouté puis retiré d'une liste parcourue par `@for` ;
- un changement de page avec le router (module 9).

Entre les deux, Angular appelle des méthodes à des moments précis, qu'on appelle les **hooks** (« crochets ») du cycle de vie :

```
 création ──► constructor()      les inputs n'ont PAS encore de valeur
         ──► ngOnInit()          les inputs ont leur 1ʳᵉ valeur — appelé UNE fois
         ──► (affichage)         afterNextRender() : le DOM est prêt (section 9)
             … le composant vit, les signals mettent l'écran à jour …
 retrait ──► ngOnDestroy()       dernier moment pour nettoyer — appelé UNE fois
```

### `ngOnInit` : agir une fois avec les inputs

```ts
import { Component, input, OnInit } from '@angular/core';

export class MechCard implements OnInit {
  readonly mech = input.required<Mech>();

  ngOnInit(): void {
    console.log(`[Hangar] carte de ${this.mech().name} affichée`); // ✅ l'input a sa valeur
  }
}
```

`implements OnInit` n'est pas obligatoire, mais il fait vérifier par TypeScript que la méthode est bien écrite (une faute de frappe comme `ngOninit` serait sinon ignorée en silence).

> Avec les signals, `ngOnInit` sert beaucoup moins qu'avant : tout ce qui **se calcule** à partir d'un input va dans un `computed`. On le garde pour une **action unique** au démarrage qui a besoin d'un input : un journal, un appel à une API avec l'id reçu (module 10)…

### Nettoyer : le problème des fuites mémoire

Un composant qui démarre quelque chose **qui continue tout seul** (un minuteur, un abonnement, un écouteur sur `window`) doit l'**arrêter** en mourant. Sinon :

```
@if vrai  → RadarPing créé   → setInterval démarre (1 balayage / s)
@if faux  → RadarPing retiré de l'écran… mais setInterval tourne TOUJOURS
@if vrai  → nouveau RadarPing → un 2ᵉ setInterval démarre
…         → 10 allers-retours = 10 minuteurs fantômes qui consomment de la mémoire et du processeur
```

C'est une **fuite mémoire** : le composant a disparu, mais ce qu'il a lancé vit encore. Tu retrouveras exactement ce problème avec les Observables RxJS (module 7) : c'est **la** cause n°1 des fuites dans les applications Angular.

### Deux façons de nettoyer

**`ngOnDestroy`**, le hook classique :

```ts
export class RadarPing implements OnDestroy {
  private readonly timerId = setInterval(() => this.pings.update((n) => n + 1), 1000);
  protected readonly pings = signal(0);

  ngOnDestroy(): void {
    clearInterval(this.timerId);
  }
}
```

**`DestroyRef`**, la façon moderne, qu'on privilégie :

```ts
import { Component, DestroyRef, inject, signal } from '@angular/core';

export class RadarPing {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly pings = signal(0);

  constructor() {
    const timerId = setInterval(() => this.pings.update((n) => n + 1), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timerId)); // le nettoyage, juste à côté du démarrage
  }
}
```

`inject(DestroyRef)` demande à Angular l'objet qui gère la destruction de **ce** composant (tu verras `inject()` en détail au module 6). `onDestroy` enregistre une fonction qu'Angular appellera au moment de la destruction.

Pourquoi le préférer ? Parce que le **démarrage et le nettoyage sont écrits côte à côte**. Avec `ngOnDestroy`, ils sont dans deux méthodes séparées, et il est facile d'oublier l'un en modifiant l'autre. C'est aussi `DestroyRef` qu'utilise `takeUntilDestroyed()`, l'outil RxJS que tu verras au module 19.

> 💡 Rappel du module 3 : un `effect` est nettoyé **automatiquement** à la destruction du composant. Tu n'as rien à faire pour lui.

---

## 8. ○ `viewChild()`, `viewChildren()`, `contentChild()` : accéder à un élément depuis la classe

Au module 2, `#ref` donnait accès à un élément **dans le template**. Parfois, c'est la **classe** qui en a besoin, par exemple pour donner le focus à un champ après une action. `viewChild()` renvoie un **signal** qui contient cet élément :

```ts
import { Component, ElementRef, viewChild } from '@angular/core';

export class RecruitForm {
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  protected recruit(): void {
    // … ajouter la recrue …
    this.nameInput().nativeElement.focus(); // le curseur revient dans le champ
  }
}
```

```html
<input #nameInput type="text" />
```

- `viewChild('nom')` cherche un `#nom` dans **son propre** template. `.required` garantit qu'il existe (sinon, erreur).
- `viewChild(MechCard)` cherche un **composant enfant** par sa classe, et donne accès à ses propriétés publiques.
- `viewChildren(MechCard)` renvoie **tous** les enfants de ce type, sous forme de tableau : `computed(() => this.cards().length)` les compte, et se met à jour quand le `@for` en ajoute ou en retire.
- `contentChild()` / `contentChildren()` font la même chose pour le **contenu projeté** par le parent (section 6) : par exemple, pour savoir si le parent a fourni un titre.

> ⚠️ C'est une **porte dérobée** : si tu t'en sers pour modifier les données d'un enfant, tu contournes la règle « les données descendent, les événements remontent ». Réserve-le au DOM (focus, défilement, mesure) et aux composants tiers qui l'exigent.

---

## 9. ○ `afterNextRender` et `afterEveryRender` : agir une fois le DOM dessiné

Certaines actions ont besoin que l'élément soit **réellement affiché** : mesurer sa taille, lancer une bibliothèque de graphiques ou de carte qui dessine dans un `<div>`, faire défiler jusqu'à un élément.

```ts
import { afterNextRender, Component, ElementRef, inject } from '@angular/core';

export class RadarScreen {
  private readonly host = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      // le DOM existe : on peut mesurer, ou brancher une bibliothèque tierce
      console.log('Hauteur de l’écran radar :', this.host.nativeElement.offsetHeight);
    });
  }
}
```

- **`afterNextRender`** : **une seule fois**, après le prochain affichage. C'est le cas courant (initialiser une bibliothèque).
- **`afterEveryRender`** : après **chaque** affichage. Rare et coûteux : à réserver aux cas où il faut resynchroniser quelque chose avec le DOM à chaque mise à jour.

Ces fonctions ne s'exécutent **que dans le navigateur**, jamais pendant un rendu côté serveur (SSR, module 25). C'est justement pour ça qu'on les utilise pour tout ce qui touche au DOM.

---

## 10. ○ `ngOnChanges`, et pourquoi tu l'écriras rarement

Avant les signals, un input était une simple propriété. Pour **réagir** à son changement (recalculer un statut, remettre un compteur à zéro), il fallait le hook `ngOnChanges`, appelé à chaque nouvelle valeur. Tu le croiseras partout dans le code existant :

```ts
// AVANT
export class MechCard implements OnChanges {
  @Input() mech!: Mech;
  armorStatus = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mech']) {
      this.armorStatus = this.mech.armor < 30 ? 'critique' : 'opérationnel';
    }
  }
}
```

Avec les inputs signals, les deux usages ont un remplaçant que tu connais déjà :

| Besoin | Avant | Maintenant |
| --- | --- | --- |
| Calculer une valeur à partir d'un input | `ngOnChanges` + une propriété | `computed(() => … this.mech() …)` |
| Un état local qui **repart** de l'input quand il change, mais reste modifiable | `ngOnChanges` qui réinitialise | `linkedSignal(() => this.mech().armor)` |
| Une action extérieure à chaque changement | `ngOnChanges` | `effect` (rarement nécessaire) |

Tu retrouves le `linkedSignal` du module 3 : quand le parent envoie un **autre** mech, l'état local repart de sa valeur, exactement comme ta charge autorisée repartait de la capacité du nouveau véhicule.

---

## 11. · Référence

- **`ng-template` + `ngTemplateOutlet`** : un morceau de template **non affiché**, qu'on peut afficher plus tard, ailleurs, ou plusieurs fois. _Quand y penser_ : un composant de liste réutilisable qui laisse le parent décider comment dessiner **chaque** ligne.
  ```html
  <ng-template #emptyState><p>Aucun mech dans le hangar.</p></ng-template>
  <ng-container [ngTemplateOutlet]="emptyState" />
  ```
- **Composants dynamiques** (`ViewContainerRef.createComponent()`, `NgComponentOutlet`) : créer un composant dont on ne connaît le type qu'**à l'exécution**. _Quand y penser_ : une fenêtre modale qui affiche n'importe quel composant, un tableau de bord dont l'utilisateur choisit les widgets.

---

> ### Legacy : ce que tu verras en entreprise (·)
>
> Avant Angular 17, inputs, outputs et requêtes de vue passaient par des **décorateurs**, et les valeurs n'étaient pas des signals :
>
> ```ts
> // AVANT
> export class MechCardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
>   @Input({ required: true }) mech!: Mech;
>   @Input({ transform: booleanAttribute }) compact = false;
>   @Output() launch = new EventEmitter<number>();
>
>   // two-way binding écrit à la main : un input + un output nommé « xxxChange »
>   @Input() power = 50;
>   @Output() powerChange = new EventEmitter<number>();
>
>   @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>; // disponible seulement dans ngAfterViewInit
>
>   ngOnChanges(changes: SimpleChanges) { /* réagir aux inputs */ }
>   ngAfterViewInit() { this.nameInput.nativeElement.focus(); }
>   ngOnDestroy() { /* nettoyer */ }
> }
> ```
>
> | Ancien | Moderne |
> | --- | --- |
> | `@Input() mech!: Mech` (propriété simple) | `mech = input.required<Mech>()` (signal) |
> | `@Output() launch = new EventEmitter<number>()` | `launch = output<number>()` |
> | `@Input() power` + `@Output() powerChange` | `power = model(50)` |
> | `@ViewChild('ref')` / `@ViewChildren` / `@ContentChild` | `viewChild('ref')` / `viewChildren()` / `contentChild()` |
> | `ngAfterViewInit` pour toucher au DOM | `afterNextRender()`, ou un `viewChild` lu plus tard |
> | `ngOnChanges(changes: SimpleChanges)` | `computed` ou `linkedSignal` à partir de l'input |
> | `ngOnDestroy` + un `Subject` pour se désabonner | `DestroyRef`, `takeUntilDestroyed()` (module 19) |
>
> Le `!` de `mech!: Mech` dit à TypeScript « fais-moi confiance, la valeur arrivera » : il désactive une vérification. `input.required()` n'en a pas besoin, et vérifie vraiment que le parent fournit la valeur.

---

## Exemple générique : le hangar des mechs

Voici un exemple complet qui réunit les notions du module. **Lis-le, ne le recopie pas** : l'exercice te demandera d'écrire le tien, sur un autre sujet. Les `§` renvoient aux sections de la leçon.

Les fichiers, tous dans le même dossier :

```
hangar/
├── mech.ts            le modèle, partagé par le parent et les enfants
├── hangar-bay.ts      le PARENT (+ hangar-bay.html)
├── mech-card.ts       un enfant : input, output, ng-content
├── power-dial.ts      un enfant : model
└── radar-ping.ts      un enfant : cycle de vie et nettoyage
```

```ts
// mech.ts : le modèle, dans son propre fichier, exporté
export interface Mech {
  id: number;
  name: string;
  armor: number; // blindage restant, en %
  ready: boolean;
}
```

```ts
// mech-card.ts
import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { Mech } from './mech';

@Component({
  selector: 'app-mech-card',
  // Petit composant : template inline (dans le fichier TS)
  template: `
    <article class="card" [class.compact]="compact()">
      <h3>{{ mech().name }}</h3>
      @if (!compact()) {
        <p>Blindage : {{ mech().armor }} % ({{ armorStatus() }})</p>
      }
      <!-- §6 : ici s'affiche le contenu que le parent glisse entre les balises -->
      <ng-content />
      <button type="button" [disabled]="!mech().ready" (click)="requestLaunch()">
        Lancer {{ mech().name }}
      </button>
    </article>
  `,
})
export class MechCard {
  // §3 : les données reçues du parent (des signals en lecture seule, publics)
  readonly mech = input.required<Mech>();
  readonly compact = input(false, { transform: booleanAttribute });

  // §4 : l'événement envoyé au parent, avec l'id du mech
  readonly launch = output<number>();

  // §3 : un input est un signal, donc on peut en dériver un computed
  protected readonly armorStatus = computed(() =>
    this.mech().armor < 30 ? 'critique' : 'opérationnel',
  );

  protected requestLaunch(): void {
    this.launch.emit(this.mech().id); // l'enfant DEMANDE, le parent DÉCIDE
  }
}
```

```ts
// power-dial.ts
import { Component, model } from '@angular/core';

const STEP = 10;

@Component({
  selector: 'app-power-dial',
  template: `
    <button type="button" aria-label="− 10 % de puissance" (click)="decrease()">− 10 %</button>
    <span>{{ power() }} %</span>
    <button type="button" aria-label="+ 10 % de puissance" (click)="increase()">+ 10 %</button>
  `,
})
export class PowerDial {
  // §5 : lu ET modifié par l'enfant ; chaque modification remonte au parent
  readonly power = model(50);

  protected decrease(): void {
    this.power.update((p) => Math.max(p - STEP, 0));
  }

  protected increase(): void {
    this.power.update((p) => Math.min(p + STEP, 100));
  }
}
```

```ts
// radar-ping.ts
import { Component, DestroyRef, inject, signal } from '@angular/core';

@Component({
  selector: 'app-radar-ping',
  template: `<p>Radar actif : {{ pings() }} balayages</p>`,
})
export class RadarPing {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly pings = signal(0);

  constructor() {
    // §7 : on démarre un minuteur à la création du composant…
    const timerId = setInterval(() => this.pings.update((n) => n + 1), 1000);
    console.log('[Radar] démarré');

    // … et on l'arrête à sa destruction. Sans ça : fuite mémoire
    this.destroyRef.onDestroy(() => {
      clearInterval(timerId);
      console.log('[Radar] arrêté');
    });
  }
}
```

```ts
// hangar-bay.ts : le PARENT
import { Component, signal } from '@angular/core';
import { Mech } from './mech';
import { MechCard } from './mech-card';
import { PowerDial } from './power-dial';
import { RadarPing } from './radar-ping';

@Component({
  selector: 'app-hangar-bay',
  // §2 : pour utiliser des composants enfants, on les importe
  imports: [MechCard, PowerDial, RadarPing],
  templateUrl: './hangar-bay.html',
})
export class HangarBay {
  // Le parent POSSÈDE les données : lui seul les modifie
  protected readonly mechs = signal<Mech[]>([
    { id: 1, name: 'Titan', armor: 90, ready: true },
    { id: 2, name: 'Faucon', armor: 25, ready: true },
    { id: 3, name: 'Golem', armor: 60, ready: false },
  ]);
  protected readonly compactView = signal(false);
  protected readonly power = signal(50);
  protected readonly radarOn = signal(true);
  protected readonly launchLog = signal<string[]>([]);

  // §4 : réagit à l'output de l'enfant ; $event contient l'id envoyé
  protected launchMech(id: number): void {
    const mech = this.mechs().find((m) => m.id === id);
    if (!mech) {
      return;
    }
    this.mechs.update((list) => list.map((m) => (m.id === id ? { ...m, ready: false } : m)));
    this.launchLog.update((log) => [...log, `${mech.name} lancé à ${this.power()} %`]);
  }

  protected toggleCompact(): void {
    this.compactView.update((value) => !value);
  }

  protected toggleRadar(): void {
    this.radarOn.update((value) => !value);
  }
}
```

```html
<!-- hangar-bay.html -->
<h2>Hangar</h2>

<!-- §5 : two-way binding. Le parent donne power, et récupère chaque modification -->
<app-power-dial [(power)]="power" />
<p>Puissance des réacteurs : {{ power() }} %</p>

<button type="button" [attr.aria-pressed]="compactView()" (click)="toggleCompact()">
  Vue compacte
</button>

@for (mech of mechs(); track mech.id) {
  <!-- §3 : [mech] et [compact] descendent ; §4 : (launch) remonte -->
  <app-mech-card [mech]="mech" [compact]="compactView()" (launch)="launchMech($event)">
    <!-- §6 : contenu projeté dans le <ng-content /> de la carte -->
    @if (mech.ready) {
      <span class="badge">Prêt au combat</span>
    }
  </app-mech-card>
}

<ul>
  @for (entry of launchLog(); track $index) {
    <li>{{ entry }}</li>
  }
</ul>

<!-- §7 : @if crée et détruit le composant, ce qui déclenche son cycle de vie -->
<button type="button" [attr.aria-pressed]="radarOn()" (click)="toggleRadar()">Radar</button>
@if (radarOn()) {
  <app-radar-ping />
}
```

**Ce qu'il faut remarquer :**

1. **Un seul propriétaire des données** : `mechs`, `power` et `radarOn` sont des signals du **parent**. Les enfants reçoivent, affichent, et préviennent.
2. **`MechCard` ne connaît pas le hangar** : elle reçoit un mech, émet `launch`, et c'est tout. On pourrait l'utiliser sur une autre page, avec un autre parent qui ferait autre chose du clic.
3. **Le parent ne sait pas comment la carte est dessinée** : il lui passe des données et un badge projeté, la carte s'occupe du reste. Chacun sa responsabilité.
4. **`[(power)]="power"`** passe le signal **sans parenthèses**, pour que l'enfant puisse y écrire. Le parent n'a aucune méthode à écrire pour suivre les changements.
5. **Le radar se nettoie tout seul** : clique plusieurs fois sur « Radar » avec la console ouverte. Chaque « démarré » est suivi d'un « arrêté », et il n'y a jamais deux minuteurs en même temps.
6. **Les inputs et outputs sont publics** (`readonly`), tout le reste est `protected` ou `private`.

---

## Exercice : le Registre de l'escouade

> ⚠️ Ne regarde pas de solution : c'est à toi de jouer. Demande-moi des indices si tu bloques.

**Objectif** : le commandement veut un registre des soldats de l'escouade. On y voit chaque soldat sur une carte, on peut le soigner, le déployer en mission ou le renvoyer, et filtrer la liste par spécialité. Tu vas découper l'écran en **un parent et quatre enfants**.

```
SquadRoster (le parent : possède la liste des soldats)
├── RoleFilter            model()       : le filtre par spécialité
├── HudPanel              <ng-content>  : un panneau réutilisable avec un titre
│   └── SoldierCard × n   input / output : une carte par soldat
│       └── MissionTimer  cycle de vie  : le chrono d'un soldat en mission
```

### Consignes

1. **Créer le widget du module** :
   - un dossier `src/app/widgets/04-communication/`. Génère dedans le parent `squad-roster` avec la CLI, puis les enfants au fur et à mesure (`soldier-card`, `role-filter`, `hud-panel`, `mission-timer`), tous dans ce même dossier `04-communication/` ;
   - une **route lazy** `04-communication`, et une carte pour le module 4 sur la page d'accueil (titre : « Communication entre composants ») ;
   - un `<h1>` « Registre de l'escouade » dans le parent.

2. **Le modèle**, dans son propre fichier `soldier.ts`, **exporté** (parent et enfants en ont besoin) :
   - un type `Role` : `'assault' | 'medic' | 'sniper' | 'engineer'` ;
   - une interface `Soldier` avec `id`, `name`, `role`, `health` (de 0 à 100) et `deployed` (en mission ou non).
   - Dans le parent, un signal `soldiers` avec 5 soldats de départ, de spécialités et de santés différentes (au moins un sous 30).

3. **`SoldierCard` : afficher (`input`)** :
   - un input **requis** `soldier` ;
   - la carte affiche le nom, la spécialité, la santé (une barre, tu sais faire) ;
   - un `computed` **dans la carte**, `healthStatus`, qui vaut « critique » sous 30, « blessé » sous 70, « opérationnel » sinon, affiché sur la carte ;
   - un input `compact` (booléen, faux par défaut, avec `booleanAttribute`) : en mode compact, la carte n'affiche que le nom et la santé. Dans le parent, un bouton « Vue compacte » bascule toutes les cartes.

4. **`SoldierCard` : agir (`output`)** :
   - trois boutons sur la carte : « Soigner », « Déployer » / « Rappeler » (le texte dépend de `deployed`), et « Renvoyer » ;
   - chacun **émet un output** avec l'id du soldat. **La carte ne modifie jamais le soldat elle-même.**
   - Le parent réagit : soigner ajoute 20 points de santé (jamais plus de 100), déployer / rappeler inverse `deployed`, renvoyer retire le soldat de la liste.
   - Réfléchis à `map` ou `filter` pour chaque action (module 2), et à `set` ou `update` (module 3).

5. **`RoleFilter` : filtrer (`model`)** :
   - un composant avec un bouton par spécialité, plus un bouton « Tous » ;
   - un `model` `role`, qui vaut une spécialité ou `'all'` ;
   - le bouton actif a `aria-pressed` ;
   - dans le parent : un signal `selectedRole`, relié au filtre avec `[( )]`, et un `computed` `visibleSoldiers` utilisé par le `@for`.

6. **`HudPanel` : un panneau réutilisable (`<ng-content>`)** :
   - deux emplacements : un **titre** (avec `select`) et le **contenu** ;
   - un titre par défaut si le parent n'en fournit pas ;
   - utilise-le au moins deux fois dans le parent : un panneau « Filtres » autour du `RoleFilter`, un panneau « Soldats » autour des cartes.

7. **`MissionTimer` : le cycle de vie** :
   - affiché **dans la carte**, seulement quand le soldat est déployé (`@if`) ;
   - il reçoit le nom du soldat en input, et affiche les secondes écoulées depuis le déploiement (`setInterval` + un signal) ;
   - au démarrage, il écrit dans la console « Chrono démarré pour X » : attention, il a besoin de l'input, donc **pas dans le constructeur** ;
   - à sa destruction, il **arrête le minuteur** et écrit « Chrono arrêté pour X ». À toi de choisir entre `ngOnDestroy` et `DestroyRef`, et de justifier ton choix.

8. **Vérifier** : `npm test` et `npm run build` passent.
   - ⚠️ Le test généré pour `SoldierCard` (et `MissionTimer`) **va échouer** : un composant avec un input requis ne peut pas être créé sans valeur (NG0950). Dans le `beforeEach` du test, juste après `TestBed.createComponent(...)`, fournis la valeur avec `fixture.componentRef.setInput('soldier', …)`. On approfondira les tests au module 24.

### Critères de réussite

- [ ] La carte du module 4 sur l'accueil mène au registre, sans erreur dans la console
- [ ] **Seul le parent modifie `soldiers`** : aucun enfant ne fait de `set` ou d'`update` sur une donnée qui ne lui appartient pas
- [ ] La carte n'a aucune méthode qui connaît la liste des soldats : elle reçoit **un** soldat et émet des ids
- [ ] Le filtre fonctionne avec `[( )]`, et le parent n'a **aucune** méthode pour suivre le filtre
- [ ] `HudPanel` est utilisé au moins deux fois, avec des titres différents, et affiche son titre par défaut quand on n'en fournit pas
- [ ] Déployer puis rappeler un soldat plusieurs fois : chaque « Chrono démarré » est suivi d'un « Chrono arrêté », et il n'y a jamais de minuteur fantôme
- [ ] Renvoyer un soldat **déployé** arrête aussi son chrono (pourquoi ? réfléchis au cycle de vie)
- [ ] Inputs, outputs et models sont publics (`readonly`) ; le reste est `protected` ou `private`
- [ ] Accessibilité : les boutons des cartes ont un nom qui précise le soldat (« Soigner Kira »), les filtres ont `aria-pressed`, chaque barre de santé a ses attributs ARIA
- [ ] `npm test` et `npm run build` passent

### Bonus (facultatif)

- **`viewChild`** : ajoute un petit formulaire « Recruter » dans le parent (un champ pour le nom, une liste déroulante ou des boutons pour la spécialité). Après chaque recrutement, le champ est vidé et **reprend le focus** grâce à `viewChild`, pour enchaîner les recrues au clavier.
- **`viewChildren`** : affiche « 5 cartes affichées » en comptant les `SoldierCard` réellement présentes à l'écran, avec `viewChildren` et un `computed`. Compare avec `visibleSoldiers().length` : dans quel cas les deux pourraient-ils différer ?
- **`linkedSignal` à partir d'un input** : dans la carte, un champ « Note du sergent » local, qui repart de vide quand la carte reçoit un **autre** soldat. (Indice : section 10.)

Quand tu as fini (ou si tu bloques), dis-le-moi : je relirai ton code.
