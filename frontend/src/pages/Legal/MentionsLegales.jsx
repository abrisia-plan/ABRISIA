import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen pt-20 bg-stone-50">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-stone-200">
            <CardHeader className="bg-stone-100 border-b border-stone-200">
              <CardTitle className="text-3xl text-slate-800 text-center">
                Mentions légales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8 text-slate-700">
              
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Propriétaire du site</h2>
                <p><strong>Nom commercial :</strong> Abrisia Plan</p>
                <p><strong>Domaine :</strong> abrisia-plan.ca</p>
                <p><strong>Activité :</strong> Service de plans architecturaux et dessins techniques</p>
                <p><strong>Localisation :</strong> Province de Québec, Canada</p>
                <p><strong>Courriel :</strong> abrisia0plan@gmail.com</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Hébergement</h2>
                <p>Le site est hébergé par Emergent Labs. Le contenu et les données sont stockés sur des serveurs sécurisés.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Propriété intellectuelle</h2>
                <p>L'ensemble du contenu de ce site (textes, images, plans, logos, design) est la propriété exclusive d'Abrisia Plan ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, est interdite sans autorisation écrite préalable.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Nature des services</h2>
                <p>Abrisia Plan offre un service de dessin de plans architecturaux et techniques. Les plans fournis sont des documents de conception destinés à être soumis aux autorités compétentes pour l'obtention de permis de construction. Abrisia Plan n'est pas une firme d'ingénieurs ni un bureau d'architectes.</p>
                <p className="mt-2">Les plans sont conformes au Code de construction du Québec pour les bâtiments résidentiels jusqu'à 600 m² de superficie de plancher (environ 6 000 pi²).</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Limitation de responsabilité</h2>
                <p>Abrisia Plan fournit des dessins et des plans selon les informations transmises par le client. Le client est responsable de vérifier la conformité des plans avec les règlements municipaux applicables à son terrain et à son projet.</p>
                <p className="mt-2">Abrisia Plan ne pourra être tenue responsable des dommages directs ou indirects résultant de l'utilisation des plans, incluant mais sans se limiter à : erreurs dans les informations fournies par le client, modifications apportées aux plans par des tiers, non-conformité aux règlements municipaux locaux, ou problèmes survenus lors de la construction.</p>
                <p className="mt-2">Le client reconnaît que l'obtention du permis de construction relève de sa propre responsabilité et que l'approbation des plans par la municipalité n'est pas garantie par Abrisia Plan.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Paiements et remboursements</h2>
                <p>Les paiements pour les kits de plans sont effectués en ligne. Les plans numériques étant des produits livrés électroniquement, aucun remboursement ne sera accordé après la livraison des fichiers, sauf en cas d'erreur attribuable à Abrisia Plan.</p>
                <p className="mt-2">Pour les projets sur devis, un dépôt est requis avant le début des travaux de dessin. Les modalités de paiement sont précisées dans le devis accepté par le client.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Loi applicable</h2>
                <p>Les présentes mentions légales sont régies par les lois de la Province de Québec et les lois fédérales du Canada qui s'y appliquent. Tout litige sera soumis à la compétence des tribunaux du Québec.</p>
              </section>

              <p className="text-sm text-slate-500 pt-4 border-t border-stone-200">
                Dernière mise à jour : Mars 2026
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default MentionsLegales;
