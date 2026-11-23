# Module 6 — [Angular] Services et injection de dépendances

> Durée estimée : 4–5 h · Widget : le Paquetage de l'escouade (exercice, à coder toi-même)

## Ce que tu sauras faire à la fin

- Expliquer **pourquoi** on sort du code des composants pour le mettre dans un **service**
- Créer un service avec `@Service()` (Angular 22) et le reconnaître sous sa forme classique `@Injectable({ providedIn: 'root' })`
- Récupérer un service avec `inject()`, dans un composant ou dans un autre service
- Écrire un service qui **partage un état** entre plusieurs composants, avec des signals : état privé, lecture seule avec `asReadonly()`, `computed` publics, méthodes de mise à jour
- Fournir une **configuration** avec un `InjectionToken`
- Choisir entre `useClass`, `useValue`, `useFactory` et `useExisting`
- Comprendre **qui reçoit quelle instance** : injecteur racine, injecteur de route, injecteur de composant

| Priorité    | Notions                                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ★ cœur      | `@Service()` et `@Injectable({ providedIn: 'root' })`, `inject()`, un service qui partage de l'état via signals entre composants                                         |
| ○ courant   | providers (`useClass`, `useValue`, `useFactory`, `useExisting`), `InjectionToken` (config), injecteurs hiérarchiques (`providers` d'un composant, d'une route), contexte d'injection |
| · référence | options `optional` / `self` / `skipSelf` de `inject()`, `injectAsync` (services chargés à la demande), options `factory` et `autoProvided` de `@Service()`              |

Fil rouge des exemples : **la soute du vaisseau**, où l'on charge et décharge des caisses.

---

## 1. ★ Pourquoi un service ?

### Le problème : des composants qui ne sont pas parents

Au module 4, deux composants communiquaient avec des **inputs** et des **outputs**. Ça marche très bien entre un **parent** et son **enfant** direct. Mais imagine cette page :

```
CargoBay (la page)
├── CargoGauge     « Soute : 7 / 20 t »        ← doit connaître le poids total
├── CargoLoader    [Charger Vivres] [Charger Munitions]   ← ajoute des caisses
└── CargoManifest  la liste des caisses, [Décharger]       ← retire des caisses
```

Les trois composants ont besoin de **la même liste de caisses**. Avec des inputs et des outputs, il faudrait :
- que la page `CargoBay` garde la liste ;
- qu'elle la passe en **input** à `CargoGauge` et à `CargoManifest` ;
- qu'elle écoute les **outputs** de `CargoLoader` et de `CargoManifest` pour la modifier.

Sur une page, c'est faisable. Mais si `CargoGauge` était dans l'**en-tête** de l'application, à l'autre bout de l'arbre des composants, il faudrait faire passer la liste à travers **tous** les composants intermédiaires, qui n'en ont pourtant pas besoin. On appelle ça le *prop drilling* (« percer à travers les props »).

### La solution : un objet partagé, à côté des composants

Un **service** est une simple **classe** qui contient des données et des méthodes, et qu'Angular **crée pour toi** et **donne** à qui la demande. Si tous les composants demandent le même service, ils reçoivent **le même objet** :

```
                 ┌──────────────────────┐
                 │  CargoHold (service) │   la liste des caisses vit ICI
                 └──────────────────────┘
                    ▲        ▲        ▲
         inject()   │        │        │   inject()
             ┌──────┘        │        └───────┐
        CargoGauge      CargoLoader      CargoManifest
        (lit le total)  (charge)         (lit la liste, décharge)
```

Aucun input, aucun output : chaque composant parle **directement** au service.

### Un service, c'est aussi « une seule responsabilité »

On ne crée pas des services seulement pour partager de l'état. On y range aussi tout ce qui **n'est pas de l'affichage** :

| Dans le composant | Dans un service |
| --- | --- |
| le template, les styles | les données partagées (panier, utilisateur connecté, préférences) |
| ce qui ne concerne que l'affichage (« le menu est ouvert ») | les appels HTTP (module 10) |
| la réaction aux clics, qui **délègue** au service | les règles métier (« la soute ne dépasse pas sa capacité ») |

Un composant devient alors **mince** : il affiche, et il transmet les actions de l'utilisateur au service.

---

## 2. ★ Créer un service

### La générer

```bash
ng generate service widgets/06-services-di/cargo-hold
```

La CLI crée `cargo-hold.ts` (le service) et `cargo-hold.spec.ts` (son test). Depuis Angular 22, elle génère ceci :

```ts
import { Service } from '@angular/core';

@Service()
export class CargoHold {}
```

### Ce que fait `@Service()`

Le décorateur `@Service()` dit à Angular : « cette classe est un service, **fournis-la automatiquement à toute l'application** ». Concrètement, Angular garantit trois choses :

1. **Une seule instance** (un *singleton*) : le premier composant qui demande `CargoHold` la fait créer, et tous les suivants reçoivent **le même objet**.
2. **Disponible partout**, sans rien déclarer ailleurs.
3. **Retirée du build** si personne ne l'utilise (*tree-shaking*) : elle ne coûte rien tant qu'elle ne sert pas.

### La forme classique : `@Injectable({ providedIn: 'root' })`

Avant Angular 22, on écrivait ceci. C'est la forme que tu verras dans **presque tout le code d'entreprise**, et elle reste valable :

```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CargoHold {}
```

`providedIn: 'root'` veut dire « fourni à la **racine** de l'application » : c'est exactement ce que `@Service()` fait par défaut. Les deux écritures donnent **le même résultat** pour un service partagé.

| | `@Service()` | `@Injectable({ providedIn: 'root' })` |
| --- | --- | --- |
| Instance unique pour toute l'app | ✅ automatiquement | ✅ grâce à `providedIn: 'root'` |
| Récupération avec `inject()` | ✅ | ✅ |
| Injection par le **constructeur** (legacy) | ❌ | ✅ |
| Avec `useClass`, `useValue`… dans son décorateur | ❌ (une option `factory` à la place, § 9) | ✅ |
| Généré par la CLI d'Angular 22 | ✅ | avec l'option `--injectable` |

**La règle pour ce cours :** écris tes nouveaux services avec `@Service()`, et sache lire `@Injectable({ providedIn: 'root' })`, qui est partout. Tu utiliseras `@Injectable()` (sans `providedIn`) pour les classes destinées aux `providers` (§ 7).

> 💡 **Le nom.** L'ancien guide de style d'Angular voulait un suffixe : `cargo-hold.service.ts` et `CargoHoldService`. Le guide actuel dit de **nommer par ce que fait la classe**, sans suffixe : `CargoHold`. Tu verras les deux en entreprise.

---

## 3. ★ Récupérer un service : `inject()`

### Dans un composant

On déclare une propriété, et on l'initialise avec `inject(LaClasse)` :

```ts
import { Component, inject } from '@angular/core';
import { CargoHold } from './cargo-hold';

@Component({
  selector: 'app-cargo-gauge',
  template: `<p>Soute : {{ hold.totalTons() }} / {{ hold.capacityTons }} t</p>`,
})
export class CargoGauge {
  protected readonly hold = inject(CargoHold);
}
```

Trois choses à remarquer :
- **Tu ne fais jamais `new CargoHold()`.** Avec `new`, chaque composant aurait **sa propre** soute, et rien ne serait partagé. `inject()` demande à Angular l'instance qu'il a **déjà** créée (ou la crée la première fois).
- **`protected readonly`** : `protected` pour que le template y ait accès (comme tes signals du module 3), `readonly` parce qu'on ne remplacera jamais le service par un autre.
- **Dans le template**, on lit le service directement : `hold.totalTons()`.

### Dans un autre service

Un service peut lui aussi en demander un autre, exactement de la même façon :

```ts
@Service()
export class CargoReport {
  private readonly hold = inject(CargoHold);   // private : seul ce service s'en sert
}
```

### Pourquoi on dit « injection de dépendances »

`CargoGauge` **dépend** de `CargoHold` : sans lui, il ne sait rien afficher. Au lieu de **fabriquer** sa dépendance lui-même (`new`), il la **demande**, et Angular la lui **injecte**. C'est tout le principe :

```
Sans DI :  le composant fabrique ce dont il a besoin     → chacun a la sienne, impossible à remplacer
Avec DI :  le composant DEMANDE, Angular FOURNIT          → partagée, et remplaçable (tests, § 7)
```

Le « remplaçable » compte beaucoup : dans un test, on pourra donner au composant une **fausse** soute, sans toucher à son code.

---

## 4. ★ Un service qui partage de l'état avec des signals

C'est **le** modèle à connaître : tu l'écriras dans presque tous les projets.

```ts
import { computed, Service, signal } from '@angular/core';

export interface Crate {
  id: number;
  label: string;
  tons: number;
}

const CAPACITY_TONS = 20;

@Service()
export class CargoHold {
  // ① L'état : PRIVÉ. Seul le service peut le modifier.
  private readonly crates = signal<Crate[]>([]);
  private nextId = 1;

  // ② La vitrine : l'état en LECTURE SEULE pour les composants.
  readonly loadedCrates = this.crates.asReadonly();

  // ③ Les valeurs dérivées : des computed publics.
  readonly totalTons = computed(() =>
    this.crates().reduce((total, crate) => total + crate.tons, 0),
  );
  readonly remainingTons = computed(() => CAPACITY_TONS - this.totalTons());

  // ④ Les SEULES portes d'entrée pour modifier l'état : des méthodes.
  load(label: string, tons: number): void {
    if (tons > this.remainingTons()) {
      return; // la règle métier : on ne dépasse pas la capacité
    }
    this.crates.update((crates) => [...crates, { id: this.nextId++, label, tons }]);
  }

  unload(id: number): void {
    this.crates.update((crates) => crates.filter((crate) => crate.id !== id));
  }
}
```

### Les 4 pièces, et pourquoi

| Pièce | Visibilité | Rôle |
| --- | --- | --- |
| ① `crates = signal(...)` | `private` | l'état réel, modifiable |
| ② `loadedCrates = crates.asReadonly()` | public | la même valeur, **sans** `set` ni `update` |
| ③ `totalTons = computed(...)` | public | ce qui se calcule à partir de l'état |
| ④ `load()`, `unload()` | public | les seules façons de modifier l'état |

### Pourquoi l'état est privé : `asReadonly()`

Tu as vu `asReadonly()` au module 3. Il prend tout son sens ici. Imagine que `crates` soit public :

```ts
// dans n'importe quel composant…
this.hold.crates.set([{ id: 1, label: 'Éléphant', tons: 900 }]);   // 💥 900 t dans une soute de 20 t
```

La règle « on ne dépasse pas la capacité » est dans `load()`. Si n'importe qui peut faire `set` directement, **la règle ne sert à rien**. Avec `asReadonly()`, la propriété publique est un `Signal` en lecture seule : elle n'a ni `set` ni `update`, et TypeScript **refuse** de compiler la ligne ci-dessus.

```
Composant ──► hold.loadedCrates()           lire : ✅ toujours possible
Composant ──► hold.load('Vivres', 2)         modifier : ✅ par la porte d'entrée, qui vérifie la règle
Composant ──► hold.loadedCrates.set(...)     ❌ erreur TypeScript : un Signal n'a pas de set
```

C'est le principe d'**encapsulation** : le service est le **seul responsable** de la cohérence de son état.

### Ce que voit chaque composant

Comme c'est **le même objet** pour tous, quand `CargoLoader` appelle `hold.load(...)`, le signal `crates` change, donc `loadedCrates` et `totalTons` aussi, et **tous** les composants qui les lisent se rafraîchissent : `CargoGauge` et `CargoManifest` en même temps. C'est la réactivité des signals du module 3, simplement étendue à plusieurs composants.

> 💡 **Et les Observables ?** En entreprise, tu verras beaucoup de services écrits avec un `BehaviorSubject` de RxJS au lieu d'un signal. C'est le même modèle (état privé, lecture publique, méthodes), avec un autre outil. On les comparera au module 17.

---

## 5. ○ Le contexte d'injection

Tu l'as rencontré au module 5 avec l'erreur **NG0203** dans le test de ta directive. `inject()` (comme `input()`) ne marche que pendant qu'Angular **crée** un objet : c'est le **contexte d'injection**.

| Endroit | `inject()` marche ? |
| --- | --- |
| l'initialisation d'une propriété : `hold = inject(CargoHold)` | ✅ |
| le `constructor` | ✅ |
| une fonction de fabrique (`useFactory`, la `factory` d'un `InjectionToken`, § 6–7) | ✅ |
| une fonction passée à `runInInjectionContext` (ton test du module 5) | ✅ |
| une **méthode** appelée plus tard (un clic, `ngOnInit`) | ❌ NG0203 |
| un `setTimeout`, une Promise | ❌ NG0203 |

```ts
export class CargoGauge {
  protected readonly hold = inject(CargoHold);   // ✅ pendant la création

  protected refresh(): void {
    const hold = inject(CargoHold);              // ❌ NG0203 : on est dans un clic, bien après
  }
}
```

**La règle simple :** fais tous tes `inject()` **en haut de la classe**, dans des propriétés. Tu n'auras jamais de problème.

---

## 6. ○ Fournir une configuration : `InjectionToken`

### Le problème

La capacité de la soute (`CAPACITY_TONS = 20`) est écrite **en dur** dans le service. Et si le cargo léger n'a que 10 t, et le croiseur 50 t ? Et si, dans un test, on veut une petite soute de 5 t ? Il faudrait **modifier le service**.

On voudrait plutôt que la capacité soit **fournie de l'extérieur**, comme un service. Mais on ne peut pas écrire `inject(CargoConfig)` avec une interface :

```ts
export interface CargoConfig {
  capacityTons: number;
}

inject(CargoConfig);   // ❌ 'CargoConfig' only refers to a type, but is being used as a value here.
```

Une interface **n'existe plus** une fois le code compilé en JavaScript : TypeScript efface les types. Angular n'a donc rien pour la reconnaître. Il lui faut une **clé** qui existe vraiment à l'exécution.

### La solution : un jeton

Un `InjectionToken` est cette clé : un petit objet unique, auquel on associe un type.

```ts
// cargo-config.ts
import { InjectionToken } from '@angular/core';

export interface CargoConfig {
  capacityTons: number;
}

export const CARGO_CONFIG = new InjectionToken<CargoConfig>('CARGO_CONFIG');
//                                          └─ le type      └─ un nom, affiché dans les messages d'erreur
```

Le service le demande avec `inject`, comme une classe :

```ts
@Service()
export class CargoHold {
  private readonly config = inject(CARGO_CONFIG);    // type : CargoConfig
  readonly capacityTons = this.config.capacityTons;
  // ...
  readonly remainingTons = computed(() => this.capacityTons - this.totalTons());
}
```

### Fournir la valeur : `useValue`

Contrairement à un `@Service()`, un jeton n'a **pas de valeur par défaut** : il faut dire à Angular quoi donner. On l'écrit dans un tableau `providers`, avec un objet `{ provide, useValue }` :

```ts
{ provide: CARGO_CONFIG, useValue: { capacityTons: 20 } }
//         └─ la clé              └─ ce qu'Angular donnera à qui demande cette clé
```

Ce provider peut aller à **trois endroits** (on verra la différence au § 8) :

```ts
// app.config.ts : pour toute l'application (tu y as déjà mis LOCALE_ID au module 5 !)
providers: [{ provide: CARGO_CONFIG, useValue: { capacityTons: 20 } }]

// app.routes.ts : seulement pour cette route et ses composants
{
  path: 'soute',
  loadComponent: () => import('./cargo-bay').then((m) => m.CargoBay),
  providers: [{ provide: CARGO_CONFIG, useValue: { capacityTons: 20 } }],
}

// un @Component : seulement pour ce composant et ses enfants
@Component({ providers: [{ provide: CARGO_CONFIG, useValue: { capacityTons: 20 } }] })
```

> ⚠️ Avec la route ou un composant, il y a un piège : un `@Service()` (créé à la racine) **ne voit pas** ces providers-là. On le détaille au § 8 (« Le piège : un service racine ne voit pas ce qu'il y a en dessous »).

Si personne ne fournit le jeton, Angular lève l'erreur **NG0201** : « No provider found for InjectionToken CARGO_CONFIG ». C'est un message à savoir lire : il veut dire « tu demandes une clé que personne n'a fournie ».

> 💡 **Tu en utilises déjà.** `LOCALE_ID` et `DEFAULT_CURRENCY_CODE`, dans ton `app.config.ts`, sont des `InjectionToken` d'Angular. Le pipe `currency` fait `inject(DEFAULT_CURRENCY_CODE)` pour savoir quelle devise afficher.

### Un jeton avec une valeur par défaut

On peut aussi donner au jeton une **fabrique** par défaut. Il devient alors disponible partout sans provider, et on peut quand même le remplacer :

```ts
export const CARGO_CONFIG = new InjectionToken<CargoConfig>('CARGO_CONFIG', {
  providedIn: 'root',
  factory: () => ({ capacityTons: 20 }),   // utilisé si personne ne fournit autre chose
});
```

---

## 7. ○ Les 4 sortes de providers

Un **provider** est une instruction pour Angular : « quand quelqu'un demande **cette clé**, donne-lui **ceci** ». Il y en a quatre sortes :

| Provider | Ce qu'Angular donne | Quand l'utiliser |
| --- | --- | --- |
| `useValue` | une **valeur toute faite** | une configuration, une constante |
| `useClass` | une instance d'une **autre classe** | remplacer une implémentation (une fausse en test, une variante) |
| `useFactory` | le **résultat d'une fonction** | une valeur qui se calcule au démarrage, avec `inject()` dedans |
| `useExisting` | **la même instance** qu'une autre clé | un alias : deux noms pour un seul objet |

### `useClass` : remplacer une classe par une autre

```ts
@Injectable({ providedIn: 'root' })
export class CargoLogger {
  log(message: string): void {
    console.log(`[Soute] ${message}`);
  }
}

@Injectable()
export class SilentCargoLogger extends CargoLogger {
  override log(): void {} // ne fait rien : pour les tests ou la démo
}
```

```ts
providers: [{ provide: CargoLogger, useClass: SilentCargoLogger }]
```

Tous les `inject(CargoLogger)` de cette zone reçoivent un `SilentCargoLogger`, **sans** changer une ligne de leur code. C'est ce qui rend les services faciles à **tester** (module 24).

> 💡 **Le raccourci.** `providers: [CargoHold]` est l'abréviation de `{ provide: CargoHold, useClass: CargoHold }` : « pour la clé `CargoHold`, crée un `CargoHold` ».

### `useFactory` : calculer la valeur

Ici, `DEMO_MODE` est un autre `InjectionToken<boolean>`, qui dit si l'application tourne en démonstration :

```ts
providers: [
  {
    provide: CARGO_CONFIG,
    useFactory: () => {
      const isDemo = inject(DEMO_MODE);                  // une fabrique peut injecter (§ 5)
      return { capacityTons: isDemo ? 5 : 20 };
    },
  },
]
```

### `useExisting` : un alias

```ts
providers: [{ provide: CargoReader, useExisting: CargoHold }]
```

Qui demande `CargoReader` reçoit **la même instance** que qui demande `CargoHold`. C'est rare, et utile surtout dans les bibliothèques : on le retrouvera en lisant du code.

---

## 8. ○ Les injecteurs hiérarchiques : qui reçoit quelle instance ?

### Plusieurs « réserves » de services

Angular ne range pas tous les services au même endroit. Il a des **injecteurs** (des réserves), organisés en **arbre**, comme les composants :

```
Injecteur racine (« root »)              ← @Service(), providedIn: 'root', providers de app.config.ts
│                                           une seule instance pour toute l'application
│
└── Injecteur de route                   ← providers d'une route (dans app.routes.ts)
    │                                       créé quand on visite la route pour la première fois
    │
    └── Injecteurs des composants        ← providers d'un @Component
                                            UN par instance de composant
```

### La recherche : on remonte l'arbre

Quand un composant fait `inject(CargoHold)`, Angular cherche **de bas en haut** :

```
CargoManifest fait inject(CargoHold)
   1. dans les providers de CargoManifest ?       non → on monte
   2. dans les providers de son parent CargoBay ?  non → on monte
   3. dans les providers de la route ?             non → on monte
   4. à la racine ?                                oui (@Service) → cette instance
   (si personne ne l'a : erreur NG0201)
```

Le **premier** trouvé gagne. C'est ce qui permet de **remplacer** un service pour une partie de l'application seulement.

### `providers` d'un composant : une instance par composant

Si on écrit `providers: [CargoHold]` dans un composant, **chaque exemplaire** de ce composant crée **sa propre** soute, partagée seulement avec **ses enfants** :

```ts
@Component({
  selector: 'app-ship',
  providers: [CargoHold],              // ← chaque vaisseau a SA soute
  imports: [CargoGauge, CargoLoader, CargoManifest],
  template: `
    <h2>{{ shipName() }}</h2>
    <app-cargo-gauge />
    <app-cargo-loader />
    <app-cargo-manifest />
  `,
})
export class Ship {
  readonly shipName = input.required<string>();
}
```

```html
<app-ship shipName="Odyssée" />
<app-ship shipName="Nébuleuse" />
```

```
                 SANS providers                          AVEC providers: [CargoHold]
           ┌── racine : 1 CargoHold ──┐            Ship « Odyssée » : CargoHold n°1
           │                          │               └─ Gauge, Loader, Manifest → n°1
   Ship « Odyssée »          Ship « Nébuleuse »     Ship « Nébuleuse » : CargoHold n°2
   (tous → la même soute)   (tous → la même)          └─ Gauge, Loader, Manifest → n°2
   → charger dans l'un remplit les DEUX            → chaque vaisseau a sa soute
```

Deux conséquences importantes :
- **Durée de vie** : la soute d'un `Ship` est **détruite avec lui**. Si un `@if` retire le vaisseau, son contenu est perdu ; au retour, il repart à vide. Un service racine, lui, vit tant que l'application tourne.
- **La config reste trouvée** : les deux soutes font `inject(CARGO_CONFIG)`. Elles ne le trouvent pas dans `Ship`, alors elles **remontent** jusqu'à la route ou la racine, et reçoivent la même configuration.

### `providers` d'une route

Les providers d'une route sont partagés par **tous les composants de cette route** (et de ses routes enfants). Ils sont créés à la première visite, et **gardés** ensuite, même quand on quitte la page. C'est la bonne place pour une configuration propre à une partie de l'application. On s'en resservira au module 9 (routing).

| Où on fournit | Qui partage l'instance | Durée de vie |
| --- | --- | --- |
| `@Service()` ou `app.config.ts` | toute l'application | toute l'application |
| `providers` d'une route | les composants de cette route | depuis la 1ʳᵉ visite, jusqu'à la fermeture de l'app |
| `providers` d'un `@Component` | ce composant et ses enfants | celle du composant |

### ⚠️ Le piège : un service racine ne voit pas ce qu'il y a en dessous

La recherche **monte**, elle ne descend jamais. Et elle part de l'injecteur où le service est **créé**, pas de celui du composant qui le demande. Regarde ce code : il compile, mais il **plante** à l'exécution.

```ts
@Service()                                          // ← la soute est créée à la RACINE
export class CargoHold {
  private readonly config = inject(CARGO_CONFIG);   // ← donc cherché depuis la racine
}

// app.routes.ts
{ path: 'soute', loadComponent: ..., providers: [{ provide: CARGO_CONFIG, useValue: { capacityTons: 20 } }] }
```

```
Injecteur racine          ← CargoHold est créé ICI, et cherche CARGO_CONFIG ICI → introuvable : NG0201
└── Injecteur de route    ← CARGO_CONFIG est fourni ici : invisible depuis la racine
    └── CargoBay
        └── CargoGauge    ← fait inject(CargoHold), mais la soute naît quand même à la racine
```

Faire `inject(CargoHold)` ailleurs, par exemple dans la page, n'y change rien : **`inject` dit ce qu'on veut, pas où l'instance est créée**. C'est `providers` qui décide où elle est créée.

> **La règle :** un service racine ne doit dépendre que de choses fournies à la racine. Dès qu'un service dépend de quelque chose de **local** (une route, un composant), il doit lui-même être fourni à ce niveau-là, ou plus bas.

Il y a trois façons de corriger ce code :

| Correction | Quand la choisir |
| --- | --- |
| fournir `CARGO_CONFIG` dans `app.config.ts` | la valeur est la même partout (le cas le plus fréquent) |
| `providers: [CargoHold, { provide: CARGO_CONFIG, ... }]` sur la **route** | la config dépend de la partie de l'application, et l'état doit être **gardé** quand on quitte la page |
| `providers: [CargoHold]` dans le **composant page** | l'état appartient à la page, et doit **repartir à zéro** quand on la quitte (l'exemple générique ci-dessous) |

> 💡 **Un service fait pour des `providers` ne s'auto-fournit pas.** On l'écrit `@Injectable()` **sans** `providedIn` (ou `@Service({ autoProvided: false })`, § 9). Si quelqu'un oublie le provider, Angular lève NG0201 **tout de suite**, avec un message clair. Avec `@Service()`, Angular créerait la soute à la racine sans rien dire : tu aurais une soute unique pour toute l'application au lieu d'une par page, et le bug serait bien plus difficile à trouver.

### Où fournir quoi : le choix en entreprise

La vraie question n'est pas « où je mets le service », mais **« combien de temps cet état doit-il vivre, et qui le partage ? »**

| Type d'état | Exemples | Où le fournir |
| --- | --- | --- |
| global, partagé partout | utilisateur connecté, panier, thème, préférences | racine : `@Service()` / `@Injectable({ providedIn: 'root' })` |
| propre à une page, remis à zéro quand on la quitte | filtres d'une liste, formulaire en cours, **la soute** | `providers` du composant page, avec `@Injectable()` |
| propre à une partie de l'application, gardé pendant la navigation | données d'un espace « admin » | `providers` de la route |
| configuration | URL d'une API, environnement, capacité | **le plus haut possible** : `app.config.ts`, ou la route si elle change selon la partie de l'application |

Le « store de page » fourni dans le composant page est très courant en entreprise : c'est exactement ce qu'on écrira avec NgRx SignalStore au module 20 (`providers: [BooksStore]`).

> 💡 **Tu verras aussi** une fonction `provideCargo({ capacityTons: 20 })` qui renvoie le tableau de providers, sur le modèle de `provideHttpClient()` ou `provideRouter()`. On la trouve surtout dans les bibliothèques partagées entre équipes (·).

---

## 9. · Référence : à savoir que ça existe

- **Les options de `inject()`** :
  - `inject(CargoLogger, { optional: true })` renvoie `null` au lieu de lever NG0201 si personne ne fournit la clé (le type devient `CargoLogger | null`) ;
  - `{ self: true }` cherche **seulement** dans l'injecteur du composant lui-même ; `{ skipSelf: true }` **commence** au parent. Utile surtout dans les bibliothèques de composants.
- **`injectAsync` (Angular 22)** : charger un service **à la demande**, dans un fichier JavaScript séparé, comme une route lazy. Pour un service lourd dont on ne se sert que rarement (un export PDF, par exemple) :
  ```ts
  private readonly exporter = injectAsync(() => import('./cargo-exporter').then((m) => m.CargoExporter));

  protected async export(): Promise<void> {
    (await this.exporter()).exportPdf();   // le code du service n'est téléchargé qu'au premier clic
  }
  ```
- **Les options de `@Service()`** : `@Service({ factory: () => ... })` pour choisir ce qu'Angular crée (l'équivalent de `useFactory`) ; `@Service({ autoProvided: false })` pour un service qui n'est **pas** fourni à la racine, et qu'il faut mettre soi-même dans des `providers`.

---

> ### 🏛️ Legacy : ce que tu verras en entreprise
>
> ```ts
> // AVANT : injection par le CONSTRUCTEUR, suffixe Service, décorateurs @Inject / @Optional
> @Injectable({ providedIn: 'root' })
> export class CargoHoldService {
>   private crates: Crate[] = [];
>
>   constructor(
>     private logger: CargoLoggerService,
>     @Inject(CARGO_CONFIG) private config: CargoConfig,
>     @Optional() private analytics?: AnalyticsService,
>   ) {}
> }
>
> // AVANT : les services fournis dans un NgModule
> @NgModule({
>   providers: [CargoHoldService, { provide: CARGO_CONFIG, useValue: { capacityTons: 20 } }],
> })
> export class CargoModule {}
> ```
>
> | Ancien | Moderne |
> | --- | --- |
> | `constructor(private logger: CargoLogger)` | `private readonly logger = inject(CargoLogger)` |
> | `@Inject(CARGO_CONFIG) private config: CargoConfig` | `private readonly config = inject(CARGO_CONFIG)` |
> | `@Optional() private x?: X` | `inject(X, { optional: true })` |
> | `@Self()`, `@SkipSelf()`, `@Host()` | `inject(X, { self: true })`, `{ skipSelf: true }`, `{ host: true }` |
> | `@Injectable({ providedIn: 'root' })` | `@Service()` (les deux restent valables) |
> | `providers` d'un `NgModule` | `providers` de `app.config.ts`, d'une route ou d'un composant |
> | `CargoHoldService` dans `cargo-hold.service.ts` | `CargoHold` dans `cargo-hold.ts` |
> | état dans une propriété simple ou un `BehaviorSubject` | état dans un `signal` privé + `asReadonly()` |
>
> Remarque : l'injection par le constructeur **fonctionne toujours** avec `@Injectable`. Tu la liras partout, mais n'en écris pas : `inject()` marche aussi dans les fonctions (guards, intercepteurs, modules 9 et 10), et le constructeur, lui, non.

---

## Exemple générique : la soute du vaisseau

Voici un exemple complet qui réunit les notions du module. **Lis-le, ne le recopie pas** : l'exercice te demandera d'écrire le tien, sur un autre sujet.

Les fichiers, tous dans le même dossier :

```
cargo-bay/
├── cargo-config.ts     le jeton de configuration
├── cargo-hold.ts       le service : l'état partagé (un « store de page »)
├── cargo-gauge.ts      lit le total
├── cargo-loader.ts     charge des caisses
├── cargo-manifest.ts   affiche et décharge
└── cargo-bay.ts        la page : fournit la soute et assemble les trois, sans rien leur passer
```

Qui fournit quoi :

```
Injecteur racine
└── Injecteur de la route 'soute'   ← fournit CARGO_CONFIG (20 t)
    └── CargoBay                    ← fournit CargoHold : la soute de CETTE page
        ├── CargoGauge     ┐
        ├── CargoLoader    ├─ inject(CargoHold) → remontent jusqu'à CargoBay
        └── CargoManifest  ┘
CargoHold fait inject(CARGO_CONFIG) → pas dans CargoBay → remonte → trouvé sur la route ✅
```

### Le jeton de configuration

```ts
// cargo-config.ts
import { InjectionToken } from '@angular/core';

export interface CargoConfig {
  capacityTons: number;
}

export const CARGO_CONFIG = new InjectionToken<CargoConfig>('CARGO_CONFIG');
```

### Le service

```ts
// cargo-hold.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { CARGO_CONFIG } from './cargo-config';

export interface Crate {
  id: number;
  label: string;
  tons: number;
}

// Pas de providedIn : c'est la page qui la fournit (voir cargo-bay.ts)
@Injectable()
export class CargoHold {
  private readonly config = inject(CARGO_CONFIG);
  private readonly crates = signal<Crate[]>([]);
  private nextId = 1;

  readonly loadedCrates = this.crates.asReadonly();
  readonly capacityTons = this.config.capacityTons;
  readonly totalTons = computed(() =>
    this.crates().reduce((total, crate) => total + crate.tons, 0),
  );
  readonly remainingTons = computed(() => this.capacityTons - this.totalTons());

  load(label: string, tons: number): void {
    if (tons > this.remainingTons()) {
      return;
    }
    this.crates.update((crates) => [...crates, { id: this.nextId++, label, tons }]);
  }

  unload(id: number): void {
    this.crates.update((crates) => crates.filter((crate) => crate.id !== id));
  }
}
```

### Les trois composants

```ts
// cargo-gauge.ts : lit seulement
@Component({
  selector: 'app-cargo-gauge',
  template: `
    <p
      role="meter"
      aria-label="Remplissage de la soute"
      [attr.aria-valuenow]="hold.totalTons()"
      aria-valuemin="0"
      [attr.aria-valuemax]="hold.capacityTons"
    >
      Soute : {{ hold.totalTons() }} / {{ hold.capacityTons }} t
    </p>
  `,
})
export class CargoGauge {
  protected readonly hold = inject(CargoHold);
}
```

```ts
// cargo-loader.ts : modifie par une porte d'entrée
@Component({
  selector: 'app-cargo-loader',
  template: `
    <h2>Quai de chargement</h2>
    @for (crate of availableCrates; track crate.label) {
      <button
        type="button"
        [disabled]="crate.tons > hold.remainingTons()"
        (click)="hold.load(crate.label, crate.tons)"
      >
        Charger {{ crate.label }} ({{ crate.tons }} t)
      </button>
    }
  `,
})
export class CargoLoader {
  protected readonly hold = inject(CargoHold);

  protected readonly availableCrates = [
    { label: 'Vivres', tons: 2 },
    { label: 'Munitions', tons: 5 },
    { label: 'Pièces moteur', tons: 8 },
  ];
}
```

```ts
// cargo-manifest.ts : lit et modifie
@Component({
  selector: 'app-cargo-manifest',
  template: `
    <h2>Manifeste</h2>
    <ul>
      @for (crate of hold.loadedCrates(); track crate.id) {
        <li>
          {{ crate.label }} : {{ crate.tons }} t
          <button type="button" (click)="hold.unload(crate.id)">Décharger</button>
        </li>
      } @empty {
        <li>La soute est vide.</li>
      }
    </ul>
  `,
})
export class CargoManifest {
  protected readonly hold = inject(CargoHold);
}
```

### La page et sa route

```ts
// cargo-bay.ts : fournit la soute, mais n'a AUCUN état et ne passe AUCUN input
@Component({
  selector: 'app-cargo-bay',
  imports: [CargoGauge, CargoLoader, CargoManifest],
  providers: [CargoHold], // ← la soute est créée ICI, une par page, détruite avec elle
  template: `
    <header>
      <h1>Soute du vaisseau</h1>
      <app-cargo-gauge />
    </header>
    <app-cargo-loader />
    <app-cargo-manifest />
  `,
})
export class CargoBay {}
```

```ts
// app.routes.ts : la capacité est fournie par la route (la config de cette partie de l'application)
{
  path: 'soute',
  loadComponent: () => import('./cargo-bay/cargo-bay').then((m) => m.CargoBay),
  providers: [{ provide: CARGO_CONFIG, useValue: { capacityTons: 20 } }],
}
```

### Ce que ça donne

```
Soute du vaisseau                         Soute : 7 / 20 t
Quai de chargement
[Charger Vivres (2 t)] [Charger Munitions (5 t)] [Charger Pièces moteur (8 t)]
Manifeste
• Munitions : 5 t  [Décharger]
• Vivres : 2 t     [Décharger]
```

Avec 7 t à bord, une caisse « Pièces moteur » passe encore (15 t). Une deuxième ferait 23 t : dès qu'il reste moins de 8 t, son bouton se désactive.

### Ce qu'il faut remarquer

- **Le parcours d'un clic** : « Charger Munitions » → `CargoLoader` appelle `hold.load()` → le signal privé `crates` change → `loadedCrates`, `totalTons` et `remainingTons` changent → `CargoManifest` et `CargoGauge` se rafraîchissent. Les trois composants ne se connaissent pas.
- **`CargoBay` n'a aucun état** : il **fournit** la soute et assemble les trois composants, c'est tout. Comparé au module 4, il n'y a plus de `[crates]="..."` ni de `(load)="..."`. Remarque qu'il ne fait même pas `inject(CargoHold)` : il n'en a pas besoin, ce sont ses enfants qui s'en servent.
- **La règle métier est à un seul endroit** : `load()` refuse ce qui dépasse. Le `[disabled]` du bouton n'est qu'un confort pour l'utilisateur, pas la protection.
- **Aucun `new`** : Angular crée la soute la première fois qu'un enfant la demande, puis donne la même aux trois.
- **Chacun est fourni à son niveau** : la config (qui dépend de la partie de l'application) par la route, la soute (l'état de la page) par la page. Si tu quittes la page puis reviens, la soute repart **vide**. Pour la garder, on la fournirait sur la route, à côté de la config.
- **Pourquoi pas `@Service()` ici ?** Une soute racine chercherait `CARGO_CONFIG` depuis la racine, et ne le trouverait pas (NG0201, voir « Le piège » au § 8).

---

## Exercice : le Paquetage de l'escouade

> ⚠️ Ne regarde pas de solution : c'est à toi de jouer. Demande-moi des indices si tu bloques.

**Objectif** : avant une mission, chaque soldat prépare son **paquetage**. Il choisit des objets dans un catalogue, les voit dans son sac, et un résumé affiche le nombre d'objets et le poids total. Le sac a un **poids maximal**. Les trois zones de l'écran sont des composants **séparés**, qui partagent leur état grâce à un **service**. À la fin, tu donneras un paquetage **à chaque soldat** avec les injecteurs hiérarchiques.

```
LoadoutPage (la page : assemble, sans état)
├── LoadoutSummary   « 3 objets · 12,4 kg · reste 7,6 kg »
├── GearCatalog      la liste des objets disponibles, [Ajouter]
└── LoadoutBag       les objets choisis, [Retirer], [Vider le paquetage]

LoadoutStore (le service)   l'état partagé : la liste des objets choisis
LOADOUT_CONFIG (le jeton)   le poids maximal du sac
```

### Consignes

1. **Créer le widget du module** :
   - un dossier `src/app/widgets/06-services-di/`, avec dedans un composant `loadout-page` généré par la CLI ; le service, le jeton et les autres composants iront dans ce même dossier ;
   - une **route lazy** `06-services-di`, et une carte pour le module 6 sur la page d'accueil (titre : « Services et injection de dépendances ») ;
   - un `<h1>` « Paquetage de l'escouade ».

2. **Le modèle**, dans un fichier `gear.ts` :
   - une interface `Gear` avec `id`, `name` et `weight` (en kg, avec des décimales) ;
   - une constante exportée `GEAR_CATALOG` : un tableau de **6 objets** (par exemple une trousse de soins, une radio, des rations, une lampe, une corde, un drone de reconnaissance), avec des poids entre 0,5 et 8 kg.
   - Question : pourquoi une simple constante suffit ici, et pas un signal ?

3. **Le service `LoadoutStore`** (§ 2 et 4) :
   - généré avec la CLI : vérifie qu'il utilise bien `@Service()` ;
   - un signal **privé** `items` : la liste des objets choisis (vide au départ) ;
   - une propriété publique `selectedItems`, en **lecture seule** avec `asReadonly()` ;
   - trois méthodes : `addItem(gear)`, `removeItem(id)` et `clear()` ;
   - un objet ne peut être dans le sac qu'**une seule fois** : `addItem` ne fait rien s'il y est déjà.

4. **Les valeurs dérivées**, en `computed` publics dans le service :
   - `itemCount` : le nombre d'objets ;
   - `totalWeight` : le poids total (pense au `reduce` du module 4) ;
   - `selectedIds` : un `Set` des `id` choisis. Il servira à savoir rapidement si un objet est déjà dans le sac, avec `selectedIds().has(id)`.

5. **Le composant `GearCatalog`** :
   - il récupère le service avec `inject()`, et affiche `GEAR_CATALOG` avec `@for` : nom et poids (pipe `number`, comme au module 5) ;
   - un bouton « Ajouter » par objet, **désactivé** si l'objet est déjà dans le sac ;
   - le bouton a un `aria-label` qui contient le nom de l'objet (« Ajouter la radio »…), sinon un lecteur d'écran annoncerait 6 fois « Ajouter » sans dire quoi.

6. **Le composant `LoadoutBag`** :
   - la liste des objets choisis, avec un bouton « Retirer » pour chacun (avec un `aria-label` lui aussi) ;
   - un message « Le paquetage est vide. » quand il n'y a rien (`@empty`) ;
   - un bouton « Vider le paquetage », désactivé quand le sac est vide.

7. **Le composant `LoadoutSummary`**, placé dans un `<header>` de la page, à côté du `<h1>` :
   - il affiche « 3 objets · 12,4 kg » ;
   - Question : `LoadoutSummary`, `GearCatalog` et `LoadoutBag` ne reçoivent **aucun input** et n'émettent **aucun output**. Comment le résumé sait-il qu'un objet a été ajouté ? Dessine le chemin d'un clic sur « Ajouter », de bout en bout.
   - Question : qu'aurait-il fallu écrire dans `LoadoutPage` avec les inputs et outputs du module 4 ?

8. **Un poids maximal avec un `InjectionToken`** (§ 6) :
   - un fichier `loadout-config.ts` : une interface `LoadoutConfig` avec `maxWeight`, et un jeton `LOADOUT_CONFIG` ;
   - fourni dans les `providers` de **la route** `06-services-di`, avec `useValue` (par exemple 20 kg) ;
   - le service l'injecte, et expose un `computed` `remainingWeight` (le poids restant) ;
   - `addItem` refuse un objet qui ferait dépasser le maximum ; dans le catalogue, le bouton « Ajouter » est aussi désactivé dans ce cas ;
   - le résumé affiche le poids restant.
   - Lance l'application et ouvre la console (F12). Si une erreur apparaît, lis son message, puis relis « Le piège » au § 8 : où dois-tu maintenant fournir `LoadoutStore`, et faut-il changer son décorateur ? Pour choisir, demande-toi si le paquetage doit être gardé ou vidé quand on quitte la page.
   - Question : quel avantage à fournir le maximum par un jeton, plutôt que par une constante dans le service ?

9. **Un paquetage par soldat : les injecteurs hiérarchiques** (§ 8) :
   - un nouveau composant `SoldierLoadout`, avec un input `soldierName`, qui contient le résumé, le catalogue et le sac (déplace-les depuis `LoadoutPage`) ;
   - `LoadoutPage` affiche **deux** `SoldierLoadout` : « Kira » et « Marco » ;
   - **Expérience A** : sans rien changer d'autre, ajoute un objet chez Kira. Que se passe-t-il chez Marco ? Pourquoi ?
   - **Expérience B** : ajoute `providers: [LoadoutStore]` dans `SoldierLoadout`. Recommence. Qu'est-ce qui a changé ?
   - Questions : combien d'instances de `LoadoutStore` existent dans A, et dans B ? Où chaque instance trouve-t-elle `LOADOUT_CONFIG` ?

10. **Vérifier** : `npm test` et `npm run build` passent.
    - ⚠️ Le test généré pour le service (`loadout-store.spec.ts`) risque d'échouer avec l'erreur **NG0201** : lis bien le message. Indice : le `TestBed` a lui aussi un tableau `providers`, dans `TestBed.configureTestingModule({ ... })`. Les tests des composants peuvent échouer pour la même raison.
    - Ajoute **un vrai test** au service : après `addItem` de deux objets, `totalWeight()` vaut la somme de leurs poids.

### Critères de réussite

- [ ] La carte du module 6 sur l'accueil mène au paquetage, sans erreur dans la console
- [ ] Chaque composant récupère le service avec `inject()` (aucun `new`, aucune injection par constructeur), et le service est **fourni au bon niveau** : il trouve `LOADOUT_CONFIG` sans erreur NG0201
- [ ] Le signal `items` est **privé** ; les composants ne lisent que `selectedItems` (lecture seule), et ne modifient que par les méthodes
- [ ] Les composants ne s'échangent **aucun** input ni output pour l'état du paquetage
- [ ] Aucun calcul (total, nombre, poids restant) n'est fait dans un composant : tout est en `computed` dans le service
- [ ] Le poids maximal vient de `LOADOUT_CONFIG`, fourni par la route ; dépasser est impossible, même en appelant `addItem` directement
- [ ] Kira et Marco ont chacun **leur** paquetage
- [ ] Tous les boutons sont utilisables au clavier, et leur `aria-label` dit sur quel objet ils agissent
- [ ] `npm test` et `npm run build` passent

### Bonus (facultatif)

- **Une valeur par défaut** : donne à `LOADOUT_CONFIG` une `factory` avec `providedIn: 'root'` (§ 6). Retire le provider de la route : que se passe-t-il ? Remets-le avec une autre valeur : laquelle gagne, et pourquoi ?
- **`useClass`** : crée un service `LoadoutLogger` qui affiche dans la console chaque ajout et chaque retrait, appelé par `LoadoutStore`. Puis une classe `SilentLoadoutLogger` qui ne fait rien, et fournis-la à la place pour **un seul** des deux soldats (§ 7).
- **`injectAsync`** : un service `LoadoutExporter` qui affiche le paquetage en JSON dans la console, chargé seulement au clic sur un bouton « Exporter » (§ 9). Dans l'onglet **Réseau** (F12), vérifie qu'un fichier JavaScript n'est téléchargé qu'à ce moment-là.
