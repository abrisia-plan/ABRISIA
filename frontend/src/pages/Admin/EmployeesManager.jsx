import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Users,
  UserPlus,
  User,
  Mail,
  Phone,
  Briefcase,
  Check,
  X,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  Loader2,
  Calendar,
  FileText
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EmployeesManager = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'designer',
    phone: '',
    company: '',
    specialties: ''
  });

  useEffect(() => {
    loadEmployees();
  }, [filterRole, filterStatus]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (filterRole !== 'all') {
        params.append('role', filterRole);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const response = await fetch(`${BACKEND_URL}/api/employees/admin/list?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data || []);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les employés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      // Créer l'employé via l'API d'inscription avec approbation auto
      const response = await fetch(`${BACKEND_URL}/api/employees/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newEmployee.name,
          email: newEmployee.email,
          password: newEmployee.password,
          role: newEmployee.role,
          phone: newEmployee.phone || null,
          company: newEmployee.company || null,
          specialties: newEmployee.specialties ? newEmployee.specialties.split(',').map(s => s.trim()) : []
        })
      });

      const data = await response.json();

      if (data.success) {
        // Récupérer l'ID de l'employé créé et l'approuver
        await loadEmployees();
        
        // Trouver le nouvel employé par email
        const newEmpResponse = await fetch(`${BACKEND_URL}/api/employees/admin/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const newEmpData = await newEmpResponse.json();
        const createdEmp = newEmpData.data?.find(e => e.email === newEmployee.email);
        
        if (createdEmp) {
          // Approuver automatiquement
          await fetch(`${BACKEND_URL}/api/employees/admin/${createdEmp.id}/approve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        toast({
          title: "✅ Employé créé",
          description: `${newEmployee.name} a été ajouté et approuvé`
        });
        setIsAddModalOpen(false);
        setNewEmployee({
          name: '',
          email: '',
          password: '',
          role: 'designer',
          phone: '',
          company: '',
          specialties: ''
        });
        loadEmployees();
      } else {
        throw new Error(data.detail || 'Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApproveEmployee = async (employeeId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/employees/admin/${employeeId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "✅ Employé approuvé",
          description: "L'employé peut maintenant se connecter"
        });
        loadEmployees();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'employé",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (employee) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !employee.isActive })
      });

      if (response.ok) {
        toast({
          title: employee.isActive ? "Employé désactivé" : "✅ Employé activé"
        });
        loadEmployees();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${employee.name} ?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${employee.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "✅ Employé supprimé"
        });
        loadEmployees();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'designer': { color: 'bg-purple-100 text-purple-800', label: 'Dessinateur' },
      'constructor': { color: 'bg-orange-100 text-orange-800', label: 'Constructeur' },
      'employee': { color: 'bg-blue-100 text-blue-800', label: 'Employé' },
      'pending': { color: 'bg-gray-100 text-gray-800', label: 'En attente' }
    };
    const config = roleConfig[role] || roleConfig.employee;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Stats
  const stats = {
    total: employees.length,
    designers: employees.filter(e => e.role === 'designer').length,
    pending: employees.filter(e => !e.isApproved).length,
    active: employees.filter(e => e.isActive && e.isApproved).length
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
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Employés</h2>
          <p className="text-gray-600 mt-1">Gérez votre équipe de dessinateurs et employés</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-foret hover:bg-bois">
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un employé
        </Button>
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
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dessinateurs</p>
                <p className="text-2xl font-bold text-purple-600">{stats.designers}</p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-bois">{stats.pending}</p>
              </div>
              <Shield className="w-8 h-8 text-bois" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="designer">Dessinateurs</SelectItem>
            <SelectItem value="constructor">Constructeurs</SelectItem>
            <SelectItem value="employee">Employés</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente d'approbation</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des employés */}
      {employees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun employé trouvé</p>
          <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter votre premier employé
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Card key={employee.id} className={`${!employee.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-foret" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      {getRoleBadge(employee.role)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!employee.isApproved && (
                      <Badge className="bg-amber-100 text-amber-800">
                        En attente
                      </Badge>
                    )}
                    {!employee.isActive && (
                      <Badge className="bg-red-100 text-red-800">
                        Inactif
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {employee.email}
                  </div>
                  {employee.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {employee.phone}
                    </div>
                  )}
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {employee.projectsCount || 0} projets assignés
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Inscrit le {formatDate(employee.createdAt)}
                  </div>
                </div>

                {employee.specialties && employee.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.specialties.map((spec, idx) => (
                        <Badge key={`spec-${spec}`} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 border-t pt-3">
                  {!employee.isApproved && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveEmployee(employee.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(employee)}
                  >
                    {employee.isActive ? (
                      <><ShieldOff className="w-4 h-4 mr-1" /> Désactiver</>
                    ) : (
                      <><Shield className="w-4 h-4 mr-1" /> Activer</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteEmployee(employee)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Ajouter employé */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Ajouter un employé
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Marie Tremblay"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                placeholder="marie@abrisia-plan.ca"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mot de passe sécurisé"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="designer">Dessinateur</SelectItem>
                  <SelectItem value="constructor">Constructeur</SelectItem>
                  <SelectItem value="employee">Employé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(XXX) XXX-XXXX"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="specialties">Spécialités (séparées par des virgules)</Label>
              <Input
                id="specialties"
                value={newEmployee.specialties}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, specialties: e.target.value }))}
                placeholder="Mini-maisons, Chalets, Plans 3D"
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleAddEmployee}
                disabled={saving}
                className="flex-1 bg-foret hover:bg-bois"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Créer l'employé</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesManager;
