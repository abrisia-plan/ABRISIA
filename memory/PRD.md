# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **conception et dessin** de plans architecturaux au Québec. Plans conformes au Code du bâtiment du Québec et du Canada. **Abrisia ne fait PAS de construction.**

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB
- Déploiement: Emergent Platform

## Fonctionnalités Implémentées

### Site Public
- Accueil: hero, parcours client (3 profils), services, collection, inspiration, témoignages québécois, CTA
- Collection ABRISIA: modèles, filtres, variantes, options, panier, galerie carousel, checkout (Stripe+Google Pay+Apple Pay+PayPal), personnalisation (→ Lead Zoho)
- Espace Pro (/espace-pro): avantages, tarif 1,50$/pi², "Ce que fait Abrisia / Là où notre mandat s'arrête", formulaire contact pro
- Devis: formulaire dynamique + calculateur prix préliminaire (tarifs modifiables depuis admin)
- Chatbot IA (GPT), SEO (sitemap/robots/meta), pages légales, contact, inspiration

### Zoho CRM
- Leads: personnalisation, devis, achat, contact pro → MongoDB (sync Zoho en attente credentials)

### Paiements
- Stripe (carte, Google Pay, Apple Pay), PayPal (paypal.me/Abrisia), Interac (activable Stripe)

### Admin (/admin/panel)
- Collection ABRISIA, **Tarifs calculateur** (modifiables), devis, projets, catégories, services, design, témoignages, pages légales, navigation, employés, commandes

### Textes
- "Code du bâtiment du Québec et du Canada", © 2027, "Des plans sur mesure, conçus pour votre réalité"
- 8 témoignages québécois authentiques

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (pending)

## Tâches Restantes
- P1: Configurer credentials Zoho CRM valides, activer Interac dans Stripe
- P2: Tests E2E utilisateur, mini-espace projet client
