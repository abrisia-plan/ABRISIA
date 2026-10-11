import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';

// Questions fréquentes : aussi données à Google en données structurées (FAQPage),
// ce qui l'aide à comprendre l'entreprise et à reprendre ces réponses.
const FAQS = [
  {
    q: "Qu'est-ce qu'une dessinatrice en bâtiment ?",
    a: "Une dessinatrice en bâtiment transforme une idée, un croquis ou des mesures en plans techniques précis, à l'échelle. Ces plans servent à obtenir le permis de construction auprès de la municipalité et guident l'entrepreneur sur le chantier. Abrisia Plan offre ce service pour les maisons, chalets, mini-maisons, agrandissements, garages et meubles sur mesure.",
  },
  {
    q: "Ai-je besoin d'un architecte pour faire les plans de ma maison ou de mon chalet ?",
    a: "Pas toujours. Au Québec, l'article 16.1 de la Loi sur les architectes permet de faire préparer les plans de plusieurs types de bâtiments sans architecte, par exemple une maison unifamiliale, un chalet, une mini-maison, un garage ou un agrandissement de petite taille. Au-delà de ces limites, un architecte est requis. En cas de doute, écrivez-nous : nous vous dirons si votre projet est couvert.",
  },
  {
    q: "Quels plans faut-il pour obtenir un permis de construction ?",
    a: "Les exigences varient selon la municipalité, mais on demande habituellement un plan d'implantation (que nous dessinons à partir de votre certificat de localisation), un plan de fondation, les plans des étages, les élévations des façades et une coupe du bâtiment montrant la composition des murs, des planchers et du toit. Informez-vous auprès de votre municipalité des documents demandés : nous préparons les plans en conséquence. Certaines municipalités exigent aussi un certificat d'implantation signé par un arpenteur-géomètre : ce document relève de l'arpenteur, pas de nous.",
  },
  {
    q: "Quels codes et normes vos plans respectent-ils ?",
    a: "Nos plans sont conçus selon le Code de construction du Québec (chapitre Bâtiment), basé sur le Code national du bâtiment du Canada, ainsi que selon les règlements de votre municipalité (zonage, marges, hauteur, etc.), que nous vous invitons à vérifier auprès d'elle.",
  },
  {
    q: "Que contient un plan de fondation ?",
    a: "Le plan de fondation est une représentation de la fondation selon le type choisi, pour vous aider à vous situer. Nous ne sommes pas le constructeur : les mesures sont approximatives et c'est l'entrepreneur qui les détermine. Sur une dalle, l'emplacement des appareils de plomberie y est indiqué.",
  },
  {
    q: "À quoi ressemblent les plans que je vais recevoir ?",
    a: "Vous recevez un ensemble de feuilles en PDF, prêtes à imprimer, dessinées à l'échelle. Chaque feuille comporte un cartouche (projet, adresse, titre, échelle, date et révisions), les dimensions, les notes de construction et la composition des murs, planchers et toits.",
  },
  {
    q: "Qu'est-ce qui n'est pas inclus dans vos services ?",
    a: "Abrisia Plan conçoit et dessine les plans. Les calculs de structure et les plans scellés relèvent d'un ingénieur, le certificat de localisation et le piquetage d'un arpenteur-géomètre, l'étude de sol et l'installation septique d'un technologue ou d'un ingénieur, et la construction d'un entrepreneur. La demande de permis est faite par le client auprès de sa municipalité.",
  },
  {
    q: "Quand devrais-je faire appel à vos services ?",
    a: "Avant de construire une maison, un chalet, une mini-maison, un garage ou un abri ; avant un agrandissement ou une rénovation qui touche aux murs ou à la structure ; quand votre municipalité demande des plans pour le permis ; quand un entrepreneur a besoin de plans ; ou avant d'acheter un terrain, pour vérifier que votre projet y est réalisable.",
  },
  {
    q: "Comment se déroule un projet avec Abrisia Plan ?",
    a: "1. Vous nous décrivez votre projet dans le formulaire de devis (vous pouvez joindre photos, croquis et plans). 2. Nous discutons avec vous, préparons des croquis et un devis. 3. Nous réalisons les plans détaillés. 4. Vous recevez vos plans en PDF, prêts à joindre à votre demande de permis.",
  },
  {
    q: "Travaillez-vous à distance ? Dans quelles régions ?",
    a: "Oui. La plupart des projets se font à distance, par téléphone, courriel ou texto, et nous pouvons nous déplacer dans certains cas. Nous sommes établis au Saguenay–Lac-Saint-Jean et travaillons partout au Québec.",
  },
  {
    q: "Combien coûtent des plans de maison ou de chalet ?",
    a: "Le prix dépend de la superficie, du nombre d'étages, de la complexité et des plans requis. Le devis est gratuit, même si votre projet n'est pas encore décidé : décrivez votre projet dans le formulaire de devis et nous vous répondons rapidement.",
  },
  {
    q: "Quelle est la différence entre un plan de la Collection et un plan sur mesure ?",
    a: "Les modèles de la Collection ABRISIA sont déjà dessinés : ils sont plus rapides à obtenir et plus abordables, et peuvent être personnalisés. Un plan sur mesure est conçu entièrement selon vos besoins, votre terrain et votre budget.",
  },
  {
    q: "Offrez-vous vos services aux entrepreneurs ?",
    a: "Oui. Notre Espace Pro offre la sous-traitance de dessin aux entrepreneurs en construction, pour leurs soumissions et leurs chantiers.",
  },
];

const FAQ = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50" data-testid="faq-page">
      <SEO
        title="Questions fréquentes : plans de maison, chalet et permis au Québec"
        description="Dessinatrice en bâtiment au Québec : faut-il un architecte, quels plans pour un permis, codes suivis, contenu d'un plan de fondation, prix et déroulement d'un projet."
        path="/faq"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Questions fréquentes</h1>
          <p className="text-lg text-teal-100">
            Plans de maison, chalet et mini-maison au Québec : tout ce qu'il faut savoir avant de commencer.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
              <summary className="cursor-pointer list-none flex justify-between items-start gap-4">
                <h2 className="text-lg font-semibold text-slate-800">{q}</h2>
                <span className="text-teal-700 text-xl leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-slate-700 leading-relaxed">{a}</p>
            </details>
          ))}

          <div className="text-center pt-8">
            <p className="text-slate-700 mb-4">Vous ne trouvez pas votre réponse ?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/devis" className="inline-block bg-teal-800 hover:bg-teal-900 text-white px-6 py-3 rounded-full font-semibold">
                Demander un devis gratuit
              </Link>
              <Link to="/contact" className="inline-block border border-teal-800 text-teal-800 hover:bg-teal-50 px-6 py-3 rounded-full font-semibold">
                Nous écrire
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
