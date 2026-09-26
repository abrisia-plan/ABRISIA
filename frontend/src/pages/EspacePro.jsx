import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import {
  Briefcase, CheckCircle, ArrowRight, Building2, FileText,
  Users, Shield, Loader2, Phone, Mail, Send
} from 'lucide-react';
import SEO from '../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EspacePro = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company: '', contact_name: '', email: '', phone: '', message: ''
  });
  const [tarif, setTarif] = useState({ tarif_entrepreneur: '1,50', tarif_unite: '$ / pi²' });

  useEffect(() => {
    const loadTarif = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/content/pages/espace_pro`);
        const data = await res.json();
        if (data.success && data.content) {
          setTarif(prev => ({
            tarif_entrepreneur: data.content.tarif_entrepreneur?.value || prev.tarif_entrepreneur,
            tarif_unite: data.content.tarif_unite?.value || prev.tarif_unite
          }));
        }
      } catch (err) {
        console.error('Erreur chargement tarif pro:', err);
      }
    };
    loadTarif();
  }, []);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.contact_name || !formData.email) {
      toast({ title: "Champs requis", description: "Entreprise, nom et courriel sont obligatoires", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/pro-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formData.company,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast({ title: "Demande envoyée", description: "Nous vous contacterons dans les 24h." });
      } else {
        toast({ title: "Erreur", description: data.detail || "Veuillez réessayer.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Veuillez réessayer.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const advantages = [
    { icon: FileText, title: "Plans sur mesure", desc: "Plans architecturaux adaptés à vos projets de construction" },
    { icon: Users, title: "Partenariat dédié", desc: "Un dessinateur attitré qui connaît vos standards" },
    { icon: Shield, title: "Conformité garantie", desc: "Plans conformes au Code du bâtiment du Québec et du Canada" },
    { icon: Building2, title: "Volume avantageux", desc: `Tarif préférentiel de ${tarif.tarif_entrepreneur}${tarif.tarif_unite} pour les entrepreneurs réguliers` },
  ];

  return (
    <div className="min-h-screen pt-20">
      <SEO
        title="Espace Pro - Entrepreneurs"
        description="Espace dédié aux entrepreneurs et professionnels de la construction. Plans architecturaux sur mesure, tarifs préférentiels et partenariat dédié."
        path="/espace-pro"
      />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-teal-700/30 text-teal-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" />
            Espace Pro ABRISIA
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Votre partenaire en dessin architectural
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Vous êtes entrepreneur, constructeur ou promoteur immobilier ?
            Abrisia dessine les plans de vos projets avec précision et conformité.
          </p>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Pourquoi choisir Abrisia pour vos projets ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, idx) => (
              <Card key={idx} className="border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <adv.icon className="w-6 h-6 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{adv.title}</h3>
                  <p className="text-sm text-slate-600">{adv.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tarif Pro */}
      <section className="py-12 bg-gradient-to-r from-teal-700 to-teal-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-teal-200 text-sm font-medium mb-2">Tarif entrepreneur</p>
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-6xl font-bold" data-testid="pro-tarif-display">{tarif.tarif_entrepreneur}</span>
            <span className="text-2xl font-medium">{tarif.tarif_unite}</span>
          </div>
          <p className="text-teal-100 text-lg max-w-xl mx-auto mb-6">
            Un tarif préférentiel pour vos projets résidentiels.
            Contactez-nous pour une entente de partenariat sur mesure.
          </p>
          <a href="#contact-pro">
            <Button size="lg" className="bg-white text-teal-800 hover:bg-teal-50 font-semibold px-8 rounded-full" data-testid="pro-cta-btn">
              Devenir partenaire <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Ce que nous faisons / ne faisons pas */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-teal-200">
              <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Ce que fait Abrisia
              </h3>
              <ul className="space-y-3 text-slate-700">
                {[
                  "Dessin de plans architecturaux complets",
                  "Plans conformes au Code du bâtiment du Québec et du Canada",
                  "Dessins techniques de fabrication",
                  "Plans de mini-maisons, chalets, maisons",
                  "Plans d'agrandissement et rénovation",
                  "Accompagnement de permis de construction",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Là où notre mandat s'arrête
              </h3>
              <ul className="space-y-3 text-slate-700">
                {[
                  "Nous ne faisons PAS de construction",
                  "Nous ne supervisons pas les chantiers",
                  "Nous ne fournissons pas de matériaux",
                  "Nous ne sommes pas ingénieurs en structure",
                  "Les plans sont un guide — l'entrepreneur est responsable de l'exécution",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-4 h-4 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs mt-0.5 flex-shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de contact Pro */}
      <section className="py-16 bg-white" id="contact-pro">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">
            Devenir partenaire
          </h2>
          <p className="text-slate-600 text-center mb-8">
            Remplissez ce formulaire et un conseiller vous contactera pour établir un partenariat.
          </p>

          {submitted ? (
            <Card className="border-teal-200" data-testid="pro-form-success">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Demande reçue !</h3>
                <p className="text-slate-600 mb-6">Nous vous contacterons dans les prochaines 24 heures ouvrables.</p>
                <Link to="/">
                  <Button className="bg-teal-700 hover:bg-teal-800">Retour à l'accueil</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-lg" data-testid="pro-contact-form">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label>Nom de l'entreprise *</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData(f => ({ ...f, company: e.target.value }))}
                      placeholder="Construction ABC inc."
                      data-testid="pro-company"
                    />
                  </div>
                  <div>
                    <Label>Personne contact *</Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData(f => ({ ...f, contact_name: e.target.value }))}
                      placeholder="Jean Tremblay"
                      data-testid="pro-contact-name"
                    />
                  </div>
                  <div>
                    <Label>Courriel *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                      placeholder="jean@construction.ca"
                      data-testid="pro-email"
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                      placeholder="418-555-1234"
                      data-testid="pro-phone"
                    />
                  </div>
                  <div>
                    <Label>Décrivez vos besoins</Label>
                    <textarea
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                      value={formData.message}
                      onChange={(e) => setFormData(f => ({ ...f, message: e.target.value }))}
                      placeholder="Type de projets, volume annuel, besoins spécifiques..."
                      data-testid="pro-message"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-teal-700 hover:bg-teal-800"
                    disabled={loading}
                    data-testid="pro-submit-btn"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Envoyer ma demande
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> 418-XXX-XXXX</span>
            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> abrisia0plan@gmail.com</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EspacePro;
