import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import User, Message


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.user = self.scope.get("user")

        if not self.user:
            await self.close(code=4001)
            return

        self.user_id = str(self.user.id)

        self.room_group_name = (
            f"chat_{self.user_id}"
        )

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):

        if hasattr(self, "room_group_name"):

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        if data.get("type") == "send_message":

            to_user_id = data.get("to_user_id")
            text = data.get("text", "").strip()
            message_type = data.get(
                "message_type",
                "text"
            )
            media_url = data.get("media_url")

            if not to_user_id:
                return

            if not text and not media_url:
                return

            message = await self.create_message(
                self.user_id,
                to_user_id,
                text,
                message_type,
                media_url
            )

            if not message:
                return

            await self.channel_layer.group_send(
                f"chat_{to_user_id}",
                {
                    "type": "chat_message",
                    "message": message,
                }
            )

            await self.channel_layer.group_send(
                f"chat_{self.user_id}",
                {
                    "type": "chat_message",
                    "message": message,
                }
            )

    async def chat_message(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "message",
                "message": event["message"],
            })
        )

    @database_sync_to_async
    def create_message(
        self,
        from_user_id,
        to_user_id,
        text,
        message_type,
        media_url
    ):

        try:
            sender = User.objects.get(
                id=from_user_id
            )

            receiver = User.objects.get(
                id=to_user_id
            )

        except User.DoesNotExist:
            return None

        if str(sender.id) == str(receiver.id):
            return None

        if not sender.following.filter(
            id=receiver.id
        ).exists():
            return None

        message = Message.objects.create(
            from_user=sender,
            to_user=receiver,
            text=text,
            message_type=message_type,
            media_url=media_url,
        )

        return {
            "id": message.id,
            "from_user_id": str(sender.id),
            "to_user_id": str(receiver.id),
            "text": message.text,
            "message_type": message.message_type,
            "media_url": message.media_url,
            "seen": message.seen,
            "created_at": message.created_at.isoformat(),
        }