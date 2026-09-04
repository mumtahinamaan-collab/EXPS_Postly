import os
import jwt

from jwt import PyJWKClient

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import User


CLERK_JWKS_URL = os.getenv(
    "CLERK_JWKS_URL",
    "https://live-turtle-5780.clerk.accounts.dev/.well-known/jwks.json",
)

CLERK_AUTHORIZED_PARTIES = [
    party.strip()
    for party in os.getenv(
        "CLERK_AUTHORIZED_PARTIES",
        "",
    ).split(",")
    if party.strip()
]


jwks_client = PyJWKClient(CLERK_JWKS_URL)


def verify_clerk_token(token):
    """
    Verify Clerk JWT token and return the Django User.
    Returns None if token is invalid.
    """

    if not token:
        return None

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_aud": False,
            },
        )

    except (
        jwt.ExpiredSignatureError,
        jwt.ImmatureSignatureError,
        jwt.InvalidTokenError,
    ):
        return None

    except Exception:
        return None

    clerk_user_id = payload.get("sub")

    if not clerk_user_id:
        return None

    authorized_party = payload.get("azp")

    if (
        authorized_party
        and CLERK_AUTHORIZED_PARTIES
        and authorized_party not in CLERK_AUTHORIZED_PARTIES
    ):
        return None

    try:
        return User.objects.get(
            id=clerk_user_id
        )

    except User.DoesNotExist:
        return None


class ClerkAuthentication(BaseAuthentication):

    def authenticate(self, request):

        auth_header = request.headers.get(
            "Authorization"
        )

        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            raise AuthenticationFailed(
                "Invalid authorization header"
            )

        token = auth_header.split(
            " ",
            1
        )[1].strip()

        if not token:
            raise AuthenticationFailed(
                "Authentication token is missing"
            )

        user = verify_clerk_token(token)

        if not user:
            raise AuthenticationFailed(
                "Invalid authentication token"
            )

        return (user, token)