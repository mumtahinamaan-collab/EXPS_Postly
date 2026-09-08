
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope.get("user")

        if not self.user:
            await self.close(code=4001)
            return

        self.user_id = str(self.user.id)

        self.notification_group_name = (
            f"notifications_{self.user_id}"
        )

        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "notification_group_name"):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name,
            )

    async def notification_message(self, event):
        await self.send(
            text_data=json.dumps({
                "type": "notification",
                "notification": event["notification"],
            })
        )

