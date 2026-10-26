import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Mail, Phone, Calendar, Loader2, Trash2, User } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CandidaturesManager = () => {
  const { toast } = useToast();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCandidatures(); }, []);

  const getToken = () => localStorage.getItem('authToken');

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/employees/admin/candidatures`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setCandidatures(data.data || []);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de charger les candidatures", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidature = async (id) => {
    if (!window.confirm('Supprimer cette candidature ?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/employees/admin/candidatures/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Candidature supprimee" });
        loadCandidatures();
      }
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const STATUTS = ['nouvelle', 'lue', 'retenue', 'refusée'];

  const setStatus = async (candidature, status) => {
    setCandidatures(prev => prev.map(c => c.id === candidature.id ? { ...c, status } : c));
    try {
      await fetch(`${BACKEND_URL}/api/employees/admin/candidatures/${candidature.id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      toast({ title: "Erreur", description: "Statut non enregistré", variant: "destructive" });
    }
  };

  // Le CV exige la connexion admin : on le récupère avec le jeton puis on l'ouvre ou on le télécharge
  const openCV = async (candidature, download = false) => {
    const win = download ? null : window.open('', '_blank');
    try {
      const res = await fetch(`${BACKEND_URL}/api/employees/admin/candidatures/${candidature.id}/cv`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      if (win) {
        win.location.href = url;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = candidature.cv_filename || 'cv.pdf';
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      if ((candidature.status || 'nouvelle') === 'nouvelle') setStatus(candidature, 'lue');
    } catch (err) {
      if (win) win.close();
      toast({ title: "Erreur", description: "Impossible d'ouvrir le CV", variant: "destructive" });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="candidatures-manager">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Candidatures recues</h2>
        <p className="text-gray-600 mt-1">{candidatures.length} candidature(s) au total</p>
      </div>

      {candidatures.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Aucune candidature recue pour le moment</p>
            <p className="text-sm text-slate-400 mt-2">Les candidatures apparaîtront ici quand quelqu'un enverra son CV (pages Contact et Carrières). Le CV vous arrive aussi par courriel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {candidatures.map((c) => (
            <Card key={c.id} className="border-stone-200 hover:shadow-md transition-shadow" data-testid={`candidature-${c.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{c.nom}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            <a href={`mailto:${c.email}`} className="text-teal-700 hover:underline">{c.email}</a>
                          </span>
                          {c.telephone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {c.telephone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(c.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {c.message && (
                      <div className="bg-stone-50 rounded-lg p-3 text-sm text-slate-600 border-l-4 border-teal-500 whitespace-pre-wrap">
                        {c.message}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {c.cv_filename || 'CV joint'}
                      </Badge>
                      <select
                        value={c.status || 'nouvelle'}
                        onChange={(e) => setStatus(c, e.target.value)}
                        className={`text-xs rounded-full px-2 py-1 border ${(c.status || 'nouvelle') === 'nouvelle' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                        title="Changer le statut"
                        data-testid={`status-${c.id}`}
                      >
                        {STATUTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {c.cv_sent_by_email && !c.has_cv && (
                      <span className="text-xs text-slate-500 self-center max-w-[10rem]">Ce CV est seulement dans votre boîte courriel (reçu avant la mise à jour)</span>
                    )}
                    {c.has_cv && (
                      <>
                        <Button size="sm" className="bg-teal-700 hover:bg-teal-800" onClick={() => openCV(c)} data-testid={`open-cv-${c.id}`}>
                          <FileText className="w-4 h-4 mr-1" /> Ouvrir le CV
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openCV(c, true)} className="border-teal-300 text-teal-700" data-testid={`download-cv-${c.id}`}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => deleteCandidature(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidaturesManager;
