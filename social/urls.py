
from django.urls import path
from .views.user_views import (
    get_user_data,
    update_user_data,
    get_profile,
    discover_users,
    toggle_follow,
)

from .views.post_views import (
    add_post,
    post_feed,
    toggle_like,
    delete_post,
    post_details,
)

from .views.comment_views import (
    post_comments,
)

from .views.notification_views import (
    get_notifications,
    delete_notification,
    mark_notification_read,
)

urlpatterns = [

    # ==================================================
    # USER
    # ==================================================

    path(
        "user/data/",
        get_user_data,
        name="get-user-data",
    ),

    path(
        "user/update/",
        update_user_data,
        name="update-user-data",
    ),

    path(
        "user/profile/",
        get_profile,
        name="get-profile",
    ),

    path(
        "users/discover/",
        discover_users,
        name="discover-users",
    ),

    path(
        "user/follow/",
        toggle_follow,
        name="toggle-follow",
    ),
    # ==================================================
    # POSTS
    # ==================================================

    path(
        "posts/add/",
        add_post,
        name="add-post",
    ),

    path(
        "posts/feed/",
        post_feed,
        name="post-feed",
    ),

    path(
        "posts/<int:post_id>/like/",
        toggle_like,
        name="toggle-like",
    ),

    path(
        "posts/<int:post_id>/delete/",
        delete_post,
        name="delete-post",
    ),

    path(
        "posts/<int:post_id>/detail/",
        post_details,
        name="post-details",
    ),

    path(
        "posts/<int:post_id>/comments/",
        post_comments,
        name="post-comments",
    ),


    # ==================================================
    # NOTIFICATIONS
    # ==================================================

    path(
        "notifications/",
        get_notifications,
        name="get-notifications",
    ),

    path(
        "notifications/<int:notification_id>/read/",
        mark_notification_read,
        name="mark-notification-read",
    ),

    path(
        "notifications/<int:notification_id>/",
        delete_notification,
        name="delete-notification",
    ),


]

