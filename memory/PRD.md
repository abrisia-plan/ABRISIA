# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **dessin en bâtiment et conception de plans** architecturaux au Québec. Services 100% à distance depuis le Saguenay–Lac-Saint-Jean. Conformes à l'article 16.1 de la Loi sur les architectes du Québec. **Abrisia ne fait PAS de construction ni de fabrication.**

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB

## Fonctionnalités Complètes

### Site Public
- Accueil: hero, parcours client (3 profils), services, collection vedette, inspiration, témoignages québécois, approches (Plans sur mesure, 100% à distance, Conformité assurée)
- **Page À propos** : contenu professionnel complet — Services de dessin, Présentation (Saguenay–Lac-Saint-Jean, 100% à distance), Champs de compétence autonomes (Art. 16.1 : unifamiliale <600m², multifamiliale <300m², jumelée <300m², commercial <300m²), Livrables techniques (implantation, fondations/planchers, élévations, coupes de mur, cartouche), Collaboration professionnelle & structures complexes (ingénieurs en structure, pieux, poutres acier), Aménagement mécanique fonctionnel (plomberie/électricité), Pourquoi choisir Abrisia Plan (4 avantages)
- Collection ABRISIA: modèles, filtres, variantes, options, panier, galerie carousel, checkout (Stripe+Google Pay+Apple Pay+PayPal), personnalisation (→ Lead Zoho)
- Espace Pro (/espace-pro): avantages, tarif 1,50$/pi², "Ce que fait Abrisia / Là où notre mandat s'arrête", formulaire contact pro
- Devis: formulaire + calculateur prix dynamique (tarifs modifiables depuis admin)
- Chatbot IA STRICT: ne parle QUE d'Abrisia, collecte infos client, refuse questions hors sujet
- SEO, pages légales, contact, inspiration

### Emails Brandés
- Header: logo ABRISIA PLAN teal + slogan
- Footer: coordonnées, lien site, © 2027
- Appliqué sur: devis, commandes, candidatures

### Admin (/admin/panel)
- **Dashboard statistiques** : 4 cartes KPI (devis, commandes, revenus, en attente) + 2 graphiques mensuels (commandes et devis)
- Collection ABRISIA, Tarifs calculateur (modifiables), projets, services, design, témoignages, navigation, commandes, candidatures
- **Devis et Employés retirés** de l'admin (gestion via Zoho)

### Témoignages québécois
- 8 témoignages: Tremblay, Gagnon, Bouchard, Lavoie, Simard, Bergeron, Côté, Fortin

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (pending credentials — fallback MongoDB actif)

## Tâches restantes
- (P1) Zoho CRM : en attente de clés API valides
- (P2) Interface Admin pour Zoho Credentials : onglet admin pour saisir/tester les clés Zoho
- (P3) Affinement section Inspiration : nouvelles icônes/catégories si demandé
