/*
 * Après « craco build » : écrit une copie de index.html pour chaque page publique
 * (build/<page>/index.html) avec son propre titre, sa description, son adresse
 * canonique et son texte principal. Voir seo/pages.js.
 */
const fs = require('fs');
const path = require('path');
const pages = require('../seo/pages');

const SITE = 'https://abrisia-plan.ca';
const buildDir = path.join(__dirname, '..', 'build');
const template = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}"/>`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `${tag}</head>`);
};

const body = (page) => {
  let out = `<header><a href="/">Abrisia Plan</a></header><main><h1>${esc(page.h1)}</h1>`;
  for (const s of page.sections || []) {
    if (s.h2) out += `<h2>${esc(s.h2)}</h2>`;
    for (const p of s.p || []) out += `<p>${esc(p)}</p>`;
    if (s.list) out += `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`;
  }
  if (page.links && page.links.length) {
    out += `<nav><ul>${page.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('')}</ul></nav>`;
  }
  return out + '</main>';
};

for (const page of pages) {
  const url = SITE + (page.path === '/' ? '/' : page.path);
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  if (page.path !== '/') html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  // Pas d'adresse canonique sur la page d'accueil : son fichier sert aussi de secours
  // pour toutes les autres adresses (admin, pages légales...), qui ont la leur.
  if (page.path !== '/') html = html.replace('</head>', `<link rel="canonical" href="${url}"/></head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${body(page)}</div>`);

  const outDir = page.path === '/' ? buildDir : path.join(buildDir, page.path);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}
console.log(`Pages pré-remplies pour les robots : ${pages.length}`);
