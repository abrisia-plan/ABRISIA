// Contenus par défaut, utilisés quand le serveur ne répond pas.
// (Les étapes « Comment ça marche ? » se modifient dans l'admin.)

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
    description: "Téléphone, courriel ou texto : pas besoin de vous déplacer, où que vous soyez au Québec.",
    icon: "Globe"
  },
  {
    id: 3,
    title: "Conformité assurée",
    description: "Plans conçus selon le Code de construction du Québec et les règlements de votre municipalité, pour votre demande de permis.",
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

export const faqItems = [
  {
    id: 1,
    question: "Offrez-vous des services à distance ?",
    answer: "Oui. Tout se fait à distance, par téléphone, courriel ou texto. Vous pouvez joindre vos photos, croquis et plans à votre demande de devis."
  },
  {
    id: 2,
    question: "Jusqu'à quelle taille de maison pouvez-vous dessiner ?",
    answer: "Pour une habitation unifamiliale isolée, nous pouvons concevoir des plans pour une superficie brute totale de moins de 600 m² (~6 458 pi²), sur 2 étages plus 1 sous-sol, conformément à l'article 16.1 de la Loi sur les architectes du Québec."
  },
  {
    id: 3,
    question: "Vos plans respectent-ils le Code du bâtiment ?",
    answer: "Oui. Nos plans sont conçus selon le Code de construction du Québec, basé sur le Code national du bâtiment du Canada, et selon les règlements de votre municipalité, pour votre demande de permis."
  },
  {
    id: 4,
    question: "Que se passe-t-il si mon projet dépasse les limites légales ?",
    answer: "Pour les projets excédant les seuils de la Loi sur les architectes, Abrisia Plan intervient comme sous-traitant technique en collaboration avec des ingénieurs en structure ou des architectes pour que vos plans soient scellés et approuvés."
  }
];
