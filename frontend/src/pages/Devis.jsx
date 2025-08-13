import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { planOptions, projectTypes } from '../data/mock';
import { Send, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Devis = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    projectType: '',
    plansChoisis: [],
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Simulation d'envoi vers abrisia0plan@gmail.com
    setTimeout(() => {
      console.log('Demande de devis envoyée à abrisia0plan@gmail.com:', formData);
      toast({
        title: "Demande envoyée !",
        description: "Nous vous contacterons sous 24h à l'adresse abrisia0plan@gmail.com",
      });
      
      // Reset form
      setFormData({
        nom: '', email: '', telephone: '', projectType: '', plansChoisis: [], notes: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const calculateTotal = () => {
    return formData.plansChoisis.reduce((total, planId) => {
      const plan = planOptions.find(p => p.id === planId);
      return total + (plan ? parseInt(plan.price.replace('$', '')) : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Demander un devis
          </h1>
          <p className="text-xl text-green-100 leading-relaxed">
            Simple et rapide - Cochez ce dont vous avez besoin
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-stone-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-stone-50 to-white border-b border-stone-200">
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
                      <Label htmlFor="nom" className="text-slate-700 font-medium">Nom complet *</Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        className="border-stone-300 focus:border-green-500"
                        placeholder="Votre nom et prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="border-stone-300 focus:border-green-500"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-slate-700 font-medium">Téléphone (optionnel)</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="border-stone-300 focus:border-green-500"
                      placeholder="(514) 555-0123"
                    />
                  </div>
                </div>

                {/* Type de projet */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-stone-200 pb-2">
                    Type de projet
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {projectTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-3 p-3 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors">
                        <input
                          type="radio"
                          id={`type-${type}`}
                          name="projectType"
                          value={type}
                          checked={formData.projectType === type}
                          onChange={handleInputChange}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <Label 
                          htmlFor={`type-${type}`} 
                          className="cursor-pointer font-medium text-slate-700 text-sm"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plans désirés - Cases à cocher */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-stone-200 pb-2">
                    Cochez les plans dont vous avez besoin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planOptions.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`plan-${plan.id}`}
                            checked={formData.plansChoisis.includes(plan.id)}
                            onCheckedChange={(checked) => handlePlanChange(plan.id, checked)}
                            className="border-stone-400"
                          />
                          <Label 
                            htmlFor={`plan-${plan.id}`} 
                            className="cursor-pointer font-medium text-slate-700"
                          >
                            {plan.name}
                          </Label>
                        </div>
                        <span className="text-green-700 font-semibold">{plan.price}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total estimé */}
                  {formData.plansChoisis.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-800">Total estimé :</span>
                        <span className="text-2xl font-bold text-green-700">{calculateTotal()}$</span>
                      </div>
                      <p className="text-sm text-green-600 mt-2">Prix indicatif - devis final après étude de votre projet</p>
                    </div>
                  )}
                </div>

                {/* Zone de notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-700 font-medium">
                    Décrivez votre projet (dimensions, matériaux, contraintes, budget, délais...)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={8}
                    className="border-stone-300 focus:border-green-500"
                    placeholder="Exemple : Mini-maison 25m² sur roues, bois local, isolation naturelle, budget 15000$, pour été 2025. Terrain en pente, accès limité pour grue..."
                  />
                </div>

                {/* Soumission */}
                <div className="pt-6 border-t border-stone-200">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting || formData.plansChoisis.length === 0}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
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
                  {formData.plansChoisis.length === 0 && (
                    <p className="text-center text-sm text-slate-500 mt-3">
                      Sélectionnez au moins un plan pour continuer
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informations complémentaires */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-lg font-medium text-slate-700">Devis gratuit et sans engagement</span>
            </div>
            <div className="max-w-3xl mx-auto space-y-4 text-slate-600">
              <p className="text-lg">
                <strong>Contact :</strong> abrisia0plan@gmail.com
              </p>
              <p>
                Nous étudions votre projet sous tous les angles et vous proposons un devis détaillé adapté à vos besoins et votre budget.
              </p>
              <p className="text-sm text-slate-500">
                <strong>Limite légale :</strong> Dessins de maisons jusqu'à 6000m² de plancher total (incluant sous-sol et étages)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Devis;