
import React, { useState } from "react";
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { useAuth, useUser } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [likesCount, setLikesCount] = useState(
    post.likes_count || 0
  );

  const [isLiked, setIsLiked] = useState(
    post.is_liked || false
  );

  const [commentsCount, setCommentsCount] = useState(
    post.comments_count || 0
  );

  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  const postWithHashtags = (post.content || "").replace(
    /(#\w+)/g,
    '<span class="text-[#1877F2]">$1</span>'
  );

  // ==================================================
  // LIKE / UNLIKE
  // ==================================================

  const handleLike = async () => {
    try {
      const token = await getToken();

      const { data } = await api.post(
        `/posts/${post.id}/like/`,
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
// SHARE POST
// ==================================================

const handleShare = async () => {
  try {
    const postUrl = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      await navigator.share({
        title: "Postly",
        text: post.content || "Check out this post",
        url: postUrl,
      });
    } else {
      await navigator.clipboard.writeText(postUrl);

      toast.success("Post link copied!");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      toast.error("Unable to share post");
    }
  }
};

  // ==================================================
  // GET COMMENTS
  // ==================================================

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);

      const token = await getToken();

      const { data } = await api.get(
        `/posts/${post.id}/comments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setComments(data.comments || []);
      } else {
        toast.error(
          data.message || "Unable to load comments"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load comments"
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  // ==================================================
  // OPEN / CLOSE COMMENTS
  // ==================================================

  const handleComments = async () => {
    const nextState = !showComments;

    setShowComments(nextState);

    if (nextState) {
      await fetchComments();
    }
  };

  // ==================================================
  // ADD COMMENT
  // ==================================================

  const handleAddComment = async (e) => {
    e.preventDefault();

    const text = commentText.trim();

    if (!text) {
      return;
    }

    try {
      setCommentSubmitting(true);

      const token = await getToken();

      const { data } = await api.post(
        `/posts/${post.id}/comments/`,
        {
          content: text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setCommentText("");

        setComments((prev) => [
          ...prev,
          data.comment,
        ]);

        setCommentsCount(
          data.comments_count ??
            commentsCount + 1
        );
      } else {
        toast.error(
          data.message || "Unable to add comment"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to add comment"
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // ==================================================
  // DELETE COMMENT
  // ==================================================

  const handleDeleteComment = async (commentId) => {
    try {
      const token = await getToken();

      const { data } = await api.delete(
        `/posts/${post.id}/comments/${commentId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setComments((prev) =>
          prev.filter(
            (comment) =>
              comment.id !== commentId
          )
        );

        setCommentsCount(
          data.comments_count ??
            Math.max(commentsCount - 1, 0)
        );
      } else {
        toast.error(
          data.message || "Unable to delete comment"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete comment"
      );
    }
  };

  // ==================================================
  // CHECK COMMENT OWNER
  // ==================================================

  const isMyComment = (comment) => {
    if (!clerkUser || !comment?.user) {
      return false;
    }

    return (
      comment.user.id === clerkUser.id ||
      comment.user.clerk_id === clerkUser.id
    );
  };

  return (
    <div
      className="
        w-full
        bg-white
        rounded-2xl
        border border-[#f3dce8]
        shadow-sm
        p-4
        space-y-4
        hover:shadow-md
        hover:border-[#eac7d8]
        transition-all
        duration-300
      "
    >
      {/* ==================================================
          USER INFO
      ================================================== */}

      <div className="inline-flex items-center gap-3 cursor-pointer">
        <div className="rounded-full">
          <img
            src={
              post.user?.profile_picture ||
              "/logo.png"
            }
            alt={post.user?.username || ""}
            className="
              w-10
              h-10
              rounded-full
              object-cover
              border-2
              border-white
            "
          />
        </div>

        <div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-slate-900">
              {post.user?.full_name}
            </span>

            <BadgeCheck className="w-4 h-4 text-[#1877F2]" />
          </div>

          <div className="text-sm text-slate-400">
            @{post.user?.username} •{" "}
            {moment(post.created_at).fromNow()}
          </div>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      {post.content && (
        <div
          className="
            text-slate-700
            text-sm
            whitespace-pre-line
            leading-6
          "
          dangerouslySetInnerHTML={{
            __html: postWithHashtags,
          }}
        />
      )}

      {/* ==================================================
          IMAGES
      ================================================== */}

      {post.image_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls.map((img, index) => (
            <img
              key={`${post.id}-${index}`}
              src={img}
              alt=""
              className={`
                w-full
                h-48
                object-cover
                rounded-xl
                ${
                  post.image_urls.length === 1
                    ? "col-span-2 h-auto"
                    : ""
                }
              `}
            />
          ))}
        </div>
      )}

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-5
          text-slate-500
          text-sm
          pt-3
          border-t
          border-[#f3dce8]
        "
      >
        {/* LIKE */}

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
              w-4
              h-4
              transition
              hover:scale-110
              ${
                isLiked
                  ? "text-[#FF2D55] fill-[#FF2D55]"
                  : "text-slate-500 hover:text-[#FF2D55]"
              }
            `}
          />

          <span>{likesCount}</span>
        </button>

        {/* COMMENTS */}

        <button
          type="button"
          onClick={handleComments}
          className={`
            flex
            items-center
            gap-1.5
            transition
            cursor-pointer
            bg-transparent
            border-0
            ${
              showComments
                ? "text-[#C900A8]"
                : "hover:text-[#C900A8]"
            }
          `}
        >
          <MessageCircle className="w-4 h-4" />

          <span>{commentsCount}</span>
        </button>

        {/* SHARE */}

        <button
          type="button"
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
          <Share2 className="w-4 h-4" />

          <span>0</span>
        </button>
      </div>

      {/* ==================================================
          COMMENTS SECTION
      ================================================== */}

      {showComments && (
        <div
          className="
            border-t
            border-[#f3dce8]
            pt-4
            space-y-4
          "
        >
          {/* ADD COMMENT */}

          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2"
          >
            <img
              src={
                clerkUser?.imageUrl ||
                "/logo.png"
              }
              alt="Profile"
              className="
                w-9
                h-9
                rounded-full
                object-cover
                shrink-0
              "
            />

            <input
              type="text"
              value={commentText}
              onChange={(e) =>
                setCommentText(e.target.value)
              }
              placeholder="Write a comment..."
              className="
                flex-1
                min-w-0
                px-4
                py-2.5
                text-sm
                rounded-full
                border
                border-gray-200
                outline-none
                focus:border-[#C900A8]
                focus:ring-1
                focus:ring-[#C900A8]/20
              "
            />

            <button
              type="submit"
              disabled={
                commentSubmitting ||
                !commentText.trim()
              }
              className="
                px-4
                py-2.5
                rounded-full
                bg-[#C900A8]
                text-white
                text-sm
                font-medium
                hover:bg-[#a8008c]
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              {commentSubmitting
                ? "..."
                : "Post"}
            </button>
          </form>

          {/* COMMENTS LIST */}

          {commentsLoading ? (
            <div className="py-5 text-center">
              <p className="text-sm text-gray-400">
                Loading comments...
              </p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="
                    flex
                    items-start
                    gap-3
                    bg-[#faf7f9]
                    rounded-xl
                    p-3
                  "
                >
                  {/* USER IMAGE */}

                  <img
                    src={
                      comment.user?.profile_picture ||
                      "/logo.png"
                    }
                    alt={
                      comment.user?.username || ""
                    }
                    className="
                      w-9
                      h-9
                      rounded-full
                      object-cover
                      shrink-0
                    "
                  />

                  {/* COMMENT */}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-slate-900">
                        {comment.user?.full_name}
                      </span>

                      <BadgeCheck className="w-3.5 h-3.5 text-[#1877F2]" />
                    </div>

                    <p className="text-xs text-slate-400">
                      @{comment.user?.username} •{" "}
                      {moment(
                        comment.created_at
                      ).fromNow()}
                    </p>

                    <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-line break-words">
                      {comment.content}
                    </p>
                  </div>

                  {/* DELETE */}

                  {isMyComment(comment) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteComment(
                          comment.id
                        )
                      }
                      className="
                        p-1.5
                        text-gray-400
                        hover:text-red-500
                        transition
                        cursor-pointer
                      "
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center">
              <MessageCircle className="w-8 h-8 mx-auto text-gray-300" />

              <p className="mt-2 text-sm text-gray-400">
                No comments yet
              </p>

              <p className="text-xs text-gray-300">
                Be the first to comment
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;

