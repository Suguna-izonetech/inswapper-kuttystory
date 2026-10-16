import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

from app.config import settings

# Resilient Google SMTP fallback IP endpoints in case local router DNS times out:
GMAIL_FALLBACK_IPS = ['192.178.158.109', '192.178.211.108', '142.250.192.108', '142.251.10.108']

class EmailService:
    @staticmethod
    def send_password_reset_email(to_email: str, reset_code: str, user_name: str = "Admin") -> Dict[str, Any]:
        """
        Sends a password reset email using standard SMTP.
        Never returns or exposes the OTP verification code in API responses.
        """
        subject = f"Password Reset Code: {reset_code} - Kutty Story Admin"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FD; margin: 0; padding: 24px; color: #1E293B; }}
            .container {{ max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; border: 1px solid #EFEFEF; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }}
            .brand {{ font-size: 24px; font-weight: 800; color: #8B3DFF; margin-bottom: 24px; }}
            h2 {{ font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; }}
            p {{ font-size: 14px; line-height: 1.6; color: #4B5563; }}
            .code-box {{ background: #F3E8FF; border: 1px dashed #C084FC; border-radius: 14px; padding: 18px; text-align: center; margin: 28px 0; }}
            .code {{ font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #8B3DFF; }}
            .footer {{ font-size: 12px; color: #9CA3AF; margin-top: 32px; padding-top: 20px; border-top: 1px solid #F3F4F6; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">Kutty Story</div>
            <h2>Password Reset Verification</h2>
            <p>Hello {user_name},</p>
            <p>You requested a password reset for your Kutty Story Admin account. Please use the verification code below to set a new password:</p>
            
            <div class="code-box">
              <span class="code">{reset_code}</span>
            </div>

            <p>This verification code is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
            
            <div class="footer">
              Automated message from Kutty Story Admin Security Service.<br>
              © 2026 Kutty Story Atelier. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """

        plain_text = f"Hello {user_name},\n\nYour Kutty Story Admin password reset code is: {reset_code}\n\nThis code will expire in 15 minutes.\nIf you did not request this, please ignore this email."

        smtp_host = (settings.SMTP_HOST or "smtp.gmail.com").strip()
        smtp_port = int(settings.SMTP_PORT) if settings.SMTP_PORT else 587
        smtp_user = (settings.SMTP_USER or "").strip()
        smtp_password = (settings.SMTP_PASSWORD or "").strip()
        from_email = (settings.SMTP_FROM_EMAIL or smtp_user or "noreply@kuttystory.co.in").strip()
        use_tls = settings.SMTP_USE_TLS

        # Check if SMTP credentials are provided
        if not smtp_user or not smtp_password:
            print(f"[EmailService - SMTP Error] SMTP credentials not configured in backend/.env")
            return {
                "success": False,
                "smtp_sent": False,
                "message": "SMTP credentials not configured in backend/.env"
            }

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        # Candidate connection targets:
        # 1. Primary configured hostname (smtp.gmail.com)
        # 2. Resilient IP endpoints if router DNS is failing or timing out
        targets = [smtp_host]
        if "gmail.com" in smtp_host.lower():
            for f_ip in GMAIL_FALLBACK_IPS:
                if f_ip not in targets:
                    targets.append(f_ip)

        sent = False
        last_error = None

        for target in targets:
            try:
                server = smtplib.SMTP(timeout=12)
                server.connect(target, smtp_port)
                server._host = smtp_host  # SNI for valid TLS certificate handshake
                server.ehlo()
                if use_tls:
                    server.starttls()
                    server.ehlo()
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())
                server.quit()
                print(f"[EmailService - SMTP Sent] Successfully sent password reset email from {from_email} to {to_email} via {target}:{smtp_port}")
                sent = True
                break
            except Exception as e:
                last_error = e
                print(f"[EmailService] Attempt to send via {target}:{smtp_port} failed: {e}")

        # If port 587 failed across all targets, attempt Port 465 SSL fallback
        if not sent:
            for target in targets:
                try:
                    server = smtplib.SMTP_SSL(target, 465, timeout=12)
                    server._host = smtp_host
                    server.ehlo()
                    server.login(smtp_user, smtp_password)
                    server.sendmail(from_email, [to_email], msg.as_string())
                    server.quit()
                    print(f"[EmailService - SMTP Sent] Successfully sent password reset email via SSL 465 ({target}) to {to_email}")
                    sent = True
                    break
                except Exception as e:
                    last_error = e

        if sent:
            return {
                "success": True,
                "smtp_sent": True,
                "message": f"Password reset email sent to {to_email}"
            }
        else:
            print(f"[EmailService - SMTP Error] Could not deliver email to {to_email}: {last_error}")
            return {
                "success": False,
                "smtp_sent": False,
                "message": f"Failed to deliver email: {str(last_error)}"
            }
