from django.db.models import Count, Q

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
from ..imagekit import imagekit
from ..models import User, Post

from .helpers import (
    serialize_user,
    serialize_post,   
)


# ==================================================
# GET CURRENT USER
# ==================================================

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def get_user_data(request):

    user = request.user

    return Response({
        "success": True,
        "user": serialize_user(user),
    })


# ==================================================
# UPDATE CURRENT USER
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_user_data(request):

    user = request.user

    username = request.data.get("username")
    bio = request.data.get("bio")
    location = request.data.get("location")
    full_name = request.data.get("full_name")

    # ----------------------------------------------
    # USERNAME
    # ----------------------------------------------

    if username is not None:

        username = username.strip()

        if username:

            username_exists = (User.objects.filter(username=username).exclude(id=user.id).exists())
            if username_exists:
                return Response(
                    {
                        "success": False,
                        "message": "Username already exists.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.username = username

    # ----------------------------------------------
    # OTHER USER DATA
    # ----------------------------------------------

    if bio is not None:
        user.bio = bio

    if location is not None:
        user.location = location

    if full_name is not None:
        user.full_name = full_name

    # ----------------------------------------------
    # PROFILE PICTURE
    # ----------------------------------------------

    profile_picture = request.FILES.get("profile_picture")

    if profile_picture:

        try:

            upload = imagekit.files.upload(
                file=profile_picture.read(),
                file_name=profile_picture.name,
                folder="/postly/profile_pictures",
            )

            if not upload.url:
                return Response(
                    {
                        "success": False,
                        "message": "Profile picture upload failed.",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            user.profile_picture = upload.url

        except Exception:

            return Response(
                {
                    "success": False,
                    "message": "Profile picture upload failed.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ----------------------------------------------
    # COVER PHOTO
    # ----------------------------------------------

    cover_photo = request.FILES.get("cover_photo")

    if cover_photo:

        try:

            upload = imagekit.files.upload(
                file=cover_photo.read(),
                file_name=cover_photo.name,
                folder="/postly/cover_photos",
            )

            if not upload.url:
                return Response(
                    {
                        "success": False,
                        "message": "Cover photo upload failed.",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            user.cover_photo = upload.url

        except Exception:

            return Response(
                {
                    "success": False,
                    "message": "Cover photo upload failed.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    user.save()

    return Response({
        "success": True,
        "message": "Profile updated successfully.",
        "user": serialize_user(user),
    })


# ==================================================
# GET PROFILE
# ==================================================
@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def get_profile(request):

    profile_id = request.data.get("profileId")

    if not profile_id:
        return Response(
            {
                "success": False,
                "message": "Profile id is required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(id=profile_id)

    except User.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "User not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    is_following = (
        request.user.following
        .filter(id=user.id)
        .exists()
    )

    followers_count = user.followers.count()
    following_count = user.following.count()
    followers = user.followers.all()
    following = user.following.all()

    posts = (
        Post.objects
        .filter(user=user)
        .annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
        )
        .select_related("user")
        .order_by("-created_at")
    )

    liked_posts = (
        Post.objects
        .filter(likes__id=user.id)
        .distinct()
        .annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
        )
        .select_related("user")
        .order_by("-created_at")
    )

    return Response({
        "success": True,
        "profile": serialize_user(user),
        "is_following": is_following,
        "followers_count": followers_count,
        "following_count": following_count,
        "followers": [
            {
                **serialize_user(follower),
                "following": (request.user.following.filter(id=follower.id).exists()),
            }
            for follower in followers
        ],

        "following": [
            {
                **serialize_user(following_user),
                "following": True,
                }
            for following_user in following
            ],
        "posts_count": posts.count(),
        "liked_posts": [
            serialize_post(post, request)
            for post in liked_posts
        ],
        "posts": [
            serialize_post(post, request)
            for post in posts
        ],
    })

# ==================================================
# DISCOVER USERS
# ==================================================
@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def discover_users(request):

    search = request.data.get(
        "input",
        ""
    ).strip()

    users = User.objects.exclude(
        id=request.user.id
    )

    if search:

        users = users.filter(
            Q(username__icontains=search)
            | Q(full_name__icontains=search)
            | Q(location__icontains=search)
        )

    users = users[:20]

    users_data = []

    for user in users:

        user_data = serialize_user(user)

        user_data["is_following"] = (
            request.user.following
            .filter(id=user.id)
            .exists()
        )

        users_data.append(user_data)

    return Response({
        "success": True,
        "users": users_data,
    })



# ==================================================
# FOLLOW / UNFOLLOW
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def toggle_follow(request):

    user = request.user

    target_id = request.data.get(
        "id"
    )

    if not target_id:

        return Response(
            {
                "success": False,
                "message": "User id is required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ----------------------------------------------
    # PREVENT SELF FOLLOW
    # ----------------------------------------------

    if str(user.id) == str(target_id):

        return Response(
            {
                "success": False,
                "message": "You cannot follow yourself.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ----------------------------------------------
    # GET TARGET USER
    # ----------------------------------------------

    try:

        target_user = User.objects.get(
            id=target_id
        )

    except User.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "User not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # ----------------------------------------------
    # CHECK FOLLOWING
    # ----------------------------------------------

    already_following = (
        user.following
        .filter(id=target_user.id)
        .exists()
    )

    # ----------------------------------------------
    # UNFOLLOW
    # ----------------------------------------------

    if already_following:

        user.following.remove(
            target_user
        )
        following = False

    # ----------------------------------------------
    # FOLLOW
    # ----------------------------------------------

    else:

        user.following.add(
            target_user
        )

        following = True

        create_notification(
            recipient=target_user,
            actor=user,
            notification_type="follow",
            message=(
                f"{user.username} "
                f"started following you."
            ),
        )

    return Response({

        "success": True,

        "following": following,

        "followers_count": (
            target_user.followers.count()
        ),

        "following_count": (
            user.following.count()
        ),
    })



