import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Upload, Send, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Carrieres = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', message: '' });
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      toast({ title: "CV requis", description: "Veuillez joindre votre CV", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('nom', formData.nom);
      data.append('email', formData.email);
      data.append('telephone', formData.telephone);
      data.append('message', formData.message);
      data.append('cv', cvFile);

      const res = await fetch(`${BACKEND_URL}/api/employees/candidature`, { method: 'POST', body: data });
      const result = await res.json();

      if (result.success) {
        setSubmitted(true);
        toast({ title: "Candidature envoyée !", description: "Nous vous contacterons bientôt." });
      } else {
        throw new Error(result.detail || 'Erreur');
      }
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 bg-stone-100 flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 shadow-xl bg-stone-50">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Merci pour votre candidature !</h2>
            <p className="text-slate-600">Nous avons bien reçu votre CV. Nous vous contacterons si votre profil correspond à nos besoins.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-100" data-testid="carrieres-page">
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Rejoignez l'équipe Abrisia</h1>
          <p className="text-lg text-teal-100">Vous êtes dessinateur, technicien en architecture ou passionné de construction ? Envoyez-nous votre CV.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-xl border-stone-200 bg-stone-50" data-testid="cv-form-card">
            <CardHeader className="bg-stone-100 border-b border-stone-200">
              <CardTitle className="text-xl text-slate-800 flex items-center">
                <Send className="w-5 h-5 mr-2 text-teal-700" />
                Envoyer votre candidature
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom complet *</Label>
                    <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required placeholder="Votre nom" className="bg-white" data-testid="cv-nom-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Courriel *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="votre@courriel.ca" className="bg-white" data-testid="cv-email-input" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="514-000-0000" className="bg-white" data-testid="cv-phone-input" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Décrivez votre expérience, vos compétences..." rows={4} className="bg-white" data-testid="cv-message-input" />
                </div>

                <div className="space-y-2">
                  <Label>CV (PDF) *</Label>
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('cv-upload').click()}>
                    <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={(e) => setCvFile(e.target.files[0])} data-testid="cv-file-input" />
                    {cvFile ? (
                      <div className="flex items-center justify-center space-x-2 text-teal-700">
                        <FileText className="w-6 h-6" />
                        <span className="font-medium">{cvFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-slate-500">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p>Cliquez pour joindre votre CV</p>
                        <p className="text-sm text-slate-400">PDF, DOC ou DOCX</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 text-lg font-semibold rounded-lg"
                  disabled={isSubmitting} data-testid="cv-submit-button">
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Carrieres;
