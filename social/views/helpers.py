from ..serializers import (
    UserSerializer,
    PostSerializer,
    CommentSerializer,
)


def get_image_url(
    image,
    default_profile=True,
    width=512,
):

    DEFAULT_PROFILE_PICTURE = (
        "https://ik.imagekit.io/mumtahina/"
        "postly/profile_pictures/image.jpg"
    )

    if not image:
        if default_profile:
            return (
                DEFAULT_PROFILE_PICTURE
                + "?tr=w-512,q-auto,f-webp"
            )
        return None

    image_value = str(image)

    if (
        image_value.startswith("http://")
        or image_value.startswith("https://")
    ):
        if "ik.imagekit.io" in image_value:
            separator = "&" if "?" in image_value else "?"

            return (
                f"{image_value}"
                f"{separator}tr=w-{width},q-auto,f-webp"
            )

        return image_value

    try:
        return image.url

    except (ValueError, AttributeError):
        return image_value


def serialize_user(user):

    data = UserSerializer(user).data

    data["profile_picture"] = get_image_url(
        user.profile_picture,
        width=512,
    )

    data["cover_photo"] = get_image_url(
        user.cover_photo,
        width=512,
        default_profile=False
    )

    return data


def serialize_post(post, request):

    data = PostSerializer(
        post,
        context={"request": request},
    ).data

    data["image_urls"] = [
        get_image_url(
            image,
            default_profile=False,
            width=1200,
        )
        for image in data.get("image_urls", [])
    ]

    if data.get("user"):

        data["user"]["profile_picture"] = get_image_url(
            post.user.profile_picture
        )

        data["user"]["cover_photo"] = get_image_url(
            post.user.cover_photo,
            default_profile=False,
            width=1200
        )

    return data


def serialize_comment(comment):

    data = CommentSerializer(comment).data

    if data.get("user"):

        data["user"]["profile_picture"] = get_image_url(
            comment.user.profile_picture
        )

        data["user"]["cover_photo"] = get_image_url(
            comment.user.cover_photo,
            default_profile=False
        )

    return data