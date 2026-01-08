# Plan d'implémentation - Mystery Box

> Fichier de suivi pour l'implémentation de la règle spéciale "Mystery Box"
> Journée sportive (matchday) 18 - Active du Lundi 00h00 au Dimanche 23h59

---

## Vue d'ensemble

La Mystery Box attribue aléatoirement un bonus ou malus à chaque utilisateur via une roue (côté admin). Les utilisateurs découvrent leur item le lundi et peuvent l'utiliser pendant la semaine (ou la saison pour certains).

**Utilisateurs** : 20 joueurs
**Items** : 8 types (5 bonus, 3 malus)
**Note** : Une règle supplémentaire sera ajoutée + possibilité d'augmenter certains max_count

---

## Récapitulatif des items

| Key | Type | Max | Résumé |
|-----|------|-----|--------|
| `golden_ticket` | bonus | 1   | Annuler une contribution (utilisable toute la saison) |
| `steps_shop` | bonus | 3   | Choisir un article du shop via popup |
| `double_buteur` | bonus | 3   | Choisir 2 buteurs sur le match bonus |
| `buteur_or` | bonus | 3   | Points buteur x2 sur le match bonus |
| `double_dose` | bonus | 3   | "[Équipe] ou Nul" sur UN match au choix |
| `balle_perdue` | malus | 1   | Retirer 1pt à un autre joueur (visible classement) |
| `communisme` | malus | 1   | Partage des pronos en binôme (4+4+bonus partagé) |
| `mal_au_coeur` | malus | 4   | Impossible de miser V sur son équipe de cœur |

---

## Détail par item

### 1. Golden Ticket (bonus)
**Comportement utilisateur :**
- Affiche un ticket doré sur le dashboard
- Clic → retire une contribution à payer
- Utilisable à tout moment pendant la saison

**Implémentation :**
- [ ] Frontend : Composant `GoldenTicketBadge.jsx` sur dashboard
- [ ] Frontend : Modal de confirmation pour utiliser le ticket
- [ ] Backend : Endpoint `POST /api/mystery-box/use-golden-ticket`
- [ ] Backend : Modifier `contributionService.js` pour annuler une contribution
- [ ] Backend : Stocker l'état (utilisé ou non) dans `SpecialRuleResult.results`

---

### 2. Steps Shop (bonus)
**Comportement utilisateur :**
- Bouton sur dashboard → ouvre popup avec liste d'articles
- Sélection + validation → enregistrement en BDD

**Comportement admin :**
- Page admin Mystery Box : liste des choix par utilisateur

**Implémentation :**
- [ ] Frontend : Composant `StepsShopButton.jsx` + `StepsShopModal.jsx`
- [ ] Frontend : Liste des articles disponibles (à définir)
- [ ] Backend : Endpoint `POST /api/mystery-box/select-shop-item`
- [ ] Backend : Endpoint `GET /api/admin/mystery-box/shop-selections`
- [ ] Backend : Stocker le choix dans `SpecialRuleResult.results`

---

### 3. Double Buteur (bonus)
**Comportement utilisateur :**
- Sur le match bonus : 2 champs select pour buteurs (l'un sous l'autre)
- Les 2 buteurs peuvent marquer pour gagner 2 points

**Implémentation :**
- [ ] Frontend : Modifier formulaire de pari pour afficher 2 selects buteur
- [ ] Frontend : Condition : si user a `double_buteur` ET match bonus
- [ ] Backend : Modifier modèle `Bet` pour stocker `player_goal_2` (ou JSON)
- [ ] Backend : Modifier `betLogic.js` pour vérifier les 2 buteurs
- [ ] Migration : Ajouter colonne `player_goal_2` à la table `bets` (ou utiliser JSON)

---

### 4. Buteur en Or (bonus)
**Comportement utilisateur :**
- Aucune action spéciale, juste un affichage informatif
- Si bon buteur sur match bonus → +1 pt supplémentaire (total 2 pts buteur)

**Implémentation :**
- [ ] Frontend : Badge/indicateur visuel sur le match bonus
- [ ] Backend : Modifier `betLogic.js` pour doubler `scorer_points` si bonus actif
- [ ] Backend : Vérifier que c'est le match bonus de la journée Mystery Box

---

### 5. Double Dose (bonus)
**Comportement utilisateur :**
- Sur chaque match : 2 boutons "[Équipe A] ou Nul" et "[Équipe B] ou Nul"
- Utilisable sur UN SEUL match
- Une fois utilisé, boutons masqués sur les autres matchs

**Implémentation :**
- [ ] Frontend : Composant `DoubleDoseButtons.jsx` avec les 2 boutons
- [ ] Frontend : Tracker le match où c'est utilisé (state + backend)
- [ ] Backend : Endpoint `POST /api/mystery-box/use-double-dose`
- [ ] Backend : Stocker `{ match_id, choice: 'home_or_draw' | 'away_or_draw' }`
- [ ] Backend : Modifier `betLogic.js` : si choix = "home_or_draw" et résultat = V home OU Nul → +1 pt

---

### 6. Balle Perdue (malus)
**Comportement utilisateur (détenteur) :**
- Bouton disponible dès le lundi
- Clic → sélection d'un utilisateur cible
- Action irréversible

**Comportement utilisateur (cible) :**
- Message sur dashboard : "Tu as perdu 1 point (Balle Perdue)"
- Dans classement (mois + saison) : affichage "Balle perdue -1p"

**Implémentation :**
- [ ] Frontend : Composant `BallePerdueBadge.jsx` avec bouton d'action
- [ ] Frontend : Modal de sélection utilisateur
- [ ] Frontend : Modifier affichage classement pour montrer le malus
- [ ] Frontend : Message d'alerte pour la cible sur dashboard
- [ ] Backend : Endpoint `POST /api/mystery-box/use-balle-perdue`
- [ ] Backend : Modifier `ruleLogic.js` pour appliquer -1pt dans `applySpecialRulePoints()`
- [ ] Backend : Stocker `{ used: true, target_user_id: X }` dans results

---

### 7. Communisme (malus)
**Comportement admin :**
- Roue tombe sur joueur A → roue re-spin pour trouver binôme B
- Stocker la paire dans config

**Comportement utilisateur A :**
- Voit matchs 1-4 + match bonus (avec buteur/score)
- Sur match bonus : voit pronos de B si déjà saisis

**Comportement utilisateur B :**
- Voit matchs 5-8 + match bonus (avec buteur/score)
- Sur match bonus : voit pronos de A si déjà saisis

**Match bonus partagé :**
- Les deux peuvent modifier
- Affichage temps réel des pronos du binôme

**Implémentation :**
- [ ] Frontend Admin : Modifier `RuleMysteryBox.jsx` pour gérer la double roue
- [ ] Frontend : Filtrer les matchs visibles selon l'utilisateur
- [ ] Frontend : Sur match bonus, afficher les pronos du binôme
- [ ] Backend : Endpoint `GET /api/bets/communisme-partner/:matchId` pour récupérer pronos partenaire
- [ ] Backend : Logique pour déterminer quels matchs sont visibles (1-4 vs 5-8)
- [ ] Backend : Stocker `{ user_a_id, user_b_id }` dans results

---

### 8. Mal au Cœur (malus)
**Comportement utilisateur :**
- Sur le match avec son équipe de cœur : bouton V de son équipe grisé/désactivé
- Peut miser N ou défaite de son équipe

**Implémentation :**
- [ ] Frontend : Modifier formulaire pari pour désactiver bouton équipe de cœur
- [ ] Frontend : Condition : si user a `mal_au_coeur` ET match contient `user.team_id`
- [ ] Backend : Validation côté serveur pour rejeter V sur équipe de cœur

---

## Structure de données

### SpecialRule.config (après attribution admin)
```json
{
  "description": "...",
  "items": [...],
  "matchday": 18,
  "selection": [
    { "user": { "id": 1, "username": "Alex" }, "item": { "key": "golden_ticket", "type": "bonus" } },
    { "user": { "id": 2, "username": "Marc" }, "item": { "key": "balle_perdue", "type": "malus" } }
  ]
}
```

### SpecialRuleResult.results (après actions utilisateurs)
```json
[
  {
    "user_id": 1,
    "item_key": "golden_ticket",
    "item_type": "bonus",
    "used": false,
    "data": null
  },
  {
    "user_id": 2,
    "item_key": "balle_perdue",
    "item_type": "malus",
    "used": true,
    "data": { "target_user_id": 5 }
  },
  {
    "user_id": 3,
    "item_key": "double_dose",
    "item_type": "bonus",
    "used": true,
    "data": { "match_id": 123, "choice": "home_or_draw" }
  },
  {
    "user_id": 4,
    "item_key": "communisme",
    "item_type": "malus",
    "used": true,
    "data": { "partner_id": 7 }
  },
  {
    "user_id": 5,
    "item_key": "steps_shop",
    "item_type": "bonus",
    "used": true,
    "data": { "selected_item": "mug_steps" }
  }
]
```

---

## Ordre d'implémentation suggéré

### Phase 1 : Infrastructure de base
1. [ ] Créer service `mysteryBoxService.js`
2. [ ] Créer endpoints API de base
3. [ ] Modifier `RuleMysteryBox.jsx` admin pour gérer max_count
4. [ ] Créer composant dashboard `MysteryBoxBadge.jsx` (affichage item reçu)

### Phase 2 : Items simples (sans interaction complexe)
5. [ ] `mal_au_coeur` - Désactivation bouton équipe de cœur
6. [ ] `buteur_or` - Doubler points buteur
7. [ ] `steps_shop` - Popup de sélection + admin

### Phase 3 : Items avec action utilisateur
8. [ ] `golden_ticket` - Bouton + annulation contribution
9. [ ] `balle_perdue` - Sélection cible + affichage classement
10. [ ] `double_dose` - Boutons "[Équipe] ou Nul"
11. [ ] `double_buteur` - Double select buteur

### Phase 4 : Item complexe
12. [ ] `communisme` - Double roue admin + partage pronos + match bonus partagé

---

## Fichiers à créer/modifier

### Backend (à créer)
- `server/src/services/mysteryBoxService.js`
- `server/src/controllers/mysteryBoxController.js`

### Backend (à modifier)
- `server/src/routes/api.js` - Nouvelles routes
- `server/src/services/logic/betLogic.js` - Calcul points (buteur_or, double_buteur, double_dose)
- `server/src/services/logic/ruleLogic.js` - Balle perdue dans classement
- `server/src/services/betService.js` - Validation (mal_au_coeur)
- `server/src/services/contributionService.js` - Golden ticket
- `server/src/services/specialRuleService.js` - Intégration mystery box

### Frontend (à créer)
- `client/src/components/rules/MysteryBoxBadge.jsx` - Badge dashboard
- `client/src/components/rules/mystery-box/GoldenTicket.jsx`
- `client/src/components/rules/mystery-box/StepsShopModal.jsx`
- `client/src/components/rules/mystery-box/DoubleDoseButtons.jsx`
- `client/src/components/rules/mystery-box/BallePerdue.jsx`
- `client/src/components/rules/mystery-box/CommunismeInfo.jsx`

### Frontend (à modifier)
- `client/src/pages/Dashboard.jsx` - Affichage badges Mystery Box
- `client/src/components/matchs/BetForm.jsx` (ou équivalent) - Double buteur, mal au cœur, double dose
- `client/src/pages/Classements.jsx` - Affichage "Balle perdue -1p"
- `client/src/pages/admin/rules/RuleMysteryBox.jsx` - Gestion max_count + double roue communisme

---

## Clarifications

1. **Steps Shop** : Items placeholder pour l'instant (à définir plus tard)
2. **Match bonus** : Match avec `require_details: true`
3. **Communisme** : Matchs 1-4 et 5-8 par ordre chronologique (date/heure)

---

## Progression

- [x] Analyse initiale
- [x] Plan d'action créé
- [x] Phase 1 : Infrastructure (terminée le 2025-12-31)
- [x] Phase 2 : Items simples (terminée le 2025-12-31)
- [x] Phase 3 : Items avec action (terminée le 2025-12-31)
- [x] Phase 4 : Communisme (terminée le 2025-12-31)

---

## Historique des modifications

### Phase 1 - Infrastructure (2025-12-31)

#### Fichiers créés

**`server/src/services/mysteryBoxService.js`**
Service principal avec les fonctions :
- `getUserMysteryBoxItem(userId)` - Récupère l'item attribué à un utilisateur
- `getAllMysteryBoxSelections()` - Liste toutes les attributions avec données d'utilisation
- `useItem(userId, itemKey, data)` - Enregistre l'utilisation d'un item
- `getItemUsage(userId, itemKey)` - Vérifie si un item a été utilisé
- `getItemDistributionCount(itemKey)` - Compte combien de fois un item a été distribué
- `getAvailableItems()` - Retourne les items non épuisés (selon max_count)
- `getMysteryBoxData()` - Données complètes (rule, items, availableItems, selections)
- `getCommunismePartner(userId)` - Récupère le partenaire Communisme

**`server/src/controllers/mysteryBoxController.js`**
Routes API :
- `GET /api/mystery-box/user/:userId` - Item d'un utilisateur
- `GET /api/mystery-box/selections` - Toutes les attributions
- `GET /api/mystery-box/data` - Données complètes
- `GET /api/mystery-box/available-items` - Items disponibles
- `GET /api/mystery-box/usage/:userId/:itemKey` - Vérifier utilisation
- `POST /api/mystery-box/use` - Utiliser un item (body: { itemKey, data })
- `GET /api/mystery-box/communisme/partner` - Partenaire Communisme
- `GET /api/admin/mystery-box/data` - Données admin
- `GET /api/admin/mystery-box/selections` - Attributions admin

**`client/src/components/rules/MysteryBox.jsx`**
Composant dashboard affichant :
- L'item attribué à l'utilisateur avec icône/couleur
- Badge Bonus/Malus
- Indicateur "Utilisé" si applicable
- Description de l'item
- Bouton "Voir tous les lots" → `/mystery-box`

#### Fichiers modifiés

**`server/src/routes/api.js`**
- Import ajouté : `const mysteryBoxController = require("../controllers/mysteryBoxController");`
- Route ajoutée : `router.use(mysteryBoxController)`

**`client/src/pages/admin/rules/RuleMysteryBox.jsx`**
- Import `useEffect, useMemo` ajoutés
- Fonction `getItemCount(itemKey)` - compte les attributions d'un item
- Variable `availableItems` - filtre les items non épuisés
- `useEffect` pour mettre à jour `isComplete` automatiquement
- Roue des items utilise `availableItems` au lieu de `items`
- Message d'erreur si plus d'items disponibles
- Section "Stock des items" avec grille affichant count/max_count par item
- Affichage coloré selon type (bonus=vert, malus=rouge, épuisé=gris)
- Compteur "Joueurs restants : X / Y"

**`client/src/components/rules/ActiveSpecialRule.jsx`**
- Import ajouté : `import MysteryBox from "./MysteryBox.jsx";`
- Case `"mystery_box"` ajouté dans `renderByRule()` pour afficher le composant

---

### Phase 2 - Items simples (2025-12-31)

#### mal_au_coeur

**`client/src/components/matchs/Week.jsx`**
- Import `RuleContext` ajouté
- State `mysteryBoxItem` ajouté
- `useEffect` pour récupérer l'item Mystery Box si la règle est active
- Props `userTeamId` et `mysteryBoxItem` passés à `Pronostic`

**`client/src/components/matchs/Pronostic.jsx`**
- Props `userTeamId` et `mysteryBoxItem` ajoutés
- Variables `hasMalAuCoeur`, `isHomeTeamHeartTeam`, `isAwayTeamHeartTeam` calculées
- Boutons équipe de cœur grisés et désactivés si `hasMalAuCoeur` est actif
- Affichage icône 💔 sur le bouton désactivé
- PropTypes mis à jour

**`server/src/services/betService.js`**
- Import `getUserMysteryBoxItem` ajouté
- Validation dans `createBet()` : empêche de miser la victoire de l'équipe de cœur
- Validation dans `updateBet()` : idem

#### buteur_or

**`server/src/services/logic/betLogic.js`**
- Import `getUserMysteryBoxItem` ajouté
- Vérification du bonus `buteur_or` dans `checkBetByMatchId()`
- Si l'utilisateur a `buteur_or` et trouve le bon buteur : 2 points au lieu de 1
- Log spécifique pour le bonus

#### steps_shop

**`server/src/controllers/mysteryBoxController.js`**
- Route `POST /api/mystery-box/steps-shop/select` ajoutée
  - Vérifie que l'utilisateur a le bonus
  - Vérifie qu'il n'a pas déjà utilisé
  - Enregistre la sélection
- Route `GET /api/admin/mystery-box/shop-selections` ajoutée
  - Liste les sélections Steps Shop pour l'admin

**`client/src/components/rules/mystery-box/StepsShopModal.jsx`** (créé)
- Modal avec liste d'articles placeholder
- Sélection d'un article
- Appel API pour enregistrer le choix
- Fermeture et callback de succès

**`client/src/components/rules/MysteryBox.jsx`**
- Import `StepsShopModal` ajouté
- State `showShopModal` ajouté
- Fonction `handleShopSuccess` pour rafraîchir les données
- Bouton "Choisir mon article" affiché si `steps_shop` non utilisé
- Affichage de l'article sélectionné si déjà choisi
- Intégration du modal

---

### Phase 3 - Items avec action (2025-12-31)

#### golden_ticket

**`client/src/components/rules/mystery-box/GoldenTicketModal.jsx`** (créé)
- Modal listant les contributions en attente de l'utilisateur
- Sélection d'une contribution à annuler
- Appel API pour utiliser le golden ticket

**`server/src/controllers/mysteryBoxController.js`**
- Route `GET /api/mystery-box/golden-ticket/contributions` - Liste contributions en attente
- Route `POST /api/mystery-box/golden-ticket/use` - Utilise le ticket sur une contribution

**`client/src/components/rules/MysteryBox.jsx`**
- Import `GoldenTicketModal` ajouté
- State `showGoldenTicketModal` ajouté
- Bouton jaune "Utiliser mon Golden Ticket" si non utilisé
- Intégration du modal

#### balle_perdue

**`client/src/components/rules/mystery-box/BallePerduModal.jsx`** (créé)
- Modal listant tous les utilisateurs (sauf soi-même)
- Sélection d'un utilisateur à pénaliser
- Appel API pour utiliser balle_perdue

**`server/src/services/rankingService.js`**
- Import `getAllMysteryBoxSelections` ajouté
- Dans `getRanking()` : application des pénalités balle_perdue (-1 point)
- Stockage des pénalités dans `appliedRules` pour affichage

**`client/src/components/rules/MysteryBox.jsx`**
- Import `BallePerduModal` ajouté
- State `showBallePerduModal` ajouté
- Bouton rouge "Tirer sur un joueur" si non utilisé

#### double_dose

**`client/src/components/rules/mystery-box/DoubleDoseModal.jsx`** (créé)
- Modal listant les matchs non commencés de la journée
- Sélection d'un match pour activer la double dose
- Appel API pour enregistrer le choix

**`client/src/components/matchs/Pronostic.jsx`**
- Variable `hasDoubleDose` calculée (vérifie si actif sur ce match)
- Boutons "[Équipe] ou Nul" au lieu des boutons normaux quand actif
- Style distinct (bordure cyan, fond cyan-50)
- Indicateur central "🎯 Double Dose"

**`server/src/services/logic/betLogic.js`**
- Vérification `double_dose` dans `checkBetByMatchId()`
- Si double_dose actif : le pari est correct si l'équipe gagne OU si nul
- Log spécifique pour le bonus

**`client/src/components/rules/MysteryBox.jsx`**
- Import `DoubleDoseModal` ajouté
- State `showDoubleDoseModal` ajouté
- Bouton cyan "Activer ma Double Dose" si non utilisé

#### double_buteur

**`client/src/components/matchs/Pronostic.jsx`**
- Variable `hasDoubleButeur` calculée
- State `scorer2` ajouté pour le second buteur
- Deux selects de buteur affichés sur le match bonus si actif
- Indicateur "⚽⚽ Double Buteur"
- Stockage au format "id1,id2" dans player_goal

**`server/src/services/logic/betLogic.js`**
- Support du format "id1,id2" dans player_goal
- Vérification si l'un des deux buteurs est correct
- Log spécifique pour le bonus

---

### Phase 4 - Communisme (2025-12-31)

#### Backend

**`server/src/services/mysteryBoxService.js`**
- Fonction `getCommunismeInfo(userId)` ajoutée
  - Détermine si l'utilisateur est User A ou User B
  - Retourne les infos du partenaire

**`server/src/controllers/mysteryBoxController.js`**
- Route `GET /api/mystery-box/communisme/info` - Infos complètes (rôle A/B, partenaire)
- Route `GET /api/mystery-box/communisme/partner-bet/:matchId` - Pari du partenaire sur un match

**`server/src/services/betService.js`**
- Fonction `getBetByMatchAndUser(matchId, userId)` ajoutée

#### Frontend

**`client/src/components/matchs/Week.jsx`**
- State `communismeInfo` ajouté
- `useEffect` pour récupérer les infos Communisme
- `useMemo` `displayMatches` pour filtrer les matchs :
  - User A : matchs 1-4 (premiers par date) + bonus
  - User B : matchs 5-8 (derniers par date) + bonus
- Indicateur "🤝 Partagé avec [username]" sur le match bonus
- Prop `communismeInfo` passé à `Pronostic`

**`client/src/components/matchs/Pronostic.jsx`**
- Prop `communismeInfo` ajouté
- State `partnerBet` ajouté
- `useEffect` pour récupérer le pari du partenaire sur le match bonus
- Section affichant le prono du partenaire (résultat + score) sur le match bonus
- Style rose (bg-rose-50, border-rose-300)
- PropTypes mis à jour

---

*Dernière mise à jour : 2025-12-31*
