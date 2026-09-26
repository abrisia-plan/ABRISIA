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
  Home,
  Info,
  Mail,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  ClipboardList
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import ServicesManager from './ServicesManager';
import FormOptionsManager from './FormOptionsManager';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ContentManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('services');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Étapes du processus
  const [processSteps, setProcessSteps] = useState([
    { title: "Parlez-nous de votre idée", description: "Envoyez-nous votre demande de devis avec vos besoins et vos idées." },
    { title: "Croquis & devis", description: "Premier contact, premiers dessins et estimation détaillée. Soumission et dépôt." },
    { title: "Plans détaillés", description: "Réalisation des plans complets et professionnels selon vos besoins." },
    { title: "Accompagnement & retours", description: "Conseils et références si besoin. Partagez-nous vos commentaires ! ⭐" }
  ]);

  // Contenu des pages
  const [pageContent, setPageContent] = useState({
    home: {
      hero_title: "Abrisia Plan",
      hero_subtitle: "Des espaces sur mesure, une vie à votre rythme",
      services_title: "Nos services",
      process_title: "Comment ça marche ?",
      process_subtitle: "Un processus simple et transparent pour concrétiser votre projet"
    },
    about: {
      title: "À propos",
      description: ""
    },
    devis: {
      title: "Demander un devis",
      subtitle: "Parlez-nous de votre idée"
    },
    espace_pro: {
      tarif_entrepreneur: "1,50",
      tarif_unite: "$ / pi²"
    }
  });

  useEffect(() => {
    loadProcessSteps();
    loadAllPageContent();
  }, []);

  const loadAllPageContent = async () => {
    try {
      const pages = ['home', 'devis', 'espace_pro'];
      const results = await Promise.all(
        pages.map(p => fetch(`${BACKEND_URL}/api/content/pages/${p}`).then(r => r.json()))
      );
      const updated = { ...pageContent };
      pages.forEach((pageId, i) => {
        if (results[i].success && results[i].content) {
          const content = results[i].content;
          Object.keys(content).forEach(key => {
            if (updated[pageId]) updated[pageId][key] = content[key].value;
          });
        }
      });
      setPageContent(updated);
    } catch (error) {
      console.error('Erreur chargement contenu pages:', error);
    }
  };

  const loadProcessSteps = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/content/process-steps`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setProcessSteps(data.data.map(s => ({ title: s.title, description: s.description })));
      }
    } catch (error) {
      console.error("Erreur silencieuse:", error);
    }
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...processSteps];
    newSteps[index][field] = value;
    setProcessSteps(newSteps);
  };

  const addStep = () => {
    setProcessSteps([...processSteps, { title: "", description: "" }]);
  };

  const removeStep = (index) => {
    if (processSteps.length > 1) {
      setProcessSteps(processSteps.filter((_, i) => i !== index));
    }
  };

  const saveProcessSteps = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/content/process-steps`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(processSteps)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Étapes sauvegardées",
          description: "Les modifications seront visibles sur le site"
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

  const handlePageContentChange = (page, field, value) => {
    setPageContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  const savePageContent = async (pageId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      // Sauvegarder chaque section de la page
      for (const [sectionId, content] of Object.entries(pageContent[pageId])) {
        await fetch(`${BACKEND_URL}/api/admin/content/pages/${pageId}/${sectionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ value: content })
        });
      }
      
      toast({
        title: "✅ Contenu sauvegardé",
        description: `La page ${pageId} a été mise à jour`
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion du contenu</h2>
          <p className="text-gray-600 mt-1">Modifiez les textes, prix et éléments de chaque page</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Services & Prix
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Formulaire devis
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Étapes processus
          </TabsTrigger>
          <TabsTrigger value="home" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Page Accueil
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Autres pages
          </TabsTrigger>
        </TabsList>

        {/* Onglet Services & Prix */}
        <TabsContent value="services">
          <ServicesManager />
        </TabsContent>

        {/* Onglet Options du formulaire */}
        <TabsContent value="form">
          <FormOptionsManager />
        </TabsContent>

        {/* Onglet Étapes du processus */}
        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Étapes "Comment ça marche ?"</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Modifiez les 4 étapes affichées sur la page d'accueil
              </p>
              
              {processSteps.map((step, index) => (
                <div key={step.title || `step-${index}`} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {processSteps.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Titre de l'étape</Label>
                      <Input
                        value={step.title}
                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                        placeholder="Titre..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={step.description}
                        onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                        placeholder="Description..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={addStep}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une étape
                </Button>
                <Button 
                  onClick={saveProcessSteps} 
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Sauvegarder les étapes</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Page Accueil */}
        <TabsContent value="home" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Hero (En-tête)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre principal</Label>
                <Input
                  value={pageContent.home.hero_title}
                  onChange={(e) => handlePageContentChange('home', 'hero_title', e.target.value)}
                  placeholder="Abrisia Plan"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Sous-titre</Label>
                <Input
                  value={pageContent.home.hero_subtitle}
                  onChange={(e) => handlePageContentChange('home', 'hero_subtitle', e.target.value)}
                  placeholder="Des espaces sur mesure..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Titres des sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Titre section Services</Label>
                  <Input
                    value={pageContent.home.services_title}
                    onChange={(e) => handlePageContentChange('home', 'services_title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Titre section Processus</Label>
                  <Input
                    value={pageContent.home.process_title}
                    onChange={(e) => handlePageContentChange('home', 'process_title', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Sous-titre section Processus</Label>
                <Input
                  value={pageContent.home.process_subtitle}
                  onChange={(e) => handlePageContentChange('home', 'process_subtitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={() => savePageContent('home')} 
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Sauvegarder la page Accueil</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Autres pages */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre de la page</Label>
                <Input
                  value={pageContent.devis.title}
                  onChange={(e) => handlePageContentChange('devis', 'title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Sous-titre</Label>
                <Input
                  value={pageContent.devis.subtitle}
                  onChange={(e) => handlePageContentChange('devis', 'subtitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={() => savePageContent('devis')} 
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Save className="w-4 h-4 mr-2" /> Sauvegarder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page À propos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input
                  value={pageContent.about.title}
                  onChange={(e) => handlePageContentChange('about', 'title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={pageContent.about.description}
                  onChange={(e) => handlePageContentChange('about', 'description', e.target.value)}
                  rows={4}
                  className="mt-1"
                  placeholder="Description de votre entreprise..."
                />
              </div>
              <Button 
                onClick={() => savePageContent('about')} 
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Save className="w-4 h-4 mr-2" /> Sauvegarder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page Espace Pro (Entrepreneurs)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tarif entrepreneur</Label>
                  <Input
                    value={pageContent.espace_pro.tarif_entrepreneur}
                    onChange={(e) => handlePageContentChange('espace_pro', 'tarif_entrepreneur', e.target.value)}
                    className="mt-1"
                    placeholder="1,50"
                    data-testid="espace-pro-tarif-input"
                  />
                </div>
                <div>
                  <Label>Unité du tarif</Label>
                  <Input
                    value={pageContent.espace_pro.tarif_unite}
                    onChange={(e) => handlePageContentChange('espace_pro', 'tarif_unite', e.target.value)}
                    className="mt-1"
                    placeholder="$ / pi²"
                    data-testid="espace-pro-unite-input"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">Ce tarif est affiché sur la page Espace Pro destinée aux entrepreneurs.</p>
              <Button 
                onClick={() => savePageContent('espace_pro')} 
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
                data-testid="save-espace-pro-btn"
              >
                <Save className="w-4 h-4 mr-2" /> Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManager;
