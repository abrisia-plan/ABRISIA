import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { resolveImageUrl } from '../services/api';
import {
  ShoppingCart, Filter, X, ChevronDown, ChevronUp,
  Ruler, BedDouble, Bath, Layers, Home, Eye, Plus, Minus, Trash2,
  ArrowRight, Check, Loader2, SlidersHorizontal, Paintbrush, CreditCard, ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Collection = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState({});

  // Panier
  const [cartSessionId] = useState(() => {
    let id = localStorage.getItem('abrisia_cart_id');
    if (!id) { id = 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9); localStorage.setItem('abrisia_cart_id', id); }
    return id;
  });
  const [cart, setCart] = useState({ items: [], subtotal: 0, tps: 0, tvq: 0, total: 0 });
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Personnalisation modal
  const [showCustomize, setShowCustomize] = useState(false);
  const [customizeModel, setCustomizeModel] = useState(null);
  const [customizeForm, setCustomizeForm] = useState({ first_name: '', last_name: '', email: '', phone: '', message: '' });
  const [customizeLoading, setCustomizeLoading] = useState(false);

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Gallery
  const [galleryIndex, setGalleryIndex] = useState(0);
  const allImages = selectedModel
    ? [selectedModel.mainImage, ...(selectedModel.galleryImages || [])].filter(Boolean)
    : [];

  useEffect(() => {
    loadModels();
    loadFilters();
    loadOptions();
    loadCart();
    // eslint-disable-next-line
  }, []);

  const loadModels = async (filterParams = {}) => {
    try {
      setLoading(true);
      let url = `${BACKEND_URL}/api/products?per_page=50`;
      if (filterParams.tag) url += `&tag=${filterParams.tag}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setModels(data.data || []);
    } catch (err) {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collection/filters`);
      const data = await res.json();
      if (data.success) setFilters(data.data);
    } catch (err) { /* silent */ }
  };

  const loadOptions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collection/options`);
      const data = await res.json();
      if (data.success) setProductOptions(data.data);
    } catch (err) { /* silent */ }
  };

  const loadCart = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collection/cart/${cartSessionId}`);
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
        setCartCount(data.data.items?.length || 0);
      }
    } catch (err) { /* silent */ }
  };

  const loadVariants = async (productId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collection/models/${productId}/variants`);
      const data = await res.json();
      if (data.success) setVariants(data.data);
    } catch (err) { /* silent */ }
  };

  const openModel = async (model) => {
    setSelectedModel(model);
    setSelectedVariant(null);
    setSelectedOptionIds([]);
    setGalleryIndex(0);
    await loadVariants(model.id);
  };

  const toggleOption = (optionId) => {
    setSelectedOptionIds(prev =>
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const addToCart = async () => {
    if (!selectedModel) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/collection/cart/${cartSessionId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedModel.id,
          variant_id: selectedVariant?.id || null,
          selected_option_ids: selectedOptionIds,
          quantity: 1,
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Ajouté au panier", description: `${selectedModel.name} a été ajouté` });
        setSelectedModel(null);
        loadCart();
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'ajouter au panier", variant: "destructive" });
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await fetch(`${BACKEND_URL}/api/collection/cart/${cartSessionId}/item/${cartItemId}`, { method: 'DELETE' });
      loadCart();
    } catch (err) { /* silent */ }
  };

  // Personnaliser ce modèle
  const openCustomize = (model) => {
    setCustomizeModel(model);
    setShowCustomize(true);
    setCustomizeForm({ first_name: '', last_name: '', email: '', phone: '', message: '' });
  };

  const submitCustomize = async () => {
    if (!customizeForm.first_name || !customizeForm.last_name || !customizeForm.email) {
      toast({ title: "Champs requis", description: "Veuillez remplir nom, prénom et courriel", variant: "destructive" });
      return;
    }
    setCustomizeLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/zoho/lead/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customizeForm, model_name: customizeModel?.name, source: 'Personnalisation modèle' }),
      });
      if (res.ok) {
        toast({ title: "Demande envoyée", description: "Nous vous contacterons pour personnaliser votre modèle." });
        setShowCustomize(false);
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande. Réessayez.", variant: "destructive" });
    } finally {
      setCustomizeLoading(false);
    }
  };

  // Checkout - Passer à la caisse
  const openCheckout = () => {
    if (cart.items.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
    setCheckoutForm({ name: '', email: '', phone: '' });
  };

  const payWithStripe = async () => {
    if (!checkoutForm.name || !checkoutForm.email) {
      toast({ title: "Champs requis", description: "Nom et courriel sont requis", variant: "destructive" });
      return;
    }
    setCheckoutLoading(true);
    try {
      const firstItem = cart.items[0];
      const res = await fetch(`${BACKEND_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kit_id: firstItem.product_id,
          customer_name: checkoutForm.name,
          customer_email: checkoutForm.email,
          customer_phone: checkoutForm.phone,
          include_materials: false,
          success_url: window.location.origin + '/collection?payment=success',
          cancel_url: window.location.origin + '/collection?payment=cancel',
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.detail || 'Erreur Stripe');
      }
    } catch (err) {
      toast({ title: "Erreur paiement", description: "Impossible de démarrer le paiement Stripe", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const payWithPaypal = () => {
    if (!checkoutForm.name || !checkoutForm.email) {
      toast({ title: "Champs requis", description: "Nom et courriel sont requis", variant: "destructive" });
      return;
    }
    // Zoho lead pour l'achat PayPal
    fetch(`${BACKEND_URL}/api/zoho/lead/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: checkoutForm.name.split(' ')[0],
        last_name: checkoutForm.name.split(' ').slice(1).join(' ') || checkoutForm.name,
        email: checkoutForm.email,
        phone: checkoutForm.phone,
        model_name: cart.items.map(i => i.product_name).join(', '),
        amount: cart.total,
      }),
    }).catch(() => {});
    // Redirect to PayPal.me
    const amount = cart.total.toFixed(2);
    window.open(`https://paypal.me/Abrisia/${amount}CAD`, '_blank');
    toast({ title: "Redirection PayPal", description: "Complétez le paiement dans l'onglet PayPal." });
  };

  const clearFiltersAction = () => {
    setActiveFilters({});
    loadModels();
  };

  const applyFilter = (key, value) => {
    const newFilters = { ...activeFilters };
    if (newFilters[key] === value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    // Filter locally
  };

  const filteredModels = models.filter(m => {
    if (activeFilters.tag && !m.tags?.includes(activeFilters.tag)) return false;
    if (activeFilters.bedrooms && m.bedrooms !== activeFilters.bedrooms) return false;
    if (activeFilters.style && m.style !== activeFilters.style) return false;
    return true;
  });

  const formatPrice = (price) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(price);

  const getCurrentPrice = () => {
    const basePrice = selectedVariant?.price || selectedModel?.price || 0;
    const optionsTotal = selectedOptionIds.reduce((sum, optId) => {
      const opt = productOptions.find(o => o.id === optId);
      return sum + (opt?.price || 0);
    }, 0);
    return basePrice + optionsTotal;
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50" data-testid="collection-page">
      <SEO
        title="Collection ABRISIA"
        description="Découvrez notre collection de modèles de plans. Mini-maisons, chalets, maisons. Choisissez un modèle, personnalisez-le et commandez en ligne."
        path="/collection"
      />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Collection ABRISIA</h1>
          <p className="text-lg text-teal-100 leading-relaxed max-w-2xl mx-auto">
            Partez d'une conception déjà réfléchie plutôt que d'une page blanche. Chaque modèle indique précisément les dessins, documents et fichiers compris.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
              data-testid="toggle-filters-btn"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {Object.keys(activeFilters).length > 0 && (
                <Badge className="bg-teal-600 text-white ml-1">{Object.keys(activeFilters).length}</Badge>
              )}
            </Button>
            {Object.keys(activeFilters).length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFiltersAction}>
                <X className="w-4 h-4 mr-1" /> Effacer
              </Button>
            )}
            <span className="text-sm text-gray-500">{filteredModels.length} modèle{filteredModels.length !== 1 ? 's' : ''}</span>
          </div>
          <Button
            onClick={() => setShowCart(true)}
            className="relative bg-teal-700 hover:bg-teal-800"
            data-testid="open-cart-btn"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Panier
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border rounded-lg p-6 mb-8 space-y-4" data-testid="filters-panel">
            {filters.tags?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-700">Type</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant={activeFilters.tag === tag ? "default" : "outline"}
                      className={`cursor-pointer ${activeFilters.tag === tag ? 'bg-teal-600' : 'hover:bg-gray-100'}`}
                      onClick={() => applyFilter('tag', tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {filters.styles?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-700">Style</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.styles.map(s => (
                    <Badge
                      key={s}
                      variant={activeFilters.style === s ? "default" : "outline"}
                      className={`cursor-pointer ${activeFilters.style === s ? 'bg-teal-600' : 'hover:bg-gray-100'}`}
                      onClick={() => applyFilter('style', s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {filters.bedrooms?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-700">Chambres</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.bedrooms.map(b => (
                    <Badge
                      key={b}
                      variant={activeFilters.bedrooms === b ? "default" : "outline"}
                      className={`cursor-pointer ${activeFilters.bedrooms === b ? 'bg-teal-600' : 'hover:bg-gray-100'}`}
                      onClick={() => applyFilter('bedrooms', b)}
                    >
                      {b} ch.
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Models Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun modèle disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map(model => (
              <Card
                key={model.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => openModel(model)}
                data-testid={`model-card-${model.id}`}
              >
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  {model.mainImage ? (
                    <img
                      src={resolveImageUrl(model.mainImage)}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {model.modelNumber && (
                    <Badge className="absolute top-3 left-3 bg-black/70 text-white">{model.modelNumber}</Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{model.name}</h3>
                  {model.designerName && <p className="text-sm text-gray-500 mb-2">par {model.designerName}</p>}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {model.tags?.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {model.surfaceArea && <span className="flex items-center"><Ruler className="w-3 h-3 mr-1" />{model.surfaceArea}</span>}
                    {model.bedrooms && <span className="flex items-center"><BedDouble className="w-3 h-3 mr-1" />{model.bedrooms} ch.</span>}
                    {model.bathrooms && <span className="flex items-center"><Bath className="w-3 h-3 mr-1" />{model.bathrooms} sdb</span>}
                    {model.floors && <span className="flex items-center"><Layers className="w-3 h-3 mr-1" />{model.floors} étage{model.floors > 1 ? 's' : ''}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-teal-700">{formatPrice(model.price)}</p>
                    <Button size="sm" variant="outline" className="text-teal-700 border-teal-300">
                      <Eye className="w-4 h-4 mr-1" /> Voir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Model Detail Modal */}
      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedModel && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedModel.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-2">
                {/* Image Gallery / Carousel */}
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden h-72 bg-gray-100 relative group">
                    <img
                      src={resolveImageUrl(
                        (selectedModel.galleryImages?.length > 0 && galleryIndex > 0)
                          ? selectedModel.galleryImages[galleryIndex - 1]
                          : selectedModel.mainImage
                      )}
                      alt={selectedModel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800'; }}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setGalleryIndex(i => (i - 1 + allImages.length) % allImages.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid="gallery-prev"
                        >
                          <ChevronUp className="w-4 h-4 -rotate-90" />
                        </button>
                        <button
                          onClick={() => setGalleryIndex(i => (i + 1) % allImages.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid="gallery-next"
                        >
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {galleryIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allImages.map((img, idx) => (
                        <button
                          key={`thumb-${idx}`}
                          onClick={() => setGalleryIndex(idx)}
                          className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${galleryIndex === idx ? 'border-teal-600' : 'border-transparent hover:border-gray-300'}`}
                        >
                          <img
                            src={resolveImageUrl(img)}
                            alt={`Vue ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Caractéristiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {selectedModel.surfaceArea && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Ruler className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                      <p className="text-sm text-gray-500">Surface</p>
                      <p className="font-semibold">{selectedModel.surfaceArea}</p>
                    </div>
                  )}
                  {selectedModel.bedrooms && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <BedDouble className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                      <p className="text-sm text-gray-500">Chambres</p>
                      <p className="font-semibold">{selectedModel.bedrooms}</p>
                    </div>
                  )}
                  {selectedModel.bathrooms && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Bath className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                      <p className="text-sm text-gray-500">S. de bain</p>
                      <p className="font-semibold">{selectedModel.bathrooms}</p>
                    </div>
                  )}
                  {selectedModel.floors && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Layers className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                      <p className="text-sm text-gray-500">Étages</p>
                      <p className="font-semibold">{selectedModel.floors}</p>
                    </div>
                  )}
                </div>

                {selectedModel.description && (
                  <p className="text-gray-600">{selectedModel.description}</p>
                )}

                {/* Variantes */}
                {variants.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Variantes disponibles</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {variants.map(v => (
                        <div
                          key={v.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedVariant?.id === v.id ? 'border-teal-600 bg-teal-50' : 'hover:border-gray-400'}`}
                          onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                        >
                          <p className="font-medium text-sm">{v.name}</p>
                          <p className="text-teal-700 font-bold">{formatPrice(v.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options */}
                {productOptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Options supplémentaires</h4>
                    <div className="space-y-2">
                      {productOptions.filter(o => o.is_global || o.product_ids?.includes(selectedModel.id)).map(opt => (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-colors ${selectedOptionIds.includes(opt.id) ? 'border-teal-600 bg-teal-50' : 'hover:border-gray-400'}`}
                          onClick={() => toggleOption(opt.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={selectedOptionIds.includes(opt.id)} />
                            <div>
                              <p className="font-medium text-sm">{opt.name}</p>
                              {opt.description && <p className="text-xs text-gray-500">{opt.description}</p>}
                            </div>
                          </div>
                          <p className="text-teal-700 font-bold">+{formatPrice(opt.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ce que le modèle comprend */}
                {selectedModel.includes?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Ce modèle comprend</h4>
                    <ul className="space-y-1">
                      {selectedModel.includes.map((item) => (
                        <li key={`inc-${item}`} className="flex items-start text-sm text-gray-600">
                          <Check className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prix + Ajouter au panier */}
                <div className="bg-teal-50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Prix total</p>
                    <p className="text-3xl font-bold text-teal-800">{formatPrice(getCurrentPrice())}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={addToCart}
                      className="bg-teal-700 hover:bg-teal-800"
                      data-testid="add-to-cart-btn"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Ajouter au panier
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setSelectedModel(null); openCustomize(selectedModel); }}
                      data-testid="customize-model-btn"
                    >
                      <Paintbrush className="w-4 h-4 mr-2" /> Personnaliser
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Selon l'emplacement du projet, certaines modifications ou validations supplémentaires peuvent être nécessaires avant la construction.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Drawer */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Votre panier
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Votre panier est vide</p>
              </div>
            ) : (
              <>
                {cart.items.map(item => (
                  <div key={item.cart_item_id} className="flex gap-3 border-b pb-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.product_image && (
                        <img src={resolveImageUrl(item.product_image)} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product_name}</p>
                      {item.variant_name && <p className="text-xs text-gray-500">Variante: {item.variant_name}</p>}
                      {item.selected_options?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selected_options.map(opt => (
                            <Badge key={opt.id} variant="secondary" className="text-xs">+ {opt.name}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-teal-700 font-bold mt-1">{formatPrice(item.item_total)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                      onClick={() => removeFromCart(item.cart_item_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Totaux */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sous-total</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">TPS (5%)</span>
                    <span>{formatPrice(cart.tps)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">TVQ (9,975%)</span>
                    <span>{formatPrice(cart.tvq)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-teal-700">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <Button className="w-full bg-teal-700 hover:bg-teal-800" data-testid="checkout-btn" onClick={openCheckout}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Passer à la caisse
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Personnaliser ce modèle Modal */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className="max-w-md" data-testid="customize-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-teal-700" />
              Personnaliser ce modèle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {customizeModel && (
              <div className="bg-teal-50 p-3 rounded-lg text-sm">
                <p className="font-medium">{customizeModel.name}</p>
                <p className="text-gray-500">Nous adapterons ce modèle selon vos besoins spécifiques.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prénom *</Label>
                <Input
                  value={customizeForm.first_name}
                  onChange={(e) => setCustomizeForm(f => ({ ...f, first_name: e.target.value }))}
                  placeholder="Jean"
                  data-testid="customize-firstname"
                />
              </div>
              <div>
                <Label>Nom *</Label>
                <Input
                  value={customizeForm.last_name}
                  onChange={(e) => setCustomizeForm(f => ({ ...f, last_name: e.target.value }))}
                  placeholder="Tremblay"
                  data-testid="customize-lastname"
                />
              </div>
            </div>
            <div>
              <Label>Courriel *</Label>
              <Input
                type="email"
                value={customizeForm.email}
                onChange={(e) => setCustomizeForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jean@exemple.com"
                data-testid="customize-email"
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                value={customizeForm.phone}
                onChange={(e) => setCustomizeForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="418-555-1234"
                data-testid="customize-phone"
              />
            </div>
            <div>
              <Label>Décrivez vos modifications souhaitées</Label>
              <textarea
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                value={customizeForm.message}
                onChange={(e) => setCustomizeForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Ex: Ajouter une chambre, agrandir le salon, changer la fondation..."
                data-testid="customize-message"
              />
            </div>
            <Button
              className="w-full bg-teal-700 hover:bg-teal-800"
              onClick={submitCustomize}
              disabled={customizeLoading}
              data-testid="customize-submit-btn"
            >
              {customizeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
              Envoyer ma demande
            </Button>
            <p className="text-xs text-gray-400 text-center">Un conseiller vous contactera sous 24 heures ouvrables.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md" data-testid="checkout-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-700" />
              Passer à la caisse
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Résumé commande */}
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              {cart.items.map(item => (
                <div key={item.cart_item_id} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{item.product_name}</span>
                  <span className="font-medium flex-shrink-0">{formatPrice(item.item_total)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total (taxes incluses)</span>
                <span className="text-teal-700">{formatPrice(cart.total)}</span>
              </div>
            </div>

            {/* Infos client */}
            <div>
              <Label>Nom complet *</Label>
              <Input
                value={checkoutForm.name}
                onChange={(e) => setCheckoutForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jean Tremblay"
                data-testid="checkout-name"
              />
            </div>
            <div>
              <Label>Courriel *</Label>
              <Input
                type="email"
                value={checkoutForm.email}
                onChange={(e) => setCheckoutForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jean@exemple.com"
                data-testid="checkout-email"
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                value={checkoutForm.phone}
                onChange={(e) => setCheckoutForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="418-555-1234"
                data-testid="checkout-phone"
              />
            </div>

            {/* Boutons de paiement */}
            <div className="space-y-3">
              <Button
                className="w-full bg-[#635BFF] hover:bg-[#5348db] text-white"
                onClick={payWithStripe}
                disabled={checkoutLoading}
                data-testid="pay-stripe-btn"
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                Payer par carte
              </Button>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                <span className="bg-gray-100 px-2 py-0.5 rounded">Google Pay</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">Apple Pay</span>
                <span className="text-gray-300">via Stripe</span>
              </div>
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-gray-200 flex-1" />
                <span className="px-3 text-xs text-gray-400">ou</span>
                <div className="border-t border-gray-200 flex-1" />
              </div>
              <Button
                className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white"
                onClick={payWithPaypal}
                data-testid="pay-paypal-btn"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Payer avec PayPal
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Paiement sécurisé. Google Pay et Apple Pay s'affichent automatiquement si disponibles. Vos fichiers seront envoyés par courriel après confirmation.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collection;
