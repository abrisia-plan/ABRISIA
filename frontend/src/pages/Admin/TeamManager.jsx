import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, UserPlus, Trash2, KeyRound } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const headers = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 'Content-Type': 'application/json' });

// Équipe : comptes des collaboratrices (rôle « editor »).
// Une collaboratrice se connecte au même endroit que vous et ne voit que les inspirations.
const TeamManager = () => {
  const { toast } = useToast();
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/editors`, { headers: headers() });
      const data = await res.json();
      if (data.success) setEditors(data.data || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger l'équipe", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const call = async (url, method, body) => {
    const res = await fetch(url, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.detail || 'Erreur');
    return data;
  };

  const creer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await call(`${BACKEND_URL}/api/auth/admin/editors`, 'POST', form);
      toast({ title: "Compte créé", description: `Donnez à ${form.name} son courriel et son mot de passe.` });
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const basculer = async (ed) => {
    try {
      await call(`${BACKEND_URL}/api/auth/admin/editors/${ed.id}`, 'PUT', { is_active: !ed.is_active });
      load();
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const nouveauMotDePasse = async (ed) => {
    const pw = window.prompt(`Nouveau mot de passe pour ${ed.name} (8 caractères minimum)`);
    if (!pw) return;
    try {
      await call(`${BACKEND_URL}/api/auth/admin/editors/${ed.id}`, 'PUT', { password: pw });
      toast({ title: "Mot de passe changé" });
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const supprimer = async (ed) => {
    if (!window.confirm(`Supprimer le compte de ${ed.name} ? Ses inspirations restent sur le site.`)) return;
    try {
      await call(`${BACKEND_URL}/api/auth/admin/editors/${ed.id}`, 'DELETE');
      load();
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Équipe</h2>
        <p className="text-gray-600 mt-1">
          Comptes de vos collaboratrices. Elles se connectent au même endroit que vous (Espace équipe)
          et voient seulement les <strong>Projets (Inspiration)</strong> : elles peuvent en ajouter et les publier.
          Elles n'ont pas accès aux prix, aux devis, à la Collection ni aux réglages.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={creer} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Claudia" required />
            </div>
            <div>
              <Label>Courriel</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="courriel@exemple.com" required />
            </div>
            <div>
              <Label>Mot de passe (8 caractères ou plus)</Label>
              <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={saving} className="bg-foret hover:bg-bois">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Créer le compte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-foret" /></div>
      ) : editors.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune collaboratrice pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {editors.map((ed) => (
            <Card key={ed.id} className={ed.is_active ? '' : 'opacity-60'}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{ed.name}</p>
                  <p className="text-sm text-slate-500">{ed.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant={ed.is_active ? 'default' : 'outline'} className={ed.is_active ? 'bg-green-600 hover:bg-green-700' : ''} onClick={() => basculer(ed)}>
                    {ed.is_active ? 'Actif' : 'Désactivé'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => nouveauMotDePasse(ed)} title="Changer le mot de passe">
                    <KeyRound className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => supprimer(ed)} title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamManager;
