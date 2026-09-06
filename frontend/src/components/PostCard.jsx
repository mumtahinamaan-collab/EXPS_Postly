
import React, { useState } from "react";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import { useAuth } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  const { getToken } = useAuth();

  const [likesCount, setLikesCount] = useState(
    post.likes_count || 0
  );

  const [isLiked, setIsLiked] = useState(
    post.is_liked || false
  );

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
        toast.error(data.message || "Unable to like post");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to like post"
      );
    }
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
          <MessageCircle className="w-4 h-4" />

          <span>
            {post.comments_count || 0}
          </span>
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
    </div>
  );
};

export default PostCard;

