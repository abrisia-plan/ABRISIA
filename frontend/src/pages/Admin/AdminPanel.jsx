import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  FileText, 
  LogOut, 
  Home as HomeIcon,
  Settings,
  Image as ImageIcon,
  ShoppingCart,
  MessageSquare,
  Palette,
  Loader2,
  LayoutDashboard,
  DollarSign
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { devisService, designerService, authService, handleApiError } from '../../services/api';

// Import des composants de gestion
import ProjectsManager from './ProjectsManager';
import KitsManager from './KitsManager';
import CMSSettings from './CMSSettings';
import ContentManager from './ContentManager';
import CategoriesManager from './CategoriesManager';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('authToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!isAuthenticated || !adminUser) {
      navigate('/admin');
      return;
    }
    
    setUser(JSON.parse(adminUser));
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsResponse = await devisService.getStats();
      setStats(statsResponse);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate('/');
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ABRISIA PLAN</h1>
              <p className="text-sm text-slate-600">Panneau d'administration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Voir le site
            </Button>
            <span className="text-slate-700">Bienvenue, {user.name}</span>
            <Button variant="outline" onClick={handleLogout} className="border-red-300 text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'dashboard' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Tableau de bord
            </Button>
            <Button 
              variant={activeTab === 'devis' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'devis' ? 'bg-teal-600' : ''}`}
              onClick={() => navigate('/admin/dashboard')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Gestion des devis
            </Button>
            <Button 
              variant={activeTab === 'projects' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'projects' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Projets (Inspiration)
            </Button>
            <Button 
              variant={activeTab === 'categories' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'categories' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Catégories accueil
            </Button>
            <Button 
              variant={activeTab === 'kits' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'kits' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('kits')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Kits de plans
            </Button>
            <Button 
              variant={activeTab === 'content' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'content' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Services & Prix
            </Button>
            <Button 
              variant={activeTab === 'cms' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'cms' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('cms')}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design & Images
            </Button>
            <Button 
              variant={activeTab === 'employees' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'employees' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <Users className="w-4 h-4 mr-2" />
              Employés
            </Button>
            <Button 
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'messages' ? 'bg-teal-600' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading && activeTab === 'dashboard' ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab stats={stats} />
              )}
              
              {activeTab === 'projects' && (
                <ProjectsManager />
              )}
              
              {activeTab === 'categories' && (
                <CategoriesManager />
              )}
              
              {activeTab === 'kits' && (
                <KitsManager />
              )}
              
              {activeTab === 'content' && (
                <ContentManager />
              )}
              
              {activeTab === 'cms' && (
                <CMSSettings />
              )}
              
              {activeTab === 'employees' && (
                <EmployeesTab />
              )}
              
              {activeTab === 'messages' && (
                <MessagesTab />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Composant Dashboard
const DashboardTab = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-stone-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total des devis</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total_devis}</p>
                </div>
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending_devis}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">En cours</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.active_devis}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Terminés</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed_devis}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-teal-600 hover:bg-teal-700">
              <FileText className="w-4 h-4 mr-2" />
              Voir les devis en attente
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ImageIcon className="w-4 h-4 mr-2" />
              Ajouter un projet
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter un kit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aide & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Projets</strong> : Ajoutez des réalisations dans la page Inspiration</p>
            <p>• <strong>Kits</strong> : Créez des plans pré-dessinés à vendre</p>
            <p>• <strong>Design</strong> : Modifiez le logo, les couleurs et images du site</p>
            <p>• <strong>Employés</strong> : Gérez votre équipe (bientôt disponible)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Composant Employés (à développer)
const EmployeesTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des employés</h2>
        <p className="text-gray-600 mt-1">Gérez votre équipe et leurs accès</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Bientôt disponible</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Cette fonctionnalité permettra de :
          </p>
          <ul className="text-gray-500 mt-4 space-y-2 text-left max-w-sm mx-auto">
            <li>• Créer des comptes employés/dessinateurs</li>
            <li>• Assigner des devis automatiquement</li>
            <li>• Envoyer des messages de groupe</li>
            <li>• Gérer les permissions d'accès</li>
            <li>• Suivre l'activité de l'équipe</li>
          </ul>
          <Badge className="mt-6 bg-amber-100 text-amber-800">En développement</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant Messages (à développer)
const MessagesTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600 mt-1">Communiquez avec vos clients et employés</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Bientôt disponible</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Cette fonctionnalité permettra de :
          </p>
          <ul className="text-gray-500 mt-4 space-y-2 text-left max-w-sm mx-auto">
            <li>• Envoyer des messages aux clients</li>
            <li>• Créer des discussions de groupe</li>
            <li>• Envoyer des notifications par email</li>
            <li>• Gérer les commentaires clients</li>
            <li>• Historique des conversations</li>
          </ul>
          <Badge className="mt-6 bg-amber-100 text-amber-800">En développement</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
