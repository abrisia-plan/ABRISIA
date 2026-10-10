import React from 'react';

// Illustrations en traits, dans le style d'un plan de dessinatrice.
// Elles prennent la couleur du texte (currentColor) : on les colore avec text-*.

// Plan d'étage simple : murs, ouvertures de portes, fenêtres, cotes
export const FloorPlanDrawing = ({ className = '' }) => (
  <svg viewBox="0 0 400 300" fill="none" stroke="currentColor" className={className} aria-hidden="true">
    <g strokeWidth="6" strokeLinecap="square">
      <path d="M40 40 H360 V260 H40 Z" />
      <path d="M200 40 V140" />
      <path d="M200 185 V260" />
      <path d="M40 150 H130" />
      <path d="M165 150 H200" />
    </g>
    <g strokeWidth="1.5">
      {/* portes */}
      <path d="M130 150 A35 35 0 0 1 165 185" />
      <path d="M130 150 V185" strokeDasharray="3 3" />
      <path d="M200 140 A45 45 0 0 1 245 185" />
      <path d="M200 185 H245" strokeDasharray="3 3" />
      {/* fenêtres */}
      <path d="M90 36 H150 M90 44 H150" />
      <path d="M260 36 H320 M260 44 H320" />
      <path d="M356 170 V230 M364 170 V230" />
      {/* cotes */}
      <path d="M40 285 H360 M40 278 V292 M360 278 V292" />
      <path d="M380 40 V260 M373 40 H387 M373 260 H387" />
    </g>
    <g fill="currentColor" stroke="none" fontSize="11" fontFamily="inherit" textAnchor="middle">
      <text x="200" y="281">32&apos;-0&quot;</text>
      <text x="392" y="154" transform="rotate(90 392 154)">22&apos;-0&quot;</text>
      <text x="120" y="100">SÉJOUR</text>
      <text x="280" y="100">CUISINE</text>
      <text x="120" y="215">CHAMBRE</text>
      <text x="290" y="225">S. DE BAIN</text>
    </g>
  </svg>
);

// Élévation de chalet : toit, fenêtres, sol
export const ElevationDrawing = ({ className = '' }) => (
  <svg viewBox="0 0 400 300" fill="none" stroke="currentColor" className={className} aria-hidden="true">
    <g strokeWidth="4" strokeLinejoin="round">
      <path d="M70 250 V140 L200 50 L330 140 V250" />
      <path d="M50 154 L200 40 L350 154" />
    </g>
    <g strokeWidth="2">
      <path d="M170 250 V180 H230 V250" />
      <path d="M95 165 H145 V215 H95 Z M120 165 V215 M95 190 H145" />
      <path d="M255 165 H305 V215 H255 Z M280 165 V215 M255 190 H305" />
      <path d="M180 105 L200 90 L220 105 V130 H180 Z" />
    </g>
    <g strokeWidth="1.5">
      <path d="M20 250 H380" />
      <path d="M20 262 H380" strokeDasharray="8 4" />
      <path d="M30 140 H60 M30 250 H60 M45 140 V250" />
    </g>
    <g fill="currentColor" stroke="none" fontSize="11" fontFamily="inherit" textAnchor="middle">
      <text x="200" y="285">ÉLÉVATION AVANT</text>
    </g>
  </svg>
);

// Meuble sur mesure : bibliothèque intégrée vue de face
export const FurnitureDrawing = ({ className = '' }) => (
  <svg viewBox="0 0 400 300" fill="none" stroke="currentColor" className={className} aria-hidden="true">
    <g strokeWidth="4">
      <path d="M80 30 H320 V260 H80 Z" />
    </g>
    <g strokeWidth="2">
      <path d="M160 30 V260 M240 30 V260" />
      <path d="M80 90 H160 M80 150 H160 M240 90 H320 M240 150 H320" />
      <path d="M160 120 H240" />
      <path d="M80 190 H320" />
      <path d="M200 190 V260" />
      <path d="M190 225 H194 M206 225 H210" strokeWidth="3" />
    </g>
    <g strokeWidth="1.5">
      <path d="M95 60 V88 M103 55 V88 M111 62 V88 M140 70 L150 88" />
      <path d="M255 125 V148 M263 118 V148 M300 128 H315 V148 H300 Z" />
      <path d="M80 280 H320 M80 273 V287 M320 273 V287" />
    </g>
    <g fill="currentColor" stroke="none" fontSize="11" fontFamily="inherit" textAnchor="middle">
      <text x="200" y="298">BIBLIOTHÈQUE INTÉGRÉE</text>
    </g>
  </svg>
);

// Quadrillage de papier à plan, en arrière-plan
export const BlueprintGrid = ({ className = '' }) => (
  <svg className={className} aria-hidden="true">
    <defs>
      <pattern id="petit-carre" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0 H0 V20" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
      <pattern id="grand-carre" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#petit-carre)" />
        <path d="M100 0 H0 V100" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grand-carre)" />
  </svg>
);
