import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { approaches, processSteps as defaultSteps } from '../data/mock';
import * as Icons from 'lucide-react';
import SEO from '../components/SEO';
import CardSlideshow from '../components/CardSlideshow';
import { resolveImageUrl } from '../services/api';
import useSiteSettings from '../hooks/useSiteSettings';

const HERO_IMAGE = 'https://customer-assets.emergentagent.com/job_c939612f-c018-47c9-949a-bf666b73ec90/artifacts/s0baspap_Copie%20de%20Copie%20de%20Abrisia.jpg';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const navigate = useNavigate();
  const site = useSiteSettings();
  const [rotationTick, setRotationTick] = useState(0);
  const [categories, setCategories] = useState([]);
  const [inspirationProjects, setInspirationProjects] = useState([]);
  const [featuredKits, setFeaturedKits] = useState([]);
  const [homepageServices, setHomepageServices] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [processSteps, setProcessSteps] = useState(defaultSteps);

  // Textes dynamiques de la page d'accueil
  const [homeTexts, setHomeTexts] = useState({
    hero_title: 'Abrisia Plan',
    hero_subtitle: 'Des espaces sur mesure, une vie à votre rythme',
    services_title: 'Nos services de dessin',
    process_title: 'Comment ça marche ?',
    process_subtitle: 'Un processus simple et transparent pour concrétiser votre projet'
  });

  // Charger tout depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, reviewsRes, kitsRes, servicesRes, testimonialsRes, pageContentRes, stepsRes, categoriesRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/projects?limit=100`),
          fetch(`${BACKEND_URL}/api/reviews`),
          fetch(`${BACKEND_URL}/api/products?featured=true`),
          fetch(`${BACKEND_URL}/api/homepage-services`),
          fetch(`${BACKEND_URL}/api/content/testimonials`),
          fetch(`${BACKEND_URL}/api/content/pages/home`),
          fetch(`${BACKEND_URL}/api/content/process-steps`),
          fetch(`${BACKEND_URL}/api/content/categories`)
        ]);
        const projData = await projRes.json();
        const reviewsData = await reviewsRes.json();
        const kitsData = await kitsRes.json();
        const servicesData = await servicesRes.json();
        const testimonialsData = await testimonialsRes.json();
        const pageData = await pageContentRes.json();
        const stepsData = await stepsRes.json();
        const categoriesData = await categoriesRes.json();
        // Catégories gérées dans l'admin (Catégories accueil) : nom, description, icône, ordre
        if (categoriesData.success && categoriesData.data?.length > 0) setCategories(categoriesData.data);
        // Étapes « Comment ça marche ? » modifiables dans l'admin
        if (stepsData.success && stepsData.data?.length > 0) setProcessSteps(stepsData.data);
        if (projData.success) setInspirationProjects(projData.data || []);
        if (kitsData.success) setFeaturedKits(kitsData.data || []);
        if (servicesData.success) setHomepageServices(servicesData.data || []);
        if (pageData.success && pageData.content) {
          setHomeTexts(prev => ({
            hero_title: pageData.content.hero_title?.value || prev.hero_title,
            hero_subtitle: pageData.content.hero_subtitle?.value || prev.hero_subtitle,
            services_title: pageData.content.services_title?.value || prev.services_title,
            process_title: pageData.content.process_title?.value || prev.process_title,
            process_subtitle: pageData.content.process_subtitle?.value || prev.process_subtitle
          }));
        }
        // Témoignages : priorité aux témoignages CMS, sinon reviews produit
        if (testimonialsData.success && testimonialsData.data?.length > 0) {
          // Champs enregistrés par l'admin : client_name, project_type, client_location, comment
          setTestimonials(testimonialsData.data.map(r => ({
            name: r.client_name || r.name,
            project: [r.project_type, r.client_location].filter(Boolean).join(' · ') || 'Client',
            text: r.comment || r.content || r.text,
            rating: r.rating || 5
          })).filter(t => t.name && t.text));
        } else if (reviewsData.success && reviewsData.data?.length > 0) {
          setTestimonials(reviewsData.data.map(r => ({
            name: r.client_name || r.name,
            project: r.project_type || 'Projet',
            text: r.comment || r.text,
            rating: r.rating || 5
          })));
        }
      } catch (err) {
        console.error('Erreur chargement données accueil:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  // Rotation automatique des images de chaque catégorie toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => setRotationTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  // Comparaison souple : « Chalet » correspond à « Chalet, camp, cabane à pêche »
  const normalize = (txt) => (txt || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const sameCategory = (catName, projectCategory) => {
    const a = normalize(catName);
    const b = normalize(projectCategory);
    return !!a && !!b && (a === b || a.includes(b) || b.includes(a));
  };

  // Cartes de la section « Inspirations par catégorie »
  const getCategoryCards = () => {
    if (categories.length > 0) {
      return categories.map((cat) => {
        // Toutes les inspirations visibles de la catégorie défilent toutes seules (5 chalets = 5 images)
        const projects = inspirationProjects.filter(p => sameCategory(cat.name, p.category));
        return {
          key: cat.id || cat.name,
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          image: cat.image,
          filter: projects[0]?.category || cat.name,
          projects,
        };
      });
    }
    // Secours : catégories tirées des projets
    return [...new Set(inspirationProjects.map(p => p.category))].map((name) => ({
      key: name, name, description: '', icon: '', filter: name,
      projects: inspirationProjects.filter(p => p.category === name),
    }));
  };

  // Navigation vers catégorie spécifique
  const handleCategoryClick = (category) => {
    navigate(`/inspiration?category=${encodeURIComponent(category)}`);
  };

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName] || Icons.Circle;
    return <IconComponent className="w-8 h-8 text-teal-800" />;
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Plans architecturaux, mini-maisons et chalets"
        description="Abrisia Plan - Service professionnel de conception et dessin de plans architecturaux au Québec. Collection de modèles prêts à acheter, devis personnalisés pour mini-maisons, chalets et maisons."
        path="/"
      />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Norwegian Fjord */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${site.hero_image || HERO_IMAGE}')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            {homeTexts.hero_title}
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-amber-100 font-light leading-relaxed">
            {homeTexts.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="#inspiration">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-800 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300">
                Voir l'inspiration
              </Button>
            </Link>
            <Link to="/devis">
              <Button size="lg" className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105">
                Demander un devis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parcours Client - Choisissez votre profil */}
      <section className="py-16 bg-white" data-testid="parcours-client">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-3">
            Quel est votre projet ?
          </h2>
          <p className="text-slate-600 text-center mb-10 text-base">
            Choisissez votre profil pour une expérience adaptée à vos besoins.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="group cursor-pointer border-2 border-slate-200 hover:border-teal-500 hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/devis')}
              data-testid="parcours-particulier"
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-50 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors">
                  <Icons.Home className="w-8 h-8 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Je réalise mon projet</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Vous avez un terrain et un rêve ? Obtenez un devis pour vos plans personnalisés.
                </p>
                <span className="inline-flex items-center text-teal-700 font-medium text-sm group-hover:gap-2 transition-all">
                  Demander un devis <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer border-2 border-slate-200 hover:border-slate-700 hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/espace-pro')}
              data-testid="parcours-entrepreneur"
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors">
                  <Icons.Briefcase className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Je suis entrepreneur</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Accédez à l'Espace Pro pour des tarifs préférentiels et un partenariat dédié.
                </p>
                <span className="inline-flex items-center text-slate-700 font-medium text-sm group-hover:gap-2 transition-all">
                  Espace Pro <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer border-2 border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/collection')}
              data-testid="parcours-collection"
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-50 group-hover:bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors">
                  <Icons.LayoutGrid className="w-8 h-8 text-amber-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Je veux un modèle prêt</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Parcourez notre Collection ABRISIA de modèles pré-dessinés, prêts à acheter.
                </p>
                <span className="inline-flex items-center text-amber-700 font-medium text-sm group-hover:gap-2 transition-all">
                  Voir la collection <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section "Ce qu'on fait" */}
      <section className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              {homeTexts.services_title}
            </h2>
            <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Des plans conçus selon les codes de construction en vigueur.
              <strong className="text-teal-800"> Services à distance partout au Québec, et sur place au besoin.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homepageServices.map((service) => (
              <Card 
                key={service.id} 
                className="group hover:shadow-xl transition-all duration-300 border-stone-200 hover:border-teal-300 bg-stone-50 cursor-pointer"
                onClick={() => navigate(`/devis${service.devis_category ? `?service=${encodeURIComponent(service.devis_category)}` : ''}`)}
                data-testid={`home-service-${service.id}`}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-teal-50 group-hover:bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                    {getIcon(service.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{service.name}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm mb-4">{service.description}</p>
                  {service.price && <p className="text-lg font-semibold text-teal-800">{service.price}</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/devis">
              <Button size="lg" className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-4 text-lg font-semibold rounded-full">
                Demander un devis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Collection ABRISIA - Modèles en vedette */}
      {featuredKits.length > 0 && (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Collection ABRISIA
            </h2>
            <p className="text-xl text-slate-600">
              Modèles pré-dessinés prêts à acheter
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredKits.map((kit) => (
              <Card key={kit.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-stone-200 cursor-pointer group" onClick={() => navigate('/collection')}>
                <div className="relative overflow-hidden h-56">
                  <CardSlideshow
                    images={[kit.mainImage || kit.image, ...(kit.galleryImages || [])].filter(Boolean).map(resolveImageUrl)}
                    alt={kit.name}
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-teal-800 transition-colors">{kit.name}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{kit.description}</p>
                  <p className="text-2xl font-bold text-teal-700">{typeof kit.price === 'number' ? `${kit.price.toFixed(2)} $` : kit.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/collection">
              <Button size="lg" className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-3 rounded-full text-lg">
                Voir toute la collection <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Section "Notre approche" */}
      <section className="py-20 bg-stone-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Notre approche
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {approaches.map((approach) => (
              <Card key={approach.id} className="text-center border-stone-200 hover:shadow-lg transition-shadow bg-stone-50">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    {getIcon(approach.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">{approach.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{approach.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Inspiration (teaser avec rotation par catégorie) */}
      <section id="inspiration" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Inspirations par catégorie
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Découvrez des idées et inspirations classées par type de projet
            </p>
          </div>

          {/* Grille des catégories avec une image rotative par catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {getCategoryCards().map((card) => {
              const project = card.projects.length ? card.projects[rotationTick % card.projects.length] : null;
              return (
              <Card 
                key={card.key} 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-stone-200 cursor-pointer bg-stone-50"
                onClick={() => handleCategoryClick(card.filter)}
              >
                <div className="relative overflow-hidden h-48">
                  {project ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : card.image ? (
                    <img
                      src={resolveImageUrl(card.image)}
                      alt={card.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-800 via-teal-700 to-stone-500 flex items-end p-5 relative overflow-hidden">
                      <svg viewBox="0 0 200 120" className="absolute right-3 top-3 w-32 h-20 text-white/15" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <path d="M20 110 V60 L70 20 L120 60 V110 Z" /><path d="M120 110 V70 L155 45 L190 70 V110" /><path d="M58 110 V80 H82 V110" />
                      </svg>
                      <span className="relative text-white text-lg font-semibold leading-tight">{card.name}</span>
                    </div>
                  )}
                  {card.projects.length > 0 && (
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {card.projects.length} projet{card.projects.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-teal-800 transition-colors">
                    {card.icon && <span className="mr-2" aria-hidden="true">{card.icon}</span>}
                    {card.name}
                  </h3>
                  {card.description && (
                    <p className="text-slate-600 text-sm leading-relaxed">{card.description}</p>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/inspiration">
              <Button size="lg" className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-4 text-lg font-semibold rounded-full">
                Voir toutes les inspirations par catégorie
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section "Comment ça marche ?" */}
      <section className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              {homeTexts.process_title}
            </h2>
            <p className="text-xl text-slate-600">
              {homeTexts.process_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.id || index} className="text-center relative">
                {/* Connecteur */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-stone-200 -z-10">
                    <div className="w-full h-full bg-gradient-to-r from-teal-300 to-transparent"></div>
                  </div>
                )}
                
                {/* Étape */}
                <div className="bg-stone-50 p-8 rounded-2xl shadow-lg border border-stone-200 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-teal-800 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
      <section className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Témoignages marquants
            </h2>
            <p className="text-xl text-slate-300">
              Ce que disent nos clients satisfaits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={testimonial.name + '-' + idx} className="bg-slate-700 border-slate-600 text-white hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={`star-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-200 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.project}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Bandeau CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-800 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Un projet en tête ?
          </h2>
          <p className="text-xl text-teal-100 mb-10 leading-relaxed">
            Parlons-en ! Donnons vie à vos idées.
          </p>
          <Link to="/devis">
            <Button size="lg" variant="secondary" className="bg-white text-teal-800 hover:bg-teal-50 px-12 py-4 text-xl font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
              Demander un devis
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;