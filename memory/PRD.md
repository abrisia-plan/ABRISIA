# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **dessin en bâtiment et conception de plans** architecturaux au Québec. Services 100% à distance depuis le Saguenay–Lac-Saint-Jean. Conformes à l'article 16.1 de la Loi sur les architectes du Québec.

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB

## Fonctionnalités Complètes

### Site Public
- Accueil, Collection ABRISIA, Espace Pro, Devis (calculateur simplifié, prénom/nom séparés), Chatbot IA strict, SEO, pages légales, contact, inspiration
- **Page À propos** : contenu professionnel complet (Art. 16.1, livrables techniques, collaboration avec ingénieurs, aménagement mécanique fonctionnel)

### Admin (/admin/panel)
- Dashboard statistiques (4 KPI + 2 graphiques), Collection, Tarifs, projets, services, design, témoignages, commandes, candidatures
- Devis et Employés retirés (gestion via Zoho)

### Sécurité (Code Quality Review appliquée)
- JWT secret: secret 256-bit aléatoire (plus de placeholder)
- Routes admin protégées: /admin/reviews, /zoho/leads requièrent auth
- Webhook Stripe: vérification signature renforcée
- Rate limiting: 10 tentatives/5min sur /auth/login
- Empty catch blocks: console.error ajouté partout (~25 fichiers)
- Hook dependencies: corrigées dans les fichiers critiques

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (fallback MongoDB)

## Tâches restantes
- (P1) Zoho CRM : en attente de clés API valides
- (P2) Interface Admin pour Zoho Credentials
- (P2) Split Collection.jsx (890 lignes) en composants plus petits
- (P3) Affinement section Inspiration
