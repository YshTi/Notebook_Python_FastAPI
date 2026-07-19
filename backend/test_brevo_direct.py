import asyncio
import httpx
from app.config import settings

async def main():
    print("Settings loaded:")
    print("BACKEND_URL:", settings.backend_url)
    print("BREVO_API_KEY:", settings.brevo_api_key[:10] + "..." if settings.brevo_api_key else "None")
    print("BREVO_SENDER_EMAIL:", settings.brevo_sender_email)
    
    if not settings.brevo_api_key:
        print("Error: BREVO_API_KEY not set.")
        return
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": settings.brevo_api_key,
        "content-type": "application/json",
        "accept": "application/json",
    }
    
    payload = {
        "sender": {"name": "Test App", "email": settings.brevo_sender_email},
        "to": [{"email": settings.brevo_sender_email, "name": "Self Test"}],
        "subject": "Brevo API Direct Test",
        "htmlContent": "<html><body><h3>If you see this, your Brevo API works!</h3></body></html>"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print("Sending request to Brevo...")
            response = await client.post(url, json=payload, headers=headers)
            print("Response Status Code:", response.status_code)
            print("Response Headers:", dict(response.headers))
            print("Response Body:", response.text)
        except Exception as e:
            print("HTTP Exception:", e)

if __name__ == "__main__":
    asyncio.run(main())
