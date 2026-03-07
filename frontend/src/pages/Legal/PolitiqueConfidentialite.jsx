import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen pt-20 bg-stone-50">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-stone-200">
            <CardHeader className="bg-stone-100 border-b border-stone-200">
              <CardTitle className="text-3xl text-slate-800 text-center">
                Politique de confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8 text-slate-700">
              
              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Collecte des renseignements</h2>
                <p>Nous recueillons les renseignements suivants lorsque vous utilisez notre site :</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Nom et prénom</li>
                  <li>Adresse courriel</li>
                  <li>Numéro de téléphone (si fourni)</li>
                  <li>Informations relatives à votre projet (type de construction, dimensions, terrain, etc.)</li>
                </ul>
                <p className="mt-2">Ces renseignements sont recueillis uniquement lorsque vous soumettez un formulaire de devis, une commande de kit ou un message via notre formulaire de contact.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Utilisation des renseignements</h2>
                <p>Les renseignements que nous collectons sont utilisés pour :</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Préparer et vous envoyer un devis pour votre projet</li>
                  <li>Traiter vos commandes de kits de plans</li>
                  <li>Communiquer avec vous concernant votre projet</li>
                  <li>Vous envoyer les fichiers de plans achetés</li>
                </ul>
                <p className="mt-2">Nous n'utilisons pas vos renseignements à des fins de marketing non sollicité.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Protection des renseignements</h2>
                <p>Nous nous engageons à protéger vos renseignements personnels. Les mesures de sécurité suivantes sont en place :</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Connexion sécurisée (SSL/HTTPS)</li>
                  <li>Accès restreint aux données par mot de passe</li>
                  <li>Stockage sécurisé sur des serveurs protégés</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Partage des renseignements</h2>
                <p>Vos renseignements personnels ne sont jamais vendus, échangés ou loués à des tiers. Nous pouvons toutefois partager certaines informations avec :</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Nos dessinateurs/employés assignés à votre projet</li>
                  <li>Les fournisseurs de services de paiement (pour le traitement des transactions)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Cookies</h2>
                <p>Notre site utilise des cookies pour améliorer votre expérience de navigation. Ces cookies sont utilisés pour retenir vos préférences et améliorer la performance du site. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Droit d'accès et de rectification</h2>
                <p>Conformément à la Loi sur la protection des renseignements personnels dans le secteur privé du Québec, vous avez le droit de consulter, modifier ou supprimer vos renseignements personnels. Pour exercer ce droit, contactez-nous à : <strong>abrisia0plan@gmail.com</strong></p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Consentement</h2>
                <p>En utilisant notre site, vous consentez à notre politique de confidentialité. Si nous modifions cette politique, les changements seront publiés sur cette page.</p>
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

export default PolitiqueConfidentialite;
