import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Leaf, Clock, Users, Heart, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      title: "Naturel & Écologique",
      description: "Matériaux locaux, techniques respectueuses de l'environnement, constructions durables qui s'intègrent harmonieusement dans leur environnement."
    },
    {
      icon: <Clock className="w-8 h-8 text-amber-600" />,
      title: "Minimalisme Réfléchi",
      description: "Des espaces optimisés sans superflu. Chaque élément a sa place et sa fonction pour une vie plus simple et apaisante."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Chaleur Humaine",
      description: "Des projets pensés pour le bien-être, créant des espaces où il fait bon vivre, se retrouver et créer des souvenirs."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Anti-Gaspillage",
      description: "Utilisation optimale des ressources, valorisation des matériaux de récupération, construction raisonnée et responsable."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Équité & Respect",
      description: "Tarification transparente, écoute active de vos besoins, respect de vos contraintes budgétaires et temporelles."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Innovation Accessible",
      description: "Techniques modernes rendues simples, solutions créatives pour tous les budgets, démocratisation du sur-mesure."
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            À propos
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            Une approche humaine de la construction, où tradition et innovation se rencontrent 
            pour créer des espaces qui vous ressemblent.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                Notre mission
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Chez Abrisia Plan, nous croyons que chacun mérite un espace qui lui ressemble, 
                  sans compromis sur la qualité ni sur l'accessibilité.
                </p>
                <p>
                  Notre approche allie le savoir-faire traditionnel québécois aux techniques 
                  modernes pour créer des constructions durables, belles et fonctionnelles.
                </p>
                <p>
                  Que ce soit pour une mini-maison, un chalet familial ou un simple abri de jardin, 
                  nous mettons la même passion et le même soin dans chaque projet.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Charpente traditionnelle"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Nos valeurs
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Ce qui guide chacune de nos décisions et chaque trait de crayon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={value.title} className="border-amber-100 hover:shadow-lg transition-shadow group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 group-hover:bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Atelier de travail"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                Équipe & fonctionnement
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-slate-800">Transmission inter-générations :</strong> Notre équipe 
                  réunit des maîtres-artisans expérimentés et de jeunes talents passionnés, 
                  créant un échange constant de savoirs et d'innovations.
                </p>
                <p>
                  <strong className="text-slate-800">Horaires libres :</strong> Nous fonctionnons avec des horaires 
                  flexibles qui respectent les rythmes de vie de chacun. Cette liberté se traduit 
                  par une créativité décuplée et un service plus attentionné.
                </p>
                <p>
                  <strong className="text-slate-800">Collaboration locale :</strong> Nous travaillons avec un réseau 
                  de partenaires locaux (ébénistes, charpentiers, plombiers, électriciens) 
                  partageant nos valeurs de qualité et de respect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Notre vision
          </h2>
          <div className="space-y-8 text-lg leading-relaxed">
            <p className="text-slate-300">
              <strong className="text-white">Plans de qualité :</strong> Chaque plan est unique, 
              pensé spécifiquement pour votre projet, vos contraintes et vos rêves.
            </p>
            <p className="text-slate-300">
              <strong className="text-white">Accompagnement personnalisé :</strong> De la première idée 
              à la finition, nous sommes là pour vous guider, conseiller et soutenir.
            </p>
            <p className="text-slate-300">
              <strong className="text-white">Ébénisterie à venir :</strong> Bientôt, nous proposerons 
              également du mobilier sur mesure pour compléter parfaitement vos espaces.
            </p>
          </div>
          
          <div className="mt-12">
            <Link to="/devis">
              <Button size="lg" variant="secondary" className="bg-white text-slate-800 hover:bg-slate-100 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
                Commencer votre projet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à créer ensemble ?
          </h2>
          <p className="text-xl text-amber-100 mb-8 leading-relaxed">
            Chaque grand projet commence par une conversation. 
            Parlons de vos idées, de vos contraintes et de vos rêves.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button size="lg" variant="secondary" className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-4 text-lg font-semibold rounded-full">
                Demander un devis
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-amber-700 px-8 py-4 text-lg font-semibold rounded-full">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;