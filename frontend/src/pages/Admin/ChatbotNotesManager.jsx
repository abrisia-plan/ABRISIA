import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, Save, Bot } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EXAMPLE = `Exemples de précisions :
- Je livre les plans en PDF par courriel, et en DWG sur demande.
- Délai habituel : 2 à 4 semaines selon le projet.
- Deux révisions sont incluses dans le prix.
- Je ne fais pas de plans pour les immeubles de plus de 2 logements.
- Je travaille surtout au Saguenay–Lac-Saint-Jean, mais partout au Québec à distance.`;

const ChatbotNotesManager = () => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/chatbot/admin/notes`, { headers: headers() })
      .then(res => res.json())
      .then(data => setText(data.text || ''))
      .catch(() => toast({ title: 'Erreur', description: 'Impossible de charger les précisions', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/chatbot/admin/notes`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Enregistré', description: "L'assistant utilise maintenant ces précisions." });
    } catch {
      toast({ title: 'Erreur', description: "Les précisions n'ont pas été enregistrées", variant: 'destructive' });
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
    <div className="space-y-6" data-testid="chatbot-notes-manager">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="w-6 h-6 text-teal-700" /> Assistant du site
        </h2>
        <p className="text-gray-600 mt-1">
          Écrivez ici, dans vos mots, tout ce que l'assistant doit savoir sur votre façon de travailler.
          Ces précisions passent avant tout le reste. Il lit déjà automatiquement vos services, vos options
          de plans et votre Collection.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder={EXAMPLE}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={save} disabled={saving} className="bg-teal-700 hover:bg-teal-800">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotNotesManager;
