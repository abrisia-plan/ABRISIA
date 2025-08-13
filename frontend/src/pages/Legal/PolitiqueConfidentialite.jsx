import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Shield, Eye, Lock, Trash2 } from 'lucide-react';

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-white">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-amber-100">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <CardTitle className="text-3xl text-slate-800 text-center flex items-center justify-center">
                <Shield className="w-8 h-8 mr-3 text-amber-600" />
                Politique de confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Notre engagement</h3>
                <p className="text-green-700">
                  Chez Abrisia Plan, nous respectons votre vie privée et nous nous engageons à protéger 
                  vos données personnelles conformément aux lois canadiennes et québécoises en vigueur.
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-amber-600" />
                  Données collectées
                </h2>
                <div className="space-y-4 text-slate-600">
                  <p><strong>Lors d'une demande de devis, nous collectons :</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nom complet</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone (optionnel)</li>
                    <li>Détails de votre projet (type, dimensions, matériaux, etc.)</li>
                    <li>Budget et échéancier souhaités</li>
                    <li>Messages et préférences personnelles</li>
                    <li>Fichiers joints (esquisses, photos, plans)</li>
                  </ul>
                  
                  <p className="mt-4"><strong>Lors de la navigation sur notre site :</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Adresse IP</li>
                    <li>Type de navigateur et système d'exploitation</li>
                    <li>Pages visitées et durée de visite</li>
                    <li>Données de géolocalisation approximative (ville/région)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Utilisation des données</h2>
                <div className="space-y-4 text-slate-600">
                  <p><strong>Vos données personnelles nous servent à :</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Traiter et répondre à vos demandes de devis</li>
                    <li>Vous contacter concernant votre projet</li>
                    <li>Améliorer nos services et personnaliser notre offre</li>
                    <li>Vous envoyer des informations pertinentes (si vous l'acceptez)</li>
                    <li>Respecter nos obligations légales et comptables</li>
                  </ul>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                    <p className="text-amber-800">
                      <strong>Important :</strong> Nous n'utilisons jamais vos données à des fins commerciales 
                      non sollicitées et ne les vendons jamais à des tiers.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-amber-600" />
                  Conservation et sécurité
                </h2>
                <div className="space-y-4 text-slate-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Durée de conservation</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Devis actifs : pendant la durée du projet</li>
                        <li>• Devis refusés : 1 an maximum</li>
                        <li>• Données comptables : 7 ans (obligation légale)</li>
                        <li>• Données marketing : jusqu'à désabonnement</li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Mesures de sécurité</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Chiffrement des données sensibles</li>
                        <li>• Accès limité aux personnes autorisées</li>
                        <li>• Sauvegardes sécurisées régulières</li>
                        <li>• Serveurs situés au Canada</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Partage des données</h2>
                <div className="space-y-4 text-slate-600">
                  <p><strong>Nous partageons vos données uniquement avec :</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Notre équipe interne :</strong> dessinateurs et gestionnaires de projets</li>
                    <li><strong>Partenaires projet :</strong> avec votre accord explicite (ébénistes, charpentiers, etc.)</li>
                    <li><strong>Services techniques :</strong> hébergement web et outils de communication sécurisés</li>
                    <li><strong>Autorités légales :</strong> uniquement si requis par la loi</li>
                  </ul>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">
                      <strong>Nous ne partageons jamais :</strong> vos données avec des fins publicitaires, 
                      des entreprises tierces non liées à votre projet, ou des organismes étrangers.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Cookies</h2>
                <div className="space-y-4 text-slate-600">
                  <p>Notre site utilise des cookies pour :</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Mémoriser vos préférences de navigation</li>
                    <li>Analyser l'utilisation du site (statistiques anonymes)</li>
                    <li>Améliorer la performance et sécurité du site</li>
                  </ul>
                  <p>
                    Vous pouvez désactiver les cookies dans votre navigateur, mais certaines fonctionnalités 
                    du site pourraient être limitées.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Trash2 className="w-6 h-6 mr-2 text-amber-600" />
                  Vos droits
                </h2>
                <div className="space-y-4 text-slate-600">
                  <p><strong>Conformément aux lois canadiennes, vous avez le droit de :</strong></p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Accès :</strong> consulter vos données</li>
                      <li><strong>Rectification :</strong> corriger des informations inexactes</li>
                      <li><strong>Suppression :</strong> demander l'effacement de vos données</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Portabilité :</strong> récupérer vos données</li>
                      <li><strong>Opposition :</strong> refuser certains traitements</li>
                      <li><strong>Limitation :</strong> restreindre l'utilisation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      <strong>Pour exercer vos droits :</strong> contactez-nous à 
                      <strong> privacy@abrisia-plan.ca</strong> ou par téléphone au +1 (514) 555-0123. 
                      Nous répondons sous 30 jours maximum.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Contact et réclamations</h2>
                <div className="space-y-4 text-slate-600">
                  <p><strong>Pour toute question concernant cette politique :</strong></p>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p><strong>Email :</strong> privacy@abrisia-plan.ca</p>
                    <p><strong>Téléphone :</strong> +1 (514) 555-0123</p>
                    <p><strong>Courrier :</strong> Abrisia Plan - Protection des données, Québec, Canada</p>
                  </div>
                  
                  <p>
                    Si vous n'êtes pas satisfait de notre réponse, vous pouvez déposer une plainte auprès 
                    du <strong>Commissaire à la protection de la vie privée du Canada</strong>.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Modifications</h2>
                <div className="space-y-4 text-slate-600">
                  <p>
                    Cette politique peut être mise à jour pour refléter les changements dans nos pratiques 
                    ou la législation. Nous vous informerons de tout changement significatif par email 
                    ou via une notification sur notre site.
                  </p>
                </div>
              </section>

              <section className="border-t border-amber-200 pt-6">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <p><strong>Dernière mise à jour :</strong> Décembre 2024</p>
                  <p><strong>Version :</strong> 1.0</p>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Cette politique est conforme aux lois canadiennes sur la protection des renseignements personnels 
                  et aux réglementations provinciales du Québec.
                </p>
              </section>

            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PolitiqueConfidentialite;