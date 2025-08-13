// Mock data for Abrisia Plan website

export const services = [
  {
    id: 1,
    name: "Mini-maisons",
    description: "Espaces compacts et fonctionnels, conçus pour une vie simple et durable.",
    icon: "Home",
    category: "construction"
  },
  {
    id: 2,
    name: "Chalets",
    description: "Refuges chaleureux en harmonie avec la nature environnante.",
    icon: "Mountain",
    category: "construction"
  },
  {
    id: 3,
    name: "Roulottes de chantier",
    description: "Solutions mobiles pratiques pour vos projets temporaires.",
    icon: "Truck",
    category: "construction"
  },
  {
    id: 4,
    name: "Abris sur mesure",
    description: "Structures protectrices adaptées à vos besoins spécifiques.",
    icon: "Shield",
    category: "construction"
  },
  {
    id: 5,
    name: "Plans techniques",
    description: "Dessins détaillés et précis pour tous vos projets de construction.",
    icon: "FileText",
    category: "plans"
  },
  {
    id: 6,
    name: "Ébénisterie sur mesure",
    description: "Mobilier et aménagements en bois, créés selon vos désirs. (À venir)",
    icon: "Hammer",
    category: "coming-soon"
  }
];

export const planTypes = [
  { id: 'fondations', name: 'Plan de fondation', description: 'Bases solides pour votre construction' },
  { id: 'architecture', name: 'Plan architectural', description: 'Structure complète du bâtiment' },
  { id: 'plomberie', name: 'Plan de plomberie', description: 'Système d\'eau et évacuation' },
  { id: 'electricite', name: 'Plan d\'électricité', description: 'Installation électrique complète' },
  { id: 'ventilation', name: 'Plan de ventilation', description: 'Système de ventilation et aération' }
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
    title: "Roulotte de chantier",
    category: "Roulotte",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    description: "Bureau mobile pour équipes de terrain",
    details: [
      "Espace bureau pour 4 personnes",
      "Coin pause avec kitchenette",
      "Isolation thermique renforcée",
      "Installation électrique 220V"
    ],
    dimensions: "6m x 2.5m sur chassis remorque"
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
    title: "Intérieur mini-maison",
    category: "Intérieur",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    description: "Aménagement optimisé et chaleureux",
    details: [
      "Mobilier sur mesure multifonction",
      "Couleurs naturelles apaisantes",
      "Rangements cachés partout",
      "Matériaux sains et respirants"
    ],
    dimensions: "Aménagement 20m²"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Marie-Claude Dubois",
    project: "Mini-maison familiale",
    text: "Plans très détaillés et équipe à l'écoute. Notre petite maison correspond exactement à nos rêves !",
    rating: 5
  },
  {
    id: 2,
    name: "Jean Tremblay",
    project: "Chalet 4 saisons",
    text: "Accompagnement exceptionnel de A à Z. La flexibilité horaire nous a permis de tout faire à notre rythme.",
    rating: 5
  },
  {
    id: 3,
    name: "Sophie Leblanc",
    project: "Abri de jardin",
    text: "Projet simple mais traité avec le même soin qu'une grande construction. Service personnalisé remarquable.",
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
    plansDesired: ["Fondations", "Architecture", "Électricité"],
    projectOption: "Plans + Construction/Accompagnement",
    dimensions: "6m x 4m, surface habitable 24m²",
    budget: "15000$ - 25000$",
    timeline: "Printemps 2025",
    flexibility: "Weekends et soirées disponibles",
    materials: "Bois local, isolation naturelle",
    technicalChoices: {
      ventilation: true,
      electricity: "plan-integre",
      plumbing: "sans"
    },
    message: "Projet de tiny house pour couple avec enfant. Recherche autonomie énergétique.",
    status: "En attente",
    createdAt: "2024-12-20T10:00:00Z",
    assignedTo: null
  },
  {
    id: 2,
    clientName: "Julie Rousseau", 
    email: "julie@email.com",
    phone: "438-555-0456",
    projectType: "Abris",
    plansDesired: ["Architecture", "Fondations"],
    projectOption: "Plans uniquement",
    dimensions: "5m x 3m pour stockage équipement",
    budget: "3000$ - 5000$",
    timeline: "Été 2025",
    flexibility: "Horaires de bureau flexible",
    materials: "Bois traité, toiture métallique",
    technicalChoices: {
      ventilation: false,
      electricity: "sans", 
      plumbing: "sans"
    },
    message: "Abri pour matériel de jardinage et outils. Besoin de ventilation naturelle.",
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
    specialties: ["Abris", "Roulottes", "Détails construction"],
    activeProjects: 2
  }
];

export const faqItems = [
  {
    id: 1,
    question: "Quels sont vos délais habituels ?",
    answer: "Entre 2 à 4 semaines selon la complexité du projet. Nous nous adaptons à vos échéances."
  },
  {
    id: 2,
    question: "Proposez-vous un accompagnement à l'autoconstruction ?",
    answer: "Oui ! Nous fournissons conseils techniques, calculs de matériaux et suivi de chantier."
  },
  {
    id: 3,
    question: "Travaillez-vous avec des matériaux spécifiques ?",
    answer: "Nous privilégions les matériaux locaux et durables : bois québécois, isolants naturels, finitions écologiques."
  },
  {
    id: 4,
    question: "Peut-on modifier les plans en cours de projet ?",
    answer: "Absolument. Nous incluons 2 révisions, et restons flexibles pour les ajustements nécessaires."
  }
];