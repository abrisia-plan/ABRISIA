import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';

const CRMFormModal = ({
  isOpen,
  onClose,
  editingClient,
  formData,
  onInputChange,
  statusOptions,
  sourceOptions,
  onSubmit,
  saving
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              onChange={(e) => onInputChange('name', e.target.value)}
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
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="jean@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Telephone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
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
                onChange={(e) => onInputChange('city', e.target.value)}
                placeholder="Saguenay"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Statut</Label>
              <select
                value={formData.status}
                onChange={(e) => onInputChange('status', e.target.value)}
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
                onChange={(e) => onInputChange('project_type', e.target.value)}
                placeholder="Mini-maison, Chalet..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Source</Label>
              <select
                value={formData.source}
                onChange={(e) => onInputChange('source', e.target.value)}
                className="w-full mt-1 h-10 px-3 border border-gray-300 rounded-md"
              >
                <option value="">Selectionner...</option>
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
              onChange={(e) => onInputChange('notes', e.target.value)}
              placeholder="Notes sur le client..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={onSubmit}
              disabled={saving}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Enregistrer</>
              )}
            </Button>
            <Button variant="outline" onClick={() => onClose(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CRMFormModal;
