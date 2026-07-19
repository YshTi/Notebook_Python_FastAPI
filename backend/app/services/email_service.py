import httpx
from app.config import settings

async def send_verification_email(to_email: str, name: str | None, token: str):
    confirm_url = f"{settings.backend_url}/api/auth/confirm/{token}"
    display_name = name or to_email

    if not settings.brevo_api_key:
        print("\n" + "="*80)
        print("BREVO_API_KEY is not set. Transactional email simulated.")
        print(f"Recipient: {to_email} ({display_name})")
        print(f"Verification link: {confirm_url}")
        print("="*80 + "\n")
        return

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": settings.brevo_api_key,
        "content-type": "application/json",
        "accept": "application/json",
    }
    sender_email = settings.brevo_sender_email or "no-reply@taskmanager.local"
    
    payload = {
        "sender": {"name": "Task Manager App", "email": sender_email},
        "to": [{"email": to_email, "name": display_name}],
        "subject": "Confirm your email - Task Manager",
        "htmlContent": f"""
            <html>
                <body style="font-family: sans-serif; line-height: 1.5; color: #333;">
                    <h2>Hello {display_name},</h2>
                    <p>Thank you for registering at Task Manager!</p>
                    <p>Please click the link below to confirm your email address and activate your private task space:</p>
                    <p style="margin: 24px 0;">
                        <a href="{confirm_url}" style="padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirm Email</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">
                        <a href="{confirm_url}">{confirm_url}</a>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
                    <p style="font-size: 12px; color: #6b7280;">If you did not request this email, you can safely ignore it.</p>
                </body>
            </html>
        """
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"Verification email successfully sent to {to_email} via Brevo API.")
        except Exception as e:
            print(f"Error sending email to {to_email} via Brevo API: {e}")
            # Fallback output to log so testing is still possible
            print(f"FALLBACK LINK: {confirm_url}")
