import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SEO from './SEO';
import SimpleMarkdown from './SimpleMarkdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Page légale dont le texte se modifie dans l'admin (Pages légales)
const LegalPage = ({ pageId, defaultTitle, path }) => {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/content/legal/${pageId}`)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => setPage(data.data))
      .catch(() => setError(true));
  }, [pageId]);

  const title = page?.title || defaultTitle;

  return (
    <div className="min-h-screen pt-20 bg-stone-50">
      <SEO title={title} path={path} />
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 sm:p-10">
            <h1 className="text-3xl font-bold text-slate-800 text-center mb-8">{title}</h1>
            {page ? (
              <SimpleMarkdown text={page.content} skipTitle={title} />
            ) : error ? (
              <p className="text-center text-slate-600">
                Cette page n'a pas pu être chargée. Écrivez-nous à abrisia0plan@gmail.com pour toute question.
              </p>
            ) : (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-teal-700" /></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;
