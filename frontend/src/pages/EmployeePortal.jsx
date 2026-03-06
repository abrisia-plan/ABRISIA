import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  LogOut,
  User,
  FileText,
  Clock,
  Check,
  Home,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Eye,
  Send,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Page de connexion employé
export const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/employees/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('employeeToken', data.token);
        localStorage.setItem('employeeData', JSON.stringify(data.employee));
        toast({
          title: "✅ Connexion réussie",
          description: `Bienvenue ${data.employee.name}`
        });
        navigate('/espace-employe');
      } else {
        throw new Error(data.detail || 'Identifiants incorrects');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl">Espace Employé</CardTitle>
          <p className="text-gray-500 mt-2">Connectez-vous pour accéder à vos projets</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connexion...</>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard employé
export const EmployeePortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [assignedDevis, setAssignedDevis] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('employeeToken');
    const employeeData = localStorage.getItem('employeeData');
    
    if (!token || !employeeData) {
      navigate('/connexion-employe');
      return;
    }
    
    try {
      const emp = JSON.parse(employeeData);
      setEmployee(emp);
      loadAssignedDevis(emp.name);
    } catch (e) {
      navigate('/connexion-employe');
    }
  }, [navigate]);

  const loadAssignedDevis = async (employeeName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('employeeToken');
      
      // Charger les devis via l'API admin (l'employé a accès limité)
      const response = await fetch(`${BACKEND_URL}/api/employees/my-projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAssignedDevis(data.data || []);
      } else {
        // Fallback: essayer l'API admin devis avec filtre
        const fallbackResponse = await fetch(`${BACKEND_URL}/api/admin/devis?assigned_designer=${encodeURIComponent(employeeName)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || token}`
          }
        });
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) {
          setAssignedDevis(fallbackData.data?.filter(d => d.assignedDesigner === employeeName) || []);
        }
      }
    } catch (error) {
      console.error('Erreur chargement devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeData');
    navigate('/connexion-employe');
    toast({
      title: "Déconnexion",
      description: "À bientôt !"
    });
  };

  const openDevisModal = (devis) => {
    setSelectedDevis(devis);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'En attente': { color: 'bg-amber-100 text-amber-800', icon: Clock },
      'En cours': { color: 'bg-blue-100 text-blue-800', icon: FileText },
      'Terminé': { color: 'bg-green-100 text-green-800', icon: Check },
    };
    const config = statusConfig[status] || statusConfig['En attente'];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />{status}
      </Badge>
    );
  };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Stats
  const stats = {
    total: assignedDevis.length,
    enCours: assignedDevis.filter(d => d.status === 'En cours').length,
    enAttente: assignedDevis.filter(d => d.status === 'En attente').length,
    termines: assignedDevis.filter(d => d.status === 'Terminé').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Espace Employé</h1>
              <p className="text-sm text-gray-500">{employee.name} - {employee.role === 'designer' ? 'Dessinateur' : employee.role}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Bienvenue */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Bonjour {employee.name} ! 👋</h2>
          <p className="opacity-90">Voici les projets qui vous sont assignés.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mes projets</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En attente</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.enAttente}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.enCours}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Terminés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.termines}</p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des devis assignés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Mes projets assignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : assignedDevis.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucun projet assigné pour le moment</p>
                <p className="text-sm text-gray-400">Les nouveaux projets apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedDevis.map((devis) => (
                  <div
                    key={devis.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openDevisModal(devis)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(devis.status)}
                          {devis.priority === 'urgent' && (
                            <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                          )}
                          {devis.priority === 'high' && (
                            <Badge className="bg-orange-100 text-orange-800">Priorité haute</Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Home className="w-5 h-5 text-teal-600" />
                          {devis.projectType}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {devis.nom}
                          </span>
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {devis.email}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(devis.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal détails devis */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDevis && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-teal-600" />
                  {selectedDevis.projectType}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex gap-2">
                  {getStatusBadge(selectedDevis.status)}
                </div>

                {/* Infos client */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Client
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nom:</span>
                      <p className="font-medium">{selectedDevis.nom}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedDevis.email}</p>
                    </div>
                    {selectedDevis.telephone && (
                      <div>
                        <span className="text-gray-500">Téléphone:</span>
                        <p className="font-medium">{selectedDevis.telephone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Date demande:</span>
                      <p className="font-medium">{formatDate(selectedDevis.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Détails projet */}
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Détails du projet
                  </h4>
                  
                  {selectedDevis.plansChoisis && selectedDevis.plansChoisis.length > 0 && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Plans demandés:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDevis.plansChoisis.map((plan, idx) => (
                          <Badge key={idx} className="bg-teal-100 text-teal-800">
                            {plan}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedDevis.notes && (
                    <div>
                      <span className="text-gray-600 text-sm">Description / Notes du client:</span>
                      <p className="mt-1 text-gray-800 whitespace-pre-wrap bg-white p-3 rounded">
                        {selectedDevis.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes admin */}
                {selectedDevis.adminNotes && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Notes de l'admin
                    </h4>
                    <p className="text-sm text-gray-700">{selectedDevis.adminNotes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    onClick={() => window.open(`mailto:${selectedDevis.email}`, '_blank')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Contacter le client
                  </Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeePortal;
