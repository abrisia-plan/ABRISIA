import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Configuration axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Services des devis
export const devisService = {
  submit: async (devisData) => {
    const response = await api.post('/devis', devisData);
    return response.data;
  },

  getAll: async (statusFilter = null, limit = 50, skip = 0) => {
    const params = { limit, skip };
    if (statusFilter) params.status_filter = statusFilter;
    
    const response = await api.get('/admin/devis', { params });
    return response.data;
  },

  updateStatus: async (devisId, statusData) => {
    const response = await api.put(`/admin/devis/${devisId}/status`, statusData);
    return response.data;
  },

  delete: async (devisId) => {
    const response = await api.delete(`/admin/devis/${devisId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};

// Services des dessinateurs
export const designerService = {
  getAll: async () => {
    const response = await api.get('/admin/designers');
    return response.data;
  },

  create: async (designerData) => {
    const response = await api.post('/admin/designers', designerData);
    return response.data;
  },

  update: async (designerId, updateData) => {
    const response = await api.put(`/admin/designers/${designerId}`, updateData);
    return response.data;
  },

  delete: async (designerId) => {
    const response = await api.delete(`/admin/designers/${designerId}`);
    return response.data;
  },

  getProjects: async (designerId) => {
    const response = await api.get(`/admin/designers/${designerId}/projects`);
    return response.data;
  }
};

// Services des projets
export const projectService = {
  getPublic: async (category = null, limit = 20, skip = 0) => {
    const params = { limit, skip };
    if (category && category !== 'Tous') params.category = category;
    
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getAll: async (includeHidden = true) => {
    const response = await api.get('/admin/projects', { 
      params: { include_hidden: includeHidden } 
    });
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/admin/projects', projectData);
    return response.data;
  },

  update: async (projectId, updateData) => {
    const response = await api.put(`/admin/projects/${projectId}`, updateData);
    return response.data;
  },

  delete: async (projectId) => {
    const response = await api.delete(`/admin/projects/${projectId}`);
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/admin/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

// Services CMS (Content Management System)
export const cmsService = {
  // Paramètres du site
  getSettings: async () => {
    const response = await api.get('/admin/cms/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/cms/settings', settings);
    return response.data;
  },

  // Services et prix
  getServices: async () => {
    const response = await api.get('/admin/cms/services');
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await api.post('/admin/cms/services', serviceData);
    return response.data;
  },

  updateService: async (serviceId, updates) => {
    const response = await api.put(`/admin/cms/services/${serviceId}`, updates);
    return response.data;
  },

  deleteService: async (serviceId) => {
    const response = await api.delete(`/admin/cms/services/${serviceId}`);
    return response.data;
  },

  // Contenu du site
  getContent: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/admin/cms/content', { params });
    return response.data;
  },

  createContent: async (contentData) => {
    const response = await api.post('/admin/cms/content', contentData);
    return response.data;
  },

  updateContent: async (contentId, updates) => {
    const response = await api.put(`/admin/cms/content/${contentId}`, updates);
    return response.data;
  },

  // Gestion des médias
  uploadMedia: async (formData) => {
    const response = await api.post('/admin/cms/upload-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMediaFiles: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/admin/cms/media', { params });
    return response.data;
  },

  deleteMedia: async (mediaId) => {
    const response = await api.delete(`/admin/cms/media/${mediaId}`);
    return response.data;
  }
};

// Utilitaires
export const handleApiError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    const message = error.response.data?.detail || 
                   error.response.data?.message || 
                   'Une erreur est survenue';
    return message;
  } else if (error.request) {
    // Erreur de réseau
    return 'Erreur de connexion au serveur';
  } else {
    // Autre erreur
    return error.message || 'Une erreur inattendue est survenue';
  }
};

export default api;