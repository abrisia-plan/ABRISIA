// Mock data for Abrisia Plan website

export const services = [
  {
    id: 1,
    name: "Plan de fondation",
    description: "Plans détaillés pour les fondations de votre bâtiment",
    price: "À partir de 500$",
    icon: "Home"
  },
  {
    id: 2,
    name: "Plan de bâtiment",
    description: "Plans architecturaux complets pour construction neuve",
    price: "À partir de 800$",
    icon: "Building"
  },
  {
    id: 3,
    name: "Plan d'extension",
    description: "Agrandissement et extension de bâtiments existants",
    price: "À partir de 600$",
    icon: "PlusSquare"
  },
  {
    id: 4,
    name: "Plan de plomberie",
    description: "Système de plomberie et évacuation des eaux",
    price: "À partir de 400$",
    icon: "Droplets"
  },
  {
    id: 5,
    name: "Plan d'électricité",
    description: "Installation électrique complète et mise aux normes",
    price: "À partir de 450$",
    icon: "Zap"
  },
  {
    id: 6,
    name: "Plan de ventilation",
    description: "Système de ventilation et climatisation",
    price: "À partir de 350$",
    icon: "Wind"
  }
];

export const inspirationProjects = [
  {
    id: 1,
    title: "Chalet moderne en bois",
    category: "Résidentiel",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    description: "Chalet contemporain avec grandes baies vitrées"
  },
  {
    id: 2,
    title: "Maison familiale",
    category: "Résidentiel",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    description: "Maison familiale moderne avec jardin"
  },
  {
    id: 3,
    title: "Extension de maison",
    category: "Rénovation",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    description: "Extension moderne d'une maison traditionnelle"
  },
  {
    id: 4,
    title: "Cabane de jardin",
    category: "Annexe",
    image: "https://images.unsplash.com/photo-1549517045-bc93de075e53",
    description: "Abri de jardin avec espace détente"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Marie Dubois",
    project: "Maison familiale",
    text: "Excellent service, plans très détaillés et respectent parfaitement nos besoins. L'équipe a été très professionnelle.",
    rating: 5
  },
  {
    id: 2,
    name: "Jean Tremblay",
    project: "Extension de chalet",
    text: "Plans précis et livraison dans les délais. Je recommande vivement Abrisia Plan pour tous vos projets.",
    rating: 5
  },
  {
    id: 3,
    name: "Sophie Leblanc",
    project: "Rénovation complète",
    text: "Service personnalisé et expertise remarquable. Les plans ont grandement facilité notre projet de rénovation.",
    rating: 5
  }
];

export const mockQuotes = [
  {
    id: 1,
    clientName: "Pierre Martin",
    email: "pierre@email.com",
    phone: "514-555-0123",
    projectType: "Maison neuve",
    services: ["Plan de fondation", "Plan de bâtiment", "Plan d'électricité"],
    description: "Construction d'une maison familiale de 150m²",
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
    services: ["Plan d'extension", "Plan de plomberie"],
    description: "Agrandissement cuisine + salle de bain",
    status: "En cours",
    createdAt: "2024-12-19T14:30:00Z",
    assignedTo: "Marc Dessinateur"
  }
];

export const mockDesigners = [
  {
    id: 1,
    name: "Marc Dessinateur",
    email: "marc@abrisia.ca",
    specialties: ["Résidentiel", "Extension"],
    activeProjects: 3
  },
  {
    id: 2,
    name: "Sophie Architecte",
    email: "sophie@abrisia.ca",
    specialties: ["Commercial", "Industriel"],
    activeProjects: 2
  }
];