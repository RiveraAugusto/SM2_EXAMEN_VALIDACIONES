import logging
from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials
from google.auth.transport.requests import Request
from google.oauth2 import id_token as google_id_token

from config import get_settings

settings = get_settings()

logger = logging.getLogger(__name__)
firebase_app = None
_firebase_init_error = None


def _ensure_firebase_initialized() -> None:
    global firebase_app, _firebase_init_error

    if firebase_app is not None or _firebase_init_error is not None:
        return

    try:
        firebase_app = firebase_admin.get_app()
        return
    except ValueError:
        pass

    try:
        credentials_path = Path(settings.FIREBASE_CREDENTIALS_PATH)
        if credentials_path.is_file():
            cred = credentials.Certificate(str(credentials_path))
            firebase_app = firebase_admin.initialize_app(
                cred,
                {"projectId": settings.FIREBASE_PROJECT_ID},
            )
            return
        _firebase_init_error = FileNotFoundError(str(credentials_path))
    except Exception as e:
        _firebase_init_error = e
        logger.warning("Firebase Admin no inicializado: %s", e)


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.
    Raises firebase_admin.auth.InvalidIdTokenError if invalid.
    """
    _ensure_firebase_initialized()
    if firebase_app is not None:
        try:
            return auth.verify_id_token(id_token)
        except Exception as e:
            if "project" not in str(e).lower():
                raise
            logger.warning("Fallo verify_id_token con Firebase Admin, usando fallback: %s", e)

    try:
        if not settings.FIREBASE_PROJECT_ID:
            raise RuntimeError("FIREBASE_PROJECT_ID no configurado.")

        request = Request()
        if hasattr(google_id_token, "verify_firebase_token"):
            return google_id_token.verify_firebase_token(
                id_token,
                request,
                audience=settings.FIREBASE_PROJECT_ID,
                clock_skew_in_seconds=settings.FIREBASE_CLOCK_SKEW_SECONDS,
            )

        certs_url = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
        return google_id_token.verify_token(
            id_token,
            request,
            audience=settings.FIREBASE_PROJECT_ID,
            certs_url=certs_url,
            clock_skew_in_seconds=settings.FIREBASE_CLOCK_SKEW_SECONDS,
        )
    except Exception as e:
        raise RuntimeError(
            f"Token de Firebase inválido (project_id={settings.FIREBASE_PROJECT_ID}): {e}"
        )


def validate_email_domain(email: str) -> bool:
    """Check if the email belongs to the allowed institutional domain."""
    allowed_domain = settings.ALLOWED_DOMAIN
    return email.endswith(f"@{allowed_domain}")
