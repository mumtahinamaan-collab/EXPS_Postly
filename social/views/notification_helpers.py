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

    Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        message=message,
        post=post,
    )