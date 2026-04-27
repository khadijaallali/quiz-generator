# Cahier des charges — QuizAI (Quiz Generator)

## 1. Présentation du projet

**QuizAI** est une application web qui transforme un texte ou un thème en un quiz QCM
pédagogique généré par intelligence artificielle. L'utilisateur peut créer, passer,
sauvegarder et suivre l'évolution de ses quiz et de ses scores.

- **Nom du projet :** QuizAI — Quiz Generator
- **Type :** Application web full-stack (Next.js App Router)
- **Langue de l'interface :** Français
- **Cible :** Étudiants, enseignants, autodidactes souhaitant réviser via QCM

## 2. Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styles | Tailwind CSS 4 |
| Authentification | Firebase Authentication (Google Sign-In) |
| Base de données | Cloud Firestore |
| Génération IA | OpenRouter (modèles gratuits Llama 3.3, Gemma 3, Nemotron) |
| Graphiques | Recharts |
| Runtime API | Node.js (route handlers Next.js) |

## 3. Acteurs et rôles

- **Visiteur (non connecté)** : peut consulter la page d'accueil et se connecter.
- **Utilisateur authentifié** : peut générer des quiz, les passer, consulter
  son historique et ses statistiques.

## 4. Architecture fonctionnelle

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Navigateur  │ ──▶ │  Next.js (UI +   │ ──▶ │  OpenRouter API  │
│   (React)    │     │  API Routes)     │     │  (génération IA) │
└──────────────┘     └──────────────────┘     └──────────────────┘
        │                      │
        │                      ▼
        │            ┌──────────────────┐
        └──────────▶ │ Firebase Auth +  │
                     │    Firestore     │
                     └──────────────────┘
```

## 5. Fonctionnalités

### 5.1 Authentification

- **F1.1** — Connexion via compte Google (popup OAuth Firebase).
- **F1.2** — Création automatique d'un document `users/{uid}` à la première
  connexion (uid, email, displayName, photoURL, createdAt).
- **F1.3** — Déconnexion depuis la barre de navigation.
- **F1.4** — Persistance de session via `onAuthStateChanged` (contexte React global
  `AuthProvider`).
- **F1.5** — Redirection automatique vers `/dashboard` une fois connecté, et vers `/`
  pour les pages protégées si déconnecté.

### 5.2 Page d'accueil (Landing)

- **F2.1** — Présentation du produit avec slogan, description et bouton de connexion.
- **F2.2** — Trois cartes de présentation des fonctionnalités principales :
  génération instantanée, cloud multi-appareils, suivi des progrès.
- **F2.3** — Redirection vers `/dashboard` si l'utilisateur est déjà authentifié.

### 5.3 Tableau de bord (`/dashboard`)

- **F3.1** — Affichage du profil utilisateur (avatar, prénom, email).
- **F3.2** — Bouton « + Créer un quiz » vers `/generate`.
- **F3.3** — Liste des **3 derniers quiz** créés sous forme de cartes (`QuizCard`).
- **F3.4** — Affichage du **dernier score** obtenu avec lien vers la page de résultats.
- **F3.5** — Lien vers l'historique complet.
- **F3.6** — Gestion des états : chargement, erreur, liste vide.

### 5.4 Génération de quiz (`/generate`)

- **F4.1** — Choix entre deux modes de saisie :
  - **Texte** : collage d'un cours/article (50 à 3000 caractères).
  - **Thème** : sujet libre (≥ 3 caractères).
- **F4.2** — Sélection du **nombre de questions** parmi : 5, 10 ou 15.
- **F4.3** — Sélection de la **difficulté** : Facile, Moyen, Difficile.
- **F4.4** — Champ optionnel **titre** ; sinon l'IA en propose un.
- **F4.5** — Compteur de caractères en mode texte.
- **F4.6** — Validation côté client et côté serveur (longueur, type, valeurs autorisées).
- **F4.7** — Appel à l'API `/api/generate` qui invoque OpenRouter avec un prompt
  structuré exigeant un JSON strict (`title`, `questions[]`).
- **F4.8** — **Fallback multi-modèles** : si un modèle gratuit retourne 429/503, on
  essaie le suivant dans la liste (Llama 3.3 70B, Gemma 3 27B/12B, Nemotron 8B).
- **F4.9** — Normalisation des questions retournées (id, options limitées à 4,
  `correctIndex` entier, `explanation` nettoyée).
- **F4.10** — Sauvegarde du quiz généré dans `quizzes/{id}` (Firestore) avec
  uid propriétaire, source originale, type de source, questions et `createdAt`.
- **F4.11** — Redirection vers la page du quiz `/quiz/{id}`.

### 5.5 Passage d'un quiz (`/quiz/[id]`)

- **F5.1** — Chargement du quiz depuis Firestore par identifiant.
- **F5.2** — Affichage **question par question** avec barre de progression.
- **F5.3** — 4 options de réponse (A, B, C, D) sélectionnables une seule fois.
- **F5.4** — **Révélation immédiate** de la bonne réponse après sélection :
  - feedback visuel vert (correct) / rouge (faux),
  - affichage de l'explication pédagogique fournie par l'IA.
- **F5.5** — Navigation **Précédent / Question suivante** entre les questions.
- **F5.6** — Bouton « Voir mes résultats » sur la dernière question (désactivé tant
  qu'aucune réponse n'a été révélée).
- **F5.7** — Calcul du score (somme des `selectedIndex === correctIndex`).
- **F5.8** — Sauvegarde du score dans `scores/{id}` avec : uid, quizId, quizTitle,
  score, total, percentage, tableau `answers[]` (questionId, selectedIndex,
  isCorrect), `completedAt`.
- **F5.9** — Mode invité supporté pour quiz publics (`isPublic === true`) — sans
  sauvegarde du score.
- **F5.10** — Redirection vers `/results/{scoreId}` après finalisation.

### 5.6 Page de résultats (`/results/[id]`)

- **F6.1** — Affichage du score chiffré (X/Y) et du pourcentage.
- **F6.2** — Barre de progression colorée selon performance :
  - vert ≥ 70 %, orange ≥ 50 %, rouge < 50 %.
- **F6.3** — Message de feedback adapté à la performance (4 paliers).
- **F6.4** — Boutons : **Refaire ce quiz**, **Nouveau quiz**, **Mon historique**.
- **F6.5** — **Récapitulatif détaillé** question par question :
  - énoncé, badge Correct/Faux,
  - réponse de l'utilisateur,
  - bonne réponse (si erreur),
  - explication pédagogique.

### 5.7 Historique (`/history`)

- **F7.1** — Liste de tous les scores de l'utilisateur (tri descendant par date).
- **F7.2** — **Graphique d'évolution** des pourcentages dans le temps (LineChart
  Recharts, axe Y de 0 à 100).
- **F7.3** — **Tableau** : titre, date complète, score, pourcentage coloré, actions.
- **F7.4** — Actions par ligne : **Revoir** (résultats détaillés) et **Refaire** le quiz.
- **F7.5** — État vide avec invitation à créer un premier quiz.

### 5.8 Navigation transverse

- **F8.1** — `Navbar` collante avec logo QuizAI.
- **F8.2** — Liens conditionnels selon connexion : Dashboard, Créer un quiz, Historique.
- **F8.3** — Affichage avatar + prénom de l'utilisateur connecté.
- **F8.4** — Menu burger responsive (mobile).
- **F8.5** — Footer avec année dynamique.

## 6. Modèle de données (Firestore)

### Collection `users/{uid}`
```js
{ uid, email, displayName, photoURL, createdAt }
```

### Collection `quizzes/{quizId}`
```js
{
  id,
  uid,                      // propriétaire
  title,
  source,                   // texte ou thème
  sourceType: "text"|"theme",
  isPublic: boolean,
  questions: [
    { id, question, options: [4], correctIndex, explanation }
  ],
  createdAt
}
```

### Collection `scores/{scoreId}`
```js
{
  id,
  uid,
  quizId,
  quizTitle,
  score,                    // nb de bonnes réponses
  total,                    // nb total de questions
  percentage,
  answers: [
    { questionId, selectedIndex, isCorrect }
  ],
  completedAt
}
```

## 7. API serveur

### `POST /api/generate`
- **Entrée** : `{ source, sourceType, nbQuestions, difficulty, title? }`
- **Validations** :
  - `source` non vide,
  - `sourceType ∈ {text, theme}`,
  - texte : 50 ≤ longueur ≤ 3000,
  - `nbQuestions ∈ {5, 10, 15}`,
  - `difficulty ∈ {Facile, Moyen, Difficile}`,
  - clé `OPENROUTER_API_KEY` présente.
- **Sortie** : `{ title, questions: [...] }`
- **Erreurs** : 400 (validation), 500 (clé manquante / échec global).

### `POST /api/scores`
- Endpoint utilitaire : recalcule un pourcentage à partir de `(score, total)`.
  L'écriture Firestore est faite côté client pour préserver l'identité Firebase Auth.

## 8. Contraintes & règles métier

- **C1** — Chaque question contient exactement 4 options et une seule bonne réponse.
- **C2** — Le texte source d'un quiz est limité à 3000 caractères pour maîtriser
  le coût/temps d'inférence.
- **C3** — Les scores ne peuvent être enregistrés que pour un utilisateur connecté.
- **C4** — Un utilisateur n'accède en lecture/écriture qu'à ses propres documents
  (à enforcer côté Firestore Security Rules).
- **C5** — La clé OpenRouter ne doit jamais être exposée côté client.
- **C6** — Toutes les dates Firestore (`Timestamp`) sont normalisées en `Date` JS
  côté lecture.

## 9. Variables d'environnement

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
OPENROUTER_API_KEY                # côté serveur uniquement
```

## 10. Exigences non fonctionnelles

- **UI/UX** : interface responsive (mobile-first), feedback instantané (spinners,
  états désactivés), code couleur cohérent (indigo = action, vert/orange/rouge
  = performance).
- **Performance** : chargement parallèle des données du dashboard (`Promise.all`),
  index Firestore sur `(uid, createdAt|completedAt)` pour les requêtes
  ordonnées.
- **Robustesse IA** : extraction tolérante du JSON (suppression des fences
  markdown, recherche du premier `{` et dernier `}`), repli automatique sur
  plusieurs modèles gratuits.
- **Sécurité** : authentification obligatoire pour les pages `/dashboard`,
  `/generate`, `/history`, `/results/*` ; redirection sinon.
- **Internationalisation** : interface entièrement en français, dates locale
  `fr-FR`.
- **Accessibilité** : labels explicites, boutons désactivés annoncés, contrastes
  Tailwind respectant WCAG.

## 11. Arborescence du projet

```
app/
  api/
    generate/route.js        # génération IA (OpenRouter)
    scores/route.js          # utilitaire pourcentage
  dashboard/page.js
  generate/page.js
  history/page.js
  quiz/[id]/page.js          # passage du quiz
  results/[id]/page.js       # résultats détaillés
  layout.js                  # AuthProvider + Navbar + footer
  page.js                    # landing
components/
  AuthButton.jsx
  HistoryTable.jsx
  LoadingSpinner.jsx
  Navbar.jsx
  QuestionBlock.jsx
  QuizCard.jsx
  ScoreChart.jsx
lib/
  AuthContext.js             # contexte React global
  auth.js                    # signIn / signOut / subscribe
  firebase.js                # init Firebase
  firestore.js               # CRUD quizzes & scores
  gemini.js                  # client OpenRouter (multi-modèles)
```

## 12. Évolutions envisageables

- Partage public d'un quiz (le champ `isPublic` est déjà prévu).
- Édition/suppression d'un quiz par son propriétaire.
- Export PDF des résultats.
- Mode entraînement (sans révélation immédiate).
- Filtrage de l'historique par quiz, plage de dates, score.
- Règles de sécurité Firestore explicites (`request.auth.uid == resource.data.uid`).
- Limite de quota / rate-limiting côté API `/api/generate`.
