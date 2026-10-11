import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Save, Loader2, Calculator } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CalculatorRatesManager = () => {
  const { toast } = useToast();
  const [rate, setRate] = useState({ project_type: 'Tarif général', rate: 1.5, unit: '$/pi²' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Tarif des entrepreneurs (affiché sur la page Espace Pro)
  const [pro, setPro] = useState({ tarif_entrepreneur: '1,50', tarif_unite: '$ / pi²' });

  const loadRates = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/calculator-rates`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setRate(data.data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement tarif:', error);
      toast({ title: "Erreur", description: "Impossible de charger le tarif", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadRates(); }, [loadRates]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/content/pages/espace_pro`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        const c = data?.content || {};
        setPro(prev => ({
          tarif_entrepreneur: c.tarif_entrepreneur?.value ?? prev.tarif_entrepreneur,
          tarif_unite: c.tarif_unite?.value ?? prev.tarif_unite,
        }));
      })
      .catch(() => {});
  }, []);

  const saveProRate = async (token) => {
    for (const [section, value] of Object.entries(pro)) {
      const res = await fetch(`${BACKEND_URL}/api/admin/content/pages/espace_pro/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error();
    }
  };

  const saveRate = async () => {
    if (rate.rate <= 0) {
      toast({ title: "Erreur", description: "Le tarif doit être supérieur à 0", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/calculator-rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify([rate]),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      if (data.data && data.data.length > 0) setRate(data.data[0]);
      await saveProRate(token);
      toast({ title: "Tarifs enregistrés", description: "Le calculateur et la page Espace Pro sont à jour" });
    } catch (error) {
      console.error('Erreur sauvegarde tarif:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6" data-testid="calculator-rates-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Tarifs
          </h2>
          <p className="text-gray-600 mt-1">Le tarif du calculateur (page Devis) et le tarif des entrepreneurs (page Espace Pro)</p>
        </div>
        <Button onClick={saveRate} disabled={saving} className="bg-teal-700 hover:bg-teal-800" data-testid="save-rates-btn">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Tarif par pied carré</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  value={rate.rate}
                  onChange={(e) => setRate(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  className="text-xl font-bold text-center"
                  data-testid="rate-value-input"
                />
                <span className="text-lg font-medium text-gray-500 whitespace-nowrap">$ / pi²</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Aperçu</Label>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-700">
                  Pour une maison de <strong>30 × 40 pi</strong> (1 étage) :
                </p>
                <p className="text-2xl font-bold text-teal-800 mt-1">
                  ~ {Math.round(30 * 40 * rate.rate).toLocaleString('fr-CA')} $
                </p>
                <p className="text-xs text-teal-600 mt-1">1 200 pi² × {rate.rate} $/pi²</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p>Ce tarif est utilisé dans le calculateur de prix de la page <strong>Demander un devis</strong> pour donner une estimation préliminaire aux clients.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tarif entrepreneurs (Espace Pro)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Tarif</Label>
              <Input
                value={pro.tarif_entrepreneur}
                onChange={(e) => setPro(prev => ({ ...prev, tarif_entrepreneur: e.target.value }))}
                className="text-xl font-bold text-center"
                placeholder="1,50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Unité</Label>
              <Input
                value={pro.tarif_unite}
                onChange={(e) => setPro(prev => ({ ...prev, tarif_unite: e.target.value }))}
                placeholder="$ / pi²"
              />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p>Ce tarif est affiché sur la page <strong>Espace Pro</strong>, destinée aux entrepreneurs. L'assistant du site le connaît aussi.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorRatesManager;
