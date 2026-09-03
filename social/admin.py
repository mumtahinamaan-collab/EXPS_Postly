from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "username",
        "email",
        "full_name",
        "bio",
        "profile_picture",
        "cover_photo",
        "location",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "id",
        "username",
        "email",
        "full_name",
        "location",
    )

    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )

    filter_horizontal = (
        "followers",
        "following",
        "connections",
    )