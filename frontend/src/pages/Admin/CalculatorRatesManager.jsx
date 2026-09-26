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
      if (data.success) {
        toast({ title: "Tarif enregistré", description: "Le tarif du calculateur a été mis à jour" });
        if (data.data && data.data.length > 0) setRate(data.data[0]);
      }
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
            Tarif du calculateur
          </h2>
          <p className="text-gray-600 mt-1">Modifiez le tarif au pied carré affiché dans le calculateur de la page Devis</p>
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
    </div>
  );
};

export default CalculatorRatesManager;
