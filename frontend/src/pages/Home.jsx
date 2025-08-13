import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { services, approaches, processSteps, inspirationProjects, testimonials } from '../data/mock';
import * as Icons from 'lucide-react';

const Home = () => {
  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName] || Icons.Circle;
    return <IconComponent className="w-8 h-8 text-amber-600" />;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511884642898-4c92249e20b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
          {/* Texture bois légère */}
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-900/20 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Abrisia – Plans
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-amber-100 font-light leading-relaxed">
            Des espaces sur mesure, une vie à votre rythme
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="#inspiration">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-800 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300">
                Voir l'inspiration
              </Button>
            </Link>
            <Link to="/devis">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105">
                Demander un devis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section "Ce qu'on fait" */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Ce qu'on fait
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Des espaces pensés pour vous, avec le savoir-faire traditionnel et les techniques modernes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className={`group hover:shadow-xl transition-all duration-300 border-amber-100 hover:border-amber-300 ${service.category === 'coming-soon' ? 'opacity-75' : ''}`}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-amber-100 group-hover:bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                    {getIcon(service.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">{service.name}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{service.description}</p>
                  {service.category === 'coming-soon' && (
                    <span className="inline-block mt-3 px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                      À venir
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section "Notre approche" */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Notre approche
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {approaches.map((approach) => (
              <Card key={approach.id} className="text-center border-amber-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    {getIcon(approach.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">{approach.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{approach.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bandeau accompagnement */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Accompagnement à l'autoconstruction</h3>
            <p className="text-lg text-green-100 mb-6">
              Calculs de matériaux, conseils techniques et suivi de chantier pour réaliser votre projet en toute sérénité.
            </p>
            <Link to="/devis">
              <Button size="lg" variant="secondary" className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-full">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Inspiration (teaser) */}
      <section id="inspiration" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Inspiration
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Idées, ambiances, détails techniques inspirants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {inspirationProjects.slice(0, 6).map((project) => (
              <Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-amber-100 cursor-pointer">
                <div className="relative overflow-hidden h-48">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-amber-700 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/inspiration">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
                Voir toute la galerie
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section "Comment ça marche ?" */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
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
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-amber-200 -z-10">
                    <div className="w-full h-full bg-gradient-to-r from-amber-300 to-transparent"></div>
                  </div>
                )}
                
                {/* Étape */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
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
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-slate-700 border-slate-600 text-white hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
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

      {/* Bandeau CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Un projet en tête ?
          </h2>
          <p className="text-xl text-amber-100 mb-10 leading-relaxed">
            Parlons-en ! Consultation gratuite pour donner vie à vos idées.
          </p>
          <Link to="/devis">
            <Button size="lg" variant="secondary" className="bg-white text-amber-700 hover:bg-amber-50 px-12 py-4 text-xl font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
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