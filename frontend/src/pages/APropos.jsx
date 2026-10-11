import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Maximize2, LayoutGrid, ChefHat, Armchair, Trees, Layers, Compass,
  PenTool, Lightbulb, Ruler, Hammer, ArrowRight, ChevronDown,
} from 'lucide-react';
import SEO from '../components/SEO';
import { FloorPlanDrawing, ElevationDrawing, FurnitureDrawing, BlueprintGrid } from '../components/PlanIllustrations';

// Vraies photos à ajouter quand elles seront prêtes (ex. '/noemie.jpg' dans frontend/public).
// En attendant : le logo pour la fondatrice et des dessins en traits pour les autres sections.
const FOUNDER_PHOTO = '/images/a-propos/noemie.jpg';
const STORY_PHOTO = null;      // espace de travail, table à dessin, croquis...
const LIBERTE_PHOTO = null;    // un aménagement ou un meuble conçu par Abrisia

const SERVICES = [
  { icon: Home, text: 'Conception et dessin de plans de maisons, chalets et mini-maisons' },
  { icon: Maximize2, text: "Plans d'agrandissement et de rénovation" },
  { icon: LayoutGrid, text: 'Aménagement et optimisation des espaces intérieurs' },
  { icon: ChefHat, text: 'Conception de cuisines, salles de bain et espaces de rangement' },
  { icon: Armchair, text: 'Plans de mobilier sur mesure' },
  { icon: Trees, text: 'Plans de structures extérieures et projets variés' },
  { icon: Layers, text: 'Développement de modèles et collections de plans' },
  { icon: Compass, text: 'Accompagnement dans la réflexion et la planification des étapes de votre projet' },
];

const Section = ({ eyebrow, title, children, className = '' }) => (
  <section className={`py-14 sm:py-20 ${className}`}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 mb-2">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">{title}</h2>
      <div className="space-y-4 text-lg text-slate-700 leading-relaxed">{children}</div>
    </div>
  </section>
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HERO_DEFAULT = {
  title: 'Chaque grand projet commence par une idée.',
  text: 'Découvrez ABRISIA-PLAN, un studio indépendant de conception et de dessin de plans sur mesure, pour les particuliers et les entrepreneurs.',
};

const APropos = () => {
  // Titre et introduction modifiables dans l'admin (Textes des pages → Autres pages)
  const [hero, setHero] = useState(HERO_DEFAULT);
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/content/pages/about`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        const c = data?.content || {};
        setHero({
          title: c.hero_title?.value || HERO_DEFAULT.title,
          text: c.hero_text?.value || HERO_DEFAULT.text,
        });
      })
      .catch(() => {});
  }, []);

  return (
  <div className="min-h-screen pt-20 bg-stone-50" data-testid="a-propos-page">
    <SEO
      title="À propos : Noémie et le studio ABRISIA-PLAN"
      description="ABRISIA-PLAN est un studio indépendant de conception et de dessin de plans sur mesure fondé par Noémie, au Québec : maisons, chalets, mini-maisons, rénovations, aménagements et mobilier."
      path="/a-propos"
    />

    {/* En-tête : papier à plan et dessin d'élévation */}
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 to-teal-950 text-white">
      <BlueprintGrid className="absolute inset-0 w-full h-full text-white/10" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid md:grid-cols-[1.2fr,1fr] gap-10 items-center">
        <div className="text-center md:text-left">
          <p className="text-teal-200 font-semibold tracking-widest uppercase text-sm mb-4">À propos</p>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">{hero.title}</h1>
          <p className="text-xl text-teal-100 leading-relaxed mb-8">{hero.text}</p>
          <a href="#qui-sommes-nous" className="inline-flex items-center gap-2 text-teal-100 hover:text-white font-medium">
            Découvrir notre histoire <ChevronDown className="w-5 h-5" />
          </a>
        </div>
        <ElevationDrawing className="w-full max-w-md mx-auto text-teal-100/90" />
      </div>
    </section>

    {/* 1. Qui sommes-nous */}
    <div id="qui-sommes-nous" />
    <Section eyebrow="Qui sommes-nous ?" title="Donnons forme à vos projets">
      <p>
        ABRISIA-PLAN transforme les idées en projets concrets, adaptés aux besoins, aux espaces,
        aux ambitions et à la réalité de chacun.
      </p>
      <p>
        Maison, chalet, mini-maison, agrandissement, rénovation, aménagement intérieur ou mobilier
        sur mesure : chaque projet mérite une réflexion personnalisée.
      </p>
      <p className="text-xl font-semibold text-teal-800 border-l-4 border-teal-600 pl-4">
        Nous croyons qu'il est possible de voir grand tout en avançant progressivement.
      </p>
      <p>
        Un projet peut commencer par une seule pièce, une transformation ou une idée qui prendra
        forme au fil du temps.
      </p>
    </Section>

    {/* L'histoire en image */}
    <section className="pb-14 sm:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden bg-teal-900 text-teal-100 shadow-lg">
          {STORY_PHOTO ? (
            <img src={STORY_PHOTO} alt="L'espace de travail d'ABRISIA-PLAN" className="w-full h-72 sm:h-96 object-cover" />
          ) : (
            <div className="relative h-72 sm:h-96 flex items-center justify-center">
              <BlueprintGrid className="absolute inset-0 w-full h-full text-white/10" />
              <FloorPlanDrawing className="relative h-full py-8" />
            </div>
          )}
        </div>
      </div>
    </section>

    {/* 2. La fondatrice */}
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[280px,1fr] gap-10 items-start">
        <div className="mx-auto md:mx-0 text-center">
          <div className="w-56 h-56 rounded-full overflow-hidden bg-stone-100 border-4 border-teal-100 shadow-lg flex items-center justify-center">
            {FOUNDER_PHOTO ? (
              <img src={FOUNDER_PHOTO} alt="Noémie, fondatrice d'ABRISIA-PLAN" className="w-full h-full object-cover" />
            ) : (
              <img src="/logo-abrisia.jpg" alt="Logo ABRISIA-PLAN" className="w-40 h-40 object-contain" />
            )}
          </div>
          <p className="mt-4 text-xl font-bold text-slate-900">Noémie</p>
          <p className="text-teal-700 font-medium">Fondatrice d'ABRISIA-PLAN</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 mb-2">La fondatrice</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Une passion devenue entreprise</h2>
          <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
            <p>
              ABRISIA-PLAN a été fondée par Noémie, passionnée par le dessin de plans, la conception
              et l'aménagement des espaces.
            </p>
            <p>
              L'entreprise est née de sa volonté de créer quelque chose à son image : un studio
              indépendant où la créativité, les solutions pratiques et l'évolution des projets
              occupent une place centrale.
            </p>
            <p>
              Avec des moyens limités, beaucoup de détermination et l'envie d'apprendre, elle a
              développé elle-même son environnement numérique, dont ce site Web, en s'appuyant sur
              les nouvelles technologies et l'intelligence artificielle. Son parcours montre qu'une
              idée peut évoluer pas à pas et devenir un projet entrepreneurial concret.
            </p>
            <p>
              Aujourd'hui, elle bâtit ABRISIA avec l'ambition d'en faire une entreprise moderne,
              capable d'évoluer, de collaborer avec différents professionnels et d'offrir une gamme
              grandissante de services et de collections.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Inspirations de Noémie (à la première personne) */}
    <section className="py-14 sm:py-20 bg-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 mb-2">Mes inspirations architecturales</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Le patrimoine comme point de départ</h2>
        <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
          <p>
            Je suis particulièrement inspirée par l'architecture de la Nouvelle-France, les maisons
            traditionnelles québécoises et les influences britanniques qui ont marqué notre patrimoine bâti.
          </p>
          <p>
            J'aime les constructions qui traversent le temps, les matériaux naturels, les détails soignés
            et les maisons qui possèdent une véritable personnalité. Les maisons ancestrales, les demeures
            de campagne et l'architecture patrimoniale occupent une place particulière dans mes inspirations.
          </p>
          <p>
            Toutefois, ma créativité ne s'arrête pas à ces préférences. J'aime découvrir de nouveaux styles,
            explorer des concepts contemporains et adapter chaque conception aux goûts, aux besoins et à la
            vision de mes clients.
          </p>
        </div>
        <blockquote className="mt-8 border-l-4 border-teal-600 pl-5">
          <p className="text-2xl font-semibold text-teal-900 leading-snug">
            « Mon inspiration vient du patrimoine, mais ma créativité reste ouverte à toutes les possibilités. »
          </p>
          <footer className="mt-2 text-slate-600">Noémie, fondatrice d'ABRISIA-PLAN</footer>
        </blockquote>
        <div className="grid grid-cols-3 gap-3 mt-10">
          {[
            { src: '/images/a-propos/maison-patrimoniale.jpg', alt: 'Maison patrimoniale québécoise en planches blanches' },
            { src: '/images/a-propos/foyer-ancestral.jpg', alt: 'Foyer ancestral avec boiseries et armoire intégrée' },
            { src: '/images/a-propos/mansarde.jpg', alt: 'Chambre sous les combles avec lucarne, murs de bois peints' },
          ].map(({ src, alt }) => (
            <img key={src} src={src} alt={alt} loading="lazy" className="w-full h-48 sm:h-80 object-cover rounded-xl shadow-sm" />
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">Patrimoine bâti du Québec, détails qui m'inspirent. Photos : Noémie</p>
      </div>
    </section>

    {/* Le territoire : photos prises par Noémie dans sa région */}
    <section className="py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 mb-2">Notre territoire</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Ancrée au Saguenay–Lac-Saint-Jean</h2>
        <p className="text-lg text-slate-700 leading-relaxed mb-8 max-w-3xl">
          ABRISIA est née ici, entre les rivières, les forêts et un patrimoine bâti qui a du caractère.
          Ce territoire inspire des plans pensés pour la réalité d'ici : nos hivers, notre lumière et nos paysages.
        </p>
        <img src="/images/a-propos/fjord.jpg" alt="Le fjord du Saguenay" loading="lazy"
          className="w-full h-56 sm:h-80 object-cover rounded-2xl shadow-md mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { src: '/images/a-propos/maisons-patrimoine.jpg', alt: 'Maisons patrimoniales en bardeaux de bois', pos: 'object-[30%_50%]' },
            { src: '/images/a-propos/coucher-soleil.jpg', alt: 'Coucher de soleil sur le fjord du Saguenay', pos: 'object-[50%_30%]' },
            { src: '/images/a-propos/chute-foret.jpg', alt: 'Chute au cœur de la forêt boréale', pos: 'object-center' },
            { src: '/images/a-propos/pins-automne.jpg', alt: 'Pins et couleurs d\'automne sur un sentier rocheux', pos: 'object-center' },
            { src: '/images/a-propos/rivage-dore.jpg', alt: 'Rivage du fjord à marée basse, lumière du soir', pos: 'object-center' },
            { src: '/images/a-propos/chute.jpg', alt: 'Chute et arc-en-ciel', pos: 'object-center' },
          ].map(({ src, alt, pos }) => (
            <img key={src} src={src} alt={alt} loading="lazy"
              className={`w-full h-56 sm:h-80 rounded-2xl object-cover shadow-md ${pos}`} />
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">Photos : Noémie, ABRISIA-PLAN</p>
      </div>
    </section>

    {/* 3. Services */}
    <section className="py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 mb-2">Nos services</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">Ce que nous concevons pour vous</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-slate-800 font-medium leading-snug">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Les services sont adaptés à la nature du mandat et aux limites professionnelles et
          réglementaires applicables. <Link to="/about" className="text-teal-700 underline">Voir nos services en détail</Link>.
        </p>
      </div>
    </section>

    {/* 4. Vos plans, votre liberté */}
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <PenTool className="w-5 h-5 text-teal-700" />
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Vos plans, votre liberté</p>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Un bon plan ouvre plusieurs possibilités</h2>
        <div className="rounded-2xl bg-stone-50 border border-stone-200 mb-8 overflow-hidden">
          {LIBERTE_PHOTO ? (
            <img src={LIBERTE_PHOTO} alt="Aménagement conçu par ABRISIA-PLAN" className="w-full h-64 sm:h-80 object-cover" />
          ) : (
            <FurnitureDrawing className="w-full h-64 sm:h-80 py-6 text-teal-800" />
          )}
        </div>
        <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
          <p>
            Vous rêvez d'une cuisine personnalisée, d'un meuble parfaitement adapté à un espace,
            d'une bibliothèque intégrée ou d'un rangement conçu pour vos besoins ? Nous vous
            accompagnons dans la conception de votre aménagement et la réalisation de plans sur mesure.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-semibold text-slate-900 mb-1">Notre rôle : concevoir et dessiner</p>
            <p className="text-base">
              ABRISIA n'est pas une entreprise d'ébénisterie et ne fabrique pas les meubles. Nous
              concevons et dessinons votre projet pour vous aider à visualiser le résultat et à
              préparer sa réalisation.
            </p>
          </div>
          <p>
            Vous pouvez ensuite présenter vos plans à différents ébénistes, fabricants ou
            entrepreneurs pour discuter de la faisabilité et obtenir des soumissions. Vous gardez
            ainsi la liberté de comparer, de choisir vos matériaux, de planifier les travaux et de
            mieux maîtriser votre budget.
          </p>
          <p className="text-base text-slate-600">
            Les plans de conception pourront nécessiter des vérifications ou des dessins de
            fabrication complémentaires par le professionnel choisi.
          </p>
        </div>
      </div>
    </section>

    {/* 5. Une étape à la fois */}
    <Section eyebrow="Une étape à la fois" title="Planifier l'ensemble, avancer à votre rythme">
      <p>
        Tous les projets ne doivent pas nécessairement être réalisés d'un seul coup. Nous vous
        permettons de planifier votre projet dans son ensemble, tout en gardant la possibilité de
        le réaliser progressivement.
      </p>
      <p>
        Transformer une pièce aujourd'hui, préparer un agrandissement futur ou concevoir une maison
        complète : notre approche privilégie la planification, la flexibilité et les décisions réfléchies.
      </p>
      <p className="text-xl font-semibold text-teal-800">Voir grand. Commencer quelque part. Avancer à son rythme.</p>
    </Section>

    {/* Une idée aujourd'hui, un projet demain : 3 étapes reliées */}
    <section className="py-14 sm:py-20 bg-teal-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12">Une idée aujourd'hui, un projet demain</h2>
        <ol className="relative grid sm:grid-cols-3 gap-10 sm:gap-6">
          <div className="hidden sm:block absolute top-8 left-[16.6%] right-[16.6%] border-t-2 border-dashed border-teal-300" aria-hidden="true" />
          {[
            { icon: Lightbulb, title: 'Imaginer', text: 'Vous nous partagez votre idée, vos besoins et vos inspirations.' },
            { icon: Ruler, title: 'Concevoir', text: 'Nous dessinons des plans clairs et précis, pensés pour votre réalité.' },
            { icon: Hammer, title: 'Réaliser à son rythme', text: 'Vous réalisez votre projet en une fois ou par étapes, avec les professionnels de votre choix.' },
          ].map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-800 text-white flex items-center justify-center shadow-md ring-8 ring-teal-50">
                <Icon className="w-7 h-7" />
              </div>
              <p className="mt-4 text-sm font-semibold text-teal-700">Étape {i + 1}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{title}</h3>
              <p className="mt-2 text-slate-700 max-w-xs">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* 6. Vision */}
    <Section eyebrow="Tournée vers l'avenir" title="Une entreprise qui grandit avec ses clients" className="bg-white">
      <p>
        ABRISIA-PLAN est une entreprise en développement qui souhaite continuer d'innover, de
        créer des modèles et des collections, et de développer des collaborations.
      </p>
      <p>
        Notre ambition : rendre les services de conception plus flexibles et permettre à nos
        clients de participer activement à l'évolution de leurs projets.
      </p>
    </Section>

    {/* Appel à l'action */}
    <section className="py-16 sm:py-20 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Vous avez un projet en tête ?</h2>
        <p className="text-lg text-teal-100 mb-8">
          Une pièce, une maison ou un meuble : parlons-en. Le devis est gratuit et sans engagement.
        </p>
        <Link
          to="/devis"
          className="inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-teal-50 px-8 py-4 rounded-full text-lg font-semibold transition-colors"
          data-testid="a-propos-cta-devis"
        >
          Parlez-nous de votre projet <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  </div>
  );
};

export default APropos;
