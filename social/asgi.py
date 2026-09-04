import os

from django.core.asgi import get_asgi_application

from channels.routing import ProtocolTypeRouter, URLRouter

from social.middleware import ClerkWebSocketMiddleware
from social.routing import websocket_urlpatterns


os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "backend.settings"
)


django_asgi_app = get_asgi_application()


application = ProtocolTypeRouter({

    "http": django_asgi_app,

    "websocket": ClerkWebSocketMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),

})