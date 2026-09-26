# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **dessin en bâtiment et conception de plans** architecturaux au Québec. Services 100% à distance depuis le Saguenay–Lac-Saint-Jean.

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB

## Fonctionnalités Complètes

### CMS Dynamique (Admin → Pages publiques)
- **Page Accueil** : titre hero, sous-titre hero, titre services, titre/sous-titre processus — tout modifiable via Admin > Gestion du contenu > Page Accueil
- **Page Devis** : titre et sous-titre ("Parlez-nous de votre idée") modifiables via Admin > Gestion du contenu > Autres pages > Page Devis
- **Page Espace Pro** : **tarif entrepreneur** (1,50$/pi²) et unité modifiables via Admin > Gestion du contenu > Autres pages > Page Espace Pro
- Services & Prix, Étapes processus, Formulaire devis — tout modifiable

### Site Public
- Accueil (textes dynamiques), Collection ABRISIA, Espace Pro (tarif dynamique + email notification), Devis (calculateur + prénom/nom), Chatbot IA, SEO, pages légales, contact, inspiration, À propos

### Emails de notification
- Devis, Commandes Collection, Candidatures CV, **Demandes entrepreneur (Espace Pro)**, Témoignages — tous avec branding

### Admin
- Dashboard stats, Collection, Services & Prix, Tarifs calculateur, Design, Témoignages, Pages légales, Menu, Commandes, Candidatures
- Sécurité : JWT 256-bit, routes admin protégées, rate limiting

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (fallback MongoDB)

## Tâches restantes
- (P1) Zoho CRM : en attente de clés API valides
- (P2) Interface Admin pour Zoho Credentials
- (P3) Affinement section Inspiration
