import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.sender_email = os.getenv('SENDER_EMAIL', 'abrisia0plan@gmail.com')
        self.sender_password = os.getenv('SENDER_PASSWORD')
    
    def _send_email(self, to_email, subject, html_content):
        """Méthode interne pour envoyer un email"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"Abrisia Plan <{self.sender_email}>"
            message["To"] = to_email
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
            
            logger.info(f"✅ Email envoyé à {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ Erreur envoi email à {to_email}: {str(e)}")
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
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">✅ Commande confirmée !</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Merci pour votre commande</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        <p style="font-size: 16px;">Bonjour <strong>{order_data['customer_name']}</strong>,</p>
                        
                        <p>Votre commande a bien été enregistrée. Voici les détails :</p>
                        
                        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Numéro de commande</p>
                            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0f766e; font-family: monospace;">{order_data['order_number']}</p>
                        </div>
                        
                        <h3 style="color: #0f766e; margin-top: 30px;">📦 Votre commande</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #f8fafc;">
                                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Kit : {order_data['kit_name']}</td>
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
                                <td style="padding: 15px; font-weight: bold; font-size: 18px;">TOTAL À PAYER</td>
                                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">{order_data['total_amount']:.2f} $</td>
                            </tr>
                        </table>
                        
                        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <h3 style="margin: 0 0 15px 0; color: #92400e;">💳 Instructions de paiement Interac</h3>
                            <p style="margin: 0; color: #78350f;">
                                Pour finaliser votre commande, envoyez le paiement par <strong>Virement Interac</strong> :
                            </p>
                            <div style="background: white; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">
                                <p style="margin: 0; font-size: 18px; color: #0f766e; font-weight: bold;">
                                    📧 abrisia0plan@gmail.com
                                </p>
                                <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">
                                    Question secrète : <strong>Abrisia</strong> | Réponse : <strong>Plan</strong>
                                </p>
                            </div>
                            <p style="margin: 0; color: #78350f; font-size: 14px; text-align: center;">
                                ⚠️ Mentionnez votre numéro de commande : <strong>{order_data['order_number']}</strong>
                            </p>
                        </div>
                        
                        <p style="color: #64748b; font-size: 14px;">
                            Une fois le paiement reçu, vos fichiers vous seront envoyés par email dans les 24 heures.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://abrisia-plan.ca" style="display: inline-block; background: #0f766e; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                🏠 Retourner sur Abrisia Plan
                            </a>
                        </div>
                        
                        <p style="margin-top: 30px;">
                            Des questions ? Répondez directement à cet email ou appelez-nous.
                        </p>
                        
                        <p style="margin-top: 20px;">
                            Cordialement,<br>
                            <strong>L'équipe Abrisia Plan</strong>
                        </p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                        <p style="margin: 0;">Abrisia Plan - Plans sur mesure au Saguenay</p>
                        <p style="margin: 5px 0 0 0;">📧 abrisia0plan@gmail.com</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
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
                        <p style="margin: 0;">Commande reçue le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            return self._send_email(self.sender_email, subject, html_content)
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi notification admin: {str(e)}")
            return False
        
    def send_devis_notification(self, devis_data):
        """
        Envoie une notification email pour un nouveau devis
        """
        try:
            # Destinataire : Abrisia Plan
            recipient_email = "abrisia0plan@gmail.com"
            
            # Formatage des plans choisis
            plans_choisis_text = ", ".join(devis_data.get('plansChoisis', []))
            
            # Formatage du type de représentation
            representation_type = devis_data.get('representationType', 'Non spécifié')
            representation_labels = {
                'technique': 'Plans techniques détaillés',
                'visuel': 'Représentation visuelle/esthétique',
                'both': 'Les deux (technique + visuel)',
                'flexible': 'À votre convenance'
            }
            representation_text = representation_labels.get(representation_type, representation_type)
            
            # Formatage de la préférence de réponse
            response_preference = devis_data.get('responsePreference', 'Non spécifié')
            response_labels = {
                'phone': 'Appel téléphonique',
                'email': 'Par courriel écrit',
                'video': 'Vidéoconférence',
                'flexible': 'À votre convenance'
            }
            response_text = response_labels.get(response_preference, response_preference)
            
            # Création du sujet
            subject = f"🏠 Nouveau devis - {devis_data.get('nom', 'Client')} - {datetime.now().strftime('%d/%m/%Y')}"
            
            # Création du contenu HTML
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="background: #0f766e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                            <h1 style="margin: 0; font-size: 24px;">🏠 Nouvelle demande de devis</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Abrisia Plan - {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">👤 Informations client</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; width: 30%;">Nom :</td>
                                    <td style="padding: 8px 0;">{devis_data.get('nom', 'Non spécifié')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Email :</td>
                                    <td style="padding: 8px 0;"><a href="mailto:{devis_data.get('email', '')}" style="color: #0f766e;">{devis_data.get('email', 'Non spécifié')}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Téléphone :</td>
                                    <td style="padding: 8px 0;">{devis_data.get('telephone', 'Non spécifié')}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px;">
                            <h2 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📋 Détails du projet</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; width: 30%;">Type de projet :</td>
                                    <td style="padding: 8px 0;">{devis_data.get('projectType', 'Non spécifié')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Plans choisis :</td>
                                    <td style="padding: 8px 0;">{plans_choisis_text or 'Aucun'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Représentation :</td>
                                    <td style="padding: 8px 0;">{representation_text}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Préférence réponse :</td>
                                    <td style="padding: 8px 0;">{response_text}</td>
                                </tr>
                            </table>
                        </div>
                        
                        {f'''
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px;">
                            <h2 style="color: #0f766e; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">💬 Description du projet</h2>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #0f766e;">
                                <p style="margin: 0; white-space: pre-wrap;">{devis_data.get('notes', 'Aucune description fournie')}</p>
                            </div>
                        </div>
                        ''' if devis_data.get('notes') else ''}
                        
                        <div style="background: #0f766e; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
                            <p style="margin: 0; font-size: 14px;">
                                📧 Vous pouvez répondre directement à <strong>{devis_data.get('email', '')}</strong><br>
                                📞 Ou appeler au <strong>{devis_data.get('telephone', 'Non spécifié')}</strong>
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
                            <p>Demande générée automatiquement depuis abrisia-plan.ca</p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            # Création du message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # Ajout du contenu HTML
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Envoi de l'email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
                
            logger.info(f"✅ Email de notification envoyé pour le devis de {devis_data.get('nom', 'Client')}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'envoi de l'email de notification: {str(e)}")
            return False

# Instance globale du service email
email_service = EmailService()