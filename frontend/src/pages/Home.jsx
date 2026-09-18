import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { approaches, processSteps } from '../data/mock';
import * as Icons from 'lucide-react';
import SEO from '../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [inspirationProjects, setInspirationProjects] = useState([]);
  const [featuredKits, setFeaturedKits] = useState([]);
  const [homepageServices, setHomepageServices] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [testimonials, setTestimonials] = useState([]);

  // Charger tout depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, reviewsRes, kitsRes, servicesRes, testimonialsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/projects?home_only=true&limit=100`),
          fetch(`${BACKEND_URL}/api/reviews`),
          fetch(`${BACKEND_URL}/api/products?featured=true`),
          fetch(`${BACKEND_URL}/api/content/homepage-services`),
          fetch(`${BACKEND_URL}/api/content/testimonials`)
        ]);
        const projData = await projRes.json();
        const reviewsData = await reviewsRes.json();
        const kitsData = await kitsRes.json();
        const servicesData = await servicesRes.json();
        const testimonialsData = await testimonialsRes.json();
        if (projData.success) setInspirationProjects(projData.data || []);
        if (kitsData.success) setFeaturedKits(kitsData.data || []);
        if (servicesData.success) setHomepageServices(servicesData.data || []);
        // Témoignages : priorité aux témoignages CMS, sinon reviews produit
        if (testimonialsData.success && testimonialsData.data?.length > 0) {
          setTestimonials(testimonialsData.data.map(r => ({
            name: r.name,
            project: r.role || r.location || 'Client',
            text: r.content || r.text,
            rating: r.rating || 5
          })));
        } else if (reviewsData.success && reviewsData.data?.length > 0) {
          setTestimonials(reviewsData.data.map(r => ({
            name: r.client_name || r.name,
            project: r.project_type || 'Projet',
            text: r.comment || r.text,
            rating: r.rating || 5
          })));
        }
      } catch (err) {
        // Silently handle - data will remain in default state
      } finally {
        setLoadingProjects(false);
      }
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  // Rotation automatique des images par catégorie toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const categories = getUniqueCategories();
      const newIndexes = {};
      
      categories.forEach(category => {
        const categoryProjects = inspirationProjects.filter(p => p.category === category);
        const currentIndex = currentImageIndex[category] || 0;
        newIndexes[category] = (currentIndex + 1) % categoryProjects.length;
      });
      
      setCurrentImageIndex(newIndexes);
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [currentImageIndex, inspirationProjects]);

  // Obtenir les catégories uniques
  const getUniqueCategories = () => {
    return [...new Set(inspirationProjects.map(p => p.category))];
  };

  // Obtenir un projet par catégorie (avec rotation)
  const getOneProjectPerCategory = () => {
    const categories = getUniqueCategories();
    return categories.map(category => {
      const categoryProjects = inspirationProjects.filter(p => p.category === category);
      const index = currentImageIndex[category] || 0;
      return categoryProjects[index];
    });
  };

  // Obtenir le nombre de projets par catégorie
  const getProjectCountByCategory = (category) => {
    return inspirationProjects.filter(p => p.category === category).length;
  };

  // Descriptions des catégories
  const getCategoryDescription = (category) => {
    const descriptions = {
      "Maison unifamiliale": "Inspirations pour résidences familiales complètes",
      "Chalet": "Idées pour refuges et chalets quatre saisons", 
      "Mini-maison": "Concepts d'habitations compactes et optimisées",
      "Extensions verrières solarium": "Inspirations d'agrandissements lumineux",
      "Autres dessins (ébénisterie)": "Idées d'aménagements et mobilier personnalisé",
      "Dessins techniques": "Plans de fabrication/construction avec dimensions précises, matériaux, détails constructifs pour entrepreneurs",
      "Dessins architecturaux": "Plans de conception esthétique avec disposition des pièces, style, présentation visuelle pour clients et permis"
    };
    return descriptions[category] || "Inspirations pour vos projets";
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
            backgroundImage: `url('https://customer-assets.emergentagent.com/job_c939612f-c018-47c9-949a-bf666b73ec90/artifacts/s0baspap_Copie%20de%20Copie%20de%20Abrisia.jpg')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Abrisia Plan
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-amber-100 font-light leading-relaxed">
            Des plans sur mesure, conçus pour votre réalité
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
              Nos services de dessin
            </h2>
            <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Plans professionnels conformes au Code du bâtiment du Québec et du Canada.
              <strong className="text-teal-800"> Jusqu'à 600m² de plancher (6000 pi²).</strong>
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
                  <p className="text-lg font-semibold text-teal-800">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/devis">
              <Button size="lg" className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-4 text-lg font-semibold rounded-full">
                Voir nos tarifs détaillés
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
                  <img src={kit.mainImage || kit.image} alt={kit.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
            {getOneProjectPerCategory().map((project) => (
              <Card 
                key={project.category} 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-stone-200 cursor-pointer bg-stone-50"
                onClick={() => handleCategoryClick(project.category)}
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-teal-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {getProjectCountByCategory(project.category)} projets
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-teal-800 transition-colors">
                    {project.category}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {getCategoryDescription(project.category)}
                  </p>
                </CardContent>
              </Card>
            ))}
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
              Comment ça marche ?
            </h2>
            <p className="text-xl text-slate-600">
              Un processus simple et transparent pour concrétiser votre projet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.id} className="text-center relative">
                {/* Connecteur */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-stone-200 -z-10">
                    <div className="w-full h-full bg-gradient-to-r from-teal-300 to-transparent"></div>
                  </div>
                )}
                
                {/* Étape */}
                <div className="bg-stone-50 p-8 rounded-2xl shadow-lg border border-stone-200 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-teal-800 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {step.id}
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
              Témoignages Clients
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
            Parlons-en ! Consultation gratuite pour donner vie à vos idées.
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