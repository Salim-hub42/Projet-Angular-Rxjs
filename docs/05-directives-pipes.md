# Module 5 — [Angular] Directives et pipes

> Durée estimée : 4–5 h · Widget : l'Armurerie de l'escouade (exercice, à coder toi-même)

## Ce que tu sauras faire à la fin

- Comprendre ce qu'est une **directive**, et reconnaître celles que tu utilises déjà sans le savoir
- Écrire une **directive d'attribut** : changer l'apparence ou le comportement d'un élément existant, avec l'objet `host`
- **Formater** des dates, des prix, des nombres et des pourcentages avec les **pipes natifs**, en français
- Écrire tes **propres pipes**, avec ou sans paramètre
- Savoir pourquoi un pipe est **pur** par défaut, et ce que ça change
- Choisir entre un **pipe**, un `computed`, une **directive** et un **composant**

| Priorité    | Notions                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ★ cœur      | directive d'attribut custom (objet `host`, `input()` sur une directive), pipes natifs (`date`, `currency`, `number`, `percent`, `json`, `async`, `keyvalue`, `titlecase`), écrire un pipe custom |
| ○ courant   | pipes purs vs impurs, `hostDirectives` (composition)                                                                                                     |
| · référence | directive structurelle custom (rare depuis le control flow)                                                                                              |

Fil rouge des exemples : **le journal de bord** du vaisseau de l'escouade, où chaque entrée raconte un événement du voyage.

---

## 1. ★ Une directive, c'est quoi ?

### Un comportement qu'on colle sur un élément

Une **directive** est une classe qui **ajoute un comportement** à un élément du template. Elle n'a **pas de template à elle** : elle travaille sur l'élément où on la pose, qu'on appelle son **élément hôte**.

Il en existe trois sortes :

| Sorte | Ce qu'elle fait | Exemples |
| --- | --- | --- |
| **Composant** | une directive **avec un template** : elle dessine quelque chose | `SoldierCard`, `HudPanel`… tous tes composants |
| **Directive d'attribut** | change l'**apparence** ou le **comportement** d'un élément qui existe déjà | `ngSrc` (`NgOptimizedImage`), `routerLink` |
| **Directive structurelle** | **ajoute ou retire** des éléments du DOM | `*ngIf`, `*ngFor` (l'ancienne syntaxe, remplacée par `@if` / `@for`) |

Tu en utilises donc depuis le module 1 sans le savoir : `ngSrc` sur ta bannière, c'est la directive `NgOptimizedImage` posée sur un `<img>`. L'`<img>` reste un `<img>`, la directive lui ajoute un comportement (chargement optimisé, vérification des dimensions).

```
<img ngSrc="..." />
 │     │
 │     └── la directive : un comportement en plus
 └── l'élément hôte : il existe déjà, la directive ne le remplace pas
```

### Directive ou composant ?

- Tu veux **dessiner** quelque chose (une carte, un panneau) → un **composant**.
- Tu veux **ajouter un comportement réutilisable** à n'importe quel élément (une lueur au survol, un focus automatique, une info-bulle) → une **directive d'attribut**.

> 🧠 Avant d'écrire une directive, demande-toi si un simple binding suffit : `[class.active]="..."` ou `(mouseenter)="..."` directement dans le template. La directive vaut le coup quand tu **répètes** ce comportement à plusieurs endroits.

---

## 2. ★ Écrire une directive d'attribut

### La générer

```bash
ng generate directive widgets/05-directives-pipes/rarity
```

La CLI crée deux fichiers : `rarity.ts` (la directive) et `rarity.spec.ts` (son test).

```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[appRarity]',
})
export class Rarity {}
```

Le **sélecteur** est entre crochets : `[appRarity]` veut dire « tout élément qui porte l'**attribut** `appRarity` ». C'est la même syntaxe que le `select="[panel-title]"` de ton `HudPanel`. Le préfixe `app` évite les collisions avec les attributs HTML.

Pour l'utiliser, on l'**importe** dans le composant, comme un composant enfant, puis on la pose comme un attribut :

```ts
@Component({
  imports: [Rarity],
  // ...
})
```

```html
<article appRarity>...</article>
```

### L'objet `host` : agir sur l'élément hôte

La directive n'a pas de template. Pour modifier son élément hôte, elle déclare des **bindings** dans l'objet `host` de son décorateur. Ce sont **les mêmes bindings** que dans un template, écrits sous forme de texte :

```ts
@Directive({
  selector: '[appStatusGlow]',
  host: {
    class: 'glow',                               // une classe FIXE, toujours présente
    '[class.glow--critical]': 'isCritical()',    // [class.x] : une classe selon une condition
    '[style.outline-width.px]': 'thickness()',   // [style.x] : un style
    '[attr.data-status]': 'appStatusGlow()',     // [attr.x] : un attribut HTML
    '(mouseenter)': 'activate()',                // (event) : écouter un événement de l'hôte
  },
})
```

| Dans un template | Dans `host` | Ce que ça fait sur l'élément hôte |
| --- | --- | --- |
| `class="glow"` | `class: 'glow'` | ajoute une classe fixe |
| `[class.active]="..."` | `'[class.active]': '...'` | ajoute ou retire une classe |
| `[style.color]="..."` | `'[style.color]': '...'` | applique un style |
| `[attr.aria-x]="..."` | `'[attr.aria-x]': '...'` | pose un attribut |
| `(click)="..."` | `'(click)': '...'` | écoute un événement |

Les expressions (à droite) sont lues **dans la classe de la directive** : `isCritical()`, `activate()`… sont des membres de la directive.

> Au module 2, tu as stylé l'élément hôte d'un composant en CSS avec `:host`. L'objet `host`, lui, agit sur ce même élément depuis la **classe**, avec des bindings. Il existe aussi sur `@Component`, et il y marche exactement pareil.

### Recevoir une valeur : `input()` sur une directive

Une directive reçoit des inputs **exactement comme un composant**. L'astuce : donner à l'input **le même nom que le sélecteur**. Un seul binding pose alors la directive **et** lui donne sa valeur :

```ts
export class StatusGlow {
  readonly appStatusGlow = input<LogStatus>('nominal');
}
```

```html
<article [appStatusGlow]="entry.status">...</article>
<!--      └── pose la directive ET donne la valeur de l'input -->
```

### Un état interne : un signal

Pour une lueur qui s'intensifie au survol, la directive garde un petit état : un **signal**, comme dans un composant.

```ts
@Directive({
  selector: '[appStatusGlow]',
  host: {
    '[class.glow--active]': 'active()',
    '(mouseenter)': 'activate()',
    '(mouseleave)': 'deactivate()',
    '(focusin)': 'activate()',     // ← le clavier aussi !
    '(focusout)': 'deactivate()',
  },
})
export class StatusGlow {
  protected readonly active = signal(false);

  protected activate(): void {
    this.active.set(true);
  }

  protected deactivate(): void {
    this.active.set(false);
  }
}
```

> ♿ **Accessibilité** : un effet au **survol** n'existe pas pour quelqu'un qui navigue **au clavier**. Doublé de `focusin` / `focusout`, l'effet s'applique aussi quand le focus arrive sur l'élément **ou sur un de ses enfants** (un bouton, un `<summary>`…). C'est pour ça qu'on préfère `focusin` à `focus`, qui ne réagit qu'à l'élément lui-même.

### ⚠️ Une directive n'a pas de styles

`@Directive` n'a ni `template` ni `styleUrl`. La directive **pose des classes**, mais le CSS de ces classes doit être écrit **ailleurs** :

- dans le **SCSS du composant** qui utilise la directive : l'élément hôte fait partie de **son** template, donc l'encapsulation (module 2) le laisse le styler ;
- ou dans les **styles globaux** (`styles.scss`), si la directive sert dans toute l'application.

### Une autre façon (moins conseillée) : `ElementRef`

Tu croiseras aussi des directives qui touchent l'élément **directement** :

```ts
private readonly el = inject(ElementRef);

constructor() {
  this.el.nativeElement.style.backgroundColor = 'yellow';
}
```

Ça marche, mais c'est **impératif** : tu modifies le DOM à la main, et Angular ne le sait pas. Les bindings de `host` sont **déclaratifs** : tu décris le résultat, Angular le maintient à jour quand les signals changent. Préfère `host`, et garde `ElementRef` pour les cas où il faut vraiment l'élément (mesurer sa taille, lui donner le focus).

---

## 3. ★ Les pipes natifs

### Le principe

Un **pipe** transforme une valeur **pour l'affichage**, directement dans le template, avec la barre verticale `|` :

```html
{{ valeur | nomDuPipe }}
{{ valeur | nomDuPipe: paramètre1 : paramètre2 }}
{{ valeur | pipe1 | pipe2 }}          <!-- chaînés : de gauche à droite -->
```

```
entry.date  ──►  | date: 'd MMMM y'  ──►  "3 novembre 2026"
(la donnée)        (la transformation)      (le texte affiché)
```

La donnée **ne change pas** : `entry.date` reste `'2026-11-03T21:43:00'` dans ta classe. Seul l'**affichage** est transformé. C'est tout l'intérêt : tes données restent brutes (faciles à calculer, trier, envoyer à une API), et la mise en forme vit dans le template.

Chaque pipe s'**importe** dans le composant, comme une directive. Les pipes natifs viennent de `@angular/common` :

```ts
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  imports: [CurrencyPipe, DatePipe],
  // ...
})
```

> ⚠️ Pas de `CommonModule` : il importe **tous** les pipes et directives d'un coup, même ceux que tu n'utilises pas. On importe seulement ce dont le template a besoin.

> ⚠️ **Priorité** : le pipe passe **après** les opérateurs (`+`, `&&`, `??`…) mais **avant** le ternaire. Mets des parenthèses en cas de doute : `{{ (isLate ? 'Retard' : 'À l’heure') | uppercase }}`.

### D'abord : passer l'application en français

Par défaut, Angular formate **à l'américaine** : `Nov 3, 2026`, `$12,500.50`. Pour le français, trois réglages dans `app.config.ts` :

```ts
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';

registerLocaleData(localeFr); // 1. charge les règles du français (noms des mois, séparateurs…)

export const appConfig: ApplicationConfig = {
  providers: [
    // ... les providers existants
    { provide: LOCALE_ID, useValue: 'fr-FR' },          // 2. la langue de l'application
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }, // 3. la monnaie par défaut du pipe currency
  ],
};
```

- **`registerLocaleData`** : Angular n'embarque que les règles de l'anglais américain. Celles du français s'importent à part.
- **`LOCALE_ID`** : dit aux pipes quelle langue utiliser.
- **`DEFAULT_CURRENCY_CODE`** : sans lui, `currency` affiche des dollars, même en français.

Tu verras les `providers` en détail au module 6. Pour l'instant, retiens : « une ligne par réglage global ».

### Les pipes à connaître

Toutes les sorties ci-dessous sont **en français** (`fr-FR`, euro), vérifiées avec Angular 22.

| Pipe | Exemple | Affiche |
| --- | --- | --- |
| `date` | `{{ '2026-11-03T21:43:00' \| date }}` | `3 nov. 2026` |
| | `\| date: 'd MMMM y'` | `3 novembre 2026` |
| | `\| date: 'fullDate'` | `mardi 3 novembre 2026` |
| | `\| date: 'short'` | `03/11/2026 21:43` |
| | `\| date: 'HH:mm'` | `21:43` |
| `currency` | `{{ 12500.5 \| currency }}` | `12 500,50 €` |
| | `\| currency: 'USD'` | `12 500,50 $US` |
| `number` | `{{ 384400.75 \| number }}` | `384 400,75` |
| | `\| number: '1.0-0'` | `384 401` (arrondi, sans décimale) |
| | `{{ 3.14159 \| number: '1.0-2' }}` | `3,14` |
| `percent` | `{{ 0.18 \| percent }}` | `18 %` |
| | `{{ 0.256 \| percent: '1.1-1' }}` | `25,6 %` |
| `titlecase` | `{{ 'patrouille de routine' \| titlecase }}` | `Patrouille De Routine` |
| `uppercase` / `lowercase` | `{{ 'alerte' \| uppercase }}` | `ALERTE` |

Quelques précisions :

- **`date`** accepte un objet `Date`, un nombre (millisecondes) ou une **chaîne ISO**. Les lettres du format : `d` jour, `MM` mois en chiffres, `MMM` mois abrégé, `MMMM` mois en toutes lettres, `y` année, `HH` heures (0–23), `mm` minutes, `EEEE` jour de la semaine.
- **`number`** : le nom du pipe est `number`, mais la classe à importer s'appelle **`DecimalPipe`**. Son paramètre `'1.0-2'` se lit « au moins **1** chiffre avant la virgule, entre **0** et **2** après ». `percent` accepte le même paramètre.
- **`percent`** attend un nombre **entre 0 et 1** : `0.18` → `18 %`. Si ta donnée vaut déjà `18`, le pipe affichera `1 800 %`.
- **`titlecase`** met une majuscule à **chaque mot**, y compris « de », « du »… Pratique pour des noms propres, moins pour des phrases.
- Le français sépare les milliers par une **espace insécable** : `12 500,50 €` ne sera jamais coupé en fin de ligne.

### `keyvalue` : parcourir un objet

`@for` sait parcourir un **tableau**, pas un objet. `keyvalue` transforme un objet en tableau de paires `{ key, value }` :

```ts
systems = { moteur: 35, coque: 80, bouclier: 10 };
```

```html
@for (system of systems | keyvalue; track system.key) {
  <li>{{ system.key }} : {{ system.value }} %</li>
}
```

```
{ moteur: 35, coque: 80, bouclier: 10 }
        │  | keyvalue
        ▼
[ { key: 'bouclier', value: 10 },     ← triées par clé, dans l'ordre alphabétique
  { key: 'coque',    value: 80 },
  { key: 'moteur',   value: 35 } ]
```

Les paires sont **triées par clé** par défaut. Pour garder l'ordre d'origine de l'objet : `systems | keyvalue: null`.

### `json` : pour déboguer

```html
<pre>{{ entry | json }}</pre>
```

Affiche l'objet entier, mis en forme. C'est un outil de **développement** : pratique pour vérifier une donnée, à retirer (ou cacher dans un `<details>`) avant de livrer.

### `async` : attendre une Promise (et bientôt un Observable)

Une **Promise** est une valeur qui arrivera **plus tard** (une réponse de serveur, un minuteur). Le pipe `async` attend qu'elle soit résolue, puis affiche sa valeur. **Avant**, il renvoie `null` : on le combine donc avec un `@if` :

```ts
protected readonly baseMessage = new Promise<string>((resolve) =>
  setTimeout(() => resolve('Ravitaillement prévu au prochain spatioport'), 1500),
);
```

```html
@if (baseMessage | async; as message) {
  <p>{{ message }}</p>
} @else {
  <p>Communication avec la base…</p>
}
```

```
t = 0 s     baseMessage | async  →  null        → @else : « Communication avec la base… »
t = 1,5 s   la Promise est résolue
            baseMessage | async  →  'Ravitaillement…'  → le message s'affiche
```

> ⚠️ **Le piège** : la Promise doit être créée **une seule fois**, dans une **propriété**. Si tu écris `{{ loadMessage() | async }}` avec une **méthode** qui crée une nouvelle Promise à chaque appel, Angular reçoit une nouvelle Promise à chaque rafraîchissement, et le pipe recommence à attendre… sans fin.

`async` sert surtout aux **Observables** RxJS (module 7 et suivants) : il s'y abonne, affiche chaque nouvelle valeur, et **se désabonne tout seul** quand le composant est détruit. Tu le reverras souvent, avec son concurrent signal, `toSignal` (module 19).

---

## 4. ★ Écrire un pipe custom

### Le générer

```bash
ng generate pipe widgets/05-directives-pipes/rarity-label
```

La CLI crée `rarity-label-pipe.ts` et son test. Pour un pipe, le nom de classe garde le suffixe `Pipe` : `RarityLabelPipe`.

### Un pipe sans paramètre

Un pipe, c'est une classe avec le décorateur `@Pipe` et une méthode **`transform`** : elle **reçoit** la valeur de gauche du `|` et **renvoie** ce qu'on affiche.

```ts
import { Pipe, PipeTransform } from '@angular/core';
import { LogStatus } from './log-entry';

const STATUS_LABELS: Record<LogStatus, string> = {
  nominal: 'Nominal',
  warning: 'Alerte',
  critical: 'Critique',
};

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: LogStatus): string {
    return STATUS_LABELS[status];
  }
}
```

```html
{{ entry.status | statusLabel }}   <!-- 'critical' → « Critique » -->
```

- **`name`** : le nom utilisé dans le template, en camelCase, sans tiret.
- **`implements PipeTransform`** : fait vérifier par TypeScript que `transform` existe, comme `implements OnInit` au module 4.
- **`Record<LogStatus, string>`** : un objet qui a **une entrée pour chaque** valeur de `LogStatus`. Si tu ajoutes un statut au type et que tu oublies son libellé, TypeScript te le signale.

### Un pipe avec paramètre

Les paramètres écrits après `:` dans le template arrivent comme **paramètres suivants** de `transform` :

```ts
const DEFAULT_MAX_LENGTH = 20;

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(text: string, maxLength = DEFAULT_MAX_LENGTH): string {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength)}…`;
  }
}
```

```html
{{ entry.title | truncate }}        <!-- maxLength = 20 (la valeur par défaut) -->
{{ entry.title | truncate: 30 }}    <!-- maxLength = 30 -->
```

```
{{ entry.title | truncate: 30 }}
   └─ text ──┘            └ maxLength
```

### Chaîner tes pipes avec les pipes natifs

Les pipes s'exécutent **de gauche à droite**, et chacun reçoit le résultat du précédent :

```html
{{ entry.title | truncate: 30 | titlecase }}
```

```
'avarie du réacteur principal pendant le saut'
   │ | truncate: 30
   ▼
'avarie du réacteur principal p…'
   │ | titlecase
   ▼
'Avarie Du Réacteur Principal P…'
```

L'ordre compte surtout quand les **types** changent : `currency` renvoie une **chaîne**. Un pipe qui attend un **nombre** doit donc passer **avant** lui, jamais après.

### Bonne pratique : la logique dans une fonction

La documentation d'Angular conseille de sortir la transformation dans une **fonction exportée**, et de la faire appeler par `transform`. Tu pourras ainsi réutiliser la même logique **hors d'un template** (dans un `computed`, un service…), sans passer par le pipe :

```ts
export function toStatusLabel(status: LogStatus): string {
  return STATUS_LABELS[status];
}

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: LogStatus): string {
    return toStatusLabel(status);
  }
}
```

### Pipe, `computed` ou méthode ?

| Besoin | Outil | Pourquoi |
| --- | --- | --- |
| Une **mise en forme réutilisable** dans plusieurs composants (libellé, durée, unité) | **pipe** | écrit une fois, utilisé partout avec `\|` |
| Une **valeur dérivée** propre à **un** composant (un total, une liste filtrée) | **`computed`** | lié à l'état du composant, recalculé quand ses signals changent |
| Un calcul dans `{{ maMethode() }}` | **à éviter** | une méthode est rappelée à **chaque** rafraîchissement ; un pipe pur et un `computed` gardent leur résultat en mémoire |

> 💡 Au module 4, tu avais écrit deux fois le calcul `minutes:secondes` (dans `TrackCard` et dans le parent). C'est exactement le cas d'un pipe : `{{ duration | trackDuration }}`, écrit une fois, utilisé partout.

---

## 5. ○ Pipes purs et impurs

### Pur : recalculé seulement si la valeur change

Par défaut, un pipe est **pur** : Angular ne rappelle `transform` que si la **valeur reçue change**.

- Pour un **nombre**, un **texte** ou un **booléen** : quand la valeur change (`20` → `30`).
- Pour un **objet** ou un **tableau** : seulement quand c'est un **nouvel objet** (une nouvelle référence). Si tu modifies l'intérieur de l'objet existant, le pipe ne voit rien.

```
liste = [A, B]           | monPipe  →  calculé une fois
liste.push(C)            même tableau, modifié à l'intérieur  →  ❌ pipe PAS rappelé : l'affichage est faux
liste = [...liste, C]    NOUVEAU tableau                       →  ✅ pipe rappelé
```

C'est l'avantage d'un pipe pur : **gratuit** tant que la donnée ne change pas. Et ça tombe bien : avec les signals, tu fais déjà des **mises à jour immuables** (`update` avec `map`, `filter`, `{ ...objet }`). Chaque modification crée un nouvel objet, donc tes pipes purs se mettent toujours à jour.

### Impur : recalculé à chaque rafraîchissement

```ts
@Pipe({ name: 'joinNamesImpure', pure: false })
```

Un pipe **impur** est rappelé à **chaque** rafraîchissement de l'écran, même si rien n'a changé. Il voit donc les modifications à l'intérieur des objets… mais il coûte cher. `keyvalue` et `async` sont impurs, parce qu'ils doivent surveiller l'intérieur d'un objet ou l'arrivée d'une valeur.

> 🧠 N'écris un pipe impur que si tu n'as vraiment pas le choix. La plupart du temps, la bonne réponse est : **ne mute pas tes données**, crée un nouvel objet. Par convention, on met `Impure` dans le nom pour prévenir les autres développeurs.

---

## 6. ○ `hostDirectives` : composer des comportements

Tu as écrit une directive `StatusGlow`, et tu veux que **toutes** les cartes d'un composant `LogCard` aient ce comportement, sans que le parent pense à poser l'attribut à chaque fois. `hostDirectives` applique une directive **depuis la classe** du composant :

```ts
@Component({
  selector: 'app-log-card',
  hostDirectives: [StatusGlow],
  // ...
})
export class LogCard {}
```

C'est comme si chaque `<app-log-card>` portait `appStatusGlow`. Par défaut, les inputs de la directive **ne sont pas** exposés : le parent ne peut pas écrire `[appStatusGlow]`. Pour les ouvrir (et les renommer au passage) :

```ts
hostDirectives: [{ directive: StatusGlow, inputs: ['appStatusGlow: status'] }],
```

```html
<app-log-card [status]="entry.status" />
```

_Quand y penser_ : dans une bibliothèque de composants, pour donner le même comportement (focus, info-bulle, gestion du clavier) à plusieurs composants sans le recopier. Les bibliothèques comme Angular CDK s'en servent beaucoup.

---

## 7. · Référence : directive structurelle custom

Une directive **structurelle** ajoute ou retire des éléments : elle reçoit le morceau de template (`TemplateRef`) et décide combien de fois l'afficher (`ViewContainerRef`). On l'utilise avec une étoile : `<li *appRepeat="3">`.

_Quand y penser_ : presque jamais en application. Depuis `@if`, `@for` et `@switch`, les cas courants sont couverts. Tu en verras surtout **dans du code ancien** (`*ngIf`, `*ngFor`) et dans certaines bibliothèques.

---

> ### Legacy : ce que tu verras en entreprise (·)
>
> Avant Angular 17–20, les directives et les pipes étaient déclarés dans un `NgModule`, et les bindings de l'hôte passaient par des **décorateurs** :
>
> ```ts
> // AVANT
> @Directive({ selector: '[appHighlight]', standalone: false }) // déclarée dans un NgModule
> export class HighlightDirective {
>   @Input() appHighlight = '';
>   @HostBinding('class.active') active = false;
>
>   constructor(private el: ElementRef) {}
>
>   @HostListener('mouseenter') onEnter() {
>     this.active = true;
>   }
> }
> ```
>
> ```html
> <!-- AVANT : les directives ngClass, ngStyle, et les directives structurelles -->
> <div [ngClass]="{ active: isActive, critical: level === 'critical' }"></div>
> <div [ngStyle]="{ color: textColor }"></div>
> <p *ngIf="entries.length > 0; else empty">...</p>
> <ng-template #empty><p>Aucune entrée</p></ng-template>
> <li *ngFor="let entry of entries; trackBy: trackById">{{ entry.title }}</li>
> <ng-container *ngIf="message$ | async as message">{{ message }}</ng-container>
> ```
>
> | Ancien | Moderne |
> | --- | --- |
> | `@HostBinding('class.active') active` | `host: { '[class.active]': 'active()' }` |
> | `@HostListener('mouseenter') onEnter()` | `host: { '(mouseenter)': 'onEnter()' }` |
> | `@Input() appHighlight` sur une directive | `appHighlight = input()` |
> | `constructor(private el: ElementRef)` | `private el = inject(ElementRef)` |
> | `[ngClass]="{ active: isActive }"` | `[class.active]="isActive()"` |
> | `[ngStyle]="{ color: c }"` | `[style.color]="c()"` |
> | `*ngIf="cond; else tpl"` | `@if (cond) { } @else { }` |
> | `*ngFor="let x of list; trackBy: fn"` | `@for (x of list; track x.id) { }` |
> | `*ngIf="obs$ \| async as v"` | `@if (obs$ \| async; as v)`, ou `toSignal` (module 19) |
> | `CommonModule` importé en entier | seulement les pipes utilisés (`DatePipe`, `AsyncPipe`…) |
>
> Remarque : les **pipes**, eux, n'ont presque pas changé. Un `@Pipe` avec `transform` s'écrit pareil depuis Angular 2, seule la déclaration dans un `NgModule` a disparu.

---

## Exemple générique : le journal de bord

Voici un exemple complet qui réunit les notions du module. **Lis-le, ne le recopie pas** : l'exercice te demandera d'écrire le tien, sur un autre sujet. On suppose la locale française configurée (§ 3).

Les fichiers, tous dans le même dossier :

```
ship-log/
├── log-entry.ts          le modèle
├── status-glow.ts        la directive d'attribut
├── status-label-pipe.ts  un pipe sans paramètre
├── truncate-pipe.ts      un pipe avec paramètre
├── ship-log.ts           le composant (+ ship-log.html, ship-log.scss)
```

```ts
// log-entry.ts
export type LogStatus = 'nominal' | 'warning' | 'critical';

export interface LogEntry {
  id: number;
  title: string; // écrit en minuscules dans les données : le pipe titlecase s'occupe de l'affichage
  date: string; // date ISO : '2026-11-03T21:43:00'
  status: LogStatus;
  fuel: number; // carburant restant, entre 0 et 1 (0.42 = 42 %)
  repairCost: number; // en euros
  distanceKm: number;
  systems: Record<string, number>; // état de chaque système, en %
}
```

```ts
// status-glow.ts : la directive (§ 2)
import { Directive, input, signal } from '@angular/core';
import { LogStatus } from './log-entry';

@Directive({
  selector: '[appStatusGlow]',
  host: {
    class: 'glow', // une classe fixe, toujours présente sur l'élément hôte
    '[class.glow--warning]': "appStatusGlow() === 'warning'",
    '[class.glow--critical]': "appStatusGlow() === 'critical'",
    '[class.glow--active]': 'active()',
    // souris ET clavier : focusin / focusout se déclenchent aussi quand un enfant prend le focus
    '(mouseenter)': 'activate()',
    '(mouseleave)': 'deactivate()',
    '(focusin)': 'activate()',
    '(focusout)': 'deactivate()',
  },
})
export class StatusGlow {
  // même nom que le sélecteur : [appStatusGlow]="..." applique la directive ET donne la valeur
  readonly appStatusGlow = input<LogStatus>('nominal');

  protected readonly active = signal(false);

  protected activate(): void {
    this.active.set(true);
  }

  protected deactivate(): void {
    this.active.set(false);
  }
}
```

```ts
// status-label-pipe.ts : un pipe sans paramètre (§ 4)
import { Pipe, PipeTransform } from '@angular/core';
import { LogStatus } from './log-entry';

const STATUS_LABELS: Record<LogStatus, string> = {
  nominal: 'Nominal',
  warning: 'Alerte',
  critical: 'Critique',
};

// La logique dans une fonction exportée : réutilisable hors d'un template
export function toStatusLabel(status: LogStatus): string {
  return STATUS_LABELS[status];
}

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: LogStatus): string {
    return toStatusLabel(status);
  }
}
```

```ts
// truncate-pipe.ts : un pipe avec paramètre (§ 4)
import { Pipe, PipeTransform } from '@angular/core';

const DEFAULT_MAX_LENGTH = 20;

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  // 2e paramètre = ce qu'on écrit après « : » dans le template, avec une valeur par défaut
  transform(text: string, maxLength = DEFAULT_MAX_LENGTH): string {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength)}…`;
  }
}
```

```ts
// ship-log.ts : le composant
import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  JsonPipe,
  KeyValuePipe,
  PercentPipe,
  TitleCasePipe,
} from '@angular/common';
import { Component, signal } from '@angular/core';
import { LogEntry } from './log-entry';
import { StatusGlow } from './status-glow';
import { StatusLabelPipe } from './status-label-pipe';
import { TruncatePipe } from './truncate-pipe';

const MESSAGE_DELAY_MS = 1500;

@Component({
  selector: 'app-ship-log',
  // chaque pipe et chaque directive utilisés par le template, un par un (pas de CommonModule)
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    JsonPipe,
    KeyValuePipe,
    PercentPipe,
    TitleCasePipe,
    StatusGlow,
    StatusLabelPipe,
    TruncatePipe,
  ],
  templateUrl: './ship-log.html',
  styleUrl: './ship-log.scss',
})
export class ShipLog {
  protected readonly entries = signal<LogEntry[]>([
    {
      id: 1,
      title: 'avarie du réacteur principal pendant le saut',
      date: '2026-11-03T21:43:00',
      status: 'critical',
      fuel: 0.18,
      repairCost: 12500.5,
      distanceKm: 384400.75,
      systems: { moteur: 35, coque: 80, bouclier: 10 },
    },
    {
      id: 2,
      title: 'patrouille de routine',
      date: '2026-11-05T08:15:00',
      status: 'nominal',
      fuel: 0.92,
      repairCost: 0,
      distanceKm: 1200,
      systems: { moteur: 100, coque: 95, bouclier: 100 },
    },
  ]);

  // Une Promise créée UNE fois, dans une propriété : le pipe async l'attend (§ 3)
  protected readonly baseMessage = new Promise<string>((resolve) =>
    setTimeout(() => resolve('Ravitaillement prévu au prochain spatioport'), MESSAGE_DELAY_MS),
  );
}
```

```html
<!-- ship-log.html -->
<h1>Journal de bord</h1>

<!-- async : affiche la valeur quand la Promise est résolue ; null avant, d'où le @else -->
<p role="status">
  @if (baseMessage | async; as message) {
    📡 {{ message }}
  } @else {
    Communication avec la base…
  }
</p>

@for (entry of entries(); track entry.id) {
  <!-- [appStatusGlow] : la directive s'applique à l'<article>, son élément hôte -->
  <article [appStatusGlow]="entry.status">
    <h2>{{ entry.title | truncate: 30 | titlecase }}</h2>
    <p>{{ entry.date | date: 'd MMMM y, HH:mm' }} · {{ entry.status | statusLabel }}</p>
    <p>
      Carburant : {{ entry.fuel | percent }} · Distance :
      {{ entry.distanceKm | number: '1.0-0' }} km
    </p>
    <p>Réparations : {{ entry.repairCost | currency }}</p>

    <!-- keyvalue : un objet devient un tableau de { key, value }, trié par clé -->
    <ul>
      @for (system of entry.systems | keyvalue; track system.key) {
        <li>{{ system.key | titlecase }} : {{ system.value }} %</li>
      }
    </ul>

    <!-- Le <summary> est focusable : au clavier, focusin allume aussi la lueur de la carte -->
    <details>
      <summary>Données brutes</summary>
      <pre>{{ entry | json }}</pre>
    </details>
  </article>
}
```

```scss
// ship-log.scss : le CSS des classes posées par la directive.
// L'<article> fait partie du template de ShipLog : ses styles l'atteignent
.glow {
  border-left: 4px solid var(--hud-glow);
  transition: box-shadow 0.2s ease;
}

.glow--warning {
  border-left-color: var(--hud-accent);
}

.glow--critical {
  border-left-color: var(--hud-danger);
}

.glow--active {
  box-shadow: 0 0 0.75rem var(--hud-glow);
}
```

Ce que l'écran affiche pour la première entrée :

```
Avarie Du Réacteur Principal P…
3 novembre 2026, 21:43 · Critique
Carburant : 18 % · Distance : 384 401 km
Réparations : 12 500,50 €
• Bouclier : 10 %
• Coque : 80 %
• Moteur : 35 %
▸ Données brutes
```

---

## Exercice : l'Armurerie de l'escouade

> ⚠️ Ne regarde pas de solution : c'est à toi de jouer. Demande-moi des indices si tu bloques.

**Objectif** : l'escouade ouvre son armurerie. On y voit un catalogue d'équipements : leur prix (avec remise), leur poids, leur date d'arrivée, leurs caractéristiques, et une lueur qui dépend de leur **rareté**. Tu vas écrire une **directive** et **deux pipes**, et utiliser les pipes natifs. Puis tu répareras l'affichage des spécialités dans le Registre du module 4.

```
Armory (la page : possède le catalogue)
├── directive appRarity          : la lueur selon la rareté, plus forte au survol et au focus
├── pipe rarityLabel             : 'legendary' → « Légendaire »
├── pipe discountedPrice         : le prix après remise
└── pipes natifs                 : date, currency, number, percent, titlecase, keyvalue, json, async
```

### Consignes

1. **Créer le widget du module** :
   - un dossier `src/app/widgets/05-directives-pipes/`, avec dedans un composant `armory` généré par la CLI ; la directive et les pipes iront dans ce même dossier ;
   - une **route lazy** `05-directives-pipes`, et une carte pour le module 5 sur la page d'accueil (titre : « Directives et pipes ») ;
   - un `<h1>` « Armurerie de l'escouade ».

2. **Passer l'application en français** (§ 3) :
   - dans `app.config.ts` : `registerLocaleData`, `LOCALE_ID` et `DEFAULT_CURRENCY_CODE` ;
   - vérifie l'effet : avant le réglage, affiche provisoirement une date avec `| date` et un prix avec `| currency` ; après, ils doivent passer en français et en euros.

3. **Le modèle**, dans son propre fichier `equipment.ts`, exporté :
   - un type `Rarity` : `'common' | 'rare' | 'epic' | 'legendary'` ;
   - une interface `Equipment` avec `id`, `name` (écrit **en minuscules** dans les données), `price` (en euros), `weight` (en kg, avec des décimales), `discount` (la remise, **entre 0 et 1**), `rarity`, `arrivalDate` (une **chaîne ISO**, comme `'2026-12-03'`) et `stats` (un objet `Record<string, number>`, par exemple `{ dégâts: 80, portée: 60 }`) ;
   - dans le composant, un signal `equipment` avec **5 équipements**, dont au moins un **sans remise** (`discount: 0`), un `legendary`, et un au nom long.

4. **Les pipes natifs** : une carte par équipement (`@for`) qui affiche :
   - le nom avec une majuscule à chaque mot ;
   - le prix en euros ;
   - la remise en pourcentage, **seulement s'il y en a une** ;
   - le poids avec **une** décimale exactement, suivi de « kg » ;
   - la date d'arrivée en toutes lettres (« 3 décembre 2026 ») ;
   - les caractéristiques dans une liste, avec `keyvalue` ;
   - les données brutes dans un `<details>`, avec `json`.
   - Question : dans quel ordre s'affichent les caractéristiques ? Pourquoi ?

5. **Un pipe sans paramètre : `rarityLabel`** :
   - `'common'` → « Commun », `'rare'` → « Rare », `'epic'` → « Épique », `'legendary'` → « Légendaire » ;
   - un `Record<Rarity, string>` pour les libellés, et la logique dans une **fonction exportée** que `transform` appelle (§ 4) ;
   - affiché sur chaque carte.

6. **Un pipe avec paramètre : `discountedPrice`** :
   - il reçoit le prix et, en paramètre, la remise, et renvoie le **prix après remise** (un nombre) ;
   - sur la carte : `{{ item.price | discountedPrice: item.discount | currency }}`, à côté du prix d'origine ;
   - Question : pourquoi `currency` doit-il être **le dernier** de la chaîne ?

7. **Une directive d'attribut : `appRarity`** (§ 2) :
   - un input **du même nom que le sélecteur**, qui reçoit une `Rarity` ;
   - avec l'objet `host` : une classe fixe `rarity`, et une classe par rareté (`rarity--rare`, `rarity--epic`, `rarity--legendary` ; `common` n'a que la classe de base) ;
   - un **signal** interne `highlighted`, vrai au survol **et** quand le focus est dans la carte (`focusin` / `focusout`), qui pose une classe `rarity--highlighted` ;
   - posée sur l'élément qui entoure chaque carte : `[appRarity]="item.rarity"` ;
   - le CSS de ces classes va dans `armory.scss` (une directive n'a pas de styles, § 2). Je peux faire le design si tu veux, une fois la directive fonctionnelle.

8. **Le pipe `async`** :
   - une propriété `nextDelivery` : une **Promise** qui se résout au bout de 2 secondes avec un texte (« Prochain arrivage : 3 caisses de munitions ») ; pas de nombre magique ;
   - affichée en haut de la page avec `@if (... | async; as ...)`, et « Chargement de l'arrivage… » dans le `@else` ;
   - le paragraphe qui l'entoure a `role="status"`, pour que le lecteur d'écran annonce l'arrivage.

9. **Réparer le Registre du module 4** :
   - la carte du soldat affiche encore `assault`, `medic`… Écris un pipe `roleLabel` **dans le dossier du module 4** (là où vit le type `Role`), et utilise-le dans `SoldierCard` ;
   - les libellés doivent être les mêmes que ceux des boutons du `RoleFilter` (« Combattant », « Médecin »…). Bonus : fais construire les libellés de `roleOptions` par la fonction exportée du pipe, pour ne les écrire qu'**une seule fois**.

10. **Vérifier** : `npm test` et `npm run build` passent.
    - ⚠️ Le test généré pour la directive (`new Rarity()`) risque d'échouer avec l'erreur **NG0203** : lis bien le message. Indice : `input()` ne peut être appelé que dans un certain « contexte », que le `TestBed` sait fournir (`TestBed.runInInjectionContext`). Les tests des pipes, eux, devraient passer tels quels : pourquoi ?

### Critères de réussite

- [ ] La carte du module 5 sur l'accueil mène à l'armurerie, sans erreur dans la console
- [ ] Toutes les dates, prix, nombres et pourcentages sont en **français** et en **euros**
- [ ] Les données restent **brutes** dans la classe (nom en minuscules, remise entre 0 et 1, date ISO) : toute la mise en forme se fait avec des pipes
- [ ] Aucun calcul de mise en forme dans une **méthode** appelée par le template
- [ ] Le composant importe **chaque** pipe utilisé, et pas `CommonModule`
- [ ] `rarityLabel` et `roleLabel` utilisent un `Record`, et leur logique est dans une fonction exportée
- [ ] La directive utilise uniquement l'objet `host` (pas de `@HostBinding`, `@HostListener` ni `ElementRef`)
- [ ] La lueur s'allume **au survol et au clavier** (Tab jusqu'au `<summary>` d'une carte)
- [ ] Le Registre affiche « Combattant », « Médecin »… au lieu des valeurs brutes
- [ ] `npm test` et `npm run build` passent

### Bonus (facultatif)

- **Pur ou impur ?** Écris un pipe `statTotal` qui additionne les `stats` d'un équipement. Ajoute un bouton « Améliorer » qui augmente une caractéristique **en mutant l'objet** (`item.stats.dégâts += 10`) : le total se met-il à jour ? Corrige ensuite avec une mise à jour immuable dans le signal. Explique la différence avec tes mots (§ 5).
- **`hostDirectives`** : crée un composant `EquipmentCard` qui reçoit un équipement en input, et qui applique `Rarity` à lui-même avec `hostDirectives`, en exposant l'input sous le nom `rarity` (§ 6). Le parent écrit alors `<app-equipment-card [item]="item" [rarity]="item.rarity" />`.
- **Un pipe de durée** : reprends le calcul `minutes:secondes` du lecteur de musique (`src/app/tests/`) dans un pipe `trackDuration`, et remplace les deux calculs en double.
