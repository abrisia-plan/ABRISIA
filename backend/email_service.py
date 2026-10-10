import smtplib
import os
import html
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from datetime import datetime
from zoneinfo import ZoneInfo
import logging

logger = logging.getLogger(__name__)


def _now_qc():
    """Heure du Québec (le serveur Render est à l'heure universelle)"""
    return datetime.now(ZoneInfo("America/Toronto"))


def _format_size(size):
    if size < 1024 * 1024:
        return f"{max(1, round(size / 1024))} Ko"
    return f"{size / 1024 / 1024:.1f} Mo"

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.sender_email = os.getenv('SENDER_EMAIL', 'abrisia0plan@gmail.com')
        self.sender_password = os.getenv('SENDER_PASSWORD')
        self.app_url = os.getenv('APP_URL', 'https://abrisia-plan.ca')
        # Envoi via l'API web de Resend (Render gratuit bloque le SMTP)
        self.resend_api_key = os.getenv('RESEND_API_KEY')
        # Tant que le domaine abrisia-plan.ca n'est pas vérifié chez Resend,
        # on utilise l'adresse de test, qui ne peut écrire qu'au propriétaire du compte.
        self.resend_from = os.getenv('RESEND_FROM', 'Abrisia Plan <onboarding@resend.dev>')

    def _branded_header(self):
        return f"""
        <div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 24px 30px; text-align: center;">
            <table style="margin: 0 auto;"><tr>
                <td style="padding-right: 12px; vertical-align: middle;">
                    <img src="{self.app_url}/logo-email.png" alt="Abrisia" width="48" height="48" style="display: block; width: 48px; height: 48px; border-radius: 50%; background: white;">
                </td>
                <td style="vertical-align: middle;">
                    <span style="color: white; font-size: 22px; font-weight: bold; letter-spacing: 1px;">ABRISIA PLAN</span>
                </td>
            </tr></table>
            <p style="color: #99f6e4; font-size: 12px; margin: 8px 0 0 0; letter-spacing: 0.5px;">Des plans sur mesure, conçus pour votre réalité</p>
        </div>"""

    def _branded_footer(self):
        return f"""
        <div style="background: #1e293b; padding: 24px 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 6px 0; font-weight: 600;">ABRISIA PLAN</p>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Conception et dessin de plans architecturaux</p>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Saguenay-Lac-Saint-Jean, Québec, Canada</p>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 12px 0;">Plans conformes au Code du bâtiment du Québec et du Canada</p>
            <div style="border-top: 1px solid #334155; padding-top: 12px; margin-top: 4px;">
                <a href="{self.app_url}" style="color: #5eead4; text-decoration: none; font-size: 12px; margin: 0 10px;">abrisia-plan.ca</a>
                <span style="color: #475569;">|</span>
                <a href="mailto:{self.sender_email}" style="color: #5eead4; text-decoration: none; font-size: 12px; margin: 0 10px;">{self.sender_email}</a>
            </div>
            <p style="color: #475569; font-size: 11px; margin: 10px 0 0 0;">© {_now_qc().year} Abrisia Plan. Tous droits réservés.</p>
        </div>"""

    def _wrap_email(self, body_content):
        """Enveloppe le contenu dans le template brandé"""
        return f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; background: #f1f5f9; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                {self._branded_header()}
                <div style="padding: 30px;">
                    {body_content}
                </div>
                {self._branded_footer()}
            </div>
        </body>
        </html>"""
    
    def _send_email(self, to_email, subject, html_content, attachments=None):
        """Méthode interne pour envoyer un email.

        attachments : liste de (nom du fichier, contenu en bytes), envoyés en pièces jointes.
        """
        if self.resend_api_key:
            return self._send_email_resend(to_email, subject, html_content, attachments)
        try:
            message = MIMEMultipart("mixed")
            message["Subject"] = subject
            message["From"] = f"Abrisia Plan <{self.sender_email}>"
            message["To"] = to_email
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            for filename, content in attachments or []:
                part = MIMEApplication(content, Name=filename)
                part["Content-Disposition"] = f'attachment; filename="{filename}"'
                message.attach(part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
            
            logger.info(f"✅ Email envoyé à {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ Erreur envoi email à {to_email}: {str(e)}")
            return False

    def _send_email_resend(self, to_email, subject, html_content, attachments=None):
        """Envoie un email par l'API web de Resend (https://resend.com)"""
        import requests
        import base64
        payload = {
            "from": self.resend_from,
            "to": [to_email],
            "reply_to": self.sender_email,
            "subject": subject,
            "html": html_content,
        }
        if attachments:
            payload["attachments"] = [
                {"filename": name, "content": base64.b64encode(content).decode()}
                for name, content in attachments
            ]
        try:
            resp = requests.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {self.resend_api_key}"},
                json=payload,
                timeout=120,
            )
            if resp.status_code >= 300:
                logger.error(f"❌ Resend a refusé l'email à {to_email}: {resp.status_code} {resp.text}")
                return False
            logger.info(f"✅ Email envoyé à {to_email} (Resend)")
            return True
        except Exception as e:
            logger.error(f"❌ Erreur envoi email (Resend) à {to_email}: {str(e)}")
            return False

    def send_kit_order_confirmation_to_client(self, order_data):
        """Envoie confirmation de commande au client"""
        try:
            subject = f"🏠 Confirmation commande #{order_data['order_number']} - Abrisia Plan"
            
            materials_row = ""
            if order_data.get('include_materials'):
                materials_row = f"""
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">+ Liste des matériaux</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #d97706;">{order_data['materials_price']:.2f} $</td>
                </tr>
                """
            
            body = f"""
                        <p style="font-size: 16px;">Bonjour <strong>{order_data['customer_name']}</strong>,</p>
                        
                        <h2 style="color: #0f766e; margin: 20px 0 10px 0; font-size: 20px;">Commande confirmée</h2>
                        <p>Votre commande a bien été enregistrée. Voici les détails :</p>
                        
                        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
                            <p style="margin: 0 0 4px 0; color: #64748b; font-size: 13px;">Numéro de commande</p>
                            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #0f766e; font-family: monospace;">{order_data['order_number']}</p>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background: #f8fafc;">
                                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Modèle : {order_data['kit_name']}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">{order_data['base_price']:.2f} $</td>
                            </tr>
                            {materials_row}
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Sous-total</td>
                                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">{order_data['subtotal']:.2f} $</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Taxes (TPS + TVQ)</td>
                                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">{order_data['tax_amount']:.2f} $</td>
                            </tr>
                            <tr style="background: #0f766e; color: white;">
                                <td style="padding: 14px; font-weight: bold; font-size: 16px;">TOTAL</td>
                                <td style="padding: 14px; text-align: right; font-weight: bold; font-size: 16px;">{order_data['total_amount']:.2f} $</td>
                            </tr>
                        </table>
                        
                        <p style="color: #64748b; font-size: 14px;">
                            Vos fichiers vous seront envoyés par courriel une fois le paiement confirmé.
                        </p>
                        
                        <div style="text-align: center; margin: 24px 0;">
                            <a href="{self.app_url}" style="display: inline-block; background: #0f766e; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                                Retourner sur Abrisia Plan
                            </a>
                        </div>
                        
                        <p style="margin-top: 20px; font-size: 14px;">
                            Des questions ? Répondez directement à cet email.<br>
                            <strong>L'équipe Abrisia Plan</strong>
                        </p>
            """
            
            html_content = self._wrap_email(body)
            
            return self._send_email(order_data['customer_email'], subject, html_content)
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi confirmation client: {str(e)}")
            return False

    def send_kit_order_notification_to_admin(self, order_data):
        """Envoie notification de nouvelle commande à l'admin"""
        try:
            subject = f"🛒 Nouvelle commande kit #{order_data['order_number']} - {order_data['customer_name']}"
            
            materials_info = "❌ Non incluse" if not order_data.get('include_materials') else f"✅ Incluse (+{order_data['materials_price']:.2f} $)"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🛒 Nouvelle commande !</h1>
                        <p style="margin: 10px 0 0 0; font-size: 20px; font-family: monospace;">{order_data['order_number']}</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        
                        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 10px 0; color: #065f46;">💰 Montant total</h3>
                            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #0f766e;">{order_data['total_amount']:.2f} $</p>
                        </div>
                        
                        <h3 style="color: #0f766e;">👤 Client</h3>
                        <table style="width: 100%; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 5px 0;"><strong>Nom :</strong></td>
                                <td>{order_data['customer_name']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0;"><strong>Email :</strong></td>
                                <td><a href="mailto:{order_data['customer_email']}" style="color: #0f766e;">{order_data['customer_email']}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0;"><strong>Téléphone :</strong></td>
                                <td>{order_data.get('customer_phone') or 'Non fourni'}</td>
                            </tr>
                        </table>
                        
                        <h3 style="color: #0f766e;">📦 Commande</h3>
                        <table style="width: 100%; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 5px 0;"><strong>Kit :</strong></td>
                                <td>{order_data['kit_name']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0;"><strong>Prix kit :</strong></td>
                                <td>{order_data['base_price']:.2f} $</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0;"><strong>Liste matériaux :</strong></td>
                                <td>{materials_info}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0;"><strong>Taxes :</strong></td>
                                <td>{order_data['tax_amount']:.2f} $</td>
                            </tr>
                        </table>
                        
                        {f'''
                        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <h4 style="margin: 0 0 10px 0; color: #64748b;">📝 Notes du client</h4>
                            <p style="margin: 0;">{order_data.get("notes")}</p>
                        </div>
                        ''' if order_data.get('notes') else ''}
                        
                        <div style="background: #fef3c7; border-radius: 8px; padding: 15px; text-align: center;">
                            <p style="margin: 0; color: #92400e;">
                                ⏳ <strong>En attente de paiement</strong><br>
                                <span style="font-size: 14px;">Surveillez votre boîte Interac !</span>
                            </p>
                        </div>
                        
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                        <p style="margin: 0;">Commande reçue le {_now_qc().strftime('%d/%m/%Y à %H:%M')}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            return self._send_email(self.sender_email, subject, html_content)
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi notification admin: {str(e)}")
            return False

    def send_candidature_notification(self, candidature_data):
        """Envoie notification de nouvelle candidature à l'admin"""
        try:
            subject = f"Nouvelle candidature - {candidature_data.get('nom', 'Candidat')}"
            body = f"""
                <h2 style="color: #0f766e; margin: 0 0 16px 0;">Nouvelle candidature</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0;">{_now_qc().strftime('%d/%m/%Y à %H:%M')}</p>
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Nom :</td><td>{candidature_data.get('nom', '')}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Courriel :</td><td><a href="mailto:{candidature_data.get('email', '')}" style="color: #0f766e;">{candidature_data.get('email', '')}</a></td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Téléphone :</td><td>{candidature_data.get('telephone', 'Non fourni')}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">CV :</td><td>{candidature_data.get('cv_filename', 'Fichier joint')}</td></tr>
                </table>
                {f'<div style="background: #f8f9fa; border-radius: 8px; padding: 15px; border-left: 4px solid #0f766e;"><p style="margin: 0;">{candidature_data.get("message")}</p></div>' if candidature_data.get('message') else ''}
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{self.app_url}/admin" style="display: inline-block; background: #0f766e; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">Voir dans l'admin</a>
                </div>
            """
            return self._send_email(self.sender_email, subject, self._wrap_email(body))
        except Exception as e:
            logger.error(f"Erreur envoi notification candidature: {str(e)}")
            return False

    def send_review_notification(self, review_data):
        """Envoie notification de nouveau temoignage à l'admin"""
        try:
            stars = "⭐" * review_data.get('rating', 5)
            subject = f"💬 Nouveau temoignage - {review_data.get('client_name', 'Client')} ({stars})"
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">💬 Nouveau temoignage client</h1>
                        <p style="margin: 10px 0 0 0; font-size: 28px;">{stars}</p>
                    </div>
                    <div style="padding: 30px;">
                        <table style="width: 100%; margin-bottom: 20px;">
                            <tr><td style="padding: 5px 0; font-weight: bold;">Client :</td><td>{review_data.get('client_name', '')}</td></tr>
                            <tr><td style="padding: 5px 0; font-weight: bold;">Courriel :</td><td>{review_data.get('client_email', '')}</td></tr>
                            <tr><td style="padding: 5px 0; font-weight: bold;">Note :</td><td>{review_data.get('rating', 5)}/5</td></tr>
                            <tr><td style="padding: 5px 0; font-weight: bold;">Projet :</td><td>{review_data.get('project_type', 'Non specifie')}</td></tr>
                        </table>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #0f766e;">
                            <p style="margin: 0; font-style: italic; font-size: 16px;">"{review_data.get('comment', '')}"</p>
                        </div>
                        <div style="background: #fef3c7; border-radius: 8px; padding: 15px; text-align: center; margin-top: 20px;">
                            <p style="margin: 0; color: #92400e;">⏳ <strong>En attente d'approbation</strong><br>Connectez-vous à l'admin pour approuver ou rejeter cet avis.</p>
                        </div>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="{self.app_url}/admin" style="display: inline-block; background: #0f766e; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">Gerer les temoignages</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            return self._send_email(self.sender_email, subject, html_content)
        except Exception as e:
            logger.error(f"❌ Erreur envoi notification temoignage: {str(e)}")
            return False
        
    def send_devis_notification(self, devis_data, attachments=None):
        """Envoie une notification email brandée pour un nouveau devis"""
        try:
            recipient_email = os.getenv('ADMIN_EMAIL', 'abrisia0plan@gmail.com')
            # Les textes viennent du client : on les échappe pour qu'ils ne puissent pas injecter de HTML
            esc = lambda key, default='Non spécifié': html.escape(str(devis_data.get(key) or default))
            # Noms lisibles des plans (« Plan de fondation (300$) »), sinon les codes
            plans = devis_data.get('plans_noms') or devis_data.get('plans_choisis') or devis_data.get('plansChoisis') or []
            plans_choisis_text = "<br>".join(html.escape(p) for p in plans)
            project_type = html.escape(devis_data.get('project_type') or devis_data.get('projectType') or '')

            representation_labels = {
                'technique': 'Plans techniques détaillés',
                'visuel': 'Représentation visuelle/esthétique',
                'both': 'Les deux (technique + visuel)',
            }
            contact_labels = {
                'telephone': 'Par téléphone',
                'courriel': 'Par courriel',
                'texto': 'Par texto',
                'peu-importe': 'Peu importe',
            }
            representation = representation_labels.get(devis_data.get('representation_type') or '', '')
            contact_pref = contact_labels.get(devis_data.get('contact_preference') or '', '')
            styles = ", ".join(devis_data.get('styles') or [])

            def row(label, value):
                return f'<tr><td style="padding: 6px 0; font-weight: bold; width: 35%; vertical-align: top;">{label} :</td><td>{value}</td></tr>' if value else ''

            calc = devis_data.get('calculateur') or {}
            num = lambda x: f"{x:g}" if isinstance(x, (int, float)) else str(x)
            calc_section = ""
            if calc.get('estimation'):
                calc_section = f"""
                    <h3 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Calculateur de prix</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        {row('Dimensions', html.escape(f"{num(calc.get('largeur'))} pi × {num(calc.get('profondeur'))} pi"))}
                        {row('Étages', html.escape(str(calc.get('etages'))))}
                        {row('Surface totale', html.escape(f"{num(calc.get('surface'))} pi²"))}
                        {row('Estimation affichée', html.escape(f"~ {calc.get('estimation'):,} $".replace(',', ' ')))}
                    </table>
                """

            subject = f"Nouveau devis - {devis_data.get('prenom', '')} {devis_data.get('nom', 'Client')} - {_now_qc().strftime('%d/%m/%Y')}"

            notes_section = ""
            if devis_data.get('notes'):
                notes_section = f"""
                    <h3 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Description</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #0f766e; margin-bottom: 20px;">
                        <p style="margin: 0; white-space: pre-wrap;">{esc('notes', '')}</p>
                    </div>
                """

            fichiers = devis_data.get('fichiers') or []
            fichiers_section = ""
            if fichiers:
                items = "".join(
                    f'<li style="margin: 6px 0;">{html.escape(f["filename"])}'
                    f' <span style="color: #64748b; font-size: 12px;">({_format_size(f["size"])})</span></li>'
                    for f in fichiers
                )
                fichiers_section = f"""
                    <h3 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Fichiers du client ({len(fichiers)})</h3>
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">En pièces jointes de ce courriel. Ils ne sont pas gardés sur le site : téléchargez-les ou placez-les dans votre WorkDrive.</p>
                    <ul style="margin: 0 0 20px 0; padding-left: 20px;">{items}</ul>
                """

            body = f"""
                <h2 style="color: #0f766e; margin: 0 0 16px 0;">Nouvelle demande de devis</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0;">{_now_qc().strftime('%d/%m/%Y à %H:%M')}</p>

                <h3 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Informations client</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Prénom :</td><td>{esc('prenom')}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Nom :</td><td>{esc('nom')}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Courriel :</td><td><a href="mailto:{esc('email', '')}" style="color: #0f766e;">{esc('email')}</a></td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Téléphone :</td><td>{esc('telephone')}</td></tr>
                </table>

                <h3 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Détails du projet</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    {row('Type', project_type)}
                    {row('Plans demandés', plans_choisis_text or 'Aucun')}
                    {row('Recherche', html.escape(representation))}
                    {row('Style', html.escape(styles))}
                    {row('Préfère être contacté', f'<strong>{html.escape(contact_pref)}</strong>' if contact_pref else '')}
                </table>

                {calc_section}
                {notes_section}
                {fichiers_section}

                <div style="background: #f0fdf4; border-radius: 8px; padding: 12px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #166534;">
                        Répondre à <strong>{esc('email', '')}</strong> | Appeler au <strong>{esc('telephone', 'N/A')}</strong>
                    </p>
                </div>
            """

            sent = self._send_email(recipient_email, subject, self._wrap_email(body), attachments)
            if not sent and attachments:
                # Les fichiers ne sont gardés nulle part : on réessaie une fois
                sent = self._send_email(recipient_email, subject, self._wrap_email(body), attachments)
            return sent

        except Exception as e:
            logger.error(f"Erreur envoi email devis: {str(e)}")
            return False

    def send_contact_notification(self, contact_data):
        """Notification d'un message reçu par le formulaire de contact"""
        try:
            esc = lambda key: html.escape(str(contact_data.get(key) or ''))
            subject = f"Nouveau message - {contact_data.get('nom', 'Visiteur')} - {contact_data.get('sujet') or 'Contact'}"
            body = f"""
                <h2 style="color: #0f766e; margin: 0 0 16px 0;">Nouveau message — formulaire de contact</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0;">{_now_qc().strftime('%d/%m/%Y à %H:%M')}</p>
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Nom :</td><td>{esc('nom')}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Courriel :</td><td><a href="mailto:{esc('email')}" style="color: #0f766e;">{esc('email')}</a></td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Téléphone :</td><td>{esc('telephone') or 'Non fourni'}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Sujet :</td><td>{esc('sujet') or 'Aucun'}</td></tr>
                </table>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; border-left: 4px solid #0f766e;">
                    <p style="margin: 0; white-space: pre-wrap;">{esc('message')}</p>
                </div>
            """
            return self._send_email(os.getenv('ADMIN_EMAIL', 'abrisia0plan@gmail.com'), subject, self._wrap_email(body))
        except Exception as e:
            logger.error(f"Erreur envoi notification contact: {str(e)}")
            return False

    def send_pro_contact_notification(self, contact_data):
        """Envoie notification de demande entrepreneur à l'admin"""
        try:
            recipient_email = "abrisia0plan@gmail.com"
            company = contact_data.get('company', '')
            contact_name = contact_data.get('contact_name', 'Entrepreneur')
            subject = f"Nouvelle demande entrepreneur - {company} ({contact_name}) - {_now_qc().strftime('%d/%m/%Y')}"
            body = f"""
                <h2 style="color: #0f766e; margin: 0 0 16px 0;">Nouvelle demande — Espace Pro</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0;">{_now_qc().strftime('%d/%m/%Y à %H:%M')}</p>
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr><td style="padding: 6px 0; font-weight: bold; width: 30%;">Entreprise :</td><td>{company}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Nom du contact :</td><td>{contact_name}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Courriel :</td><td><a href="mailto:{contact_data.get('email', '')}" style="color: #0f766e;">{contact_data.get('email', '')}</a></td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold;">Téléphone :</td><td>{contact_data.get('phone', 'Non fourni')}</td></tr>
                </table>
                {f'<div style="background: #f8f9fa; border-radius: 8px; padding: 15px; border-left: 4px solid #0f766e;"><h4 style="margin: 0 0 8px 0; color: #0f766e;">Message :</h4><p style="margin: 0;">{contact_data.get("message", "")}</p></div>' if contact_data.get('message') else ''}
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{self.app_url}/admin" style="display: inline-block; background: #0f766e; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">Voir dans l'admin</a>
                </div>
            """
            return self._send_email(recipient_email, subject, self._wrap_email(body))
        except Exception as e:
            logger.error(f"Erreur envoi notification entrepreneur: {str(e)}")
            return False


# Instance globale du service email
email_service = EmailService()