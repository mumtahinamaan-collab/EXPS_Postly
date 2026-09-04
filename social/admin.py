
from django.contrib import admin
from .models import (
    User,
    Post,
    Comment,
    Message,
)


# ==================================================
# USER ADMIN
# ==================================================

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
    )


# ==================================================
# POST ADMIN
# ==================================================

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "post_type",
        "content",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "content",
        "user__username",
        "user__email",
    )

    list_filter = (
        "post_type",
        "created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    filter_horizontal = (
        "likes",
    )


# ==================================================
# COMMENT ADMIN
# ==================================================

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "post",
        "user",
        "content",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "content",
        "user__username",
        "user__email",
    )

    list_filter = (
        "created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "from_user",
        "to_user",
        "message_type",
        "text",
        "seen",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "from_user__username",
        "from_user__email",
        "to_user__username",
        "to_user__email",
        "text",
    )

    list_filter = (
        "message_type",
        "seen",
        "created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


