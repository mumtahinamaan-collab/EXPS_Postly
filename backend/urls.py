"""
URL configuration for backend project.
"""

from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

import inngest.django

from social.inngest_functions import (
    inngest_client,
    sync_user_from_clerk,
    sync_user_updation,
    sync_user_deletion,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    inngest.django.serve(
        inngest_client,
        [
            sync_user_from_clerk,
            sync_user_updation,
            sync_user_deletion,
        ],
    ),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)