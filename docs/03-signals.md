# Module 3 — [Angular] Signals

> Durée estimée : 4–5 h · Widget : le Poste de ravitaillement (exercice, à coder toi-même)

## Ce que tu sauras faire à la fin

- Expliquer ce qu'est un signal et **pourquoi Angular en a besoin** pour mettre l'écran à jour
- Créer et modifier de l'état avec `signal`, `set` et `update`
- Calculer des valeurs dérivées avec `computed`, au lieu de les recalculer à la main
- Savoir quand utiliser `effect`… et surtout **quand ne pas l'utiliser**
- Utiliser `linkedSignal`, `untracked` et `asReadonly()` dans les cas où ils servent vraiment

| Priorité    | Notions                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| ★ cœur      | `signal` (`set`, `update`), `computed`, lecture dans le template, `effect` (et quand NE PAS l'utiliser) |
| ○ courant   | `linkedSignal`, `untracked`, signals en lecture seule (`asReadonly()`)                                  |
| · référence | `equal` personnalisé                                                                                    |

Fil rouge des exemples : **l'armurerie de l'Escouade**, où une recrue choisit une arme et tire avec son chargeur.

---

## 1. ★ Le problème : comment Angular sait-il quand redessiner ?

Au module 1, on a vu qu'Angular est **zoneless** : il n'y a plus zone.js pour surveiller tout ce qui se passe dans la page. Angular doit donc être **prévenu** quand une donnée affichée change. C'est le rôle des signals.

Fais l'expérience : dans un composant, une propriété simple modifiée après 2 secondes.

```ts
export class Experience {
  protected ammo = 30; // propriété simple

  constructor() {
    setTimeout(() => {
      this.ammo = 0; // la valeur change bien… mais l'écran affiche toujours 30
    }, 2000);
  }
}
```

L'écran reste bloqué sur 30 : rien n'a prévenu Angular que `ammo` avait changé. Avec un signal, ça marche :

```ts
export class Experience {
  protected readonly ammo = signal(30);

  constructor() {
    setTimeout(() => {
      this.ammo.set(0); // Angular est prévenu → l'écran passe à 0
    }, 2000);
  }
}
```

> 💡 Pourquoi ton tableau des missions fonctionnait-il au module 2 ? Parce que tout passait par des signals. Les clics `(click)` déclenchent aussi une mise à jour, mais seul un signal permet de mettre à jour l'écran **depuis n'importe où** : un minuteur, une réponse HTTP, un autre composant…

---

## 2. ★ `signal` : une boîte qui prévient quand son contenu change

Un signal, c'est **une valeur enveloppée dans une boîte**. La boîte sait **qui la lit**, et elle **prévient ces lecteurs** quand son contenu change.

```
                  ┌─────────────────┐
  set(25) ──────► │   ammo  =  25   │ ──── « j'ai changé ! » ───► le template qui lit ammo()
  update(…) ────► └─────────────────┘                              un computed qui lit ammo()
                          │
                     ammo() : lire la valeur
```

### Créer, lire, écrire

```ts
import { signal } from '@angular/core';

protected readonly ammo = signal(30);            // type déduit : WritableSignal<number>
protected readonly weapon = signal<string | null>(null); // type explicite si besoin

this.ammo();                        // LIRE : on appelle le signal comme une fonction → 30
this.ammo.set(12);                  // ÉCRIRE une nouvelle valeur
this.ammo.update((n) => n - 1);     // ÉCRIRE à partir de l'ancienne valeur → 11
```

| Méthode       | Quand l'utiliser                                         | Exemple                                |
| ------------- | -------------------------------------------------------- | -------------------------------------- |
| `set(valeur)` | la nouvelle valeur ne dépend **pas** de l'ancienne       | `reload()` : `ammo.set(30)`            |
| `update(fn)`  | la nouvelle valeur se **calcule à partir de** l'ancienne | `fire()` : `ammo.update((n) => n - 1)` |

### Dans le template

```html
<p>Munitions : {{ ammo() }}</p>
<button [disabled]="ammo() === 0" (click)="fire()">Tirer</button>
```

En **lisant** `ammo()` dans le template, celui-ci devient automatiquement un **lecteur** du signal. Tu n'as rien à déclarer : Angular note les signals lus pendant l'affichage, et ne redessine ce composant que quand l'un d'eux change.

### ⚠️ Le piège de la mutation (tu le connais déjà !)

Un signal compare l'ancienne et la nouvelle valeur avec `Object.is` (en pratique, `===`). Si tu modifies un objet ou un tableau **de l'intérieur**, c'est toujours **le même** objet : le signal ne voit aucun changement et ne prévient personne.

```ts
// ❌ mutation : même tableau → aucune notification
this.missions().push(nouvelle);

// ✅ nouveau tableau → le signal voit le changement
this.missions.update((list) => [...list, nouvelle]);
```

C'est exactement la règle « on ne mute jamais » que tu as appliquée au module 2 : maintenant, tu sais **pourquoi**.

> **Ne mets jamais `mutate`** : cette ancienne méthode des signals a été supprimée. On utilise toujours `set` ou `update` avec une nouvelle valeur.

---

## 3. ★ `computed` : une valeur calculée à partir d'autres signals

Beaucoup de valeurs affichées ne sont pas de l'état « en soi », mais **se déduisent** d'autres valeurs : le pourcentage de munitions se déduit des munitions et de la capacité. C'est le rôle de `computed`.

```ts
import { computed, signal } from '@angular/core';

protected readonly capacity = signal(30);
protected readonly ammo = signal(30);

// Recalculé automatiquement quand ammo OU capacity change
protected readonly ammoPercent = computed(() => Math.round((this.ammo() / this.capacity()) * 100));
protected readonly isEmpty = computed(() => this.ammo() === 0);
protected readonly isLow = computed(() => this.ammoPercent() < 20); // un computed peut lire un computed
```

```html
<p>Chargeur : {{ ammoPercent() }} %</p>
@if (isLow()) {
<p class="warning">Munitions faibles !</p>
}
```

### Le graphe des dépendances

Angular construit tout seul un **graphe** : qui dépend de qui. Quand une source change, seul ce qui en dépend est recalculé.

```
   capacity ──┐
              ├──► ammoPercent ──► isLow ──┐
   ammo ──────┤                            ├──► template
              └──► isEmpty ────────────────┘

   ammo.set(5)  →  ammoPercent, isEmpty et isLow sont marqués « à recalculer »
                →  le template se met à jour avec les nouvelles valeurs
```

### Les 4 propriétés à retenir

| Propriété                    | Ce que ça veut dire                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Lecture seule**            | un `computed` n'a ni `set` ni `update`. On change ses **sources**, pas lui                                                  |
| **Dépendances automatiques** | pas de liste à déclarer : ce que la fonction **lit** devient une dépendance                                                 |
| **Paresseux** (_lazy_)       | il ne calcule rien tant que personne ne le lit                                                                              |
| **Mémorisé** (_memoized_)    | tant que ses sources ne changent pas, il renvoie la valeur déjà calculée, sans refaire le calcul, même s'il est lu 100 fois |

> 🧠 C'est la réponse à la règle « le template affiche, la classe calcule » du module 2. Ton `@let count = missions().length` pouvait devenir `protected readonly count = computed(() => this.missions().length)` : le calcul est dans la classe, testable, et réutilisable par d'autres `computed`.

### `computed` ou méthode ?

```ts
protected percent(): number { return …; }               // méthode : recalculée à CHAQUE appel
protected readonly percent = computed(() => …);          // computed : recalculé seulement si une source change
```

Les deux s'écrivent `percent()` dans le template. Pour une valeur dérivée de signals, préfère **toujours** `computed` : c'est plus performant, et c'est la convention du projet.

---

## 4. ★ `effect` : réagir à un changement par une action extérieure

Un `effect` exécute du code **chaque fois que les signals qu'il lit changent**. Il ne renvoie pas de valeur : il **fait** quelque chose.

```ts
import { effect, signal } from '@angular/core';

export class Armory {
  protected readonly weapon = signal(localStorage.getItem('weapon') ?? 'Fusil plasma');

  constructor() {
    // Sauvegarde l'arme choisie dans le navigateur, à chaque changement
    effect(() => {
      localStorage.setItem('weapon', this.weapon());
    });
  }
}
```

À savoir :

- il s'exécute **au moins une fois** au démarrage, puis à chaque changement d'un signal lu ;
- il doit être créé dans un **contexte d'injection** : le `constructor`, ou l'initialisation d'une propriété. Ailleurs, Angular lève une erreur (on verra les contextes d'injection au module 6) ;
- il s'exécute **un peu après** le changement, pas immédiatement : si tu fais trois `set` d'affilée, l'effet ne tourne qu'une fois, avec la dernière valeur ;
- il est détruit automatiquement avec le composant.

### ✅ Quand utiliser `effect`

Pour **synchroniser un signal avec quelque chose qui n'est pas un signal** :

| Cas                     | Exemple                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Stockage du navigateur  | sauvegarder dans `localStorage` (ci-dessus)                                                                |
| Journal / analytics     | envoyer un événement « arme changée »                                                                      |
| API du DOM hors Angular | mettre le focus, dessiner dans un `<canvas>`, piloter une carte ou un graphique d'une bibliothèque externe |

### ❌ Quand NE PAS utiliser `effect` (l'anti-pattern n°1)

**Pour calculer ou recopier de l'état.** C'est l'erreur la plus courante :

```ts
// ❌ ANTI-PATTERN : un effect qui recopie une valeur dérivée dans un autre signal
protected readonly ammoPercent = signal(100);
constructor() {
  effect(() => {
    this.ammoPercent.set(Math.round((this.ammo() / this.capacity()) * 100));
  });
}

// ✅ C'est exactement le travail d'un computed
protected readonly ammoPercent = computed(() => Math.round((this.ammo() / this.capacity()) * 100));
```

Pourquoi l'effect est-il pire ?

- **décalage** : pendant un court instant, `ammoPercent` a encore l'ancienne valeur, car l'effect tourne « un peu après » ;
- **plus de code** et un signal modifiable qu'on pourrait changer par erreur ailleurs ;
- **risque de boucle** : un effect qui écrit dans un signal qu'il lit lui-même se relance à l'infini.

> 🧠 La règle : **une valeur qui se déduit d'autres valeurs → `computed`. Une action vers l'extérieur → `effect`.** Si ton effect contient un `.set()` vers un autre signal, demande-toi d'abord si un `computed` (ou un `linkedSignal`, section 5) ne ferait pas l'affaire.

---

## 5. ○ `linkedSignal` : une valeur dérivée… mais modifiable

Parfois, une valeur **dépend** d'une autre, mais l'utilisateur doit aussi pouvoir la **changer**. Exemple : quand on choisit une arme, le chargeur est **plein** (valeur dérivée de la capacité de l'arme). Mais ensuite on **tire**, et les munitions baissent (valeur modifiée à la main). Si on change d'arme, le chargeur doit **redevenir plein**.

- `computed` ne convient pas : on ne peut pas faire `set` dessus pour tirer.
- `signal` + `effect` qui recopie la capacité : c'est l'anti-pattern de la section 4.
- **`linkedSignal`** est fait pour ça :

```ts
import { linkedSignal, signal } from '@angular/core';

interface Weapon {
  name: string;
  capacity: number;
}

protected readonly weapon = signal<Weapon>({ name: 'Fusil plasma', capacity: 30 });

// Vaut la capacité de l'arme… et se RÉINITIALISE quand l'arme change
protected readonly ammo = linkedSignal(() => this.weapon().capacity);

protected fire(): void {
  this.ammo.update((n) => Math.max(n - 1, 0)); // modifiable comme un signal normal
}

protected selectWeapon(weapon: Weapon): void {
  this.weapon.set(weapon); // → ammo revient automatiquement à weapon.capacity
}
```

```
 weapon = Fusil (30)   →  ammo = 30
 fire() × 5            →  ammo = 25        (modifié à la main)
 weapon = Lance-flammes (100)  →  ammo = 100   (réinitialisé par la source)
```

|                                  | `computed` | `linkedSignal` | `signal` |
| -------------------------------- | ---------- | -------------- | -------- |
| Dérivé d'autres signals          | ✅         | ✅             | ❌       |
| Modifiable avec `set` / `update` | ❌         | ✅             | ✅       |

**Forme avancée** : on peut accéder à l'ancienne valeur, pour décider de **garder** la valeur actuelle quand c'est possible. Exemple typique : garder l'élément sélectionné si la liste change mais qu'il existe toujours.

```ts
protected readonly selected = linkedSignal<Weapon[], Weapon | undefined>({
  source: this.weapons,
  computation: (list, previous) =>
    // si l'arme sélectionnée existe encore dans la nouvelle liste, on la garde ; sinon, la première
    list.find((w) => w.name === previous?.value?.name) ?? list[0],
});
```

---

## 6. ○ `untracked` : lire un signal sans en dépendre

Dans un `computed` ou un `effect`, **tout** signal lu devient une dépendance. Parfois, on veut lire une valeur **sans** que son changement relance le calcul. C'est le rôle de `untracked`.

```ts
import { effect, untracked } from '@angular/core';

constructor() {
  effect(() => {
    const weapon = this.weapon();                 // dépendance : l'effect tourne quand l'arme change
    const ammo = untracked(() => this.ammo());    // lu, mais PAS une dépendance
    console.log(`Changement d'arme : ${weapon.name} (il restait ${ammo} munitions)`);
  });
}
```

Sans `untracked`, l'effect se relancerait **à chaque tir**, et le journal afficherait « Changement d'arme » alors qu'on n'a fait que tirer.

_Quand y penser_ : dans un `effect`, dès que tu lis un signal « pour information » et que son changement ne doit pas relancer l'action.

---

## 7. ○ `asReadonly()` : partager un signal sans permettre de le modifier

`asReadonly()` crée une **vue en lecture seule** d'un signal : on peut la lire, mais pas appeler `set` ni `update` dessus.

```ts
private readonly _ammo = signal(30);            // modifiable, mais privé
readonly ammo = this._ammo.asReadonly();        // public, en lecture seule

fire(): void {
  this._ammo.update((n) => n - 1);              // seules les méthodes de la classe modifient l'état
}
```

**Pourquoi ?** Pour que **toutes les modifications passent par les méthodes** de la classe, qui appliquent les règles (pas de munitions négatives, etc.). Les autres parties du code peuvent lire, mais pas tricher.

Dans un composant seul, c'est peu utile : le template est le seul lecteur. Ça devient essentiel quand un **service** partage de l'état entre plusieurs composants (module 6) : c'est le schéma « état privé, lecture publique, méthodes de mise à jour » du store maison (module 20).

---

## 8. · Référence : `equal` personnalisé

Par défaut, un signal compare avec `Object.is`. On peut fournir sa propre comparaison :

```ts
const position = signal({ x: 0, y: 0 }, { equal: (a, b) => a.x === b.x && a.y === b.y });
position.set({ x: 0, y: 0 }); // nouvel objet, mais « égal » → aucune notification
```

_Quand y penser_ : quand un signal reçoit souvent un **nouvel objet identique** (par exemple une réponse serveur qui n'a pas changé) et que tu veux éviter des recalculs inutiles.

---

> ### Legacy : ce que tu verras en entreprise (·)
>
> Avant les signals (Angular < 16), l'état était dans des **propriétés simples**, et c'est zone.js qui déclenchait la vérification de **tout** l'arbre de composants après chaque événement.
>
> ```ts
> // AVANT
> export class ArmoryComponent {
>   ammo = 30; // propriété simple
>   get ammoPercent() {
>     return (this.ammo / 30) * 100;
>   } // getter : recalculé à CHAQUE vérification
>
>   constructor(private cdr: ChangeDetectorRef) {}
>   fire() {
>     this.ammo--;
>     this.cdr.markForCheck(); // parfois nécessaire pour forcer l'affichage
>   }
> }
> ```
>
> | Ancien                                                    | Moderne                                                     |
> | --------------------------------------------------------- | ----------------------------------------------------------- |
> | `ammo = 30` (propriété) + zone.js                         | `ammo = signal(30)`                                         |
> | `this.ammo--`                                             | `this.ammo.update((n) => n - 1)`                            |
> | `get ammoPercent()` (getter)                              | `ammoPercent = computed(() => …)`                           |
> | `ngOnChanges` pour réagir à un changement d'input         | `computed` ou `linkedSignal` à partir de l'input (module 4) |
> | `BehaviorSubject` dans un service pour partager de l'état | `signal` privé + `asReadonly()` (modules 6 et 17)           |
> | `ChangeDetectorRef.markForCheck()`                        | inutile avec les signals                                    |

---

## Exemple générique : le chargeur de l'armurerie

Voici un composant complet qui réunit les notions du module. **Lis-le, ne le recopie pas** : l'exercice te demandera d'écrire le tien, sur un autre sujet. Les `§` renvoient aux sections de la leçon.

```ts
// armory-panel.ts
import { Component, computed, effect, linkedSignal, signal, untracked } from '@angular/core';

interface Weapon {
  id: number;
  name: string;
  capacity: number;
}

const WEAPONS: Weapon[] = [
  { id: 1, name: 'Fusil plasma', capacity: 30 },
  { id: 2, name: 'Lance-flammes', capacity: 100 },
  { id: 3, name: 'Canon sonique', capacity: 6 },
];

@Component({
  selector: 'app-armory-panel',
  templateUrl: './armory-panel.html',
  styleUrl: './armory-panel.scss',
})
export class ArmoryPanel {
  protected readonly weapons = WEAPONS;

  // §2 : l'état de base, dans des signals
  protected readonly weapon = signal<Weapon>(WEAPONS[0]);
  protected readonly shotsFired = signal(0);

  // §5 : dérivé de l'arme, mais modifiable (on tire) ; revient au max quand l'arme change
  protected readonly ammo = linkedSignal(() => this.weapon().capacity);

  // §3 : valeurs dérivées
  protected readonly ammoPercent = computed(() =>
    Math.round((this.ammo() / this.weapon().capacity) * 100),
  );
  protected readonly isEmpty = computed(() => this.ammo() === 0);
  protected readonly isLow = computed(() => !this.isEmpty() && this.ammoPercent() < 20);

  constructor() {
    // §4 + §6 : action extérieure (journal), relancée seulement quand l'arme change
    effect(() => {
      const weapon = this.weapon();
      const shots = untracked(() => this.shotsFired());
      console.log(`[Armurerie] ${weapon.name} équipé (${shots} tirs depuis le début)`);
    });
  }

  protected selectWeapon(id: number): void {
    const weapon = this.weapons.find((w) => w.id === id);
    if (weapon) {
      this.weapon.set(weapon); // §2 : set, la nouvelle valeur ne dépend pas de l'ancienne
    }
  }

  protected fire(): void {
    if (this.isEmpty()) {
      return; // clause de garde : on lit un computed dans la classe aussi
    }
    this.ammo.update((n) => n - 1); // §2 : update, à partir de l'ancienne valeur
    this.shotsFired.update((n) => n + 1);
  }

  protected reload(): void {
    this.ammo.set(this.weapon().capacity);
  }
}
```

```html
<!-- armory-panel.html -->
<h2>Armurerie</h2>

<div class="weapons">
  @for (w of weapons; track w.id) {
  <button type="button" [attr.aria-pressed]="w.id === weapon().id" (click)="selectWeapon(w.id)">
    {{ w.name }}
  </button>
  }
</div>

<!-- §2 : lire un signal dans le template = s'y abonner automatiquement -->
<p>
  {{ weapon().name }} : {{ ammo() }} / {{ weapon().capacity }} munitions ({{ ammoPercent() }} %)
</p>

<!-- §3 : des computed utilisés comme conditions -->
@if (isEmpty()) {
<p class="alert">Chargeur vide ! Rechargez.</p>
} @else if (isLow()) {
<p class="warning">Munitions faibles.</p>
}

<button type="button" [disabled]="isEmpty()" (click)="fire()">Tirer</button>
<button type="button" (click)="reload()">Recharger</button>
<p>Tirs depuis le début : {{ shotsFired() }}</p>
```

**Ce qu'il faut remarquer :**

1. **Peu d'état, beaucoup de dérivé** : seuls `weapon`, `shotsFired` et `ammo` sont de l'état. Tout le reste (`ammoPercent`, `isEmpty`, `isLow`) est **calculé**, donc ne peut jamais être incohérent.
2. **`linkedSignal` pour `ammo`** : change d'arme après quelques tirs, le chargeur revient au maximum de la nouvelle arme, sans aucun code de « réinitialisation ».
3. **L'`effect` ne fait que du journal** (une action vers l'extérieur), et grâce à `untracked`, il ne se relance pas à chaque tir.
4. **`set` ou `update`** : `set` quand on remplace (choisir une arme, recharger), `update` quand on part de l'ancienne valeur (tirer).
5. **Le template ne calcule rien** : il ne fait que lire des signals et des computed.

---

## Exercice : le Poste de ravitaillement

> ⚠️ Ne regarde pas de solution : c'est à toi de jouer. Demande-moi des indices si tu bloques.

**Objectif** : avant chaque mission, l'escouade charge son camion de ravitaillement. Crée un composant qui gère les ressources à embarquer, calcule le poids total, et indique si le camion peut partir.

### Consignes

1. **Créer le widget du module** :
   - génère le composant `supply-depot` avec la CLI, dans `src/app/widgets/03-signals/` ;
   - ajoute une **route lazy** `03-signals` et une carte pour le module 3 sur la page d'accueil (titre : « Signals ») ;
   - un `<h1>` « Poste de ravitaillement ».

2. **Le modèle** : un type `Supply` avec `id`, `name`, `quantity` (nombre d'unités embarquées) et `unitWeight` (poids d'une unité, en kg).

3. **L'état (`signal`)** :
   - un signal `supplies` avec 4 ressources de départ (par exemple : rations, munitions, cellules d'énergie, médikits), quantités et poids différents ;
   - un signal `truckCapacity` : la charge maximale du camion, par exemple 500 kg.

4. **Les valeurs dérivées (`computed`)**, au moins :
   - `totalWeight` : le poids total embarqué (somme de `quantity × unitWeight`) ;
   - `loadPercent` : le pourcentage de remplissage du camion ;
   - `isOverloaded` : `true` si le poids dépasse la capacité ;
   - `canDepart` : le camion peut partir s'il n'est **pas** en surcharge **et** s'il transporte **au moins** quelque chose.

   Indice : pour la somme, cherche la méthode de tableau `reduce`.

5. **L'affichage** :
   - la liste des ressources (`@for`), avec pour chacune son nom, sa quantité et son poids total ;
   - le poids total et la capacité, et une **barre de chargement** (tu sais faire, module 2 !) ;
   - un message selon l'état du camion (`@if` / `@else`) : « Surcharge ! », « Camion vide », ou « Prêt au départ » ;
   - un bouton « Départ du convoi », désactivé si `canDepart()` est faux.

6. **Les actions (`set` / `update`)** :
   - des boutons **« + »** et **« − »** pour chaque ressource. La quantité ne descend jamais sous 0 ;
   - un bouton **« Tout décharger »** qui remet toutes les quantités à 0 ;
   - choisis à chaque fois entre `set` et `update`, et sache justifier ton choix.

7. **L'`effect` (le bon usage)** : sauvegarde les quantités dans `localStorage` à chaque changement, et relis-les au démarrage pour que le chargement survive à un rechargement de la page. C'est un cas légitime d'`effect` : on synchronise un signal avec quelque chose d'**extérieur** à Angular.
   - Indices : `localStorage` ne stocke que du texte → `JSON.stringify` pour écrire, `JSON.parse` pour relire. Pense au cas où rien n'est encore sauvegardé.

8. **Vérifier** : `npm test` et `npm run build` passent.

### Critères de réussite

- [ ] La carte du module 3 sur l'accueil mène au poste de ravitaillement, sans erreur dans la console
- [ ] Le poids total, le pourcentage et les messages se mettent à jour **tout seuls** à chaque « + » / « − »
- [ ] Aucune valeur dérivée n'est stockée dans un `signal` modifié à la main : tout ce qui se calcule est un `computed`
- [ ] Le seul `effect` sert à la sauvegarde (aucun `effect` qui fait `.set()` sur un autre signal)
- [ ] Les quantités ne deviennent jamais négatives, et le tableau n'est jamais muté
- [ ] Après un rechargement de la page (F5), les quantités sont restaurées
- [ ] Le template ne contient aucun calcul : il lit des signals et des computed
- [ ] Accessibilité : boutons « + » / « − » avec un `aria-label` qui commence par le texte visible et précise la ressource, barre de chargement avec ses attributs ARIA
- [ ] `npm test` et `npm run build` passent

### Bonus (facultatif)

- **`linkedSignal`** : ajoute un sélecteur de **véhicule** (camion léger 300 kg, camion lourd 800 kg…). Quand on change de véhicule, un champ « charge autorisée » repart de la capacité du véhicule, mais l'utilisateur peut l'abaisser à la main (par exemple pour un terrain difficile).
- **`asReadonly()`** : rends `supplies` privé et expose une version en lecture seule au template. Toutes les modifications doivent passer par tes méthodes.
- **`untracked`** : ajoute un second `effect`, de journal, qui écrit dans la console « Capacité changée : X kg (chargement actuel : Y kg) » **seulement quand la capacité change**, pas à chaque « + » / « − ». Le poids actuel doit donc être lu sans en dépendre. (Pour que la capacité puisse changer, fais d'abord le bonus du véhicule, ou ajoute deux boutons qui modifient `truckCapacity`.)

Quand tu as fini (ou si tu bloques), dis-le-moi : je relirai ton code.
