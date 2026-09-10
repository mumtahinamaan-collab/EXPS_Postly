from urllib.parse import parse_qs

from channels.db import database_sync_to_async

from .clerk_auth import verify_clerk_token
from .models import User


@database_sync_to_async
def get_user_from_clerk(session):

    if not session:
        return None

    clerk_user_id = session.get("sub")

    if not clerk_user_id:
        return None

    try:
        return User.objects.get(
            id=clerk_user_id
        )
    except User.DoesNotExist:
        return None


class ClerkWebSocketMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):

        scope["user"] = None

        query_string = scope.get(
            "query_string",
            b""
        ).decode()

        query_params = parse_qs(
            query_string
        )

        token = query_params.get(
            "token",
            [None]
        )[0]

        if token:

            session = verify_clerk_token(
                token
            )

            user = await get_user_from_clerk(
                session
            )

            scope["user"] = user

        return await self.app(
            scope,
            receive,
            send
        )