from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..authentication import ClerkAuthentication
from ..models import Notification
from ..serializers import NotificationSerializer
from .notification_helpers import create_notification

from .helpers import get_image_url


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


    unread_count = notifications.filter(is_read=False).count()

    return Response({
        "success": True,
        "notifications": notification_data,
        "unread_count": unread_count,
    })

# ==================================================
# DELETE ONE NOTIFICATION
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

