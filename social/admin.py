
from django.contrib import admin
from .models import (
    User,
    Post,
    Comment,
    Notification,
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
        "full_name",
        "location",
    )

    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )

    filter_horizontal = (
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


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "recipient",
        "actor",
        "notification_type",
        "post",
        "is_read",
        "created_at",
    )

    search_fields = (
        "recipient__username",
        "recipient__email",
        "actor__username",
        "actor__email",
    
    )

    list_filter = (
        "notification_type",
        "is_read",
        "created_at",
    )

    readonly_fields = (
        "created_at",
    )


