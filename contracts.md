# CONTRATS API - ABRISIA PLAN

## Vue d'ensemble
Backend FastAPI + MongoDB pour le site Abrisia Plan avec authentification admin et gestion des devis.

## 1. AUTHENTIFICATION ADMIN

### POST /api/auth/login
**Fonction :** Connexion administrateur
**Entrée :**
```json
{
  "email": "admin@abrisia-plan.ca",
  "password": "motdepasse"
}
```
**Sortie :**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "admin_id",
    "email": "admin@abrisia-plan.ca", 
    "name": "Administrateur Abrisia"
  }
}
```

### POST /api/auth/logout
**Fonction :** Déconnexion
**Headers :** Authorization: Bearer {token}
**Sortie :** `{"success": true, "message": "Déconnecté"}`

## 2. GESTION DES DEVIS

### POST /api/devis
**Fonction :** Soumettre une demande de devis (public)
**Entrée :**
```json
{
  "nom": "Pierre Martin",
  "email": "pierre@email.com", 
  "telephone": "514-555-0123",
  "projectType": "Mini-maison sur fondations",
  "plansChoisis": ["architecture", "fondation", "electricite"],
  "notes": "Description détaillée du projet..."
}
```
**Sortie :**
```json
{
  "success": true,
  "message": "Devis envoyé avec succès",
  "devis": {
    "id": "devis_id",
    "status": "En attente",
    "createdAt": "2024-12-20T10:00:00Z"
  }
}
```

### GET /api/admin/devis
**Fonction :** Liste tous les devis (admin seulement)
**Headers :** Authorization: Bearer {token}
**Sortie :**
```json
{
  "success": true,
  "devis": [
    {
      "id": "devis_id",
      "nom": "Pierre Martin",
      "email": "pierre@email.com",
      "telephone": "514-555-0123", 
      "projectType": "Mini-maison sur fondations",
      "plansChoisis": ["architecture", "fondation"],
      "notes": "Description...",
      "status": "En attente",
      "assignedTo": null,
      "createdAt": "2024-12-20T10:00:00Z",
      "updatedAt": "2024-12-20T10:00:00Z"
    }
  ]
}
```

### PUT /api/admin/devis/{devis_id}/status
**Fonction :** Changer le statut d'un devis
**Headers :** Authorization: Bearer {token}
**Entrée :**
```json
{
  "status": "En cours",
  "assignedTo": "Marc Dessinateur"
}
```

### PUT /api/admin/devis/{devis_id}/assign
**Fonction :** Assigner un devis à un dessinateur
**Headers :** Authorization: Bearer {token}
**Entrée :**
```json
{
  "assignedTo": "Sophie Architecte"
}
```

## 3. GESTION DES DESSINATEURS

### GET /api/admin/designers
**Fonction :** Liste des dessinateurs
**Headers :** Authorization: Bearer {token}
**Sortie :**
```json
{
  "success": true,
  "designers": [
    {
      "id": "designer_id",
      "name": "Marc Dessinateur",
      "email": "marc@abrisia-plan.ca",
      "specialties": ["Mini-maisons", "Chalets"],
      "activeProjects": 3
    }
  ]
}
```

### POST /api/admin/designers
**Fonction :** Ajouter un dessinateur
**Headers :** Authorization: Bearer {token}
**Entrée :**
```json
{
  "name": "Nouveau Dessinateur",
  "email": "nouveau@abrisia-plan.ca",
  "specialties": ["Extensions", "Maisons"]
}
```

## 4. GESTION DES IMAGES ET CONTENU

### POST /api/admin/upload-image
**Fonction :** Upload d'images pour la galerie
**Headers :** Authorization: Bearer {token}
**Entrée :** FormData avec fichier image
**Sortie :**
```json
{
  "success": true,
  "imageUrl": "/uploads/project_image.jpg",
  "message": "Image uploadée avec succès"
}
```

### GET /api/projects
**Fonction :** Liste des projets d'inspiration (public)
**Sortie :**
```json
{
  "success": true,
  "projects": [
    {
      "id": "project_id",
      "title": "Mini-maison moderne",
      "category": "Mini-maison",
      "image": "/uploads/project1.jpg",
      "description": "Description...",
      "details": ["Detail 1", "Detail 2"],
      "dimensions": "6m x 6m"
    }
  ]
}
```

## 5. REMPLACEMENT DES MOCKS

### Frontend - Données à remplacer :
- `mockQuotes` → API `/api/admin/devis`
- `mockDesigners` → API `/api/admin/designers`  
- `inspirationProjects` → API `/api/projects`
- Authentification locale → JWT tokens

### Pages à intégrer :
- `/pages/Admin/Login.jsx` → API `/api/auth/login`
- `/pages/Admin/Dashboard.jsx` → APIs admin
- `/pages/Devis.jsx` → API `/api/devis`
- `/pages/Inspiration.jsx` → API `/api/projects`

## 6. MODÈLES MONGODB

### Devis
```javascript
{
  _id: ObjectId,
  nom: String,
  email: String,
  telephone: String,
  projectType: String,
  plansChoisis: [String],
  notes: String,
  status: String, // "En attente", "En cours", "Terminé", "Rejeté"
  assignedTo: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Designer
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  specialties: [String],
  activeProjects: Number,
  createdAt: Date
}
```

### Project (Inspiration)
```javascript
{
  _id: ObjectId,
  title: String,
  category: String,
  image: String,
  description: String,
  details: [String],
  dimensions: String,
  isVisible: Boolean,
  createdAt: Date
}
```

### User (Admin)
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // hashé
  name: String,
  role: String, // "admin"
  createdAt: Date
}
```

## 7. SÉCURITÉ

- **JWT Tokens** pour l'authentification admin
- **Hachage bcrypt** pour les mots de passe
- **Middleware d'autorisation** pour les routes admin
- **Validation Pydantic** pour toutes les entrées
- **Rate limiting** sur les APIs publiques
- **Upload sécurisé** des images avec validation des types

## 8. INTÉGRATION FRONTEND-BACKEND

### Étapes :
1. Remplacer les imports de `mock.js` par des appels API
2. Ajouter un service API client avec axios
3. Gérer les états de chargement et erreurs
4. Implémenter l'authentification JWT
5. Ajouter la gestion des uploads d'images

### Structure des services :
```javascript
// services/api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL + '/api'
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout')
};

export const devisService = {
  submit: (devis) => api.post('/devis', devis),
  getAll: () => api.get('/admin/devis'),
  updateStatus: (id, status) => api.put(`/admin/devis/${id}/status`, status)
};
```

Cette architecture permettra une transition fluide des mocks vers les vraies APIs, avec une expérience utilisateur cohérente.