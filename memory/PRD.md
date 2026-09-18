# Abrisia Plan - PRD (Product Requirements Document)

## Problème Original
Site web pour Abrisia Plan - entreprise de **conception et dessin** de plans architecturaux au Québec (Saguenay-Lac-Saint-Jean). Mini-maisons, chalets, maisons, extensions. Plans conformes au Code du bâtiment du Québec. **Abrisia ne fait PAS de construction.**

## Architecture
- **Frontend:** React + TailwindCSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Base de données:** MongoDB
- **Déploiement:** Emergent Platform → abrisia-plan.ca

## Fonctionnalités Implémentées

### Site Public
- Page d'accueil avec hero, services, inspiration, processus, témoignages
- Page Inspiration (galerie par catégories)
- **Page Collection ABRISIA** (remplace "Kits") — modèles pré-dessinés avec variantes, options, filtres, panier
- Page Devis (formulaire dynamique avec prix gérables)
- Page Contact (avec formulaire "Envoyer mon CV")
- Pages légales (mentions légales, politique de confidentialité)
- SEO: sitemap.xml, robots.txt, métadonnées
- **Chatbot IA** — Assistant virtuel (GPT) répondant aux questions des visiteurs en français
- /kit redirige vers /collection

### Panneau Administration (/admin/panel)
- Tableau de bord (statistiques devis)
- Gestion des devis (CRUD + assignation)
- Projets d'inspiration (CRUD)
- Catégories d'accueil
- **Collection ABRISIA** (CRUD + champs: N° modèle, style, fondation, chambres, salles de bain, garage, tags, largeur, profondeur, surface)
- Services & Prix (page d'accueil)
- Prix du devis (gestion dynamique)
- Design & Images (CMS)
- Témoignages (CRUD)
- Pages légales (édition)
- Menu du site (masquer/afficher pages)
- Gestion des employés
- Commandes collection

### Portail Employé (/espace-employe)
- Connexion employé
- Projets assignés avec statuts
- Notes et progression

### Sécurité
- Authentification JWT
- Rôles: admin, designer, constructor, employee

## Historique des Corrections

### 2026-03-07
1-15. Corrections initiales (voir changelog)

### 2026-09-13
16-19. Logo, ObjectId, Object Storage migration

### 2026-09-18 — Code Quality Round 2
20-29. Import circulaire, secrets, hooks, array keys, console cleanup, KitsManager refactoring

### 2026-09-18 — Pivot Collection ABRISIA + Chatbot IA
30. ✅ **Renommage global Kits → Collection ABRISIA** — Navigation, Home, Admin sidebar, formulaires, toasts, defaults backend, DB navigation, sitemap
31. ✅ **Interface publique Collection.jsx** — Page catalogue avec filtres (tags, chambres, style, fondation), grille de modèles, modal détail, sélection variantes/options, panier
32. ✅ **Backend Collection API** — `/api/collection/filters`, `/api/collection/tags`, `/api/collection/options`, `/api/collection/cart`
33. ✅ **Admin: champs Collection** — Formulaire admin enrichi: N° modèle, style, fondation, chambres, salles de bain, garage, étages, tags
34. ✅ **Backend: réponses produits enrichies** — GET /api/products et GET admin retournent tous les champs Collection (modelNumber, style, foundationType, bedrooms, bathrooms, floors, widthFt, depthFt, hasGarage, tags)
35. ✅ **Chatbot IA** — Assistant Abrisia (ChatBot.jsx + /api/chatbot/chat) utilisant GPT via emergentintegrations, SSE simulé, historique MongoDB, réponses en français
36. ✅ **Tests 100%** — iteration_9.json : 100% frontend + 100% backend (10/10)

## Tâches Restantes

### P1 - Prochaines
- Intégration Zoho CRM pour "Personnaliser ce modèle" (bouton + formulaire → Lead Zoho)
- Refonte Demande de Devis & Calculateur de prix préliminaire (Type projet en premier, calcul Largeur × Profondeur = Superficie × Tarif)
- Textes et positionnement ("Votre projet commence par un bon dessin", "Ce que fait ABRISIA / Là où notre mandat s'arrête")
- Finaliser Stripe checkout pour la Collection

### P2 - Futur
- Espace Pro ABRISIA (entrepreneurs, abonnement)
- Parcours clients distincts ("Je réalise mon projet", "Je suis entrepreneur", "J'ai un projet immobilier")
- Accompagner les tests E2E utilisateur

### P3 - Backlog
- Mini-espace projet client
- Messagerie client-dessinateur
- Upload fichiers clients
- Migration localStorage → httpOnly cookies

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123
- Employé: marc@abrisia-plan.ca (designer)

## Intégrations
- Gmail SMTP (notifications)
- Stripe (prêt mais inactif)
- Emergent Object Storage (uploads)
- **Emergent LLM Key** (chatbot IA via emergentintegrations, modèle GPT)
- Zoho CRM (à venir)

## Déploiement
- Health check passé le 2026-09-18 : aucun bloqueur
- Toutes les URLs externalisées (env vars)
- App prête pour Kubernetes / Emergent
