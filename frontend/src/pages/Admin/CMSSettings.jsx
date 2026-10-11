import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  Save,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { cmsService, projectService, handleApiError } from '../../services/api';

const CMSSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    site_name: 'Abrisia Plan',
    slogan: '',
    hero_image: '',
    logo_url: '',
    primary_color: '#0f766e',
    secondary_color: '#f59e0b',
    accent_color: '#10b981',
    background_color: '#fefbf4',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    business_hours: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    loadSettings();
    loadMedia();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await cmsService.getSettings();
      if (response.success && response.settings) {
        setSettings(prev => ({ ...prev, ...response.settings }));
      }
    } catch (error) {
      console.error("Erreur silencieuse:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const response = await cmsService.getMediaFiles();
      if (response.success) {
        setMediaFiles(response.data);
      }
    } catch (error) {
      console.error("Erreur silencieuse:", error);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await cmsService.updateSettings(settings);
      if (response.success) {
        toast({
          title: "✅ Paramètres sauvegardés",
          description: "Les modifications ont été enregistrées"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: handleApiError(error),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await projectService.uploadImage(file);
      if (response.success) {
        handleChange(field, response.imageUrl);
        toast({
          title: "✅ Image uploadée",
          description: "L'image a été uploadée avec succès"
        });
        loadMedia();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: handleApiError(error),
        variant: "destructive"
      });
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Design & Images</h2>
          <p className="text-gray-600 mt-1">Le logo, la grande image de la page d'accueil et vos coordonnées affichées sur le site.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Logo et image d'accueil
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Coordonnées
          </TabsTrigger>
        </TabsList>

        {/* Onglet Logo & Images */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Logo actuel</Label>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg flex items-center justify-center h-32">
                    {settings.logo_url ? (
                      <img 
                        src={settings.logo_url} 
                        alt="Logo" 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => e.target.src = '/placeholder-logo.png'}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Aucun logo</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="logo">Changer le logo</Label>
                  <div className="mt-2 space-y-2">
                    <Input
                      id="logo"
                      value={settings.logo_url || ''}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
                      placeholder="URL du logo"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload').click()}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Uploader un logo
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'logo_url')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image de fond (Hero)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Image actuelle</Label>
                  <div className="mt-2 rounded-lg overflow-hidden h-48">
                    {settings.hero_image ? (
                      <img 
                        src={settings.hero_image} 
                        alt="Hero" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-400">Aucune image</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="hero">Changer l'image de fond</Label>
                  <div className="mt-2 space-y-2">
                    <Input
                      id="hero"
                      value={settings.hero_image || ''}
                      onChange={(e) => handleChange('hero_image', e.target.value)}
                      placeholder="URL de l'image"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('hero-upload').click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Uploader une image
                    </Button>
                    <input
                      id="hero-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'hero_image')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Galerie des médias uploadés */}
          {mediaFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Médias uploadés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {mediaFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="relative group cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(file.filePath);
                        toast({
                          title: "✅ URL copiée",
                          description: "L'URL a été copiée dans le presse-papier"
                        });
                      }}
                    >
                      <img
                        src={file.filePath}
                        alt={file.originalName}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">Copier URL</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Contact & SEO */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Téléphone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="418-555-0123"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="contact_address">Adresse</Label>
                <Input
                  id="contact_address"
                  value={settings.contact_address}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  placeholder="Saguenay, QC, Canada"
                />
              </div>
              
              <div>
                <Label htmlFor="business_hours">Heures d'ouverture</Label>
                <Input
                  id="business_hours"
                  value={settings.business_hours}
                  onChange={(e) => handleChange('business_hours', e.target.value)}
                  placeholder="Lundi-Vendredi 8h-18h"
                />
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMSSettings;
