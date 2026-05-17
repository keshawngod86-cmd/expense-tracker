import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or secrets.token_urlsafe(32)
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_SECONDS = int(os.getenv("JWT_EXPIRES_SECONDS", "86400"))

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def _verify_legacy_pbkdf2_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_text, hash_text = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False

        salt = base64.b64decode(salt_text.encode("utf-8"))
        expected_hash = base64.b64decode(hash_text.encode("utf-8"))
        actual_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            int(iterations),
        )
        return hmac.compare_digest(actual_hash, expected_hash)
    except (ValueError, TypeError):
        return False


def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash:
        return False

    if stored_hash.startswith("pbkdf2_sha256$"):
        return _verify_legacy_pbkdf2_password(password, stored_hash)

    try:
        return password_context.verify(password, stored_hash)
    except (ValueError, TypeError):
        return False


def password_needs_rehash(stored_hash: str) -> bool:
    if not stored_hash:
        return True

    if stored_hash.startswith("pbkdf2_sha256$"):
        return True

    try:
        return password_context.needs_update(stored_hash)
    except (ValueError, TypeError):
        return True


def create_access_token(payload: dict[str, Any]) -> str:
    expire_at = datetime.now(timezone.utc) + timedelta(seconds=JWT_EXPIRES_SECONDS)
    token_payload = {
        **payload,
        "exp": expire_at,
    }
    return jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
