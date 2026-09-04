
import React, { useState } from "react";
import {
  UserPlus,
  UserCheck,
  MapPin,
} from "lucide-react";

import { dummyUserData } from "../assets/dummyData";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const UserCard = ({ user }) => {
  const currentUser = useSelector((state) => state.user.value);

  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following?.includes(user?._id) || false
  );

  const handleFollow = (e) => {
    e.stopPropagation();
    setIsFollowing((prev) => !prev);
  };

  return (
    <div
      onClick={() => navigate(`/profile/${user._id}`)}
      className="
        group
        w-full
        cursor-pointer
        rounded-xl
        border border-[#f3dce8]
        bg-white
        p-3
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#e9bfd5]
        hover:shadow-md
      "
    >
      {/* PROFILE IMAGE */}
      <div className="flex justify-center">
        <img
          src={user?.profile_picture || "/logo.png"}
          alt={user?.full_name || "User"}
          className="
            h-14 w-14
            rounded-full
            border-2 border-white
            object-cover
          "
        />
      </div>

      {/* NAME */}
      <div className="mt-2 text-center">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user?.full_name || "User"}
        </p>

        {user?.username && (
          <p className="truncate text-[11px] text-slate-400">
            @{user.username}
          </p>
        )}
      </div>

      {/* BIO */}
      <p className="mx-auto mt-1.5 line-clamp-2 min-h-[28px] max-w-[220px] text-center text-[10px] leading-3.5 text-slate-500">
        {user?.bio ||
          "Exploring life and connecting with amazing people."}
      </p>

      {/* LOCATION + FOLLOWERS */}
      <div className="mt-2 flex items-center justify-center gap-2">
        {user?.location && (
          <div
            className="
              flex max-w-[130px] items-center gap-1
              rounded-full
              border border-[#eeeeee]
              bg-[#fafafa]
              px-2 py-1
              text-[9px] text-slate-500
            "
          >
            <MapPin className="h-3 w-3 shrink-0" />

            <span className="truncate">
              {user.location}
            </span>
          </div>
        )}

        <div
          className="
            shrink-0
            rounded-full
            border border-[#eeeeee]
            bg-[#fafafa]
            px-2 py-1
            text-[9px] text-slate-500
          "
        >
          <span className="font-semibold text-slate-700">
            {user?.Followers?.length ||
              user?.followers?.length ||
              0}
          </span>{" "}
          Followers
        </div>
      </div>

      {/* FOLLOW BUTTON */}
      <div
        className="mt-2.5 flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleFollow}
          className={`
            flex
            h-8
            min-w-[82px]
            items-center
            justify-center
            gap-1.5
            rounded-lg
            px-3
            text-xs
            font-semibold
            transition
            active:scale-95
            cursor-pointer
            ${
              isFollowing
                ? "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                : "bg-[#1877F2] text-white hover:bg-[#166fe5]"
            }
          `}
        >
          {isFollowing ? (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Follow
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;

