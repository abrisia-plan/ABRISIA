import React from 'react';
import LegalPage from '../../components/LegalPage';

// Texte modifiable dans l'admin : Pages légales → Mentions légales
const MentionsLegales = () => (
  <LegalPage pageId="mentions-legales" defaultTitle="Mentions légales" path="/mentions-legales" />
);

export default MentionsLegales;
