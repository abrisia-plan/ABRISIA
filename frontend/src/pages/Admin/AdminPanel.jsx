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
  Navigation,
  Mail,
  Menu,
  X
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { devisService, authService, handleApiError } from '../../services/api';

// Import des composants de gestion
import ProjectsManager from './ProjectsManager';
import KitsManager from './KitsManager';
import CMSSettings from './CMSSettings';
import ContentManager from './ContentManager';
import CategoriesManager from './CategoriesManager';
import TestimonialsManager from './TestimonialsManager';
import LegalPagesManager from './LegalPagesManager';
import KitOrdersManager from './KitOrdersManager';
import PlanOptionsManager from './PlanOptionsManager';
import CandidaturesManager from './CandidaturesManager';
import MessagesManager from './MessagesManager';
import DevisManager from './DevisManager';
import ChatbotNotesManager from './ChatbotNotesManager';
import HomepageServicesManager from './HomepageServicesManager';
import CalculatorRatesManager from './CalculatorRatesManager';
import { marquerAppareilAdmin } from '../../lib/visits';
import TeamManager from './TeamManager';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  // Sur téléphone, la liste des sections est repliée sous un bouton
  const [menuOuvert, setMenuOuvert] = useState(false);
  useEffect(() => { setMenuOuvert(false); }, [activeTab]);
  // Les demandes reçues arrivent par courriel (et dans Zoho) : ici, seulement des copies de sauvegarde
  const [showBackups, setShowBackups] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('authToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!isAuthenticated || !adminUser) {
      navigate('/admin');
      return;
    }
    
    const parsed = JSON.parse(adminUser);
    setUser(parsed);
    // Collaboratrice : seulement les inspirations
    if (parsed.role === 'editor') {
      setActiveTab('projects');
      setLoading(false);
      return;
    }
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
        <Loader2 className="w-8 h-8 animate-spin text-foret" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 sticky top-0 z-40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">ABRISIA PLAN</h1>
              <p className="text-sm text-slate-600">Panneau d'administration</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Voir le site
            </Button>
            <span className="hidden md:inline text-slate-700">Bienvenue, {user.name}</span>
            <Button variant="outline" onClick={handleLogout} className="border-red-300 text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="md:flex">
        {/* Bouton des sections (téléphone seulement) */}
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2">
          <Button variant="outline" className="w-full justify-center" onClick={() => setMenuOuvert(!menuOuvert)}>
            {menuOuvert ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
            {menuOuvert ? 'Fermer la liste' : 'Choisir une section'}
          </Button>
        </div>

        {/* Sidebar */}
        <aside className={`${menuOuvert ? 'block' : 'hidden'} md:block w-full md:w-64 md:shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 md:min-h-[calc(100vh-73px)] p-4`}>
          {user?.role === 'editor' ? (
          <nav className="space-y-2">
            <Button variant="default" className="w-full justify-start bg-foret" onClick={() => setActiveTab('projects')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Projets (Inspiration)
            </Button>
            <p className="px-3 pt-2 text-xs text-gray-500">Ajoutez vos inspirations : elles sont publiées tout de suite.</p>
          </nav>
          ) : (
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
              variant={activeTab === 'reports' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'reports' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Rapports
            </Button>
            <div className="border-t border-gray-100 my-2" />
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
              Textes des pages
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
              Tarifs
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

            <Button 
              variant={activeTab === 'assistant' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'assistant' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('assistant')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Assistant du site
            </Button>
            <Button 
              variant={activeTab === 'team' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'team' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              <Users className="w-4 h-4 mr-2" />
              Équipe
            </Button>

            <div className="border-t border-gray-200 my-3"></div>
            <button
              type="button"
              onClick={() => setShowBackups(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
            >
              Copies de sauvegarde
              <span>{showBackups ? '▲' : '▼'}</span>
            </button>
            {showBackups && (
              <div className="space-y-2">
                <p className="px-3 text-xs text-gray-500">
                  Tout arrive déjà dans votre courriel (et dans Zoho). Ces listes ne servent qu'en cas de besoin.
                </p>
            <Button 
              variant={activeTab === 'kit-orders' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'kit-orders' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('kit-orders')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Commandes collection
            </Button>
            <Button 
              variant={activeTab === 'devis' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'devis' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('devis')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Demandes de devis
            </Button>
            <Button 
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'messages' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Messages et Zoho
            </Button>
            <Button 
              variant={activeTab === 'candidatures' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'candidatures' ? 'bg-foret' : ''}`}
              onClick={() => setActiveTab('candidatures')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Candidatures CV
            </Button>
              </div>
            )}
          </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-3 md:p-6">
          {loading && activeTab === 'dashboard' ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-foret" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab onOpen={setActiveTab} />
              )}
              {activeTab === 'reports' && (
                <ReportsTab />
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
              
              {activeTab === 'kit-orders' && (
                <KitOrdersManager />
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
              
              {activeTab === 'devis' && (
                <DevisManager />
              )}
              
              {activeTab === 'messages' && (
                <MessagesManager />
              )}
              
              {activeTab === 'assistant' && (
                <ChatbotNotesManager />
              )}
              {activeTab === 'team' && user?.role !== 'editor' && (
                <TeamManager />
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

// Composant Dashboard avec graphiques
const DASHBOARD_URL = process.env.REACT_APP_BACKEND_URL;

const authHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });

// Tableau de bord : seulement l'essentiel du mois. Les tests de la propriétaire ne sont pas comptés.
const DashboardTab = ({ onOpen }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    marquerAppareilAdmin();
    fetch(`${DASHBOARD_URL}/api/admin/dashboard`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => (d.success ? setData(d) : setError(true)))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <p className="text-slate-500">Le tableau de bord n'a pas pu se charger. Le serveur se réveille peut-être : réessayez dans une minute.</p>;
  }
  if (!data) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-foret" /></div>;
  }

  const Tuile = ({ titre, valeur, detail, Icone, couleur, onClick }) => (
    <Card className={`border-stone-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{titre}</p>
            <p className={`text-3xl font-bold ${couleur}`}>{valeur}</p>
            {detail && <p className="text-xs text-slate-500 mt-1">{detail}</p>}
          </div>
          <Icone className={`w-8 h-8 ${couleur}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-600 mt-1">Ce mois-ci : {data.mois}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tuile titre="Demandes de devis" valeur={data.devis_mois} detail={`${data.devis_attente} en attente au total`}
          Icone={FileText} couleur="text-amber-600" onClick={() => onOpen('devis')} />
        <Tuile titre="Commandes Collection" valeur={data.commandes_mois} detail={`${data.commandes_annee} depuis janvier ${data.annee}`}
          Icone={ShoppingCart} couleur="text-teal-700" onClick={() => onOpen('kit-orders')} />
        <Tuile titre="Revenus Collection" valeur={`${Math.round(data.revenus_annee)} $`} detail={`Commandes payées en ${data.annee}`}
          Icone={DollarSign} couleur="text-green-700" />
        <Tuile titre="Visiteurs" valeur={data.visiteurs_mois} detail={`${data.visiteurs_jour} aujourd'hui`}
          Icone={Users} couleur="text-slate-700" />
      </div>

      <p className="text-xs text-slate-500">
        Vos propres visites ne sont pas comptées (cet appareil est reconnu dès que vous vous connectez à l'admin),
        ni les devis et commandes faits avec vos courriels de test : {data.courriels_test.join(', ')}.
        Les visiteurs sont comptés depuis le 26 octobre 2026. Pour l'historique d'une année, voyez la section Rapports.
      </p>
    </div>
  );
};

// Rapports annuels en Excel (résumé par mois, liste des devis, liste des commandes)
const ReportsTab = () => {
  const [years, setYears] = useState([new Date().getFullYear()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${DASHBOARD_URL}/api/admin/dashboard`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.annees?.length) setYears(d.annees); })
      .catch(() => {});
  }, []);

  const telecharger = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${DASHBOARD_URL}/api/admin/reports/${year}`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `Abrisia-rapport-${year}.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      toast({ title: "Erreur", description: "Le rapport n'a pas pu être créé. Réessayez dans une minute.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rapports</h2>
        <p className="text-gray-600 mt-1">Téléchargez le rapport d'une année en Excel, pour vos totaux, vos impôts ou votre comptable.</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Année</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded-md px-3 py-2 bg-white">
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Button onClick={telecharger} disabled={busy} className="bg-foret hover:bg-bois">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Télécharger le rapport Excel
            </Button>
          </div>
          <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
            <li><strong>Résumé</strong> : devis, commandes, revenus payés et visiteurs, mois par mois.</li>
            <li><strong>Devis</strong> : chaque demande avec le client, les services choisis et le statut.</li>
            <li><strong>Commandes</strong> : chaque vente de la Collection avec les montants et les taxes.</li>
          </ul>
          <p className="text-xs text-slate-500">Vos devis et commandes de test ne sont pas inclus. Pour un PDF, ouvrez le fichier dans Excel puis Fichier &gt; Enregistrer sous &gt; PDF.</p>
        </CardContent>
      </Card>
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
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
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
        // L'accueil reste toujours visible
        setPages(data.pages.map(p => ({ ...p, locked: p.href === '/' })));
      } else {
        setPages(allPages.map((p, i) => ({ ...p, visible: true, order: i })));
      }
    } catch {
      setPages(allPages.map((p, i) => ({ ...p, visible: true, order: i })));
    } finally {
      setLoading(false);
    }
  };

  // Chaque clic (Visible/Masqué, monter, descendre) est enregistré tout de suite.
  const togglePage = (href) => {
    const newPages = pages.map(p =>
      p.href === href && !p.locked ? { ...p, visible: !p.visible } : p
    );
    setPages(newPages);
    saveNavigation(newPages);
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const newPages = pages.map(p => ({ ...p }));
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    newPages.forEach((p, i) => p.order = i);
    setPages(newPages);
    saveNavigation(newPages);
  };

  const moveDown = (index) => {
    if (index >= pages.length - 1) return;
    const newPages = pages.map(p => ({ ...p }));
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    newPages.forEach((p, i) => p.order = i);
    setPages(newPages);
    saveNavigation(newPages);
  };

  const saveNavigation = async (pagesToSave = pages) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/admin/cms/navigation`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ pages: pagesToSave.map(({ locked, ...p }) => p) })
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      toast({ title: "Menu enregistré", description: "Rechargez le site (Ctrl + F5) pour voir le changement" });
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
        onClick={() => saveNavigation()}
        disabled={saving}
        className="bg-foret hover:bg-bois"
        data-testid="save-navigation-button"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sauvegarde...</> : 'Sauvegarder le menu'}
      </Button>
    </div>
  );
};
