import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Eye, ArrowRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { faqItems } from '../data/mock';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    loadCategories();
    // eslint-disable-next-line
  }, [searchParams]);

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || ['Tous']);
      }
    } catch (err) {
      // Handled silently
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const catParam = selectedCategory !== 'Tous' ? `?category=${encodeURIComponent(selectedCategory)}&limit=100` : '?limit=100';
      const res = await fetch(`${BACKEND_URL}/api/projects${catParam}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Galerie d'inspiration
          </h1>
          <p className="text-xl text-teal-100 leading-relaxed">
            Découvrez nos réalisations et trouvez l'inspiration pour votre projet
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-8 bg-white border-b border-stone-200 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center" data-testid="category-filters">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat 
                  ? 'bg-teal-800 hover:bg-teal-900 text-white' 
                  : 'border-stone-300 text-slate-700 hover:bg-stone-100'}
                data-testid={`category-btn-${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projets */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">Aucun projet dans cette catégorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="projects-grid">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-stone-200 cursor-pointer bg-white"
                  onClick={() => openProjectModal(project)}
                  data-testid={`project-card-${project.id}`}
                >
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-teal-800 text-white hover:bg-teal-900">
                        {project.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-teal-800 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal projet */}
      <Dialog open={!!selectedProject} onOpenChange={closeProjectModal}>
        <DialogContent className="max-w-3xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-800 text-white">{selectedProject.category}</Badge>
                  {selectedProject.dimensions && (
                    <Badge variant="outline">{selectedProject.dimensions}</Badge>
                  )}
                </div>
                <p className="text-slate-600">{selectedProject.description}</p>
                {selectedProject.details && selectedProject.details.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Détails</h4>
                    <ul className="space-y-1">
                      {selectedProject.details.map((detail, i) => (
                        <li key={`detail-${detail.slice(0, 20)}-${i}`} className="text-slate-600 text-sm flex items-start gap-2">
                          <span className="text-teal-600 mt-1">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="pt-4 border-t border-stone-200">
                  <Link to="/devis">
                    <Button className="bg-teal-800 hover:bg-teal-900 text-white">
                      Demander un devis pour un projet similaire
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <Card key={faq.question} className="border-stone-200">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Un projet vous inspire ?
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            Parlez-nous de votre idée, nous la transformerons en plans
          </p>
          <Link to="/devis">
            <Button size="lg" variant="secondary" className="bg-white text-teal-800 hover:bg-teal-50 px-10 py-4 text-lg font-semibold rounded-full">
              Demander un devis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Inspiration;
