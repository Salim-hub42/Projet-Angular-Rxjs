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
| ⬜ | Anatomie d'un `@Component` (`selector`, `template` / `templateUrl`, `styles`, `imports`) | ★ | Tableau des expériences | `widgets/02-composants-templates/experiment-board/experiment-board.ts` | À chaque composant : déclarer sa balise et ce que son template utilise |
| ⬜ | Interpolation `{{ }}` | ★ | Tableau des expériences | `experiment-board.html` | Pour afficher n'importe quelle donnée sous forme de texte |
| ⬜ | Property binding `[prop]` | ★ | Tableau des expériences | `experiment-board.html` | Pour piloter une propriété d'un élément : `[disabled]`, `[src]`, inputs des composants enfants |
| ⬜ | Event binding `(event)`, `$event`, filtres de touches | ★ | Tableau des expériences | `experiment-board.html` | Pour réagir aux clics, à la saisie, au clavier |
| ⬜ | `[class.x]` / `[style.x]` / `[attr.x]` | ★ | Tableau des expériences | `experiment-board.html` | États visuels (sélectionné, erreur), valeurs calculées (largeur, couleur), attributs `aria-*` |
| ⬜ | `@if` / `@else if` / `@else` | ★ | Tableau des expériences | `experiment-board.html` | Chargement, erreur, liste vide, droits d'accès |
| ⬜ | `@for` (`track`, `$index`, `$last`, `@empty`) | ★ | Tableau des expériences | `experiment-board.html` | Toute liste : tableaux, menus, résultats de recherche |
| ⬜ | `@switch` / `@case` / `@default` | ★ | Tableau des expériences | `experiment-board.html` | Afficher selon un statut ou un type (commande, rôle, étape) |
| ⬜ | Variables de template `#ref` | ○ | Tableau des expériences | `experiment-board.html` | Lire un champ ou donner le focus sans passer par la classe |
| ⬜ | `@let` | ○ | Tableau des expériences | `experiment-board.html` | Éviter de répéter une expression dans le template |
| ⬜ | Encapsulation des styles (`:host`, `ViewEncapsulation`) | ○ | Tableau des expériences | `experiment-board.scss` | Toujours : styles limités au composant, thème partagé par variables CSS |
| — | Membres privés dans les templates (v22.2) | · | — | — | En lisant du code récent qui n'utilise plus `protected` |
