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
  TrendingUp, 
  LogOut, 
  Home as HomeIcon,
  Mail,
  Phone,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { devisService, designerService, authService, handleApiError } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [devis, setDevis] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('authToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!isAuthenticated || !adminUser) {
      navigate('/admin');
      return;
    }
    
    setUser(JSON.parse(adminUser));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les données en parallèle
      const [statsResponse, devisResponse, designersResponse] = await Promise.all([
        devisService.getStats(),
        devisService.getAll(),
        designerService.getAll()
      ]);
      
      setStats(statsResponse);
      setDevis(devisResponse.data || []);
      setDesigners(designersResponse.data || []);
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive"
      });
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
      // Même en cas d'erreur, on déconnecte côté client
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      navigate('/');
    }
  };

  const updateDevisStatus = async (devisId, newStatus, assignedTo = null) => {
    try {
      await devisService.updateStatus(devisId, {
        status: newStatus,
        assigned_to: assignedTo
      });
      
      toast({
        title: "Statut mis à jour",
        description: `Le devis a été marqué comme "${newStatus}".`,
      });
      
      // Recharger les données
      loadDashboardData();
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const assignToDesigner = (devisId, designerName) => {
    updateDevisStatus(devisId, 'En cours', designerName);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Terminé': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejeté': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En attente': return <AlertCircle className="w-4 h-4" />;
      case 'En cours': return <Clock className="w-4 h-4" />;
      case 'Terminé': return <CheckCircle className="w-4 h-4" />;
      case 'Rejeté': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ABRISIA PLAN</h1>
              <p className="text-sm text-slate-600">Tableau de bord administrateur</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/panel')}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Panneau complet
            </Button>
            <span className="text-slate-700">Bienvenue, {user.name}</span>
            <Button variant="outline" onClick={handleLogout} className="border-red-300 text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
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
                      <Clock className="w-8 h-8 text-blue-600" />
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
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="devis" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="devis">Gestion des devis</TabsTrigger>
                <TabsTrigger value="designers">Dessinateurs</TabsTrigger>
              </TabsList>

              <TabsContent value="devis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Demandes de devis récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {devis.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Aucun devis pour le moment</p>
                      ) : (
                        devis.map((devisItem) => (
                          <div key={devisItem.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-slate-800">
                                    {devisItem.nom}
                                  </h3>
                                  <Badge className={`${getStatusColor(devisItem.status)} flex items-center space-x-1`}>
                                    {getStatusIcon(devisItem.status)}
                                    <span>{devisItem.status}</span>
                                  </Badge>
                                </div>
                                <p className="text-slate-600 mb-2">{devisItem.projectType}</p>
                                <p className="text-sm text-slate-500 mb-3">{devisItem.notes}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {devisItem.plansChoisis.map((service, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <span className="flex items-center">
                                    <Mail className="w-4 h-4 mr-1" />
                                    {devisItem.email}
                                  </span>
                                  {devisItem.telephone && (
                                    <span className="flex items-center">
                                      <Phone className="w-4 h-4 mr-1" />
                                      {devisItem.telephone}
                                    </span>
                                  )}
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {new Date(devisItem.createdAt).toLocaleDateString('fr-CA')}
                                  </span>
                                </div>
                                
                                {devisItem.assignedTo && (
                                  <div className="mt-2 flex items-center text-sm text-blue-600">
                                    <User className="w-4 h-4 mr-1" />
                                    Assigné à : {devisItem.assignedTo}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {devisItem.status === 'En attente' && (
                                <>
                                  {designers.map((designer) => (
                                    <Button
                                      key={designer.id}
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                      onClick={() => assignToDesigner(devisItem.id, designer.name)}
                                    >
                                      Assigner à {designer.name}
                                    </Button>
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                    onClick={() => updateDevisStatus(devisItem.id, 'Rejeté')}
                                  >
                                    Rejeter
                                  </Button>
                                </>
                              )}
                              
                              {devisItem.status === 'En cours' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-300 text-green-700 hover:bg-green-50"
                                  onClick={() => updateDevisStatus(devisItem.id, 'Terminé', devisItem.assignedTo)}
                                >
                                  Marquer comme terminé
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="designers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Équipe de dessinateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {designers.length === 0 ? (
                        <p className="text-center text-slate-500 py-8 col-span-2">Aucun dessinateur enregistré</p>
                      ) : (
                        designers.map((designer) => (
                          <Card key={designer.id} className="border-stone-200">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-teal-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-800">{designer.name}</h3>
                                  <p className="text-sm text-slate-600">{designer.email}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-slate-700 mb-1">Spécialités :</p>
                                  <div className="flex flex-wrap gap-1">
                                    {designer.specialties.map((specialty, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {specialty}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">Projets actifs :</span>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {designer.activeProjects}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;