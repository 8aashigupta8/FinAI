import jwt
from django.conf import settings
from datetime import datetime, timedelta

EMAIL_VERIFY_EXPIRY = timedelta(minutes=15)

def generate_email_verification_jwt(user):
    payload = {
        "user_id": user.id,
        "email": user.email,
        "type": "email_verification",
        "exp": datetime.utcnow() + EMAIL_VERIFY_EXPIRY,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token

def generate_reset_token(user):
    payload = {
        "user_id": user.id,
        "reset_counter": user.reset_counter,
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "type": "password_reset"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def verify_reset_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "password_reset":
            return None, "Invalid token type"
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, "Token expired"
    except jwt.InvalidTokenError:
        return None, "Invalid token"
