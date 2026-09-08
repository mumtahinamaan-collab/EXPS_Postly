
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MessageCircle,
  Trash2,
  Share2,
  
} from "lucide-react";
import moment from "moment";
import { useAuth, useUser } from "@clerk/react";
import toast from "react-hot-toast";

import api from "../api/axios";
import Comments from "../components/Comments";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [post, setPost] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [deletingPost, setDeletingPost] = useState(false);

  // ==================================================
  // FETCH POST
  // ==================================================

  const fetchPost = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await api.get(
        `/posts/${postId}/detail/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setPost(data.post);

        setLikesCount(
          data.likes_count ??
            data.post?.likes_count ??
            0
        );

        setIsLiked(
          data.post?.is_liked || false
        );

        setCommentsCount(
          data.comments_count ??
            data.post?.comments_count ??
            0
        );

        setComments(data.comments || []);
      } else {
        toast.error(
          data.message || "Unable to load post"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load post"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // ==================================================
  // LIKE / UNLIKE
  // ==================================================

  const handleLike = async () => {
    try {
      const token = await getToken();

      const { data } = await api.post(
        `/posts/${postId}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setIsLiked(data.liked);
        setLikesCount(data.likes_count);
      } else {
        toast.error(
          data.message || "Unable to like post"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to like post"
      );
    }
  };

  // ==================================================
  // SHARE
  // ==================================================

  const handleShare = async () => {
    try {
      const postUrl =
        `${window.location.origin}/post/${postId}`;

      if (navigator.share) {
        await navigator.share({
          title: "Postly",
          text:
            post.content ||
            "Check out this post",
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          postUrl
        );

        toast.success(
          "Post link copied!"
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error(
          "Unable to share post"
        );
      }
    }
  };

  // ==================================================
  // DELETE POST
  // ==================================================

  const handleDeletePost = async () => {
    try {
      setDeletingPost(true);

      const token = await getToken();

      const { data } = await api.delete(
        `/posts/${postId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(
          "Post deleted successfully."
        );

        navigate("/");
      } else {
        toast.error(
          data.message ||
            "Unable to delete post"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete post"
      );
    } finally {
      setDeletingPost(false);
    }
  };

  // ==================================================
  // POST OWNER
  // ==================================================

  const isMyPost =
    clerkUser?.primaryEmailAddress?.emailAddress &&
    post?.user?.email &&
    clerkUser.primaryEmailAddress.emailAddress
      .toLowerCase() ===
      post.user.email.toLowerCase();

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm">
          Loading post...
        </div>
      </div>
    );
  }

  // ==================================================
  // NOT FOUND
  // ==================================================

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">
          Post not found.
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            px-4
            py-2
            rounded-lg
            bg-[#1877F2]
            text-white
            text-sm
            cursor-pointer
          "
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            flex
            items-center
            gap-2
            mb-5
            text-slate-600
            hover:text-slate-900
            transition
            cursor-pointer
          "
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">
            Back
          </span>
        </button>

        {/* ==================================================
            POST CARD
        ================================================== */}

        <div
          className="
            w-full
            rounded-2xl
            border
            border-[#f3dce8]
            shadow-sm
            p-4
            space-y-4
          "
          style={{
            backgroundColor:
              post.background_color ||
              "#ffffff",
          }}
        >

          {/* ==================================================
              USER INFO
          ================================================== */}

          <div className="flex items-center justify-between">

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <img
                src={
                  post.user
                    ?.profile_picture
                }
                alt={
                  post.user?.username || ""
                }
                className="
                  w-11
                  h-11
                  rounded-full
                  object-cover
                  border-2
                  border-white
                "
              />

              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-900">
                    {post.user?.full_name}
                  </span>

                  <BadgeCheck className="w-4 h-4 text-[#1877F2]" />
                </div>

                <div className="text-sm text-slate-500">
                  @{post.user?.username} •{" "}
                  {moment(
                    post.created_at
                  ).fromNow()}
                </div>
              </div>
            </div>

            {isMyPost && (
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="
                  flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  rounded-lg
                  text-sm
                  text-red-500
                  hover:bg-red-50
                  transition
                  cursor-pointer
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <Trash2 className="w-4 h-4" />

                {deletingPost
                  ? "Deleting..."
                  : "Delete"}
              </button>
            )}
          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          {post.content && (
            <div
              className="
                text-slate-800
                text-sm
                whitespace-pre-line
                leading-6
                px-1
              "
            >
              {post.content}
            </div>
          )}

          {/* ==================================================
              IMAGES
          ================================================== */}

          {post.image_urls?.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.image_urls.map(
                (img, index) => (
                  <img
                    key={`${post.id}-${index}`}
                    src={img}
                    alt=""
                    className={`
                      w-full
                      h-56
                      object-cover
                      rounded-xl
                      ${
                        post.image_urls.length ===
                        1
                          ? "col-span-2 h-auto"
                          : ""
                      }
                    `}
                  />
                )
              )}
            </div>
          )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-6
              text-slate-600
              text-sm
              pt-3
              border-t
              border-black/10
            "
          >
            <button
              type="button"
              onClick={handleLike}
              className="
                flex
                items-center
                gap-1.5
                cursor-pointer
                bg-transparent
                border-0
              "
            >
              <Heart
                className={`
                  w-5
                  h-5
                  transition
                  ${
                    isLiked
                      ? "text-[#FF2D55] fill-[#FF2D55]"
                      : "text-slate-500 hover:text-[#FF2D55]"
                  }
                `}
              />

              <span>
                {likesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setShowComments(
                  (prev) => !prev
                )
              }
              className="
                flex
                items-center
                gap-1.5
                hover:text-[#C900A8]
                transition
                cursor-pointer
                bg-transparent
                border-0
              "
            >
              <MessageCircle className="w-5 h-5" />

              <span>
                {commentsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="
                flex
                items-center
                gap-1.5
                hover:text-[#F58529]
                transition
                cursor-pointer
                bg-transparent
                border-0
              "
            >
              <Share2 className="w-5 h-5" />

              <span>
                Share
              </span>
            </button>
          </div>

          {/* ==================================================
              COMMENTS
          ================================================== */}

          {showComments && (
            <Comments
              postId={post.id}
              comments={comments}
              setComments={setComments}
              commentsCount={commentsCount}
              setCommentsCount={
                setCommentsCount
              }
              onClose={() =>
                setShowComments(false)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
