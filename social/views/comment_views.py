from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..authentication import ClerkAuthentication
from ..models import Post, Comment
from .notification_helpers import create_notification

from .helpers import serialize_comment


# ==================================================
# POST COMMENTS
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