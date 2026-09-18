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
- Page d'accueil avec hero ("Des plans sur mesure, conçus pour votre réalité"), services, inspiration, processus, témoignages
- Page Inspiration (galerie par catégories)
- **Page Collection ABRISIA** — modèles pré-dessinés avec variantes, options, filtres, panier, checkout (Stripe + Google Pay + Apple Pay + PayPal)
- **Bouton "Personnaliser ce modèle"** → formulaire → Lead Zoho CRM
- Page Devis (formulaire dynamique + **calculateur de prix préliminaire** : Type × Largeur × Profondeur × Étages)
- Page Contact (avec formulaire "Envoyer mon CV")
- Pages légales (mentions légales, politique de confidentialité)
- SEO: sitemap.xml, robots.txt, métadonnées
- **Chatbot IA** — Assistant virtuel (GPT) répondant en français
- /kit redirige vers /collection

### Zoho CRM
- Tout contact client = Lead Zoho : personnalisation, devis, achat
- Leads sauvegardés en MongoDB (crm_leads) + sync Zoho quand credentials configurées
- Routes : /api/zoho/lead/customize, /api/zoho/lead/devis, /api/zoho/lead/purchase, /api/zoho/leads

### Paiements
- Stripe Checkout (carte, Google Pay, Apple Pay automatiques)
- PayPal (redirect paypal.me/Abrisia)
- Interac e-Transfer (activable dans dashboard Stripe)

### Panneau Administration (/admin/panel)
- Tableau de bord (statistiques devis)
- Gestion des devis (CRUD + assignation)
- Projets d'inspiration (CRUD)
- **Collection ABRISIA** (CRUD + champs: N° modèle, style, fondation, chambres, salles de bain, garage, tags)
- Services & Prix, Design & Images (CMS), Témoignages, Pages légales
- Menu du site, Gestion des employés, Commandes collection

### Portail Employé (/espace-employe)
- Connexion employé, projets assignés, notes, progression

### Sécurité
- Authentification JWT
- Rôles: admin, designer, constructor, employee

## Historique des Corrections

### 2026-09-18 — Pivot Collection ABRISIA + Chatbot + Zoho + Checkout
30. ✅ Renommage global Kits → Collection ABRISIA
31. ✅ Interface publique Collection.jsx (filtres, grille, modal, variantes, options, panier)
32. ✅ Backend Collection API + Admin formulaire enrichi
33. ✅ Chatbot IA (GPT via emergentintegrations)
34. ✅ Zoho CRM leads (personnalisation, devis, achat) — sauvegarde MongoDB + sync Zoho
35. ✅ Checkout Stripe + PayPal + Google Pay/Apple Pay
36. ✅ Calculateur de prix préliminaire dynamique dans Devis
37. ✅ Texte hero : "Des plans sur mesure, conçus pour votre réalité"
38. ✅ Tests 100% frontend, 93% backend (iteration_10)

## Tâches Restantes

### P1 - Prochaines
- Compléter configuration Zoho CRM (Client ID + Client Secret + Refresh Token)
- Activer Interac dans Stripe Dashboard
- Espace Pro ABRISIA (entrepreneurs, abonnement)
- Parcours clients distincts ("Je réalise mon projet", "Je suis entrepreneur")

### P2 - Futur
- Accompagner les tests E2E utilisateur
- Mini-espace projet client
- Messagerie client-dessinateur

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123
- Employé: marc@abrisia-plan.ca (designer)

## Intégrations
- Gmail SMTP (notifications)
- Stripe (paiements actifs - carte, Google Pay, Apple Pay)
- PayPal (paypal.me/Abrisia)
- Emergent Object Storage (uploads)
- Emergent LLM Key (chatbot IA)
- Zoho CRM (leads — credentials à compléter)
