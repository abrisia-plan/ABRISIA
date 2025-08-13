// Mock data for Abrisia Plan website - Updated pricing and services

export const services = [
  {
    id: 1,
    name: "Mini-maisons",
    description: "Espaces compacts et fonctionnels, conçus pour une vie simple et durable.",
    price: "Plans à partir de 800$",
    icon: "Home",
    category: "construction"
  },
  {
    id: 2,
    name: "Chalets",
    description: "Refuges chaleureux en harmonie avec la nature environnante.",
    price: "Plans à partir de 1200$",
    icon: "Mountain",
    category: "construction"
  },
  {
    id: 3,
    name: "Maisons résidentielles",
    description: "Maisons familiales jusqu'à 6000m² de plancher (incluant sous-sol et étages).",
    price: "Plans à partir de 1500$",
    icon: "Building",
    category: "construction"
  },
  {
    id: 4,
    name: "Extensions",
    description: "Agrandissements et ajouts pour optimiser votre espace existant.",
    price: "Plans à partir de 600$",
    icon: "PlusSquare",
    category: "construction"
  },
  {
    id: 5,
    name: "Abris sur mesure",
    description: "Structures protectrices adaptées à vos besoins spécifiques.",
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
  { id: 'plomberie', name: 'Plan de plomberie', price: '400$' },
  { id: 'electricite', name: 'Plan électrique', price: '450$' },
  { id: 'ventilation', name: 'Plan de ventilation', price: '350$' },
  { id: 'mini-maison', name: 'Mini-maison complète', price: '800$' },
  { id: 'chalet', name: 'Chalet', price: '1200$' },
  { id: 'maison-complete', name: 'Maison résidentielle complète', price: '1500$' }
];

export const projectTypes = [
  'Mini-maison',
  'Chalet', 
  'Maison résidentielle',
  'Extension',
  'Abri/garage',
  'Plans techniques seulement',
  'Autre'
];

export const approaches = [
  {
    id: 1,
    title: "Naturel & durable",
    description: "Matériaux écologiques et techniques respectueuses de l'environnement.",
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
    description: "Savoir-faire traditionnel combiné aux innovations modernes.",
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
    title: "Mini-maison moderne",
    category: "Mini-maison",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    description: "Espace compact de 25m² avec tout le confort nécessaire",
    details: [
      "Surface optimisée avec rangements intégrés",
      "Grandes fenêtres pour la luminosité naturelle", 
      "Matériaux locaux et durables",
      "Système de chauffage efficace"
    ],
    dimensions: "5m x 5m x 3.5m (hauteur)"
  },
  {
    id: 2,
    title: "Chalet familial",
    category: "Chalet",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    description: "Refuge chaleureux pour moments en famille",
    details: [
      "3 chambres avec vue sur la forêt",
      "Salon avec foyer central en pierre",
      "Cuisine ouverte en bois massif",
      "Terrasse couverte plein sud"
    ],
    dimensions: "12m x 8m, 2 niveaux"
  },
  {
    id: 3,
    title: "Abri de jardin multifonction",
    category: "Abris",
    image: "https://images.unsplash.com/photo-1549517045-bc93de075e53",
    description: "Espace de rangement et atelier",
    details: [
      "Zone stockage avec étagères modulables",
      "Coin atelier avec établi intégré",
      "Éclairage naturel par puits de lumière",
      "Ventilation croisée pour séchage"
    ],
    dimensions: "4m x 3m x 2.8m"
  },
  {
    id: 4,
    title: "Extension moderne",
    category: "Extension",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    description: "Agrandissement harmonieux d'une maison existante",
    details: [
      "Nouvelle cuisine ouverte sur jardin",
      "Intégration parfaite à l'existant",
      "Matériaux contemporains et durables",
      "Optimisation de la lumière naturelle"
    ],
    dimensions: "6m x 4m en extension"
  },
  {
    id: 5,
    title: "Détail charpente traditionnelle",
    category: "Détails",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
    description: "Assemblages bois traditionnels",
    details: [
      "Tenons-mortaises sans clous",
      "Bois de chêne local séché naturellement",
      "Techniques ancestrales préservées",
      "Résistance exceptionnelle dans le temps"
    ],
    dimensions: "Détail technique"
  },
  {
    id: 6,
    title: "Maison familiale 2 étages",
    category: "Maison",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    description: "Maison complète dans la limite des 6000m² de plancher",
    details: [
      "4 chambres réparties sur 2 niveaux",
      "Sous-sol aménageable inclus",
      "Garage intégré",
      "Respecte les normes québécoises"
    ],
    dimensions: "150m² par niveau + sous-sol"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Marie-Claude Dubois",
    project: "Plans mini-maison 25m²",
    text: "Prix très raisonnable pour des plans détaillés. Service personnalisé et à l'écoute de nos contraintes budgétaires.",
    rating: 5
  },
  {
    id: 2,
    name: "Jean Tremblay",
    project: "Extension cuisine 30m²",
    text: "Seulement 600$ pour des plans d'extension complets. Accompagnement de qualité et respect des délais.",
    rating: 5
  },
  {
    id: 3,
    name: "Sophie Leblanc",
    project: "Chalet 4 saisons",
    text: "Excellent rapport qualité-prix. Plans techniques impeccables et conseils précieux pour la construction.",
    rating: 5
  }
];

export const mockQuotes = [
  {
    id: 1,
    clientName: "Pierre Martin",
    email: "pierre@email.com",
    phone: "514-555-0123",
    projectType: "Mini-maison",
    plansDesired: ["architecture", "fondation", "electricite"],
    notes: "Mini-maison 25m² sur roues pour couple retraité. Budget serré mais qualité importante.",
    status: "En attente",
    createdAt: "2024-12-20T10:00:00Z",
    assignedTo: null
  },
  {
    id: 2,
    clientName: "Julie Rousseau", 
    email: "julie@email.com",
    phone: "438-555-0456",
    projectType: "Extension",
    plansDesired: ["architecture", "plomberie"],
    notes: "Extension cuisine 6m x 4m. Maison existante des années 70 à moderniser.",
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
    specialties: ["Mini-maisons", "Chalets", "Plans techniques"],
    activeProjects: 3
  },
  {
    id: 2,
    name: "Sophie Architecte",
    email: "sophie@abrisia-plan.ca", 
    specialties: ["Extensions", "Maisons résidentielles", "Rénovations"],
    activeProjects: 2
  }
];

export const faqItems = [
  {
    id: 1,
    question: "Vos prix sont-ils vraiment si abordables ?",
    answer: "Oui ! En fonctionnant avec des frais généraux réduits et des horaires flexibles, nous proposons des tarifs très compétitifs. Plans de fondation dès 300$, extensions dès 600$."
  },
  {
    id: 2,
    question: "Jusqu'à quelle taille de maison pouvez-vous dessiner ?",
    answer: "Légalement, je peux dessiner des maisons jusqu'à 6000m² de plancher total (incluant sous-sol, rez-de-chaussée et étages)."
  },
  {
    id: 3,
    question: "Proposez-vous un accompagnement à l'autoconstruction ?",
    answer: "Absolument ! Nous fournissons conseils techniques, calculs de matériaux et suivi de chantier pour vous accompagner."
  },
  {
    id: 4,
    question: "Travaillez-vous avec des matériaux spécifiques ?",
    answer: "Nous privilégions les matériaux locaux et durables : bois québécois, isolants naturels, finitions écologiques."
  }
];