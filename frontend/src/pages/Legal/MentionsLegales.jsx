import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-white">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-amber-100">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <CardTitle className="text-3xl text-slate-800 text-center">
                Mentions légales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Propriétaire du site</h2>
                <div className="bg-amber-50 p-6 rounded-lg space-y-2">
                  <p><strong>Nom du site :</strong> Abrisia Plan</p>
                  <p><strong>Domaine :</strong> abrisia-plan.ca</p>
                  <p><strong>Activité :</strong> Services de dessin de plans et accompagnement en construction</p>
                  <p><strong>Localisation :</strong> Québec, Canada</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Contact</h2>
                <div className="space-y-2 text-slate-600">
                  <p><strong>Email :</strong> info@abrisia-plan.ca</p>
                  <p><strong>Téléphone :</strong> +1 (514) 555-0123</p>
                  <p><strong>Zone de service :</strong> Province de Québec, Canada</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Hébergement</h2>
                <div className="space-y-2 text-slate-600">
                  <p>Ce site est hébergé par des services professionnels respectant les normes de sécurité et de confidentialité en vigueur.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Propriété intellectuelle</h2>
                <div className="space-y-4 text-slate-600">
                  <p>
                    L'ensemble des contenus présents sur ce site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) 
                    sont la propriété exclusive d'Abrisia Plan ou de ses partenaires, à l'exception des marques, logos ou contenus 
                    appartenant à d'autres sociétés partenaires ou auteurs.
                  </p>
                  <p>
                    Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, 
                    quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable d'Abrisia Plan.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Utilisation du site</h2>
                <div className="space-y-4 text-slate-600">
                  <p>
                    L'utilisateur s'engage à utiliser le site de manière loyale et conforme aux présentes mentions légales.
                  </p>
                  <p>
                    Il est interdit d'utiliser le site à des fins commerciales sans autorisation préalable, ou de porter 
                    atteinte à l'intégrité du site ou à sa sécurité.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Responsabilité</h2>
                <div className="space-y-4 text-slate-600">
                  <p>
                    Les informations diffusées sur le site sont données à titre indicatif. Abrisia Plan s'efforce d'assurer 
                    l'exactitude et la mise à jour des informations diffusées, mais ne peut garantir l'exactitude, la précision 
                    ou l'exhaustivité des informations mises à disposition.
                  </p>
                  <p>
                    Abrisia Plan ne pourra être tenu responsable des dommages directs ou indirects causés au matériel de 
                    l'utilisateur lors de l'accès au site.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Cookies et données personnelles</h2>
                <div className="space-y-4 text-slate-600">
                  <p>
                    Ce site peut utiliser des cookies pour améliorer l'expérience utilisateur. Ces cookies ne collectent 
                    aucune information personnelle identifiable.
                  </p>
                  <p>
                    Pour plus d'informations sur le traitement de vos données personnelles, consultez notre 
                    <strong> politique de confidentialité</strong>.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Droit applicable</h2>
                <div className="space-y-4 text-slate-600">
                  <p>
                    Les présentes mentions légales sont régies par le droit canadien et québécois. 
                    Tout litige sera soumis aux tribunaux compétents du Québec.
                  </p>
                </div>
              </section>

              <section className="border-t border-amber-200 pt-6">
                <p className="text-sm text-slate-500">
                  <strong>Dernière mise à jour :</strong> Décembre 2024
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Abrisia Plan se réserve le droit de modifier ces mentions légales à tout moment. 
                  Il est conseillé de les consulter régulièrement.
                </p>
              </section>

            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default MentionsLegales;