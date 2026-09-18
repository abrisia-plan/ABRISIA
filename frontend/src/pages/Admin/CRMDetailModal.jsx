import React from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Edit, Mail, Phone, MapPin, FileText } from 'lucide-react';

const CRMDetailModal = ({
  client,
  onClose,
  onEdit,
  getStatusBadge
}) => {
  if (!client) return null;

  return (
    <Dialog open={!!client} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fiche client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="text-center pb-4 border-b">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-teal-700">
                {client.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold">{client.name}</h3>
            {getStatusBadge(client.status)}
          </div>
          
          <div className="space-y-3">
            {client.email && (
              <p className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                {client.email}
              </p>
            )}
            {client.phone && (
              <p className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                {client.phone}
              </p>
            )}
            {client.city && (
              <p className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                {client.city}
              </p>
            )}
            {client.project_type && (
              <p className="flex items-center text-gray-600">
                <FileText className="w-4 h-4 mr-3 text-gray-400" />
                Projet: {client.project_type}
              </p>
            )}
          </div>
          
          {client.notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">{client.notes}</p>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={() => onEdit(client)}>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CRMDetailModal;
