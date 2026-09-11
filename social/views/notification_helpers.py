from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from ..models import Notification


def create_notification(
    recipient,
    actor,
    notification_type,
    message="",
    post=None,
):
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

    async_to_sync(channel_layer.group_send)(
        f"notifications_{recipient.id}",
        {
            "type": "notification_message",
            "notification": {
                "id": notification.id,
                "notification_type": notification.notification_type,
                "message": notification.message,
                "post_id": post.id if post else None,
                "actor": {
                    "id": actor.id,
                    "username": actor.username,
                    "full_name": actor.full_name,
                },
            },
        },
    )