import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional

from app.config import settings

# Resilient Google SMTP fallback IP endpoints in case local router DNS times out:
GMAIL_FALLBACK_IPS = ['192.178.158.109', '192.178.211.108', '142.250.192.108', '142.251.10.108']


def get_carrier_tracking_url(carrier: Optional[str], tracking_id: Optional[str]) -> Optional[str]:
    """Generates direct tracking portal URL for major couriers."""
    if not tracking_id:
        return None
    tid = tracking_id.strip()
    c = (carrier or "").lower().strip()
    if "blue" in c or "dart" in c:
        return f"https://www.bluedart.com/tracking?trackNumber={tid}"
    elif "delhivery" in c:
        return f"https://www.delhivery.com/track/package/{tid}"
    elif "dtdc" in c:
        return f"https://www.dtdc.in/tracking.asp"
    elif "india post" in c or "speed post" in c or "post" in c:
        return f"https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx"
    elif "shadowfax" in c:
        return f"https://tracker.shadowfax.in/#/track/{tid}"
    elif "xpressbees" in c:
        return f"https://www.xpressbees.com/shipment/tracking?awbNo={tid}"
    elif "ekart" in c:
        return "https://ekartlogistics.com/"
    elif "dhl" in c:
        return f"https://www.dhl.com/en/express/tracking.html?AWB={tid}"
    elif "fedex" in c:
        return f"https://www.fedex.com/fedextrack/?trknbr={tid}"
    return None


def safe_print(msg: str):
    try:
        print(msg)
    except Exception:
        try:
            print(msg.encode("ascii", errors="replace").decode("ascii"))
        except Exception:
            pass


class EmailService:
    @staticmethod
    def _send_smtp_email(to_email: str, subject: str, html_body: str, plain_text: str) -> Dict[str, Any]:
        """Low-level helper to send multipart emails through configured SMTP servers."""
        smtp_host = (settings.SMTP_HOST or "smtp.gmail.com").strip()
        smtp_port = int(settings.SMTP_PORT) if settings.SMTP_PORT else 587
        smtp_user = (settings.SMTP_USER or "").strip()
        smtp_password = (settings.SMTP_PASSWORD or "").strip()
        from_email = (settings.SMTP_FROM_EMAIL or smtp_user or "noreply@kuttystory.co.in").strip()
        use_tls = settings.SMTP_USE_TLS

        # Check if SMTP credentials are provided
        if not smtp_user or not smtp_password:
            safe_print(f"[EmailService - SMTP Notice] SMTP credentials not configured in backend/.env. Simulated email sent to {to_email}. Subject: '{subject}'")
            return {
                "success": False,
                "smtp_sent": False,
                "message": "SMTP credentials not configured in backend/.env (simulation logged)"
            }

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_body, "html"))

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
                server._host = smtp_host  # SNI for valid TLS handshake
                server.ehlo()
                if use_tls:
                    server.starttls()
                    server.ehlo()
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())
                server.quit()
                safe_print(f"[EmailService - SMTP Sent] Successfully sent email from {from_email} to {to_email} via {target}:{smtp_port}")
                sent = True
                break
            except Exception as e:
                last_error = e
                safe_print(f"[EmailService] Attempt to send via {target}:{smtp_port} failed: {e}")

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
                    safe_print(f"[EmailService - SMTP Sent] Successfully sent email via SSL 465 ({target}) to {to_email}")
                    sent = True
                    break
                except Exception as e:
                    last_error = e

        if sent:
            return {
                "success": True,
                "smtp_sent": True,
                "message": f"Email delivered to {to_email}"
            }
        else:
            safe_print(f"[EmailService - SMTP Error] Could not deliver email to {to_email}: {last_error}")
            return {
                "success": False,
                "smtp_sent": False,
                "message": f"Failed to deliver email: {str(last_error)}"
            }

    @staticmethod
    def send_password_reset_email(to_email: str, reset_code: str, user_name: str = "Admin") -> Dict[str, Any]:
        """Sends an admin password reset verification code email."""
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

        return EmailService._send_smtp_email(to_email, subject, html_body, plain_text)

    @staticmethod
    def send_order_status_email(
        to_email: str,
        customer_name: str,
        order_number: str,
        status: str,
        format_type: str = "print_hardcover",
        tracking_id: Optional[str] = None,
        shipping_carrier: Optional[str] = None,
        story_title: Optional[str] = None,
        child_name: Optional[str] = None,
        shipping_address: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Sends an order status update email to the customer with rich details.
        Includes carrier name and tracking ID whenever status is 'Shipped' (or tracking info is present).
        """
        if not to_email or not to_email.strip():
            safe_print(f"[EmailService] No valid customer email provided for order {order_number}. Skipping status email.")
            return {"success": False, "smtp_sent": False, "message": "No customer email provided"}

        clean_email = to_email.strip()
        cust_name = customer_name.strip() if customer_name else "Valued Customer"
        story_label = story_title or "Personalized Adventure Storybook"
        child_label = child_name or "Your Little Star"
        is_hardcover = "hardcover" in (format_type or "").lower() or "print" in (format_type or "").lower()
        format_label = "Premium Hardcover Keepsake (8×8\")" if is_hardcover else "Digital Storybook Edition (PDF)"

        # Status specific badges, headers, and descriptions
        if status == "Shipped":
            subject = f"🚚 Your Kutty Story Keepsake Has Shipped! (Order #{order_number})"
            badge_bg = "#EDE9FE"
            badge_color = "#6B21A8"
            status_heading = "Your Storybook Has Shipped!"
            status_message = "Great news! Your keepsake storybook has been lovingly printed, bound, packaged, and handed over to our courier partner. It is now on its way to your home!"
        elif status == "In Production":
            subject = f"🎨 Your Storybook is Being Printed! (Order #{order_number})"
            badge_bg = "#FEF3C7"
            badge_color = "#92400E"
            status_heading = "Your Storybook is in Production!"
            status_message = "Our master printers and bookbinders are currently printing, laminating, and crafting your heirloom storybook with vibrant colors and premium finish."
        elif status == "Paid":
            subject = f"✨ Order & Payment Confirmed! (Order #{order_number})"
            badge_bg = "#D1FAE5"
            badge_color = "#065F46"
            status_heading = "Payment & Order Confirmed!"
            status_message = "Thank you for your order! We have successfully received your payment and our AI atelier has initialized your custom storybook."
        elif status == "Delivered":
            subject = f"🎉 Your Storybook Has Arrived! (Order #{order_number})"
            badge_bg = "#DCFCE7"
            badge_color = "#166534"
            status_heading = "Your Storybook Has Been Delivered!"
            status_message = "Hooray! Your Kutty Story keepsake has been safely delivered. We hope your child and family cherish these magical reading moments!"
        else:
            subject = f"Order #{order_number} Status Update: {status} - Kutty Story"
            badge_bg = "#F1F5F9"
            badge_color = "#334155"
            status_heading = f"Order Status: {status}"
            status_message = f"Your order status has been updated to '{status}'. We are actively managing your storybook fulfillment."

        # Tracking Details Box (Shown prominently if Shipped or tracking_id provided)
        tracking_box_html = ""
        plain_tracking_text = ""
        tracking_url = get_carrier_tracking_url(shipping_carrier, tracking_id)

        if tracking_id or shipping_carrier or status == "Shipped":
            carrier_name = shipping_carrier or "Express Courier"
            tracking_num = tracking_id or "Will be updated shortly"

            track_button_html = ""
            if tracking_url:
                track_button_html = f"""
                <div style="margin-top: 16px; text-align: center;">
                  <a href="{tracking_url}" target="_blank" style="display: inline-block; background: #8B3DFF; color: #FFFFFF; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(139, 61, 255, 0.35);">
                    Track Your Shipment &rarr;
                  </a>
                </div>
                """

            tracking_box_html = f"""
            <div style="background: #FAF5FF; border: 2px solid #C084FC; border-radius: 16px; padding: 22px; margin: 26px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 16px; font-weight: 700; color: #581C87;">📦 Courier & Tracking Information</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #6B7280; width: 140px;">Shipping Carrier:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: 700;">{carrier_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7280;">Tracking / AWB No:</td>
                  <td style="padding: 6px 0; color: #7C3AED; font-weight: 800; font-family: monospace; font-size: 15px; letter-spacing: 0.5px;">{tracking_num}</td>
                </tr>
              </table>
              {track_button_html}
            </div>
            """
            plain_tracking_text = f"\n\n--- SHIPMENT TRACKING ---\nCourier: {carrier_name}\nTracking / AWB: {tracking_num}\n" + (f"Track Online: {tracking_url}\n" if tracking_url else "")

        # Shipping Address Block (if available)
        address_html = ""
        plain_address_text = ""
        if shipping_address and isinstance(shipping_address, dict):
            addr_name = shipping_address.get("full_name") or cust_name
            addr_phone = shipping_address.get("phone") or ""
            addr_street = shipping_address.get("street_address") or ""
            addr_landmark = shipping_address.get("landmark") or ""
            addr_city = shipping_address.get("city") or ""
            addr_state = shipping_address.get("state") or ""
            addr_pin = shipping_address.get("pincode") or ""

            if addr_street or addr_city:
                address_html = f"""
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; margin: 20px 0;">
                  <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B; display: block; margin-bottom: 8px;">Delivery Address</span>
                  <div style="font-size: 13px; color: #1E293B; line-height: 1.5;">
                    <strong>{addr_name}</strong> {f'• {addr_phone}' if addr_phone else ''}<br>
                    {addr_street}<br>
                    {f'Landmark: {addr_landmark}<br>' if addr_landmark else ''}
                    {addr_city}{f', {addr_state}' if addr_state else ''} {f'- {addr_pin}' if addr_pin else ''}
                  </div>
                </div>
                """
                plain_address_text = f"\n\n--- DELIVERY ADDRESS ---\n{addr_name} {f'({addr_phone})' if addr_phone else ''}\n{addr_street}\n{addr_city}, {addr_state} {addr_pin}\n"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FD; margin: 0; padding: 24px; color: #1E293B; }}
            .container {{ max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 36px; border: 1px solid #EDE8F5; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }}
            .header {{ display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 20px; margin-bottom: 24px; }}
            .brand {{ font-size: 24px; font-weight: 900; color: #8B3DFF; letter-spacing: -0.5px; }}
            .badge {{ display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: {badge_bg}; color: {badge_color}; }}
            h2 {{ font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 10px 0; }}
            p {{ font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 14px 0; }}
            .details-card {{ background: #FAFAFA; border: 1px solid #EEEEEE; border-radius: 16px; padding: 20px; margin: 24px 0; }}
            .row {{ display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #E5E7EB; font-size: 13px; }}
            .row:last-child {{ border-bottom: none; }}
            .row-label {{ color: #64748B; }}
            .row-value {{ color: #0F172A; font-weight: 600; text-align: right; }}
            .footer {{ font-size: 12px; color: #94A3B8; margin-top: 36px; padding-top: 24px; border-top: 1px solid #F1F5F9; text-align: center; line-height: 1.6; }}
            .highlight-number {{ font-family: monospace; font-size: 14px; color: #8B3DFF; font-weight: 700; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">Kutty Story</div>
              <div class="badge">{status}</div>
            </div>

            <h2>{status_heading}</h2>
            <p>Hello <strong>{cust_name}</strong>,</p>
            <p>{status_message}</p>

            {tracking_box_html}

            <div class="details-card">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px dashed #E2E8F0;">
                  <td style="padding: 8px 0; color: #64748B;">Order Number</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #8B3DFF; font-family: monospace;">{order_number}</td>
                </tr>
                <tr style="border-bottom: 1px dashed #E2E8F0;">
                  <td style="padding: 8px 0; color: #64748B;">Storybook Edition</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0F172A;">{format_label}</td>
                </tr>
                <tr style="border-bottom: 1px dashed #E2E8F0;">
                  <td style="padding: 8px 0; color: #64748B;">Story Title</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0F172A;">{story_label}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748B;">Hero Child</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0F172A;">{child_label}</td>
                </tr>
              </table>
            </div>

            {address_html}

            <p style="font-size: 13px; color: #64748B; margin-top: 24px;">
              Have questions or need assistance? Simply reply to this email or contact our support team at <a href="mailto:support@kuttystory.co.in" style="color: #8B3DFF; text-decoration: underline;">support@kuttystory.co.in</a>.
            </p>

            <div class="footer">
              Thank you for trusting <strong>Kutty Story Atelier</strong> to bring magical memories to life.<br>
              © 2026 Kutty Story Inc. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """

        plain_text = (
            f"Hello {cust_name},\n\n"
            f"{status_heading}\n"
            f"{status_message}\n\n"
            f"Order Number: {order_number}\n"
            f"Status: {status}\n"
            f"Edition: {format_label}\n"
            f"Story: {story_label}\n"
            f"Hero: {child_label}\n"
            f"{plain_tracking_text}"
            f"{plain_address_text}\n"
            f"Need help? Contact support@kuttystory.co.in\n"
            f"© 2026 Kutty Story Atelier."
        )

        return EmailService._send_smtp_email(clean_email, subject, html_body, plain_text)
