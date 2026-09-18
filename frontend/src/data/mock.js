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
    description: "Refuges quatre saisons, confortables été comme hiver.",
    price: "Plans à partir de 1200$",
    icon: "Mountain",
    category: "construction"
  },
  {
    id: 3,
    name: "Maisons résidentielles",
    description: "Maisons familiales sur fondations jusqu'à 600m² de plancher total (6000 pi²).",
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
  { id: 'accompagnement', name: 'Calculs de matériaux', price: 'Sur devis', description: 'Liste de matériaux et estimation des quantités pour votre projet' },
  { id: 'ebenisterie', name: 'Ébénisterie sur mesure', price: 'Sur devis', description: 'Plans de meubles et aménagements sur mesure' },
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
    title: "Plans sur mesure",
    description: "Chaque plan est unique, conçu pour votre mode de vie, votre terrain et votre budget.",
    icon: "PenTool"
  },
  {
    id: 2,
    title: "100 % à distance",
    description: "Visioconférence, courriel et partage d'écrans — collaborez avec nous où que vous soyez.",
    icon: "Globe"
  },
  {
    id: 3,
    title: "Conformité assurée",
    description: "Dossiers rigoureusement conformes aux codes de construction pour accélérer vos permis.",
    icon: "ShieldCheck"
  }
];

export const processSteps = [
  {
    id: 1,
    title: "Parlez-nous de votre idée",
    description: "Envoyez-nous votre demande de devis avec vos besoins et vos idées.",
    icon: "MessageCircle"
  },
  {
    id: 2,
    title: "Croquis & devis",
    description: "Premier contact, premiers dessins et estimation détaillée. Soumission et dépôt.",
    icon: "PenTool"
  },
  {
    id: 3,
    title: "Plans détaillés",  
    description: "Réalisation des plans complets et professionnels selon vos besoins.",
    icon: "FileText"
  },
  {
    id: 4,
    title: "Accompagnement & retours",
    description: "Conseils et références si besoin. Partagez-nous vos commentaires ! ⭐",
    icon: "Star"
  }
];

// 📁 CATÉGORIES D'INSPIRATION ORGANISÉES
export const inspirationProjects = [
  
  // 📁 1. MAISON UNIFAMILIALE
  {
    id: 1,
    title: "Maison unifamiliale moderne",
    category: "Maison unifamiliale",
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
    id: 2,
    title: "Résidence contemporaine avec garage",
    category: "Maison unifamiliale",
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
    id: 3,
    title: "Maison traditionnelle moderne",
    category: "Maison unifamiliale", 
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
    id: 4,
    title: "Villa contemporaine premium",
    category: "Maison unifamiliale",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/sjzw3hx6_images%20%287%29.jpg", 
    description: "Résidence haut de gamme design",
    details: [
      "Architecture signature unique",
      "Finitions haut de gamme",
      "Espaces de vie généreux",
      "Intégration site et paysage"
    ],
    dimensions: "Villa premium sur mesure"
  },

  // 📁 2. CHALET
  {
    id: 5,
    title: "Chalet rustique en bois rouge",
    category: "Chalet",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/kvkh2laf_chalet_bois_rouge_petit_porch.jpg",
    description: "Style traditionnel avec porche couvert",
    details: [
      "Bois naturel rouge traditionnel",
      "Porche couvert protection intempéries",
      "Architecture québécoise authentique", 
      "Intégration harmonieuse environnement"
    ],
    dimensions: "Chalet avec porche intégré"
  },
  {
    id: 6, 
    title: "Cabane forestière moderne",
    category: "Chalet",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/jsnf18ez_cabane_forestiere_bois_gris.jpg",
    description: "Design contemporain en harmonie avec la forêt",
    details: [
      "Revêtement bois gris naturel",
      "Architecture épurée et moderne",
      "Grandes ouvertures vers la nature",
      "Intégration parfaite site forestier"
    ],
    dimensions: "Refuge moderne milieu naturel"
  },
  {
    id: 7,
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

  // 📁 3. MINI-MAISON
  {
    id: 8,
    title: "Mini-maison contemporaine grise", 
    category: "Mini-maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/q82tmegd_maison_chalet_noir_toit_pente.jpg",
    description: "Design moderne avec finition bi-couleur",
    details: [
      "Revêtement moderne gris et beige",
      "Grandes fenêtres luminosité maximale",
      "Toit en pente évacuation optimale",
      "Fondations permanentes intégrées"
    ],
    dimensions: "Compact et fonctionnel sur fondations"
  },
  {
    id: 9,
    title: "Tiny house avec mezzanine optimisée",
    category: "Mini-maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/s7trs96c_tiny_house_escalier_rangement_chambre_mezzanine.png",
    description: "Aménagement intérieur intelligent",
    details: [
      "Escalier avec rangements intégrés",
      "Chambre mezzanine optimisée", 
      "Design intérieur bois et blanc",
      "Maximisation espace de vie"
    ],
    dimensions: "Aménagement vertical optimisé"
  },
  {
    id: 10,
    title: "Tiny house nomade sur roues",
    category: "Mini-maison", 
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/2cvgnces_images%20%281%29.jpg",
    description: "Mini-maison mobile bardage bois naturel",
    details: [
      "Bardage bois naturel résistant",
      "Toit métallique vert écologique",
      "Conception mobile sur châssis",
      "Fenestration optimisée lumière"
    ],
    dimensions: "Format mobile compact"
  },
  {
    id: 11,
    title: "Mini-maison surélevée moderne",
    category: "Mini-maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/01mafhae_images%20%282%29.jpg", 
    description: "Design contemporain surélevé avec terrasse",
    details: [
      "Structure surélevée pour ventilation",
      "Terrasse intégrée en bois",
      "Éclairage chaleureux intérieur/extérieur",
      "Matériaux mixtes bois et composite"
    ],
    dimensions: "Mini-maison avec terrasse surélevée"
  },
  {
    id: 12,
    title: "Cabane forestière rustique",
    category: "Mini-maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/v8qgvnt5_images.jpg",
    description: "Refuge naturel en harmonie environnement", 
    details: [
      "Bardage bois vieilli naturellement",
      "Intégration parfaite site forestier",
      "Terrasse en bois brut", 
      "Design minimaliste et authentique"
    ],
    dimensions: "Cabane forestière sur mesure"
  },
  {
    id: 13,
    title: "Studio moderne sur fondations",
    category: "Mini-maison",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/cqnbl3xf_mini_maison-scaled-e159621708054.webp",
    description: "Architecture contemporaine avec toit plat",
    details: [
      "Bardage bois vertical moderne",
      "Toit plat design contemporain",
      "Grandes baies vitrées",
      "Fondations béton permanentes"
    ],
    dimensions: "Studio moderne sur fondations"
  },

  // 📁 4. EXTENSIONS VERRIÈRES SOLARIUM  
  {
    id: 14,
    title: "Extension verrière moderne",
    category: "Extensions verrières solarium",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/4ar5mplx_images%20%2813%29.jpg",
    description: "Verrière contemporaine agrandissement lumineux",
    details: [
      "Structure métallique et verre",
      "Luminosité naturelle optimale",
      "Transition harmonieuse intérieur/extérieur", 
      "Agrandissement sans modification majeure"
    ],
    dimensions: "Extension sur mesure"
  },
  {
    id: 15,
    title: "Solarium quatre saisons",
    category: "Extensions verrières solarium",
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
    id: 16,
    title: "Verrière d'angle contemporaine", 
    category: "Extensions verrières solarium",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/cc2w6v0m_images%20%2810%29.jpg",
    description: "Design architectural avec verrière d'angle",
    details: [
      "Verrière d'angle maximisant vue",
      "Architecture contemporaine épurée", 
      "Intégration structurelle parfaite",
      "Luminosité sur deux orientations"
    ],
    dimensions: "Extension d'angle sur mesure"
  },
  {
    id: 17,
    title: "Extension avec terrasse couverte",
    category: "Extensions verrières solarium",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/28d3l99i_images%20%2811%29.jpg",
    description: "Agrandissement avec espace extérieur protégé",
    details: [
      "Terrasse couverte intégrée",
      "Extension espace de vie",
      "Protection contre intempéries",
      "Transition douce vers extérieur"
    ],
    dimensions: "Extension avec terrasse"
  },
  {
    id: 18,
    title: "Verrière style conservatoire",
    category: "Extensions verrières solarium", 
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

  // 📁 5. AUTRES DESSINS (ÉBÉNISTERIE, ETC.)
  {
    id: 19,
    title: "Plans cuisine sur mesure - Élévations A et C",
    category: "Autres dessins (ébénisterie)",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/snnyglwu_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20185734.png",
    description: "Conception technique ébénisterie cuisine avec élévations détaillées",
    details: [
      "Élévations techniques A et C cotées",
      "Positionnement exact armoires et équipements", 
      "Plans fabrication pour ébéniste",
      "Dimensions précises et détails assemblage"
    ],
    dimensions: "Plans techniques ébénisterie"
  },
  {
    id: 20,
    title: "Plans cuisine sur mesure - Élévation B détaillée",
    category: "Autres dessins (ébénisterie)",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/69hpxar9_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20185709.png",
    description: "Plans techniques fabrication cuisine avec tous détails constructifs",
    details: [
      "Élévation B avec cotes complètes",
      "Détails tiroirs, portes et quincaillerie", 
      "Spécifications matériaux et finitions",
      "Instructions montage pour fabrication"
    ],
    dimensions: "Plans fabrication ébénisterie détaillés"
  },

  // 📁 6. DESSINS TECHNIQUES (PLOMBERIE, ÉLECTRICITÉ, VENTILATION)
  {
    id: 21,
    title: "Plan drainage sanitaire et alimentation eau",
    category: "Dessins techniques",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/y884rda4_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20190051.png", 
    description: "Plans techniques avec dimensions précises, matériaux, normes pour entrepreneurs",
    details: [
      "Légende complète avec symboles normalisés",
      "Tableau spécifications matériaux détaillé", 
      "Plan drainage sanitaire, pluvial et eau domestique",
      "Conformité normes pour réalisation sur chantier"
    ],
    dimensions: "Plans techniques de fabrication/construction"
  },
  {
    id: 22,
    title: "Plan drainage sanitaire et pluvial - Vue S-S",
    category: "Dessins techniques",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/apzkqods_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20190128.png",
    description: "Plan technique coté avec positionnement exact équipements sanitaires",
    details: [
      "Cotations précises pour installation",
      "Positionnement exact appareils sanitaires", 
      "Tracé réseaux drainage et pluvial",
      "Instructions techniques pour plombiers"
    ],
    dimensions: "Plans techniques installation précise"
  },
  {
    id: 23,
    title: "Plan structural avec grille de colonnes", 
    category: "Dessins techniques",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/3x81n40h_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20190231.png",
    description: "Plans structuraux avec dimensions exactes et grille de références",
    details: [
      "Grille de colonnes avec repères précis",
      "Cotations structurelles au millimètre", 
      "Détails assemblages et fixations",
      "Spécifications pour ingénieurs et entrepreneurs"
    ],
    dimensions: "Plans techniques structurels détaillés"
  },
  {
    id: 24,
    title: "Coupes techniques fondations - Détails constructifs",
    category: "Dessins techniques",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/ss0vrxf6_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20190256.png",
    description: "Coupes techniques avec spécifications matériaux et assemblages",
    details: [
      "Coupes A et B avec détails fondations",
      "Spécifications isolations et matériaux", 
      "Dimensions précises et tolérances",
      "Instructions assemblage pour construction"
    ],
    dimensions: "Détails techniques constructifs"
  },

  // 📁 7. DESSINS ARCHITECTURAUX (PLANS CONCEPTION/ESTHÉTIQUE)
  {
    id: 25,
    title: "Plans architecturaux résidence - Présentation client",
    category: "Dessins architecturaux", 
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/8o0lr81z_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20185559.png",
    description: "Plans de conception esthétique pour présentation et approbation client",
    details: [
      "Plans étages avec disposition pièces claire",
      "Présentation visuelle 'parlante' pour non-techniciens",
      "Vision globale du projet et circulation",
      "Communication conception et esthétique"
    ],
    dimensions: "Plans présentation architecturale"
  },
  {
    id: 26,
    title: "Élévations architecturales - Style et esthétique",
    category: "Dessins architecturaux",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/p6g3k585_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20190835.png",
    description: "Élévations montrant forme, style et matériaux pour validation", 
    details: [
      "Élévations avec indication matériaux",
      "Représentation style architectural", 
      "Présentation esthétique du projet",
      "Validation concept avec client/autorités"
    ],
    dimensions: "Élévations conception architecturale"
  },
  {
    id: 27,
    title: "Plans de présentation - Concept global",
    category: "Dessins architecturaux",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/l6lg9um1_Capture%20d%E2%80%99%C3%A9cran%202025-08-15%20191157.png",
    description: "Présentation architecturale complète pour compréhension projet",
    details: [
      "Plans lisibles avec ambiance et volumes",
      "Compréhension globale de l'espace", 
      "Présentation claire pour permis construction",
      "Communication visuelle du concept"
    ],
    dimensions: "Plans concept architectural"
  },
  {
    id: 28,
    title: "Rendus architecturaux 3D - Présentation finale",
    category: "Dessins architecturaux", 
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/a25uh1yy_images.jpg",
    description: "Rendu 3D architectural pour visualisation finale du projet",
    details: [
      "Visualisation 3D réaliste du projet",
      "Présentation finale pour validation client",
      "Communication esthétique et ambiance", 
      "Outil de vente et présentation"
    ],
    dimensions: "Rendu architectural 3D"
  },
  {
    id: 29,
    title: "Plan architectural complet - Documentation projet",
    category: "Dessins architecturaux",
    image: "https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/n6h155q2_PLAN%20ARCHITECK%20TURAL.png",
    description: "Documentation architecturale complète pour permis et présentation",
    details: [
      "Plans, élévations et coupes architecturales",
      "Documentation pour autorités municipales", 
      "Présentation complète du concept",
      "Compréhension globale du projet"
    ],
    dimensions: "Documentation architecturale complète"
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
    question: "Offrez-vous des services à distance ?",
    answer: "Oui ! Nos services de conception de plans sont entièrement à distance. Visioconférence, courriel et partage d'écrans nous permettent de collaborer avec vous, où que vous soyez."
  },
  {
    id: 2,
    question: "Jusqu'à quelle taille de maison pouvez-vous dessiner ?",
    answer: "Pour une habitation unifamiliale isolée, nous pouvons concevoir des plans pour une superficie brute totale de moins de 600 m² (~6 458 pi²), sur 2 étages plus 1 sous-sol, conformément à l'article 16.1 de la Loi sur les architectes du Québec."
  },
  {
    id: 3,
    question: "Vos plans respectent-ils le Code du bâtiment ?",
    answer: "Absolument. Tous nos plans sont rigoureusement conformes aux codes de construction en vigueur et aux normes locales, afin de simplifier et accélérer l'obtention de vos permis."
  },
  {
    id: 4,
    question: "Que se passe-t-il si mon projet dépasse les limites légales ?",
    answer: "Pour les projets excédant les seuils de la Loi sur les architectes, Abrisia Plan intervient comme sous-traitant technique en collaboration avec des ingénieurs en structure ou des architectes pour que vos plans soient scellés et approuvés."
  }
];