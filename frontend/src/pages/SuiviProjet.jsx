import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Send, CheckCircle, Loader2, Paperclip, X, FileText } from 'lucide-react';
import QuestionFields from '../components/QuestionFields';
import { ETAPES, answersToList, listToAnswers } from '../data/questionnaire';
import { devisService, handleApiError } from '../services/api';

const MAX_FILES = 10;
const MAX_TOTAL_MB = 18;
const ACCEPTED_FILES = '.jpg,.jpeg,.png,.gif,.webp,.heic,.heif,.bmp,.tif,.tiff,.pdf,.dwg,.dxf,.skp,.rvt,.ifc,.doc,.docx,.xls,.xlsx,.odt,.ods,.txt,.rtf,.zip';
const formatSize = (bytes) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} Ko`
  : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;

// Page du lien personnel envoyé au client par courriel :
// /suivi/:id/questionnaire (avant la soumission) ou /suivi/:id/verification (après le dépôt)
const SuiviProjet = () => {
  const { id, etape } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t') || '';
  const config = ETAPES[etape];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prenom, setPrenom] = useState('');
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!config) { setError('Ce lien n\'est pas valide.'); setLoading(false); return; }
    devisService.getSuivi(id, token, etape)
      .then((data) => {
        setPrenom(data.prenom || '');
        setAnswers(listToAnswers(config.sections, data.reponses));
      })
      .catch((err) => setError(handleApiError(err)))
      .finally(() => setLoading(false));
  }, [id, token, etape, config]);

  const setAnswer = (qid, value) => setAnswers(prev => ({ ...prev, [qid]: value }));

  const handleFilesChange = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const maxBytes = MAX_TOTAL_MB * 1024 * 1024;
    const accepted = [...files];
    const refused = [];
    let total = files.reduce((sum, f) => sum + f.size, 0);
    picked.forEach(f => {
      if (accepted.length < MAX_FILES && total + f.size <= maxBytes) {
        accepted.push(f);
        total += f.size;
      } else {
        refused.push(f.name);
      }
    });
    setFileError(refused.length
      ? `Non ajouté (maximum ${MAX_FILES} fichiers et ${MAX_TOTAL_MB} Mo au total) : ${refused.join(', ')}. Vous pourrez nous les envoyer en répondant à notre courriel.`
      : '');
    setFiles(accepted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await devisService.submitSuivi(id, token, etape, answersToList(config.sections, answers), files);
      setSent(true);
      setFiles([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-stone-50">
      <Helmet>
        <title>{config ? config.titre : 'Suivi de projet'} | Abrisia Plan</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="py-12 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{config ? config.titre : 'Suivi de projet'}</h1>
          {prenom && <p className="text-lg text-teal-100">Bonjour {prenom} !</p>}
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-700" /></div>
          ) : !config || (error && !prenom) ? (
            <Card><CardContent className="p-8 text-center text-slate-700">
              <p className="mb-2">{error || 'Ce lien n\'est pas valide.'}</p>
              <p className="text-sm">Utilisez le lien reçu par courriel, ou écrivez-nous à abrisia0plan@gmail.com.</p>
            </CardContent></Card>
          ) : (
            <Card className="shadow-xl border-stone-200 bg-white">
              <CardContent className="p-6 md:p-8 space-y-8">
                {sent && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800" role="status">
                    <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <p>Merci ! Vos réponses ont bien été ajoutées à votre dossier. Vous pouvez revenir sur cette page pour les compléter ou ajouter des fichiers.</p>
                  </div>
                )}
                <p className="text-slate-700">{config.intro}</p>

                <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                  <p className="font-medium text-slate-800 mb-2">Nos guides, au besoin :</p>
                  <ul className="space-y-1">
                    {config.guides.map(([nom, href]) => (
                      <li key={href}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-teal-800 underline">
                          <FileText className="h-4 w-4 shrink-0" />{nom}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <QuestionFields sections={config.sections} answers={answers} onChange={setAnswer} />

                  <div className="space-y-2">
                    <p className="text-slate-700 font-medium">Joindre des fichiers (optionnel)</p>
                    <p className="text-sm text-slate-600">
                      Photos, croquis, certificat de localisation, règles de la municipalité, PDF ou DWG. Maximum {MAX_FILES} fichiers et {MAX_TOTAL_MB} Mo par envoi.
                    </p>
                    <label htmlFor="suivi-files" className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors text-slate-700">
                      <Paperclip className="h-5 w-5" />
                      Choisir des fichiers ou prendre une photo
                    </label>
                    <input id="suivi-files" type="file" multiple accept={ACCEPTED_FILES} onChange={handleFilesChange} className="hidden" />
                    {fileError && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3" role="alert">{fileError}</p>}
                    {files.length > 0 && (
                      <ul className="space-y-2">
                        {files.map((file, index) => (
                          <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 p-2 bg-stone-50 border border-stone-200 rounded text-sm">
                            <span className="truncate">{file.name}</span>
                            <span className="flex items-center gap-2 shrink-0 text-slate-500">
                              {formatSize(file.size)}
                              <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))} className="p-1 rounded hover:bg-stone-200" aria-label={`Retirer ${file.name}`}>
                                <X className="h-4 w-4" />
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3" role="alert">{error}</p>}

                  <Button type="submit" size="lg" disabled={submitting} className="w-full bg-teal-800 hover:bg-teal-900 text-white py-4 text-lg font-semibold rounded-full">
                    {submitting
                      ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" />Envoi en cours...</>
                      : <><Send className="mr-3 h-5 w-5" />Envoyer mes réponses</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default SuiviProjet;
