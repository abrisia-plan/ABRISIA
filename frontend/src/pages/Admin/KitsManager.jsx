import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  Save,
  X,
  Upload,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { projectService, handleApiError } from '../../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const KitsManager = () => {
  const { toast } = useToast();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Refs pour les inputs file
  const mainImageRef = useRef(null);
  const galleryImageRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dimensions: '',
    surface_sqft: '',
    rooms: '',
    includes: [''],
    price: '',
    main_image: '',
    gallery_images: []
  });

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
      rooms: '',
      includes: [''],
      price: '',
      main_image: '',
      gallery_images: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (kit) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${kit.id}`);
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
        gallery_images: kitData.galleryImages || []
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
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Uploading file:', file.name);
    setUploading(true);

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
      console.log('Upload response:', data);
      
      if (data.success && data.imageUrl) {
        if (isGallery) {
          setFormData(prev => ({
            ...prev,
            gallery_images: [...prev.gallery_images, data.imageUrl]
          }));
        } else {
          handleInputChange('main_image', data.imageUrl);
        }
        toast({
          title: "✅ Image uploadée",
          description: "L'image a été uploadée avec succès"
        });
      } else {
        throw new Error(data.detail || 'Erreur upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
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
      
      // Construire surface_area avec conversion
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
        difficulty_level: 'intermediate'
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
          title: "✅ Statut modifié",
          description: `Le kit est maintenant ${!kit.isActive ? 'actif' : 'inactif'}`
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
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
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
        <Button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un kit
        </Button>
      </div>

      {/* Liste des kits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <Card key={kit.id} className={`overflow-hidden ${!kit.isActive ? 'opacity-60' : ''}`}>
            <div className="relative h-48 bg-gray-100">
              {kit.mainImage || kit.main_image ? (
                <img
                  src={kit.mainImage || kit.main_image}
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
                    Inactif
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{kit.name}</h3>
              <p className="text-2xl font-bold text-teal-700 mb-2">{formatPrice(kit.price)}</p>
              
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
                  title={kit.isActive ? 'Désactiver' : 'Activer'}
                >
                  {kit.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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

      {/* Modal Ajouter/Modifier - SIMPLIFIÉ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingKit ? 'Modifier le kit' : 'Ajouter un kit'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Nom du kit */}
            <div>
              <Label htmlFor="name" className="text-base font-semibold">Nom du kit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Mini-maison 400 pi²"
                className="mt-1"
              />
            </div>

            {/* Description courte */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold">Description courte</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brève description du kit..."
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Dimensions et Surface */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dimensions" className="text-base font-semibold">Dimensions (pieds)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="Ex: 20' x 20'"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="surface" className="text-base font-semibold">Surface (pi²)</Label>
                <Input
                  id="surface"
                  type="number"
                  value={formData.surface_sqft}
                  onChange={(e) => handleInputChange('surface_sqft', e.target.value)}
                  placeholder="Ex: 400"
                  className="mt-1"
                />
                {formData.surface_sqft && (
                  <p className="text-sm text-gray-400 mt-1">
                    ≈ {sqftToSqm(formData.surface_sqft)} m²
                  </p>
                )}
              </div>
            </div>

            {/* Pièces */}
            <div>
              <Label htmlFor="rooms" className="text-base font-semibold">Pièces</Label>
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
              <Label className="text-base font-semibold">Ce que le kit comprend</Label>
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

            {/* Prix de base */}
            <div>
              <Label htmlFor="price" className="text-base font-semibold">Prix de base (CAD) *</Label>
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

            {/* Image principale */}
            <div>
              <Label className="text-base font-semibold">Image principale *</Label>
              <div className="mt-2">
                {formData.main_image ? (
                  <div className="relative">
                    <img
                      src={formData.main_image}
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
                        <p className="text-teal-600">Upload en cours...</p>
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
              <Label className="text-base font-semibold">Images supplémentaires (optionnel)</Label>
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

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
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
