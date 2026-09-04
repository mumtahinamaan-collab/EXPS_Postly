from rest_framework import serializers

from .models import User, Post, Comment, Message


# ==================================================
# USER SERIALIZER
# ==================================================

class UserSerializer(serializers.ModelSerializer):

    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "username",
            "bio",
            "profile_picture",
            "cover_photo",
            "location",
            "created_at",
            "updated_at",
            "followers_count",
            "following_count",
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()


# ==================================================
# POST SERIALIZER
# ==================================================

class PostSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "content",
            "image_urls",
            "post_type",
            "likes_count",
            "comments_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]

    def get_likes_count(self, obj):
        return getattr(
            obj,
            "likes_count",
            obj.likes.count()
        )

    def get_comments_count(self, obj):
        return getattr(
            obj,
            "comments_count",
            obj.comments.count()
        )

    def get_is_liked(self, obj):

        request = self.context.get("request")

        if not request or not request.user:
            return False

        return obj.likes.filter(
            id=request.user.id
        ).exists()


# ==================================================
# COMMENT SERIALIZER
# ==================================================

class CommentSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "user",
            "content",
            "created_at",
            "updated_at",
        ]


# ==================================================
# MESSAGE SERIALIZER
# ==================================================

class MessageSerializer(serializers.ModelSerializer):

    from_user_id = serializers.CharField(
        source="from_user.id",
        read_only=True
    )

    to_user_id = serializers.CharField(
        source="to_user.id",
        read_only=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "from_user_id",
            "to_user_id",
            "text",
            "message_type",
            "media_url",
            "seen",
            "created_at",
            "updated_at",
        ]