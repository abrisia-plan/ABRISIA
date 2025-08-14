import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = os.getenv('SENDER_EMAIL', 'abrisia0plan@gmail.com')
        self.sender_password = os.getenv('SENDER_PASSWORD')
        
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