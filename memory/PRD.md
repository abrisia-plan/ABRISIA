# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **conception et dessin** de plans architecturaux au Québec. Plans conformes au Code du bâtiment du Québec et du Canada. **Abrisia ne fait PAS de construction ni de fabrication.**

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB

## Fonctionnalités Complètes

### Site Public
- Accueil: hero, parcours client (3 profils), services, collection vedette, inspiration, témoignages québécois
- Collection ABRISIA: modèles, filtres, variantes, options, panier, galerie carousel, checkout (Stripe+Google Pay+Apple Pay+PayPal), personnalisation (→ Lead Zoho)
- Espace Pro (/espace-pro): avantages, tarif 1,50$/pi², "Ce que fait Abrisia / Là où notre mandat s'arrête", formulaire contact pro
- Devis: formulaire + calculateur prix dynamique (tarifs modifiables depuis admin)
- Chatbot IA STRICT: ne parle QUE d'Abrisia, collecte infos client, refuse questions hors sujet
- SEO, pages légales, contact, inspiration

### Emails Brandés
- Header: logo ABRISIA PLAN teal + slogan
- Footer: coordonnées, lien site, © 2027
- Appliqué sur: devis, commandes, candidatures

### Admin
- Collection ABRISIA, Tarifs calculateur (modifiables), devis, projets, services, design, témoignages, navigation, employés, commandes

### Témoignages québécois
- 8 témoignages: Tremblay, Gagnon, Bouchard, Lavoie, Simard, Bergeron, Côté, Fortin

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (pending credentials)
