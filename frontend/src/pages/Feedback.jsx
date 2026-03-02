import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Star, Send, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Feedback = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const devisId = searchParams.get('devis');
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    comment: '',
    project_type: '',
    would_recommend: true
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez sélectionner une note en étoiles",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          rating,
          devis_id: devisId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast({
          title: "Merci ! 🎉",
          description: "Votre avis a été envoyé avec succès"
        });
      } else {
        throw new Error(data.detail || 'Erreur');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre avis. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Merci pour votre avis ! 🎉
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Votre retour est précieux et nous aide à améliorer nos services.
              Votre avis sera publié après validation.
            </p>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-amber-600 font-semibold mt-4">
              Vous avez donné {rating} étoile{rating > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-white">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Votre avis compte ! ⭐
          </h1>
          <p className="text-xl text-teal-100">
            Dites-nous comment s'est passé votre projet
          </p>
        </div>
      </section>

      {/* Formulaire */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-stone-50 border-b">
              <CardTitle className="text-center text-2xl text-slate-800">
                Partagez votre expérience
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Note en étoiles */}
                <div className="text-center">
                  <Label className="text-lg font-semibold text-slate-800 mb-4 block">
                    Comment évaluez-vous nos services ? *
                  </Label>
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    {rating === 0 && 'Cliquez sur les étoiles'}
                    {rating === 1 && '😞 Pas satisfait'}
                    {rating === 2 && '😐 Peut mieux faire'}
                    {rating === 3 && '🙂 Correct'}
                    {rating === 4 && '😊 Très bien'}
                    {rating === 5 && '🤩 Excellent !'}
                  </p>
                </div>

                {/* Informations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Votre nom *</Label>
                    <Input
                      id="name"
                      value={formData.client_name}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                      required
                      placeholder="Jean Tremblay"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Votre email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => handleInputChange('client_email', e.target.value)}
                      required
                      placeholder="jean@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Type de projet */}
                <div>
                  <Label htmlFor="project_type">Quel type de projet avez-vous réalisé ?</Label>
                  <select
                    id="project_type"
                    value={formData.project_type}
                    onChange={(e) => handleInputChange('project_type', e.target.value)}
                    className="w-full mt-1 h-10 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="mini-maison">Mini-maison</option>
                    <option value="chalet">Chalet</option>
                    <option value="maison">Maison unifamiliale</option>
                    <option value="extension">Extension / Agrandissement</option>
                    <option value="renovation">Rénovation</option>
                    <option value="ebenisterie">Ébénisterie</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Commentaire */}
                <div>
                  <Label htmlFor="comment">
                    Racontez-nous votre expérience *
                  </Label>
                  <p className="text-sm text-slate-500 mb-2">
                    Les plans étaient-ils à la hauteur de vos attentes ? Des difficultés rencontrées ?
                  </p>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) => handleInputChange('comment', e.target.value)}
                    required
                    placeholder="Partagez votre expérience avec Abrisia Plan..."
                    rows={5}
                    className="mt-1"
                  />
                </div>

                {/* Recommandation */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <Label className="text-base font-semibold text-slate-800 mb-4 block">
                    Recommanderiez-vous nos services ?
                  </Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={formData.would_recommend ? "default" : "outline"}
                      className={formData.would_recommend ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => handleInputChange('would_recommend', true)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Oui, absolument !
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.would_recommend ? "default" : "outline"}
                      className={!formData.would_recommend ? "bg-red-600 hover:bg-red-700" : ""}
                      onClick={() => handleInputChange('would_recommend', false)}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Non
                    </Button>
                  </div>
                </div>

                {/* Bouton envoi */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 text-lg"
                >
                  {isSubmitting ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer mon avis
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Feedback;
