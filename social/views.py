
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

from .authentication import ClerkAuthentication
from .imagekit import imagekit
from .models import User, Post, Comment, Message


# ==================================================
# HELPERS
# ==================================================

def get_image_url(image):
    if not image:
        return None

    image_value = str(image)

    if image_value.startswith("http://") or image_value.startswith("https://"):
        return image_value

    try:
        return image.url
    except (ValueError, AttributeError):
        return image_value


def serialize_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "username": user.username,
        "bio": user.bio,

        "profile_picture": get_image_url(
            user.profile_picture
        ),

        "cover_photo": get_image_url(
            user.cover_photo
        ),

        "location": user.location,
        "created_at": user.created_at,
        "updated_at": user.updated_at,

        "followers_count": user.followers.count(),
        "following_count": user.following.count(),
    }


def serialize_post(post, current_user=None):
    is_liked = False

    if current_user:
        is_liked = post.likes.filter(
            id=current_user.id
        ).exists()

    return {
        "id": post.id,

        "user": serialize_user(
            post.user
        ),

        "content": post.content,

        "image_urls": post.image_urls,

        "post_type": post.post_type,

        "likes_count": getattr(
            post,
            "likes_count",
            post.likes.count()
        ),

        "comments_count": getattr(
            post,
            "comments_count",
            post.comments.count()
        ),

        "is_liked": is_liked,

        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


def serialize_comment(comment):
    return {
        "id": comment.id,

        "post_id": comment.post_id,

        "user": serialize_user(
            comment.user
        ),

        "content": comment.content,

        "created_at": comment.created_at,

        "updated_at": comment.updated_at,
    }


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
        "user": serialize_user(
            request.user
        ),
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

        upload = imagekit.files.upload(
            file=profile_picture.read(),
            file_name=profile_picture.name,
            folder="/postly/profile_pictures",
        )

        user.profile_picture = upload.url

    # ----------------------------------------------
    # COVER PHOTO
    # ----------------------------------------------

    cover_photo = request.FILES.get(
        "cover_photo"
    )

    if cover_photo:

        upload = imagekit.files.upload(
            file=cover_photo.read(),
            file_name=cover_photo.name,
            folder="/postly/cover_photos",
        )

        user.cover_photo = upload.url

    user.save()

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

    is_following = request.user.following.filter(
        id=user.id
    ).exists()

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

    # ----------------------------------------------
    # POSTS COUNT
    # ----------------------------------------------

    posts_count = posts.count()

    # ----------------------------------------------
    # TOTAL LIKES
    # ----------------------------------------------

    total_likes = sum(
        post.likes_count
        for post in posts
    )

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return Response({
        "success": True,

        "profile": serialize_user(
            user
        ),

        "is_following": is_following,

        "followers_count": followers_count,

        "following_count": following_count,

        "posts_count": posts_count,

        "total_likes": total_likes,

        "posts": [
            serialize_post(
                post,
                request.user
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

    if not search:
        return Response({
            "success": True,
            "users": [],
        })

    users = (
        User.objects
        .filter(
            Q(username__icontains=search)
            | Q(email__icontains=search)
            | Q(full_name__icontains=search)
            | Q(location__icontains=search)
        )
        .exclude(
            id=request.user.id
        )[:20]
    )

    return Response({
        "success": True,

        "users": [
            serialize_user(user)
            for user in users
        ],
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

    # ----------------------------------------------
    # GET USER
    # ----------------------------------------------

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

        "user": serialize_user(
            user
        ),

        "is_following": is_following,

        "followers_count": followers.count(),

        "following_count": following.count(),

        "followers": [
            serialize_user(follower)
            for follower in followers
        ],

        "following": [
            serialize_user(following_user)
            for following_user in following
        ],

        "posts_count": posts.count(),

        "total_likes": total_likes,

        "posts": [
            serialize_post(
                post,
                request.user
            )
            for post in posts
        ],

        "liked_posts": [
            serialize_post(
                post,
                request.user
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
    )

    return Response(
        {
            "success": True,
            "message": "Post created successfully.",
            "post": serialize_post(
                post,
                request.user
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
                user
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

    return Response({
        "success": True,

        "liked": liked,

        "likes_count": (
            post.likes.count()
        ),
    })


# ==================================================
# 10. POST DETAILS
# GET /api/posts/<post_id>/details/
# ==================================================

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def post_details(request, post_id):

    # ----------------------------------------------
    # GET POST
    # ----------------------------------------------

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

    # ----------------------------------------------
    # COMMENTS
    # ----------------------------------------------

    comments = (
        Comment.objects
        .filter(post=post)
        .select_related("user")
        .order_by("created_at")
    )

    # ----------------------------------------------
    # LIKES
    # ----------------------------------------------

    likes = post.likes.all()

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return Response({

        "success": True,

        "post": serialize_post(
            post,
            request.user
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
# 11. ADD / DELETE COMMENT
# POST /api/posts/<post_id>/comments/
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):

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

    action = request.data.get(
        "action",
        "add"
    )

    # ----------------------------------------------
    # DELETE COMMENT
    # ----------------------------------------------

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

        # ------------------------------------------
        # ONLY COMMENT OWNER CAN DELETE
        # ------------------------------------------

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
            "message": "Comment deleted successfully.",
        })

    # ----------------------------------------------
    # ADD COMMENT
    # ----------------------------------------------

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

    return Response(
        {
            "success": True,
            "message": "Comment added successfully.",
            "comment": serialize_comment(
                comment
            ),
        },
        status=status.HTTP_201_CREATED,
    )


# ==================================================
# 12. CHAT IMAGE UPLOAD
# POST /api/chat/upload-image/
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_chat_image(request):

    image = request.FILES.get(
        "image"
    )

    if not image:
        return Response(
            {
                "success": False,
                "message": "Image is required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:

        upload = imagekit.files.upload(
            file=image.read(),
            file_name=image.name,
            folder="/postly/chat_images",
        )

        media_url = upload.url

        return Response({
            "success": True,
            "message_type": "image",
            "media_url": media_url,
        })

    except Exception:

        return Response(
            {
                "success": False,
                "message": "Image upload failed.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ==================================================
# 13. GET CHAT MESSAGES
# POST /api/chat/messages/
# ==================================================

@api_view(["POST"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def get_chat_messages(request):

    user = request.user

    to_user_id = request.data.get(
        "to_user_id"
    )

    if not to_user_id:
        return Response(
            {
                "success": False,
                "message": "User id is required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ----------------------------------------------
    # GET OTHER USER
    # ----------------------------------------------

    try:
        other_user = User.objects.get(
            id=to_user_id
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
    # GET CHAT MESSAGES
    # ----------------------------------------------

    messages = (
        Message.objects
        .filter(
            Q(
                from_user=user,
                to_user=other_user
            )
            |
            Q(
                from_user=other_user,
                to_user=user
            )
        )
        .select_related(
            "from_user",
            "to_user"
        )
        .order_by("created_at")
    )

    # ----------------------------------------------
    # MARK RECEIVED MESSAGES AS SEEN
    # ----------------------------------------------

    Message.objects.filter(
        from_user=other_user,
        to_user=user,
        seen=False
    ).update(
        seen=True
    )

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return Response({
        "success": True,

        "messages": [
            {
                "id": message.id,

                "from_user_id": str(
                    message.from_user.id
                ),

                "to_user_id": str(
                    message.to_user.id
                ),

                "text": message.text,

                "message_type": (
                    message.message_type
                ),

                "media_url": (
                    message.media_url
                ),

                "seen": message.seen,

                "created_at": (
                    message.created_at.isoformat()
                ),
            }

            for message in messages
        ],
    })




