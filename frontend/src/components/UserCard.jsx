import React from "react";
import {
  UserPlus,
  UserCheck,
  UserRoundPen,
  UserRoundCheck,
  UserRoundX,
  MessageCircle,
  MapPin,
  Plus,
} from "lucide-react";
import { dummyUserData } from "../assets/dummyData";
import { useNavigate } from "react-router-dom";

const UserCard = ({ user, connectionType }) => {
  const currentUser = dummyUserData;
  const navigate = useNavigate();

  // --------------------------------
  // FOLLOW
  // --------------------------------
  const handleFollow = (e) => {
    e.stopPropagation();

    console.log("Follow user:", user._id);
  };

  // --------------------------------
  // ACCEPT REQUEST
  // --------------------------------
  const handleAccept = (e) => {
    e.stopPropagation();

    console.log("Accept request:", user._id);
  };

  // --------------------------------
  // REJECT REQUEST
  // --------------------------------
  const handleReject = (e) => {
    e.stopPropagation();

    console.log("Reject request:", user._id);
  };

  // --------------------------------
  // MESSAGE
  // --------------------------------
  const handleMessage = (e) => {
    e.stopPropagation();

    console.log("Message user:", user._id);
  };

  // --------------------------------
  // RELATIONSHIP CHECK
  // --------------------------------

  const following = currentUser?.following || [];
  const followers = currentUser?.followers || [];
  const sentRequests = currentUser?.sentRequests || [];
  const receivedRequests = currentUser?.receivedRequests || [];

  const isFollowing = following.includes(user._id);
  const isFollower = followers.includes(user._id);
  const isRequested = sentRequests.includes(user._id);
  const isPending = receivedRequests.includes(user._id);

  // --------------------------------
  // CONNECTION PAGE STATUS
  // --------------------------------

  const isFollowersPage = connectionType === "Followers";
  const isFollowingPage = connectionType === "Following";
  const isPendingPage = connectionType === "Pending";

  // --------------------------------
  // CARD BUTTON
  // --------------------------------

  const renderAction = () => {
    // ================================
    // PENDING REQUEST
    // ================================
    if (isPendingPage) {
      return (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="
              flex h-9 flex-1 items-center justify-center gap-1.5
              rounded-lg
              bg-[#1877F2]
            
              text-xs font-semibold text-white
              transition hover:opacity-90
              active:scale-95
              cursor-pointer
            "
          >
            <UserRoundCheck className="h-4 w-4" />
            Accept
          </button>

          <button
            type="button"
            onClick={handleReject}
            className="
              flex h-9 flex-1 items-center justify-center gap-1.5
              rounded-lg
              border border-red-100
              bg-red-50
              text-xs font-semibold text-red-500
              transition hover:bg-red-100
              active:scale-95
              cursor-pointer
            "
          >
            <UserRoundX className="h-4 w-4" />
            Reject
          </button>
        </div>
      );
    }

    // ================================
    // FOLLOWING PAGE
    // ================================
    if (isFollowingPage || isFollowing) {
      return (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="
              flex h-9 flex-1 items-center justify-center gap-1.5
              rounded-lg
              bg-[#1877F2]
              text-xs font-semibold text-white
              transition hover:opacity-90
              active:scale-95
              cursor-pointer
            "
          >
            <UserCheck className="h-4 w-4" />
            Following
          </button>

          <button
            type="button"
            title="Message"
            onClick={handleMessage}
            className="
              flex h-9 w-10 items-center justify-center
              rounded-lg
              border border-[#e7e7e7]
              bg-white
              text-slate-500
              transition
              hover:border-[#f3dce8]
              hover:bg-[#fff1f7]
              hover:text-[#C900A8]
              active:scale-95
              cursor-pointer
            "
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // ================================
    // FOLLOWER
    // ================================
    if (isFollowersPage || isFollower) {
      return (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={handleFollow}
            className="
              flex h-9 flex-1 items-center justify-center gap-1.5
              rounded-lg
              bg-[#1877F2]
            
            
              text-xs font-semibold text-white
              transition hover:opacity-90
              active:scale-95
              cursor-pointer
            "
          >
            <UserPlus className="h-4 w-4" />
            Follow
          </button>

          <button
            type="button"
            title="Message"
            onClick={handleMessage}
            className="
              flex h-9 w-10 items-center justify-center
              rounded-lg
              border border-[#e7e7e7]
              bg-white
              text-slate-500
              transition
              hover:border-[#f3dce8]
              hover:bg-[#fff1f7]
              hover:text-[#C900A8]
              active:scale-95
              cursor-pointer
            "
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // ================================
    // REQUESTED
    // ================================
    if (isRequested) {
      return (
        <div className="flex w-full gap-2">
          <button
            type="button"
            disabled
            className="
              flex h-9 flex-1 items-center justify-center gap-1.5
              rounded-lg
              border border-[#f3dce8]
              bg-[#1877F2]
              text-xs font-semibold text-[#C900A8]
              cursor-default
            "
          >
            <UserRoundPen className="h-4 w-4" />
            Requested
          </button>

          <button
            type="button"
            title="Message"
            onClick={handleMessage}
            className="
              flex h-9 w-10 items-center justify-center
              rounded-lg
              border border-[#e7e7e7]
              bg-white
              text-slate-500
              transition
              hover:border-[#f3dce8]
              hover:bg-[#fff1f7]
              hover:text-[#C900A8]
              active:scale-95
              cursor-pointer
            "
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // ================================
    // PENDING
    // ================================
    if (isPending) {
      return (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="
              flex h-9 flex-1 items-center justify-center gap-1.5
              rounded-lg
              bg-[#1877F2]
              text-xs font-semibold text-white
              transition hover:opacity-90
              active:scale-95
              cursor-pointer
            "
          >
            <UserRoundCheck className="h-4 w-4" />
            Accept
          </button>

          <button
            type="button"
            onClick={handleReject}
            className="
              flex h-9 w-10 items-center justify-center
              rounded-lg
              border border-red-100
              bg-white
              
              transition hover:bg-red-100
              active:scale-95
              cursor-pointer
            "
          >
            <UserRoundX className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // ================================
    // NORMAL USER
    // ================================
    return (
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={handleFollow}
          className="
            flex h-9 flex-1 items-center justify-center gap-1.5
            rounded-lg
            bg-[#1877F2]
            text-xs font-semibold text-white
            transition hover:opacity-90
            active:scale-95
            cursor-pointer
          "
        >
          <UserPlus className="h-4 w-4" />
          Follow
        </button>

        <button
          type="button"
          title="Follow"
          onClick={handleFollow}
          className="
            flex h-9 w-10 items-center justify-center
            rounded-lg
            border border-[#e7e7e7]
            bg-white
            text-slate-500
            transition
            hover:border-[#f3dce8]
            hover:bg-[#fff1f7]
            hover:text-[#C900A8]
            active:scale-95
            cursor-pointer
          "
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div
      onClick={() => navigate(`/profile/${user._id}`)}
      className="
        group
        w-full
        rounded-xl
        border border-[#f3dce8]
        bg-white
        p-3
        shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-[#e9bfd5]
        hover:shadow-md
        cursor-pointer
      "
    >
      {/* PROFILE IMAGE */}
      <div className="flex justify-center">
        <div
          className="
            rounded-full
           
          "
        >
          <img
            src={user.profile_picture || "/logo.png"}
            alt={user.full_name || "User"}
            className="
              h-14 w-14
              rounded-full
              border-2 border-white
              object-cover
            "
          />
        </div>
      </div>

      {/* NAME */}
      <div className="mt-2 text-center">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user.full_name || "User"}
        </p>

        {user.username && (
          <p className="truncate text-[11px] text-slate-400">
            @{user.username}
          </p>
        )}
      </div>

      {/* BIO */}
      <p className="mx-auto mt-1.5 line-clamp-2 min-h-[28px] max-w-[220px] text-center text-[10px] leading-3.5 text-slate-500">
        {user.bio || "Exploring life and connecting with amazing people."}
      </p>

      {/* LOCATION + FOLLOWERS */}
      <div className="mt-2 flex items-center justify-center gap-2">
        {user.location && (
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
            {user.Followers?.length || user.followers?.length || 0}
          </span>{" "}
          Followers
        </div>
      </div>

      {/* ACTION */}
      <div
        className="mt-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {renderAction()}
      </div>
    </div>
  );
};

export default UserCard;