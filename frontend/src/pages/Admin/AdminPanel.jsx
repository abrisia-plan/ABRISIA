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
  DollarSign,
  Navigation
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { devisService, designerService, authService, handleApiError } from '../../services/api';

// Import des composants de gestion
import ProjectsManager from './ProjectsManager';
import KitsManager from './KitsManager';
import CMSSettings from './CMSSettings';
import ContentManager from './ContentManager';
import CategoriesManager from './CategoriesManager';
import TestimonialsManager from './TestimonialsManager';
import LegalPagesManager from './LegalPagesManager';
import EmployeesManager from './EmployeesManager';
import KitOrdersManager from './KitOrdersManager';
import DevisManager from './DevisManager';
import PlanOptionsManager from './PlanOptionsManager';
import CandidaturesManager from './CandidaturesManager';
import HomepageServicesManager from './HomepageServicesManager';
import CalculatorRatesManager from './CalculatorRatesManager';

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
      // Handled silently
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
        <Loader2 className="w-8 h-8 animate-spin text-foret" />
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
              className={`w-full justify-start ${activeTab === 'dashboard' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Tableau de bord
            </Button>
            <Button 
              variant={activeTab === 'devis' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'devis' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('devis-manager')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Devis (vue rapide)
            </Button>
            <Button 
              variant={activeTab === 'projects' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'projects' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Projets (Inspiration)
            </Button>
            <Button 
              variant={activeTab === 'categories' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'categories' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Catégories accueil
            </Button>
            <Button 
              variant={activeTab === 'kits' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'kits' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('kits')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Collection ABRISIA
            </Button>
            <Button 
              variant={activeTab === 'content' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'content' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Services & Prix
            </Button>
            <Button 
              variant={activeTab === 'homepage-services' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'homepage-services' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('homepage-services')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Services accueil
            </Button>
            <Button 
              variant={activeTab === 'plan-options' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'plan-options' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('plan-options')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Prix du devis
            </Button>
            <Button 
              variant={activeTab === 'calculator-rates' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'calculator-rates' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('calculator-rates')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Tarifs calculateur
            </Button>
            <Button 
              variant={activeTab === 'cms' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'cms' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('cms')}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design & Images
            </Button>
            <Button 
              variant={activeTab === 'testimonials' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'testimonials' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('testimonials')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Témoignages
            </Button>
            <Button 
              variant={activeTab === 'legal' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'legal' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('legal')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Pages légales
            </Button>
            <Button 
              variant={activeTab === 'navigation' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'navigation' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('navigation')}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Menu du site
            </Button>

            <div className="border-t border-gray-200 my-3"></div>
            
            <Button 
              variant={activeTab === 'employees' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'employees' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <Users className="w-4 h-4 mr-2" />
              Employés
            </Button>
            <Button 
              variant={activeTab === 'kit-orders' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'kit-orders' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('kit-orders')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Commandes collection
            </Button>
            <Button 
              variant={activeTab === 'devis-manager' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'devis-manager' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('devis-manager')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Gestion des devis
            </Button>
            <Button 
              variant={activeTab === 'candidatures' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'candidatures' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('candidatures')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Candidatures CV
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading && activeTab === 'dashboard' ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-foret" />
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
              
              {activeTab === 'testimonials' && (
                <TestimonialsManager />
              )}
              
              {activeTab === 'legal' && (
                <LegalPagesManager />
              )}
              
              {activeTab === 'employees' && (
                <EmployeesManager />
              )}
              
              {activeTab === 'kit-orders' && (
                <KitOrdersManager />
              )}
              
              {activeTab === 'devis-manager' && (
                <DevisManager />
              )}
              
              {activeTab === 'plan-options' && (
                <PlanOptionsManager />
              )}
              
              {activeTab === 'calculator-rates' && (
                <CalculatorRatesManager />
              )}
              
              {activeTab === 'navigation' && (
                <NavigationManager />
              )}
              
              {activeTab === 'candidatures' && (
                <CandidaturesManager />
              )}
              
              {activeTab === 'homepage-services' && (
                <HomepageServicesManager />
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
                <FileText className="w-8 h-8 text-foret" />
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
            <Button className="w-full justify-start bg-foret hover:bg-bois">
              <FileText className="w-4 h-4 mr-2" />
              Voir les devis en attente
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ImageIcon className="w-4 h-4 mr-2" />
              Ajouter un projet
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter un modèle
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aide & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Projets</strong> : Ajoutez des réalisations dans la page Inspiration</p>
            <p>• <strong>Collection</strong> : Créez des modèles pré-dessinés à vendre</p>
            <p>• <strong>Design</strong> : Modifiez le logo, les couleurs et images du site</p>
            <p>• <strong>Employés</strong> : Gérez votre équipe via l'onglet Employés</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;

// Composant de gestion du menu de navigation
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NavigationManager = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const allPages = [
    { name: 'Accueil', href: '/', locked: true },
    { name: 'Inspiration', href: '/inspiration' },
    { name: 'Collection', href: '/collection' },
    { name: 'Espace Pro', href: '/espace-pro' },
    { name: 'Demander un devis', href: '/devis' },
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Feedback', href: '/feedback' },
  ];

  useEffect(() => {
    loadNavigation();
  }, []);

  const loadNavigation = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/admin/cms/navigation`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.pages) {
        setPages(data.pages);
      } else {
        setPages(allPages.map((p, i) => ({ ...p, visible: p.href !== '/about', order: i })));
      }
    } catch {
      setPages(allPages.map((p, i) => ({ ...p, visible: p.href !== '/about', order: i })));
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (href) => {
    setPages(prev => prev.map(p => 
      p.href === href && !p.locked ? { ...p, visible: !p.visible } : p
    ));
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    newPages.forEach((p, i) => p.order = i);
    setPages(newPages);
  };

  const moveDown = (index) => {
    if (index >= pages.length - 1) return;
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    newPages.forEach((p, i) => p.order = i);
    setPages(newPages);
  };

  const saveNavigation = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/admin/cms/navigation`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ pages })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Menu sauvegardé", description: "Les changements sont visibles sur le site" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-foret" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Menu du site</h2>
        <p className="text-gray-600 mt-1">Choisissez quelles pages apparaissent dans le menu de navigation</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          {pages.map((page, index) => (
            <div key={page.href} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col space-y-1">
                  <button onClick={() => moveUp(index)} className="text-gray-400 hover:text-gray-700 text-xs" disabled={index === 0}>▲</button>
                  <button onClick={() => moveDown(index)} className="text-gray-400 hover:text-gray-700 text-xs" disabled={index === pages.length - 1}>▼</button>
                </div>
                <div>
                  <span className="font-medium text-gray-900">{page.name}</span>
                  <span className="text-sm text-gray-500 ml-2">{page.href}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {page.locked ? (
                  <Badge className="bg-gray-100 text-gray-600">Toujours visible</Badge>
                ) : (
                  <Button
                    variant={page.visible ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePage(page.href)}
                    className={page.visible ? "bg-foret hover:bg-bois" : "text-gray-500"}
                    data-testid={`toggle-${page.href.replace('/', '')}`}
                  >
                    {page.visible ? 'Visible' : 'Masqué'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button 
        onClick={saveNavigation}
        disabled={saving}
        className="bg-foret hover:bg-bois"
        data-testid="save-navigation-button"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sauvegarde...</> : 'Sauvegarder le menu'}
      </Button>
    </div>
  );
};
