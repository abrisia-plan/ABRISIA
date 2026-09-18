# Abrisia Plan - PRD (Product Requirements Document)

## Problème Original
Site web pour Abrisia Plan - entreprise de **conception et dessin** de plans architecturaux au Québec (Saguenay-Lac-Saint-Jean). Mini-maisons, chalets, maisons, extensions. Plans conformes au Code du bâtiment du Québec et du Canada. **Abrisia ne fait PAS de construction.**

## Architecture
- **Frontend:** React + TailwindCSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Base de données:** MongoDB
- **Déploiement:** Emergent Platform → abrisia-plan.ca

## Fonctionnalités Implémentées

### Site Public
- Page d'accueil : hero ("Des plans sur mesure, conçus pour votre réalité"), **parcours client** (3 profils), services, collection, inspiration, processus, témoignages
- **Parcours Client** : "Je réalise mon projet" → Devis, "Je suis entrepreneur" → Espace Pro, "Je veux un modèle prêt" → Collection
- **Espace Pro ABRISIA** (/espace-pro) : Page dédiée entrepreneurs avec avantages, "Ce que fait Abrisia / Là où notre mandat s'arrête", formulaire contact pro
- **Page Collection ABRISIA** : modèles pré-dessinés, filtres, variantes, options, panier, **galerie carousel**, checkout (Stripe + Google Pay + Apple Pay + PayPal)
- **Bouton "Personnaliser ce modèle"** → formulaire → Lead Zoho CRM
- Page Devis : formulaire dynamique + **calculateur de prix préliminaire** (Type × Largeur × Profondeur × Étages)
- Page Inspiration (galerie par catégories)
- Page Contact (avec formulaire "Envoyer mon CV")
- Pages légales (mentions légales, politique de confidentialité)
- SEO: sitemap.xml, robots.txt, métadonnées
- **Chatbot IA** — Assistant virtuel (GPT) répondant en français
- /kit redirige vers /collection

### Zoho CRM
- Tout contact client = Lead Zoho : personnalisation, devis, achat, contact pro
- Leads sauvegardés en MongoDB (crm_leads) + sync Zoho (credentials à configurer)

### Paiements
- Stripe Checkout (carte, Google Pay, Apple Pay automatiques)
- PayPal (redirect paypal.me/Abrisia)
- Interac e-Transfer (activable dans dashboard Stripe)

### Panneau Administration (/admin/panel)
- Collection ABRISIA (CRUD + champs: N° modèle, style, fondation, chambres, salles de bain, garage, tags)
- Gestion des devis, projets inspiration, catégories, services/prix, design/CMS, témoignages, pages légales, menu, employés, commandes

### Textes mis à jour
- "Code du bâtiment du Québec et du Canada" (partout)
- © 2027 (footer)
- "Des plans sur mesure, conçus pour votre réalité" (hero)
- Placeholder devis : 2027

## Tâches Restantes

### P1
- Compléter credentials Zoho CRM (Client ID + Client Secret valides)
- Activer Interac dans Stripe Dashboard

### P2
- Accompagner tests E2E utilisateur
- Mini-espace projet client
- Messagerie client-dessinateur

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123
- Employé: marc@abrisia-plan.ca (designer)

## Intégrations
- Gmail SMTP, Stripe, PayPal, Emergent Object Storage, Emergent LLM Key (chatbot), Zoho CRM (pending credentials)
