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

  const downloadCV = (candidature) => {
    window.open(`${BACKEND_URL}/api/employees/admin/candidatures/${candidature.id}/cv`, '_blank');
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
            <p className="text-sm text-slate-400 mt-2">Les candidatures apparaitront ici lorsque quelqu'un enverra son CV via la page Contact</p>
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
                      <div className="bg-stone-50 rounded-lg p-3 text-sm text-slate-600 border-l-3 border-teal-500">
                        {c.message}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {c.cv_filename || 'CV joint'}
                      </Badge>
                      <Badge className={c.status === 'nouvelle' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}>
                        {c.status || 'Nouvelle'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {c.cv_base64 && (
                      <Button size="sm" variant="outline" onClick={() => downloadCV(c)} className="border-teal-300 text-teal-700" data-testid={`download-cv-${c.id}`}>
                        <Download className="w-4 h-4 mr-1" /> Telecharger CV
                      </Button>
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
