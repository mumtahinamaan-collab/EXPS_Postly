from django.urls import path

from .views import (
    get_user_data,
    update_user_data,
    discover_users,
    toggle_follow,
    user_social_data,
    add_post,
    post_feed,
    toggle_like,
    post_details,
    post_comments,
    upload_chat_image,
    get_chat_messages,

)


urlpatterns = [

    # ==============================
    # USER
    # ==============================

    path(
        "user/data/",
        get_user_data,
        name="get-user-data"
    ),

    path(
        "user/update/",
        update_user_data,
        name="update-user-data"
    ),

    path(
        "users/discover/",
        discover_users,
        name="discover-users"
    ),

    path(
        "users/follow/",
        toggle_follow,
        name="toggle-follow"
    ),

    path(
        "users/<str:user_id>/social/",
        user_social_data,
        name="user-social-data"
    ),

    # ==============================
    # POSTS
    # ==============================

    path(
        "posts/add/",
        add_post,
        name="add-post"
    ),

    path(
        "posts/feed/",
        post_feed,
        name="post-feed"
    ),

    path(
        "posts/<int:post_id>/like/",
        toggle_like,
        name="toggle-like"
    ),

    path(
        "posts/<int:post_id>/details/",
        post_details,
        name="post-details"
    ),

    path(
        "posts/<int:post_id>/comments/",
        post_comments,
        name="post-comments"
    ),
    path(
        "chat/upload-image/",
        upload_chat_image,
        name="upload-chat-image"
),   path(
        "chat/messages/",
        get_chat_messages,
        name="get-chat-messages",
    ),

    
  
]