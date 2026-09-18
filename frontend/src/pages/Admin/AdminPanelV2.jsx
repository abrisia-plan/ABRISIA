import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
  FolderOpen,
  Receipt,
  Mail,
  Briefcase,
  Share2,
  ChevronDown,
  ChevronRight,
  Star
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { devisService, authService } from '../../services/api';

// Import des composants de gestion - APPARENCE
import ProjectsManager from './ProjectsManager';
import KitsManager from './KitsManager';
import KitOrdersManager from './KitOrdersManager';
import CMSSettings from './CMSSettings';
import ContentManager from './ContentManager';
import CategoriesManager from './CategoriesManager';
import TestimonialsManager from './TestimonialsManager';
import LegalPagesManager from './LegalPagesManager';
import DevisManager from './DevisManager';
import EmployeesManager from './EmployeesManager';

// Import des composants de gestion - ERP/CRM
import CRMManager from './CRMManager';
import InvoicesManager from './InvoicesManager';
import ProjectTracker from './ProjectTracker';

const AdminPanelV2 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sections ouvertes/fermées
  const [openSections, setOpenSections] = useState({
    appearance: true,
    management: true
  });

  useEffect(() => {
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
      toast({ title: "Déconnexion réussie" });
      navigate('/');
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      navigate('/');
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Configuration du menu
  const menuConfig = {
    main: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'devis', label: 'Gestion des devis', icon: FileText, onClick: () => navigate('/admin/dashboard') },
    ],
    appearance: {
      label: '📱 Apparence du site',
      items: [
        { id: 'cms', label: 'Design & Images', icon: Palette },
        { id: 'content', label: 'Services & Prix', icon: DollarSign },
        { id: 'categories', label: 'Catégories accueil', icon: FolderOpen },
        { id: 'projects', label: 'Projets (Portfolio)', icon: ImageIcon },
        { id: 'kits', label: 'Kits de plans', icon: ShoppingCart },
        { id: 'kit-orders', label: 'Commandes kits', icon: Receipt },
        { id: 'testimonials', label: 'Témoignages', icon: Star },
        { id: 'legal', label: 'Pages légales', icon: Settings },
      ]
    },
    management: {
      label: '💼 Gestion',
      items: [
        { id: 'devis', label: 'Devis clients', icon: FileText },
        { id: 'employees', label: 'Employés', icon: Users },
        { id: 'crm', label: 'CRM - Clients', icon: Briefcase },
        { id: 'invoices', label: 'Facturation', icon: Receipt },
        { id: 'project-tracker', label: 'Suivi de projets', icon: BarChart3 },
      ]
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
          <nav className="space-y-1">
            {/* Menu principal */}
            {menuConfig.main.map((item) => (
              <Button 
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${activeTab === item.id ? 'bg-teal-600' : ''}`}
                onClick={() => item.onClick ? item.onClick() : setActiveTab(item.id)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
            
            {/* Section Apparence */}
            <div className="pt-4">
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => toggleSection('appearance')}
              >
                <span>{menuConfig.appearance.label}</span>
                {openSections.appearance ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {openSections.appearance && (
                <div className="mt-1 ml-2 space-y-1">
                  {menuConfig.appearance.items.map((item) => (
                    <Button 
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      className={`w-full justify-start text-sm ${activeTab === item.id ? 'bg-teal-600' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Section Gestion */}
            <div className="pt-2">
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => toggleSection('management')}
              >
                <span>{menuConfig.management.label}</span>
                {openSections.management ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {openSections.management && (
                <div className="mt-1 ml-2 space-y-1">
                  {menuConfig.management.items.map((item) => (
                    <Button 
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      className={`w-full justify-start text-sm ${activeTab === item.id ? 'bg-teal-600' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                      disabled={item.badge === 'Bientôt'}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
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
              {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
              
              {/* Apparence */}
              {activeTab === 'cms' && <CMSSettings />}
              {activeTab === 'content' && <ContentManager />}
              {activeTab === 'categories' && <CategoriesManager />}
              {activeTab === 'projects' && <ProjectsManager />}
              {activeTab === 'kits' && <KitsManager />}
              {activeTab === 'kit-orders' && <KitOrdersManager />}
              {activeTab === 'testimonials' && <TestimonialsManager />}
              {activeTab === 'legal' && <LegalPagesManager />}
              
              {/* Gestion */}
              {activeTab === 'devis' && <DevisManager />}
              {activeTab === 'employees' && <EmployeesManager />}
              {activeTab === 'crm' && <CRMManager />}
              {activeTab === 'invoices' && <InvoicesManager />}
              {activeTab === 'project-tracker' && <ProjectTracker />}
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
            <CardTitle>📱 Apparence du site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Design & Images</strong> : Logo, couleurs, fond d'écran</p>
            <p>• <strong>Services & Prix</strong> : Tarifs, options formulaire</p>
            <p>• <strong>Catégories</strong> : Gérer les inspirations</p>
            <p>• <strong>Témoignages</strong> : Avis clients</p>
            <p>• <strong>Pages légales</strong> : Mentions, confidentialité</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💼 Gestion (ERP)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• <strong>CRM Clients</strong> : Gérer vos prospects et clients</p>
            <p>• <strong>Facturation</strong> : Créer et suivre les factures</p>
            <p>• <strong>Suivi de projets</strong> : Tâches et avancement</p>
            <p>• <strong>Emails</strong> : Communication (bientôt)</p>
            <p>• <strong>Marketing</strong> : Réseaux sociaux (bientôt)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Composant Coming Soon
const ComingSoon = ({ title }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Bientôt disponible</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Cette fonctionnalité sera disponible prochainement. 
            Nous travaillons pour vous offrir la meilleure expérience possible.
          </p>
          <Badge className="mt-6 bg-amber-100 text-amber-800">En développement</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanelV2;
