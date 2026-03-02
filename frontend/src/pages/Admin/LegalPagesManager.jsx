import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Save,
  Loader2,
  FileText,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LegalPagesManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('mentions-legales');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [pages, setPages] = useState({
    'mentions-legales': { title: 'Mentions légales', content: '' },
    'politique-confidentialite': { title: 'Politique de confidentialité', content: '' }
  });

  const pageConfig = {
    'mentions-legales': {
      label: 'Mentions légales',
      icon: FileText,
      description: 'Informations légales obligatoires sur votre entreprise'
    },
    'politique-confidentialite': {
      label: 'Politique de confidentialité',
      icon: Shield,
      description: 'Comment vous gérez les données personnelles des utilisateurs'
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/legal-pages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPages(data.data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les pages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (pageId, field, value) => {
    setPages(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [field]: value
      }
    }));
  };

  const savePage = async (pageId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/legal-pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pages[pageId])
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Page sauvegardée",
          description: "Les modifications ont été enregistrées"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Convertir le markdown simple en HTML pour l'aperçu
  const renderPreview = (content) => {
    if (!content) return '';
    
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Pages légales</h2>
          <p className="text-gray-600 mt-1">Modifiez les mentions légales et la politique de confidentialité</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>
          <Button variant="outline" onClick={loadPages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {Object.entries(pageConfig).map(([pageId, config]) => (
            <TabsTrigger key={pageId} value={pageId} className="flex items-center gap-2">
              {React.createElement(config.icon, { className: "w-4 h-4" })}
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(pageConfig).map(([pageId, config]) => (
          <TabsContent key={pageId} value={pageId}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(config.icon, { className: "w-5 h-5" })}
                  {config.label}
                </CardTitle>
                <p className="text-sm text-gray-600">{config.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Titre de la page</Label>
                  <Input
                    value={pages[pageId]?.title || ''}
                    onChange={(e) => handleChange(pageId, 'title', e.target.value)}
                    placeholder="Titre..."
                    className="mt-1"
                  />
                </div>

                {previewMode ? (
                  <div>
                    <Label>Aperçu</Label>
                    <div 
                      className="mt-2 p-6 bg-white border rounded-lg prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: `<p>${renderPreview(pages[pageId]?.content || '')}</p>` }}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Contenu (format Markdown simplifié)</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Utilisez # pour les titres, ## pour les sous-titres, **texte** pour le gras, - pour les listes
                    </p>
                    <Textarea
                      value={pages[pageId]?.content || ''}
                      onChange={(e) => handleChange(pageId, 'content', e.target.value)}
                      placeholder="Contenu de la page..."
                      rows={20}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => savePage(pageId)} 
                    disabled={saving}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`/${pageId}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir sur le site
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Aide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Aide - Format Markdown</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p><code># Titre</code> → Grand titre</p>
              <p><code>## Sous-titre</code> → Sous-titre</p>
              <p><code>### Section</code> → Petite section</p>
            </div>
            <div>
              <p><code>**texte**</code> → <strong>texte en gras</strong></p>
              <p><code>*texte*</code> → <em>texte en italique</em></p>
              <p><code>- élément</code> → • liste à puces</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalPagesManager;
