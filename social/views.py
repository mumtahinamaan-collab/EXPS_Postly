
from django.db.models import Count, Q
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

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

from .authentication import ClerkAuthentication
from .imagekit import imagekit
from .models import (
    User,
    Post,
    Comment,
    Notification,
)
from .serializers import (
    UserSerializer,
    PostSerializer,
    CommentSerializer,
    NotificationSerializer,
    ChatListSerializer,
)


# ==================================================
# HELPERS
# ==================================================

def get_image_url(image, default_profile=True):

    DEFAULT_PROFILE_PICTURE = (
        "https://ik.imagekit.io/mumtahina/"
        "postly/profile_pictures/image.jpg"
    )

    if not image:
        return DEFAULT_PROFILE_PICTURE if default_profile else None

    image_value = str(image)

    if (
        image_value.startswith("http://")
        or image_value.startswith("https://")
    ):
        return image_value

    try:
        return image.url

    except (ValueError, AttributeError):
        return image_value


# ==================================================
# SERIALIZER HELPERS
# ==================================================

def serialize_user(user):

    data = UserSerializer(user).data

    # ImageField can incorrectly generate MEDIA_URL
    # when ImageKit URL is stored inside the field.
    data["profile_picture"] = get_image_url(
        user.profile_picture
    )

    data["cover_photo"] = get_image_url(
        user.cover_photo,
        default_profile=False
    )

    return data


def serialize_post(post, request):

    data = PostSerializer(
        post,
        context={"request": request},
    ).data

    # Fix nested user image URLs
    if data.get("user"):

        data["user"]["profile_picture"] = get_image_url(
            post.user.profile_picture
        )

        data["user"]["cover_photo"] = get_image_url(
            post.user.cover_photo,
            default_profile=False

        )

    return data


def serialize_comment(comment):

    data = CommentSerializer(comment).data

    if data.get("user"):

        data["user"]["profile_picture"] = get_image_url(
            comment.user.profile_picture
        )

        data["user"]["cover_photo"] = get_image_url(
            comment.user.cover_photo,
            default_profile=False
        )

    return data


# ==================================================
# NOTIFICATION HELPER
# ==================================================

def create_notification(
    recipient,
    actor,
    notification_type,
    message="",
    post=None,
):
    # Do not notify yourself
    if recipient.id == actor.id:
        return

    notification = Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        message=message,
        post=post,
    )

    channel_layer = get_channel_layer()

    notification_data = {
        "id": notification.id,
        "notification_type": notification.notification_type,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
        "actor": {
            "id": str(actor.id),
            "username": actor.username,
            "full_name": actor.full_name,
            "profile_picture": get_image_url(
                actor.profile_picture
            ),
            "cover_photo": get_image_url(
                actor.cover_photo,
                default_profile=False
            ),
        },
        "post_id": post.id if post else None,
    }

    async_to_sync(channel_layer.group_send)(
        f"notifications_{recipient.id}",
        {
            "type": "notification_message",
            "notification": notification_data,
        },
    )

# ==================================================
# 1. CURRENT USER
# GET /api/user/data/
# ==================================================

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def get_user_data(request):

    return Response({
        "success": True,
        "user": serialize_user(request.user),
    })


# ==================================================
# 2. UPDATE USER
# POST /api/user/update/
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

            username_exists = (
                User.objects
                .filter(username=username)
                .exclude(id=user.id)
                .exists()
            )

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

    profile_picture = request.FILES.get(
        "profile_picture"
    )

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
                        "message": (
                            "Profile picture upload failed."
                        ),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Save ImageKit URL
            user.profile_picture = upload.url

        except Exception:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Profile picture upload failed."
                    ),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ----------------------------------------------
    # COVER PHOTO
    # ----------------------------------------------

    cover_photo = request.FILES.get(
        "cover_photo"
    )

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
                        "message": (
                            "Cover photo upload failed."
                        ),
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Save ImageKit URL
            user.cover_photo = upload.url

        except Exception:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Cover photo upload failed."
                    ),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ----------------------------------------------
    # SAVE USER
    # ----------------------------------------------

    user.save()

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return Response({
        "success": True,
        "message": "Profile updated successfully.",
        "user": serialize_user(user),
    })


# ==================================================
# 3. USER PROFILE
# POST /api/users/profiles/
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def get_profile(request):

    profile_id = request.data.get(
        "profileId"
    )

    if not profile_id:
        return Response(
            {
                "success": False,
                "message": "Profile id is required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:

        user = User.objects.get(
            id=profile_id
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
    # FOLLOW STATUS
    # ----------------------------------------------

    is_following = (
        request.user.following
        .filter(id=user.id)
        .exists()
    )

    # ----------------------------------------------
    # FOLLOWERS / FOLLOWING COUNTS
    # ----------------------------------------------

    followers_count = user.followers.count()
    following_count = user.following.count()

    # ----------------------------------------------
    # USER POSTS
    # ----------------------------------------------

    posts = (
        Post.objects
        .filter(user=user)
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

    posts_count = posts.count()

    # ----------------------------------------------
    # LIKED POSTS
    # ----------------------------------------------

    liked_posts = (
        Post.objects
        .filter(
            likes__id=user.id
        )
        .distinct()
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

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return Response({

        "success": True,

        "profile": serialize_user(user),

        "is_following": is_following,

        "followers_count": followers_count,

        "following_count": following_count,

        "posts_count": posts_count,

        "liked_posts": [
            serialize_post(
                post,
                request,
            )
            for post in liked_posts
        ],

        "posts": [
            serialize_post(
                post,
                request,
            )
            for post in posts
        ],
    })


# ==================================================
# 4. DISCOVER USERS
# POST /api/users/discover/
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
            | Q(email__icontains=search)
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
# 5. FOLLOW / UNFOLLOW TOGGLE
# POST /api/users/follow/
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

        target_user.followers.remove(
            user
        )

        following = False

    # ----------------------------------------------
    # FOLLOW
    # ----------------------------------------------

    else:

        user.following.add(
            target_user
        )

        target_user.followers.add(
            user
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


# ==================================================
# 6. USER SOCIAL DATA
# GET /api/users/<user_id>/social/
# ==================================================

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def user_social_data(request, user_id):

    try:

        user = User.objects.get(
            id=user_id
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
    # FOLLOWERS
    # ----------------------------------------------

    followers = user.followers.all()

    # ----------------------------------------------
    # FOLLOWING
    # ----------------------------------------------

    following = user.following.all()

    # ----------------------------------------------
    # USER POSTS
    # ----------------------------------------------

    posts = (
        Post.objects
        .filter(user=user)
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

    # ----------------------------------------------
    # TOTAL LIKES
    # ----------------------------------------------

    total_likes = sum(
        post.likes_count
        for post in posts
    )

    # ----------------------------------------------
    # LIKED POSTS
    # ----------------------------------------------

    liked_posts = (
        Post.objects
        .filter(
            likes__id=user.id
        )
        .distinct()
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

    # ----------------------------------------------
    # FOLLOW STATUS
    # ----------------------------------------------

    is_following = (
        request.user.following
        .filter(id=user.id)
        .exists()
    )

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return Response({

        "success": True,

        "user": serialize_user(user),

        "is_following": is_following,

        "followers_count": followers.count(),

        "following_count": following.count(),

        "followers": [
            {
                **serialize_user(follower),
                "following": (
                    request.user.following
                    .filter(id=follower.id)
                    .exists()
                ),
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

        "total_likes": total_likes,

        "posts": [
            serialize_post(
                post,
                request,
            )
            for post in posts
        ],

        "liked_posts": [
            serialize_post(
                post,
                request,
            )
            for post in liked_posts
        ],
    })


# ==================================================
# 7. ADD POST
# POST /api/posts/add/
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

    # ----------------------------------------------
    # IMAGEKIT UPLOAD
    # ----------------------------------------------

    for image in uploaded_images:

        upload = imagekit.files.upload(
            file=image.read(),
            file_name=image.name,
            folder="/postly/posts",
        )

        image_urls.append(
            upload.url
        )


    # ----------------------------------------------
    # AUTO POST TYPE
    # ----------------------------------------------

    if content and image_urls:

        post_type = "text_with_image"

    elif image_urls:

        post_type = "image"

    else:

        post_type = "text"

    # ----------------------------------------------
    # EMPTY POST CHECK
    # ----------------------------------------------

    if not content and not image_urls:

        return Response(
            {
                "success": False,
                "message": "Post cannot be empty.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ----------------------------------------------
    # CREATE POST
    # ----------------------------------------------

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
# 8. FEED
# GET /api/posts/feed/
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
# 9. LIKE / UNLIKE TOGGLE
# POST /api/posts/<post_id>/like/
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
# 10. DELETE POST
# DELETE /api/posts/<post_id>/delete/
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
# 11. POST DETAILS
# GET /api/posts/<post_id>/details/
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


# ==================================================
# 12. GET / ADD / DELETE COMMENTS
# ==================================================

@api_view(["GET", "POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):

    user = request.user

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

    # ==================================================
    # GET COMMENTS
    # ==================================================

    if request.method == "GET":

        comments = (
            Comment.objects
            .filter(post=post)
            .select_related("user")
            .order_by("created_at")
        )

        return Response({

            "success": True,

            "comments": [
                serialize_comment(comment)
                for comment in comments
            ],

            "comments_count": comments.count(),
        })

    # ==================================================
    # POST
    # ==================================================

    action = request.data.get(
        "action",
        "add"
    )

    # ==================================================
    # DELETE COMMENT
    # ==================================================

    if action == "delete":

        comment_id = request.data.get(
            "comment_id"
        )

        if not comment_id:

            return Response(
                {
                    "success": False,
                    "message": "Comment id is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            comment = Comment.objects.get(
                id=comment_id,
                post=post
            )

        except Comment.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message": "Comment not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if str(comment.user.id) != str(user.id):

            return Response(
                {
                    "success": False,
                    "message": (
                        "You can only delete "
                        "your own comment."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        comment.delete()

        return Response({

            "success": True,

            "message": (
                "Comment deleted successfully."
            ),

            "comments_count": (
                Comment.objects
                .filter(post=post)
                .count()
            ),
        })

    # ==================================================
    # ADD COMMENT
    # ==================================================

    content = request.data.get(
        "content",
        ""
    ).strip()

    if not content:

        return Response(
            {
                "success": False,
                "message": "Comment cannot be empty.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    comment = Comment.objects.create(
        post=post,
        user=user,
        content=content,
    )

    # ----------------------------------------------
    # COMMENT NOTIFICATION
    # ----------------------------------------------

    if post.user.id != user.id:

        create_notification(
            recipient=post.user,
            actor=user,
            notification_type="comment",
            message=(
                f"{user.username} "
                f"commented on your post."
            ),
            post=post,
        )

    return Response(
        {
            "success": True,

            "message": (
                "Comment added successfully."
            ),

            "comment": serialize_comment(
                comment
            ),

            "comments_count": (
                Comment.objects
                .filter(post=post)
                .count()
            ),
        },
        status=status.HTTP_201_CREATED,
    )


# ==================================================
# 13. GET NOTIFICATIONS
# GET /api/notifications/
# ==================================================


@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = (
        Notification.objects
        .filter(recipient=request.user)
        .select_related("actor", "recipient", "post")
        .order_by("-created_at")
    )

    serializer = NotificationSerializer(
        notifications,
        many=True,
        context={"request": request},
    )

    notification_data = serializer.data

    for item, notification in zip(notification_data, notifications):
        if item.get("actor"):
            item["actor"]["profile_picture"] = get_image_url(
                notification.actor.profile_picture
            )
            item["actor"]["cover_photo"] = get_image_url(
                notification.actor,
                default_profile=False
                

            )

    unread_count = notifications.filter(is_read=False).count()

    return Response({
        "success": True,
        "notifications": notification_data,
        "unread_count": unread_count,
    })

# ==================================================
# 14. DELETE ONE NOTIFICATION
# DELETE /api/notifications/<notification_id>/
# ==================================================

@api_view(["DELETE"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def delete_notification(
    request,
    notification_id
):

    try:

        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user,
        )

    except Notification.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "Notification not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    notification.delete()

    return Response({

        "success": True,

        "message": (
            "Notification deleted successfully."
        ),
    })


# ==================================================
# MARK ONE NOTIFICATION AS READ
# PATCH /api/notifications/<notification_id>/read/
# ==================================================

@api_view(["PATCH"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):

    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user,
        )

    except Notification.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Notification not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    return Response({
        "success": True,
        "message": "Notification marked as read.",
        "notification_id": notification.id,
        "is_read": notification.is_read,
    })

