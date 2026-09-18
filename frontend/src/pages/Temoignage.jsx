import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Star, Send, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Temoignage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    rating: 5,
    comment: '',
    project_type: '',
    would_recommend: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_email || !formData.comment) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        throw new Error(data.detail || 'Erreur');
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'envoyer votre avis", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 pt-20">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardContent className="p-10">
            <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Merci pour votre avis !</h2>
            <p className="text-slate-600 mb-6">
              Votre temoignage sera publie apres validation par notre equipe.
            </p>
            <Button onClick={() => navigate('/')} className="bg-teal-700 hover:bg-teal-800" data-testid="back-home-btn">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour au site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-16">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-stone-200 bg-white">
            <img
              src="/logo-abrisia.jpg"
              alt="Logo Abrisia"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Laissez-nous votre avis</h1>
          <p className="text-slate-500 mt-2">Votre opinion compte pour nous et aide d'autres clients</p>
        </div>

        {/* Formulaire */}
        <Card className="shadow-lg border-stone-200" data-testid="review-form-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Votre nom *</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData(p => ({ ...p, client_name: e.target.value }))}
                    placeholder="Marie Tremblay"
                    required
                    className="mt-1"
                    data-testid="review-name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Votre courriel *</Label>
                  <Input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(p => ({ ...p, client_email: e.target.value }))}
                    placeholder="marie@email.com"
                    required
                    className="mt-1"
                    data-testid="review-email"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Type de projet</Label>
                <Input
                  value={formData.project_type}
                  onChange={(e) => setFormData(p => ({ ...p, project_type: e.target.value }))}
                  placeholder="Ex: Mini-maison, Chalet, Plans de fondation..."
                  className="mt-1"
                  data-testid="review-project-type"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 block mb-2">Votre note *</Label>
                <div className="flex gap-1" data-testid="review-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-10 h-10 ${star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Votre temoignage *</Label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Parlez-nous de votre experience avec Abrisia Plan..."
                  rows={5}
                  required
                  className="mt-1"
                  data-testid="review-comment"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-teal-700 hover:bg-teal-800 h-12 text-base font-semibold" data-testid="review-submit">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Envoyer mon avis</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-500 hover:text-teal-700">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour au site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Temoignage;
