
import React, { useEffect, useState } from "react";
import {
  UserPlus,
  UserCheck,
  MapPin,
} from "lucide-react";

import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const userId = user?.id || user?._id;

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Follow status comes from Discover API
  useEffect(() => {
    if (!userId) return;

    setIsFollowing(Boolean(user?.is_following));
  }, [user, userId]);

  const handleFollow = async (e) => {
    e.stopPropagation();

    if (!userId || loading) return;

    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await api.post(
        "/user/follow/",
        {
          id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setIsFollowing(data.following);

        toast.success(
          data.following
            ? "User followed successfully"
            : "User unfollowed successfully"
        );
      } else {
        toast.error(
          data.message || "Unable to update follow status"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update follow status"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/profile/${userId}`)}
      className="
        group
        w-full
        min-w-0
        max-w-full
        overflow-hidden
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
      {/* PROFILE IMAGE + NAME */}
      <div className="flex min-w-0 flex-col items-center">
        <img
          src={user?.profile_picture}
          alt={user?.full_name || "User"}
          className="
            h-14
            w-14
            shrink-0
            rounded-full
            border-2
            border-white
            object-cover
          "
        />

        {/* NAME */}
        <div >
        <div className="mt-2 min-w-0 max-w-full text-center">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user?.full_name || "User"}
          </p>

          {user?.username && (
            <p className="truncate text-[11px] text-slate-400">
              @{user.username}
            </p>
          )}
        </div>
      </div>

      {/* BIO */}
      <p
        className="
          mx-auto
          mt-1.5
          min-h-[28px]
          max-w-[220px]
          overflow-hidden
          text-center
          text-[10px]
          leading-3.5
          text-slate-500
          line-clamp-2
        "
      >
        {user?.bio ||
          " "}
      </p>

      {/* LOCATION + FOLLOWERS */}
      <div className="mt-2 flex min-w-0 items-center justify-center gap-2">
        {user?.location && (
          <div
            className="
              flex
              min-w-0
              max-w-[130px]
              items-center
              gap-1
              rounded-full
              border
              border-[#eeeeee]
              bg-[#fafafa]
              px-2
              py-1
              text-[9px]
              text-slate-500
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
            border
            border-[#eeeeee]
            bg-[#fafafa]
            px-2
            py-1
            text-[9px]
            text-slate-500
          "
        >
          <span className="font-semibold text-slate-700">
            {user?.followers_count ||
              user?.Followers?.length ||
              user?.followers?.length ||
              0}
          </span>{" "}
          Followers
        </div>
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
          disabled={loading}
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
            disabled:cursor-not-allowed
            disabled:opacity-60
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
              {loading ? "..." : "Following"}
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              {loading ? "..." : "Follow"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
