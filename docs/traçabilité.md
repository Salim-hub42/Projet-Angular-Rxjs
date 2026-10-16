# Table de traçabilité

Une ligne par notion. Cocher ✅ quand la notion est pratiquée dans un widget (★ et ○ doivent toutes l'être à la fin du parcours).

Légende : ★ cœur · ○ courant · · référence

## Module 1 — [Angular] Architecture et outillage

| ✓ | Notion | Priorité | Widget | Fichier | Quand l'utiliser en vrai |
| --- | --- | --- | --- | --- | --- |
| ✅ | Angular CLI (`ng new`, `ng generate`, `ng serve`, `ng build`, `ng test`) | ★ | Coquille | — | Tous les jours : générer composants et services, lancer le serveur de dev, les tests et le build |
| ✅ | Structure d'un projet | ★ | Coquille | `src/`, `src/app/home/home-lab/` | Pour se repérer en arrivant sur un projet existant |
| ✅ | `main.ts` → `bootstrapApplication` → `app.config.ts` | ★ | Coquille | `src/main.ts`, `src/app/app.config.ts` | Quand on active une fonctionnalité globale (`provideHttpClient`, `provideRouter`…) ou qu'on débogue un écran blanc |
| ✅ | Composant racine | ★ | Coquille | `src/app/app.ts` | Pour la mise en page commune : en-tête, navigation, `<router-outlet />` |
| ✅ | `angular.json` | ○ | Coquille | `angular.json` | Pour ajuster les budgets, les configurations de build ou les styles globaux |
| ✅ | Standalone vs NgModule | ○ | Coquille | `src/app/app.ts` | Pour écrire du standalone, et savoir lire les `NgModule` des projets anciens |
| ✅ | Zoneless | ○ | Coquille | `package.json` (pas de zone.js) | Toujours : l'état affiché passe par des signals |
| — | Angular DevTools | · | — | — | Pour inspecter les composants et les signals quand l'affichage n'est pas celui attendu |
| — | MCP Angular | · | — | `.vscode/mcp.json` | Pour qu'un assistant IA propose du code Angular à jour |

## Module 2 — [Angular] Composants et templates

| ✓ | Notion | Priorité | Widget | Fichier | Quand l'utiliser en vrai |
| --- | --- | --- | --- | --- | --- |
| ✅ | Anatomie d'un `@Component` (`selector`, `template` / `templateUrl`, `styles`, `imports`) | ★ | Tableau des missions | `widgets/02-composants-templates/mission-board/mission-board.ts` | À chaque composant : déclarer sa balise et ce que son template utilise |
| ✅ | Interpolation `{{ }}` | ★ | Tableau des missions | `mission-board.html` | Pour afficher n'importe quelle donnée sous forme de texte |
| ✅ | Property binding `[prop]` | ★ | Tableau des missions | `mission-board.html` | Pour piloter une propriété d'un élément : `[disabled]`, `[src]`, inputs des composants enfants |
| ✅ | Event binding `(event)`, `$event`, `<form (submit)>` | ★ | Tableau des missions | `mission-board.html` | Pour réagir aux clics, à la saisie, au clavier |
| ✅ | `[class.x]` / `[style.x]` / `[attr.x]` | ★ | Tableau des missions | `mission-board.html` | États visuels (sélectionné, erreur), valeurs calculées (largeur, couleur), attributs `aria-*` |
| ✅ | `@if` / `@else if` / `@else` | ★ | Tableau des missions | `mission-board.html` | Chargement, erreur, liste vide, droits d'accès |
| ✅ | `@for` (`track`, `$odd`, `@empty`) | ★ | Tableau des missions | `mission-board.html` | Toute liste : tableaux, menus, résultats de recherche |
| ✅ | `@switch` / `@case` / `@default` | ★ | Tableau des missions | `mission-board.html` | Afficher selon un statut ou un type (commande, rôle, étape) |
| ✅ | Variables de template `#ref` | ○ | Tableau des missions | `mission-board.html` | Lire un champ ou donner le focus sans passer par la classe |
| ✅ | `@let` | ○ | Tableau des missions | `mission-board.html` | Éviter de répéter une expression dans le template |
| ✅ | Encapsulation des styles (`:host`, `ViewEncapsulation`) | ○ | Tableau des missions | `mission-board.scss` | Toujours : styles limités au composant, thème partagé par variables CSS |
| — | Membres privés dans les templates (v22.2) | · | — | — | En lisant du code récent qui n'utilise plus `protected` |

## Module 3 — [Angular] Signals

| ✓ | Notion | Priorité | Widget | Fichier | Quand l'utiliser en vrai |
| --- | --- | --- | --- | --- | --- |
| ⬜ | `signal` (`set`, `update`) | ★ | Poste de ravitaillement | `widgets/03-signals/supply-depot/supply-depot.ts` | Pour tout état local affiché : il prévient Angular quand il change |
| ⬜ | `computed` | ★ | Poste de ravitaillement | `supply-depot.ts` | Pour toute valeur qui se déduit d'autres valeurs : totaux, filtres, états « valide / vide / plein » |
| ⬜ | Lecture des signals dans le template | ★ | Poste de ravitaillement | `supply-depot.html` | Toujours : `valeur()` dans le template abonne automatiquement le composant |
| ⬜ | `effect` (et quand NE PAS l'utiliser) | ★ | Poste de ravitaillement | `supply-depot.ts` | Pour synchroniser un signal avec l'extérieur (localStorage, journal, DOM, bibliothèque tierce) ; jamais pour calculer de l'état |
| ⬜ | `linkedSignal` | ○ | Poste de ravitaillement (bonus) | `supply-depot.ts` | Pour une valeur dérivée qui doit rester modifiable : sélection dans une liste, valeur par défaut réinitialisée |
| ⬜ | `untracked` | ○ | Poste de ravitaillement (bonus) | `supply-depot.ts` | Dans un `effect`, pour lire un signal « pour information » sans qu'il relance l'effet |
| ⬜ | `asReadonly()` | ○ | Poste de ravitaillement (bonus) | `supply-depot.ts` | Pour exposer un état en lecture seule et forcer les modifications à passer par des méthodes (services, stores) |
| — | `equal` personnalisé | · | — | — | Quand un signal reçoit souvent un nouvel objet identique et que les recalculs coûtent cher |
