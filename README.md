# Évaluation 360° — LA TULIPE FOOD

Application RH de digitalisation de l'évaluation 360° des responsables,
chefs d'équipe et superviseurs.

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # puis renseigner vos clés Supabase
npm run dev
```

## Étapes du projet

- [x] Étape 1 — Analyse du fichier Excel de référence
- [x] Étape (validation) — Architecture fonctionnelle et technique validées
- [x] Création du projet — Next.js + TypeScript + Tailwind + client Supabase (base)
- [ ] Connexion Supabase (schéma + policies RLS)
- [ ] Authentification
- [ ] Gestion des collaborateurs / postes / services / sites
- [ ] Critères d'évaluation
- [ ] Campagnes
- [ ] Attribution des évaluateurs
- [ ] Formulaire d'évaluation
- [ ] Calcul des scores
- [ ] Résultats
- [ ] Plans d'action
- [ ] Entretiens
- [ ] Dashboards (DRH / N+1 / Collaborateur)
- [ ] Rapports PDF / Exports
- [ ] Audit logs
- [ ] Tests, sécurité, déploiement

## Base de données (étape "Connexion Supabase")

Le schéma complet et les données de référence réelles (17 postes, 48 critères,
23 collaborateurs, issus du fichier Excel) se trouvent dans `supabase/migrations/` :

1. `0001_schema_initial.sql` — tables, types, policies RLS
2. `0002_seed_referentiel.sql` — données réelles (postes, critères, sites, collaborateurs)

**À exécuter dans Supabase > SQL Editor**, dans cet ordre, chacun en une seule fois.

Testé avant livraison sur une instance PostgreSQL 16 locale : 0 erreur SQL,
comptages vérifiés (17 postes / 12 actifs, 48 critères, 23 employés, 15
rattachements N+1 résolus), et RLS vérifiée fonctionnellement (un N+1 ne voit
que son équipe, la DRH voit tout).

### Points laissés ouverts (voir commentaires dans le fichier seed) :
- Postes sans grille de critères créés inactifs : Gestionnaire de stock, Gestionnaire
  Chambre Froide, Agent de Pesée, Responsable des Ventes, Superviseur Général
- Rattachements approximatifs à confirmer : "Responsable financier" → grille
  "Responsable Comptabilité/Finance", "Agent Vérificateur" → grille "Contrôle/Vérification"
- 3 N+1 du Comité de Direction (SISSOKO MAÏMOUNA, GUI DIBO EMMA, DAGO JEAN VINCENT)
  sans matricule dans l'annuaire : liens manager non résolus pour 8 employés

## Authentification (étape suivante réalisée)

- Page `/login` (e-mail + mot de passe, via Supabase Auth)
- `/dashboard` protégé : redirige vers `/login` si non connecté (vérifié par test HTTP : 307 vers /login)
- `/` redirige automatiquement vers `/dashboard` ou `/login` selon la session
- Déconnexion via Server Action (`src/app/login/actions.ts`)
- **Non testé de bout en bout** : l'environnement de génération de ce code n'a pas
  d'accès réseau vers supabase.com, donc la connexion réelle (saisie d'identifiants
  → session valide) n'a pu être vérifiée que structurellement (redirections HTTP
  correctes, formulaire affiché, build/lint/types sans erreur). À tester par vos soins.

### Créer le premier compte (DRH) — à faire manuellement dans Supabase :
1. Authentication > Users > "Add user" > renseignez un e-mail + mot de passe
2. Copiez l'UUID du nouvel utilisateur affiché dans la liste
3. Dans SQL Editor, exécutez :
   ```sql
   insert into public.profiles (id, role, full_name)
   values ('UUID_COPIÉ', 'drh', 'Nom Prénom');
   ```
4. Testez la connexion sur `/login` avec cet e-mail/mot de passe

## Gestion des collaborateurs (DRH) — étape suivante réalisée

- `/dashboard/collaborateurs` : liste des 23 collaborateurs (poste, site, N+1,
  statut du compte), réservée au rôle DRH (redirection sinon)
- Bouton "Créer un compte" par collaborateur sans compte : génère un mot de
  passe temporaire affiché une seule fois, crée le compte Supabase Auth, et
  le relie à l'employé + à un profil (rôle choisi)
- **Nécessite la variable d'environnement `SUPABASE_SERVICE_ROLE_KEY`** (clé
  secrète, jamais envoyée au navigateur) pour fonctionner : à ajouter dans
  Vercel (voir ci-dessous)

## Référentiel (postes, sites, critères) — étape suivante réalisée

- `/dashboard/referentiel` (DRH uniquement) :
  - Sites : liste + ajout
  - Postes : liste, activer/désactiver, ajout d'un nouveau poste
  - Critères : par poste sélectionné, liste, activer/désactiver, ajout
- Pas de suppression ni de renommage pour l'instant (activer/désactiver suffit
  à retirer un élément du circuit d'évaluation sans perdre l'historique) — à
  ajouter plus tard si besoin
- Aucune nouvelle variable d'environnement nécessaire pour cette étape

## Campagnes d'évaluation — étape suivante réalisée

- `/dashboard/campagnes` (DRH uniquement) :
  - Création d'une campagne (année + période Avril/Juillet/Octobre/Janvier +
    dates optionnelles) — nom généré automatiquement, doublon détecté
  - Liste des campagnes avec changement de statut (Planifiée / Ouverte /
    Clôturée / Prolongée) directement depuis le tableau
- Pas encore d'attribution de collaborateurs/évaluateurs à une campagne — sera
  l'étape suivante du plan
- Aucune nouvelle variable d'environnement nécessaire

## Attribution des évaluateurs — étape suivante réalisée

- `/dashboard/attributions?campagne=<id>` (DRH uniquement) :
  - Bouton "Générer auto-évaluations + N+1 + collaborateurs" : crée
    automatiquement, pour chaque employé actif, son auto-évaluation, celle de
    son N+1 (si renseigné) et celles de ses subordonnés directs — testé
    idempotent (relancer ne duplique rien)
  - Ajout manuel des évaluations entre pairs (aucune règle fiable pour les
    déduire automatiquement des données disponibles)
  - Suppression d'une attribution individuelle
- Testé sur PostgreSQL local avant livraison : 23 auto-évaluations, 15 N+1,
  15 collaborateurs générées correctement à partir des données réelles
- Aucune nouvelle variable d'environnement nécessaire

## Formulaire d'évaluation — étape suivante réalisée

- `/dashboard/mes-evaluations` : liste des évaluations attribuées à
  l'utilisateur connecté (campagne, personne évaluée, source, statut)
- `/dashboard/mes-evaluations/[id]` : formulaire de notation par critère
  (1 à 5, avec libellé), commentaire facultatif, barre de progression
  ("X / N critères complétés"), sauvegarde automatique à chaque note/commentaire,
  soumission bloquée tant que tous les critères ne sont pas notés, formulaire
  verrouillé après soumission
- Accessible à tous les rôles (pas seulement la DRH) — chacun ne voit que ses
  propres évaluations attribuées
- Testé de bout en bout sur PostgreSQL local avec les vraies données : création
  d'évaluation, sauvegarde de 4 réponses, soumission réussie ; confidentialité
  vérifiée (un autre collaborateur ne voit strictement rien de l'évaluation)
- Aucune nouvelle variable d'environnement nécessaire
