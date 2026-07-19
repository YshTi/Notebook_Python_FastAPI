import jwt
from app.config import settings
from app.auth_utils import ALGORITHM, create_access_token

token = create_access_token(data={"sub": "1"})
print("Token:", token)
try:
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
    print("Payload:", payload)
except Exception as e:
    print("Error:", e)
