import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, Save, Send, RotateCcw } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Textes des courriels automatiques envoyés aux clients
const EmailTextsManager = () => {
  const { toast } = useToast();
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/email-texts`, { headers: headers() })
      .then(res => res.json())
      .then(data => setTexts(data.data || []))
      .catch(() => toast({ title: 'Erreur', description: 'Impossible de charger les textes des courriels', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const setValue = (key, value) => setTexts(prev => prev.map(t => (t.key === key ? { ...t, value } : t)));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/email-texts`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(Object.fromEntries(texts.map(t => [t.key, t.value]))),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setTexts(data.data);
      toast({ title: 'Enregistré', description: 'Les prochains courriels utiliseront ces textes.' });
    } catch {
      toast({ title: 'Erreur', description: "Les textes n'ont pas été enregistrés", variant: 'destructive' });
    } finally {
      setSaving(false);
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
    <div className="space-y-6" data-testid="email-texts-manager">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Send className="w-6 h-6 text-teal-700" /> Courriels automatiques
        </h2>
        <p className="text-gray-600 mt-1">
          Les textes envoyés aux clients par le site. Une ligne vide sépare deux paragraphes.
          Écrivez <strong>{'{prenom}'}</strong> pour le prénom du client et <strong>{'{moyen}'}</strong> pour
          le moyen de communication qu'il a choisi. Chaque courriel envoyé est aussi noté dans la fiche Zoho du client.
        </p>
        <p className="text-gray-600 mt-2 text-sm">
          Les guides sont ajoutés en liens selon le forfait : Guide 1 (et Guide de croquis si le client n'a joint aucun fichier)
          à la demande de devis ; Guide 2, Guide des appareils (complet et sur mesure) et Fiche de choix (sur mesure) au dépôt.
        </p>
      </div>

      {texts.map((t) => (
        <Card key={t.key}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`email-${t.key}`} className="font-medium text-gray-900">{t.label}</label>
              {t.value !== t.default && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setValue(t.key, t.default)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Texte d'origine
                </Button>
              )}
            </div>
            <textarea
              id={`email-${t.key}`}
              value={t.value}
              onChange={(e) => setValue(t.key, e.target.value)}
              rows={t.key === 'depot_objet' ? 1 : Math.min(10, Math.max(3, Math.ceil(t.value.length / 90) + 1))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </CardContent>
        </Card>
      ))}

      <Button onClick={save} disabled={saving} className="bg-teal-700 hover:bg-teal-800">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Enregistrer
      </Button>
    </div>
  );
};

export default EmailTextsManager;
