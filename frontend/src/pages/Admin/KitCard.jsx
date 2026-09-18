import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Edit, Trash2, Eye, EyeOff, Home, Image as ImageIcon, 
  ShoppingCart, Package, User 
} from 'lucide-react';
import { resolveImageUrl } from '../../services/api';

const KitCard = ({ kit, onToggleActive, onToggleFeatured, onEdit, onDelete, formatPrice }) => {
  return (
    <Card data-testid={`kit-card-${kit.id}`} className={`overflow-hidden ${!kit.isActive ? 'opacity-60' : ''}`}>
      <div className="relative h-48 bg-gray-100">
        {kit.mainImage ? (
          <img
            src={resolveImageUrl(kit.mainImage)}
            alt={kit.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {!kit.isActive && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-gray-800 text-white">
              <EyeOff className="w-3 h-3 mr-1" />
              Masqué
            </Badge>
          </div>
        )}
        {kit.isFeatured && (
          <div className={`absolute top-2 ${!kit.isActive ? 'right-24' : 'right-2'}`}>
            <Badge className="bg-blue-600 text-white">
              <Home className="w-3 h-3 mr-1" />
              Accueil
            </Badge>
          </div>
        )}
        {kit.materialsListEnabled && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-beige0 text-white">
              <Package className="w-3 h-3 mr-1" />
              + Matériaux
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{kit.name}</h3>
        
        {kit.designerName && (
          <p className="text-sm text-gray-500 mb-2 flex items-center">
            <User className="w-3 h-3 mr-1" />
            {kit.designerName}
          </p>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <p className="text-2xl font-bold text-teal-700">{formatPrice(kit.price)}</p>
          {kit.materialsListEnabled && kit.materialsListPrice && (
            <Badge variant="outline" className="text-bois border-bois-light">
              +{formatPrice(kit.materialsListPrice)} matériaux
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <ShoppingCart className="w-4 h-4 mr-1" />
            {kit.salesCount || 0} ventes
          </span>
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {kit.viewsCount || 0} vues
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(kit)}
            title={kit.isActive ? 'Masquer' : 'Afficher'}
            data-testid={`toggle-active-${kit.id}`}
          >
            {kit.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleFeatured(kit)}
            title={kit.isFeatured ? "Retirer de l'accueil" : "Mettre sur l'accueil"}
            className={kit.isFeatured ? 'border-blue-300 text-blue-700 bg-blue-50' : ''}
            data-testid={`toggle-featured-${kit.id}`}
          >
            <Home className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(kit)}
            data-testid={`edit-kit-${kit.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => onDelete(kit)}
            data-testid={`delete-kit-${kit.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KitCard;
