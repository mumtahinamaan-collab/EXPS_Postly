import React, { useState } from "react";
import {
  BadgeCheck,
  MessageCircle,
  Trash2,
  X,
} from "lucide-react";
import moment from "moment";
import { useAuth, useUser } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Comments = ({
  postId,
  comments,
  setComments,
  commentsCount,
  setCommentsCount,
  onCommentsCountChange,
  onClose,
}) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState("");

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  const updateCount = (count) => {
    setCommentsCount(count);

    if (onCommentsCountChange) {
      onCommentsCountChange(count);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);

      const token = await getToken();

      const { data } = await api.get(
        `/posts/${postId}/comments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        const newComments = data.comments || [];

        const newCount =
          data.comments_count ?? newComments.length ?? 0;

        setComments(newComments);
        updateCount(newCount);
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
        `/posts/${postId}/comments/`,
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

        const newCount =
          data.comments_count ??
          commentsCount + 1;

        updateCount(newCount);
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

  const handleDeleteComment = async (commentId) => {
    try {
      const token = await getToken();

      const { data } = await api.post(
        `/posts/${postId}/comments/`,
        {
          action: "delete",
          comment_id: commentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setComments((prev) =>
          prev.filter(
            (comment) => comment.id !== commentId
          )
        );

        const newCount =
          data.comments_count ??
          Math.max(commentsCount - 1, 0);

        updateCount(newCount);
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

  // Check whether this comment belongs to current user
  const isMyComment = (comment) => {
    if (!comment?.user?.id || !user?.id) {
      return false;
    }

    return comment.user.id === user.id;
  };

  const openProfile = (userId) => {
    if (!userId) {
      return;
    }

    navigate(`/profile/${userId}`);
  };

  return (
    <div
      className="
        border-t
        border-[#f3dce8]
        pt-4
        space-y-4
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#C900A8]" />

          <span className="text-sm font-semibold text-slate-800">
            Comments
          </span>

          <span className="text-xs text-slate-400">
            ({commentsCount})
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            p-1.5
            rounded-full
            text-slate-400
            hover:text-slate-700
            hover:bg-gray-100
            transition
            cursor-pointer
          "
          title="Close comments"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Add Comment */}
      <form
        onSubmit={handleAddComment}
        className="flex items-center gap-2"
      >
        <img
          src={user?.imageUrl || "/image.png"}
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
          {commentSubmitting ? "..." : "Post"}
        </button>
      </form>

      {/* Comments List */}
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
              {/* Comment Profile Picture */}
              <img
                src={
                  comment.user?.profile_picture ||
                  "/image.png"
                }
                alt={
                  comment.user?.username || ""
                }
                onClick={() =>
                  openProfile(comment.user?.id)
                }
                className="
                  w-9
                  h-9
                  rounded-full
                  object-cover
                  shrink-0
                  cursor-pointer
                "
              />

              {/* Comment Content */}
              <div
                onClick={() =>
                  openProfile(comment.user?.id)
                }
                className="
                  flex-1
                  min-w-0
                  cursor-pointer
                "
              >
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

                <p
                  className="
                    mt-1.5
                    text-sm
                    text-slate-700
                    whitespace-pre-line
                    break-words
                  "
                >
                  {comment.content}
                </p>
              </div>

              {/* Delete Only Own Comment */}
              {isMyComment(comment) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteComment(
                      comment.id
                    );
                  }}
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
  );
};

export default Comments;