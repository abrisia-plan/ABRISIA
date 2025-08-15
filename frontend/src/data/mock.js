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
  // Plans techniques individuels
  { id: 'fondation', name: 'Plan de fondation', price: '300$' },
  { id: 'architecture', name: 'Plan architectural complet', price: '800$' },
  { id: 'extension', name: 'Plan d\'extension/verrière', price: '600$' },
  { id: 'plomberie', name: 'Plan de plomberie (inclut évacuation)', price: '400$' },
  { id: 'electricite', name: 'Plan électrique', price: '450$' },
  { id: 'ventilation', name: 'Plan de ventilation', price: '350$' },
  
  // Projets complets (comme annoncés sur la page d'accueil)
  { id: 'mini-maison-complete', name: 'Mini-maison complète (plans + détails)', price: '800$', description: 'Plans architecturaux et techniques pour mini-maison' },
  { id: 'chalet-complet', name: 'Chalet complet (plans + détails)', price: '1200$', description: 'Plans architecturaux et techniques pour chalet quatre saisons' },
  { id: 'maison-complete', name: 'Maison résidentielle complète', price: '1500$', description: 'Plans architecturaux et techniques pour maison familiale' },
  { id: 'abri-garage', name: 'Abris/garage/gazebo/galerie/coin cuisine extérieur', price: '400$', description: 'Plans pour structures extérieures et espaces de vie outdoor' },
  
  // Services
  { id: 'accompagnement', name: 'Accompagnement à l\'autoconstruction', price: 'Sur devis', description: 'Calculs de matériaux, conseils techniques et suivi de chantier' },
  { id: 'ebenisterie', name: 'Ébénisterie sur mesure', price: 'Sur devis', description: 'Conception et plans pour meubles et aménagements personnalisés' },
  { id: 'autre', name: 'Autre (à préciser dans les notes)', price: 'Sur devis', description: 'Projet spécialisé ou besoins particuliers - décrivez vos besoins' }
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
  // Mini-maisons et chalets
  {
    id: 1,
    title: "Mini-maison contemporaine grise",
    category: "Mini-maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/q82tmegd_maison_chalet_noir_toit_pente.jpg",
    description: "Design moderne avec toit en pente et finition bi-couleur",
    details: [
      "Revêtement moderne gris et beige",
      "Grandes fenêtres pour luminosité maximale",
      "Toit en pente pour évacuation optimale",
      "Fondations permanentes intégrées"
    ],
    dimensions: "Compact et fonctionnel sur fondations"
  },
  {
    id: 2,
    title: "Chalet rustique en bois rouge",
    category: "Chalet",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/kvkh2laf_chalet_bois_rouge_petit_porch.jpg",
    description: "Style traditionnel avec porche d'entrée couvert",
    details: [
      "Bois naturel rouge traditionnel",
      "Porche couvert pour protection intempéries",
      "Architecture québécoise authentique",
      "Intégration harmonieuse avec l'environnement"
    ],
    dimensions: "Style chalet avec porche intégré"
  },
  {
    id: 3,
    title: "Cabane forestière moderne",
    category: "Chalet",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/jsnf18ez_cabane_forestiere_bois_gris.jpg",
    description: "Design contemporain en harmonie avec la forêt",
    details: [
      "Revêtement bois gris naturel",
      "Architecture épurée et moderne",
      "Grandes ouvertures vers la nature",
      "Intégration parfaite au site forestier"
    ],
    dimensions: "Refuge moderne en milieu naturel"
  },
  {
    id: 4,
    title: "Tiny house avec mezzanine",
    category: "Mini-maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/s7trs96c_tiny_house_escalier_rangement_chambre_mezzanine.png",
    description: "Optimisation d'espace avec chambre en mezzanine",
    details: [
      "Escalier avec rangements intégrés",
      "Chambre mezzanine optimisée",
      "Design intérieur intelligent",
      "Maximisation de l'espace de vie"
    ],
    dimensions: "Aménagement vertical optimisé"
  },
  {
    id: 5,
    title: "Cabane au bord du lac",
    category: "Chalet",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/i6qabgr6_cabane_bois_lac_grandes_fenetres.jpg",
    description: "Vue panoramique avec grandes fenêtres",
    details: [
      "Emplacement privilégié bord de lac",
      "Fenestration maximale pour la vue",
      "Connexion directe avec la nature",
      "Terrasse intégrée face au lac"
    ],
    dimensions: "Positionnement optimal vue lac"
  },
  
  // Extensions et verrières
  {
    id: 6,
    title: "Extension verrière moderne",
    category: "Extension/Verrière",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/4ar5mplx_images%20%2813%29.jpg",
    description: "Verrière contemporaine pour agrandissement lumineux",
    details: [
      "Structure métallique et verre",
      "Luminosité naturelle optimale",
      "Transition harmonieuse intérieur/extérieur",
      "Agrandissement sans modification majeure"
    ],
    dimensions: "Extension sur mesure"
  },
  {
    id: 7,
    title: "Solarium quatre saisons",
    category: "Extension/Verrière",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/h2cqamx3_images%20%2816%29.jpg",
    description: "Espace de vie supplémentaire vitré",
    details: [
      "Utilisation année complète",
      "Isolation thermique performante",
      "Connexion avec le jardin",
      "Espace détente et convivialité"
    ],
    dimensions: "Solarium isolé quatre saisons"
  },
  {
    id: 8,
    title: "Verrière d'angle contemporaine",
    category: "Extension/Verrière",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/cc2w6v0m_images%20%2810%29.jpg",
    description: "Design architectural avec verrière d'angle",
    details: [
      "Verrière d'angle maximisant la vue",
      "Architecture contemporaine épurée",
      "Intégration structurelle parfaite",
      "Luminosité sur deux orientations"
    ],
    dimensions: "Extension d'angle sur mesure"
  },
  {
    id: 9,
    title: "Extension avec terrasse couverte",
    category: "Extension/Verrière",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/28d3l99i_images%20%2811%29.jpg",
    description: "Agrandissement avec espace extérieur protégé",
    details: [
      "Terrasse couverte intégrée",
      "Extension de l'espace de vie",
      "Protection contre les intempéries",
      "Transition douce vers l'extérieur"
    ],
    dimensions: "Extension avec terrasse"
  },
  {
    id: 10,
    title: "Verrière style conservatoire",
    category: "Extension/Verrière",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/jep4m8pl_images%20%2812%29.jpg",
    description: "Verrière élégante style conservatoire classique",
    details: [
      "Style architectural classique",
      "Structure métallique fine",
      "Transparence maximale",
      "Élégance et fonctionnalité"
    ],
    dimensions: "Conservatoire sur mesure"
  },

  // Maisons unifamiliales
  {
    id: 11,
    title: "Maison unifamiliale moderne",
    category: "Maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/s3k90xjy_images%20%283%29.jpg",
    description: "Design contemporain pour famille",
    details: [
      "Architecture moderne épurée",
      "Fenestration optimisée",
      "Matériaux contemporains de qualité",
      "Conception familiale fonctionnelle"
    ],
    dimensions: "Maison familiale complète"
  },
  {
    id: 12,
    title: "Résidence contemporaine",
    category: "Maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/i5mytm4b_images%20%285%29.jpg",
    description: "Maison familiale avec garage intégré",
    details: [
      "Garage intégré à la structure",
      "Volumes géométriques modernes",
      "Aménagement paysager intégré",
      "Fonctionnalité et esthétique"
    ],
    dimensions: "Résidence avec garage"
  },
  {
    id: 13,
    title: "Maison familiale traditionnelle moderne",
    category: "Maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/krbvxgwr_images%20%286%29.jpg",
    description: "Synthèse entre tradition et modernité",
    details: [
      "Style traditionnel revisité",
      "Matériaux nobles et durables",
      "Proportions harmonieuses",
      "Confort moderne intégré"
    ],
    dimensions: "Maison familiale équilibrée"
  },
  {
    id: 14,
    title: "Villa contemporaine premium",
    category: "Maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/sjzw3hx6_images%20%287%29.jpg",
    description: "Résidence haut de gamme design",
    details: [
      "Architecture signature unique",
      "Finitions haut de gamme",
      "Espaces de vie généreux",
      "Intégration site et paysage"
    ],
    dimensions: "Villa premium sur mesure"
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