import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Send, CheckCircle, Upload, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { devisService, handleApiError } from '../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Devis = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [planOptions, setPlanOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    projectType: '',
    plansChoisis: [],
    representationType: '',
    responsePreference: '',
    stylesArchitecturaux: [],
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPlanOptions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/plan-options`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setPlanOptions(data.data);
          const planFromUrl = searchParams.get('plan');
          if (planFromUrl) {
            const matchedPlan = data.data.find(p => p.id === planFromUrl);
            if (matchedPlan) {
              setFormData(prev => ({ ...prev, plansChoisis: [planFromUrl] }));
            }
          }
        }
      } catch (err) {
        console.error('Erreur chargement options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadPlanOptions();
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanChange = (planId, checked) => {
    setFormData(prev => ({
      ...prev,
      plansChoisis: checked
        ? [...prev.plansChoisis, planId]
        : prev.plansChoisis.filter(p => p !== planId)
    }));
  };

  const handleStyleChange = (style, checked) => {
    setFormData(prev => ({
      ...prev,
      stylesArchitecturaux: checked
        ? [...prev.stylesArchitecturaux, style]
        : prev.stylesArchitecturaux.filter(s => s !== style)
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.dwg', '.dxf'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        toast({ title: "Fichier non supporté", description: `${file.name} — formats acceptés: JPG, PNG, PDF, DWG, DXF`, variant: "destructive" });
        return false;
      }
      if (file.size > maxSize) {
        toast({ title: "Fichier trop volumineux", description: `${file.name} dépasse 20MB`, variant: "destructive" });
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construire les notes enrichies avec tous les choix
      const notesEnrichies = `
${formData.notes}

--- Informations supplémentaires ---
Type de représentation souhaité: ${formData.representationType || 'Non précisé'}
Préférence de réponse: ${formData.responsePreference || 'Non précisé'}
Styles architecturaux: ${formData.stylesArchitecturaux.length > 0 ? formData.stylesArchitecturaux.join(', ') : 'Non précisé'}
Fichiers joints: ${uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : 'Aucun'}
      `.trim();

      const payload = {
        ...formData,
        notes: notesEnrichies
      };

      const response = await devisService.submit(payload);

      if (response.success) {
        toast({
          title: "Demande envoyée !",
          description: response.message || "Nous vous contacterons sous 24h à abrisia0plan@gmail.com",
        });
        setFormData({
          nom: '', email: '', telephone: '', projectType: '',
          plansChoisis: [], representationType: '', responsePreference: '',
          stylesArchitecturaux: [], notes: ''
        });
        setUploadedFiles([]);
      } else {
        throw new Error(response.message || "Erreur lors de l'envoi");
      }

    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const total = formData.plansChoisis.reduce((total, planId) => {
      const plan = planOptions.find(p => p.id === planId);
      if (plan && plan.price !== 'Sur devis') {
        return total + parseInt(plan.price.replace('$', ''));
      }
      return total;
    }, 0);
    const hasCustomPricing = formData.plansChoisis.some(planId => {
      const plan = planOptions.find(p => p.id === planId);
      return plan && plan.price === 'Sur devis';
    });
    return { total, hasCustomPricing };
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-stone-50">
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Demander un devis</h1>
          <p className="text-xl text-teal-100 leading-relaxed">Parlez-nous de votre idée - On s'occupe du reste</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-stone-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-stone-50 border-b border-stone-200">
              <CardTitle className="text-2xl text-slate-800 text-center">Tableau de demande de devis</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Coordonnées */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-stone-200 pb-2">Vos coordonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-slate-700 font-medium">Nom complet *</Label>
                      <Input id="nom" name="nom" value={formData.nom} onChange={handleInputChange} required className="border-stone-300 focus:border-teal-500" placeholder="Votre nom et prénom" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="border-stone-300 focus:border-teal-500" placeholder="votre@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-slate-700 font-medium">Téléphone (optionnel)</Label>
                    <Input id="telephone" name="telephone" type="tel" value={formData.telephone} onChange={handleInputChange} className="border-stone-300 focus:border-teal-500" placeholder="(514) 555-0123" />
                  </div>
                </div>

                {/* Plans */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-stone-200 pb-2">Cochez les plans dont vous avez besoin</h3>
                  <p className="text-sm text-slate-600 italic">Les prix indiqués sont des tarifs de base. Le devis final sera ajusté selon la complexité de votre projet.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planOptions.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 border border-stone-300 rounded-lg hover:bg-amber-50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            id={`plan-${plan.id}`}
                            checked={formData.plansChoisis.includes(plan.id)}
                            onCheckedChange={(checked) => handlePlanChange(plan.id, checked)}
                            className="border-stone-400"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`plan-${plan.id}`} className="cursor-pointer font-medium text-slate-700 block">{plan.name}</Label>
                            {plan.description && <p className="text-sm text-slate-600 mt-1">{plan.description}</p>}
                          </div>
                        </div>
                        <span className="text-teal-800 font-semibold ml-4">{plan.price}</span>
                      </div>
                    ))}
                  </div>

                  {formData.plansChoisis.length > 0 && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-800">Total estimé :</span>
                        <span className="text-2xl font-bold text-teal-800">
                          {calculateTotal().total > 0 ? `${calculateTotal().total}$` : ''}
                          {calculateTotal().hasCustomPricing && calculateTotal().total > 0 && ' + Sur devis'}
                          {calculateTotal().hasCustomPricing && calculateTotal().total === 0 && 'Sur devis'}
                        </span>
                      </div>
                      <p className="text-sm text-teal-700 mt-2">Prix indicatif - devis final après étude de votre projet</p>
                    </div>
                  )}
                </div>

                {/* Questions supplémentaires */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">?</span>
                    Aidez-nous à mieux comprendre vos attentes
                  </h3>

                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700">Que recherchez-vous principalement ?</h4>
                    {[
                      { value: 'technique', label: 'Plans techniques détaillés', desc: 'Dimensions précises, détails construction, matériaux spécifiés' },
                      { value: 'visuel', label: 'Représentation visuelle/esthétique', desc: 'Images 3D, croquis, visualisation de votre maison de rêve' },
                      { value: 'both', label: 'Les deux (technique + visuel)', desc: 'Plans de construction ET visualisations' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-start space-x-3 cursor-pointer">
                        <input type="radio" name="representationType" value={opt.value} checked={formData.representationType === opt.value} onChange={handleInputChange} className="mt-1 text-teal-600 focus:ring-teal-500" />
                        <div>
                          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                          <p className="text-xs text-slate-600">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-blue-200 pt-4 space-y-3">
                    <h4 className="font-medium text-slate-700">Comment préférez-vous recevoir la réponse ?</h4>
                    {[
                      { value: 'phone', label: 'Appel téléphonique', desc: 'Discussion directe pour répondre à vos questions' },
                      { value: 'email', label: 'Par courriel écrit', desc: 'Devis détaillé par écrit avec documents joints' },
                      { value: 'video', label: 'Vidéoconférence', desc: 'Présentation visuelle avec partage d\'écran (Zoom, Teams, etc.)' },
                      { value: 'flexible', label: 'À votre convenance', desc: 'Nous vous contacterons selon vos disponibilités' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-start space-x-3 cursor-pointer">
                        <input type="radio" name="responsePreference" value={opt.value} checked={formData.responsePreference === opt.value} onChange={handleInputChange} className="mt-1 text-teal-600 focus:ring-teal-500" />
                        <div>
                          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                          <p className="text-xs text-slate-600">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-medium text-slate-700 mb-2">Style architectural recherché</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Moderne/Contemporain', 'Traditionnel québécois', 'Rustique/Chalet', 'Minimaliste', 'Industriel', 'Scandinave', 'Autre (à préciser)'].map((style) => (
                        <label key={style} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1 rounded border border-blue-200 hover:bg-blue-50">
                          <input
                            type="checkbox"
                            checked={formData.stylesArchitecturaux.includes(style)}
                            onChange={(e) => handleStyleChange(style, e.target.checked)}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-slate-700">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload fichiers */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-stone-200 pb-2">
                    Joindre des fichiers (optionnel)
                  </h3>
                  <p className="text-sm text-slate-600">Croquis, photos du terrain, plans existants, fichiers AutoCAD (.dwg, .dxf), images JPG/PNG, PDF — max 20MB par fichier</p>

                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:bg-amber-50 hover:border-teal-400 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">Cliquez pour sélectionner des fichiers</span>
                    <span className="text-xs text-slate-400 mt-1">JPG, PNG, PDF, DWG, DXF</span>
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf,.dwg,.dxf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg">
                          <span className="text-sm text-slate-700 truncate">{file.name}</span>
                          <button type="button" onClick={() => removeFile(index)} className="ml-3 text-slate-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-700 font-medium">Décrivez votre projet en détail</Label>
                  <div className="text-sm text-slate-600 mb-3 p-3 bg-amber-50 border border-amber-200 rounded">
                    <strong>💡 Conseil :</strong> Plus vous êtes précis, mieux nous pourrons vous aider ! Mentionnez : dimensions, budget, délais, contraintes du terrain, inspirations, etc.
                  </div>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={8}
                    className="border-stone-300 focus:border-teal-500"
                    placeholder="Exemple : Mini-maison 35m² sur fondations béton, style scandinave moderne. Bois local, isolation supérieure, chauffage géothermique..."
                  />
                </div>

                {/* Soumettre */}
                <div className="pt-6 border-t border-stone-200">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || formData.plansChoisis.length === 0}
                    className="w-full bg-teal-800 hover:bg-teal-900 text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Envoi vers abrisia0plan@gmail.com...</>
                    ) : (
                      <><Send className="mr-3 h-5 w-5" />Envoyer ma demande de devis</>
                    )}
                  </Button>
                  {formData.plansChoisis.length === 0 && (
                    <p className="text-center text-sm text-slate-500 mt-3">Sélectionnez au moins un plan pour continuer</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-6 w-6 text-teal-600 mr-2" />
              <span className="text-lg font-medium text-slate-700">Devis gratuit et sans engagement</span>
            </div>
            <div className="max-w-3xl mx-auto space-y-4 text-slate-600">
              <p className="text-lg"><strong>Contact :</strong> abrisia0plan@gmail.com</p>
              <p>Nous étudions votre projet et vous proposons un devis détaillé conforme au Code du bâtiment du Québec.</p>
              <p className="text-sm text-slate-500"><strong>Spécialité :</strong> Constructions permanentes sur fondations jusqu'à 600m² de plancher total (6000 pi²)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Devis;
