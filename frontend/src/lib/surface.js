// Ajoute l'équivalent en pieds carrés à une surface écrite en mètres carrés
// (« 45 m² » devient « 45 m² (484 pi²) »). Le texte est laissé tel quel s'il
// donne déjà des pieds carrés ou s'il ne contient pas de mètres carrés.
const M2_EN_PI2 = 10.7639;

export function surfaceAvecPieds(texte) {
  if (!texte) return texte;
  const s = String(texte);
  if (/pi\s*²|pi2|pieds?\s*carr|sq\.?\s*ft|ft²|pc\b/i.test(s)) return s;
  return s.replace(/(\d+(?:[.,]\d+)?)\s*(m²|m2|mètres?\s+carrés?)/gi, (tout, nombre) => {
    const m2 = parseFloat(nombre.replace(',', '.'));
    if (!Number.isFinite(m2)) return tout;
    const pi2 = Math.round(m2 * M2_EN_PI2).toLocaleString('fr-CA');
    return `${tout} (${pi2} pi²)`;
  });
}
