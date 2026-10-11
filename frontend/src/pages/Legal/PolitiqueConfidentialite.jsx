import React from 'react';
import LegalPage from '../../components/LegalPage';

// Texte modifiable dans l'admin : Pages légales → Politique de confidentialité (Loi 25)
const PolitiqueConfidentialite = () => (
  <LegalPage pageId="politique-confidentialite" defaultTitle="Politique de confidentialité" path="/politique-confidentialite" />
);

export default PolitiqueConfidentialite;
