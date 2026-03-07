import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Save, X, Loader2, Eye, EyeOff, DollarSign } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ICON_OPTIONS = ['Home', 'Mountain', 'Building', 'PlusSquare', 'Shield', 'Ruler', 'FileText', 'Hammer', 'Wrench', 'Paintbrush'];

const HomepageServicesManager = () => {
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', icon: 'Home', devis_category: '' });

  useEffect(() => { loadServices(); }, []);
  const getToken = () => localStorage.getItem('authToken');

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/homepage-services`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setServices(data.data || []);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de charger les services", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSave = async (service) => {
    try {
      setSaving(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/homepage-services/${service.id}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      const data = await res.json();
      if (data.success) { toast({ title: "Sauvegarde" }); setEditingService(null); loadServices(); }
    } catch (err) { toast({ title: "Erreur", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!newService.name) return;
    try {
      setSaving(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/homepage-services`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newService, order: services.length })
      });
      const data = await res.json();
      if (data.success) { toast({ title: "Service ajoute" }); setNewService({ name: '', description: '', price: '', icon: 'Home', devis_category: '' }); setIsAddModalOpen(false); loadServices(); }
    } catch (err) { toast({ title: "Erreur", variant: "destructive" }); } finally { setSaving(false); }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Supprimer "${service.name}" ?`)) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/homepage-services/${service.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
      toast({ title: "Supprime" }); loadServices();
    } catch (err) { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const toggleActive = async (service) => { await handleSave({ ...service, is_active: !service.is_active }); };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-700" /></div>;

  return (
    <div className="space-y-6" data-testid="homepage-services-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services de l'accueil</h2>
          <p className="text-gray-600 mt-1">Les cartes de services affichees sur la page d'accueil. Un clic redirige le client vers le formulaire de devis.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-teal-700 hover:bg-teal-800" data-testid="add-homepage-service-btn">
          <Plus className="w-4 h-4 mr-2" /> Ajouter
        </Button>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <Card key={service.id} className={`border ${!service.is_active ? 'opacity-50 border-dashed' : 'border-stone-200'}`} data-testid={`homepage-service-${service.id}`}>
            <CardContent className="p-4">
              {editingService?.id === service.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Nom</Label><Input value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} /></div>
                    <div><Label className="text-xs">Prix affiche</Label><Input value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: e.target.value })} placeholder="ex: Plans a partir de 800$" /></div>
                  </div>
                  <div><Label className="text-xs">Description</Label><Input value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Icone</Label>
                      <select value={editingService.icon} onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm">
                        {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div><Label className="text-xs">Categorie devis (pre-selectionnee)</Label><Input value={editingService.devis_category || ''} onChange={(e) => setEditingService({ ...editingService, devis_category: e.target.value })} placeholder="ex: Mini-maison" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(editingService)} disabled={saving} className="bg-teal-700 hover:bg-teal-800"><Save className="w-3 h-3 mr-1" /> Sauvegarder</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingService(null)}><X className="w-3 h-3 mr-1" /> Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{service.name}</span>
                      <p className="text-xs text-slate-500">{service.description}</p>
                      {service.devis_category && <Badge variant="outline" className="text-xs mt-1">Devis: {service.devis_category}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-teal-700">{service.price}</span>
                    <Button size="sm" variant="ghost" onClick={() => toggleActive(service)}>{service.is_active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingService({ ...service })}><Edit className="w-4 h-4 text-blue-600" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(service)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un service</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Nom *</Label><Input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="ex: Mini-maisons" /></div>
            <div><Label>Prix affiche</Label><Input value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="ex: Plans a partir de 800$" /></div>
            <div><Label>Description</Label><Input value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} /></div>
            <div><Label>Categorie devis (pre-selectionnee au clic)</Label><Input value={newService.devis_category} onChange={(e) => setNewService({ ...newService, devis_category: e.target.value })} placeholder="ex: Mini-maison" /></div>
            <div>
              <Label>Icone</Label>
              <select value={newService.icon} onChange={(e) => setNewService({ ...newService, icon: e.target.value })} className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm">
                {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <Button onClick={handleAdd} disabled={saving || !newService.name} className="w-full bg-teal-700 hover:bg-teal-800">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageServicesManager;
