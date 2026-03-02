import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  Star,
  Check,
  X,
  Eye,
  EyeOff,
  MessageSquare,
  Edit
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TestimonialsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_location: '',
    project_type: '',
    rating: 5,
    comment: '',
    is_visible: true
  });

  useEffect(() => {
    loadTestimonials();
    loadPendingReviews();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/testimonials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data || []);
      }
    } catch (error) {
      // Charger des témoignages par défaut si pas en DB
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/reviews?status_filter=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPendingReviews(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    }
  };

  const openAddModal = () => {
    setEditingTestimonial(null);
    setFormData({
      client_name: '',
      client_location: '',
      project_type: '',
      rating: 5,
      comment: '',
      is_visible: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name || testimonial.clientName || '',
      client_location: testimonial.client_location || testimonial.clientLocation || '',
      project_type: testimonial.project_type || testimonial.projectType || '',
      rating: testimonial.rating || 5,
      comment: testimonial.comment || '',
      is_visible: testimonial.is_visible !== false
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.client_name || !formData.comment) {
      toast({
        title: "Erreur",
        description: "Le nom et le commentaire sont requis",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const url = editingTestimonial 
        ? `${BACKEND_URL}/api/admin/testimonials/${editingTestimonial.id}`
        : `${BACKEND_URL}/api/admin/testimonials`;
      
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingTestimonial ? "✅ Témoignage modifié" : "✅ Témoignage ajouté",
          description: "Les modifications ont été enregistrées"
        });
        setIsModalOpen(false);
        loadTestimonials();
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

  const toggleVisibility = async (testimonial) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${BACKEND_URL}/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...testimonial, is_visible: !testimonial.is_visible })
      });
      
      toast({
        title: "✅ Visibilité modifiée"
      });
      loadTestimonials();
    } catch (error) {
      toast({
        title: "Erreur",
        variant: "destructive"
      });
    }
  };

  const deleteTestimonial = async (testimonial) => {
    if (!window.confirm('Supprimer ce témoignage ?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${BACKEND_URL}/api/admin/testimonials/${testimonial.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast({ title: "✅ Témoignage supprimé" });
      loadTestimonials();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const approveReview = async (review) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${BACKEND_URL}/api/admin/reviews/${review.id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Créer un témoignage à partir de l'avis
      await fetch(`${BACKEND_URL}/api/admin/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          client_name: review.client_name,
          project_type: review.project_type,
          rating: review.rating,
          comment: review.comment,
          is_visible: true
        })
      });
      
      toast({ title: "✅ Avis approuvé et ajouté aux témoignages" });
      loadPendingReviews();
      loadTestimonials();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const rejectReview = async (review) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${BACKEND_URL}/api/admin/reviews/${review.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast({ title: "Avis rejeté" });
      loadPendingReviews();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
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
          <h2 className="text-2xl font-bold text-gray-900">Témoignages clients</h2>
          <p className="text-gray-600 mt-1">Gérez les avis affichés sur le site</p>
        </div>
        <Button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un témoignage
        </Button>
      </div>

      {/* Avis en attente d'approbation */}
      {pendingReviews.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <MessageSquare className="w-5 h-5" />
              Avis en attente ({pendingReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReviews.map((review) => (
              <div key={review.id} className="p-4 bg-white rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.client_name}</span>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    {review.project_type && (
                      <p className="text-xs text-gray-500 mt-1">Projet: {review.project_type}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveReview(review)}
                    >
                      <Check className="w-4 h-4 mr-1" /> Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => rejectReview(review)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Témoignages actifs */}
      <Card>
        <CardHeader>
          <CardTitle>Témoignages sur le site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {testimonials.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun témoignage pour le moment</p>
              <Button onClick={openAddModal} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter votre premier témoignage
              </Button>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className={`p-4 border rounded-lg ${testimonial.is_visible ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{testimonial.client_name || testimonial.clientName}</span>
                      {renderStars(testimonial.rating)}
                      {!testimonial.is_visible && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Masqué</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 italic">"{testimonial.comment}"</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {(testimonial.client_location || testimonial.clientLocation) && (
                        <span>📍 {testimonial.client_location || testimonial.clientLocation}</span>
                      )}
                      {(testimonial.project_type || testimonial.projectType) && (
                        <span>🏠 {testimonial.project_type || testimonial.projectType}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(testimonial)}
                    >
                      {testimonial.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => deleteTestimonial(testimonial)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal Ajouter/Modifier */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom du client *</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  placeholder="Marie Tremblay"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Localisation</Label>
                <Input
                  value={formData.client_location}
                  onChange={(e) => handleInputChange('client_location', e.target.value)}
                  placeholder="Saguenay, QC"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de projet</Label>
                <Input
                  value={formData.project_type}
                  onChange={(e) => handleInputChange('project_type', e.target.value)}
                  placeholder="Mini-maison"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Note (étoiles)</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleInputChange('rating', star)}
                    >
                      <Star
                        className={`w-8 h-8 ${star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Commentaire *</Label>
              <Textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Ce que le client a dit..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Enregistrer</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManager;
