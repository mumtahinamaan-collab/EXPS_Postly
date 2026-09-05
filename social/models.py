
from django.db import models


# ==================================================
# USER
# ==================================================
class User(models.Model):
    id = models.CharField(primary_key=True, max_length=100, editable=False)
    email = models.EmailField()
    full_name = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    bio = models.TextField(default='Hey there! I am using Postly.')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='cover_photos/', blank=True, null=True)
    location = models.CharField(max_length=255, default='', blank=True)

    followers = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers_of',
        blank=True
    )

    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='following_of',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'users'



# ==================================================
# POST
# ==================================================

class Post(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )

    content = models.TextField(
        blank=True,
        null=True
    )

    image_urls = models.JSONField(
        default=list,
        blank=True
    )

    post_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Text'),
            ('image', 'Image'),
            ('text_with_image', 'Text with Image'),
        ]
    )

    likes = models.ManyToManyField(
        User,
        related_name='liked_posts',
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - Post {self.id}"

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']


# ==================================================
# COMMENT
# ==================================================

class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    content = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - Comment on Post {self.post.id}"

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

class Message(models.Model):
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )

    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )

    text = models.TextField(
        blank=True,
        null=True
    )

    message_type = models.CharField(
        max_length=20,
        choices=[
            ("text", "Text"),
            ("image", "Image"),
        ],
        default="text"
    )

    media_url = models.URLField(
        blank=True,
        null=True
    )

    seen = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.from_user.username} → {self.to_user.username}"

    class Meta:
        db_table = "messages"
        ordering = ["created_at"]


class Notification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_notifications"
    )
    notification_type = models.CharField(max_length=30)
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

