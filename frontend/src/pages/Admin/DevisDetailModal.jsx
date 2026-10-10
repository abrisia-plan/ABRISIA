import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FileText, User, Home, Check, Loader2 } from 'lucide-react';

const DevisDetailModal = ({
  isOpen,
  onClose,
  selectedDevis,
  updateForm,
  setUpdateForm,
  employees,
  onUpdate,
  updating,
  formatDate
}) => {
  if (!selectedDevis) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-foret" />
            {selectedDevis.projectType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <div>
                <span className="text-gray-500">Telephone:</span>
                <p className="font-medium">{selectedDevis.telephone || '-'}</p>
              </div>
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
              Details du projet
            </h4>
            
            {selectedDevis.plansChoisis && selectedDevis.plansChoisis.length > 0 && (
              <div className="mb-3">
                <span className="text-gray-600 text-sm">Plans demandes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedDevis.plansChoisis.map((plan) => (
                    <Badge key={`sel-plan-${plan}`} className="bg-teal-100 text-teal-800">
                      {plan}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {selectedDevis.notes && (
              <div>
                <span className="text-gray-600 text-sm">Description / Notes:</span>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap">{selectedDevis.notes}</p>
              </div>
            )}

            {selectedDevis.fichiers?.length > 0 && (
              <div>
                <span className="text-gray-600 text-sm">Fichiers joints :</span>
                <ul className="mt-1 space-y-1">
                  {selectedDevis.fichiers.map((f) => (
                    <li key={f.id} className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-foret underline break-all">
                        {f.filename}
                      </a>
                      <span className="text-xs text-gray-500">({f.size < 1024 * 1024 ? `${Math.max(1, Math.round(f.size / 1024))} Ko` : `${(f.size / 1024 / 1024).toFixed(1)} Mo`})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Gestion */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Gestion du devis</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Statut</Label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Terminé">Terminé</SelectItem>
                    <SelectItem value="Rejeté">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Priorite</Label>
                <Select
                  value={updateForm.priority}
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assigner a un dessinateur</Label>
                <Select
                  value={updateForm.assigned_designer}
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, assigned_designer: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-assigne">Non assigne</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.name}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Budget estime ($)</Label>
                <Input
                  type="number"
                  value={updateForm.estimated_budget}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, estimated_budget: e.target.value }))}
                  placeholder="Ex: 5000"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Notes admin</Label>
              <Textarea
                value={updateForm.admin_notes}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                placeholder="Notes internes..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onUpdate}
              disabled={updating}
              className="flex-1 bg-foret hover:bg-bois"
            >
              {updating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> Enregistrer</>
              )}
            </Button>
            <Button variant="outline" onClick={() => onClose(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DevisDetailModal;
