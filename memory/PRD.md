# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **dessin en bâtiment et conception de plans** architecturaux au Québec. Services 100% à distance depuis le Saguenay–Lac-Saint-Jean. Conformes à l'article 16.1 de la Loi sur les architectes du Québec.

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB

## Fonctionnalités Complètes

### Site Public
- Accueil: hero, parcours client, services, collection vedette, inspiration, témoignages, approches
- **Page À propos** : Services de dessin, Présentation, Champs de compétence (Art. 16.1), Livrables techniques, Collaboration professionnelle & structures complexes (ingénieurs), Aménagement mécanique fonctionnel (plomberie/électricité), Pourquoi choisir Abrisia Plan
- Collection ABRISIA: modèles, filtres, variantes, options, panier, galerie carousel, checkout (Stripe+PayPal)
- Espace Pro: avantages, tarif, formulaire contact pro
- **Devis**: formulaire avec **Prénom + Nom séparés**, **calculateur simplifié (un tarif unique, pas de dropdown type)**, options de plans à cocher (optionnels)
- Chatbot IA STRICT
- SEO, pages légales, contact, inspiration

### Emails Brandés
- Header: logo ABRISIA PLAN teal + slogan
- Footer: coordonnées, lien site
- Appliqué sur: devis, commandes, candidatures

### Admin (/admin/panel)
- Dashboard statistiques: 4 cartes KPI + 2 graphiques mensuels
- Collection ABRISIA, Tarifs calculateur, projets, services, design, témoignages, navigation, commandes, candidatures
- Devis et Employés retirés de l'admin

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (fallback MongoDB)

## Tâches restantes
- (P1) Zoho CRM : en attente de clés API valides
- (P2) Interface Admin pour Zoho Credentials
- (P3) Affinement section Inspiration
