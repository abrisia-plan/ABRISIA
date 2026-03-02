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
  Loader2
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
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image: '',
    description: '',
    details: [''],
    dimensions: '',
    is_visible: true
  });

  const categories = [
    'Maison unifamiliale',
    'Chalet',
    'Mini-maison',
    'Extensions verrières solarium',
    'Autres dessins (ébénisterie)',
    'Dessins techniques',
    'Dessins architecturaux'
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll(true);
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: handleApiError(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      category: categories[0],
      image: '',
      description: '',
      details: [''],
      dimensions: '',
      is_visible: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      category: project.category,
      image: project.image,
      description: project.description,
      details: project.details || [''],
      dimensions: project.dimensions,
      is_visible: project.isVisible !== false
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await projectService.uploadImage(file);
      if (response.success) {
        handleInputChange('image', response.imageUrl);
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
    if (!formData.title || !formData.category || !formData.image) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const projectData = {
        ...formData,
        details: formData.details.filter(d => d.trim() !== '')
      };

      if (editingProject) {
        await projectService.update(editingProject.id, projectData);
        toast({
          title: "✅ Projet mis à jour",
          description: "Les modifications ont été enregistrées"
        });
      } else {
        await projectService.create(projectData);
        toast({
          title: "✅ Projet créé",
          description: "Le nouveau projet a été ajouté"
        });
      }

      setIsModalOpen(false);
      loadProjects();
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

  const toggleVisibility = async (project) => {
    try {
      await projectService.update(project.id, { is_visible: !project.isVisible });
      toast({
        title: "✅ Visibilité modifiée",
        description: `Le projet est maintenant ${!project.isVisible ? 'visible' : 'masqué'}`
      });
      loadProjects();
    } catch (error) {
      toast({
        title: "Erreur",
        description: handleApiError(error),
        variant: "destructive"
      });
    }
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${project.title}" ?`)) return;

    try {
      await projectService.delete(project.id);
      toast({
        title: "✅ Projet supprimé",
        description: "Le projet a été supprimé avec succès"
      });
      loadProjects();
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
          <h2 className="text-2xl font-bold text-gray-900">Projets d'inspiration</h2>
          <p className="text-gray-600 mt-1">Gérez les projets affichés sur la page Inspiration</p>
        </div>
        <Button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un projet
        </Button>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className={`overflow-hidden ${!project.isVisible ? 'opacity-60' : ''}`}>
            <div className="relative h-48">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-teal-600">{project.category}</Badge>
              </div>
              {!project.isVisible && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-gray-800 text-white">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Masqué
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleVisibility(project)}
                  title={project.isVisible ? 'Masquer' : 'Afficher'}
                >
                  {project.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(project)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => deleteProject(project)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun projet pour le moment</p>
          <Button onClick={openAddModal} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter votre premier projet
          </Button>
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Modifier le projet' : 'Ajouter un projet'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nom du projet"
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
              <Label htmlFor="image">Image *</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="URL de l'image ou upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="mt-2 h-32 w-full object-cover rounded-lg"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description du projet"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="Ex: 6m x 4m"
              />
            </div>

            <div>
              <Label>Détails techniques</Label>
              {formData.details.map((detail, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={detail}
                    onChange={(e) => handleDetailChange(index, e.target.value)}
                    placeholder={`Détail ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeDetail(index)}
                    disabled={formData.details.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDetail}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un détail
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="visible">Visible sur le site</Label>
              <Switch
                id="visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
              />
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

export default ProjectsManager;
