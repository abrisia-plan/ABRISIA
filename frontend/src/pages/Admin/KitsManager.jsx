import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
  Image as ImageIcon,
  Save,
  X,
  Upload,
  Loader2,
  Star,
  ShoppingCart,
  DollarSign
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',
    category: '',
    price: '',
    original_price: '',
    main_image: '',
    gallery_images: [],
    surface_area: '',
    dimensions: '',
    rooms: '',
    includes: [''],
    file_formats: ['PDF'],
    slug: '',
    is_active: true,
    is_featured: false,
    difficulty_level: 'intermediate'
  });

  const categories = [
    'Mini-maison',
    'Chalet',
    'Maison unifamiliale',
    'Extension',
    'Garage/Abri',
    'Ébénisterie'
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' }
  ];

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

  const openAddModal = () => {
    setEditingKit(null);
    setFormData({
      name: '',
      description: '',
      long_description: '',
      category: categories[0],
      price: '',
      original_price: '',
      main_image: '',
      gallery_images: [],
      surface_area: '',
      dimensions: '',
      rooms: '',
      includes: [''],
      file_formats: ['PDF'],
      slug: '',
      is_active: true,
      is_featured: false,
      difficulty_level: 'intermediate'
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (kit) => {
    try {
      // Récupérer les détails complets du kit
      const response = await fetch(`${BACKEND_URL}/api/products/${kit.id}`);
      const data = await response.json();
      
      const kitData = data.product || kit;
      
      setEditingKit(kit);
      setFormData({
        name: kitData.name || '',
        description: kitData.description || '',
        long_description: kitData.longDescription || '',
        category: kitData.category || categories[0],
        price: kitData.price?.toString() || '',
        original_price: kitData.originalPrice?.toString() || '',
        main_image: kitData.mainImage || '',
        gallery_images: kitData.galleryImages || [],
        surface_area: kitData.surfaceArea || '',
        dimensions: kitData.dimensions || '',
        rooms: kitData.rooms || '',
        includes: kitData.includes?.length ? kitData.includes : [''],
        file_formats: kitData.fileFormats || ['PDF'],
        slug: kitData.slug || '',
        is_active: kitData.isActive !== false,
        is_featured: kitData.isFeatured || false,
        difficulty_level: kitData.difficultyLevel || 'intermediate'
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Auto-générer le slug si on modifie le nom
      if (field === 'name' && !editingKit) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await projectService.uploadImage(file);
      if (response.success) {
        handleInputChange('main_image', response.imageUrl);
        toast({
          title: "✅ Image uploadée",
          description: "L'image a été uploadée avec succès"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: handleApiError(error),
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price || !formData.main_image) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (nom, catégorie, prix, image)",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const kitData = {
        name: formData.name,
        description: formData.description,
        long_description: formData.long_description,
        category: formData.category,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        main_image: formData.main_image,
        gallery_images: formData.gallery_images.filter(g => g),
        surface_area: formData.surface_area,
        dimensions: formData.dimensions,
        rooms: formData.rooms,
        includes: formData.includes.filter(i => i.trim() !== ''),
        file_formats: formData.file_formats,
        slug: formData.slug || generateSlug(formData.name),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        difficulty_level: formData.difficulty_level
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
              <div className="absolute top-2 left-2">
                <Badge className="bg-teal-600">{kit.category}</Badge>
              </div>
              {kit.isFeatured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-500">
                    <Star className="w-3 h-3 mr-1" />
                    Vedette
                  </Badge>
                </div>
              )}
              {!kit.isActive && (
                <div className="absolute bottom-2 right-2">
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

      {/* Modal Ajouter/Modifier */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingKit ? 'Modifier le kit' : 'Ajouter un kit'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nom du kit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Mini-maison 25m²"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">Niveau de difficulté</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty_level}
                  onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  {difficultyLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (CAD) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="800"
                />
              </div>
              <div>
                <Label htmlFor="original_price">Prix original (barré)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="main_image">Image principale *</Label>
              <div className="flex gap-2">
                <Input
                  id="main_image"
                  value={formData.main_image}
                  onChange={(e) => handleInputChange('main_image', e.target.value)}
                  placeholder="URL de l'image"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('kit-image-upload').click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  id="kit-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {formData.main_image && (
                <img
                  src={formData.main_image}
                  alt="Aperçu"
                  className="mt-2 h-32 w-full object-cover rounded-lg"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>

            <div>
              <Label htmlFor="description">Description courte</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description brève du kit"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="surface_area">Surface</Label>
                <Input
                  id="surface_area"
                  value={formData.surface_area}
                  onChange={(e) => handleInputChange('surface_area', e.target.value)}
                  placeholder="25m²"
                />
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="6m x 4m"
                />
              </div>
              <div>
                <Label htmlFor="rooms">Pièces</Label>
                <Input
                  id="rooms"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange('rooms', e.target.value)}
                  placeholder="2 ch, 1 sdb"
                />
              </div>
            </div>

            <div>
              <Label>Ce kit comprend</Label>
              {formData.includes.map((item, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={item}
                    onChange={(e) => handleIncludeChange(index, e.target.value)}
                    placeholder={`Élément inclus ${index + 1}`}
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
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un élément
              </Button>
            </div>

            <div>
              <Label htmlFor="slug">Slug URL</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="mini-maison-25m2"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="active">Actif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                  <Label htmlFor="featured">En vedette</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Enregistrer</>
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
