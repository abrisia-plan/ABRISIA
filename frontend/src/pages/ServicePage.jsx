import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { FloorPlanDrawing } from '../components/PlanIllustrations';
import SERVICE_PAGES from '../data/servicePages.json';

// Une page par type de plan (maison, chalet, mini-maison...).
// Le contenu vient de data/servicePages.json, aussi lu par scripts/prerender-seo.js.

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
          <p className="text-lg text-teal-100">Dessinatrice en bâtiment au Saguenay–Lac-Saint-Jean, partout au Québec à distance.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-slate-700 leading-relaxed">
              {page.intro.map((t) => <p key={t}>{t}</p>)}
            </div>
            <FloorPlanDrawing className="w-full max-w-sm mx-auto text-teal-800" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Ce que comprennent les plans</h2>
              <ul className="space-y-2 text-slate-700">
                {page.contenu.map((c) => <li key={c} className="flex gap-2"><span className="text-teal-700">•</span>{c}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Comment ça se passe</h2>
              <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                {page.etapes.map((e) => <li key={e}>{e}</li>)}
              </ol>
            </div>
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
            <p className="text-slate-600 mb-6">Le devis est gratuit et sans engagement.</p>
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
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Nos autres plans</h2>
            <ul className="flex flex-wrap gap-2">
              {autres.map((p) => (
                <li key={p.slug}>
                  <Link to={`/${p.slug}`} className="inline-block bg-white border border-stone-200 rounded-full px-3 py-1 text-sm text-teal-800 hover:border-teal-600">
                    {p.h1}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/plans-maison-saguenay-lac-saint-jean" className="inline-block bg-white border border-stone-200 rounded-full px-3 py-1 text-sm text-teal-800 hover:border-teal-600">
                  Plans de maison au Saguenay–Lac-Saint-Jean
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
};

export default ServicePage;
