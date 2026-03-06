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
  ShoppingCart,
  Package,
  Mail,
  Phone,
  User,
  Calendar,
  DollarSign,
  Check,
  Clock,
  X,
  Send,
  FileText,
  Loader2,
  Eye
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const KitOrdersManager = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(false);
  
  const [updateForm, setUpdateForm] = useState({
    status: '',
    payment_method: '',
    files_sent: false,
    admin_notes: ''
  });

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const response = await fetch(`${BACKEND_URL}/api/admin/kit-orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      payment_method: order.paymentMethod || '',
      files_sent: order.filesSent,
      admin_notes: order.adminNotes || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setUpdating(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/kit-orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Commande mise à jour",
          description: "Les modifications ont été enregistrées"
        });
        setIsModalOpen(false);
        loadOrders();
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(price);
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
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Payé</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const paidCount = orders.filter(o => o.status === 'paid').length;
  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);

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
          <h2 className="text-2xl font-bold text-gray-900">Commandes de Kits</h2>
          <p className="text-gray-600 mt-1">Gérez les commandes de plans pré-dessinés</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total commandes</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Payées</p>
                <p className="text-2xl font-bold text-green-600">{paidCount}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenus (payés)</p>
                <p className="text-2xl font-bold text-teal-600">{formatPrice(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          size="sm"
        >
          Toutes
        </Button>
        <Button
          variant={filterStatus === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('pending')}
          size="sm"
          className={filterStatus === 'pending' ? 'bg-amber-500' : ''}
        >
          <Clock className="w-4 h-4 mr-1" />
          En attente ({pendingCount})
        </Button>
        <Button
          variant={filterStatus === 'paid' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('paid')}
          size="sm"
          className={filterStatus === 'paid' ? 'bg-green-500' : ''}
        >
          <Check className="w-4 h-4 mr-1" />
          Payées ({paidCount})
        </Button>
      </div>

      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune commande pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-teal-700">{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                      {order.includeMaterials && (
                        <Badge className="bg-amber-100 text-amber-800">
                          <Package className="w-3 h-3 mr-1" />
                          +Matériaux
                        </Badge>
                      )}
                      {order.filesSent && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Send className="w-3 h-3 mr-1" />
                          Fichiers envoyés
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg">{order.kitName}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {order.customerName}
                      </span>
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {order.customerEmail}
                      </span>
                      {order.customerPhone && (
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {order.customerPhone}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-700">{formatPrice(order.totalAmount)}</p>
                    <div className="text-sm text-gray-500">
                      <span>Base: {formatPrice(order.basePrice)}</span>
                      {order.includeMaterials && (
                        <span className="text-amber-600"> + {formatPrice(order.materialsPrice)}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openOrderModal(order)}
                      className="mt-2"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal détails commande */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono">{selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
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
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Téléphone:</span>
                      <p className="font-medium">{selectedOrder.customerPhone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date commande:</span>
                      <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-gray-500">Notes client:</span>
                      <p className="text-sm mt-1">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                {/* Détails commande */}
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Commande
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{selectedOrder.kitName}</span>
                      <span>{formatPrice(selectedOrder.basePrice)}</span>
                    </div>
                    {selectedOrder.includeMaterials && (
                      <div className="flex justify-between text-amber-700">
                        <span>+ Liste matériaux</span>
                        <span>{formatPrice(selectedOrder.materialsPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Sous-total</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Taxes (TPS+TVQ)</span>
                      <span>{formatPrice(selectedOrder.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-teal-200">
                      <span>Total</span>
                      <span className="text-teal-700">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Gestion */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Gestion de la commande</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Statut</Label>
                      <Select
                        value={updateForm.status}
                        onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="paid">Payé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Méthode de paiement</Label>
                      <Select
                        value={updateForm.payment_method}
                        onValueChange={(value) => setUpdateForm(prev => ({ ...prev, payment_method: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interac">Interac</SelectItem>
                          <SelectItem value="virement">Virement bancaire</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="files_sent"
                      checked={updateForm.files_sent}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, files_sent: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="files_sent" className="cursor-pointer flex items-center">
                      <Send className="w-4 h-4 mr-2 text-blue-600" />
                      Fichiers envoyés au client
                    </Label>
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
                    onClick={handleUpdateOrder}
                    disabled={updating}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {updating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
                    ) : (
                      <><Check className="w-4 h-4 mr-2" /> Enregistrer</>
                    )}
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

export default KitOrdersManager;
