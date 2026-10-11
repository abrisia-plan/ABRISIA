// Contenu de chaque page, écrit directement dans le HTML au moment de la construction du site.
// Les robots qui ne lisent pas le JavaScript (Bing, ChatGPT, Perplexity, aperçus de liens)
// voient ainsi le bon titre, la bonne description et le texte principal de chaque page.
// Le site normal (React) remplace ce contenu dès qu'il démarre.
// Garder ces textes fidèles à ce qui est réellement affiché sur les pages.

const DEVIS = { href: '/devis', text: 'Demander un devis gratuit' };
const CONTACT = { href: '/contact', text: 'Nous écrire' };

const SERVICES = require('../src/data/servicePages.json');

const servicePages = SERVICES.map((p) => ({
  path: `/${p.slug}`,
  title: `${p.title} | Abrisia Plan`,
  description: p.description,
  h1: p.h1,
  sections: [
    { p: p.intro },
    { h2: 'Ce que comprennent les plans', list: p.contenu },
    { h2: 'Comment ça se passe', list: p.etapes },
    { h2: 'Questions fréquentes', list: p.faq.map(([q, a]) => `${q} ${a}`) },
  ],
  links: [DEVIS, ...SERVICES.filter((o) => o.slug !== p.slug).map((o) => ({ href: `/${o.slug}`, text: o.h1 }))],
}));

module.exports = [
  ...servicePages,
  {
    path: '/',
    title: 'Abrisia Plan | Plans de maison, chalet et mini-maison au Québec',
    description: "Abrisia Plan, dessinatrice en bâtiment au Saguenay–Lac-Saint-Jean : plans de maisons, chalets, mini-maisons, agrandissements et garages pour votre permis de construction, partout au Québec. Devis gratuit, 100 % à distance.",
    h1: 'Plans de maison, chalet et mini-maison au Québec',
    sections: [
      { p: ["Abrisia Plan conçoit et dessine les plans de votre projet résidentiel : maison unifamiliale, chalet, camp, mini-maison, agrandissement, garage, solarium et meubles sur mesure.", "Établie au Saguenay–Lac-Saint-Jean, nous travaillons 100 % à distance, partout au Québec. Nos plans sont conçus selon le Code de construction du Québec et le Code national du bâtiment du Canada, et selon les règlements de votre municipalité, pour votre demande de permis."] },
      { h2: 'Comment pouvons-nous vous aider ?', list: ["Je réalise mon projet : plans sur mesure de maison, chalet ou agrandissement.", "Je suis entrepreneur : sous-traitance de dessin pour vos soumissions et chantiers (Espace Pro).", "Je veux un modèle prêt : plans de la Collection ABRISIA, personnalisables."] },
    ],
    links: [DEVIS, ...SERVICES.map((o) => ({ href: `/${o.slug}`, text: o.h1 })), { href: '/collection', text: 'Voir la Collection de plans' }, { href: '/plans-maison-saguenay-lac-saint-jean', text: 'Plans de maison au Saguenay–Lac-Saint-Jean' }, { href: '/faq', text: 'Questions fréquentes' }],
  },
  {
    path: '/plans-maison-saguenay-lac-saint-jean',
    title: 'Plans de maison au Saguenay–Lac-Saint-Jean | Abrisia Plan',
    description: "Dessinatrice en bâtiment au Saguenay–Lac-Saint-Jean : plans de maison, de chalet, de mini-maison et d'agrandissement pour Chicoutimi, Jonquière, La Baie, Alma, Roberval, Saint-Félicien, Dolbeau-Mistassini et toute la région.",
    h1: 'Plans de maison au Saguenay–Lac-Saint-Jean',
    sections: [
      { p: ["Abrisia Plan est un studio de dessin en bâtiment établi au Saguenay–Lac-Saint-Jean. Nous préparons les plans de maisons, chalets, camps, mini-maisons, agrandissements et garages de la région, prêts pour la demande de permis à votre municipalité."] },
      { h2: 'Où travaillons-nous ?', p: ["Partout au Saguenay–Lac-Saint-Jean : Saguenay (Chicoutimi, Jonquière, La Baie), Alma, Roberval, Saint-Félicien, Dolbeau-Mistassini, Saint-Honoré, Saint-Fulgence, L'Anse-Saint-Jean, Métabetchouan–Lac-à-la-Croix, Desbiens, Saint-Prime, Normandin et les environs, ainsi qu'ailleurs au Québec, à distance."] },
      { h2: 'Ce que contiennent nos plans', list: ["Plan d'implantation sur le terrain", 'Plan de fondation', 'Plans des étages, cotés', 'Élévations des façades', 'Coupes de mur et détails de construction', 'Cartouche sur chaque feuille'] },
      { h2: 'Comment ça se passe', list: ['Vous décrivez votre projet dans le formulaire de devis (photos, croquis et plans acceptés).', 'Nous en discutons et préparons des croquis.', 'Nous réalisons les plans détaillés.', 'Vous recevez vos plans en PDF, prêts pour votre demande de permis.'] },
    ],
    links: [DEVIS, CONTACT, { href: '/faq', text: 'Questions fréquentes' }],
  },
  {
    path: '/a-propos',
    title: 'À propos : Noémie et le studio ABRISIA-PLAN | Abrisia Plan',
    description: "ABRISIA-PLAN est un studio indépendant de conception et de dessin de plans sur mesure fondé par Noémie, au Québec : maisons, chalets, mini-maisons, rénovations, aménagements et mobilier.",
    h1: 'Chaque grand projet commence par une idée.',
    sections: [
      { h2: 'Qui sommes-nous ?', p: ["ABRISIA-PLAN est un studio indépendant de conception et de dessin de plans sur mesure, fondé par Noémie et établi au Saguenay–Lac-Saint-Jean.", "Maisons, chalets, mini-maisons, rénovations, aménagements intérieurs et mobilier : nous donnons forme à vos projets, une étape à la fois."] },
    ],
    links: [{ href: '/devis', text: 'Parlez-nous de votre projet' }],
  },
  {
    path: '/about',
    title: 'Services de dessin en bâtiment | Abrisia Plan',
    description: "Services professionnels de dessin en bâtiment et conception de plans : habitations unifamiliales, multifamiliales (duplex, triplex, quadruplex), jumelées, en rangée et bâtiments commerciaux légers. Établie au Saguenay–Lac-Saint-Jean, 100 % à distance.",
    h1: 'Services de dessin en bâtiment',
    sections: [
      { h2: 'Types de bâtiments', list: ['Habitations unifamiliales isolées', 'Habitations multifamiliales : duplex, triplex, quadruplex', 'Habitations jumelées ou en rangée', 'Bâtiments commerciaux et industriels légers'] },
      { h2: 'Livrables', list: ["Plan d'implantation", 'Plans de fondations et de planchers', 'Élévations des façades', 'Coupes de mur et détails constructifs', 'Cartouche réglementaire'] },
      { h2: 'Pourquoi Abrisia Plan', list: ['Services 100 % à distance', 'Conformité aux codes de construction et à la Loi sur les architectes du Québec', 'Approche personnalisée', 'Fichiers CAO/DAO pour les ingénieurs et architectes'] },
    ],
    links: [DEVIS],
  },
  {
    path: '/faq',
    title: 'Questions fréquentes : plans de maison, chalet et permis au Québec | Abrisia Plan',
    description: "Dessinatrice en bâtiment au Québec : faut-il un architecte, quels plans pour un permis, codes suivis, contenu d'un plan de fondation, prix et déroulement d'un projet.",
    h1: 'Questions fréquentes',
    sections: [
      { list: ["Qu'est-ce qu'une dessinatrice en bâtiment ?", "Ai-je besoin d'un architecte pour faire les plans de ma maison ou de mon chalet ?", 'Quels plans faut-il pour obtenir un permis de construction ?', 'Quels codes et normes vos plans respectent-ils ?', 'Que contient un plan de fondation ?', 'Combien coûtent des plans de maison ou de chalet ?'] },
    ],
    links: [DEVIS, CONTACT],
  },
  {
    path: '/collection',
    title: 'Collection ABRISIA : plans de maisons et chalets prêts à construire | Abrisia Plan',
    description: 'Découvrez notre collection de modèles de plans. Mini-maisons, chalets, maisons. Choisissez un modèle, personnalisez-le et commandez en ligne.',
    h1: 'Collection ABRISIA',
    sections: [{ p: ['Des modèles de plans de maisons, chalets et mini-maisons déjà dessinés : plus rapides à obtenir, plus abordables, et personnalisables selon vos besoins.'] }],
    links: [DEVIS],
  },
  {
    path: '/inspiration',
    title: 'Inspirations : plans de maisons, chalets et mini-maisons | Abrisia Plan',
    description: 'Découvrez nos réalisations et projets d\'inspiration. Mini-maisons, chalets, maisons modernes et écologiques au Québec.',
    h1: "Galerie d'inspiration",
    sections: [{ p: ["Découvrez nos réalisations et trouvez l'inspiration pour votre projet : maisons, chalets, mini-maisons, solariums et ébénisterie."] }],
    links: [DEVIS],
  },
  {
    path: '/devis',
    title: 'Demander un devis | Abrisia Plan',
    description: 'Demandez un devis gratuit pour vos plans. Plans de mini-maison, chalet, maison unifamiliale, extension ou rénovation au Québec. Joignez photos, croquis et plans.',
    h1: 'Demander un devis gratuit',
    sections: [{ p: ['Décrivez votre projet, joignez vos photos, croquis ou plans, et indiquez comment vous préférez être contacté. Le devis est gratuit et sans engagement.'] }],
    links: [CONTACT],
  },
  {
    path: '/espace-pro',
    title: 'Espace Pro - Entrepreneurs | Abrisia Plan',
    description: 'Espace dédié aux entrepreneurs et professionnels de la construction. Sous-traitance de dessin et plans sur mesure pour vos soumissions et chantiers.',
    h1: 'Espace Pro : entrepreneurs',
    sections: [{ p: ['Sous-traitance de dessin pour les entrepreneurs en construction : plans pour vos soumissions et vos chantiers.'] }],
    links: [CONTACT],
  },
  {
    path: '/contact',
    title: 'Contact | Abrisia Plan',
    description: 'Contactez Abrisia Plan pour vos projets de plans de maison, chalet ou mini-maison. Établie au Saguenay–Lac-Saint-Jean, services partout au Québec.',
    h1: 'Contactez-nous',
    sections: [{ p: ['Courriel : abrisia0plan@gmail.com. Établie au Saguenay–Lac-Saint-Jean, nous travaillons à distance partout au Québec.'] }],
    links: [DEVIS],
  },
  {
    path: '/carrieres',
    title: 'Carrières : envoyer votre CV | Abrisia Plan',
    description: 'Dessinateur, technicien en architecture ou passionné de construction ? Envoyez votre CV à Abrisia Plan, au Saguenay–Lac-Saint-Jean.',
    h1: "Rejoignez l'équipe Abrisia",
    sections: [{ p: ['Vous êtes dessinateur, technicien en architecture ou passionné de construction ? Envoyez-nous votre CV.'] }],
    links: [],
  },
];
