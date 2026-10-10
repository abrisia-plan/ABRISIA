import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Maximize2, LayoutGrid, ChefHat, Armchair, Trees, Layers, Compass,
  PenTool, Footprints, Sparkles, ArrowRight,
} from 'lucide-react';
import SEO from '../components/SEO';

// Photo de la fondatrice : mettre l'adresse de la vraie photo ici quand elle sera prête
// (ex. '/noemie.jpg' dans frontend/public). En attendant, on affiche le logo.
const FOUNDER_PHOTO = null;

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

const APropos = () => (
  <div className="min-h-screen pt-20 bg-stone-50" data-testid="a-propos-page">
    <SEO
      title="À propos : Noémie et le studio ABRISIA-PLAN"
      description="ABRISIA-PLAN est un studio indépendant de conception et de dessin de plans sur mesure fondé par Noémie, au Québec : maisons, chalets, mini-maisons, rénovations, aménagements et mobilier."
      path="/a-propos"
    />

    {/* En-tête */}
    <section className="py-20 sm:py-28 bg-gradient-to-br from-teal-800 to-teal-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-teal-200 font-semibold tracking-widest uppercase text-sm mb-4">À propos</p>
        <h1 className="text-4xl sm:text-6xl font-bold mb-6">Donnons forme à vos projets.</h1>
        <p className="text-xl text-teal-100 leading-relaxed max-w-2xl mx-auto">
          Un studio indépendant de conception et de dessin de plans sur mesure,
          pour les particuliers et les entrepreneurs.
        </p>
      </div>
    </section>

    {/* 1. Qui sommes-nous */}
    <Section eyebrow="Qui sommes-nous ?" title="Des idées qui deviennent des projets concrets">
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
      <div className="grid sm:grid-cols-3 gap-4 pt-4">
        {[
          { icon: Sparkles, label: 'Voir grand.' },
          { icon: Footprints, label: 'Commencer quelque part.' },
          { icon: ArrowRight, label: 'Avancer à son rythme.' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="bg-teal-800 text-white rounded-xl p-5 text-center">
            <Icon className="w-6 h-6 mx-auto mb-2 text-teal-200" />
            <p className="font-semibold">{label}</p>
          </div>
        ))}
      </div>
    </Section>

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

export default APropos;
