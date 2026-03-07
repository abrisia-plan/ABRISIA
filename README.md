# Abrisia Plan

## Description
Abrisia Plan est une plateforme de services de plans architecturaux sur mesure pour mini-maisons, chalets, abris et structures extérieures au Québec.

## Fonctionnalités principales

### 🏠 Site public
- **Page d'accueil** avec présentation des services et tarifs
- **Galerie d'inspiration** avec projets réalisés
- **Formulaire de devis** complet avec options personnalisées
- **Page Kits** pour acheter des plans prêts à l'emploi
- **Page Contact** avec informations de l'entreprise

### 👨‍💼 Espace Admin
- **Tableau de bord** avec statistiques en temps réel
- **Gestion des devis** (liste, statuts, assignation aux dessinateurs)
- **Gestion des dessinateurs** (création, modification, suppression)
- **Gestion des projets** (galerie d'inspiration)
- **Gestion des kits** (produits à vendre)
- **CMS** (paramètres du site, services, médias)

## Technologies utilisées

### Backend
- **FastAPI** - Framework Python moderne et performant
- **MongoDB** - Base de données NoSQL
- **Motor** - Driver async MongoDB
- **JWT** - Authentification sécurisée
- **Pydantic** - Validation des données

### Frontend
- **React** - Interface utilisateur
- **Tailwind CSS** - Styles modernes
- **Radix UI** - Composants accessibles
- **React Router** - Navigation SPA

## Installation

### Prérequis
- Python 3.11+
- Node.js 18+
- MongoDB

### Backend
```bash
cd backend
pip install -r requirements.txt
# Configurer .env avec les variables nécessaires
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## Variables d'environnement

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=abrisia_plan
JWT_SECRET_KEY=your_secret_key
CORS_ORIGINS=*
SENDER_EMAIL=your_email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_PASSWORD=your_app_password
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion admin
- `POST /api/auth/logout` - Déconnexion

### Devis (Public)
- `POST /api/devis` - Soumettre un devis

### Admin - Devis
- `GET /api/admin/devis` - Liste des devis
- `PUT /api/admin/devis/{id}/status` - Mettre à jour le statut
- `GET /api/admin/stats` - Statistiques dashboard

### Admin - Dessinateurs
- `GET /api/admin/designers` - Liste des dessinateurs
- `POST /api/admin/designers` - Créer un dessinateur
- `PUT /api/admin/designers/{id}` - Modifier un dessinateur
- `DELETE /api/admin/designers/{id}` - Supprimer un dessinateur

### Projets
- `GET /api/projects` - Liste des projets publics
- `GET /api/categories` - Catégories de projets

### Kits
- `GET /api/kits` - Liste des kits disponibles
- `POST /api/kits/order` - Commander un kit
- `GET /api/admin/kit-orders` - Liste des commandes (admin)

### CMS
- `GET /api/admin/cms/settings` - Paramètres du site
- `PUT /api/admin/cms/settings` - Modifier les paramètres
- `GET /api/admin/cms/services` - Services et prix
- `POST /api/admin/cms/upload-media` - Upload de médias

## Compte Admin par défaut
- **Email:** admin@abrisia-plan.ca
- **Mot de passe:** admin123

## Structure du projet
```
/app
├── backend/
│   ├── server.py          # Point d'entrée FastAPI
│   ├── database.py        # Configuration MongoDB
│   ├── models.py          # Modèles Pydantic
│   ├── auth.py            # Middleware d'authentification
│   └── routes/
│       ├── auth.py        # Routes d'authentification
│       ├── devis.py       # Routes de devis
│       ├── designers.py   # Routes dessinateurs
│       ├── projects.py    # Routes projets
│       ├── kits.py        # Routes kits
│       └── cms.py         # Routes CMS
├── frontend/
│   ├── src/
│   │   ├── App.js         # Composant principal
│   │   ├── pages/         # Pages de l'application
│   │   ├── components/    # Composants réutilisables
│   │   └── contexts/      # Contextes React
│   └── public/
└── README.md
```

## Licence
Propriétaire - Abrisia Plan © 2025
