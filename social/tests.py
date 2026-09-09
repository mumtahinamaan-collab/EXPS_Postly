from io import BytesIO
from unittest.mock import patch

from PIL import Image
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User, Post, Comment, Notification


class SocialAPITestCase(APITestCase):

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

        self.client.force_authenticate(user=self.user1)

    # =========================================================
    # HELPERS
    # =========================================================

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

    def create_image(self):

        image = Image.new(
            "RGB",
            (100, 100),
            color="white",
        )

        image_file = BytesIO()
        image.save(image_file, format="JPEG")
        image_file.seek(0)

        image_file.name = "test.jpg"

        return image_file

    # =========================================================
    # USER DATA
    # =========================================================

    def test_get_user_data(self):

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
            self.user1.username,
        )

        # Public user serializer should not expose email
        self.assertNotIn(
            "email",
            response.data["user"],
        )

    # =========================================================
    # UPDATE USER
    # =========================================================

    def test_update_user_data(self):

        response = self.client.post(
            reverse("update-user-data"),
            {
                "username": "newusername",
                "full_name": "Updated Name",
                "bio": "Updated bio",
                "location": "Lahore",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user1.refresh_from_db()

        self.assertEqual(
            self.user1.username,
            "newusername",
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

    def test_update_user_duplicate_username(self):

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

        self.assertEqual(
            response.data["message"],
            "Username already exists.",
        )

    def test_update_user_empty_username_keeps_old_username(self):

        old_username = self.user1.username

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
            old_username,
        )

    # =========================================================
    # PROFILE
    # =========================================================

    def test_get_profile(self):

        post = self.create_post(
            user=self.user2
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

    def test_get_profile_without_profile_id(self):

        response = self.client.post(
            reverse("get-profile"),
            {},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_get_unknown_profile(self):

        response = self.client.post(
            reverse("get-profile"),
            {
                "profileId": "unknown_user",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =========================================================
    # DISCOVER USERS
    # =========================================================

    def test_discover_users(self):

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

        self.assertIn(
            self.user2.id,
            returned_ids,
        )

        self.assertIn(
            self.user3.id,
            returned_ids,
        )

    def test_discover_users_by_username(self):

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

        returned_ids = [
            user["id"]
            for user in response.data["users"]
        ]

        self.assertIn(
            self.user2.id,
            returned_ids,
        )

        self.assertNotIn(
            self.user1.id,
            returned_ids,
        )

    def test_discover_users_by_location(self):

        self.user2.location = "Lahore"
        self.user2.save()

        response = self.client.post(
            reverse("discover-users"),
            {
                "input": "Lahore",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_ids = [
            user["id"]
            for user in response.data["users"]
        ]

        self.assertIn(
            self.user2.id,
            returned_ids,
        )

    # =========================================================
    # FOLLOW / UNFOLLOW
    # =========================================================

    def test_follow_user(self):

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

    def test_cannot_follow_self(self):

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

    def test_follow_unknown_user(self):

        response = self.client.post(
            reverse("toggle-follow"),
            {
                "id": "unknown_user",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_follow_without_user_id(self):

        response = self.client.post(
            reverse("toggle-follow"),
            {},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =========================================================
    # USER SOCIAL DATA
    # =========================================================

    def test_user_social_data(self):

        post1 = self.create_post(
            user=self.user2,
            content="User two post",
        )

        post2 = self.create_post(
            user=self.user2,
            content="Another post",
        )

        post1.likes.add(
            self.user1,
            self.user3,
        )

        self.user1.following.add(
            self.user2
        )

        response = self.client.get(
            reverse(
                "user-social-data",
                kwargs={
                    "user_id": self.user2.id
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
            2,
        )

        self.assertEqual(
            response.data["total_likes"],
            2,
        )

        self.assertTrue(
            response.data["is_following"]
        )

    def test_user_social_data_unknown_user(self):

        response = self.client.get(
            reverse(
                "user-social-data",
                kwargs={
                    "user_id": "unknown_user"
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =========================================================
    # CREATE TEXT POST
    # =========================================================

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
            user=self.user1,
            content="Hello Postly!",
        )

        self.assertEqual(
            post.post_type,
            "text",
        )

    def test_create_empty_post(self):

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

    # =========================================================
    # CREATE IMAGE POST
    # =========================================================

    @patch("social.views.post_views.imagekit")
    def test_create_image_post(self, mock_imagekit):

        mock_upload = mock_imagekit.files.upload
        mock_upload.return_value.url = (
            "https://example.com/test.jpg"
        )

        image = self.create_image()

        response = self.client.post(
            reverse("add-post"),
            {
                "content": "",
                "images": [image],
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

        post = Post.objects.filter(
            user=self.user1
        ).latest("id")

        self.assertEqual(
            post.post_type,
            "image",
        )

        self.assertEqual(
            post.image_urls,
            [
                "https://example.com/test.jpg"
            ],
        )

    # =========================================================
    # FEED
    # =========================================================

    def test_feed_contains_own_post(self):

        post = self.create_post(
            user=self.user1
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

    def test_feed_contains_followed_user_post(self):

        self.user1.following.add(
            self.user2
        )

        post = self.create_post(
            user=self.user2
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

    def test_feed_excludes_unfollowed_user_post(self):

        post = self.create_post(
            user=self.user2
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

        self.assertNotIn(
            post.id,
            post_ids,
        )

    # =========================================================
    # LIKE / UNLIKE
    # =========================================================

    def test_like_post(self):

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "toggle-like",
                kwargs={
                    "post_id": post.id
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

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.user2,
                actor=self.user1,
                notification_type="like",
                post=post,
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
                    "post_id": post.id
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

        self.assertFalse(
            post.likes.filter(
                id=self.user1.id
            ).exists()
        )

    def test_like_own_post_does_not_create_notification(self):

        post = self.create_post(
            user=self.user1
        )

        response = self.client.post(
            reverse(
                "toggle-like",
                kwargs={
                    "post_id": post.id
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            Notification.objects.filter(
                recipient=self.user1,
                actor=self.user1,
                notification_type="like",
                post=post,
            ).exists()
        )

    # =========================================================
    # DELETE POST
    # =========================================================

    def test_delete_own_post(self):

        post = self.create_post(
            user=self.user1
        )

        response = self.client.delete(
            reverse(
                "delete-post",
                kwargs={
                    "post_id": post.id
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
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
                    "post_id": post.id
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

    def test_delete_unknown_post(self):

        response = self.client.delete(
            reverse(
                "delete-post",
                kwargs={
                    "post_id": 999999
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =========================================================
    # POST DETAILS
    # =========================================================

    def test_post_details(self):

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
                    "post_id": post.id
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

    # =========================================================
    # COMMENTS
    # =========================================================

    def test_get_comments(self):

        post = self.create_post(
            user=self.user2
        )

        Comment.objects.create(
            post=post,
            user=self.user1,
            content="First comment",
        )

        Comment.objects.create(
            post=post,
            user=self.user3,
            content="Second comment",
        )

        response = self.client.get(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
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
            2,
        )

        self.assertEqual(
            len(response.data["comments"]),
            2,
        )

    def test_add_comment(self):

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
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

        self.assertTrue(
            Comment.objects.filter(
                post=post,
                user=self.user1,
                content="Great post!",
            ).exists()
        )

        self.assertEqual(
            response.data["comments_count"],
            1,
        )

    def test_empty_comment(self):

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
                },
            ),
            {
                "content": "",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_comment_creates_notification(self):

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
                },
            ),
            {
                "content": "Nice!",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.user2,
                actor=self.user1,
                notification_type="comment",
                post=post,
            ).exists()
        )

    def test_comment_on_own_post_does_not_notify(self):

        post = self.create_post(
            user=self.user1
        )

        self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
                },
            ),
            {
                "content": "My comment",
            },
        )

        self.assertFalse(
            Notification.objects.filter(
                recipient=self.user1,
                actor=self.user1,
                notification_type="comment",
                post=post,
            ).exists()
        )

    # =========================================================
    # DELETE COMMENT
    # =========================================================

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
                    "post_id": post.id
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
            content="Not mine",
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
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

    def test_delete_comment_without_comment_id(self):

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
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

    def test_delete_unknown_comment(self):

        post = self.create_post(
            user=self.user2
        )

        response = self.client.post(
            reverse(
                "post-comments",
                kwargs={
                    "post_id": post.id
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

    # =========================================================
    # NOTIFICATIONS
    # =========================================================

    def test_get_notifications(self):

        Notification.objects.create(
            recipient=self.user1,
            actor=self.user2,
            notification_type="follow",
            is_read=False,
        )

        Notification.objects.create(
            recipient=self.user1,
            actor=self.user3,
            notification_type="like",
            is_read=True,
        )

        response = self.client.get(
            reverse("get-notifications")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "notifications",
            response.data,
        )

        self.assertIn(
            "unread_count",
            response.data,
        )

        self.assertEqual(
            response.data["unread_count"],
            1,
        )

        self.assertEqual(
            len(response.data["notifications"]),
            2,
        )

    def test_user_cannot_see_other_users_notifications(self):

        Notification.objects.create(
            recipient=self.user2,
            actor=self.user3,
            notification_type="follow",
            is_read=False,
        )

        response = self.client.get(
            reverse("get-notifications")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["unread_count"],
            0,
        )

        self.assertEqual(
            len(response.data["notifications"]),
            0,
        )

    def test_mark_notification_read(self):

        notification = Notification.objects.create(
            recipient=self.user1,
            actor=self.user2,
            notification_type="follow",
            is_read=False,
        )

        response = self.client.patch(
            reverse(
                "mark-notification-read",
                kwargs={
                    "notification_id": notification.id
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        notification.refresh_from_db()

        self.assertTrue(
            notification.is_read
        )

    def test_cannot_mark_other_users_notification_read(self):

        notification = Notification.objects.create(
            recipient=self.user2,
            actor=self.user3,
            notification_type="follow",
            is_read=False,
        )

        response = self.client.patch(
            reverse(
                "mark-notification-read",
                kwargs={
                    "notification_id": notification.id
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

        notification = Notification.objects.create(
            recipient=self.user1,
            actor=self.user2,
            notification_type="follow",
        )

        response = self.client.delete(
            reverse(
                "delete-notification",
                kwargs={
                    "notification_id": notification.id
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            Notification.objects.filter(
                id=notification.id
            ).exists()
        )

    def test_cannot_delete_other_users_notification(self):

        notification = Notification.objects.create(
            recipient=self.user2,
            actor=self.user3,
            notification_type="follow",
        )

        response = self.client.delete(
            reverse(
                "delete-notification",
                kwargs={
                    "notification_id": notification.id
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

    # =========================================================
    # AUTHENTICATION
    # =========================================================

    def test_get_user_data_requires_authentication(self):

        self.client.force_authenticate(
            user=None
        )

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

        self.client.force_authenticate(
            user=None
        )

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

        self.client.force_authenticate(
            user=None
        )

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

    # =========================================================
    # PUBLIC API MUST NOT EXPOSE EMAIL
    # =========================================================

    def test_public_user_data_does_not_expose_email(self):

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

        for user in response.data["users"]:
            self.assertNotIn(
                "email",
                user,
            )

    def test_post_user_data_does_not_expose_email(self):

        post = self.create_post(
            user=self.user2
        )

        response = self.client.get(
            reverse("post-feed")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        for item in response.data["posts"]:

            if item["id"] == post.id:

                self.assertNotIn(
                    "email",
                    item["user"],
                )

    def test_profile_data_does_not_expose_email(self):

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

        self.assertNotIn(
            "email",
            response.data["profile"],
        )