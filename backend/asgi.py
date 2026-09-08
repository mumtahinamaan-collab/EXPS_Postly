
import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "backend.settings",
)

from django.core.asgi import get_asgi_application


django_asgi_app = get_asgi_application()


from channels.routing import ProtocolTypeRouter, URLRouter
from social.websocket_auth import ClerkWebSocketAuthMiddleware
from social.routing import websocket_urlpatterns


application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,

        "websocket": ClerkWebSocketAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        ),
    }
)

