import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  DollarSign, 
  Type,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { cmsService, handleApiError } from '../../services/api';

const CMS = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // États pour les différentes sections
  const [siteSettings, setSiteSettings] = useState({
    site_name: '',
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
  
  const [services, setServices] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSiteSettings(),
        loadServices(),
        loadMediaFiles()
      ]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await cmsService.getSettings();
      if (response.success && response.settings) {
        setSiteSettings(response.settings);
      }
    } catch (error) {
      // Handled silently - settings will use defaults
    }
  };

  const loadServices = async () => {
    try {
      const response = await cmsService.getServices();
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      // Handled silently
    }
  };

  const loadMediaFiles = async () => {
    try {
      const response = await cmsService.getMediaFiles();
      if (response.success) {
        setMediaFiles(response.data);
      }
    } catch (error) {
      // Handled silently
    }
  };

  const handleSettingsChange = (field, value) => {
    setSiteSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await cmsService.updateSettings(siteSettings);
      if (response.success) {
        toast({
          title: "✅ Succès",
          description: "Paramètres sauvegardés avec succès"
        });
      }
    } catch (error) {
      handleApiError(error, toast);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event, category = 'general') => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Seules les images sont autorisées",
        variant: "destructive"
      });
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur", 
        description: "Fichier trop volumineux (10MB max)",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('alt_text', file.name);

      const response = await cmsService.uploadMedia(formData);
      
      if (response.success) {
        toast({
          title: "✅ Upload réussi",
          description: `Fichier ${file.name} uploadé avec succès`
        });
        
        // Recharger la liste des médias
        await loadMediaFiles();
        
        // Si c'est un logo, mettre à jour automatiquement
        if (category === 'logo') {
          handleSettingsChange('logo_url', response.fileUrl);
        }
      }
    } catch (error) {
      handleApiError(error, toast);
    }
  };

  const updateService = async (serviceId, updates) => {
    try {
      const response = await cmsService.updateService(serviceId, updates);
      if (response.success) {
        toast({
          title: "✅ Service mis à jour",
          description: "Les modifications ont été sauvegardées"
        });
        await loadServices();
      }
    } catch (error) {
      handleApiError(error, toast);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du contenu</h1>
          <p className="text-gray-600 mt-1">Modifiez les textes, images et prix de votre site</p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">  
            <ImageIcon className="w-4 h-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Services & Prix
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Textes
          </TabsTrigger>
        </TabsList>

        {/* Onglet Paramètres généraux */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="site_name">Nom du site</Label>
                    <Input
                      id="site_name"
                      value={siteSettings.site_name}
                      onChange={(e) => handleSettingsChange('site_name', e.target.value)}
                      placeholder="Abrisia Plan"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slogan">Slogan</Label>
                    <Input
                      id="slogan"
                      value={siteSettings.slogan}
                      onChange={(e) => handleSettingsChange('slogan', e.target.value)}
                      placeholder="Des espaces sur mesure, une vie à votre rythme"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contact_email">Email de contact</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={siteSettings.contact_email}
                      onChange={(e) => handleSettingsChange('contact_email', e.target.value)}
                      placeholder="abrisia0plan@gmail.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Téléphone</Label>
                    <Input
                      id="contact_phone"
                      value={siteSettings.contact_phone}
                      onChange={(e) => handleSettingsChange('contact_phone', e.target.value)}
                      placeholder="418-555-0123"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact_address">Adresse</Label>
                    <Input
                      id="contact_address"
                      value={siteSettings.contact_address}
                      onChange={(e) => handleSettingsChange('contact_address', e.target.value)}
                      placeholder="Saguenay, QC, Canada"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_hours">Heures d'ouverture</Label>
                    <Input
                      id="business_hours"
                      value={siteSettings.business_hours}
                      onChange={(e) => handleSettingsChange('business_hours', e.target.value)}
                      placeholder="Lundi-Vendredi 8h-18h"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hero_image">Image de héros (URL)</Label>
                    <Input
                      id="hero_image"
                      value={siteSettings.hero_image}
                      onChange={(e) => handleSettingsChange('hero_image', e.target.value)}
                      placeholder="URL de l'image de fond"
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo_url">Logo (URL)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo_url"
                        value={siteSettings.logo_url || ''}
                        onChange={(e) => handleSettingsChange('logo_url', e.target.value)}
                        placeholder="URL du logo"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('logo-upload').click()}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Couleurs */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Couleurs du thème</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="primary_color">Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={siteSettings.primary_color}
                        onChange={(e) => handleSettingsChange('primary_color', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.primary_color}
                        onChange={(e) => handleSettingsChange('primary_color', e.target.value)}
                        placeholder="#0f766e"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondary_color">Couleur secondaire</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={siteSettings.secondary_color}
                        onChange={(e) => handleSettingsChange('secondary_color', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.secondary_color}
                        onChange={(e) => handleSettingsChange('secondary_color', e.target.value)}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="accent_color">Couleur d'accent</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={siteSettings.accent_color}
                        onChange={(e) => handleSettingsChange('accent_color', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.accent_color}
                        onChange={(e) => handleSettingsChange('accent_color', e.target.value)}
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="background_color">Couleur de fond</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        value={siteSettings.background_color}
                        onChange={(e) => handleSettingsChange('background_color', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.background_color}
                        onChange={(e) => handleSettingsChange('background_color', e.target.value)}
                        placeholder="#fefbf4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Référencement (SEO)</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Titre de la page (SEO)</Label>
                    <Input
                      id="meta_title"
                      value={siteSettings.meta_title}
                      onChange={(e) => handleSettingsChange('meta_title', e.target.value)}
                      placeholder="Abrisia Plan - Plans sur mesure Saguenay QC"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta_description">Description (SEO)</Label>
                    <Textarea
                      id="meta_description"
                      value={siteSettings.meta_description}
                      onChange={(e) => handleSettingsChange('meta_description', e.target.value)}
                      placeholder="Spécialiste en plans architecturaux sur mesure au Saguenay..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta_keywords">Mots-clés (SEO)</Label>
                    <Input
                      id="meta_keywords"
                      value={siteSettings.meta_keywords}
                      onChange={(e) => handleSettingsChange('meta_keywords', e.target.value)}
                      placeholder="plans maison, architecte saguenay, mini-maison, chalet"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Images */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Gestion des images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload zone */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Glissez vos images ici ou cliquez pour sélectionner</p>
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir des images
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'gallery')}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formats acceptés: JPG, PNG, WebP (10MB max)
                  </p>
                </div>

                {/* Galerie d'images */}
                {mediaFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Images uploadées</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {mediaFiles.map((file) => (
                        <div key={file.id} className="relative group">
                          <img
                            src={file.filePath}
                            alt={file.altText || file.originalName}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-white hover:bg-white hover:text-black"
                              onClick={() => {
                                navigator.clipboard.writeText(file.filePath);
                                toast({
                                  title: "✅ Copié",
                                  description: "URL copiée dans le presse-papier"
                                });
                              }}
                            >
                              Copier URL
                            </Button>
                          </div>
                          <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                            {file.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Services & Prix */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Services et tarifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <ServiceEditor 
                      key={service.id} 
                      service={service} 
                      onUpdate={updateService}
                      toast={toast}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun service configuré</p>
                  <Button className="mt-4">Ajouter un service</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Contenu textuel */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Textes du site
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Fonctionnalité en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Composant pour éditer un service
const ServiceEditor = ({ service, onUpdate, toast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedService, setEditedService] = useState(service);

  const handleSave = async () => {
    try {
      await onUpdate(service.id, editedService);
      setIsEditing(false);
    } catch (error) {
      // Handled silently
    }
  };

  const handleCancel = () => {
    setEditedService(service);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`name-${service.id}`}>Nom du service</Label>
              <Input
                id={`name-${service.id}`}
                value={editedService.name}
                onChange={(e) => setEditedService(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor={`price-${service.id}`}>Prix</Label>
              <Input
                id={`price-${service.id}`}
                type="number"
                step="0.01"
                value={editedService.price}
                onChange={(e) => setEditedService(prev => ({
                  ...prev,
                  price: parseFloat(e.target.value)
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor={`category-${service.id}`}>Catégorie</Label>
              <Input
                id={`category-${service.id}`}
                value={editedService.category}
                onChange={(e) => setEditedService(prev => ({
                  ...prev,
                  category: e.target.value
                }))}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor={`description-${service.id}`}>Description</Label>
            <Textarea
              id={`description-${service.id}`}
              value={editedService.description}
              onChange={(e) => setEditedService(prev => ({
                ...prev,
                description: e.target.value
              }))}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleCancel} size="sm">
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
              <Badge variant="secondary">{service.category}</Badge>
              <div className="text-lg font-bold text-teal-600">
                {service.price}$
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CMS;