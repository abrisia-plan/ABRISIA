import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Loader2, ShoppingCart } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import KitCard from './KitCard';
import KitFormModal from './KitFormModal';

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
  
  const mainImageRef = useRef(null);
  const galleryImageRef = useRef(null);
  const planFileRef = useRef(null);
  const materialsFileRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', dimensions: '', surface_sqft: '',
    width_ft: '', depth_ft: '', floors: '1', rooms: '',
    includes: [''], price: '', main_image: '', gallery_images: [],
    designer_name: '', plan_file_url: '',
    materials_list_enabled: false, materials_list_price: '', materials_list_file_url: '',
    model_number: '', style: '', foundation_type: '', has_garage: null,
    bedrooms: '', bathrooms: '', tags_input: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadKits();
    // eslint-disable-next-line
  }, []);

  const loadKits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products?per_page=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setKits(data.data);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les modèles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const sqftToSqm = (sqft) => {
    if (!sqft) return '';
    const num = parseFloat(sqft);
    if (isNaN(num)) return '';
    return (num * 0.092903).toFixed(1);
  };

  const defaultFormData = {
    name: '', description: '', dimensions: '', surface_sqft: '',
    width_ft: '', depth_ft: '', floors: '1', rooms: '',
    includes: [''], price: '', main_image: '', gallery_images: [],
    designer_name: '', plan_file_url: '',
    materials_list_enabled: false, materials_list_price: '200', materials_list_file_url: '',
    model_number: '', style: '', foundation_type: '', has_garage: null,
    bedrooms: '', bathrooms: '', tags_input: '',
  };

  const openAddModal = () => {
    setEditingKit(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const openEditModal = async (kit) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/products/${kit.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
        width_ft: kitData.widthFt?.toString() || '',
        depth_ft: kitData.depthFt?.toString() || '',
        floors: kitData.floors?.toString() || '1',
        materials_list_enabled: kitData.materialsListEnabled || false,
        materials_list_price: kitData.materialsListPrice?.toString() || '200',
        materials_list_file_url: kitData.materialsListFileUrl || '',
        model_number: kitData.modelNumber || '',
        style: kitData.style || '',
        foundation_type: kitData.foundationType || '',
        has_garage: kitData.hasGarage ?? null,
        bedrooms: kitData.bedrooms?.toString() || '',
        bathrooms: kitData.bathrooms?.toString() || '',
        tags_input: (kitData.tags || []).join(', '),
      });
      setIsModalOpen(true);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les détails du modèle", variant: "destructive" });
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
    if (!file) return;
    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        let finalImageUrl = data.imageUrl;
        if (finalImageUrl.startsWith('/uploads/') || finalImageUrl.includes('localhost')) {
          const filename = finalImageUrl.split('/uploads/').pop();
          finalImageUrl = `/uploads/${filename}`;
        }
        
        if (isGallery) {
          setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, finalImageUrl] }));
        } else {
          handleInputChange('main_image', finalImageUrl);
        }
        toast({ title: "Image uploadée", description: "L'image a été uploadée avec succès" });
      } else {
        throw new Error(data.detail || 'Erreur upload');
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'uploader l'image: " + error.message, variant: "destructive" });
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        let finalUrl = data.imageUrl;
        if (finalUrl.startsWith('/uploads/') || finalUrl.includes('localhost')) {
          const filename = finalUrl.split('/uploads/').pop();
          finalUrl = `/uploads/${filename}`;
        }
        handleInputChange(fieldName, finalUrl);
        toast({ title: "Fichier uploadé", description: `Le fichier ${fileType === 'plan' ? 'du plan' : 'de la liste matériaux'} a été uploadé` });
      } else {
        throw new Error(data.detail || 'Erreur upload');
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'uploader le fichier: " + error.message, variant: "destructive" });
    } finally {
      setUploadState(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.main_image) {
      toast({ title: "Erreur", description: "Veuillez remplir le nom, le prix et l'image principale", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const surfaceDisplay = formData.surface_sqft ? `${formData.surface_sqft} pi²` : '';
      
      const kitData = {
        name: formData.name, description: formData.description,
        category: 'Collection', price: parseFloat(formData.price),
        main_image: formData.main_image,
        gallery_images: formData.gallery_images.filter(g => g),
        surface_area: surfaceDisplay, dimensions: formData.dimensions,
        rooms: formData.rooms,
        includes: formData.includes.filter(i => i.trim() !== ''),
        file_formats: ['PDF'], slug: generateSlug(formData.name),
        is_active: true, is_featured: false, difficulty_level: 'intermediate',
        designer_name: formData.designer_name || null,
        plan_file_url: formData.plan_file_url || null,
        materials_list_enabled: formData.materials_list_enabled,
        materials_list_price: formData.materials_list_enabled && formData.materials_list_price 
          ? parseFloat(formData.materials_list_price) : null,
        materials_list_file_url: formData.materials_list_enabled 
          ? formData.materials_list_file_url || null : null,
        model_number: formData.model_number || null,
        style: formData.style || null,
        foundation_type: formData.foundation_type || null,
        has_garage: formData.has_garage,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        floors: formData.floors ? parseInt(formData.floors) : null,
        width_ft: formData.width_ft ? parseFloat(formData.width_ft) : null,
        depth_ft: formData.depth_ft ? parseFloat(formData.depth_ft) : null,
        tags: formData.tags_input ? formData.tags_input.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      const url = editingKit 
        ? `${BACKEND_URL}/api/admin/products/${editingKit.id}`
        : `${BACKEND_URL}/api/admin/products`;
      const method = editingKit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(kitData)
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: editingKit ? "Modèle mis à jour" : "Modèle créé",
          description: editingKit ? "Les modifications ont été enregistrées" : "Le nouveau modèle a été ajouté"
        });
        setIsModalOpen(false);
        loadKits();
      } else {
        throw new Error(data.detail || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (kit) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${kit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: !kit.isActive })
      });
      if (response.ok) {
        toast({ title: "Statut modifie", description: `Le modèle est maintenant ${!kit.isActive ? 'visible' : 'masque'}` });
        loadKits();
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    }
  };

  const toggleFeatured = async (kit) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${kit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_featured: !kit.isFeatured })
      });
      if (response.ok) {
        toast({ title: `Modèle ${!kit.isFeatured ? 'ajoute a' : 'retire de'} l'accueil` });
        loadKits();
      }
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const deleteKit = async (kit) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${kit.name}" ?`)) return;
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${kit.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Modèle supprimé", description: "Le modèle a été supprimé avec succès" });
        loadKits();
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le kit", variant: "destructive" });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foret" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="kits-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collection ABRISIA</h2>
          <p className="text-gray-600 mt-1">Gérez vos modèles de plans pré-dessinés</p>
        </div>
        <Button onClick={openAddModal} className="bg-teal-700 hover:bg-teal-800" data-testid="add-kit-btn">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un modèle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <KitCard
            key={kit.id}
            kit={kit}
            onToggleActive={toggleActive}
            onToggleFeatured={toggleFeatured}
            onEdit={openEditModal}
            onDelete={deleteKit}
            formatPrice={formatPrice}
          />
        ))}
      </div>

      {kits.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun modèle pour le moment</p>
          <Button onClick={openAddModal} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter votre premier modèle
          </Button>
        </div>
      )}

      <KitFormModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        editingKit={editingKit}
        formData={formData}
        onInputChange={handleInputChange}
        onIncludeChange={handleIncludeChange}
        onAddInclude={addInclude}
        onRemoveInclude={removeInclude}
        onImageUpload={handleImageUpload}
        onFileUpload={handleFileUpload}
        onRemoveGalleryImage={removeGalleryImage}
        onSubmit={handleSubmit}
        saving={saving}
        uploading={uploading}
        uploadingPlan={uploadingPlan}
        uploadingMaterials={uploadingMaterials}
        sqftToSqm={sqftToSqm}
        mainImageRef={mainImageRef}
        galleryImageRef={galleryImageRef}
        planFileRef={planFileRef}
        materialsFileRef={materialsFileRef}
      />
    </div>
  );
};

export default KitsManager;
