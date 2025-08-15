import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Eye, ArrowRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService, handleApiError } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { faqItems, inspirationProjects } from '../data/mock';

const Inspiration = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(['Tous']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProjectsLocal();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Utilisation des données mock pour les nouvelles images
      const localCategories = ['Tous', ...new Set(inspirationProjects.map(p => p.category))];
      setCategories(localCategories);
      
      // Charger les projets initiaux
      loadProjectsLocal();
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectsLocal = () => {
    try {
      let filteredProjects = inspirationProjects;
      
      if (selectedCategory !== 'Tous') {
        filteredProjects = inspirationProjects.filter(p => p.category === selectedCategory);
      }
      
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    }
  };

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
            Nos réalisations et idées pour vos constructions permanentes sur fondations.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === category 
                    ? 'bg-teal-800 hover:bg-teal-900 text-white' 
                    : 'border-stone-300 text-teal-700 hover:bg-stone-50'
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <Card key={project.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-stone-200 cursor-pointer">
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        }}
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
                        <span className="bg-teal-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {project.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6" onClick={() => openProjectModal(project)}>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-teal-800 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {projects.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-xl text-slate-500">
                    Aucun projet trouvé dans cette catégorie.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Bandeau "Vous aimez ce style ?" */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Vous aimez ce style ?
          </h2>
          <p className="text-xl text-teal-100 mb-8 leading-relaxed">
            Transformons votre inspiration en projet concret. Parlez-nous de vos idées !
          </p>
          <Link to="/devis">
            <Button size="lg" variant="secondary" className="bg-white text-teal-800 hover:bg-teal-50 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
              Demander un devis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq) => (
              <Card key={faq.id} className="border-stone-200">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-stone-50 transition-colors"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3 className="font-semibold text-slate-800 pr-4">{faq.question}</h3>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-teal-600 flex-shrink-0" />
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
                <Badge className="w-fit bg-teal-100 text-teal-800">
                  {selectedProject.category}
                </Badge>
              </DialogHeader>
              
              <div className="space-y-6">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
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
                        <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-slate-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link to="/devis" onClick={closeProjectModal}>
                    <Button className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 text-lg font-semibold rounded-full">
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