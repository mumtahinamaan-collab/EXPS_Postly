import React from "react";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import { dummyUserData } from "../assets/dummyData";
import { useState } from "react";

const PostCard = ({ post }) => {
  const postWithHashtags = post.content.replace(
    /(#\w+)/g,
    '<span class="text-[#1877F2]">$1</span>',
  );

  const [likes, setLikes] = useState(post.likes_count);
  const currentUser = dummyUserData;

  const handleLike = async () => {};

  return (
    <div
      className="
        bg-white
        rounded-2xl
        border border-[#f3dce8]
        shadow-sm
        p-4
        space-y-4
        w-full
        max-w-2xl
        hover:shadow-md
        hover:border-[#eac7d8]
        transition-all
        duration-300
      "
    >
      {/* User Info */}
      <div className="inline-flex items-center gap-3 cursor-pointer">
        <div
          className="
       
            rounded-full
        
          "
        >
          <img
            src={post.user.profile_picture}
            alt=""
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
        </div>

        <div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-slate-900">
              {post.user.full_name}
            </span>

            <BadgeCheck className="w-4 h-4 text-[#1877F2]" />
          </div>

          <div className="text-sm text-slate-400">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-slate-700 text-sm whitespace-pre-line leading-6"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Images */}
      {post.image_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls.map((img, index) => (
            <img
              src={img}
              key={index}
              className={`
                w-full
                h-48
                object-cover
                rounded-xl
                ${post.image_urls.length === 1 ? "col-span-2 h-auto" : ""}
              `}
              alt=""
            />
          ))}
        </div>
      )}

      {/* Actions */}
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
        {/* Like */}
        <div className="flex items-center gap-1.5">
          <Heart
            className={`
              w-4 h-4
              cursor-pointer
              transition
              hover:scale-110
              ${
                likes.includes(currentUser._id)
                  ? "text-[#FF2D55] fill-[#FF2D55]"
                  : "hover:text-[#FF2D55]"
              }
            `}
            onClick={handleLike}
          />

          <span>{likes.length}</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-1.5 hover:text-[#C900A8] transition">
          <MessageCircle className="w-4 h-4 cursor-pointer" />
          <span>{12}</span>
        </div>

        {/* Share */}
        <div className="flex items-center gap-1.5 hover:text-[#F58529] transition">
          <Share2 className="w-4 h-4 cursor-pointer" />
          <span>{7}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;