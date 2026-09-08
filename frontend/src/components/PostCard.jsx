import React, { useState, useEffect } from "react";
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import moment from "moment";
import { useAuth, useUser } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Comments from "./Comments";
import { useNavigate } from "react-router-dom";

const PostCard = ({ post, onPostUpdated,highlightPostId  }) => {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const [isLiked, setIsLiked] = useState(post.is_liked || false);

  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const navigate = useNavigate();

  useEffect(() => {
    setLikesCount(post.likes_count || 0);
    setIsLiked(post.is_liked || false);
    setCommentsCount(post.comments_count || 0);
  }, [post.id, post.likes_count, post.is_liked, post.comments_count]);

  useEffect(() => {
  if (
    highlightPostId &&
    String(post.id) === String(highlightPostId)
  ) {
    const timer = setTimeout(() => {
      const postElement = document.getElementById(
        `post-${post.id}`,
      );

      if (postElement) {
        postElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }
}, [highlightPostId, post.id]);

  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState([]);

  const [showPostMenu, setShowPostMenu] = useState(false);

  const [deletingPost, setDeletingPost] = useState(false);

  // ==================================================
  // POST OWNER
  // ==================================================

  const isMyPost =
    clerkUser?.primaryEmailAddress?.emailAddress &&
    post.user?.email &&
    clerkUser.primaryEmailAddress.emailAddress.toLowerCase() ===
      post.user.email.toLowerCase();

  // ==================================================
  // HASHTAGS
  // ==================================================

  const postWithHashtags = (post.content || "").replace(
    /(#\w+)/g,
    '<span class="text-[#1877F2]">$1</span>',
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
        },
      );

      if (data.success) {
        setIsLiked(data.liked);
        setLikesCount(data.likes_count);

        onPostUpdated?.({
          ...post,
          is_liked: data.liked,
          likes_count: data.likes_count,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to like post");
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
      const token = await getToken();

      const { data } = await api.get(`/posts/${post.id}/comments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setComments(data.comments || []);

        const newCommentsCount =
          data.comments_count ?? data.comments?.length ?? 0;

        setCommentsCount(newCommentsCount);

        onPostUpdated?.({
          ...post,
          comments_count: newCommentsCount,
        });
      } else {
        toast.error(data.message || "Unable to load comments");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load comments");
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
  // DELETE POST
  // ==================================================

  const handleDeletePost = async () => {
    try {
      setDeletingPost(true);

      const token = await getToken();

      const { data } = await api.delete(`/posts/${post.id}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success("Post deleted successfully.");

        window.location.reload();
      } else {
        toast.error(data.message || "Unable to delete post");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete post");
    } finally {
      setDeletingPost(false);
      setShowPostMenu(false);
    }
  };

  return (
    <div
    id={`post-${post.id}`}
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
          USER INFO + POST MENU
      ================================================== */}

      <div className="flex items-center justify-between ">
        {/* USER */}

        <div onClick={() => navigate(`/profile/${post.user?.id}`)}
         className="inline-flex items-center gap-3 cursor-pointer">
          <div className="rounded-full">
            <img
              src={post.user?.profile_picture }
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
              @{post.user?.username} • {moment(post.created_at).fromNow()}
            </div>
          </div>
        </div>

        {/* ==================================================
            THREE DOT POST MENU
        ================================================== */}

        {isMyPost && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPostMenu((prev) => !prev)}
              className="
                p-2
                rounded-full
                text-slate-400
                hover:text-slate-700
                hover:bg-gray-100
                transition
                cursor-pointer
              "
              title="Post options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showPostMenu && (
              <div
                className="
                  absolute
                  right-0
                  top-10
                  z-30
                  w-36
                  bg-white
                  rounded-xl
                  border
                  border-gray-100
                  shadow-lg
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={handleDeletePost}
                  disabled={deletingPost}
                  className="
                    w-full
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

                  <span>{deletingPost ? "Deleting..." : "Delete post"}</span>
                </button>
              </div>
            )}
          </div>
        )}
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
            rounded-lg
            p-6
            px-4
          "
          style={{
            backgroundColor: post.background_color,
          }}
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
                  ${post.image_urls.length === 1 ? "col-span-2 h-auto" : ""}
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
            ${showComments ? "text-[#C900A8]" : "hover:text-[#C900A8]"}
          `}
        >
          <MessageCircle className="w-4 h-4" />

          <span>{commentsCount}</span>
        </button>

        {/* SHARE */}

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
          <Share2 className="w-4 h-4" />

          <span>0</span>
        </button>
      </div>

      {/* ==================================================
          COMMENTS COMPONENT
      ================================================== */}

      {showComments && (
        <Comments
          postId={post.id}
          comments={comments}
          setComments={setComments}
          commentsCount={commentsCount}
          setCommentsCount={setCommentsCount}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
};

export default PostCard;
