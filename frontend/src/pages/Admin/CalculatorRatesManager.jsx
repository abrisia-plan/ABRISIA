import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Save, Loader2, Calculator, Plus, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CalculatorRatesManager = () => {
  const { toast } = useToast();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRates = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/calculator-rates`);
      const data = await res.json();
      if (data.success) setRates(data.data);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les tarifs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadRates(); }, [loadRates]);

  const updateRate = (index, field, value) => {
    setRates(prev => prev.map((r, i) => i === index ? { ...r, [field]: field === 'rate' ? parseFloat(value) || 0 : value } : r));
  };

  const addRate = () => {
    setRates(prev => [...prev, { project_type: '', rate: 0, unit: '$/pi²' }]);
  };

  const removeRate = (index) => {
    setRates(prev => prev.filter((_, i) => i !== index));
  };

  const saveRates = async () => {
    const valid = rates.filter(r => r.project_type.trim());
    if (valid.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins un type de projet", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BACKEND_URL}/api/calculator-rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(valid),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Tarifs enregistrés", description: "Les tarifs du calculateur ont été mis à jour" });
        setRates(data.data);
      }
    } catch {
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
            Tarifs du calculateur
          </h2>
          <p className="text-gray-600 mt-1">Gérez les tarifs affichés dans le calculateur de prix du formulaire de devis</p>
        </div>
        <Button onClick={saveRates} disabled={saving} className="bg-teal-700 hover:bg-teal-800" data-testid="save-rates-btn">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 text-sm font-semibold text-gray-500 border-b pb-2">
            <div className="col-span-5">Type de projet</div>
            <div className="col-span-3">Tarif</div>
            <div className="col-span-3">Unité</div>
            <div className="col-span-1"></div>
          </div>

          {rates.map((rate, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center" data-testid={`rate-row-${index}`}>
              <div className="col-span-5">
                <Input
                  value={rate.project_type}
                  onChange={(e) => updateRate(index, 'project_type', e.target.value)}
                  placeholder="Ex: Maison unifamiliale"
                  data-testid={`rate-type-${index}`}
                />
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.25"
                    min="0"
                    value={rate.rate}
                    onChange={(e) => updateRate(index, 'rate', e.target.value)}
                    data-testid={`rate-value-${index}`}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">$</span>
                </div>
              </div>
              <div className="col-span-3">
                <select
                  value={rate.unit}
                  onChange={(e) => updateRate(index, 'unit', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="$/pi²">$/pi²</option>
                  <option value="Sur devis">Sur devis</option>
                  <option value="Forfait">Forfait</option>
                </select>
              </div>
              <div className="col-span-1">
                <Button variant="ghost" size="icon" onClick={() => removeRate(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addRate} className="w-full border-dashed" data-testid="add-rate-btn">
            <Plus className="w-4 h-4 mr-2" /> Ajouter un type de projet
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p>Ces tarifs sont utilisés dans le calculateur de prix de la page <strong>Demander un devis</strong>.</p>
            <p className="mt-1">Un tarif à <strong>0$</strong> avec l'unité "Sur devis" affichera un message invitant le client à demander un devis personnalisé.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorRatesManager;
