import inngest
import os

from .models import User


inngest_client = inngest.Inngest(
    app_id="postly-app",
    is_production=True,
    event_key=os.getenv("INNGEST_EVENT_KEY"),

    signing_key=os.getenv("INNGEST_SIGNING_KEY"),
)


def sync_user_creation(data):
    clerk_id = data["id"]

    first_name = data.get("first_name") or ""
    last_name = data.get("last_name") or ""

    email_addresses = data.get("email_addresses", [])

    if not email_addresses:
        return {
            "success": False,
            "message": "No email address found"
        }

    email = email_addresses[0]["email_address"]

    username = email.split("@")[0]

    if User.objects.filter(username=username).exists():
        username = f"{username}_{clerk_id[-6:]}"

    user, created = User.objects.get_or_create(
        id=clerk_id,
        defaults={
            "email": email,
            "full_name": f"{first_name} {last_name}".strip(),
            "username": username,
        },
    )

    return {
        "success": True,
        "user_id": user.id,
        "created": created,
    }

# Inngest Function to create user data in database

@inngest_client.create_function(
    fn_id="sync-user-from-clerk",
    trigger=inngest.TriggerEvent(
        event="clerk/user.created"
    ),
)
async def sync_user_from_clerk(ctx: inngest.Context):
    data = ctx.event.data

    return await ctx.step.run(
        "create-user",
        sync_user_creation,
        data,
    )

# Inngest Function to update user data in database

@inngest_client.create_function(
    fn_id="update-user-from-clerk",
    trigger=inngest.TriggerEvent(
        event="clerk/user.updated"
    ),
)
async def sync_user_updation(ctx: inngest.Context):
    data = ctx.event.data

    clerk_id = data["id"]

    email_addresses = data.get("email_addresses", [])

    if not email_addresses:
        return {
            "success": False,
            "message": "No email address found"
        }

    email = email_addresses[0]["email_address"]

    first_name = data.get("first_name") or ""
    last_name = data.get("last_name") or ""

    user = await ctx.step.run(
        "update-user",
        lambda: update_user_data(
            clerk_id,
            email,
            f"{first_name} {last_name}".strip(),
        ),
    )

    return user


def update_user_data(clerk_id, email, full_name):
    updated = User.objects.filter(id=clerk_id).update(
        email=email,
        full_name=full_name,
    )

    return {
        "success": updated > 0,
        "user_id": clerk_id,
    }

# Inngest Function to delete user from database
@inngest_client.create_function(
    fn_id="delete-user-with-clerk",
    trigger=inngest.TriggerEvent(
        event="clerk/user.deleted"
    ),
)
async def sync_user_deletion(ctx: inngest.Context):
    data = ctx.event.data

    clerk_id = data["id"]

    return await ctx.step.run(
        "delete-user",
        delete_user,
        clerk_id,
    )


def delete_user(clerk_id):
    deleted, _ = User.objects.filter(id=clerk_id).delete()

    return {
        "success": deleted > 0,
        "user_id": clerk_id,
    }


