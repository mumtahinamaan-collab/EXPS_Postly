import os
import json

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

        # Verify signature first
        webhook.verify(payload, headers)

        # Svix 2.x no longer returns parsed JSON from verify()
        event = json.loads(payload)

        event_type = event.get("type")
        event_data = event.get("data") or {}

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

    except Exception:
        import traceback
        traceback.print_exc()

        return JsonResponse(
            {"message": "Webhook processing failed"},
            status=400,
        )