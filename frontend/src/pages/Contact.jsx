import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Mail, Clock, Send, Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Contact = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('message');
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', sujet: '', message: '' });
  const [cvData, setCvData] = useState({ nom: '', email: '', telephone: '', message: '' });
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvSubmitted, setCvSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCvChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({ title: "Message envoyé !", description: "Nous vous répondrons dans les plus brefs délais." });
      setFormData({ nom: '', email: '', telephone: '', sujet: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCvSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      toast({ title: "CV requis", description: "Veuillez joindre votre CV", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('nom', cvData.nom);
      data.append('email', cvData.email);
      data.append('telephone', cvData.telephone);
      data.append('message', cvData.message);
      data.append('cv', cvFile);
      const res = await fetch(`${BACKEND_URL}/api/employees/candidature`, { method: 'POST', body: data });
      const result = await res.json();
      if (result.success) {
        setCvSubmitted(true);
        toast({ title: "Candidature envoyée !", description: "Merci, nous vous contacterons." });
      } else {
        throw new Error(result.detail || 'Erreur');
      }
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50" data-testid="contact-page">
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-lg text-teal-100">Une question ? Un projet ? Envoyez-nous un message ou votre CV.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Infos contact */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Parlons de votre projet</h2>
                <p className="text-slate-600 leading-relaxed">
                  Chaque projet est unique. Contactez-nous pour discuter de vos besoins.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Adresse</h3>
                    <p className="text-slate-600">Québec, Canada — Service dans tout le Québec</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Courriel</h3>
                    <a href="mailto:abrisia0plan@gmail.com" className="text-teal-700 hover:underline">abrisia0plan@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Disponibilité</h3>
                    <p className="text-slate-600">Lun-Jeu : 8h-16h | Ven-Sam-Dim : sur rendez-vous</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-100 rounded-lg p-5">
                <h3 className="font-semibold text-slate-800 mb-2">Zone de service</h3>
                <p className="text-slate-600 text-sm">Nous offrons nos services dans tout le Québec. Consultations virtuelles disponibles.</p>
              </div>
            </div>

            {/* Formulaires avec onglets */}
            <div>
              <div className="flex mb-6 bg-stone-100 rounded-lg p-1" data-testid="contact-tabs">
                <button
                  onClick={() => setActiveTab('message')}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'message' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  data-testid="tab-message"
                >
                  Envoyer un message
                </button>
                <button
                  onClick={() => setActiveTab('cv')}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'cv' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  data-testid="tab-cv"
                >
                  Envoyer un CV
                </button>
              </div>

              {activeTab === 'message' && (
                <Card className="shadow-xl border-stone-200" data-testid="contact-form-card">
                  <CardHeader className="bg-stone-50 border-b border-stone-200">
                    <CardTitle className="text-xl text-slate-800">Envoyez-nous un message</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="nom">Nom complet *</Label>
                          <Input id="nom" name="nom" value={formData.nom} onChange={handleInputChange} required placeholder="Votre nom" className="bg-white border-stone-300" data-testid="contact-nom" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email">Courriel *</Label>
                          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="votre@courriel.ca" className="bg-white border-stone-300" data-testid="contact-email" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input id="telephone" name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="514-000-0000" className="bg-white border-stone-300" data-testid="contact-phone" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sujet">Sujet *</Label>
                        <Input id="sujet" name="sujet" value={formData.sujet} onChange={handleInputChange} required placeholder="Votre sujet" className="bg-white border-stone-300" data-testid="contact-sujet" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={5} placeholder="Décrivez votre demande..." className="bg-white border-stone-300" data-testid="contact-message" />
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 text-lg rounded-lg" data-testid="contact-submit">
                        {isSubmitting ? 'Envoi...' : <><Send className="mr-2 h-5 w-5" /> Envoyer</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'cv' && (
                cvSubmitted ? (
                  <Card className="shadow-xl border-stone-200">
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-6" />
                      <h2 className="text-2xl font-bold text-slate-800 mb-4">Merci !</h2>
                      <p className="text-slate-600">Votre candidature a été envoyée. Nous vous contacterons si votre profil correspond à nos besoins.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-xl border-stone-200" data-testid="cv-form-card">
                    <CardHeader className="bg-stone-50 border-b border-stone-200">
                      <CardTitle className="text-xl text-slate-800">Envoyez votre CV</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-slate-500 mb-4 text-sm">Vous êtes dessinateur ou technicien en architecture ? Joignez-vous à notre équipe.</p>
                      <form onSubmit={handleCvSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label>Nom complet *</Label>
                            <Input name="nom" value={cvData.nom} onChange={handleCvChange} required placeholder="Votre nom" className="bg-white border-stone-300" data-testid="cv-nom" />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Courriel *</Label>
                            <Input name="email" type="email" value={cvData.email} onChange={handleCvChange} required placeholder="votre@courriel.ca" className="bg-white border-stone-300" data-testid="cv-email" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Téléphone</Label>
                          <Input name="telephone" value={cvData.telephone} onChange={handleCvChange} placeholder="514-000-0000" className="bg-white border-stone-300" data-testid="cv-phone" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Message (optionnel)</Label>
                          <Textarea name="message" value={cvData.message} onChange={handleCvChange} placeholder="Votre expérience, compétences..." rows={3} className="bg-white border-stone-300" data-testid="cv-message" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>CV (PDF) *</Label>
                          <div className="border-2 border-dashed border-stone-300 rounded-lg p-5 text-center hover:border-teal-500 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('cv-upload').click()}>
                            <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" className="hidden"
                              onChange={(e) => setCvFile(e.target.files[0])} data-testid="cv-file-input" />
                            {cvFile ? (
                              <div className="flex items-center justify-center space-x-2 text-teal-700">
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">{cvFile.name}</span>
                              </div>
                            ) : (
                              <div className="text-slate-400">
                                <Upload className="w-7 h-7 mx-auto mb-1" />
                                <p className="text-sm">Cliquez pour joindre votre CV</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 text-lg rounded-lg" data-testid="cv-submit">
                          {isSubmitting ? 'Envoi...' : <><Upload className="mr-2 h-5 w-5" /> Envoyer ma candidature</>}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
