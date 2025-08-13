import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { inspirationProjects, faqItems } from '../data/mock';
import { Eye, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inspiration = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const categories = ['Tous', 'Mini-maison', 'Chalet', 'Abris', 'Roulotte', 'Intérieur', 'Détails'];
  
  const filteredProjects = selectedCategory === 'Tous' 
    ? inspirationProjects 
    : inspirationProjects.filter(project => project.category === selectedCategory);

  const openProjectModal = (project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Inspiration
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Idées, ambiances, détails techniques inspirants.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === category 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-amber-100 cursor-pointer">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="rounded-full"
                        onClick={() => openProjectModal(project)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir plus
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6" onClick={() => openProjectModal(project)}>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-amber-700 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-slate-500">
                Aucun projet trouvé dans cette catégorie.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Bandeau "Vous aimez ce style ?" */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Vous aimez ce style ?
          </h2>
          <p className="text-xl text-amber-100 mb-8 leading-relaxed">
            Transformons votre inspiration en projet concret. Parlez-nous de vos idées !
          </p>
          <Link to="/devis">
            <Button size="lg" variant="secondary" className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
              Demander un devis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq) => (
              <Card key={faq.id} className="border-amber-100">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-amber-50 transition-colors"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3 className="font-semibold text-slate-800 pr-4">{faq.question}</h3>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      <Dialog open={!!selectedProject} onOpenChange={closeProjectModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
                  {selectedProject.title}
                </DialogTitle>
                <Badge className="w-fit bg-amber-100 text-amber-800">
                  {selectedProject.category}
                </Badge>
              </DialogHeader>
              
              <div className="space-y-6">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
                
                <div>
                  <p className="text-lg text-slate-700 mb-4">{selectedProject.description}</p>
                  <p className="text-sm text-slate-500 mb-6">
                    <strong>Dimensions :</strong> {selectedProject.dimensions}
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Détails techniques :</h4>
                  <ul className="space-y-2">
                    {selectedProject.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-slate-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link to="/devis" onClick={closeProjectModal}>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg font-semibold rounded-full">
                      Demander un devis pour ce style
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inspiration;