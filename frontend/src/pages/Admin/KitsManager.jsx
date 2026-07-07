import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Home,
  Image as ImageIcon,
  Save,
  X,
  Upload,
  Loader2,
  ShoppingCart,
  FileText,
  Package,
  User,
  DollarSign
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { resolveImageUrl } from '../../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const KitsManager = () => {
  const { toast } = useToast();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingPlan, setUploadingPlan] = useState(false);
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  
  // Refs pour les inputs file
  const mainImageRef = useRef(null);
  const galleryImageRef = useRef(null);
  const planFileRef = useRef(null);
  const materialsFileRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dimensions: '',
    surface_sqft: '',
    width_ft: '',
    depth_ft: '',
    floors: '1',
    rooms: '',
    includes: [''],
    price: '',
    main_image: '',
    gallery_images: [],
    designer_name: '',
    plan_file_url: '',
    materials_list_enabled: false,
    materials_list_price: '',
    materials_list_file_url: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadKits();
  }, []);

  const loadKits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setKits(data.data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les kits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Conversion pi² → m²
  const sqftToSqm = (sqft) => {
    if (!sqft) return '';
    const num = parseFloat(sqft);
    if (isNaN(num)) return '';
    return (num * 0.092903).toFixed(1);
  };

  const openAddModal = () => {
    setEditingKit(null);
    setFormData({
      name: '',
      description: '',
      dimensions: '',
      surface_sqft: '',
      width_ft: '',
      depth_ft: '',
      floors: '1',
      rooms: '',
      includes: [''],
      price: '',
      main_image: '',
      gallery_images: [],
      designer_name: '',
      plan_file_url: '',
      materials_list_enabled: false,
      materials_list_price: '200',
      materials_list_file_url: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (kit) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/products/${kit.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      const kitData = data.product || kit;
      
      setEditingKit(kit);
      setFormData({
        name: kitData.name || '',
        description: kitData.description || '',
        dimensions: kitData.dimensions || '',
        surface_sqft: kitData.surfaceArea?.replace(/[^\d.]/g, '') || '',
        rooms: kitData.rooms || '',
        includes: kitData.includes?.length ? kitData.includes : [''],
        price: kitData.price?.toString() || '',
        main_image: kitData.mainImage || '',
        gallery_images: kitData.galleryImages || [],
        designer_name: kitData.designerName || '',
        plan_file_url: kitData.planFileUrl || '',
        materials_list_enabled: kitData.materialsListEnabled || false,
        materials_list_price: kitData.materialsListPrice?.toString() || '200',
        materials_list_file_url: kitData.materialsListFileUrl || ''
      });
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du kit",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIncludeChange = (index, value) => {
    const newIncludes = [...formData.includes];
    newIncludes[index] = value;
    setFormData(prev => ({ ...prev, includes: newIncludes }));
  };

  const addInclude = () => {
    setFormData(prev => ({ ...prev, includes: [...prev.includes, ''] }));
  };

  const removeInclude = (index) => {
    const newIncludes = formData.includes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, includes: newIncludes.length ? newIncludes : [''] }));
  };

  const handleImageUpload = async (e, isGallery = false) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/api/admin/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });
        
        const data = await response.json();
        
        if (data.success && data.imageUrl) {
          const finalImageUrl = data.imageUrl;
          
          if (isGallery) {
            setFormData(prev => ({
              ...prev,
              gallery_images: [...prev.gallery_images, finalImageUrl]
            }));
          } else {
            handleInputChange('main_image', finalImageUrl);
          }
        } else {
          throw new Error(data.detail || 'Erreur upload');
        }
      }
      toast({
        title: "Image(s) uploadee(s)",
        description: `${selectedFiles.length} fichier(s) uploade(s) avec succes`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploadState = fileType === 'plan' ? setUploadingPlan : setUploadingMaterials;
    const fieldName = fileType === 'plan' ? 'plan_file_url' : 'materials_list_file_url';
    
    setUploadState(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });
      
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        handleInputChange(fieldName, data.imageUrl);
        toast({
          title: "Fichier uploade",
          description: `Le fichier ${fileType === 'plan' ? 'du plan' : 'de la liste materiaux'} a ete uploade`
        });
      } else {
        throw new Error(data.detail || 'Erreur upload');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploadState(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.main_image) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom, le prix et l'image principale",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const surfaceDisplay = formData.surface_sqft 
        ? `${formData.surface_sqft} pi²`
        : '';
      
      const kitData = {
        name: formData.name,
        description: formData.description,
        category: 'Kit',
        price: parseFloat(formData.price),
        main_image: formData.main_image,
        gallery_images: formData.gallery_images.filter(g => g),
        surface_area: surfaceDisplay,
        dimensions: formData.dimensions,
        rooms: formData.rooms,
        includes: formData.includes.filter(i => i.trim() !== ''),
        file_formats: ['PDF'],
        slug: generateSlug(formData.name),
        is_active: true,
        is_featured: false,
        difficulty_level: 'intermediate',
        // Nouveaux champs
        designer_name: formData.designer_name || null,
        plan_file_url: formData.plan_file_url || null,
        materials_list_enabled: formData.materials_list_enabled,
        materials_list_price: formData.materials_list_enabled && formData.materials_list_price 
          ? parseFloat(formData.materials_list_price) 
          : null,
        materials_list_file_url: formData.materials_list_enabled 
          ? formData.materials_list_file_url || null 
          : null
      };

      const url = editingKit 
        ? `${BACKEND_URL}/api/admin/products/${editingKit.id}`
        : `${BACKEND_URL}/api/admin/products`;
      
      const method = editingKit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(kitData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingKit ? "✅ Kit mis à jour" : "✅ Kit créé",
          description: editingKit ? "Les modifications ont été enregistrées" : "Le nouveau kit a été ajouté"
        });
        setIsModalOpen(false);
        loadKits();
      } else {
        throw new Error(data.detail || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (kit) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${kit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !kit.isActive })
      });

      if (response.ok) {
        toast({
          title: "Statut modifie",
          description: `Le kit est maintenant ${!kit.isActive ? 'visible' : 'masque'}`
        });
        loadKits();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const toggleFeatured = async (kit) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${kit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_featured: !kit.isFeatured })
      });

      if (response.ok) {
        toast({
          title: `Kit ${!kit.isFeatured ? 'ajoute a' : 'retire de'} l'accueil`,
        });
        loadKits();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        variant: "destructive"
      });
    }
  };

  const deleteKit = async (kit) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${kit.name}" ?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${kit.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "✅ Kit supprimé",
          description: "Le kit a été supprimé avec succès"
        });
        loadKits();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le kit",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foret" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kits de plans</h2>
          <p className="text-gray-600 mt-1">Gérez vos plans pré-dessinés à vendre</p>
        </div>
        <Button onClick={openAddModal} className="bg-teal-700 hover:bg-teal-800">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un kit
        </Button>
      </div>

      {/* Liste des kits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <Card key={kit.id} className={`overflow-hidden ${!kit.isActive ? 'opacity-60' : ''}`}>
            <div className="relative h-48 bg-gray-100">
              {kit.mainImage ? (
                <img
                  src={resolveImageUrl(kit.mainImage)}
                  alt={kit.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
              )}
              {!kit.isActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-gray-800 text-white">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Masqué
                  </Badge>
                </div>
              )}
              {kit.isFeatured && (
                <div className={`absolute top-2 ${!kit.isActive ? 'right-24' : 'right-2'}`}>
                  <Badge className="bg-blue-600 text-white">
                    <Home className="w-3 h-3 mr-1" />
                    Accueil
                  </Badge>
                </div>
              )}
              {kit.materialsListEnabled && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-beige0 text-white">
                    <Package className="w-3 h-3 mr-1" />
                    + Matériaux
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{kit.name}</h3>
              
              {kit.designerName && (
                <p className="text-sm text-gray-500 mb-2 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {kit.designerName}
                </p>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <p className="text-2xl font-bold text-teal-700">{formatPrice(kit.price)}</p>
                {kit.materialsListEnabled && kit.materialsListPrice && (
                  <Badge variant="outline" className="text-bois border-bois-light">
                    +{formatPrice(kit.materialsListPrice)} matériaux
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {kit.salesCount || 0} ventes
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {kit.viewsCount || 0} vues
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(kit)}
                  title={kit.isActive ? 'Masquer' : 'Afficher'}
                >
                  {kit.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleFeatured(kit)}
                  title={kit.isFeatured ? "Retirer de l'accueil" : "Mettre sur l'accueil"}
                  className={kit.isFeatured ? 'border-blue-300 text-blue-700 bg-blue-50' : ''}
                >
                  <Home className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(kit)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => deleteKit(kit)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {kits.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun kit pour le moment</p>
          <Button onClick={openAddModal} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter votre premier kit
          </Button>
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingKit ? 'Modifier le kit' : 'Ajouter un kit'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Section: Informations de base */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Informations de base
              </h3>
              
              {/* Nom du kit */}
              <div>
                <Label htmlFor="name" className="font-semibold">Nom du kit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Mini-maison 400 pi²"
                  className="mt-1"
                />
              </div>

              {/* Dessinatrice */}
              <div>
                <Label htmlFor="designer" className="font-semibold flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Nom de la dessinatrice
                </Label>
                <Input
                  id="designer"
                  value={formData.designer_name}
                  onChange={(e) => handleInputChange('designer_name', e.target.value)}
                  placeholder="Ex: Marie Tremblay"
                  className="mt-1"
                />
              </div>

              {/* Description courte */}
              <div>
                <Label htmlFor="description" className="font-semibold">Description courte</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brève description du kit..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Section: Détails techniques */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900">Détails techniques</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width_ft" className="font-semibold">Largeur (pieds)</Label>
                  <Input
                    id="width_ft"
                    type="number"
                    value={formData.width_ft || ''}
                    onChange={(e) => {
                      handleInputChange('width_ft', e.target.value);
                      const w = parseFloat(e.target.value) || 0;
                      const d = parseFloat(formData.depth_ft) || 0;
                      const f = parseInt(formData.floors) || 1;
                      if (w && d) handleInputChange('surface_sqft', String(Math.round(w * d * f)));
                    }}
                    placeholder="20"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="depth_ft" className="font-semibold">Profondeur (pieds)</Label>
                  <Input
                    id="depth_ft"
                    type="number"
                    value={formData.depth_ft || ''}
                    onChange={(e) => {
                      handleInputChange('depth_ft', e.target.value);
                      const w = parseFloat(formData.width_ft) || 0;
                      const d = parseFloat(e.target.value) || 0;
                      const f = parseInt(formData.floors) || 1;
                      if (w && d) handleInputChange('surface_sqft', String(Math.round(w * d * f)));
                    }}
                    placeholder="20"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="floors" className="font-semibold">Nombre d'étages</Label>
                  <select
                    id="floors"
                    value={formData.floors || '1'}
                    onChange={(e) => {
                      handleInputChange('floors', e.target.value);
                      const w = parseFloat(formData.width_ft) || 0;
                      const d = parseFloat(formData.depth_ft) || 0;
                      const f = parseInt(e.target.value) || 1;
                      if (w && d) handleInputChange('surface_sqft', String(Math.round(w * d * f)));
                    }}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="1">1 étage</option>
                    <option value="2">2 étages</option>
                    <option value="3">3 étages</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dimensions" className="font-semibold">Dimensions (résumé)</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="Ex: 20' x 20'"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="surface" className="font-semibold">Surface totale (pi²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    value={formData.surface_sqft}
                    onChange={(e) => handleInputChange('surface_sqft', e.target.value)}
                    placeholder="Calculé automatiquement"
                    className="mt-1"
                  />
                  {formData.surface_sqft && (
                    <p className="text-sm text-gray-400 mt-1">
                      ≈ {sqftToSqm(formData.surface_sqft)} m²
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="rooms" className="font-semibold">Pièces</Label>
                <Input
                  id="rooms"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange('rooms', e.target.value)}
                  placeholder="Ex: 2 chambres, 1 salle de bain, cuisine ouverte"
                  className="mt-1"
                />
              </div>

              {/* Ce que le kit comprend */}
              <div>
                <Label className="font-semibold">Ce que le kit comprend</Label>
                <div className="space-y-2 mt-2">
                  {formData.includes.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleIncludeChange(index, e.target.value)}
                        placeholder={`Élément ${index + 1} (ex: Plans architecturaux complets)`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeInclude(index)}
                        disabled={formData.includes.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInclude}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un élément
                  </Button>
                </div>
              </div>
            </div>

            {/* Section: Prix */}
            <div className="bg-beige p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Prix
              </h3>
              
              <div>
                <Label htmlFor="price" className="font-semibold">Prix du plan (CAD) *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="800"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Option liste matériaux */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="font-semibold flex items-center">
                      <Package className="w-4 h-4 mr-2 text-bois" />
                      Option "Liste des matériaux"
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Permet au client d'ajouter la liste complète des matériaux à sa commande
                    </p>
                  </div>
                  <Switch
                    checked={formData.materials_list_enabled}
                    onCheckedChange={(checked) => handleInputChange('materials_list_enabled', checked)}
                  />
                </div>

                {formData.materials_list_enabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-bois-light">
                    <div>
                      <Label htmlFor="materials_price" className="font-semibold">Prix supplémentaire (CAD)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+$</span>
                        <Input
                          id="materials_price"
                          type="number"
                          value={formData.materials_list_price}
                          onChange={(e) => handleInputChange('materials_list_price', e.target.value)}
                          placeholder="200"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold">Fichier PDF liste matériaux</Label>
                      <div className="mt-2">
                        {formData.materials_list_file_url ? (
                          <div className="flex items-center gap-2 p-3 bg-white rounded border">
                            <FileText className="w-5 h-5 text-bois" />
                            <span className="text-sm flex-1 truncate">{formData.materials_list_file_url.split('/').pop()}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInputChange('materials_list_file_url', '')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-bois-light rounded-lg p-4 text-center cursor-pointer hover:border-bois transition-colors block bg-white">
                            {uploadingMaterials ? (
                              <>
                                <Loader2 className="w-8 h-8 text-bois mx-auto mb-2 animate-spin" />
                                <p className="text-bois">Upload en cours...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-bois-light mx-auto mb-2" />
                                <p className="text-gray-500">Uploader le PDF de la liste matériaux</p>
                              </>
                            )}
                            <input
                              ref={materialsFileRef}
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'materials')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Fichiers */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Fichier du plan (PDF/AutoCAD)
              </h3>
              
              {formData.plan_file_url ? (
                <div className="flex items-center gap-2 p-3 bg-white rounded border">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm flex-1 truncate">{formData.plan_file_url.split('/').pop()}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInputChange('plan_file_url', '')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors block bg-white">
                  {uploadingPlan ? (
                    <>
                      <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                      <p className="text-blue-600">Upload en cours...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-500">Uploader le fichier du plan (PDF, DWG)</p>
                      <p className="text-xs text-gray-400 mt-1">Ce fichier sera envoyé au client après paiement</p>
                    </>
                  )}
                  <input
                    ref={planFileRef}
                    type="file"
                    accept=".pdf,.dwg,.dxf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'plan')}
                  />
                </label>
              )}
            </div>

            {/* Section: Images */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Images
              </h3>

              {/* Image principale */}
              <div>
                <Label className="font-semibold">Image principale *</Label>
                <div className="mt-2">
                  {formData.main_image ? (
                    <div className="relative">
                      <img
                        src={resolveImageUrl(formData.main_image)}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleInputChange('main_image', '')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label 
                      htmlFor="main-image-upload-input"
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors block"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-10 h-10 text-teal-500 mx-auto mb-2 animate-spin" />
                          <p className="text-foret">Upload en cours...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Cliquez pour uploader une image</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max 5MB)</p>
                        </>
                      )}
                    </label>
                  )}
                  <input
                    id="main-image-upload-input"
                    ref={mainImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, false)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={formData.main_image}
                      onChange={(e) => handleInputChange('main_image', e.target.value)}
                      placeholder="Ou collez une URL d'image..."
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Images supplémentaires */}
              <div>
                <Label className="font-semibold">Images supplémentaires (optionnel)</Label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {formData.gallery_images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Galerie ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <label 
                    htmlFor="gallery-upload-input"
                    className="border-2 border-dashed border-gray-300 rounded-lg h-20 flex items-center justify-center cursor-pointer hover:border-teal-500"
                  >
                    <Plus className="w-6 h-6 text-gray-400" />
                  </label>
                </div>
                <input
                  id="gallery-upload-input"
                  ref={galleryImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, true)}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-foret hover:bg-bois"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Enregistrer le kit</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KitsManager;
