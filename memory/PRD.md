# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **dessin en bâtiment et conception de plans** architecturaux au Québec. Services 100% à distance depuis le Saguenay–Lac-Saint-Jean. Conformes à l'article 16.1 de la Loi sur les architectes du Québec.

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB

## Fonctionnalités Complètes

### Site Public
- Accueil, Collection ABRISIA, Espace Pro (formulaire + email notification), Devis (calculateur simplifié un seul tarif, prénom/nom, sans prix sur les plans), Chatbot IA strict, SEO, pages légales, contact, inspiration
- Page À propos : contenu professionnel complet (Art. 16.1, livrables, collaboration ingénieurs, aménagement mécanique)

### Emails de notification
- Devis → email à abrisia0plan@gmail.com
- Commandes Collection → email admin
- Candidatures CV → email admin
- **Demandes entrepreneur (Espace Pro)** → email admin (via /api/pro-contact)
- Témoignages → email admin
- Tous avec branding header/footer

### Admin (/admin/panel)
- Dashboard statistiques (4 KPI + 2 graphiques)
- **Tarif calculateur** : un seul champ modifiable ($/pi²) avec aperçu en temps réel
- Collection, Services & Prix, Services accueil, Prix du devis, Design & Images, Témoignages, Pages légales, Menu du site, Commandes, Candidatures
- Devis et Employés retirés de l'admin

### Sécurité
- JWT secret 256-bit, routes admin protégées, webhook Stripe vérifié, rate limiting login

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (fallback MongoDB)

## Tâches restantes
- (P1) Zoho CRM : en attente de clés API valides
- (P2) Interface Admin pour Zoho Credentials
- (P3) Affinement section Inspiration
