import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Check,
  X,
  Eye,
  UserPlus,
  DollarSign,
  Loader2,
  Search,
  Filter,
  Home,
  Building
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import DevisDetailModal from './DevisDetailModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DevisManager = () => {
  const { toast } = useToast();
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [updating, setUpdating] = useState(false);
  
  const [updateForm, setUpdateForm] = useState({
    status: '',
    assigned_designer: '',
    priority: '',
    estimated_budget: '',
    admin_notes: ''
  });

  useEffect(() => {
    loadDevis();
    loadEmployees();
  }, [filterStatus]);

  const loadDevis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      params.append('per_page', '100');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/devis?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDevis(data.data || []);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/employees/admin/list?role=designer`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data.filter(e => e.isApproved && e.isActive) || []);
      }
    } catch (error) {
      // Handled silently
    }
  };

  const openDevisModal = (devisItem) => {
    setSelectedDevis(devisItem);
    setUpdateForm({
      status: devisItem.status || 'En attente',
      assigned_designer: devisItem.assignedDesigner || '',
      priority: devisItem.priority || 'normal',
      estimated_budget: devisItem.estimatedBudget?.toString() || '',
      admin_notes: devisItem.adminNotes || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateDevis = async () => {
    if (!selectedDevis) return;
    
    try {
      setUpdating(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/devis/${selectedDevis.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateForm.status,
          assigned_designer: updateForm.assigned_designer || null,
          priority: updateForm.priority,
          estimated_budget: updateForm.estimated_budget ? parseFloat(updateForm.estimated_budget) : null,
          admin_notes: updateForm.admin_notes
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Devis mis à jour",
          description: "Les modifications ont été enregistrées"
        });
        setIsModalOpen(false);
        loadDevis();
      } else {
        throw new Error(data.detail || 'Erreur');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'En attente': { color: 'bg-amber-100 text-amber-800', icon: Clock },
      'En cours': { color: 'bg-blue-100 text-blue-800', icon: FileText },
      'Terminé': { color: 'bg-green-100 text-green-800', icon: Check },
      'Rejeté': { color: 'bg-red-100 text-red-800', icon: X },
    };
    const config = statusConfig[status] || statusConfig['En attente'];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />{status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'normal': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return <Badge className={colors[priority] || colors.normal}>{priority}</Badge>;
  };

  const filteredDevis = devis.filter(d => {
    // Filtre recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!(d.nom?.toLowerCase().includes(search) || d.email?.toLowerCase().includes(search) || d.projectType?.toLowerCase().includes(search))) {
        return false;
      }
    }
    // Filtre mois/année
    if (filterMonth !== 'all' || filterYear !== 'all') {
      const date = d.createdAt ? new Date(d.createdAt) : null;
      if (!date) return false;
      if (filterYear !== 'all' && date.getFullYear() !== parseInt(filterYear)) return false;
      if (filterMonth !== 'all' && date.getMonth() !== parseInt(filterMonth)) return false;
    }
    return true;
  });

  // Extraire les années disponibles
  const availableYears = [...new Set(devis.map(d => d.createdAt ? new Date(d.createdAt).getFullYear() : null).filter(Boolean))].sort((a, b) => b - a);

  const monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

  // Stats
  const stats = {
    total: devis.length,
    enAttente: devis.filter(d => d.status === 'En attente').length,
    enCours: devis.filter(d => d.status === 'En cours').length,
    termines: devis.filter(d => d.status === 'Terminé').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foret" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Devis</h2>
          <p className="text-gray-600 mt-1">Consultez et gérez les demandes de devis</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
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
                <p className="text-2xl font-bold text-bois">{stats.enAttente}</p>
              </div>
              <Clock className="w-8 h-8 text-bois" />
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

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, email, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="devis-search"
          />
        </div>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          className="h-10 px-3 border border-gray-300 rounded-md text-sm" data-testid="devis-filter-year">
          <option value="all">Toutes les annees</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          className="h-10 px-3 border border-gray-300 rounded-md text-sm" data-testid="devis-filter-month">
          <option value="all">Tous les mois</option>
          {monthNames.map((m, i) => <option key={`month-${i}`} value={i}>{m}</option>)}
        </select>
      </div>
      <div className="flex gap-2 flex-wrap" data-testid="devis-status-filters">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            Tous
          </Button>
          <Button
            variant={filterStatus === 'En attente' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('En attente')}
            size="sm"
            className={filterStatus === 'En attente' ? 'bg-beige0' : ''}
          >
            En attente
          </Button>
          <Button
            variant={filterStatus === 'En cours' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('En cours')}
            size="sm"
            className={filterStatus === 'En cours' ? 'bg-blue-500' : ''}
          >
            En cours
          </Button>
          <Button
            variant={filterStatus === 'Terminé' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('Terminé')}
            size="sm"
            className={filterStatus === 'Terminé' ? 'bg-green-500' : ''}
          >
            Termines
          </Button>
          <span className="text-sm text-slate-500 ml-2 self-center">{filteredDevis.length} devis affiche(s)</span>
        </div>

      {/* Liste des devis */}
      {filteredDevis.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun devis trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDevis.map((devisItem) => (
            <Card key={devisItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(devisItem.status)}
                      {devisItem.priority && getPriorityBadge(devisItem.priority)}
                      {devisItem.assignedDesigner && (
                        <Badge variant="outline" className="flex items-center">
                          <UserPlus className="w-3 h-3 mr-1" />
                          {devisItem.assignedDesigner}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Home className="w-5 h-5 text-foret" />
                      {devisItem.projectType}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {devisItem.nom}
                      </span>
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
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(devisItem.createdAt)}
                      </span>
                    </div>

                    {devisItem.plansChoisis && devisItem.plansChoisis.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {devisItem.plansChoisis.slice(0, 3).map((plan, idx) => (
                          <Badge key={`plan-${plan}`} variant="secondary" className="text-xs">
                            {plan}
                          </Badge>
                        ))}
                        {devisItem.plansChoisis.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{devisItem.plansChoisis.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {devisItem.estimatedBudget && (
                      <p className="text-lg font-bold text-teal-700 flex items-center justify-end">
                        <DollarSign className="w-4 h-4" />
                        {devisItem.estimatedBudget.toLocaleString()} $
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDevisModal(devisItem)}
                      className="mt-2"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir / Modifier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal détails devis */}
      <DevisDetailModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        selectedDevis={selectedDevis}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        employees={employees}
        onUpdate={handleUpdateDevis}
        updating={updating}
        formatDate={formatDate}
      />
    </div>
  );
};

export default DevisManager;
