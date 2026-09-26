import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { projectTypes } from '../data/mock';
import { Send, CheckCircle, Loader2, Calculator } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import SEO from '../components/SEO';
import { devisService, handleApiError } from '../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Devis = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [planOptions, setPlanOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    projectType: '',
    plansChoisis: [],
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculateur de prix préliminaire
  const [calcWidth, setCalcWidth] = useState('');
  const [calcDepth, setCalcDepth] = useState('');
  const [calcFloors, setCalcFloors] = useState('1');
  const [baseRate, setBaseRate] = useState(3.50);

  // Charger le tarif de base depuis l'API (moyenne des tarifs configurés)
  useEffect(() => {
    const loadRates = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calculator-rates`);
        const data = await res.json();
        if (data.success && data.data) {
          const nonZero = data.data.filter(r => r.rate > 0);
          if (nonZero.length > 0) {
            const avg = nonZero.reduce((sum, r) => sum + r.rate, 0) / nonZero.length;
            setBaseRate(Math.round(avg * 100) / 100);
          }
        }
      } catch {
        // Fallback
        setBaseRate(3.50);
      }
    };
    loadRates();
  }, []);

  const calcEstimate = useMemo(() => {
    const w = parseFloat(calcWidth) || 0;
    const d = parseFloat(calcDepth) || 0;
    const f = parseInt(calcFloors) || 1;
    const surface = w * d * f;
    if (surface === 0) return null;
    const price = Math.round(surface * baseRate);
    return { surface: Math.round(surface), price, rate: baseRate };
  }, [calcWidth, calcDepth, calcFloors, baseRate]);

  useEffect(() => {
    // Pré-sélectionner la catégorie depuis l'URL ?service=Mini-maison
    const serviceFromUrl = searchParams.get('service');
    if (serviceFromUrl) {
      setFormData(prev => ({ ...prev, notes: `Service demandé: ${serviceFromUrl}` }));
    }
  }, [searchParams]);

  useEffect(() => {
    const loadPlanOptions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/plan-options`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setPlanOptions(data.data);
        }
      } catch (err) {
        // Handled silently
      } finally {
        setLoadingOptions(false);
      }
    };
    loadPlanOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanChange = (planId, checked) => {
    setFormData(prev => ({
      ...prev,
      plansChoisis: checked 
        ? [...prev.plansChoisis, planId]
        : prev.plansChoisis.filter(p => p !== planId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Envoyer vers l'API réelle
      const response = await devisService.submit(formData);
      
      if (response.success) {
        toast({
          title: "Demande envoyée !",
          description: response.message || "Nous vous contacterons sous 24h à abrisia0plan@gmail.com",
        });
        
        // Reset form
        setFormData({
          prenom: '', nom: '', email: '', telephone: '', projectType: '', plansChoisis: [], notes: ''
        });
      } else {
        throw new Error(response.message || 'Erreur lors de l\'envoi');
      }
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const plansTotal = formData.plansChoisis.reduce((total, planId) => {
      const plan = planOptions.find(p => p.id === planId);
      if (plan && plan.price !== 'Sur devis' && plan.price !== 'x') {
        return total + parseInt(plan.price.replace(/[^0-9]/g, ''));
      }
      return total;
    }, 0);
    
    const calcPrice = calcEstimate ? calcEstimate.price : 0;
    
    const hasCustomPricing = formData.plansChoisis.some(planId => {
      const plan = planOptions.find(p => p.id === planId);
      return plan && (plan.price === 'Sur devis' || plan.price === 'x');
    });
    
    return { total: plansTotal + calcPrice, hasCustomPricing };
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-stone-50">
      <SEO 
        title="Demander un devis"
        description="Demandez un devis gratuit pour vos plans architecturaux. Plans de mini-maison, chalet, maison unifamiliale, extension ou rénovation au Québec."
        path="/devis"
      />
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Demander un devis
          </h1>
          <p className="text-xl text-teal-100 leading-relaxed">
            Parlez-nous de votre idée - On s'occupe du reste
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-stone-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-stone-50 border-b border-stone-200">
              <CardTitle className="text-2xl text-slate-800 text-center">
                Tableau de demande de devis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Vos coordonnées */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-stone-200 pb-2">
                    Vos coordonnées
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="prenom" className="text-slate-700 font-medium">Prénom *</Label>
                      <Input
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        required
                        className="border-stone-300 focus:border-teal-500"
                        placeholder="Votre prénom"
                        data-testid="devis-prenom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-slate-700 font-medium">Nom *</Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        className="border-stone-300 focus:border-teal-500"
                        placeholder="Votre nom de famille"
                        data-testid="devis-nom"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Courriel *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="border-stone-300 focus:border-teal-500"
                        placeholder="votre@email.com"
                        data-testid="devis-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="text-slate-700 font-medium">Téléphone (optionnel)</Label>
                      <Input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="border-stone-300 focus:border-teal-500"
                        placeholder="(418) 555-1234"
                        data-testid="devis-telephone"
                      />
                    </div>
                  </div>
                </div>

                {/* Plans désirés - Cases à cocher */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-stone-200 pb-2">
                    Cochez les plans dont vous avez besoin (prix à partir de)
                  </h3>

                  {/* Calculateur de prix préliminaire */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-5 space-y-4" data-testid="price-calculator">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-teal-700" />
                      Calculateur de prix préliminaire
                    </h4>
                    <p className="text-sm text-slate-600">Obtenez une estimation rapide basée sur les dimensions de votre projet.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm">Largeur (pi)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={calcWidth}
                          onChange={(e) => setCalcWidth(e.target.value)}
                          placeholder="Ex: 30"
                          className="mt-1"
                          data-testid="calc-width"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Profondeur (pi)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={calcDepth}
                          onChange={(e) => setCalcDepth(e.target.value)}
                          placeholder="Ex: 40"
                          className="mt-1"
                          data-testid="calc-depth"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Étages</Label>
                        <select
                          value={calcFloors}
                          onChange={(e) => setCalcFloors(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                          data-testid="calc-floors"
                        >
                          <option value="1">1 étage</option>
                          <option value="2">2 étages</option>
                          <option value="3">3 étages</option>
                        </select>
                      </div>
                    </div>

                    {calcEstimate && (
                      <div className="bg-white rounded-lg p-4 border border-teal-200 flex items-center justify-between" data-testid="calc-result">
                        <div className="text-sm text-slate-600">
                          <p>Surface totale : <strong>{calcEstimate.surface} pi²</strong></p>
                          <p>Tarif approximatif : {calcEstimate.rate} $/pi²</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Estimation approximative</p>
                          <p className="text-2xl font-bold text-teal-800">~ {calcEstimate.price.toLocaleString('fr-CA')} $</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-400">* Prix indicatif avant taxes. Le devis final sera ajusté selon la complexité du projet.</p>
                  </div>
                  <p className="text-sm text-slate-600 italic">
                    <strong>Estimation préliminaire seulement</strong> — Le montant affiché sert à donner un ordre de grandeur. Le prix final sera établi après l'analyse du projet et confirmé dans un devis personnalisé.
                  </p>
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
                            <Label 
                              htmlFor={`plan-${plan.id}`} 
                              className="cursor-pointer font-medium text-slate-700 block"
                            >
                              {plan.name}
                            </Label>
                            {plan.description && (
                              <p className="text-sm text-slate-600 mt-1 cursor-pointer" onClick={() => handlePlanChange(plan.id, !formData.plansChoisis.includes(plan.id))}>
                                {plan.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-teal-800 font-semibold ml-4">{plan.price}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total estimé */}
                  {(calcEstimate || formData.plansChoisis.length > 0) && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-800">Total estimé :</span>
                        <span className="text-2xl font-bold text-teal-800">
                          {calculateTotal().total > 0 ? `~ ${calculateTotal().total.toLocaleString('fr-CA')}$` : ''}
                          {calculateTotal().hasCustomPricing && calculateTotal().total > 0 && ' + Sur devis'}
                          {calculateTotal().hasCustomPricing && calculateTotal().total === 0 && 'Sur devis'}
                        </span>
                      </div>
                      <p className="text-sm text-teal-700 mt-2">
                        Estimation préliminaire — Le prix final sera confirmé dans un devis personnalisé
                        {calculateTotal().hasCustomPricing && (
                          <>
                            <br />
                            <strong>Certains services seront évalués selon vos besoins spécifiques</strong>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Section guide pour préciser les attentes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">?</span>
                    Aidez-nous à mieux comprendre vos attentes
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Type de représentation souhaité */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700">Que recherchez-vous principalement ?</h4>
                      <div className="space-y-2">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="representationType" 
                            value="technique"
                            className="mt-1 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700">Plans techniques détaillés</span>
                            <p className="text-xs text-slate-600">Dimensions précises, détails construction, matériaux spécifiés</p>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="representationType" 
                            value="visuel"
                            className="mt-1 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700">Représentation visuelle/esthétique</span>
                            <p className="text-xs text-slate-600">Images 3D, croquis, visualisation de votre maison de rêve</p>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="representationType" 
                            value="both"
                            className="mt-1 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-700">Les deux (technique + visuel)</span>
                            <p className="text-xs text-slate-600">Plans de construction ET visualisations</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-medium text-slate-700 mb-3">Comment préférez-vous recevoir la réponse à votre devis ?</h4>
                    <div className="space-y-2">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="responsePreference" 
                          value="phone"
                          className="mt-1 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700">Appel téléphonique</span>
                          <p className="text-xs text-slate-600">Discussion directe pour répondre à vos questions</p>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="responsePreference" 
                          value="email"
                          className="mt-1 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700">Par courriel écrit</span>
                          <p className="text-xs text-slate-600">Devis détaillé par écrit avec documents joints</p>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="responsePreference" 
                          value="video"
                          className="mt-1 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700">Vidéoconférence</span>
                          <p className="text-xs text-slate-600">Présentation visuelle avec partage d'écran (Zoom, Teams, etc.)</p>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="responsePreference" 
                          value="flexible"
                          className="mt-1 text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700">À votre convenance</span>
                          <p className="text-xs text-slate-600">Nous vous contacterons selon vos disponibilités</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-medium text-slate-700 mb-2">Style architectural recherché</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Moderne/Contemporain', 'Traditionnel québécois', 'Rustique/Chalet', 
                        'Minimaliste', 'Industriel', 'Scandinave', 'Autre (à préciser)'
                      ].map((style) => (
                        <label key={style} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1 rounded border border-blue-200 hover:bg-blue-50">
                          <input type="checkbox" className="text-teal-600 focus:ring-teal-500" />
                          <span className="text-sm text-slate-700">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Zone de notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-700 font-medium">
                    Décrivez votre projet en détail
                  </Label>
                  <div className="text-sm text-slate-600 mb-3 p-3 bg-amber-50 border border-amber-200 rounded">
                    <strong>💡 Conseil :</strong> Plus vous êtes précis, mieux nous pourrons vous aider ! 
                    Mentionnez : dimensions, budget, délais, contraintes du terrain, inspirations, etc.
                  </div>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={8}
                    className="border-stone-300 focus:border-teal-500"
                    placeholder="Exemple : Mini-maison 35m² sur fondations béton, style scandinave moderne. Bois local, isolation supérieure, chauffage géothermique. Terrain plat avec pente douce vers sud, services municipaux à 50m. Budget construction 180000$, plans requis pour printemps 2027. Inspiration : grandes fenêtres, toit cathédrale, foyer central..."
                  />
                </div>

                {/* Soumission */}
                <div className="pt-6 border-t border-stone-200">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full bg-teal-800 hover:bg-teal-900 text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Envoi vers abrisia0plan@gmail.com...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-5 w-5" />
                        Envoyer ma demande de devis
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informations complémentaires */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-6 w-6 text-teal-600 mr-2" />
              <span className="text-lg font-medium text-slate-700">Devis gratuit et sans engagement</span>
            </div>
            <div className="max-w-3xl mx-auto space-y-4 text-slate-600">
              <p className="text-lg">
                <strong>Contact :</strong> abrisia0plan@gmail.com
              </p>
              <p>
                Nous étudions votre projet et vous proposons un devis détaillé 
                incluant les plans nécessaires (fondation, architecture, etc.) selon vos besoins.
              </p>
              <p className="text-sm text-slate-500">
                <strong>Spécialité :</strong> Habitations unifamiliales jusqu'à 600 m² (~6 458 pi²) — Services 100 % à distance
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Devis;