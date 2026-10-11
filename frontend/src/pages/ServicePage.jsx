import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, House, Expand, Warehouse, Building2, MapPin, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import SERVICE_PAGES from '../data/servicePages.json';

// Une page par type de plan (maison, chalet, mini-maison...).
// Le contenu vient de data/servicePages.json, aussi lu par scripts/prerender-seo.js.

const NOTE_PLANS =
  "Nos plans représentent votre projet pour vous aider à le visualiser et à vous situer selon vos désirs. Nous ne sommes pas le constructeur : les détails de construction sont déterminés par votre entrepreneur. Nos plans sont dessinés en mesures impériales (pieds et pouces).";

const ICONES = {
  'plan-de-maison': Home,
  'plan-de-mini-maison': House,
  'plan-agrandissement-maison': Expand,
  'plan-de-garage': Warehouse,
  'plan-de-plex': Building2,
};

const CartePlan = ({ to, Icone, titre, resume }) => (
  <Link
    to={to}
    className="group flex items-start gap-4 h-full bg-white border border-stone-200 rounded-xl p-4 hover:border-teal-600 hover:shadow-md transition"
  >
    <span className="shrink-0 w-11 h-11 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
      <Icone className="w-5 h-5" />
    </span>
    <span className="flex-1 min-w-0">
      <span className="block font-semibold text-slate-800 group-hover:text-teal-800">{titre}</span>
      <span className="block text-sm text-slate-600 mt-1">{resume}</span>
    </span>
    <ArrowRight className="shrink-0 w-4 h-4 mt-1 text-teal-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
  </Link>
);

const ServicePage = ({ slug }) => {
  const page = SERVICE_PAGES.find((p) => p.slug === slug);
  if (!page) return null;
  const autres = SERVICE_PAGES.filter((p) => p.slug !== slug);

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    description: page.description,
    serviceType: 'Dessin en bâtiment',
    provider: { '@type': 'ProfessionalService', name: 'Abrisia Plan', url: 'https://abrisia-plan.ca' },
    areaServed: [{ '@type': 'AdministrativeArea', name: 'Saguenay–Lac-Saint-Jean' }, { '@type': 'AdministrativeArea', name: 'Québec' }],
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50" data-testid={`service-page-${slug}`}>
      <SEO title={page.title} description={page.description} path={`/${page.slug}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(serviceData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqData)}</script>
      </Helmet>

      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.h1}</h1>
          <p className="text-lg text-teal-100">Dessinatrice en bâtiment au Saguenay–Lac-Saint-Jean, partout au Québec, à distance ou sur place au besoin.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-4 text-slate-700 leading-relaxed text-lg">
            {page.intro.map((t) => <p key={t}>{t}</p>)}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Ce que comprennent les plans</h2>
            {/* Même phrase dans seo/pages.js (pré-rendu) */}
            <p className="text-slate-600 mb-4">{NOTE_PLANS}</p>
            <ul className="space-y-3 text-slate-700">
              {page.contenu.map((c) => {
                const i = c.indexOf(' : ');
                return (
                  <li key={c} className="flex gap-3 bg-white border border-stone-200 rounded-lg p-4">
                    <span className="text-teal-700 font-bold">•</span>
                    <span>
                      {i > 0 ? (
                        <><strong className="text-slate-800">{c.slice(0, i)}</strong> : {c.slice(i + 3)}</>
                      ) : c}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Comment ça se passe</h2>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              {page.etapes.map((e) => <li key={e}>{e}</li>)}
            </ol>
          </div>

          {page.mesures && (
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Ce dont nous avons besoin</h2>
              <p className="text-slate-600 mb-4">Joignez ces éléments à votre demande de devis (photos, PDF ou croquis) :</p>
              <ul className="space-y-2 text-slate-700">
                {page.mesures.map((m) => <li key={m} className="flex gap-2"><span className="text-teal-700">•</span>{m}</li>)}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Questions fréquentes</h2>
            <div className="space-y-3">
              {page.faq.map(([q, a]) => (
                <details key={q} className="group bg-white border border-stone-200 rounded-lg p-5">
                  <summary className="cursor-pointer list-none flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-slate-800">{q}</h3>
                    <span className="text-teal-700 text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-slate-700 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="text-center bg-white border border-stone-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Parlez-nous de votre projet</h2>
            <p className="text-slate-600 mb-6">Le devis est gratuit : même si votre projet n'est pas encore décidé, demandez-le.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/devis" className="inline-block bg-teal-800 hover:bg-teal-900 text-white px-6 py-3 rounded-full font-semibold">
                Demander un devis gratuit
              </Link>
              <Link to="/collection" className="inline-block border border-teal-800 text-teal-800 hover:bg-teal-50 px-6 py-3 rounded-full font-semibold">
                Voir la Collection de plans
              </Link>
            </div>
          </div>

          <nav>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Nos autres plans</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {autres.map((p) => (
                <li key={p.slug}>
                  <CartePlan to={`/${p.slug}`} Icone={ICONES[p.slug] || Home} titre={p.h1} resume={p.resume} />
                </li>
              ))}
              <li>
                <CartePlan
                  to="/plans-maison-saguenay-lac-saint-jean"
                  Icone={MapPin}
                  titre="Plans de maison au Saguenay–Lac-Saint-Jean"
                  resume="Une dessinatrice en bâtiment de la région."
                />
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
};

export default ServicePage;
