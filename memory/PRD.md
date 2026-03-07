# Abrisia Plan - PRD

## Problème original
Site web pour Abrisia Plan, entreprise de plans architecturaux au Québec. Système de kits, devis, gestion employés, CMS admin complet.

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI
- Backend: FastAPI + MongoDB
- Notifications: SMTP Gmail
- Déploiement: Emergent Platform

## Ce qui est implémenté

### Admin complet
- Gestion employés, navigation site, projets d'inspiration, kits de plans
- Gestion des prix du devis (plan_options) avec toggle "Afficher sur l'accueil"
- Témoignages (approbation + affichage)
- Candidatures CV avec notifications email
- Filtres devis par statut/date

### Page d'accueil dynamique
- Services affichés depuis plan_options (show_on_home=true)
- Prix alignés avec l'admin (source unique)
- Clic sur service → devis avec pré-sélection
- Phrase de confiance + bouton kits préconçus
- Kits en vedette
- Inspirations par catégorie
- Témoignages clients

### Système de devis
- Formulaire avec plan_options dynamiques
- Pré-sélection via URL (?plan=<id>)
- Notifications email admin

### Portail employé
- Vue des projets assignés

### Témoignages
- Page publique /temoignage pour soumission
- Approbation admin + affichage

## DB Schema clé
- `plan_options`: { id, name, price, description, category, is_active, order, show_on_home, home_name, home_icon, home_description, home_order }
- `products` (Kits): { ..., is_visible, is_featured }
- `projects`: { ..., is_visible, show_on_home }
- `devis`: { ..., status, priority, assigned_to }
- `reviews`: { ..., is_approved }
- `applications`: { name, email, cv_path }

## Credentials
- Admin: admin@abrisia-plan.ca / admin123

## Backlog priorité
- P1: Feedback utilisateur (session de tests)
- P1: SEO / Google Search Console
- P2: Stripe paiements
- P3: Mini-espace projet client
- P4: Messagerie client-dessinateur
- P5: Upload fichiers clients
