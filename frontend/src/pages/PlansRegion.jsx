import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { FloorPlanDrawing } from '../components/PlanIllustrations';

// Page locale : plans de maison au Saguenay–Lac-Saint-Jean.
// Le même texte est repris dans seo/pages.js pour les robots : garder les deux semblables.

const VILLES = [
  'Saguenay (Chicoutimi, Jonquière, La Baie)', 'Alma', 'Roberval', 'Saint-Félicien', 'Dolbeau-Mistassini',
  'Saint-Honoré', 'Saint-Fulgence', "L'Anse-Saint-Jean", 'Métabetchouan–Lac-à-la-Croix', 'Desbiens',
  'Saint-Prime', 'Normandin',
];

const PROJETS = [
  ['Maisons unifamiliales', 'Plans complets de maison neuve, selon votre terrain, votre budget et votre façon de vivre.'],
  ['Chalets, camps et cabanes', 'Au bord du lac Saint-Jean, du fjord ou en forêt : plans adaptés à votre terrain et à votre usage.'],
  ['Mini-maisons', "Des espaces compacts et bien pensés, où chaque pied carré compte."],
  ['Agrandissements et garages', "Plans d'agrandissement, de garage, d'abri ou de solarium pour votre permis."],
];

const CONTENU = [
  "Plan d'implantation sur le terrain", 'Plan de fondation', 'Plans des étages, cotés',
  'Élévations des façades', 'Coupes de mur et détails de construction', 'Cartouche sur chaque feuille',
];

const ETAPES = [
  'Vous décrivez votre projet dans le formulaire de devis (photos, croquis et plans acceptés).',
  'Nous en discutons et préparons des croquis.',
  'Nous réalisons les plans détaillés.',
  "Nous vous accompagnons jusqu'au permis.",
];

const PlansRegion = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Plans de maison au Saguenay–Lac-Saint-Jean',
    serviceType: 'Dessin en bâtiment',
    provider: { '@type': 'ProfessionalService', name: 'Abrisia Plan', url: 'https://abrisia-plan.ca' },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Saguenay–Lac-Saint-Jean' },
      ...['Saguenay', 'Alma', 'Roberval', 'Saint-Félicien', 'Dolbeau-Mistassini'].map((name) => ({ '@type': 'City', name })),
    ],
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50" data-testid="plans-region-page">
      <SEO
        title="Plans de maison au Saguenay–Lac-Saint-Jean"
        description="Dessinatrice en bâtiment au Saguenay–Lac-Saint-Jean : plans de maison, de chalet, de mini-maison et d'agrandissement pour Chicoutimi, Jonquière, La Baie, Alma, Roberval, Saint-Félicien, Dolbeau-Mistassini et toute la région."
        path="/plans-maison-saguenay-lac-saint-jean"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Plans de maison au Saguenay–Lac-Saint-Jean</h1>
          <p className="text-lg text-teal-100">
            Un studio de dessin en bâtiment d'ici, pour vos projets d'ici : maisons, chalets, mini-maisons et agrandissements, prêts pour votre permis.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Abrisia Plan est établie au Saguenay–Lac-Saint-Jean. Nous préparons les plans de votre projet résidentiel,
                conçus selon le Code de construction du Québec, le Code national du bâtiment du Canada et les règlements
                de votre municipalité.
              </p>
              <p>
                Tout peut se faire à distance, par courriel, téléphone ou texto : pas besoin de vous déplacer.
              </p>
            </div>
            <FloorPlanDrawing className="w-full max-w-sm mx-auto text-teal-800" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Vos projets</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PROJETS.map(([titre, texte]) => (
                <div key={titre} className="bg-white border border-stone-200 rounded-lg p-5">
                  <h3 className="font-semibold text-slate-800 mb-1">{titre}</h3>
                  <p className="text-slate-600 text-sm">{texte}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Où travaillons-nous ?</h2>
            <p className="text-slate-700 mb-3">Partout dans la région, et ailleurs au Québec à distance :</p>
            <ul className="flex flex-wrap gap-2">
              {VILLES.map((v) => (
                <li key={v} className="bg-white border border-stone-200 rounded-full px-3 py-1 text-sm text-slate-700">{v}</li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Ce que contiennent nos plans</h2>
              <ul className="space-y-2 text-slate-700">
                {CONTENU.map((c) => <li key={c} className="flex gap-2"><span className="text-teal-700">•</span>{c}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Comment ça se passe</h2>
              <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                {ETAPES.map((e) => <li key={e}>{e}</li>)}
              </ol>
            </div>
          </div>

          <div className="text-center bg-white border border-stone-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Parlez-nous de votre projet</h2>
            <p className="text-slate-600 mb-6">Le devis est gratuit et sans engagement.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/devis" className="inline-block bg-teal-800 hover:bg-teal-900 text-white px-6 py-3 rounded-full font-semibold">
                Demander un devis gratuit
              </Link>
              <Link to="/faq" className="inline-block border border-teal-800 text-teal-800 hover:bg-teal-50 px-6 py-3 rounded-full font-semibold">
                Questions fréquentes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlansRegion;
