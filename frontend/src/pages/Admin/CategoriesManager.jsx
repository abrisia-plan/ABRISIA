import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
  FolderOpen
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CategoriesManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const defaultIcons = ['🏠', '🏔️', '🏡', '🪟', '🪑', '📐', '🏛️', '🏢', '🌿', '✨'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/admin/content/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    setCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, [field]: value } : cat
    ));
  };

  const toggleVisibility = (index) => {
    setCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, is_visible: !cat.is_visible } : cat
    ));
  };

  const addCategory = () => {
    setCategories(prev => [...prev, {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      icon: '📁',
      is_visible: true,
      order: prev.length + 1
    }]);
  };

  const removeCategory = (index) => {
    if (categories.length > 1) {
      setCategories(prev => prev.filter((_, i) => i !== index));
    }
  };

  const saveCategories = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/content/categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categories)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Catégories sauvegardées",
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

  // Compter les catégories visibles
  const visibleCount = categories.filter(c => c.is_visible).length;

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
          <h2 className="text-2xl font-bold text-gray-900">Catégories d'inspiration</h2>
          <p className="text-gray-600 mt-1">
            Gérez les catégories affichées sur la page d'accueil
            <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
              {visibleCount} visible{visibleCount > 1 ? 's' : ''} sur {categories.length}
            </span>
          </p>
        </div>
        <Button onClick={addCategory} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Catégories pour "Inspirations par catégorie"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Activez/désactivez les catégories qui apparaissent sur la page d'accueil. 
            Seules les catégories <span className="text-green-600 font-semibold">activées</span> seront visibles.
          </p>
          
          {categories.map((category, index) => (
            <div 
              key={category.id || index} 
              className={`p-4 border rounded-lg transition-all ${
                category.is_visible 
                  ? 'bg-white border-green-200 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="cursor-move text-gray-400">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                {/* Icône */}
                <div className="relative">
                  <select
                    value={category.icon}
                    onChange={(e) => handleChange(index, 'icon', e.target.value)}
                    className="w-14 h-14 text-2xl text-center border rounded-lg cursor-pointer appearance-none bg-white"
                  >
                    {defaultIcons.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                
                {/* Nom et description */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Nom de la catégorie</Label>
                    <Input
                      value={category.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      placeholder="Nom de la catégorie"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Description</Label>
                    <Input
                      value={category.description || ''}
                      onChange={(e) => handleChange(index, 'description', e.target.value)}
                      placeholder="Description courte"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant={category.is_visible ? "default" : "outline"}
                    className={category.is_visible ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => toggleVisibility(index)}
                  >
                    {category.is_visible ? (
                      <><Eye className="w-4 h-4 mr-1" /> Visible</>
                    ) : (
                      <><EyeOff className="w-4 h-4 mr-1" /> Masqué</>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => removeCategory(index)}
                    disabled={categories.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={saveCategories} 
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Sauvegarder les catégories</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu sur la page d'accueil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.filter(c => c.is_visible).map((category) => (
              <div key={category.id} className="p-4 bg-stone-50 rounded-lg text-center">
                <span className="text-3xl">{category.icon}</span>
                <p className="font-semibold text-sm mt-2">{category.name}</p>
              </div>
            ))}
          </div>
          {visibleCount === 0 && (
            <p className="text-center text-gray-500 py-8">
              Aucune catégorie visible. Activez au moins une catégorie.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesManager;
