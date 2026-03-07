import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  DollarSign, Plus, Edit, Trash2, Save, X, Loader2,
  Eye, EyeOff, GripVertical, Home as HomeIcon
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ICON_OPTIONS = ['Home', 'Mountain', 'Building', 'PlusSquare', 'Shield', 'Ruler', 'FileText', 'Hammer', 'Wrench', 'Paintbrush'];

const PlanOptionsManager = () => {
  const { toast } = useToast();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOption, setNewOption] = useState({
    name: '', price: '', description: '', category: 'plans'
  });

  useEffect(() => { loadOptions(); }, []);

  const getToken = () => localStorage.getItem('authToken');

  const loadOptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/plan-options`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setOptions(data.data || []);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de charger les options", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (option) => {
    try {
      setSaving(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/plan-options/${option.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(option)
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Sauvegardé", description: `"${option.name}" mis à jour` });
        setEditingOption(null);
        loadOptions();
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Erreur lors de la sauvegarde", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newOption.name) return;
    try {
      setSaving(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/plan-options`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newOption, order: options.length })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Ajouté", description: `"${newOption.name}" créé` });
        setNewOption({ name: '', price: '', description: '', category: 'plans' });
        setIsAddModalOpen(false);
        loadOptions();
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Erreur lors de l'ajout", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (option) => {
    if (!window.confirm(`Supprimer "${option.name}" ?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/plan-options/${option.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Supprimé", description: `"${option.name}" supprimé` });
        loadOptions();
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const handleToggleActive = async (option) => {
    await handleSave({ ...option, is_active: !option.is_active });
  };

  const categoryLabels = {
    plans: 'Plans techniques',
    projets: 'Projets complets',
    services: 'Services'
  };

  const categoryColors = {
    plans: 'bg-blue-100 text-blue-700',
    projets: 'bg-green-100 text-green-700',
    services: 'bg-amber-100 text-amber-700'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    );
  }

  const groupedOptions = {
    plans: options.filter(o => o.category === 'plans'),
    projets: options.filter(o => o.category === 'projets'),
    services: options.filter(o => o.category === 'services'),
  };

  return (
    <div className="space-y-6" data-testid="plan-options-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prix du formulaire de devis</h2>
          <p className="text-gray-600 mt-1">Gérez les services et prix affichés sur le formulaire de demande de devis</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-teal-700 hover:bg-teal-800" data-testid="add-plan-option-btn">
          <Plus className="w-4 h-4 mr-2" /> Ajouter une option
        </Button>
      </div>

      {Object.entries(groupedOptions).map(([cat, catOptions]) => (
        <div key={cat}>
          <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Badge className={categoryColors[cat]}>{categoryLabels[cat]}</Badge>
            <span className="text-sm text-slate-400">({catOptions.length})</span>
          </h3>
          <div className="space-y-2">
            {catOptions.map((option) => (
              <Card key={option.id} className={`border ${!option.is_active ? 'opacity-50 border-dashed' : 'border-stone-200'}`} data-testid={`plan-option-${option.id}`}>
                <CardContent className="p-4">
                  {editingOption?.id === option.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Nom</Label>
                          <Input
                            value={editingOption.name}
                            onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
                            data-testid={`edit-name-${option.id}`}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Prix</Label>
                          <Input
                            value={editingOption.price}
                            onChange={(e) => setEditingOption({ ...editingOption, price: e.target.value })}
                            placeholder="ex: 500$ ou Sur devis"
                            data-testid={`edit-price-${option.id}`}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Catégorie</Label>
                          <Select value={editingOption.category} onValueChange={(v) => setEditingOption({ ...editingOption, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="plans">Plans techniques</SelectItem>
                              <SelectItem value="projets">Projets complets</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Description (optionnel)</Label>
                        <Input
                          value={editingOption.description || ''}
                          onChange={(e) => setEditingOption({ ...editingOption, description: e.target.value })}
                        />
                      </div>
                      {/* Accueil toggle */}
                      <div className="border-t border-stone-200 pt-3">
                        <div className="flex items-center gap-3 mb-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingOption.show_on_home || false}
                              onChange={(e) => setEditingOption({ ...editingOption, show_on_home: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                              <HomeIcon className="w-3 h-3" /> Afficher sur l'accueil
                            </span>
                          </label>
                        </div>
                        {editingOption.show_on_home && (
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            <div>
                              <Label className="text-xs">Nom sur l'accueil</Label>
                              <Input
                                value={editingOption.home_name || ''}
                                onChange={(e) => setEditingOption({ ...editingOption, home_name: e.target.value })}
                                placeholder="ex: Mini-maisons"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Icône</Label>
                              <select
                                value={editingOption.home_icon || 'FileText'}
                                onChange={(e) => setEditingOption({ ...editingOption, home_icon: e.target.value })}
                                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                              >
                                {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Description accueil</Label>
                              <Input
                                value={editingOption.home_description || ''}
                                onChange={(e) => setEditingOption({ ...editingOption, home_description: e.target.value })}
                                placeholder="Description courte pour l'accueil"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave(editingOption)} disabled={saving} className="bg-teal-700 hover:bg-teal-800" data-testid={`save-${option.id}`}>
                          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                          Sauvegarder
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingOption(null)}>
                          <X className="w-3 h-3 mr-1" /> Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="font-medium text-slate-800">{option.name}</span>
                          {option.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-teal-700 text-lg" data-testid={`price-display-${option.id}`}>
                          {option.price}
                        </span>
                        {option.show_on_home && (
                          <Badge className="bg-teal-50 text-teal-700 text-xs"><HomeIcon className="w-3 h-3 mr-1" />Accueil</Badge>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleToggleActive(option)} title={option.is_active ? 'Masquer' : 'Afficher'}>
                          {option.is_active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingOption({ ...option })} data-testid={`edit-${option.id}`}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(option)} data-testid={`delete-${option.id}`}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {catOptions.length === 0 && (
              <p className="text-sm text-slate-400 italic py-2">Aucune option dans cette catégorie</p>
            )}
          </div>
        </div>
      ))}

      {/* Modal ajout */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une option de plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nom *</Label>
              <Input
                value={newOption.name}
                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                placeholder="ex: Plan de fondation"
                data-testid="new-option-name"
              />
            </div>
            <div>
              <Label>Prix</Label>
              <Input
                value={newOption.price}
                onChange={(e) => setNewOption({ ...newOption, price: e.target.value })}
                placeholder="ex: 500$ ou Sur devis"
                data-testid="new-option-price"
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={newOption.category} onValueChange={(v) => setNewOption({ ...newOption, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plans">Plans techniques</SelectItem>
                  <SelectItem value="projets">Projets complets</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optionnel)</Label>
              <Input
                value={newOption.description}
                onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                placeholder="Description courte"
              />
            </div>
            <Button onClick={handleAdd} disabled={saving || !newOption.name} className="w-full bg-teal-700 hover:bg-teal-800" data-testid="confirm-add-option">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanOptionsManager;
