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
        "Superficie brute totale des planchers : Moins de 300 m² (~3 229 pi²)",
        "Hauteur maximale : 2 étages au-dessus du sol et 1 étage de sous-sol"
      ]
    },
    {
      icon: <LayoutGrid className="w-7 h-7 text-teal-700" />,
      title: "Habitations jumelées ou en rangée",
      subtitle: "Unifamiliales jumelées / rangées",
      details: [
        "Superficie brute totale des planchers : Moins de 300 m² par unité",
        "Hauteur maximale : 2 étages au-dessus du sol et 1 étage de sous-sol"
      ]
    },
    {
      icon: <Warehouse className="w-7 h-7 text-teal-700" />,
      title: "Bâtiments commerciaux et industriels légers",
      subtitle: "Commerces, bureaux, ateliers",
      details: [
        "Superficie brute totale des planchers : Moins de 300 m²",
        "Hauteur maximale : 2 étages au-dessus du sol et 1 étage de sous-sol"
      ]
    }
  ];

  const livrables = [
    {
      icon: <MapPin className="w-6 h-6 text-teal-700" />,
      title: "Plan d'implantation",
      desc: "Positionnement stratégique du bâtiment selon les règles d'urbanisme."
    },
    {
      icon: <Layers className="w-6 h-6 text-teal-700" />,
      title: "Plans de fondations et de planchers",
      desc: "Aménagement intérieur détaillé et coté pour chaque niveau."
    },
    {
      icon: <Eye className="w-6 h-6 text-teal-700" />,
      title: "Élévations des façades",
      desc: "Représentation visuelle extérieure avec hauteurs et matériaux de revêtement."
    },
    {
      icon: <PenTool className="w-6 h-6 text-teal-700" />,
      title: "Coupes de mur et détails constructifs",
      desc: "Spécifications de l'enveloppe conformes aux codes du bâtiment en vigueur."
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
      title: "Flexibilité et services 100 % à distance",
      desc: "Plus besoin de vous déplacer. Que vous soyez au Saguenay–Lac-Saint-Jean ou ailleurs dans le monde, nous collaborons efficacement par visioconférence, courriel et partage d'écrans."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-teal-700" />,
      title: "Conformité réglementaire assurée",
      desc: "Les plans sont conçus dans le respect le plus strict des codes de construction en vigueur et des limites de la Loi sur les architectes du Québec, vous assurant un dossier solide pour vos demandes de permis."
    },
    {
      icon: <Heart className="w-8 h-8 text-teal-700" />,
      title: "Approche personnalisée et à l'écoute",
      desc: "Chaque plan est unique. Nous prenons le temps de comprendre votre mode de vie, vos besoins réels et votre budget afin de concevoir un espace optimisé et fonctionnel."
    },
    {
      icon: <Users className="w-8 h-8 text-teal-700" />,
      title: "Collaboration simplifiée avec les professionnels",
      desc: "Si un projet requiert l'intervention d'un ingénieur ou d'un architecte, Abrisia Plan prépare des fichiers techniques standardisés (CAO/DAO) qui s'intègrent parfaitement à leur flux de travail."
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
              offre des services de conception de plans <strong className="text-slate-900">entièrement à distance</strong>, 
              ce qui nous permet de collaborer avec vous, où que vous soyez dans le monde.
            </p>
            <p>
              Nous réalisons des <strong className="text-slate-900">dossiers techniques complets</strong>, optimisés 
              et rigoureusement conformes aux exigences réglementaires afin de simplifier et d'accélérer 
              l'obtention de vos <strong className="text-teal-800">permis de construction ou de rénovation</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Champs de compétence — Cadre légal */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" data-testid="competences-title">
              Nos champs de compétence autonomes
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Pour tous les projets situés dans la province de Québec, nos services s'inscrivent strictement 
              dans le cadre de l'<strong>article 16.1 de la Loi sur les architectes du Québec</strong>. 
              À ce titre, Abrisia Plan dispose du droit légal de concevoir, modifier et signer de manière 
              autonome les plans techniques pour les catégories suivantes :
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
                Collaboration professionnelle et gestion des structures complexes
              </h2>
              <p className="text-slate-300 leading-relaxed text-base">
                Pour les projets d'envergure ou les éléments structuraux spécifiques qui dépassent les 
                normes standards du Code du bâtiment (ex. : intégration de pieux de fondation, poutres 
                d'acier de grande portée, colonnes de soutien complexes), <strong className="text-white">Abrisia Plan collabore 
                directement avec des ingénieurs en structure</strong>. Nous concevons l'enveloppe globale de votre 
                projet et intégrons fidèlement leurs calculs et plans scellés à votre dossier technique 
                final pour garantir l'obtention de votre permis.
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
                Aménagement mécanique fonctionnel
              </h3>
              <p className="text-sm text-teal-400 font-medium mb-3">Plomberie et électricité</p>
              <p className="text-slate-300 leading-relaxed text-base">
                Lors de la conception de vos plans intérieurs, nous positionnons de manière stratégique 
                l'emplacement fonctionnel de vos appareils sanitaires, drains, panneaux électriques, prises 
                et sorties de ventilation. Cette planification permet aux entrepreneurs spécialisés 
                (plombiers, électriciens) de <strong className="text-white">comprendre immédiatement la distribution de l'espace</strong> et 
                de planifier efficacement le passage de leurs réseaux techniques sur le chantier.
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
