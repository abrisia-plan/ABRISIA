# Abrisia Plan - PRD

## Problème original
Site web pour Abrisia Plan, entreprise de plans architecturaux au Québec. Système de kits, devis, gestion employés, CMS admin complet.

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI
- Backend: FastAPI + MongoDB
- Stockage: Emergent Object Storage (permanent)
- Notifications: SMTP Gmail
- Déploiement: Emergent Platform → abrisia-plan.ca

## Ce qui est implémenté

### Admin complet
- Gestion employés, navigation site, projets d'inspiration, kits de plans
- Gestion des prix du devis (plan_options) avec toggle "Afficher sur l'accueil"
- Témoignages (approbation + affichage)
- Candidatures CV avec notifications email
- Filtres devis par statut/date

### Page d'accueil dynamique
- Services depuis plan_options (show_on_home=true) - source unique de prix
- Phrase de confiance + bouton kits préconçus
- Kits en vedette, inspirations par catégorie, témoignages clients

### Système de devis (CORRIGÉ)
- Formulaire complet avec TOUS les champs sauvegardés:
  - representationType, responsePreference, architecturalStyles
  - Upload multi-fichiers (photos, PDF, DWG, croquis)
- Pré-sélection via URL (?plan=<id>)
- Toutes les données visibles dans: admin, espace employés, emails
- Notifications email complètes avec tous les détails

### Stockage permanent
- Object Storage via Emergent Integrations
- Upload multi-fichiers pour devis et kits
- Images d'inspiration migrées (29/29)
- Téléchargement via /api/files/{path}

### Portail employé
- Vue des projets assignés avec tous les détails du devis

## DB Schema
- `plan_options`: { id, name, price, description, category, is_active, order, show_on_home, home_name, home_icon, home_description, home_order }
- `products` (Kits): { name, price, main_image, gallery_images, slug, file_formats, building_type, ... }
- `projects`: { title, category, image, description, is_visible, show_on_home }
- `devis`: { nom, email, telephone, project_type, plans_choisis, representation_type, response_preference, architectural_styles, files, status, assigned_to }
- `reviews`: { is_approved }
- `applications`: { name, email, cv_path }
- `files`: { storage_path, original_filename, content_type, linked_to, linked_type }

## Credentials
- Admin: admin@abrisia-plan.ca / admin123

## Stabilisation effectuée (Étape 1)
- [x] Analyse complète du projet
- [x] Nettoyage code (12 fichiers inutilisés supprimés)
- [x] Devis: toutes données sauvegardées + email complet
- [x] Upload fichiers: multi-fichiers permanent (Object Storage)
- [x] Images: migration vers stockage permanent (29/29 inspirations)
- [x] Kits: persistance corrigée (ProductUpdate model fixé)
- [x] Emails: template complet avec tous les champs
- [x] Tests: 100% backend (15/15) + 100% frontend

## Backlog priorité
- P0: Re-déployer et vérifier domaine abrisia-plan.ca
- P1: Intégration Zoho (Mail, CRM, Invoice) - en attente clés API
- P1: Feedback utilisateur session de tests
- P1: SEO / Google Search Console
- P2: Stripe paiements
- P3: Mini-espace projet client
- P4: Messagerie client-dessinateur
