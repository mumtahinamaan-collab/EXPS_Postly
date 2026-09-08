
from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    User,
    Post,
    Comment,
    Notification,
)


class BasePostlyTestCase(APITestCase):
    """
    Common test setup.
    """

    def setUp(self):
        self.user1 = User.objects.create(
            id="user_1",
            email="user1@test.com",
            full_name="User One",
            username="userone",
        )

        self.user2 = User.objects.create(
            id="user_2",
            email="user2@test.com",
            full_name="User Two",
            username="usertwo",
        )

        self.user3 = User.objects.create(
            id="user_3",
            email="user3@test.com",
            full_name="User Three",
            username="userthree",
        )

        self.client.force_authenticate(
            user=self.user1
        )

    def create_post(
        self,
        user=None,
        content="Test post",
        background_color="#ffffff",
    ):
        return Post.objects.create(
            user=user or self.user1,
            content=content,
            image_urls=[],
            post_type="text",
            background_color=background_color,
        )


# ==================================================
# 1. CURRENT USER
# ==================================================

class CurrentUserTests(BasePostlyTestCase):

    def test_get_current_user(self):
        response = self.client.get(
            reverse("get-user-data")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            response.data["user"]["id"],
            self.user1.id,
        )

        self.assertEqual(
            response.data["user"]["username"],
            "userone",
        )


# ==================================================
# 2. UPDATE USER
# ==================================================

class UpdateUserTests(BasePostlyTestCase):

    def test_update_profile_data(self):
        response = self.client.post(
            reverse("update-user-data"),
            {
                "username": "updateduser",
                "full_name": "Updated Name",
                "bio": "Updated bio",
                "location": "Lahore",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.user1.refresh_from_db()

        self.assertEqual(
            self.user1.username,
            "updateduser",
        )

        self.assertEqual(
            self.user1.full_name,
            "Updated Name",
        )

        self.assertEqual(
            self.user1.bio,
            "Updated bio",
        )

        self.assertEqual(
            self.user1.location,
            "Lahore",
        )

    def test_duplicate_username_rejected(self):
        response = self.client.post(
            reverse("update-user-data"),
            {
                "username": self.user2.username,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            response.data["success"]
        )

        self.assertEqual(
            response.data["message"],
            "Username already exists.",
        )

    def test_empty_username_does_not_replace_existing(self):
        response = self.client.post(
            reverse("update-user-data"),
            {
                "username": "   ",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user1.refresh_from_db()

        self.assertEqual(
            self.user1.username,
            "userone",
        )


# ==================================================
# 3. USER PROFILE
# ==================================================

class UserProfileTests(BasePostlyTestCase):

    def test_get_profile(self):
        post = self.create_post(
            user=self.user2,
            content="User 2 post",
        )

        response = self.client.post(
            reverse("get-profile"),
            {
                "profileId": self.user2.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            response.data["profile"]["id"],
            self.user2.id,
        )

        self.assertEqual(
            response.data["posts_count"],
            1,
        )

        self.assertEqual(
            response.data["posts"][0]["id"],
            post.id,
        )

        self.assertFalse(
            response.data["is_following"]
        )

    def test_profile_requires_id(self):
        response = self.client.post(
            reverse("get-profile"),
            {},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_profile_not_found(self):
        response = self.client.post(
            reverse("get-profile"),
            {
                "profileId": "does-not-exist",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# ==================================================
# 4. DISCOVER USERS
# ==================================================

class DiscoverUsersTests(BasePostlyTestCase):

    def test_discover_users_excludes_current_user(self):
        response = self.client.post(
            reverse("discover-users"),
            {
                "input": "",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        returned_ids = [
            user["id"]
            for user in response.data["users"]
        ]

        self.assertNotIn(
            self.user1.id,
            returned_ids,
        )

    def test_discover_by_username(self):
        response = self.client.post(
            reverse("discover-users"),
            {
                "input": "usertwo",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["users"]),
            1,
        )

        self.assertEqual(
            response.data["users"][0]["id"],
            self.user2.id,
        )

    def test_discover_by_location(self):
        self.user2.location = "Faisalabad"
        self.user2.save()

        response = self.client.post(
            reverse("discover-users"),
            {
                "input": "Faisalabad",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        ids = [
            user["id"]
            for user in response.data["users"]
        ]

        self.assertIn(
            self.user2.id,
            ids,
        )


# ==================================================
# 5. FOLLOW / UNFOLLOW
# ==================================================

class FollowTests(BasePostlyTestCase):

    @patch("social.views.get_channel_layer")
    def test_follow_user(self, mock_channel_layer):
        mock_channel_layer.return_value = None

        response = self.client.post(
            reverse("toggle-follow"),
            {
                "id": self.user2.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertTrue(
            response.data["following"]
        )

        self.assertTrue(
            self.user1.following.filter(
                id=self.user2.id
            ).exists()
        )

        self.assertTrue(
            self.user2.followers.filter(
                id=self.user1.id
            ).exists()
        )

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.user2,
                actor=self.user1,
                notification_type="follow",
            ).exists()
        )

    def test_unfollow_user(self):
        self.user1.following.add(
            self.user2
        )

        self.user2.followers.add(
            self.user1
        )

        response = self.client.post(
            reverse("toggle-follow"),
            {
                "id": self.user2.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            response.data["following"]
        )

        self.assertFalse(
            self.user1.following.filter(
                id=self.user2.id
            ).exists()
        )

        self.assertFalse(
            self.user2.followers.filter(
                id=self.user1.id
            ).exists()
        )

    def test_cannot_follow_yourself(self):
        response = self.client.post(
            reverse("toggle-follow"),
            {
                "id": self.user1.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            response.data["success"]
        )

    def test_follow_nonexistent_user(self):
        response = self.client.post(
            reverse("toggle-follow"),
            {
                "id": "unknown-user",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_follow_requires_user_id(self):
        response = self.client.post(
            reverse("toggle-follow"),
            {},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


# ==================================================
# 6. USER SOCIAL DATA
# ==================================================

class UserSocialDataTests(BasePostlyTestCase):

    def test_get_social_data(self):
        post = self.create_post(
            user=self.user2,
        )

        post.likes.add(
            self.user1,
            self.user3,
        )

        self.user1.following.add(
            self.user2
        )

        self.user2.followers.add(
            self.user1
        )

        response = self.client.get(
            reverse(
                "user-social-data",
                kwargs={
                    "user_id": self.user2.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            response.data["posts_count"],
            1,
        )

        self.assertEqual(
            response.data["total_likes"],
            2,
        )

        self.assertTrue(
            response.data["is_following"]
        )

    def test_social_data_user_not_found(self):
        response = self.client.get(
            reverse(
                "user-social-data",
                kwargs={
                    "user_id": "unknown",
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# ==================================================
# 7. CREATE POST
# ==================================================

class CreatePostTests(BasePostlyTestCase):

    def test_create_text_post(self):
        response = self.client.post(
            reverse("add-post"),
            {
                "content": "Hello Postly!",
                "background_color": "#ffffff",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            response.data["success"]
        )

        post = Post.objects.get(
            id=response.data["post"]["id"]
        )

        self.assertEqual(
            post.user,
            self.user1,
        )

        self.assertEqual(
            post.content,
            "Hello Postly!",
        )

        self.assertEqual(
            post.post_type,
            "text",
        )

    def test_empty_post_rejected(self):
        response = self.client.post(
            reverse("add-post"),
            {
                "content": "",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            response.data["success"]
        )

    @patch("social.views.imagekit")
    def test_create_image_post(self, mock_imagekit):
        mock_upload = mock_imagekit.files.upload
        mock_upload.return_value.url = (
            "https://example.com/test.jpg"
        )

        image = {
            "images": [
                self._create_test_image()
            ]
        }

        response = self.client.post(
            reverse("add-post"),
            {
                "content": "",
                **image,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            response.data["success"]
        )

        post = Post.objects.get(
            id=response.data["post"]["id"]
        )

        self.assertEqual(
            post.post_type,
            "image",
        )

        self.assertEqual(
            post.image_urls,
            ["https://example.com/test.jpg"],
        )

    def _create_test_image(self):
        from django.core.files.uploadedfile import SimpleUploadedFile

        return SimpleUploadedFile(
            "test.jpg",
            (
                b"\xff\xd8\xff\xe0"
                b"\x00\x10JFIF"
                b"\x00\x01\x01\x00"
                b"\x00\x01\x00\x01\x00\x00"
                b"\xff\xd9"
            ),
            content_type="image/jpeg",
        )


# ==================================================
# 8. FEED
# ==================================================

class FeedTests(BasePostlyTestCase):

    def test_feed_contains_own_posts(self):
        post = self.create_post(
            user=self.user1,
            content="My post",
        )

        response = self.client.get(
            reverse("post-feed")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        post_ids = [
            item["id"]
            for item in response.data["posts"]
        ]

        self.assertIn(
            post.id,
            post_ids,
        )

    def test_feed_contains_following_posts(self):
        self.user1.following.add(
            self.user2
        )

        self.user2.followers.add(
            self.user1
        )

        post = self.create_post(
            user=self.user2,
            content="Following post",
        )

        response = self.client.get(
            reverse("post-feed")
        )

        post_ids = [
            item["id"]
            for item in response.data["posts"]
        ]

        self.assertIn(
            post.id,
            post_ids,
        )

    def test_feed_does_not_contain_unfollowed_user_posts(self):
        post = self.create_post(
            user=self.user2,
            content="Should not appear",
        )

        response = self.client.get(
            reverse("post-feed")
        )

        post_ids = [
            item["id"]
            for item in response.data["posts"]
        ]

        self.assertNotIn(
            post.id,
            post_ids,
        )


# ==================================================
# 9. LIKE / UNLIKE
# ==================================================

class LikeTests(BasePostlyTestCase):

    @patch("social.views.get_channel_layer")
    def test_like_post(self, mock_channel_layer):
        mock_channel_layer.return_value = None

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "toggle-like",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["liked"]
        )

        self.assertEqual(
            response.data["likes_count"],
            1,
        )

        self.assertTrue(
            post.likes.filter(
                id=self.user1.id
            ).exists()
        )

    def test_unlike_post(self):
        post = self.create_post(
            user=self.user2
        )

        post.likes.add(
            self.user1
        )

        response = self.client.post(
            reverse(
                "toggle-like",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            response.data["liked"]
        )

        self.assertEqual(
            response.data["likes_count"],
            0,
        )

    @patch("social.views.get_channel_layer")
    def test_like_creates_notification(
        self,
        mock_channel_layer,
    ):
        mock_channel_layer.return_value = None

        post = self.create_post(
            user=self.user2
        )

        self.client.post(
            reverse(
                "toggle-like",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        notification = Notification.objects.get(
            recipient=self.user2,
            actor=self.user1,
            notification_type="like",
        )

        self.assertEqual(
            notification.post,
            post,
        )

    @patch("social.views.get_channel_layer")
    def test_liking_own_post_does_not_create_notification(
        self,
        mock_channel_layer,
    ):
        mock_channel_layer.return_value = None

        post = self.create_post(
            user=self.user1
        )

        self.client.post(
            reverse(
                "toggle-like",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        self.assertFalse(
            Notification.objects.filter(
                recipient=self.user1,
                actor=self.user1,
                notification_type="like",
            ).exists()
        )

    def test_like_nonexistent_post(self):
        response = self.client.post(
            reverse(
                "toggle-like",
                kwargs={
                    "post_id": 999999,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# ==================================================
# 10. DELETE POST
# ==================================================

class DeletePostTests(BasePostlyTestCase):

    def test_delete_own_post(self):
        post = self.create_post(
            user=self.user1
        )

        response = self.client.delete(
            reverse(
                "delete-post",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertFalse(
            Post.objects.filter(
                id=post.id
            ).exists()
        )

    def test_cannot_delete_other_users_post(self):
        post = self.create_post(
            user=self.user2
        )

        response = self.client.delete(
            reverse(
                "delete-post",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertTrue(
            Post.objects.filter(
                id=post.id
            ).exists()
        )

    def test_delete_missing_post(self):
        response = self.client.delete(
            reverse(
                "delete-post",
                kwargs={
                    "post_id": 999999,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# ==================================================
# 11. POST DETAILS
# ==================================================

class PostDetailsTests(BasePostlyTestCase):

    def test_get_post_details(self):
        post = self.create_post(
            user=self.user2
        )

        post.likes.add(
            self.user1
        )

        Comment.objects.create(
            post=post,
            user=self.user1,
            content="Nice post!",
        )

        response = self.client.get(
            reverse(
                "post-details",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            response.data["post"]["id"],
            post.id,
        )

        self.assertEqual(
            response.data["likes_count"],
            1,
        )

        self.assertEqual(
            response.data["comments_count"],
            1,
        )

        self.assertEqual(
            len(response.data["comments"]),
            1,
        )

    def test_post_details_not_found(self):
        response = self.client.get(
            reverse(
                "post-details",
                kwargs={
                    "post_id": 999999,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# ==================================================
# 12. COMMENTS
# ==================================================

class CommentTests(BasePostlyTestCase):

    def test_get_comments(self):
        post = self.create_post(
            user=self.user2
        )

        Comment.objects.create(
            post=post,
            user=self.user1,
            content="First comment",
        )

        response = self.client.get(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            response.data["comments_count"],
            1,
        )

    @patch("social.views.get_channel_layer")
    def test_add_comment(
        self,
        mock_channel_layer,
    ):
        mock_channel_layer.return_value = None

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "content": "Great post!",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            response.data["comments_count"],
            1,
        )

        self.assertTrue(
            Comment.objects.filter(
                post=post,
                user=self.user1,
                content="Great post!",
            ).exists()
        )

    def test_empty_comment_rejected(self):
        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "content": "   ",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            response.data["success"]
        )

    @patch("social.views.get_channel_layer")
    def test_comment_creates_notification(
        self,
        mock_channel_layer,
    ):
        mock_channel_layer.return_value = None

        post = self.create_post(
            user=self.user2
        )

        self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "content": "Nice!",
            },
        )

        notification = Notification.objects.get(
            recipient=self.user2,
            actor=self.user1,
            notification_type="comment",
        )

        self.assertEqual(
            notification.post,
            post,
        )

    @patch("social.views.get_channel_layer")
    def test_commenting_on_own_post_does_not_notify(
        self,
        mock_channel_layer,
    ):
        mock_channel_layer.return_value = None

        post = self.create_post(
            user=self.user1
        )

        self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "content": "My own comment",
            },
        )

        self.assertFalse(
            Notification.objects.filter(
                recipient=self.user1,
                actor=self.user1,
                notification_type="comment",
            ).exists()
        )

    def test_delete_own_comment(self):
        post = self.create_post(
            user=self.user2
        )

        comment = Comment.objects.create(
            post=post,
            user=self.user1,
            content="Delete me",
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "action": "delete",
                "comment_id": comment.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            Comment.objects.filter(
                id=comment.id
            ).exists()
        )

    def test_cannot_delete_other_users_comment(self):
        post = self.create_post(
            user=self.user2
        )

        comment = Comment.objects.create(
            post=post,
            user=self.user2,
            content="Other user's comment",
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "action": "delete",
                "comment_id": comment.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertTrue(
            Comment.objects.filter(
                id=comment.id
            ).exists()
        )

    def test_delete_comment_requires_comment_id(self):
        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "action": "delete",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_delete_missing_comment(self):
        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id,
                },
            ),
            {
                "action": "delete",
                "comment_id": 999999,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# ==================================================
# 13. NOTIFICATIONS
# ==================================================

class NotificationTests(BasePostlyTestCase):

    def create_notification(
        self,
        notification_type="follow",
        post=None,
    ):
        return Notification.objects.create(
            recipient=self.user1,
            actor=self.user2,
            notification_type=notification_type,
            message="Test notification",
            post=post,
        )

    def test_get_notifications(self):
        notification = self.create_notification()

        response = self.client.get(
            reverse("get-notifications")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertEqual(
            len(response.data["notifications"]),
            1,
        )

        self.assertEqual(
            response.data["notifications"][0]["id"],
            notification.id,
        )

        self.assertEqual(
            response.data["unread_count"],
            1,
        )

    def test_unread_count(self):
        self.create_notification()

        read_notification = self.create_notification(
            notification_type="like"
        )

        read_notification.is_read = True
        read_notification.save()

        response = self.client.get(
            reverse("get-notifications")
        )

        self.assertEqual(
            response.data["unread_count"],
            1,
        )

    def test_mark_notification_read(self):
        notification = self.create_notification()

        response = self.client.patch(
            reverse(
                "mark-notification-read",
                kwargs={
                    "notification_id": notification.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        notification.refresh_from_db()

        self.assertTrue(
            notification.is_read
        )

    def test_mark_other_users_notification_as_read_fails(self):
        notification = Notification.objects.create(
            recipient=self.user2,
            actor=self.user1,
            notification_type="follow",
            message="Private notification",
        )

        response = self.client.patch(
            reverse(
                "mark-notification-read",
                kwargs={
                    "notification_id": notification.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        notification.refresh_from_db()

        self.assertFalse(
            notification.is_read
        )

    def test_delete_notification(self):
        notification = self.create_notification()

        response = self.client.delete(
            reverse(
                "delete-notification",
                kwargs={
                    "notification_id": notification.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["success"]
        )

        self.assertFalse(
            Notification.objects.filter(
                id=notification.id
            ).exists()
        )

    def test_cannot_delete_other_users_notification(self):
        notification = Notification.objects.create(
            recipient=self.user2,
            actor=self.user1,
            notification_type="follow",
            message="Private notification",
        )

        response = self.client.delete(
            reverse(
                "delete-notification",
                kwargs={
                    "notification_id": notification.id,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Notification.objects.filter(
                id=notification.id
            ).exists()
        )


# ==================================================
# 14. NOTIFICATION SECURITY
# ==================================================

class NotificationSecurityTests(BasePostlyTestCase):

    def test_user_cannot_see_another_users_notifications(self):
        Notification.objects.create(
            recipient=self.user2,
            actor=self.user3,
            notification_type="follow",
            message="Private notification",
        )

        response = self.client.get(
            reverse("get-notifications")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["notifications"],
            [],
        )

        self.assertEqual(
            response.data["unread_count"],
            0,
        )


# ==================================================
# 15. AUTHENTICATION / PERMISSION
# ==================================================

class AuthenticationTests(APITestCase):

    def test_current_user_requires_authentication(self):
        response = self.client.get(
            reverse("get-user-data")
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )

    def test_feed_requires_authentication(self):
        response = self.client.get(
            reverse("post-feed")
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )

    def test_notifications_require_authentication(self):
        response = self.client.get(
            reverse("get-notifications")
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )

