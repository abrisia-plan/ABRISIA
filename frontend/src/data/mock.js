// Mock data for Abrisia Plan website - Services réalistes et descriptions précises

export const services = [
  {
    id: 1,
    name: "Mini-maisons",
    description: "Habitations compactes sur fondations permanentes, optimisées pour le confort.",
    price: "Plans à partir de 800$",
    icon: "Home",
    category: "construction"
  },
  {
    id: 2,
    name: "Chalets",
    description: "Refuges quatre saisons en harmonie avec la nature québécoise.",
    price: "Plans à partir de 1200$",
    icon: "Mountain",
    category: "construction"
  },
  {
    id: 3,
    name: "Maisons résidentielles",
    description: "Maisons familiales sur fondations jusqu'à 6000m² de plancher total.",
    price: "Plans à partir de 1500$",
    icon: "Building",
    category: "construction"
  },
  {
    id: 4,
    name: "Extensions",
    description: "Agrandissements harmonieux pour optimiser votre espace de vie.",
    price: "Plans à partir de 600$",
    icon: "PlusSquare",
    category: "construction"
  },
  {
    id: 5,
    name: "Abris et garages",
    description: "Structures utilitaires sur fondations pour rangement et protection.",
    price: "Plans à partir de 400$",
    icon: "Shield",
    category: "construction"
  },
  {
    id: 6,
    name: "Plans techniques spécialisés",
    description: "Fondation, plomberie, électricité, ventilation selon vos besoins.",
    price: "À partir de 300$",
    icon: "FileText",
    category: "plans"
  }
];

export const planOptions = [
  { id: 'fondation', name: 'Plan de fondation', price: '300$' },
  { id: 'architecture', name: 'Plan architectural complet', price: '800$' },
  { id: 'extension', name: 'Plan d\'extension', price: '600$' },
  { id: 'plomberie', name: 'Plan de plomberie (inclut évacuation)', price: '400$' },
  { id: 'electricite', name: 'Plan électrique', price: '450$' },
  { id: 'ventilation', name: 'Plan de ventilation', price: '350$' }
];

export const projectTypes = [
  'Mini-maison sur fondations',
  'Chalet quatre saisons', 
  'Maison résidentielle',
  'Extension/agrandissement',
  'Abri/garage sur fondations',
  'Plans techniques seulement',
  'Autre'
];

export const approaches = [
  {
    id: 1,
    title: "Naturel & durable",
    description: "Matériaux locaux québécois et techniques respectueuses de l'environnement.",
    icon: "Leaf"
  },
  {
    id: 2,
    title: "Flexibilité des horaires",
    description: "Nous nous adaptons à vos disponibilités pour un service personnalisé.",
    icon: "Clock"
  },
  {
    id: 3,
    title: "Transmission entre générations",
    description: "Savoir-faire traditionnel québécois allié aux innovations modernes.",
    icon: "Users"
  }
];

export const processSteps = [
  {
    id: 1,
    title: "Parlez-nous de votre idée",
    description: "Consultation gratuite pour comprendre votre vision et vos besoins.",
    icon: "MessageCircle"
  },
  {
    id: 2,
    title: "Croquis & devis",
    description: "Premiers dessins et estimation détaillée de votre projet.",
    icon: "PenTool"
  },
  {
    id: 3,
    title: "Plans détaillés",  
    description: "Réalisation des plans techniques complets et professionnels.",
    icon: "FileText"
  },
  {
    id: 4,
    title: "Construction & accompagnement",
    description: "Suivi de chantier et conseils pour la réalisation de votre projet.",
    icon: "Build"
  }
];

export const inspirationProjects = [
  {
    id: 1,
    title: "Mini-maison sur fondations",
    category: "Mini-maison",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    description: "Habitation compacte 35m² sur fondations permanentes",
    details: [
      "Fondations en béton permanentes",
      "Isolation supérieure aux normes",
      "Matériaux locaux québécois", 
      "Chauffage électrique efficace"
    ],
    dimensions: "6m x 6m sur fondations béton"
  },
  {
    id: 2,
    title: "Chalet familial quatre saisons",
    category: "Chalet",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    description: "Refuge permanent pour toute la famille",
    details: [
      "3 chambres avec vue sur forêt",
      "Salon avec foyer en pierre naturelle",
      "Cuisine en bois massif québécois",
      "Terrasse couverte orientée sud"
    ],
    dimensions: "12m x 8m, plain-pied sur fondations"
  },
  {
    id: 3,
    title: "Garage avec atelier",
    category: "Abris",
    image: "https://images.unsplash.com/photo-1549517045-bc93de075e53",
    description: "Structure utilitaire multifonction",
    details: [
      "Fondations béton avec drain français",
      "Espace véhicules + coin atelier",
      "Éclairage naturel par fenêtres",
      "Ventilation pour séchage équipements"
    ],
    dimensions: "8m x 6m sur dalle béton"
  },
  {
    id: 4,
    title: "Extension cuisine moderne",
    category: "Extension",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    description: "Agrandissement harmonieux d'une maison existante",
    details: [
      "Nouvelle cuisine ouverte sur jardin",
      "Fondations liées à l'existant",
      "Matériaux assortis à la maison",
      "Optimisation de la lumière naturelle"
    ],
    dimensions: "6m x 4m en extension sur fondations"
  },
  {
    id: 5,
    title: "Détail charpente traditionnelle",
    category: "Détails",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
    description: "Assemblages bois traditionnels québécois",
    details: [
      "Tenons-mortaises sans clous métalliques",
      "Bois de pin rouge local séché naturellement",
      "Techniques ancestrales du Québec",
      "Résistance exceptionnelle aux intempéries"
    ],
    dimensions: "Détail technique de charpente"
  },
  {
    id: 6,
    title: "Maison familiale traditionnelle",
    category: "Maison",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    description: "Maison complète dans la limite des 6000m² de plancher",
    details: [
      "4 chambres réparties sur 2 niveaux",
      "Sous-sol aménageable avec fondations profondes",
      "Garage intégré à la structure",
      "Conforme aux normes du Code du bâtiment du Québec"
    ],
    dimensions: "150m² par niveau + sous-sol complet"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Marie-Claude Dubois",
    project: "Plans mini-maison 35m² sur fondations",
    text: "Plans très détaillés pour notre petite maison permanente. Service professionnel et prix abordable.",
    rating: 5
  },
  {
    id: 2,
    name: "Jean Tremblay",
    project: "Extension cuisine 24m²",
    text: "Excellente intégration à notre maison existante. Les fondations se marient parfaitement.",
    rating: 5
  },
  {
    id: 3,
    name: "Sophie Leblanc",
    project: "Chalet quatre saisons",
    text: "Notre refuge de famille est magnifique. Construction solide qui traverse bien les hivers québécois.",
    rating: 5
  }
];

export const mockQuotes = [
  {
    id: 1,
    clientName: "Pierre Martin",
    email: "pierre@email.com",
    phone: "514-555-0123",
    projectType: "Mini-maison sur fondations",
    plansDesired: ["architecture", "fondation", "electricite"],
    notes: "Mini-maison 35m² sur fondations béton. Terrain en pente douce, accès facile. Budget 20000$ pour plans complets.",
    status: "En attente",
    createdAt: "2024-12-20T10:00:00Z",
    assignedTo: null
  },
  {
    id: 2,
    clientName: "Julie Rousseau", 
    email: "julie@email.com",
    phone: "438-555-0456",
    projectType: "Extension/agrandissement",
    plansDesired: ["architecture", "plomberie"],
    notes: "Extension cuisine 6m x 4m. Maison brique 1975. Besoin raccord fondations existantes + nouvelle plomberie.",
    status: "En cours",
    createdAt: "2024-12-19T14:30:00Z",
    assignedTo: "Marc Dessinateur"
  }
];

export const mockDesigners = [
  {
    id: 1,
    name: "Marc Dessinateur",
    email: "marc@abrisia-plan.ca",
    specialties: ["Mini-maisons", "Chalets", "Plans fondations"],
    activeProjects: 3
  },
  {
    id: 2,
    name: "Sophie Architecte",
    email: "sophie@abrisia-plan.ca", 
    specialties: ["Extensions", "Maisons résidentielles", "Structures permanentes"],
    activeProjects: 2
  }
];

export const faqItems = [
  {
    id: 1,
    question: "Dessinez-vous des maisons mobiles ou sur roues ?",
    answer: "Non, nous nous spécialisons dans les constructions permanentes sur fondations : mini-maisons, chalets, maisons résidentielles et extensions."
  },
  {
    id: 2,
    question: "Jusqu'à quelle taille de maison pouvez-vous dessiner ?",
    answer: "Légalement, je peux dessiner des constructions jusqu'à 6000m² de plancher total (incluant sous-sol, rez-de-chaussée et étages)."
  },
  {
    id: 3,
    question: "Vos constructions respectent-elles le Code du bâtiment ?",
    answer: "Absolument. Tous nos plans respectent le Code du bâtiment du Québec et les normes locales en vigueur."
  },
  {
    id: 4,
    question: "Travaillez-vous avec des matériaux québécois ?",
    answer: "Oui, nous privilégions les matériaux locaux : bois du Québec, isolants régionaux, et fournisseurs de la province."
  }
];