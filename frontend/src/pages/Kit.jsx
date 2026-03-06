import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Eye, 
  ArrowRight, 
  ShoppingCart, 
  FileText, 
  Ruler, 
  Home,
  Loader2,
  Star,
  Check,
  User,
  Package,
  CreditCard,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Kit = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedKit, setSelectedKit] = useState(null);
  const [kits, setKits] = useState([]);
  const [categories, setCategories] = useState(['Tous']);
  const [loading, setLoading] = useState(true);
  
  // État pour le formulaire de commande
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [includeMaterials, setIncludeMaterials] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Conversion pi² → m²
  const sqftToSqm = (surfaceStr) => {
    if (!surfaceStr) return null;
    const match = surfaceStr.match(/[\d.]+/);
    if (!match) return null;
    const sqft = parseFloat(match[0]);
    return (sqft * 0.092903).toFixed(1);
  };

  useEffect(() => {
    loadKits();
  }, [selectedCategory]);

  const loadKits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'Tous') {
        params.append('category', selectedCategory);
      }
      params.append('per_page', '50');

      const response = await fetch(`${BACKEND_URL}/api/products?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setKits(data.data || []);
        
        // Extraire les catégories
        const uniqueCategories = [...new Set(data.data.map(k => k.category))];
        setCategories(['Tous', ...uniqueCategories]);
      }
    } catch (error) {
      console.error('Erreur chargement kits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les kits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openKitModal = (kit) => {
    setSelectedKit(kit);
    setIncludeMaterials(false);
    setShowOrderForm(false);
    setOrderSuccess(null);
    setOrderForm({ name: '', email: '', phone: '', notes: '' });
  };

  const closeKitModal = () => {
    setSelectedKit(null);
    setShowOrderForm(false);
    setOrderSuccess(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateTotal = () => {
    if (!selectedKit) return { base: 0, materials: 0, subtotal: 0, tax: 0, total: 0 };
    
    const base = selectedKit.finalPrice || selectedKit.price;
    const materials = includeMaterials && selectedKit.materialsListEnabled 
      ? (selectedKit.materialsListPrice || 0) 
      : 0;
    const subtotal = base + materials;
    const taxRate = 14.975; // TPS + TVQ Québec
    const tax = subtotal * taxRate / 100;
    const total = subtotal + tax;
    
    return { base, materials, subtotal, tax, total };
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderForm.name || !orderForm.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir votre nom et email",
        variant: "destructive"
      });
      return;
    }

    setOrderSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/kits/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kit_id: selectedKit.id,
          customer_name: orderForm.name,
          customer_email: orderForm.email,
          customer_phone: orderForm.phone,
          include_materials: includeMaterials,
          notes: orderForm.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderSuccess(data.order);
        toast({
          title: "✅ Commande créée !",
          description: `Numéro de commande: ${data.order.orderNumber}`
        });
      } else {
        throw new Error(data.detail || 'Erreur lors de la commande');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const prices = calculateTotal();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Kits de Plans
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Plans pré-dessinés prêts à acheter. Commencez votre projet dès maintenant avec nos plans professionnels.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === category 
                    ? 'bg-teal-800 hover:bg-teal-900 text-white' 
                    : 'border-stone-300 text-teal-700 hover:bg-stone-50'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Kits Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              {kits.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-xl text-slate-500 mb-4">
                    Aucun kit disponible pour le moment.
                  </p>
                  <p className="text-slate-400">
                    Les plans pré-dessinés seront bientôt disponibles.
                  </p>
                  <Link to="/devis">
                    <Button className="mt-6 bg-teal-800 hover:bg-teal-900">
                      Demander un devis personnalisé
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {kits.map((kit) => (
                    <Card key={kit.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-stone-200 cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img
                          src={kit.mainImage}
                          alt={kit.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="rounded-full"
                              onClick={() => openKitModal(kit)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir les détails
                            </Button>
                          </div>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-teal-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {kit.category}
                          </span>
                        </div>
                        {kit.materialsListEnabled && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              +Matériaux
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6" onClick={() => openKitModal(kit)}>
                        <h3 className="text-xl font-semibold text-slate-800 mb-1 group-hover:text-teal-800 transition-colors">
                          {kit.name}
                        </h3>
                        
                        {kit.designerName && (
                          <p className="text-sm text-slate-500 mb-2 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {kit.designerName}
                          </p>
                        )}
                        
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                          {kit.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {kit.surfaceArea && (
                              <Badge variant="outline" className="text-xs">
                                <Ruler className="w-3 h-3 mr-1" />
                                {kit.surfaceArea}
                              </Badge>
                            )}
                            {kit.rating > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                                {kit.rating}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {kit.originalPrice && kit.originalPrice > kit.price && (
                              <p className="text-sm text-slate-400 line-through">
                                {formatPrice(kit.originalPrice)}
                              </p>
                            )}
                            <p className="text-2xl font-bold text-teal-700">
                              {formatPrice(kit.finalPrice || kit.price)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Bandeau CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Besoin d'un plan personnalisé ?
          </h2>
          <p className="text-xl text-teal-100 mb-8 leading-relaxed">
            Nos kits ne correspondent pas exactement à vos besoins ? Demandez un devis sur mesure !
          </p>
          <Link to="/devis">
            <Button size="lg" variant="secondary" className="bg-white text-teal-800 hover:bg-teal-50 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300">
              Demander un devis personnalisé
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Kit Modal avec formulaire de commande */}
      <Dialog open={!!selectedKit} onOpenChange={closeKitModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedKit && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
                  {selectedKit.name}
                </DialogTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className="w-fit bg-teal-100 text-teal-800">
                    {selectedKit.category}
                  </Badge>
                  {selectedKit.designerName && (
                    <Badge variant="outline" className="w-fit flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {selectedKit.designerName}
                    </Badge>
                  )}
                  {selectedKit.difficultyLevel && (
                    <Badge variant="outline" className="w-fit">
                      Niveau: {selectedKit.difficultyLevel}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              
              {!showOrderForm && !orderSuccess ? (
                // Vue détails du kit
                <div className="space-y-6">
                  <img
                    src={selectedKit.mainImage}
                    alt={selectedKit.name}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  <div>
                    <p className="text-lg text-slate-700 mb-4">{selectedKit.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {selectedKit.surfaceArea && (
                        <div className="bg-stone-50 p-4 rounded-lg text-center">
                          <Ruler className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Surface</p>
                          <p className="font-semibold text-slate-800">{selectedKit.surfaceArea}</p>
                          {sqftToSqm(selectedKit.surfaceArea) && (
                            <p className="text-xs text-gray-400 mt-1">≈ {sqftToSqm(selectedKit.surfaceArea)} m²</p>
                          )}
                        </div>
                      )}
                      {selectedKit.dimensions && (
                        <div className="bg-stone-50 p-4 rounded-lg text-center">
                          <Home className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Dimensions</p>
                          <p className="font-semibold text-slate-800">{selectedKit.dimensions}</p>
                        </div>
                      )}
                      {selectedKit.rooms && (
                        <div className="bg-stone-50 p-4 rounded-lg text-center">
                          <FileText className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Pièces</p>
                          <p className="font-semibold text-slate-800">{selectedKit.rooms}</p>
                        </div>
                      )}
                      <div className="bg-stone-50 p-4 rounded-lg text-center">
                        <FileText className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Format</p>
                        <p className="font-semibold text-slate-800">{(selectedKit.fileFormats || ['PDF']).join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {selectedKit.includes && selectedKit.includes.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Ce kit comprend :</h4>
                      <ul className="space-y-2">
                        {selectedKit.includes.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="w-5 h-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-slate-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Option liste matériaux */}
                  {selectedKit.materialsListEnabled && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="materials"
                          checked={includeMaterials}
                          onCheckedChange={setIncludeMaterials}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor="materials" className="font-semibold text-slate-800 cursor-pointer flex items-center">
                            <Package className="w-5 h-5 text-amber-600 mr-2" />
                            Ajouter la liste complète des matériaux
                            <span className="ml-2 text-amber-600 font-bold">
                              +{formatPrice(selectedKit.materialsListPrice)}
                            </span>
                          </label>
                          <p className="text-sm text-slate-600 mt-1">
                            Recevez un PDF détaillé avec tous les matériaux nécessaires et leurs quantités
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prix et CTA */}
                  <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-slate-500">Prix du kit</p>
                        <div className="flex items-center gap-2">
                          {selectedKit.originalPrice && selectedKit.originalPrice > selectedKit.price && (
                            <span className="text-lg text-slate-400 line-through">
                              {formatPrice(selectedKit.originalPrice)}
                            </span>
                          )}
                          <span className="text-3xl font-bold text-teal-700">
                            {formatPrice(prices.base)}
                          </span>
                        </div>
                        {includeMaterials && (
                          <p className="text-amber-600 font-semibold mt-1">
                            + {formatPrice(prices.materials)} (matériaux)
                          </p>
                        )}
                      </div>
                      {selectedKit.discountPercentage && (
                        <Badge className="bg-red-500 text-white">
                          -{selectedKit.discountPercentage}%
                        </Badge>
                      )}
                    </div>

                    {/* Résumé du prix */}
                    <div className="border-t border-amber-200 pt-4 mb-4">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Sous-total</span>
                        <span>{formatPrice(prices.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Taxes (TPS+TVQ)</span>
                        <span>{formatPrice(prices.tax)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-teal-800">
                        <span>Total</span>
                        <span>{formatPrice(prices.total)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowOrderForm(true)}
                      className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 text-lg font-semibold rounded-full"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Commander ce kit
                    </Button>
                    <p className="text-center text-sm text-slate-500 mt-3">
                      Paiement par Interac ou virement bancaire
                    </p>
                  </div>
                </div>
              ) : orderSuccess ? (
                // Confirmation de commande
                <div className="space-y-6 text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      Commande confirmée !
                    </h3>
                    <p className="text-slate-600">
                      Merci pour votre commande. Vous recevrez un email avec les instructions de paiement.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-lg text-left max-w-md mx-auto">
                    <h4 className="font-semibold text-slate-800 mb-4">Détails de la commande</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Numéro</span>
                        <span className="font-mono font-bold">{orderSuccess.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kit</span>
                        <span>{orderSuccess.kitName}</span>
                      </div>
                      {orderSuccess.includeMaterials && (
                        <div className="flex justify-between text-amber-600">
                          <span>Liste matériaux</span>
                          <span>+{formatPrice(orderSuccess.materialsPrice)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total à payer</span>
                          <span className="text-teal-700">{formatPrice(orderSuccess.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg text-left max-w-md mx-auto">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Instructions de paiement
                    </h4>
                    <p className="text-sm text-amber-700">
                      Vous recevrez un email avec les détails pour effectuer votre paiement par Interac ou virement bancaire.
                      Une fois le paiement confirmé, vos fichiers vous seront envoyés par email.
                    </p>
                  </div>

                  <Button onClick={closeKitModal} variant="outline">
                    Fermer
                  </Button>
                </div>
              ) : (
                // Formulaire de commande
                <form onSubmit={handleOrderSubmit} className="space-y-6">
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-800 mb-2">Récapitulatif</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>{selectedKit.name}</span>
                        <span>{formatPrice(prices.base)}</span>
                      </div>
                      {includeMaterials && (
                        <div className="flex justify-between text-amber-600">
                          <span>+ Liste matériaux</span>
                          <span>{formatPrice(prices.materials)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500">
                        <span>Taxes</span>
                        <span>{formatPrice(prices.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-teal-200">
                        <span>Total</span>
                        <span className="text-teal-700">{formatPrice(prices.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Vos informations</h3>
                    
                    <div>
                      <Label htmlFor="name" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Nom complet *
                      </Label>
                      <Input
                        id="name"
                        value={orderForm.name}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Votre nom"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={orderForm.email}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre@email.com"
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Les fichiers seront envoyés à cette adresse après paiement
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Téléphone (optionnel)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(XXX) XXX-XXXX"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Input
                        id="notes"
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Questions ou commentaires..."
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={orderSubmitting}
                      className="flex-1 bg-teal-800 hover:bg-teal-900"
                    >
                      {orderSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Confirmer la commande
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOrderForm(false)}
                    >
                      Retour
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Kit;
