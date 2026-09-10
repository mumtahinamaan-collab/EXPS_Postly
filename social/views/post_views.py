from django.db.models import Count,Q

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    parser_classes,
)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .notification_helpers import create_notification

from ..authentication import ClerkAuthentication
from ..models import Post,Comment
from ..imagekit import imagekit

from .helpers import (
    serialize_post,
    serialize_user,
    serialize_comment,
)
# ==================================================
# ADD POST
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def add_post(request):

    user = request.user
    background_color = request.data.get("background_color")

    content = request.data.get(
        "content",
        ""
    ).strip()

    uploaded_images = request.FILES.getlist(
        "images"
    )

    image_urls = []

    for image in uploaded_images:

        upload = imagekit.files.upload(
            file=image.read(),
            file_name=image.name,
            folder="/postly/posts",
        )

        image_urls.append(
            upload.url
        )

    if content and image_urls:

        post_type = "text_with_image"

    elif image_urls:

        post_type = "image"

    else:

        post_type = "text"

    if not content and not image_urls:

        return Response(
            {
                "success": False,
                "message": "Post cannot be empty.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    post = Post.objects.create(
        user=user,
        content=content,
        image_urls=image_urls,
        post_type=post_type,
        background_color=background_color,
    )

    return Response(
        {
            "success": True,
            "message": "Post created successfully.",
            "post": serialize_post(
                post,
                request,
            ),
        },
        status=status.HTTP_201_CREATED,
    )


# ==================================================
# POST FEED
# ==================================================

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def post_feed(request):

    user = request.user

    # ----------------------------------------------
    # FOLLOWING USER IDS
    # ----------------------------------------------

    following_ids = (
        user.following
        .values_list(
            "id",
            flat=True
        )
    )

    # ----------------------------------------------
    # OWN POSTS + FOLLOWING POSTS
    # ----------------------------------------------

    posts = (
        Post.objects
        .filter(
            Q(user=user)
            | Q(user__id__in=following_ids)
        )
        .annotate(
            likes_count=Count(
                "likes",
                distinct=True
            ),
            comments_count=Count(
                "comments",
                distinct=True
            ),
        )
        .select_related("user")
        .order_by("-created_at")
    )

    return Response({

        "success": True,

        "posts": [
            serialize_post(
                post,
                request,
            )
            for post in posts
        ],
    })

# ==================================================
# LIKE / UNLIKE POST
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def toggle_like(request, post_id):

    user = request.user

    # ----------------------------------------------
    # GET POST
    # ----------------------------------------------

    try:

        post = Post.objects.get(
            id=post_id
        )

    except Post.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "Post not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # ----------------------------------------------
    # CHECK LIKE
    # ----------------------------------------------

    already_liked = (
        post.likes
        .filter(id=user.id)
        .exists()
    )

    # ----------------------------------------------
    # UNLIKE
    # ----------------------------------------------

    if already_liked:

        post.likes.remove(
            user
        )

        liked = False

    # ----------------------------------------------
    # LIKE
    # ----------------------------------------------

    else:

        post.likes.add(
            user
        )

        liked = True

        if post.user.id != user.id:

            create_notification(
                recipient=post.user,
                actor=user,
                notification_type="like",
                message=(
                    f"{user.username} "
                    f"liked your post."
                ),
                post=post,
            )

    return Response({

        "success": True,

        "liked": liked,

        "likes_count": (
            post.likes.count()
        ),
    })


# ==================================================
# DELETE POST
# ==================================================

@api_view(["DELETE"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):

    try:

        post = Post.objects.get(
            id=post_id
        )

    except Post.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "Post not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if str(post.user.id) != str(request.user.id):

        return Response(
            {
                "success": False,
                "message": (
                    "You can only delete "
                    "your own post."
                ),
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    post.delete()

    return Response({

        "success": True,

        "message": "Post deleted successfully.",
    })



# ==================================================
# POST DETAILS
# ==================================================

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def post_details(request, post_id):

    try:

        post = (
            Post.objects
            .annotate(
                likes_count=Count(
                    "likes",
                    distinct=True
                ),
                comments_count=Count(
                    "comments",
                    distinct=True
                ),
            )
            .select_related("user")
            .get(id=post_id)
        )

    except Post.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "Post not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    comments = (
        Comment.objects
        .filter(post=post)
        .select_related("user")
        .order_by("created_at")
    )

    likes = post.likes.all()

    return Response({

        "success": True,

        "post": serialize_post(
            post,
            request,
        ),

        "likes_count": post.likes_count,

        "likes": [
            serialize_user(user)
            for user in likes
        ],

        "comments_count": post.comments_count,

        "comments": [
            serialize_comment(comment)
            for comment in comments
        ],
    })
