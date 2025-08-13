import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { services } from '../data/mock';
import { Send, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Devis = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    typeProjet: '',
    services: [],
    description: '',
    budget: '',
    delai: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (serviceName, checked) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, serviceName]
        : prev.services.filter(s => s !== serviceName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi (sera remplacé par l'API réelle)
    setTimeout(() => {
      console.log('Demande de devis:', formData);
      toast({
        title: "Demande envoyée !",
        description: "Nous vous contacterons sous 24h pour discuter de votre projet.",
      });
      
      // Reset form
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        adresse: '',
        typeProjet: '',
        services: [],
        description: '',
        budget: '',
        delai: ''
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Demander un Devis
          </h1>
          <p className="text-xl text-amber-100 leading-relaxed">
            Décrivez-nous votre projet et recevez une estimation personnalisée sous 24h
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-amber-100">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <CardTitle className="text-2xl text-slate-800 text-center">
                Informations sur votre projet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informations personnelles */}
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
                      placeholder="Votre nom de famille"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom" className="text-slate-700 font-medium">Prénom *</Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-slate-700 font-medium">Téléphone *</Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="(514) 555-0123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Courriel *</Label>
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
                  <Label htmlFor="adresse" className="text-slate-700 font-medium">Adresse du projet</Label>
                  <Input
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="border-amber-200 focus:border-amber-500"
                    placeholder="Adresse où sera réalisé le projet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeProjet" className="text-slate-700 font-medium">Type de projet *</Label>
                  <Input
                    id="typeProjet"
                    name="typeProjet"
                    value={formData.typeProjet}
                    onChange={handleInputChange}
                    required
                    className="border-amber-200 focus:border-amber-500"
                    placeholder="Ex: Maison neuve, Extension, Rénovation, Chalet..."
                  />
                </div>

                {/* Services requis */}
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium text-lg">Services requis *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.name)}
                          onCheckedChange={(checked) => handleServiceChange(service.name, checked)}
                          className="border-amber-300"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`service-${service.id}`} 
                            className="font-medium text-slate-700 cursor-pointer"
                          >
                            {service.name}
                          </Label>
                          <p className="text-sm text-slate-500">{service.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Description détaillée du projet *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="border-amber-200 focus:border-amber-500"
                    placeholder="Décrivez votre projet en détail : dimensions, matériaux souhaités, particularités, contraintes du terrain, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-slate-700 font-medium">Budget approximatif</Label>
                    <Input
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Ex: 5000$ - 10000$"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delai" className="text-slate-700 font-medium">Délai souhaité</Label>
                    <Input
                      id="delai"
                      name="delai"
                      value={formData.delai}
                      onChange={handleInputChange}
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Ex: Dans 2 semaines, Urgent, Flexible"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-amber-100">
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
                        Envoyer ma demande de devis
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informations supplémentaires */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-lg font-medium text-slate-700">Devis gratuit et sans engagement</span>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Nous nous engageons à vous répondre sous 24h. Votre demande sera étudiée avec attention 
              et nous vous proposerons la solution la mieux adaptée à vos besoins et votre budget.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Devis;