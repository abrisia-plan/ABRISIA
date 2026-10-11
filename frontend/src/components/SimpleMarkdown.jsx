import React from 'react';

// Affiche un texte écrit avec une mise en forme simple (comme dans l'admin) :
// « # Titre », « ## Sous-titre », « - élément de liste », « **gras** ».
// Aucun HTML n'est interprété : le texte est affiché tel quel, en sécurité.

const inline = (text, keyBase) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={`${keyBase}-${i}`}>{part}</React.Fragment>
  );

const SimpleMarkdown = ({ text = '', skipTitle = '' }) => {
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: 'p', lines: para }); para = []; } };
  const flushList = () => { if (list.length) { blocks.push({ type: 'ul', items: list }); list = []; } };

  text.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); return; }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushPara(); flushList();
      // Le titre de la page est déjà affiché en haut : on ne le répète pas
      if (heading[1].length === 1 && heading[2].trim() === skipTitle.trim()) return;
      blocks.push({ type: `h${heading[1].length + 1}`, text: heading[2] });
      return;
    }
    if (/^[-*]\s+/.test(line)) { flushPara(); list.push(line.replace(/^[-*]\s+/, '')); return; }
    flushList();
    para.push(line);
  });
  flushPara(); flushList();

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed">
      {blocks.map((b, i) => {
        if (b.type === 'ul') {
          return (
            <ul key={i} className="list-disc pl-6 space-y-1">
              {b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}
            </ul>
          );
        }
        if (b.type === 'p') {
          return (
            <p key={i}>
              {b.lines.map((l, j) => (
                <React.Fragment key={j}>{j > 0 && <br />}{inline(l, `${i}-${j}`)}</React.Fragment>
              ))}
            </p>
          );
        }
        const Tag = b.type;
        const cls = Tag === 'h2' ? 'text-2xl font-bold text-slate-800 pt-2' : Tag === 'h3' ? 'text-xl font-semibold text-slate-800 pt-2' : 'text-lg font-semibold text-slate-800';
        return <Tag key={i} className={cls}>{inline(b.text, `${i}`)}</Tag>;
      })}
    </div>
  );
};

export default SimpleMarkdown;
