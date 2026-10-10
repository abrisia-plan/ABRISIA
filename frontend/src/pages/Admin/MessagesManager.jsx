import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Mail, Phone, Loader2, Trash2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const KIND_LABELS = {
  devis: 'Demande de devis',
  contact: 'Formulaire de contact',
  pro_contact: 'Espace Pro',
  kit_order: 'Commande Collection',
  customize: 'Personnalisation',
  purchase: 'Achat en ligne',
};

const ZOHO_STATUS = {
  sent: { label: 'Envoyé à Zoho', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Échec Zoho', className: 'bg-red-100 text-red-800' },
  pending: { label: 'En attente', className: 'bg-gray-100 text-gray-800' },
};

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('authToken')}` });

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
};

const MessagesManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [zoho, setZoho] = useState(null);
  const [retrying, setRetrying] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, l, z] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/contacts`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/zoho/leads`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/zoho/status`, { headers: authHeaders() }).then(r => r.json()),
      ]);
      setContacts(c.data || []);
      setLeads(l.data || []);
      setZoho(z);
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de charger les messages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteContact = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    await fetch(`${BACKEND_URL}/api/admin/contacts/${id}`, { method: 'DELETE', headers: authHeaders() });
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const retryLead = async (id) => {
    setRetrying(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/zoho/leads/${id}/retry`, { method: 'POST', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Échec');
      toast({ title: 'Envoyé à Zoho' });
      setLeads(prev => prev.map(l => (l.id === id ? { ...l, zoho_status: 'sent', zoho_error: '' } : l)));
    } catch (err) {
      toast({ title: 'Zoho a refusé', description: err.message, variant: 'destructive' });
    } finally {
      setRetrying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="messages-manager">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Messages et Zoho CRM</h2>
        <p className="text-gray-600 mt-1">Les messages du formulaire de contact et toutes les demandes envoyées vers Zoho.</p>
      </div>

      {zoho && (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${zoho.connected ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          {zoho.connected ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <div>
            <p className="font-medium">{zoho.message}</p>
            {!zoho.connected && (
              <p className="text-sm mt-1">Rien n'est perdu : les demandes sont gardées ici et pourront être renvoyées vers Zoho une fois la connexion réglée.</p>
            )}
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Formulaire de contact ({contacts.length})</h3>
        {contacts.length === 0 ? (
          <p className="text-gray-500">Aucun message pour le moment.</p>
        ) : contacts.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.nom} {c.sujet && <span className="font-normal text-gray-500">— {c.sujet}</span>}</p>
                  <p className="text-xs text-gray-500">{formatDate(c.created_at)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteContact(c.id)} aria-label="Supprimer">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-teal-700"><Mail className="w-4 h-4" />{c.email}</a>
                {c.telephone && <a href={`tel:${c.telephone}`} className="flex items-center gap-1 text-teal-700"><Phone className="w-4 h-4" />{c.telephone}</a>}
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{c.message}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Envois vers Zoho ({leads.length})</h3>
        {leads.length === 0 ? (
          <p className="text-gray-500">Aucune demande pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Provenance</th>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Zoho</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => {
                  const st = ZOHO_STATUS[l.zoho_status] || ZOHO_STATUS.pending;
                  return (
                    <tr key={l.id} className="border-b align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">{formatDate(l.created_at)}</td>
                      <td className="py-2 pr-3">{KIND_LABELS[l.kind] || l.kind}</td>
                      <td className="py-2 pr-3">
                        {l.data?.first_name} {l.data?.last_name !== l.data?.first_name ? l.data?.last_name : ''}
                        <div className="text-gray-500">{l.data?.email}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <Badge className={st.className}>{st.label}</Badge>
                        {l.zoho_status === 'failed' && l.zoho_error && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs break-words">{l.zoho_error}</div>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        {l.zoho_status !== 'sent' && (
                          <Button size="sm" variant="outline" disabled={retrying === l.id || !zoho?.connected} onClick={() => retryLead(l.id)}>
                            {retrying === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                            Renvoyer
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default MessagesManager;
