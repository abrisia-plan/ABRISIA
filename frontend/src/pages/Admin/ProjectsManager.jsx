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
  Plus, Edit, Trash2, Eye, EyeOff, Home,
  Image as ImageIcon, Save, X, Upload, Loader2
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { projectService, handleApiError } from '../../services/api';

const ProjectsManager = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [formData, setFormData] = useState({
    title: '', category: '', image: '', gallery_images: [], description: '',
    details: [''], dimensions: '', is_visible: true, show_on_home: false
  });
  const [uploading, setUploading] = useState(false);

  const categories = [
    'Maison unifamiliale', 'Chalet', 'Mini-maison',
    'Extensions verrières solarium', 'Autres dessins (ébénisterie)',
    'Dessins techniques', 'Dessins architecturaux'
  ];

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll(true);
      if (response.success) setProjects(response.data);
    } catch (error) {
      toast({ title: "Erreur", description: handleApiError(error), variant: "destructive" });
    } finally { setLoading(false); }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '', category: categories[0], image: '', gallery_images: [], description: '',
      details: [''], dimensions: '', is_visible: true, show_on_home: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title, category: project.category,
      image: project.image, gallery_images: project.galleryImages || [],
      description: project.description,
      details: project.details || [''], dimensions: project.dimensions,
      is_visible: project.isVisible !== false,
      show_on_home: project.showOnHome || false
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailChange = (index, value) => {
    const newDetails = [...formData.details];
    newDetails[index] = value;
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const addDetail = () => {
    setFormData(prev => ({ ...prev, details: [...prev.details, ''] }));
  };

  const removeDetail = (index) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, details: newDetails.length ? newDetails : [''] }));
  };

  // Plusieurs photos peuvent être choisies d'un coup.
  // La première devient la photo principale si elle est vide, les autres vont dans la galerie.
  const handleImageUpload = async (e, toGallery = false) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const response = await projectService.uploadImage(file);
        if (response.success) urls.push(response.imageUrl);
      } catch (error) {
        toast({ title: `Erreur : ${file.name}`, description: handleApiError(error), variant: "destructive" });
      }
    }
    if (urls.length) {
      setFormData(prev => {
        if (!toGallery) {
          const [first, ...rest] = urls;
          return { ...prev, image: first, gallery_images: [...prev.gallery_images, ...rest] };
        }
        const rest = [...urls];
        const main = prev.image || rest.shift();
        return { ...prev, image: main, gallery_images: [...prev.gallery_images, ...rest] };
      });
      toast({ title: urls.length > 1 ? `${urls.length} photos ajoutées` : 'Photo ajoutée' });
    }
    setUploading(false);
    if (e.target) e.target.value = '';
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_, i) => i !== index) }));
  };

  // Échange une photo de la galerie avec la photo principale
  const makeMainImage = (index) => {
    setFormData(prev => {
      const gallery = [...prev.gallery_images];
      const chosen = gallery[index];
      if (prev.image) gallery[index] = prev.image;
      else gallery.splice(index, 1);
      return { ...prev, image: chosen, gallery_images: gallery };
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.image) {
      toast({ title: "Erreur", description: "Remplissez les champs obligatoires", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const projectData = { ...formData, details: formData.details.filter(d => d.trim() !== '') };
      if (editingProject) {
        await projectService.update(editingProject.id, projectData);
        toast({ title: "Projet mis a jour" });
      } else {
        await projectService.create(projectData);
        toast({ title: "Projet cree" });
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (error) {
      toast({ title: "Erreur", description: handleApiError(error), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const toggleVisibility = async (project) => {
    try {
      await projectService.update(project.id, { is_visible: !project.isVisible });
      toast({ title: `Projet ${!project.isVisible ? 'visible' : 'masque'} sur Inspiration` });
      loadProjects();
    } catch (error) {
      toast({ title: "Erreur", description: handleApiError(error), variant: "destructive" });
    }
  };

  const toggleShowOnHome = async (project) => {
    try {
      await projectService.update(project.id, { show_on_home: !project.showOnHome });
      toast({ title: `Projet ${!project.showOnHome ? 'affiche' : 'retire'} de l'accueil` });
      loadProjects();
    } catch (error) {
      toast({ title: "Erreur", description: handleApiError(error), variant: "destructive" });
    }
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Supprimer "${project.title}" ?`)) return;
    try {
      await projectService.delete(project.id);
      toast({ title: "Projet supprime" });
      loadProjects();
    } catch (error) {
      toast({ title: "Erreur", description: handleApiError(error), variant: "destructive" });
    }
  };

  const filteredProjects = filterCategory === 'Tous' 
    ? projects 
    : projects.filter(p => p.category === filterCategory);

  const uniqueCategories = ['Tous', ...new Set(projects.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="projects-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projets d'inspiration</h2>
          <p className="text-gray-600 mt-1">
            Gerez les projets. Utilisez les boutons pour controler la visibilite sur l'Inspiration et l'Accueil.
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700" data-testid="add-project-btn">
          <Plus className="w-4 h-4 mr-2" /> Ajouter un projet
        </Button>
      </div>

      {/* Filtre par catégorie */}
      <div className="flex flex-wrap gap-2" data-testid="project-category-filter">
        {uniqueCategories.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={filterCategory === cat ? 'default' : 'outline'}
            onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat ? 'bg-teal-700' : ''}
          >
            {cat}
            {cat !== 'Tous' && (
              <span className="ml-1 text-xs opacity-70">
                ({projects.filter(p => p.category === cat).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-sm text-slate-500 bg-stone-50 rounded-lg p-3">
        <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-green-600" /> = Visible sur Inspiration</span>
        <span className="flex items-center gap-1"><Home className="w-4 h-4 text-blue-600" /> = Affiche sur l'Accueil</span>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className={`overflow-hidden ${!project.isVisible ? 'opacity-50 border-dashed' : ''}`} data-testid={`project-card-${project.id}`}>
            <div className="relative h-48">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800'; }} />
              <div className="absolute top-2 left-2">
                <Badge className="bg-teal-600">{project.category}</Badge>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {!project.isVisible && (
                  <Badge variant="secondary" className="bg-gray-800 text-white"><EyeOff className="w-3 h-3 mr-1" />Masque</Badge>
                )}
                {project.showOnHome && (
                  <Badge className="bg-blue-600 text-white"><Home className="w-3 h-3 mr-1" />Accueil</Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => toggleVisibility(project)}
                  title={project.isVisible ? 'Masquer de Inspiration' : 'Afficher sur Inspiration'}
                  data-testid={`toggle-visible-${project.id}`}
                  className={project.isVisible ? 'border-green-300 text-green-700' : ''}
                >
                  {project.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleShowOnHome(project)}
                  title={project.showOnHome ? "Retirer de l'accueil" : "Mettre sur l'accueil"}
                  data-testid={`toggle-home-${project.id}`}
                  className={project.showOnHome ? 'border-blue-300 text-blue-700 bg-blue-50' : ''}
                >
                  <Home className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEditModal(project)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteProject(project)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun projet dans cette categorie</p>
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Modifier le projet' : 'Ajouter un projet'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Nom du projet" />
            </div>
            <div>
              <Label>Categorie *</Label>
              <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <Label>Image *</Label>
              <div className="flex gap-2">
                <Input value={formData.image} onChange={(e) => handleInputChange('image', e.target.value)} placeholder="URL de l'image ou upload" />
                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload').click()}>
                  <Upload className="w-4 h-4" />
                </Button>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} />
              </div>
              {formData.image && <img src={formData.image} alt="Apercu" className="mt-2 h-32 w-full object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />}
            </div>
            <div>
              <Label>Autres photos (optionnel)</Label>
              <p className="text-xs text-gray-500 mt-1">
                Vous pouvez choisir plusieurs photos d'un coup. Touchez « Principale » pour mettre une photo en premier.
              </p>
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {formData.gallery_images.map((img, index) => (
                  <div key={`gallery-${index}-${img.slice(-12)}`} className="relative">
                    <img src={img} alt={`Photo ${index + 2}`} className="w-full h-20 object-cover rounded-lg" />
                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => removeGalleryImage(index)} aria-label="Retirer la photo">
                      <X className="w-3 h-3" />
                    </Button>
                    <button type="button" onClick={() => makeMainImage(index)}
                      className="absolute bottom-1 left-1 right-1 text-[10px] bg-white/90 text-teal-800 rounded px-1 py-0.5 font-medium">
                      Principale
                    </button>
                  </div>
                ))}
                <label htmlFor="project-gallery-upload"
                  className="border-2 border-dashed border-gray-300 rounded-lg h-20 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 text-xs text-gray-500">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-teal-600" /> : <Plus className="w-6 h-6 text-gray-400" />}
                  Ajouter
                </label>
              </div>
              <input id="project-gallery-upload" type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleImageUpload(e, true)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Description du projet" rows={3} />
            </div>
            <div>
              <Label>Dimensions</Label>
              <Input value={formData.dimensions} onChange={(e) => handleInputChange('dimensions', e.target.value)} placeholder="Ex: 6m x 4m" />
            </div>
            <div>
              <Label>Details techniques</Label>
              {formData.details.map((detail, index) => (
                <div key={`detail-${index}`} className="flex gap-2 mt-2">
                  <Input value={detail} onChange={(e) => handleDetailChange(index, e.target.value)} placeholder={`Detail ${index + 1}`} />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeDetail(index)} disabled={formData.details.length === 1}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addDetail} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un detail
              </Button>
            </div>
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Visible sur la page Inspiration</Label>
                <Switch checked={formData.is_visible} onCheckedChange={(checked) => handleInputChange('is_visible', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Afficher sur la page d'Accueil</Label>
                <Switch checked={formData.show_on_home} onCheckedChange={(checked) => handleInputChange('show_on_home', checked)} />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManager;
