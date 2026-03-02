import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  GripVertical,
  FileText,
  Phone,
  Palette
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FormOptionsManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('plan_types');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [options, setOptions] = useState({
    plan_types: [],
    contact_methods: [],
    architectural_styles: []
  });

  const tabConfig = {
    plan_types: {
      title: "Que recherchez-vous principalement ?",
      icon: FileText,
      description: "Types de plans proposés aux clients"
    },
    contact_methods: {
      title: "Comment préférez-vous recevoir la réponse ?",
      icon: Phone,
      description: "Méthodes de contact pour le devis"
    },
    architectural_styles: {
      title: "Style architectural recherché",
      icon: Palette,
      description: "Styles architecturaux proposés"
    }
  };

  useEffect(() => {
    loadAllOptions();
  }, []);

  const loadAllOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/content/form-options`);
      const data = await response.json();
      
      if (data.success) {
        setOptions(data.data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les options",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (optionType, index, field, value) => {
    setOptions(prev => ({
      ...prev,
      [optionType]: prev[optionType].map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const addOption = (optionType) => {
    setOptions(prev => ({
      ...prev,
      [optionType]: [
        ...prev[optionType],
        { 
          id: `new-${Date.now()}`, 
          label: '', 
          description: '', 
          is_active: true, 
          order: prev[optionType].length + 1 
        }
      ]
    }));
  };

  const removeOption = (optionType, index) => {
    if (options[optionType].length > 1) {
      setOptions(prev => ({
        ...prev,
        [optionType]: prev[optionType].filter((_, i) => i !== index)
      }));
    }
  };

  const saveOptions = async (optionType) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/content/form-options/${optionType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(options[optionType])
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ Options sauvegardées",
          description: "Les modifications seront visibles sur le formulaire de devis"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Options du formulaire de devis</h2>
        <p className="text-gray-600 mt-1">Personnalisez les choix proposés aux clients</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan_types" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Types de plans
          </TabsTrigger>
          <TabsTrigger value="contact_methods" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Méthodes contact
          </TabsTrigger>
          <TabsTrigger value="architectural_styles" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Styles archi.
          </TabsTrigger>
        </TabsList>

        {Object.keys(tabConfig).map((optionType) => (
          <TabsContent key={optionType} value={optionType} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(tabConfig[optionType].icon, { className: "w-5 h-5" })}
                  {tabConfig[optionType].title}
                </CardTitle>
                <p className="text-sm text-gray-600">{tabConfig[optionType].description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {options[optionType]?.map((option, index) => (
                  <div 
                    key={option.id || index} 
                    className={`p-4 border rounded-lg ${!option.is_active ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="cursor-move text-gray-400 mt-2">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Libellé *</Label>
                          <Input
                            value={option.label}
                            onChange={(e) => handleOptionChange(optionType, index, 'label', e.target.value)}
                            placeholder="Nom de l'option"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Description (optionnel)</Label>
                          <Input
                            value={option.description || ''}
                            onChange={(e) => handleOptionChange(optionType, index, 'description', e.target.value)}
                            placeholder="Description courte"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={option.is_active !== false}
                            onCheckedChange={(checked) => handleOptionChange(optionType, index, 'is_active', checked)}
                          />
                          <span className="text-xs text-gray-500">Actif</span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => removeOption(optionType, index)}
                          disabled={options[optionType].length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => addOption(optionType)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une option
                  </Button>
                  <Button 
                    onClick={() => saveOptions(optionType)} 
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
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FormOptionsManager;
