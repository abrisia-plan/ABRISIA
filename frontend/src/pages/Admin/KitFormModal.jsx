import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
  Plus, X, Upload, Loader2, Save, FileText, Package, 
  Image as ImageIcon, DollarSign, User 
} from 'lucide-react';

const KitFormModal = ({
  isOpen,
  onClose,
  editingKit,
  formData,
  onInputChange,
  onIncludeChange,
  onAddInclude,
  onRemoveInclude,
  onImageUpload,
  onFileUpload,
  onRemoveGalleryImage,
  onSubmit,
  saving,
  uploading,
  uploadingPlan,
  uploadingMaterials,
  sqftToSqm,
  mainImageRef,
  galleryImageRef,
  planFileRef,
  materialsFileRef
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingKit ? 'Modifier le modèle' : 'Ajouter un modèle'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Section: Informations de base */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Informations de base
            </h3>
            
            <div>
              <Label htmlFor="name" className="font-semibold">Nom du modèle *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                placeholder="Ex: Mini-maison 400 pi²"
                className="mt-1"
                data-testid="kit-name-input"
              />
            </div>

            <div>
              <Label htmlFor="designer" className="font-semibold flex items-center">
                <User className="w-4 h-4 mr-1" />
                Nom de la dessinatrice
              </Label>
              <Input
                id="designer"
                value={formData.designer_name}
                onChange={(e) => onInputChange('designer_name', e.target.value)}
                placeholder="Ex: Marie Tremblay"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-semibold">Description courte</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Brève description du kit..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Section: Détails techniques */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">Détails techniques</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="model_number" className="font-semibold">N° du modèle</Label>
                <Input
                  id="model_number"
                  value={formData.model_number || ''}
                  onChange={(e) => onInputChange('model_number', e.target.value)}
                  placeholder="Ex: ABR-2024-01"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="style" className="font-semibold">Style</Label>
                <select
                  id="style"
                  value={formData.style || ''}
                  onChange={(e) => onInputChange('style', e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Choisir --</option>
                  <option value="Moderne">Moderne</option>
                  <option value="Contemporain">Contemporain</option>
                  <option value="Champêtre">Champêtre</option>
                  <option value="Scandinave">Scandinave</option>
                  <option value="Rustique">Rustique</option>
                  <option value="Classique">Classique</option>
                </select>
              </div>
              <div>
                <Label htmlFor="foundation_type" className="font-semibold">Fondation</Label>
                <select
                  id="foundation_type"
                  value={formData.foundation_type || ''}
                  onChange={(e) => onInputChange('foundation_type', e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Choisir --</option>
                  <option value="Dalle sur sol">Dalle sur sol</option>
                  <option value="Sous-sol complet">Sous-sol complet</option>
                  <option value="Vide sanitaire">Vide sanitaire</option>
                  <option value="Pilotis">Pilotis</option>
                  <option value="Pieux vissés">Pieux vissés</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="bedrooms" className="font-semibold">Chambres</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms || ''}
                  onChange={(e) => onInputChange('bedrooms', e.target.value)}
                  placeholder="2"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms" className="font-semibold">Salles de bain</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathrooms || ''}
                  onChange={(e) => onInputChange('bathrooms', e.target.value)}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="has_garage" className="font-semibold">Garage</Label>
                <select
                  id="has_garage"
                  value={formData.has_garage === true ? 'true' : formData.has_garage === false ? 'false' : ''}
                  onChange={(e) => onInputChange('has_garage', e.target.value === '' ? null : e.target.value === 'true')}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Non spécifié --</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
              <div>
                <Label htmlFor="floors" className="font-semibold">Étages</Label>
                <select
                  id="floors"
                  value={formData.floors || '1'}
                  onChange={(e) => {
                    onInputChange('floors', e.target.value);
                    const w = parseFloat(formData.width_ft) || 0;
                    const d = parseFloat(formData.depth_ft) || 0;
                    const f = parseInt(e.target.value) || 1;
                    if (w && d) onInputChange('surface_sqft', String(Math.round(w * d * f)));
                  }}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="1">1 étage</option>
                  <option value="2">2 étages</option>
                  <option value="3">3 étages</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="width_ft" className="font-semibold">Largeur (pieds)</Label>
                <Input
                  id="width_ft"
                  type="number"
                  value={formData.width_ft || ''}
                  onChange={(e) => {
                    onInputChange('width_ft', e.target.value);
                    const w = parseFloat(e.target.value) || 0;
                    const d = parseFloat(formData.depth_ft) || 0;
                    const f = parseInt(formData.floors) || 1;
                    if (w && d) onInputChange('surface_sqft', String(Math.round(w * d * f)));
                  }}
                  placeholder="20"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="depth_ft" className="font-semibold">Profondeur (pieds)</Label>
                <Input
                  id="depth_ft"
                  type="number"
                  value={formData.depth_ft || ''}
                  onChange={(e) => {
                    onInputChange('depth_ft', e.target.value);
                    const w = parseFloat(formData.width_ft) || 0;
                    const d = parseFloat(e.target.value) || 0;
                    const f = parseInt(formData.floors) || 1;
                    if (w && d) onInputChange('surface_sqft', String(Math.round(w * d * f)));
                  }}
                  placeholder="20"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="surface" className="font-semibold">Surface totale (pi²)</Label>
                <Input
                  id="surface"
                  type="number"
                  value={formData.surface_sqft}
                  onChange={(e) => onInputChange('surface_sqft', e.target.value)}
                  placeholder="Calculé automatiquement"
                  className="mt-1"
                />
                {formData.surface_sqft && (
                  <p className="text-sm text-gray-400 mt-1">
                    ≈ {sqftToSqm(formData.surface_sqft)} m²
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="rooms" className="font-semibold">Pièces</Label>
              <Input
                id="rooms"
                value={formData.rooms}
                onChange={(e) => onInputChange('rooms', e.target.value)}
                placeholder="Ex: 2 chambres, 1 salle de bain, cuisine ouverte"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags_input" className="font-semibold">Tags / Filtres</Label>
              <Input
                id="tags_input"
                value={formData.tags_input || ''}
                onChange={(e) => onInputChange('tags_input', e.target.value)}
                placeholder="Ex: mini-maison, chalet, moderne (séparés par virgule)"
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Séparez les tags par des virgules</p>
            </div>

            {/* Ce que le modèle comprend */}
            <div>
              <h3 className="font-semibold text-gray-900">Ce que le modèle comprend</h3>
              <div className="space-y-2 mt-2">
                {formData.includes.map((item, index) => (
                  <div key={`include-${index}`} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => onIncludeChange(index, e.target.value)}
                      placeholder={`Élément ${index + 1} (ex: Plans architecturaux complets)`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onRemoveInclude(index)}
                      disabled={formData.includes.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={onAddInclude}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un élément
                </Button>
              </div>
            </div>
          </div>

          {/* Section: Prix */}
          <div className="bg-beige p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Prix
            </h3>
            
            <div>
              <Label htmlFor="price" className="font-semibold">Prix du plan (CAD) *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => onInputChange('price', e.target.value)}
                  placeholder="800"
                  className="pl-8"
                  data-testid="kit-price-input"
                />
              </div>
            </div>

            {/* Option liste matériaux */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="font-semibold flex items-center">
                    <Package className="w-4 h-4 mr-2 text-bois" />
                    Option "Liste des matériaux"
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Permet au client d'ajouter la liste complète des matériaux à sa commande
                  </p>
                </div>
                <Switch
                  checked={formData.materials_list_enabled}
                  onCheckedChange={(checked) => onInputChange('materials_list_enabled', checked)}
                />
              </div>

              {formData.materials_list_enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-bois-light">
                  <div>
                    <Label htmlFor="materials_price" className="font-semibold">Prix supplémentaire (CAD)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+$</span>
                      <Input
                        id="materials_price"
                        type="number"
                        value={formData.materials_list_price}
                        onChange={(e) => onInputChange('materials_list_price', e.target.value)}
                        placeholder="200"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-semibold">Fichier PDF liste matériaux</Label>
                    <div className="mt-2">
                      {formData.materials_list_file_url ? (
                        <div className="flex items-center gap-2 p-3 bg-white rounded border">
                          <FileText className="w-5 h-5 text-bois" />
                          <a href={formData.materials_list_file_url} target="_blank" rel="noopener noreferrer" className="text-sm flex-1 truncate text-blue-700 underline" title="Fichier privé : visible seulement dans l'admin">{formData.materials_list_file_name || 'Fichier téléversé'}</a>
                          <Button type="button" variant="ghost" size="sm" onClick={() => { onInputChange('materials_list_file_url', ''); onInputChange('materials_list_file_name', ''); }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-bois-light rounded-lg p-4 text-center cursor-pointer hover:border-bois transition-colors block bg-white">
                          {uploadingMaterials ? (
                            <>
                              <Loader2 className="w-8 h-8 text-bois mx-auto mb-2 animate-spin" />
                              <p className="text-bois">Upload en cours...</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-bois-light mx-auto mb-2" />
                              <p className="text-gray-500">Uploader le PDF de la liste matériaux</p>
                            </>
                          )}
                          <input
                            ref={materialsFileRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => onFileUpload(e, 'materials')}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Fichiers */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Fichier du plan (PDF/AutoCAD)
            </h3>
            
            {formData.plan_file_url ? (
              <div className="flex items-center gap-2 p-3 bg-white rounded border">
                <FileText className="w-5 h-5 text-blue-600" />
                <a href={formData.plan_file_url} target="_blank" rel="noopener noreferrer" className="text-sm flex-1 truncate text-blue-700 underline" title="Fichier privé : visible seulement dans l'admin">{formData.plan_file_name || 'Fichier téléversé'}</a>
                <Button type="button" variant="ghost" size="sm" onClick={() => { onInputChange('plan_file_url', ''); onInputChange('plan_file_name', ''); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors block bg-white">
                {uploadingPlan ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                    <p className="text-blue-600">Upload en cours...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-500">Téléverser le fichier du plan (PDF, DWG, ZIP...)</p>
                    <p className="text-xs text-gray-400 mt-1">Fichier privé : seul un client qui a payé pourra le télécharger</p>
                  </>
                )}
                <input
                  ref={planFileRef}
                  type="file"
                  accept=".pdf,.dwg,.dxf,.skp,.rvt,.ifc,.zip"
                  className="hidden"
                  onChange={(e) => onFileUpload(e, 'plan')}
                />
              </label>
            )}
          </div>

          {/* Section: Images */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </h3>

            {/* Image principale */}
            <div>
              <Label className="font-semibold">Image principale *</Label>
              <div className="mt-2">
                {formData.main_image ? (
                  <div className="relative">
                    <img src={formData.main_image} alt="Aperçu" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      type="button" variant="destructive" size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => onInputChange('main_image', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label 
                    htmlFor="main-image-upload-input"
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors block"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-10 h-10 text-teal-500 mx-auto mb-2 animate-spin" />
                        <p className="text-foret">Upload en cours...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Cliquez pour uploader une image</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max 5MB)</p>
                      </>
                    )}
                  </label>
                )}
                <input
                  id="main-image-upload-input"
                  ref={mainImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onImageUpload(e, false)}
                />
                <div className="flex gap-2 mt-2">
                  <Input
                    value={formData.main_image}
                    onChange={(e) => onInputChange('main_image', e.target.value)}
                    placeholder="Ou collez une URL d'image..."
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Images supplémentaires */}
            <div>
              <Label className="font-semibold">Images supplémentaires (optionnel)</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {formData.gallery_images.map((img, index) => (
                  <div key={`gallery-${img.slice(-12)}`} className="relative">
                    <img src={img} alt={`Galerie ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    <Button
                      type="button" variant="destructive" size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => onRemoveGalleryImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <label 
                  htmlFor="gallery-upload-input"
                  className="border-2 border-dashed border-gray-300 rounded-lg h-20 flex items-center justify-center cursor-pointer hover:border-teal-500"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                </label>
              </div>
              <input
                id="gallery-upload-input"
                ref={galleryImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onImageUpload(e, true)}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onSubmit}
              disabled={saving}
              className="flex-1 bg-foret hover:bg-bois"
              data-testid="kit-submit-btn"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Enregistrer le modèle</>
              )}
            </Button>
            <Button variant="outline" onClick={() => onClose(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KitFormModal;
