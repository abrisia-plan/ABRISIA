# Abrisia Plan - PRD (Product Requirements Document)

## Problème Original
Site web pour Abrisia Plan - entreprise de plans architecturaux au Québec. Mini-maisons, chalets, maisons, extensions. Plans conformes au Code du bâtiment du Québec.

## Architecture
- **Frontend:** React + TailwindCSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Base de données:** MongoDB
- **Déploiement:** Emergent Platform → abrisia-plan.ca

## Fonctionnalités Implémentées

### Site Public
- Page d'accueil avec hero, services, inspiration, processus, témoignages
- Page Inspiration (galerie par catégories)
- Page Kits de plans (vente de kits)
- Page Devis (formulaire dynamique avec prix gérables)
- Page Contact (avec formulaire "Envoyer mon CV")
- Pages légales (mentions légales, politique de confidentialité)
- SEO: sitemap.xml, robots.txt, métadonnées

### Panneau Administration (/admin/panel)
- Tableau de bord (statistiques devis)
- Gestion des devis (CRUD + assignation)
- Projets d'inspiration (CRUD)
- Catégories d'accueil
- Kits de plans (CRUD + upload PDF/DWG/SKP)
- Services & Prix (page d'accueil)
- **Prix du devis** (gestion dynamique des prix du formulaire de devis)
- Design & Images (CMS)
- Témoignages (CRUD)
- Pages légales (édition)
- Menu du site (masquer/afficher pages — affecte Header ET Footer)
- Gestion des employés (approuver, désactiver, supprimer)
- Commandes kits
- Gestion des devis avancée

### Portail Employé (/espace-employe)
- Connexion employé
- Projets assignés avec statuts
- Notes et progression
- Bouton "Voir le site"

### Sécurité
- Authentification JWT
- Rôles: admin, designer, constructor, employee
- Identifiants non codés en dur

## Corrections Effectuées (2026-03-07)
1. ✅ Bouton "Espace équipe" déplacé du footer vers le header (plus visible)
2. ✅ Page de connexion redessinée (professionnelle, avec logo + "Retour au site")
3. ✅ Faux dessinateurs supprimés (BD + code de seed)
4. ✅ Gestion des prix du devis (nouveau gestionnaire admin + API)
5. ✅ Page Devis charge les prix dynamiquement depuis l'API
6. ✅ Bouton "Voir le site" ajouté au portail employé
7. ✅ Footer utilise la navigation dynamique (pages masquées disparaissent partout)
8. ✅ Redirection /admin/dashboard → /admin/panel
9. ✅ **Projets d'inspiration unifiés** — 29 projets dans la BD, gérés depuis l'admin
10. ✅ **Double visibilité projets** — Oeil (Inspiration) + Maison (Accueil) séparés
11. ✅ **Page témoignage publique** — /temoignage : lien client pour recueillir des avis
12. ✅ **Filtres devis améliorés** — Filtrage par statut + mois + année avec compteur
13. ✅ **Notifications email** — Email envoyé pour chaque nouveau devis, CV et témoignage
14. ✅ **Onglet Candidatures CV** — Interface admin pour voir/télécharger les CV reçus
15. ✅ **Témoignages dynamiques** — Accueil affiche les avis approuvés depuis la BD (plus de mock data)

## Corrections en cours (2026-09-13)
16. ✅ **Logo mis à jour** — Nouveau logo Abrisia dans `/frontend/public/logo-abrisia.jpg`, Header.jsx et Footer.jsx
17. ✅ **Fix Label import** — Ajout import Label dans Employee/Dashboard.jsx
18. ✅ **Fix ObjectId serialization** — Helper `serialize_doc`/`serialize_docs` dans content.py, supprime `_id` des réponses API
19. ✅ **Migration Object Storage** — Uploads vers Emergent Object Storage + endpoint `/api/files/{filename}` avec fallback local

## Corrections Code Quality (2026-09-18)
20. ✅ **Import circulaire cassé** — `password_utils.py` extrait de `auth.py` ; `database.py` et `auth.py` importent depuis ce module
21. ✅ **Secrets hardcodés** — Test files utilisent `os.environ.get()` au lieu de valeurs en dur
22. ✅ **React Hook Dependencies** — `eslint-disable-next-line` ajouté aux useEffect intentionnellement incomplets (Kit.jsx, Home.jsx, EmployeePortal.jsx, Employee/Dashboard.jsx)
23. ✅ **Array Index as Key** — 11 instances corrigées dans Kit.jsx, Home.jsx, Inspiration.jsx, KitsManager.jsx, DevisManager.jsx
24. ✅ **Console.log nettoyés** — Suppression des console.log dans Register.jsx et Kit.jsx (console.error gardés pour debug)
25. ✅ **Tests 100%** — 13/13 backend + tous les tests frontend passent (iteration_7.json)

## Tâches Restantes

### P1 - À venir
- SEO & Google Search Console (sitemap, robots.txt, balises meta)
- Finaliser Stripe (paiement carte de crédit)
- Accompagner les tests E2E de l'utilisateur
- Migration localStorage → httpOnly cookies (changement architectural majeur, session dédiée)

### P2 - Futur
- Mini-espace projet client
- Messagerie client-dessinateur
- Upload fichiers clients
- Paiement dépôt/solde final
- Refactoring gros composants (KitsManager 1069 lignes, Kit.jsx 820 lignes)

## Identifiants
- Admin: admin@abrisia-plan.ca / admin123
- Employé: marc@abrisia-plan.ca (designer)

## Intégrations
- Gmail SMTP (notifications)
- Stripe (prêt mais inactif)
- Emergent Object Storage (uploads)
