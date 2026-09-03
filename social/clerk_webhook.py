import os

import inngest
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from svix.webhooks import Webhook

from .inngest_functions import inngest_client


@csrf_exempt
async def clerk_webhook(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method not allowed"},
            status=405,
        )

    signing_secret = os.getenv("CLERK_WEBHOOK_SIGNING_SECRET")

    if not signing_secret:
        return JsonResponse(
            {"message": "Webhook signing secret is not configured"},
            status=500,
        )

    try:
        payload = request.body

        headers = {
            "svix-id": request.headers.get("svix-id", ""),
            "svix-timestamp": request.headers.get("svix-timestamp", ""),
            "svix-signature": request.headers.get("svix-signature", ""),
        }

        webhook = Webhook(signing_secret)
        event = webhook.verify(payload, headers)

        event_type = event.get("type")
        event_data = event.get("data", {})

        if event_type not in {
            "user.created",
            "user.updated",
            "user.deleted",
        }:
            return JsonResponse(
                {"success": True, "message": "Event ignored"},
                status=200,
            )

        await inngest_client.send(
            inngest.Event(
                name=f"clerk/{event_type}",
                data=event_data,
            )
        )

        return JsonResponse(
            {"success": True},
            status=200,
        )

    except Exception as e:
        return JsonResponse({"message": str(e)},status=400,)