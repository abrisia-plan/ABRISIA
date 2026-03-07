# Abrisia Plan - PRD (Product Requirements Document)

## Problème original
Site web pour Abrisia Plan, entreprise de plans architecturaux au Québec. Fonctionnalités: système de kits automatisé, système de devis avancé, gestion des employés, paiements.

## Architecture
- **Frontend**: React (port 3000)
- **Backend**: FastAPI (port 8001)
- **Database**: MongoDB
- **Deployment**: Emergent Platform → abrisia-plan.ca

## Ce qui est implémenté

### Système de kits (Complet)
- Page publique /kit pour commander des kits de plans
- Options plan seul ou plan + matériaux
- 1 kit actif: Mini-maison 400 pi²
- 9 commandes enregistrées

### Paiements (Partiel)
- Interac: Fonctionnel (instructions par courriel)
- Stripe: Codé mais désactivé (en attente configuration compte)

### Courriels (Complet)
- Gmail SMTP configuré (mot de passe d'application dans backend/.env)
- Notifications de commande fonctionnelles

### Authentification (Complet)
- JWT pour admin et employés
- Login unifié à /admin (admin + employés)
- Admin redirigé vers /admin/dashboard
- Employés redirigés vers /espace-employe

### Système d'employés (Complet - 2026-03-07)
- Inscription employé via API /api/employees/register
- Approbation par admin
- Login via page unifiée /admin
- Portail employé /espace-employe avec projets assignés
- Gestion employés dans admin panel
- Employé test: marc@abrisia-plan.ca / marc123

### SEO (Corrigé - 2026-03-07)
- Title: "Abrisia Plan | Plans architecturaux, mini-maisons et chalets au Québec"
- Meta description, Open Graph, structured data JSON-LD
- robots.txt et sitemap.xml
- lang="fr" dans le HTML

### Admin Panel (Complet - 2026-03-07)
- Tableau de bord avec stats
- Gestion devis
- Gestion projets/inspiration
- Gestion kits de plans
- Gestion employés (ajout, approbation, suppression)
- Commandes kits
- Services & Prix
- Design & Images
- Témoignages
- Pages légales

### Sécurité (Corrigé - 2026-03-07)
- Page /admin ne montre plus les identifiants
- Formulaire vide avec placeholders génériques

## Backlog P1
- Finaliser configuration Stripe (réactiver paiement par carte)
- Page À propos éditable depuis l'admin (CMS)

## Backlog P2
- Mini-espace projet pour clients
- Messagerie client-dessinateur
- Upload fichiers dans espace projet
- Paiement dépôt/solde final pour devis

## Credentials
- Admin: admin@abrisia-plan.ca / admin123
- Employee: marc@abrisia-plan.ca / marc123

## Domaine
- Production: abrisia-plan.ca
- Preview: kit-system-preview.preview.emergentagent.com
