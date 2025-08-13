import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi (sera remplacé par l'API réelle)
    setTimeout(() => {
      console.log('Message de contact:', formData);
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      
      // Reset form
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Contactez-nous
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Une question sur nos services ? Un projet à discuter ? Nous sommes là pour vous aider.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informations de contact */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">
                  Parlons de votre projet
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Chez Abrisia Plan, chaque projet est unique. Contactez-nous pour discuter 
                  de vos besoins et découvrir comment nous pouvons vous accompagner dans la 
                  réalisation de vos plans.
                </p>
              </div>

              {/* Coordonnées */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Adresse</h3>
                    <p className="text-slate-600">
                      Québec, Canada<br />
                      Service disponible dans tout le Québec
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Téléphone</h3>
                    <p className="text-slate-600">
                      <a href="tel:+15145550123" className="hover:text-amber-600 transition-colors">
                        +1 (514) 555-0123
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Courriel</h3>
                    <p className="text-slate-600">
                      <a href="mailto:abrisia0plan@gmail.com" className="hover:text-amber-600 transition-colors">
                        abrisia0plan@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Heures d'ouverture</h3>
                    <div className="text-slate-600 space-y-1">
                      <p>Lundi - Vendredi : 8h00 - 18h00</p>
                      <p>Samedi : 9h00 - 15h00</p>
                      <p>Dimanche : Sur rendez-vous</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone de service */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-800 mb-3">Zone de service</h3>
                <p className="text-slate-600 leading-relaxed">
                  Nous offrons nos services de dessin de plans dans tout le Québec. 
                  Des consultations virtuelles sont également disponibles pour les projets à distance.
                </p>
              </div>
            </div>

            {/* Formulaire de contact */}
            <Card className="shadow-xl border-amber-100">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
                <CardTitle className="text-2xl text-slate-800">
                  Envoyez-nous un message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nom" className="text-slate-700 font-medium">Nom complet *</Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Votre nom et prénom"
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

                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-slate-700 font-medium">Téléphone</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="sujet" className="text-slate-700 font-medium">Sujet *</Label>
                    <Input
                      id="sujet"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleInputChange}
                      required
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Ex: Question sur vos services, Demande d'information..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700 font-medium">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="border-amber-200 focus:border-amber-500"
                      placeholder="Décrivez votre demande ou votre projet..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-5 w-5" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section FAQ rapide */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-amber-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Combien de temps pour recevoir mes plans ?
                </h3>
                <p className="text-slate-600">
                  Le délai varie selon la complexité du projet, généralement entre 1 à 3 semaines 
                  après validation du devis.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Proposez-vous des modifications ?
                </h3>
                <p className="text-slate-600">
                  Oui, nous incluons jusqu'à 2 révisions dans nos forfaits. 
                  Des modifications supplémentaires peuvent s'appliquer.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Travaillez-vous à distance ?
                </h3>
                <p className="text-slate-600">
                  Absolument ! Nous pouvons travailler avec des clients partout au Québec 
                  grâce aux consultations virtuelles.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Quels formats de plans livrez-vous ?
                </h3>
                <p className="text-slate-600">
                  Nous livrons les plans en PDF haute résolution et en format DWG 
                  pour les professionnels de la construction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;