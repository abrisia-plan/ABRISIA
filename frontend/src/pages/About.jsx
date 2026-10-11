import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Home, Building2, LayoutGrid, Warehouse, MapPin, Layers, 
  PenTool, Eye, Ruler, FileCheck, Handshake, Globe, ShieldCheck, 
  Heart, Users, ArrowRight, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const About = () => {

  const competences = [
    {
      icon: <Home className="w-7 h-7 text-teal-700" />,
      title: "Habitations unifamiliales isolées",
      subtitle: "Maisons détachées",
      details: [
        "Superficie brute totale des planchers : Moins de 600 m² (~6 458 pi²)",
        "Hauteur maximale : 2 étages au-dessus du sol et 1 étage de sous-sol"
      ]
    },
    {
      icon: <Building2 className="w-7 h-7 text-teal-700" />,
      title: "Habitations multifamiliales",
      subtitle: "Duplex, Triplex, Quadruplex",
      details: [
        "Configuration : Maximum de 4 logements par bâtiment",
        "Superficie brute totale des planchers : 300 m² (3 229 pi²) au plus (~3 229 pi²)",
        "Hauteur maximale : 2 étages au-dessus du sol et 1 étage de sous-sol"
      ]
    },
    {
      icon: <LayoutGrid className="w-7 h-7 text-teal-700" />,
      title: "Habitations jumelées ou en rangée",
      subtitle: "Unifamiliales jumelées / rangées",
      details: [
        "Superficie brute totale des planchers : 300 m² (3 229 pi²) au plus pour le bâtiment",
        "Hauteur maximale : 2 étages au-dessus du sol et 1 étage de sous-sol"
      ]
    },
    {
      icon: <Warehouse className="w-7 h-7 text-teal-700" />,
      title: "Bâtiments commerciaux et industriels légers",
      subtitle: "Commerces, bureaux, ateliers",
      details: [
        "Superficie brute totale des planchers : 300 m² (3 229 pi²) au plus",
        "Hauteur maximale : 2 étages au-dessus du sol et 1 étage de sous-sol"
      ]
    }
  ];

  const livrables = [
    {
      icon: <MapPin className="w-6 h-6 text-teal-700" />,
      title: "Plan d'implantation projeté",
      desc: "Position prévue du bâtiment sur le terrain, dessinée à partir de votre certificat de localisation."
    },
    {
      icon: <Layers className="w-6 h-6 text-teal-700" />,
      title: "Fondation et vues en plan",
      desc: "Une représentation de la fondation (mesures approximatives, déterminées par l'entrepreneur), puis chaque étage avec les pièces, portes, fenêtres, appareils et mobilier de base."
    },
    {
      icon: <Eye className="w-6 h-6 text-teal-700" />,
      title: "Élévations des façades",
      desc: "Les 4 façades, avec les niveaux des planchers, la hauteur des murs et de la fondation, et le toit."
    },
    {
      icon: <PenTool className="w-6 h-6 text-teal-700" />,
      title: "Coupes et vue du toit",
      desc: "Coupe de mur et coupe transversale (composition des murs, des planchers et du toit), et vue en plan du toit."
    },
    {
      icon: <FileCheck className="w-6 h-6 text-teal-700" />,
      title: "Cartouche réglementaire",
      desc: "Identification professionnelle claire apposée sur l'ensemble des feuillets."
    }
  ];

  const avantages = [
    {
      icon: <Globe className="w-8 h-8 text-teal-700" />,
      title: "Services à distance, déplacement au besoin",
      desc: "Plus besoin de vous déplacer. Que vous soyez au Saguenay–Lac-Saint-Jean ou ailleurs dans le monde, nous collaborons efficacement par téléphone, courriel ou texto."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-teal-700" />,
      title: "Dans les limites de la loi",
      desc: "Les plans sont conçus selon les codes de construction en vigueur, dans les limites de la Loi sur les architectes du Québec, pour vous aider dans vos démarches de permis."
    },
    {
      icon: <Heart className="w-8 h-8 text-teal-700" />,
      title: "Approche personnalisée et à l'écoute",
      desc: "Chaque plan est unique. Nous prenons le temps de comprendre votre mode de vie, vos besoins réels et votre budget afin de concevoir un espace optimisé et fonctionnel."
    },
    {
      icon: <Users className="w-8 h-8 text-teal-700" />,
      title: "Franchise sur ce que demande votre projet",
      desc: "Si votre projet demande l'intervention d'un ingénieur ou d'un architecte, nous vous le disons dès le départ. Nos plans vous servent à faire vos démarches avec votre entrepreneur."
    }
  ];

  return (
    <div className="min-h-screen pt-20" data-testid="about-page">
      <SEO 
        title="Services de dessin en bâtiment"
        description="Abrisia Plan - Services professionnels de dessin en bâtiment et conception de plans architecturaux. Établie au Saguenay–Lac-Saint-Jean, services 100% à distance."
        path="/about"
      />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 tracking-tight" data-testid="about-hero-title">
            Services de dessin en bâtiment et conception de plans
          </h1>
          <div className="w-20 h-1 bg-teal-500 mx-auto mb-8"></div>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Abrisia Plan met à votre disposition l'expertise de professionnels du dessin en bâtiment 
            pour donner vie à vos projets résidentiels et commerciaux légers.
          </p>
        </div>
      </section>

      {/* Présentation */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-base text-slate-700 leading-relaxed">
            <p>
              Établie au <strong className="text-slate-900">Saguenay–Lac-Saint-Jean</strong>, notre équipe 
              offre des services de conception de plans <strong className="text-slate-900">à distance, avec déplacement au besoin</strong>, 
              ce qui nous permet de collaborer avec vous, où que vous soyez dans le monde.
            </p>
            <p>
              Nous réalisons des <strong className="text-slate-900">plans clairs</strong>, conçus selon les codes
              en vigueur, pour vous aider dans vos démarches de <strong className="text-teal-800">permis de construction
              ou de rénovation</strong> avec votre municipalité et votre entrepreneur.
            </p>
          </div>
        </div>
      </section>

      {/* Champs de compétence — Cadre légal */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" data-testid="competences-title">
              Ce que nous pouvons dessiner
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Au Québec, l'<strong>article 16.1 de la Loi sur les architectes</strong> permet de faire dessiner
              sans architecte les plans des bâtiments suivants, dans ces limites (après les travaux). Au-delà,
              un architecte est requis : nous vous le disons dès le départ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competences.map((comp) => (
              <Card key={comp.title} className="border-stone-200 hover:border-teal-300 hover:shadow-lg transition-all" data-testid={`competence-card-${comp.title.split(' ')[0].toLowerCase()}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {comp.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{comp.title}</h3>
                      <p className="text-sm text-teal-700 font-medium mb-3">{comp.subtitle}</p>
                      <ul className="space-y-2">
                        {comp.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Livrables techniques */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" data-testid="livrables-title">
              Nos livrables techniques
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              Chaque projet est conçu avec une précision millimétrique et comprend toutes les pièces 
              graphiques requises par les autorités locales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {livrables.map((liv) => (
              <Card key={liv.title} className="border-stone-200 hover:shadow-md transition-shadow group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-teal-50 group-hover:bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    {liv.icon}
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-2">{liv.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{liv.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration professionnelle & Gestion des structures complexes */}
      <section className="py-20 bg-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Structures complexes */}
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-teal-700/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Handshake className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="collaboration-title">
                Et les structures complexes ?
              </h2>
              <p className="text-slate-300 leading-relaxed text-base">
                Abrisia Plan n'est pas ingénieure en structure. Si votre projet comporte des éléments qui
                demandent l'intervention d'un ingénieur (par exemple des poutres d'acier de grande portée ou des
                colonnes de soutien complexes), <strong className="text-white">nous vous le disons dès le départ</strong>.
                Nos plans vous servent ensuite à faire vos démarches avec votre entrepreneur.
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-slate-700"></div>

          {/* Aménagement mécanique fonctionnel */}
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-teal-700/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Ruler className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4" data-testid="amenagement-mecanique-title">
                Emplacement des appareils
              </h3>
              <p className="text-slate-300 leading-relaxed text-base">
                Sur la vue en plan, nous indiquons l'emplacement des appareils (salle de bain, cuisine, buanderie)
                pour que votre plombier et votre électricien <strong className="text-white">comprennent tout de suite la distribution de l'espace</strong>
                et planifient leurs réseaux. En option, à un tarif à part, nous ajoutons un schéma de base de
                l'électricité (emplacement des prises, interrupteurs et luminaires). Le diamètre des tuyaux et le
                calcul des circuits restent le travail de votre plombier et de votre électricien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir Abrisia Plan */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" data-testid="pourquoi-title">
              Pourquoi choisir Abrisia Plan ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {avantages.map((av) => (
              <Card key={av.title} className="border-stone-200 hover:shadow-lg transition-shadow group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-teal-50 group-hover:bg-teal-100 rounded-xl flex items-center justify-center mb-5 transition-colors">
                    {av.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3">{av.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{av.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-gradient-to-r from-teal-800 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Un projet en tête ?
          </h2>
          <p className="text-base md:text-lg text-teal-100 mb-10 leading-relaxed">
            Parlons-en ! Consultation gratuite pour donner vie à vos idées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button size="lg" className="bg-white text-teal-800 hover:bg-teal-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300" data-testid="about-cta-devis">
                Demander un devis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-teal-800 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300" data-testid="about-cta-contact">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
