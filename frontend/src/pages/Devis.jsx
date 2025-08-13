import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { planTypes } from '../data/mock';
import { Send, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Devis = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Identité
    nom: '',
    email: '',
    telephone: '',
    
    // Projet
    typeProjet: '',
    optionProjet: '',
    superficies: '',
    plansDesires: [],
    ebenisterie: '',
    
    // Choix techniques
    ventilationIncluse: true,
    electricite: '',
    plomberie: '',
    
    // Détails
    materiaux: '',
    budget: '',
    echeancier: '',
    souplesse: '',
    message: '',
    
    // Consentement
    consentement: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanChange = (planId, checked) => {
    setFormData(prev => ({
      ...prev,
      plansDesires: checked 
        ? [...prev.plansDesires, planId]
        : prev.plansDesires.filter(p => p !== planId)
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consentement) {
      toast({
        title: "Consentement requis",
        description: "Veuillez accepter la politique de confidentialité pour continuer.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulation d'envoi (sera remplacé par l'API réelle)
    setTimeout(() => {
      console.log('Demande de devis détaillée:', { ...formData, files });
      toast({
        title: "Demande envoyée !",
        description: "Merci ! On vous revient avec un plan de match sous peu.",
      });
      
      // Reset form
      setFormData({
        nom: '', email: '', telephone: '', typeProjet: '', optionProjet: '',
        superficies: '', plansDesires: [], ebenisterie: '', ventilationIncluse: true,
        electricite: '', plomberie: '', materiaux: '', budget: '', echeancier: '',
        souplesse: '', message: '', consentement: false
      });
      setFiles([]);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Demander un devis
          </h1>
          <p className="text-xl text-amber-100 leading-relaxed">
            Décrivez votre projet. On vous revient avec un plan de match.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-amber-100">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <CardTitle className="text-2xl text-slate-800 text-center">
                Parlez-nous de votre projet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Identité */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-amber-200 pb-2">
                    Vos coordonnées
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-slate-700 font-medium">Nom *</Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        className="border-amber-200 focus:border-amber-500"
                        placeholder="Votre nom complet"
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
                        className="border-amber-200 focus:border-amber-500"
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
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="(514) 555-0123"
                    />
                  </div>
                </div>

                {/* Projet */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-amber-200 pb-2">
                    Votre projet
                  </h3>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Type de projet *</Label>
                    <Select value={formData.typeProjet} onValueChange={(value) => handleSelectChange('typeProjet', value)}>
                      <SelectTrigger className="border-amber-200 focus:border-amber-500">
                        <SelectValue placeholder="Choisissez le type de projet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abris">Abris</SelectItem>
                        <SelectItem value="mini-maison">Mini-maison</SelectItem>
                        <SelectItem value="chalet">Chalet</SelectItem>
                        <SelectItem value="roulotte-chantier">Roulotte de chantier</SelectItem>
                        <SelectItem value="plans-seulement">Plans seulement</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-700 font-medium">Option *</Label>
                    <RadioGroup 
                      value={formData.optionProjet} 
                      onValueChange={(value) => handleSelectChange('optionProjet', value)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plans-uniquement" id="plans-uniquement" />
                        <Label htmlFor="plans-uniquement" className="cursor-pointer">Plans uniquement</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plans-accompagnement" id="plans-accompagnement" />
                        <Label htmlFor="plans-accompagnement" className="cursor-pointer">Plans + Construction/Accompagnement</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="superficies" className="text-slate-700 font-medium">Superficies/dimensions</Label>
                    <Textarea
                      id="superficies"
                      name="superficies"
                      value={formData.superficies}
                      onChange={handleInputChange}
                      rows={3}
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Ex: 6m x 4m, surface habitable 25m², hauteur sous plafond 2.5m..."
                    />
                  </div>
                </div>

                {/* Plans désirés */}
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium text-lg">Plans désirés</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planTypes.map((plan) => (
                      <div key={plan.id} className="flex items-start space-x-3 p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
                        <Checkbox
                          id={`plan-${plan.id}`}
                          checked={formData.plansDesires.includes(plan.id)}
                          onCheckedChange={(checked) => handlePlanChange(plan.id, checked)}
                          className="border-amber-300 mt-1"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`plan-${plan.id}`} 
                            className="font-medium text-slate-700 cursor-pointer block"
                          >
                            {plan.name}
                          </Label>
                          <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ébénisterie sur mesure */}
                <div className="space-y-2">
                  <Label htmlFor="ebenisterie" className="text-slate-700 font-medium">Ébénisterie sur mesure (à venir)</Label>
                  <Textarea
                    id="ebenisterie"
                    name="ebenisterie"
                    value={formData.ebenisterie}
                    onChange={handleInputChange}
                    rows={3}
                    className="border-amber-200 focus:border-amber-500"
                    placeholder="Décrivez vos besoins en mobilier et aménagements sur mesure..."
                  />
                </div>

                {/* Choix techniques */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 border-b border-amber-200 pb-2">
                    Choix techniques
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ventilationIncluse"
                      name="ventilationIncluse"
                      checked={formData.ventilationIncluse}
                      onCheckedChange={(checked) => setFormData(prev => ({...prev, ventilationIncluse: checked}))}
                      className="border-amber-300"
                    />
                    <Label htmlFor="ventilationIncluse" className="cursor-pointer">
                      Ventilation incluse avec le bâtiment (habituel)
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-700 font-medium">Électricité</Label>
                    <RadioGroup 
                      value={formData.electricite} 
                      onValueChange={(value) => handleSelectChange('electricite', value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plan-integre" id="elec-integre" />
                        <Label htmlFor="elec-integre" className="cursor-pointer">Plan intégré</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plan-seulement" id="elec-plan" />
                        <Label htmlFor="elec-plan" className="cursor-pointer">Plan seulement</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sans" id="elec-sans" />
                        <Label htmlFor="elec-sans" className="cursor-pointer">Sans électricité</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-700 font-medium">Plomberie</Label>
                    <RadioGroup 
                      value={formData.plomberie} 
                      onValueChange={(value) => handleSelectChange('plomberie', value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="avec" id="plomb-avec" />
                        <Label htmlFor="plomb-avec" className="cursor-pointer">Avec plomberie</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plan-seulement" id="plomb-plan" />
                        <Label htmlFor="plomb-plan" className="cursor-pointer">Plan seulement</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sans" id="plomb-sans" />
                        <Label htmlFor="plomb-sans" className="cursor-pointer">Sans plomberie</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Matériaux & finitions */}
                <div className="space-y-2">
                  <Label htmlFor="materiaux" className="text-slate-700 font-medium">Matériaux & finitions</Label>
                  <Textarea
                    id="materiaux"
                    name="materiaux"
                    value={formData.materiaux}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-amber-200 focus:border-amber-500"
                    placeholder="Bois local, isolation naturelle, finitions écologiques, bardage en cèdre, toiture métallique..."
                  />
                </div>

                {/* Budget et délais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-slate-700 font-medium">Budget visé</Label>
                    <Input
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Ex: 10 000$ - 15 000$"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="echeancier" className="text-slate-700 font-medium">Échéancier souhaité</Label>
                    <Input
                      id="echeancier"
                      name="echeancier"
                      value={formData.echeancier}
                      onChange={handleInputChange}
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Ex: Printemps 2025, Urgent, Flexible"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="souplesse" className="text-slate-700 font-medium">Souplesse horaire / disponibilités</Label>
                  <Textarea
                    id="souplesse"
                    name="souplesse"
                    value={formData.souplesse}
                    onChange={handleInputChange}
                    rows={3}
                    className="border-amber-200 focus:border-amber-500"
                    placeholder="Weekends disponibles, soirées après 18h, horaires flexibles, vacances en juillet..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-700 font-medium">Message / idées personnelles *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="border-amber-200 focus:border-amber-500"
                    placeholder="Décrivez votre vision, vos inspirations, contraintes du terrain, besoins spécifiques, références qui vous plaisent..."
                  />
                </div>

                {/* Pièces jointes */}
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium">Pièces jointes (optionnel)</Label>
                  <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
                    <Upload className="w-8 h-8 text-amber-600 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Ajoutez vos esquisses, photos d'inspiration ou plans existants</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.dwg"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                        Choisir des fichiers
                      </Button>
                    </Label>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Fichiers sélectionnés :</p>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                          <span className="text-sm text-slate-600">{file.name}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consentement */}
                <div className="space-y-4 pt-6 border-t border-amber-100">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consentement"
                      name="consentement"
                      checked={formData.consentement}
                      onCheckedChange={(checked) => setFormData(prev => ({...prev, consentement: checked}))}
                      className="border-amber-300 mt-1"
                    />
                    <Label htmlFor="consentement" className="cursor-pointer text-sm text-slate-600 leading-relaxed">
                      J'accepte que mes données soient utilisées pour traiter ma demande de devis. 
                      Consultez notre <button type="button" className="text-amber-700 underline hover:text-amber-800">politique de confidentialité</button> pour plus d'informations.
                    </Label>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-5 w-5" />
                        Envoyer ma demande
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informations après envoi */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-lg font-medium text-slate-700">Que se passe-t-il après ?</span>
            </div>
            <div className="max-w-2xl mx-auto space-y-4 text-slate-600">
              <p>
                <strong>1. Confirmation :</strong> Vous recevrez un email de confirmation avec un résumé de votre demande.
              </p>
              <p>
                <strong>2. Analyse :</strong> Nous étudions votre projet sous tous les angles (faisabilité, contraintes, opportunités).
              </p>
              <p>
                <strong>3. Retour :</strong> Nous vous recontactons sous peu avec notre plan de match et une proposition détaillée.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Devis;