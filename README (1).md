# QuizCloud — README de développement

> Application web cloud de génération de quiz intelligents par IA.  
> Stack : **Next.js 14 (App Router) · Tailwind CSS · Firebase · Gemini API · Vercel**

---

## Présentation du projet

QuizCloud est une application SaaS éducative permettant à tout utilisateur de générer automatiquement des quiz QCM à partir d'un texte ou d'un thème, grâce à l'intelligence artificielle. Les quiz et les résultats sont stockés dans le cloud et accessibles depuis n'importe quel appareil.

---

## Stack technique

| Couche | Outil | Rôle |
|---|---|---|
| Framework | Next.js 14 (App Router) | Frontend + API Routes |
| Style | Tailwind CSS | Design responsive |
| Auth | Firebase Authentication | Connexion Google |
| Base de données | Firebase Firestore | Stockage quiz & scores |
| Fichiers | Firebase Storage | Upload de fichiers texte/PDF |
| IA | Google Gemini API (gemini-1.5-flash) | Génération des questions |
| Déploiement | Vercel | Hébergement + serverless |
| Versioning | GitHub | Gestion du code source |

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini API (côté serveur uniquement)
GEMINI_API_KEY=
```

---

## Structure du projet

```
quizcloud/
├── app/
│   ├── layout.tsx                  # Layout global (police, metadata)
│   ├── page.tsx                    # Page d'accueil (landing)
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard utilisateur connecté
│   ├── generate/
│   │   └── page.tsx                # Formulaire de génération de quiz
│   ├── quiz/
│   │   └── [id]/
│   │       └── page.tsx            # Passage du quiz
│   ├── results/
│   │   └── [id]/
│   │       └── page.tsx            # Résultats après quiz
│   ├── history/
│   │   └── page.tsx                # Historique des quiz et scores
│   └── api/
│       ├── generate/
│       │   └── route.ts            # Route API : génération quiz via Gemini
│       └── scores/
│           └── route.ts            # Route API : sauvegarde des scores
├── components/
│   ├── Navbar.tsx                  # Barre de navigation
│   ├── AuthButton.tsx              # Bouton connexion/déconnexion Google
│   ├── QuizCard.tsx                # Carte d'affichage d'un quiz
│   ├── QuestionBlock.tsx           # Composant d'une question QCM
│   ├── ScoreChart.tsx              # Graphique d'évolution des scores
│   ├── HistoryTable.tsx            # Tableau de l'historique
│   └── LoadingSpinner.tsx          # Indicateur de chargement
├── lib/
│   ├── firebase.ts                 # Initialisation Firebase
│   ├── firestore.ts                # Fonctions CRUD Firestore
│   ├── auth.ts                     # Helpers authentification
│   └── gemini.ts                   # Client Gemini API
├── types/
│   └── index.ts                    # Types TypeScript globaux
├── .env.local                      # Variables d'environnement (non commité)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Modèle de données Firestore

### Collection `users`
```
users/{uid}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string
└── createdAt: timestamp
```

### Collection `quizzes`
```
quizzes/{quizId}
├── id: string
├── uid: string                     # ID de l'utilisateur créateur
├── title: string                   # Titre du quiz (généré ou saisi)
├── source: string                  # Texte ou thème soumis par l'utilisateur
├── sourceType: "text" | "theme"    # Type de saisie
├── questions: Question[]           # Tableau des questions (voir type)
├── createdAt: timestamp
└── isPublic: boolean               # Quiz partageable ou privé
```

### Collection `scores`
```
scores/{scoreId}
├── id: string
├── uid: string
├── quizId: string
├── score: number                   # Nombre de bonnes réponses
├── total: number                   # Nombre total de questions
├── percentage: number              # Score en pourcentage
├── answers: UserAnswer[]           # Réponses données par l'utilisateur
└── completedAt: timestamp
```

### Types TypeScript (`types/index.ts`)
```typescript
export type Question = {
  id: string
  question: string
  options: string[]                 // 4 options de réponse
  correctIndex: number              // Index de la bonne réponse (0-3)
  explanation: string               // Explication de la bonne réponse
}

export type Quiz = {
  id: string
  uid: string
  title: string
  source: string
  sourceType: "text" | "theme"
  questions: Question[]
  createdAt: Date
  isPublic: boolean
}

export type Score = {
  id: string
  uid: string
  quizId: string
  score: number
  total: number
  percentage: number
  answers: UserAnswer[]
  completedAt: Date
}

export type UserAnswer = {
  questionId: string
  selectedIndex: number
  isCorrect: boolean
}
```

---

## Fonctionnalités détaillées

---

### F1 — Authentification (Firebase Auth)

**Fichiers concernés :** `lib/firebase.ts`, `lib/auth.ts`, `components/AuthButton.tsx`

- Connexion via **Google Sign-In** uniquement (bouton OAuth)
- Déconnexion
- Persistance de session (rechargement de page → reste connecté)
- Protection des routes : toute page autre que `/` et `/quiz/[id]` public nécessite d'être connecté. Rediriger vers `/` si non connecté.
- Stocker les infos utilisateur dans Firestore à la première connexion (document `users/{uid}`)

```typescript
// Comportement attendu
- Non connecté → accès uniquement à "/" et aux quiz publics
- Connecté → accès à "/dashboard", "/generate", "/history", "/results/[id]"
- Après connexion → redirection vers "/dashboard"
- Après déconnexion → redirection vers "/"
```

---

### F2 — Page d'accueil `/`

**Fichiers concernés :** `app/page.tsx`

- Landing page publique présentant l'application
- Titre, description courte, call-to-action "Commencer" → redirige vers `/generate` (ou login si non connecté)
- Liste des 3 fonctionnalités clés avec icônes
- Bouton de connexion Google visible si non connecté
- Si déjà connecté → rediriger vers `/dashboard`

---

### F3 — Dashboard `/dashboard`

**Fichiers concernés :** `app/dashboard/page.tsx`, `components/QuizCard.tsx`

- Page protégée (connexion requise)
- Afficher :
  - Nom et photo de profil de l'utilisateur
  - Bouton "Créer un quiz" → `/generate`
  - Les **3 derniers quiz créés** par l'utilisateur (depuis Firestore, triés par `createdAt` desc)
  - Le **dernier score** obtenu
  - Bouton "Voir tout l'historique" → `/history`
- Chaque quiz affiché dans un `QuizCard` avec : titre, date, nombre de questions, bouton "Reprendre"

---

### F4 — Génération de quiz `/generate`

**Fichiers concernés :** `app/generate/page.tsx`, `app/api/generate/route.ts`, `lib/gemini.ts`

#### Interface utilisateur
- Champ de saisie avec **deux modes** (tabs ou toggle) :
  - **Mode "Texte"** : textarea pour coller un texte (cours, article...), max 3000 caractères
  - **Mode "Thème"** : champ texte court pour saisir un sujet (ex : "La révolution française")
- Sélecteur du **nombre de questions** : 5, 10 ou 15
- Sélecteur de **difficulté** : Facile / Moyen / Difficile
- Champ optionnel **titre du quiz** (si vide, le titre est généré par l'IA)
- Bouton "Générer le quiz" → appel à `/api/generate`
- État de chargement visible pendant la génération (spinner + message "L'IA génère votre quiz...")
- En cas d'erreur : afficher un message clair ("La génération a échoué, réessayez.")

#### Route API `/api/generate` (POST)
- Reçoit : `{ source, sourceType, nbQuestions, difficulty, title? }`
- Construit un prompt structuré pour Gemini :

```
Tu es un générateur de quiz éducatifs. 
Génère exactement {nbQuestions} questions QCM en français sur le sujet suivant : {source}.
Difficulté : {difficulty}.
Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans texte avant ou après) :
{
  "title": "Titre du quiz",
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}
```

- Parser la réponse JSON de Gemini
- Sauvegarder le quiz dans Firestore (`quizzes/{quizId}`)
- Retourner `{ quizId }` au frontend
- Après succès → rediriger vers `/quiz/{quizId}`

#### Gestion des erreurs
- Réponse Gemini non parseable → retry 1 fois, sinon erreur 500
- Texte trop court (< 50 caractères en mode texte) → erreur 400
- Clé API manquante → erreur 500

---

### F5 — Passage du quiz `/quiz/[id]`

**Fichiers concernés :** `app/quiz/[id]/page.tsx`, `components/QuestionBlock.tsx`

- Récupérer le quiz depuis Firestore via `quizId`
- Afficher les questions **une par une** (navigation précédent / suivant)
- Barre de progression en haut (ex : "Question 3 / 10")
- Pour chaque question :
  - Texte de la question
  - 4 options cliquables (radio buttons stylisés)
  - Après sélection : afficher immédiatement si c'est correct (vert) ou non (rouge) + explication
  - Bouton "Question suivante"
- Sur la dernière question → bouton "Voir mes résultats"
- Sauvegarder les réponses en mémoire locale (state React) pendant le quiz
- À la fin → appel à `/api/scores` pour sauvegarder, puis redirection vers `/results/{scoreId}`
- Quiz accessible sans connexion si `isPublic: true` (afficher sans sauvegarde de score)

---

### F6 — Résultats `/results/[id]`

**Fichiers concernés :** `app/results/[id]/page.tsx`, `components/ScoreChart.tsx`

- Récupérer le score depuis Firestore via `scoreId`
- Afficher :
  - Score global : "Vous avez obtenu **8 / 10** (80%)"
  - Barre de progression colorée (vert si ≥ 70%, orange si ≥ 50%, rouge sinon)
  - Récapitulatif de chaque question avec : réponse donnée, bonne réponse, explication
  - Message de félicitations ou d'encouragement selon le score
- Boutons :
  - "Refaire ce quiz" → `/quiz/{quizId}`
  - "Créer un nouveau quiz" → `/generate`
  - "Voir mon historique" → `/history`

---

### F7 — Historique `/history`

**Fichiers concernés :** `app/history/page.tsx`, `components/HistoryTable.tsx`, `components/ScoreChart.tsx`

- Page protégée
- Récupérer tous les scores de l'utilisateur depuis Firestore (`scores` où `uid == currentUser.uid`), triés par `completedAt` desc
- Tableau avec colonnes : Titre du quiz · Date · Score · Pourcentage · Action
- Bouton "Revoir" par ligne → `/results/{scoreId}`
- Bouton "Refaire" par ligne → `/quiz/{quizId}`
- Graphique d'évolution des scores dans le temps (`ScoreChart` avec Chart.js ou Recharts)
- Si aucun score → message "Vous n'avez pas encore passé de quiz" + bouton "Créer mon premier quiz"

---

### F8 — Route API scores `/api/scores` (POST)

**Fichiers concernés :** `app/api/scores/route.ts`, `lib/firestore.ts`

- Reçoit : `{ uid, quizId, score, total, answers }`
- Calcule `percentage = Math.round((score / total) * 100)`
- Sauvegarde dans Firestore collection `scores`
- Retourne `{ scoreId }`

---

### F9 — Navbar

**Fichiers concernés :** `components/Navbar.tsx`, `components/AuthButton.tsx`

- Logo + nom "QuizCloud" à gauche → lien vers `/`
- Si connecté : liens "Dashboard", "Créer un quiz", "Historique" + photo de profil + bouton déconnexion
- Si non connecté : bouton "Se connecter"
- Responsive : menu hamburger sur mobile

---

## Règles de sécurité Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /quizzes/{quizId} {
      allow read: if resource.data.isPublic == true
                  || (request.auth != null && request.auth.uid == resource.data.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.uid;
    }

    match /scores/{scoreId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Installation & lancement

```bash
# 1. Cloner le repo
git clone https://github.com/votre-groupe/quizcloud.git
cd quizcloud

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les valeurs Firebase et Gemini API

# 4. Lancer en développement
npm run dev

# 5. Ouvrir http://localhost:3000
```

---

## Déploiement sur Vercel

```bash
# Via CLI
npm i -g vercel
vercel

# Ou via GitHub : connecter le repo à Vercel, ajouter les variables d'environnement
# dans le dashboard Vercel → Settings → Environment Variables
```

---

## Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run lint         # Vérification ESLint
```

---

## Fonctionnalités hors MVP (bonus si le temps le permet)

- Partage d'un quiz via lien public (toggle `isPublic`)
- Mode thème sombre / clair
- Export du quiz en PDF
- Limite de 20 quiz par utilisateur (free tier Firebase)
- Affichage d'un leaderboard pour les quiz publics

---

## Notes pour Claude Code

- Utiliser **TypeScript strict** partout
- Utiliser le **App Router** de Next.js 14 (pas le Pages Router)
- Toutes les fonctions Firestore doivent être dans `lib/firestore.ts`
- La clé `GEMINI_API_KEY` ne doit **jamais** être exposée côté client — uniquement dans les API Routes
- Gérer les états de chargement (`loading`) et d'erreur (`error`) sur chaque page
- Le composant `AuthButton` doit utiliser `onAuthStateChanged` de Firebase pour réagir en temps réel
- Préférer `async/await` à `.then()` partout
