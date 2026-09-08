
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async

from .authentication import verify_clerk_token


class ClerkWebSocketAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get(
            "query_string",
            b"",
        ).decode()

        query_params = parse_qs(query_string)

        token = query_params.get(
            "token",
            [None],
        )[0]

        user = None

        if token:
            user = await sync_to_async(
                verify_clerk_token
            )(token)

        scope["user"] = user

        return await self.app(
            scope,
            receive,
            send,
        )

