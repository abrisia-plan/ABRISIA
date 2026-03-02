import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Loader2,
  Users,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Eye,
  FileText,
  Star,
  Calendar
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CRMManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    status: 'prospect',
    source: '',
    notes: '',
    project_type: ''
  });

  const statusOptions = [
    { value: 'prospect', label: 'Prospect', color: 'bg-gray-100 text-gray-800' },
    { value: 'contacted', label: 'Contacté', color: 'bg-blue-100 text-blue-800' },
    { value: 'negotiation', label: 'En négociation', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'client', label: 'Client', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Projet terminé', color: 'bg-purple-100 text-purple-800' },
    { value: 'inactive', label: 'Inactif', color: 'bg-red-100 text-red-800' }
  ];

  const sourceOptions = [
    'Site web',
    'Bouche à oreille',
    'Réseaux sociaux',
    'Référence client',
    'Salon/Événement',
    'Autre'
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setClients(data.data || []);
      }
    } catch (error) {
      // Mock data si pas en DB
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      status: 'prospect',
      source: '',
      notes: '',
      project_type: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      status: client.status || 'prospect',
      source: client.source || '',
      notes: client.notes || '',
      project_type: client.project_type || ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Le nom est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const url = editingClient 
        ? `${BACKEND_URL}/api/admin/clients/${editingClient.id}`
        : `${BACKEND_URL}/api/admin/clients`;
      
      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingClient ? "✅ Client modifié" : "✅ Client ajouté"
        });
        setIsModalOpen(false);
        loadClients();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (client, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${BACKEND_URL}/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...client, status: newStatus })
      });
      
      toast({ title: "✅ Statut mis à jour" });
      loadClients();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const deleteClient = async (client) => {
    if (!window.confirm(`Supprimer ${client.name} ?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${BACKEND_URL}/api/admin/clients/${client.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast({ title: "✅ Client supprimé" });
      loadClients();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : null;
  };

  // Filtrer les clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: clients.length,
    prospects: clients.filter(c => c.status === 'prospect').length,
    clients: clients.filter(c => c.status === 'client').length,
    completed: clients.filter(c => c.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM - Gestion des clients</h2>
          <p className="text-gray-600 mt-1">Gérez vos prospects et clients</p>
        </div>
        <Button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.prospects}</p>
            <p className="text-sm text-gray-500">Prospects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.clients}</p>
            <p className="text-sm text-gray-500">Clients actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-sm text-gray-500">Projets terminés</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un client..."
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 border border-gray-300 rounded-md"
        >
          <option value="all">Tous les statuts</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Liste des clients */}
      <Card>
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun client trouvé</p>
              <Button onClick={openAddModal} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter votre premier client
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Client</th>
                  <th className="text-left p-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left p-4 font-medium text-gray-600">Projet</th>
                  <th className="text-left p-4 font-medium text-gray-600">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{client.name}</p>
                        {client.city && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {client.city}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {client.email && (
                          <p className="flex items-center text-gray-600">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email}
                          </p>
                        )}
                        {client.phone && (
                          <p className="flex items-center text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{client.project_type || '-'}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={client.status}
                        onChange={(e) => updateStatus(client, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedClient(client)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditModal(client)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteClient(client)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal Ajouter/Modifier */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Modifier le client' : 'Nouveau client'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label>Nom complet *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Jean Tremblay"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="jean@email.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="418-555-0123"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ville</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Saguenay"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Statut</Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full mt-1 h-10 px-3 border border-gray-300 rounded-md"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de projet</Label>
                <Input
                  value={formData.project_type}
                  onChange={(e) => handleInputChange('project_type', e.target.value)}
                  placeholder="Mini-maison, Chalet..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Source</Label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full mt-1 h-10 px-3 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner...</option>
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notes sur le client..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Enregistrer</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Détails client */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fiche client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 pt-4">
              <div className="text-center pb-4 border-b">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-teal-700">
                    {selectedClient.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{selectedClient.name}</h3>
                {getStatusBadge(selectedClient.status)}
              </div>
              
              <div className="space-y-3">
                {selectedClient.email && (
                  <p className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    {selectedClient.email}
                  </p>
                )}
                {selectedClient.phone && (
                  <p className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    {selectedClient.phone}
                  </p>
                )}
                {selectedClient.city && (
                  <p className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    {selectedClient.city}
                  </p>
                )}
                {selectedClient.project_type && (
                  <p className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-3 text-gray-400" />
                    Projet: {selectedClient.project_type}
                  </p>
                )}
              </div>
              
              {selectedClient.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{selectedClient.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => {
                  setSelectedClient(null);
                  openEditModal(selectedClient);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMManager;
