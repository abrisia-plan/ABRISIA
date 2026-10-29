// Questions envoyées aux clients, regroupées par section.
// - QUESTIONNAIRE : avant la soumission (guide « Préparer votre projet »)
// - VERIFICATION : après le dépôt de 50 %, avant le début des dessins
// Tout est facultatif; seules les réponses remplies sont envoyées.

const NE_SAIS_PAS = 'Je ne sais pas encore';

export const QUESTIONNAIRE = [
  {
    section: 'Votre terrain',
    questions: [
      { id: 'adresse', label: 'Adresse ou numéro de lot', placeholder: 'Ex. : 123, rang Saint-Paul ou lot 1 234 567' },
      { id: 'municipalite', label: 'Municipalité', placeholder: 'Ex. : Alma' },
      { id: 'services', label: 'Services sur le terrain', options: ['Égout et aqueduc municipaux', 'Installation septique et puits', NE_SAIS_PAS] },
      { id: 'pente', label: 'Le terrain est…', options: ['Plat', 'En pente douce', 'En pente forte', NE_SAIS_PAS] },
      { id: 'zonage', label: 'Avez-vous vérifié le zonage auprès de la municipalité ?', options: ['Oui, j\'ai les règles (marges, hauteur, superficie)', 'Pas encore', 'Je ne sais pas comment faire'] },
      { id: 'certificat', label: 'Avez-vous un certificat de localisation ?', options: ['Oui, je le joins plus bas', 'Oui, mais pas sous la main', 'Non', NE_SAIS_PAS] },
    ],
  },
  {
    section: 'Vos besoins',
    questions: [
      { id: 'chambres', label: 'Nombre de chambres', type: 'number' },
      { id: 'sdb', label: 'Nombre de salles de bain', type: 'number' },
      { id: 'superficie', label: 'Superficie souhaitée', placeholder: 'Ex. : environ 1 200 pi²' },
      { id: 'etages', label: 'Nombre d\'étages', options: ['1 étage', '1 étage et demi', '2 étages', 'À discuter'] },
      { id: 'fondation', label: 'Fondation', options: ['Sous-sol', 'Dalle sur sol', 'Vide sanitaire', 'Pieux', 'À discuter'] },
      { id: 'pieces', label: 'Pièces essentielles', placeholder: 'Ex. : bureau, salle de lavage, garage attenant' },
      { id: 'particuliers', label: 'Besoins particuliers', placeholder: 'Ex. : plain-pied pour vieillir chez soi, logement pour un proche' },
    ],
  },
  {
    section: 'Votre budget et votre échéancier',
    questions: [
      { id: 'budget', label: 'Budget total de construction (approximatif)', options: ['Moins de 100 000 $', '100 000 à 250 000 $', '250 000 à 400 000 $', '400 000 à 600 000 $', 'Plus de 600 000 $', 'À déterminer'] },
      { id: 'financement', label: 'Votre financement', options: ['Déjà approuvé', 'En cours', 'Pas encore commencé', 'Pas besoin de financement'] },
      { id: 'debut', label: 'Quand souhaitez-vous commencer les travaux ?', placeholder: 'Ex. : printemps 2027' },
      { id: 'constructeur', label: 'Qui va construire ?', options: ['Moi-même (autoconstruction)', 'Un entrepreneur déjà choisi', 'Un entrepreneur à trouver', NE_SAIS_PAS] },
    ],
  },
];

const ETAT = ['C\'est fait', 'Je joins le document', 'Pas encore', 'Ne s\'applique pas', 'À discuter'];

export const VERIFICATION = [
  {
    section: 'Auprès de la municipalité',
    questions: [
      { id: 'v_zonage', label: 'Règles de zonage confirmées par écrit (marges, hauteur, superficie, matériaux)', options: ETAT },
      { id: 'v_exigences', label: 'Documents exigés pour le permis (liste de la municipalité)', options: ETAT },
      { id: 'v_environnement', label: 'Rive, zone inondable ou milieu humide : autorisations vérifiées', options: ETAT },
    ],
  },
  {
    section: 'Votre terrain et l\'existant',
    questions: [
      { id: 'v_certificat', label: 'Certificat de localisation ou plan d\'implantation', options: ETAT },
      { id: 'v_septique', label: 'Étude de sol / installation septique (si pas d\'égout municipal)', options: ETAT },
      { id: 'v_existant', label: 'Agrandissement ou rénovation : mesures et photos de l\'existant', options: ETAT },
      { id: 'v_anciens_plans', label: 'Anciens plans de la maison, si vous en avez', options: ETAT },
    ],
  },
  {
    section: 'Vos choix pour les dessins',
    questions: [
      { id: 'v_pieces', label: 'Liste finale des pièces et superficie confirmées', options: ETAT },
      { id: 'v_fondation', label: 'Type de fondation choisi', options: ETAT },
      { id: 'v_exterieur', label: 'Toiture et revêtements extérieurs choisis', options: ETAT },
      { id: 'v_chauffage', label: 'Chauffage et ventilation choisis', options: ETAT },
      { id: 'v_appareils', label: 'Forfait sur mesure : liste de vos appareils (voir le guide des appareils)', options: ETAT },
      { id: 'v_croquis', label: 'Croquis ou images d\'inspiration envoyés', options: ETAT },
    ],
  },
  {
    section: 'Organisation',
    questions: [
      { id: 'v_entrepreneur', label: 'Exigences de votre entrepreneur ou de votre institution financière', options: ETAT },
      { id: 'v_date_permis', label: 'Date visée pour déposer la demande de permis', placeholder: 'Ex. : 15 mars 2027' },
      { id: 'v_contact', label: 'Personne qui approuve les plans (si ce n\'est pas vous)', placeholder: 'Nom et courriel' },
    ],
  },
];

export const ETAPES = {
  questionnaire: {
    sections: QUESTIONNAIRE,
    titre: 'Questionnaire de votre projet',
    intro: 'Répondez à ce que vous savez déjà et joignez vos photos, croquis, certificat de localisation, PDF ou DWG. Nous nous en servons pour préparer votre soumission.',
    guides: [
      ['Préparer votre projet avant de faire faire vos plans', '/guides/guide-preparer-son-projet.pdf'],
      ['Comment faire un croquis de votre projet', '/guides/guide-faire-un-croquis.pdf'],
      ['Votre permis de construction au Québec, étape par étape', '/guides/guide-permis-de-construction.pdf'],
    ],
  },
  verification: {
    sections: VERIFICATION,
    titre: 'À vérifier avant le début des dessins',
    intro: 'Merci pour votre dépôt ! Avant de commencer vos dessins, confirmez ces points et joignez les documents que vous avez. Ça évite de redessiner plus tard.',
    guides: [
      ['À vérifier avant le début des dessins (version PDF)', '/guides/guide-verification-avant-dessins.pdf'],
      ['Guide des appareils (forfaits sur mesure)', '/guides/guide-des-appareils.pdf'],
      ['Comment faire un croquis de votre projet', '/guides/guide-faire-un-croquis.pdf'],
    ],
  },
};

export const answersToList = (sections, answers) => sections.flatMap(({ section, questions }) =>
  questions
    .filter(q => String(answers[q.id] ?? '').trim())
    .map(q => ({ section, question: q.label, reponse: String(answers[q.id]).trim() })));

// Réponses déjà enregistrées (liste) -> valeurs du formulaire (par id)
export const listToAnswers = (sections, list) => {
  const byLabel = Object.fromEntries((list || []).map(item => [item.question, item.reponse]));
  const answers = {};
  sections.forEach(({ questions }) => questions.forEach((q) => {
    if (byLabel[q.label] !== undefined) answers[q.id] = byLabel[q.label];
  }));
  return answers;
};
