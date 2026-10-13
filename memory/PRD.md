# Abrisia Plan - PRD

## Problème Original
Site web pour Abrisia Plan - entreprise de **dessin en bâtiment et conception de plans** architecturaux au Québec. Services 100% à distance depuis le Saguenay–Lac-Saint-Jean.

## Architecture
- Frontend: React + TailwindCSS + Shadcn UI (port 3000)
- Backend: FastAPI Python (port 8001)
- Base de données: MongoDB

## Fonctionnalités Complètes

### CMS Dynamique (Admin → Pages publiques)
- **Page Accueil** : titre hero, sous-titre hero, titre services, titre/sous-titre processus — tout modifiable via Admin > Gestion du contenu > Page Accueil
- **Page Devis** : titre et sous-titre ("Parlez-nous de votre idée") modifiables via Admin > Gestion du contenu > Autres pages > Page Devis
- **Page Espace Pro** : **tarif entrepreneur** (1,50$/pi²) et unité modifiables via Admin > Gestion du contenu > Autres pages > Page Espace Pro
- Services & Prix, Étapes processus, Formulaire devis — tout modifiable

### Site Public
- Accueil (textes dynamiques), Collection ABRISIA, Espace Pro (tarif dynamique + email notification), Devis (calculateur + prénom/nom), Chatbot IA, SEO, pages légales, contact, inspiration, À propos

### Emails de notification
- Devis, Commandes Collection, Candidatures CV, **Demandes entrepreneur (Espace Pro)**, Témoignages — tous avec branding

### Admin
- Dashboard stats, Collection, Services & Prix, Tarifs calculateur, Design, Témoignages, Pages légales, Menu, Commandes, Candidatures
- Sécurité : JWT 256-bit, routes admin protégées, rate limiting

## Identifiants
- Admin : admin@abrisia-plan.ca (mot de passe gardé hors du dépôt — ne jamais l'écrire ici)

## Intégrations
- Courriel (Gmail SMTP / Resend), Stripe, PayPal.me, stockage de fichiers, chatbot IA (Gemini + secours Claude), Zoho CRM (fallback MongoDB)
- Zoho CRM : **branché** (clés sur Render : ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN). Fiches créées pour devis, contact, Espace Pro, commandes Collection, chatbot. Suivi dans Admin → Messages et Zoho.
- Serveur (Render) : https://abrisia-plan-ca.onrender.com — site public (Vercel) : https://abrisia-plan.ca

## Déjà en place (ne pas refaire)
- Inspiration : bouton 👁 afficher/masquer par projet + option « page d'accueil » (Admin → Projets)
- Collection : visible/masqué + ⭐ « en vedette » sur l'accueil (Admin → Collection) ; fichiers de plans privés
- Panier : ajout, TPS/TVQ, commande. Sans clé Stripe → « Envoyer ma commande » (facture envoyée à la main)

## À faire — liste de la propriétaire (mise à jour 2026-10-13)

### 1. Paiement en ligne (EN COURS)
- [ ] Stripe : activer le compte (entreprise + compte bancaire)
- [ ] Stripe : mettre STRIPE_SECRET_KEY et STRIPE_PUBLISHABLE_KEY (clés live) sur Render
- [ ] Stripe : webhook `https://abrisia-plan-ca.onrender.com/api/payments/webhook`, événement `checkout.session.completed`, puis STRIPE_WEBHOOK_SECRET sur Render
- [ ] Stripe : virements en « Manuel » si on veut garder l'argent dans Stripe (garder un coussin de 200-500 $, virer le reste à la banque)
- [ ] Tester un vrai achat sur /collection, puis le rembourser
- [ ] PayPal : mettre REACT_APP_PAYPAL_ME_URL (ex. https://paypal.me/...) sur Vercel

### 2. Sécurité
- [ ] Changer le mot de passe admin s'il est encore celui par défaut

### 3. Contenu du site
- [ ] Vérifier dans l'admin que les boutons 👁 / ⭐ fonctionnent (Inspiration et Collection) ; noter tout bogue
- [ ] Choisir et mettre en ligne les projets Inspiration et modèles Collection voulus
- [ ] Peaufiner la section Inspiration

### 4. Argent et administration
- [ ] Ouvrir un compte bancaire d'entreprise séparé pour Abrisia
- [ ] Voir un comptable (TPS/TVQ, impôts, statut)

### 5. Attirer des clients (après le paiement)
- [ ] Fiche Google Business Profile
- [ ] Référencement Google (SEO) par région du Québec
- [ ] Demander des avis aux clients
