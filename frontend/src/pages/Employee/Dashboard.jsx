import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  User, 
  Briefcase, 
  LogOut, 
  Home as HomeIcon,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Camera,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('authToken');
    const userData = localStorage.getItem('adminUser');
    
    if (!isAuthenticated || !userData) {
      navigate('/employee/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    
    // Vérifier si c'est un employé
    if (!['designer', 'constructor', 'employee'].includes(parsedUser.role)) {
      navigate('/');
      return;
    }
    
    setUser(parsedUser);
    loadEmployeeData();
    // eslint-disable-next-line
  }, [navigate]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Simulation des données (sera remplacé par vraies APIs)
      const mockStats = {
        totalProjects: 12,
        activeProjects: 4,
        completedProjects: 8,
        projectsThisMonth: 3
      };

      const mockProjects = [
        {
          id: '1',
          clientName: 'Marie Dubois',
          projectType: 'Mini-maison',
          status: 'En cours',
          priority: 'high',
          assignedDate: '2024-12-15',
          description: 'Mini-maison 25m² avec terrasse couverte'
        },
        {
          id: '2',
          clientName: 'Jean Tremblay',
          projectType: 'Extension',
          status: 'En construction',
          priority: 'normal',
          assignedDate: '2024-12-10',
          description: 'Extension cuisine 20m²'
        },
        {
          id: '3',
          clientName: 'Sophie Martin',
          projectType: 'Chalet',
          status: 'Plans terminés',
          priority: 'low',
          assignedDate: '2024-12-08',
          description: 'Chalet 4 saisons 60m²'
        }
      ];
      
      setStats(mockStats);
      setProjects(mockProjects);
      
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate('/');
    } catch (error) {
      navigate('/');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'En construction': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Plans terminés': return 'bg-green-100 text-green-800 border-green-300';
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En cours': return <Clock className="w-4 h-4" />;
      case 'En construction': return <Settings className="w-4 h-4" />;
      case 'Plans terminés': return <CheckCircle className="w-4 h-4" />;
      case 'En attente': return <AlertCircle className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ABRISIA PLAN</h1>
              <p className="text-sm text-slate-600">Espace Employé</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-slate-700 font-medium">{user.name}</p>
              <p className="text-sm text-slate-500 capitalize">{user.role}</p>
            </div>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
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
                        <p className="text-sm font-medium text-slate-600">Total Projets</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.totalProjects}</p>
                      </div>
                      <Briefcase className="w-8 h-8 text-teal-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">En cours</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.activeProjects}</p>
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
                        <p className="text-3xl font-bold text-green-600">{stats.completedProjects}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Ce mois</p>
                        <p className="text-3xl font-bold text-orange-600">{stats.projectsThisMonth}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Contenu principal */}
            <Tabs defaultValue="projects" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="projects">Mes Projets</TabsTrigger>
                <TabsTrigger value="profile">Mon Profil</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
              </TabsList>

              {/* Onglet Projets */}
              <TabsContent value="projects" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Projets Assignés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Aucun projet assigné pour le moment</p>
                      ) : (
                        projects.map((project) => (
                          <div key={project.id} className="border border-stone-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-slate-800">
                                    {project.clientName}
                                  </h3>
                                  <Badge className={`${getStatusColor(project.status)} flex items-center space-x-1`}>
                                    {getStatusIcon(project.status)}
                                    <span>{project.status}</span>
                                  </Badge>
                                  <Badge className={getPriorityColor(project.priority)}>
                                    {project.priority === 'high' ? 'Priorité haute' : 
                                     project.priority === 'normal' ? 'Priorité normale' : 'Priorité basse'}
                                  </Badge>
                                </div>
                                <p className="text-slate-600 mb-2">{project.projectType}</p>
                                <p className="text-sm text-slate-500 mb-3">{project.description}</p>
                                
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Assigné le {new Date(project.assignedDate).toLocaleDateString('fr-CA')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Ajouter note
                              </Button>
                              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Changer statut
                              </Button>
                              <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                                <Camera className="w-4 h-4 mr-1" />
                                Ajouter photo
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Profil */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Mon Profil Employé
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-700 font-medium">Nom complet</Label>
                        <p className="text-lg text-slate-800 mt-1">{user.name}</p>
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium">Email</Label>
                        <p className="text-lg text-slate-800 mt-1">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium">Rôle</Label>
                        <p className="text-lg text-slate-800 mt-1 capitalize">{user.role}</p>
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium">Téléphone</Label>
                        <p className="text-lg text-slate-800 mt-1">{user.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    
                    {user.specialties && user.specialties.length > 0 && (
                      <div>
                        <Label className="text-slate-700 font-medium">Spécialités</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.specialties.map((specialty) => (
                            <Badge key={specialty} variant="outline" className="bg-teal-50 border-teal-200 text-teal-800">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button className="bg-teal-800 hover:bg-teal-900 text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Modifier mon profil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Activité */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Plans terminés</p>
                          <p className="text-sm text-slate-600">Projet chalet Sophie Martin - Il y a 2 heures</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Note ajoutée</p>
                          <p className="text-sm text-slate-600">Extension Jean Tremblay - Il y a 4 heures</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
                        <Camera className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Photo ajoutée</p>
                          <p className="text-sm text-slate-600">Mini-maison Marie Dubois - Hier</p>
                        </div>
                      </div>
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

export default EmployeeDashboard;