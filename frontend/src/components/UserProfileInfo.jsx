
import {
  SquarePen,
  BadgeCheck,
  UserPlus,
  UserCheck,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { dummyUserData } from "../assets/dummyData";
import toast from "react-hot-toast";

const UserProfileInfo = ({
  user,
  posts,
  profileId,
  setShowEdit,
  onConnectionClick,
}) => {
  const navigate = useNavigate();

  const currentUser = dummyUserData;

  const following = currentUser?.following || [];
  const followers = currentUser?.followers || [];

  const userId = user?._id || user?.id;

  const isFollowing = following.includes(userId);
  const isFollower = followers.includes(userId);

  const handleFollow = (e) => {
    e.stopPropagation();

    // Follow API will be connected later.
  };

  const handleMessage = (e) => {
    e.stopPropagation();

    if (!userId) return;

    navigate(`/messages/${userId}`);
  };

  const handleShare = async (e) => {
    e.stopPropagation();

    if (!userId) return;

    const profileLink = `${window.location.origin}/profile/${userId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user?.full_name || "Profile"} on Postly`,
          text: `Check out ${user?.full_name || "this profile"} on Postly`,
          url: profileLink,
        });
      } else {
        await navigator.clipboard.writeText(profileLink);
        toast.success("Profile link copied");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(profileLink);
          toast.success("Profile link copied");
        } catch {
          toast.error("Unable to share profile");
        }
      }
    }
  };

  const renderAction = () => {
    if (!profileId) {
      return (
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 cursor-pointer sm:flex-none"
          >
            <SquarePen className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 cursor-pointer sm:flex-none"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      );
    }

    if (isFollowing) {
      return (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 text-sm font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Following
          </button>

          <button
            type="button"
            title="Message"
            onClick={handleMessage}
            className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Share"
            onClick={handleShare}
            className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    if (isFollower) {
      return (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={handleFollow}
            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 text-sm font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Follow Back
          </button>

          <button
            type="button"
            title="Message"
            onClick={handleMessage}
            className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            title="Share"
            onClick={handleShare}
            className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={handleFollow}
          className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 text-sm font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </button>

        <button
          type="button"
          title="Message"
          onClick={handleMessage}
          className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          title="Share"
          onClick={handleShare}
          className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="relative bg-white px-4 py-4 sm:px-6 md:px-8">
      <div className="flex flex-col items-start gap-5 md:flex-row md:gap-6">

        {/* Profile Image */}
        <div className="absolute -top-14 left-4 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg sm:left-6 md:left-8 md:-top-16 md:h-32 md:w-32">
          <img
            src={user?.profile_picture || "/logo.png"}
            alt={user?.full_name || "profile"}
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        <div className="w-full pt-16 md:pl-36 md:pt-0">

          {/* Name + Action */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {user?.full_name || "No Name"}
                </h1>

                <BadgeCheck className="h-5 w-5 shrink-0 text-blue-500 sm:h-6 sm:w-6" />
              </div>

              <p className="mt-0.5 text-sm text-gray-500">
                {user?.username
                  ? `@${user.username}`
                  : "Add a username"}
              </p>
            </div>

            <div className="w-full md:w-auto">
              {renderAction()}
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 max-w-md text-sm leading-5 text-gray-700">
            {user?.bio || "No bio added yet."}
          </p>

          {/* Stats */}
          <div className="mt-5 flex items-center gap-5 border-t border-gray-200 pt-4 sm:gap-7">

            <button
              type="button"
              onClick={() => onConnectionClick("Followers")}
              className="text-left transition hover:text-[#1877F2] cursor-pointer"
            >
              <span className="text-base font-bold text-gray-900 sm:text-lg">
                {user?.followers?.length || 0}
              </span>

              <span className="ml-1 text-xs text-gray-500 sm:text-sm">
                Followers
              </span>
            </button>

            <button
              type="button"
              onClick={() => onConnectionClick("Following")}
              className="text-left transition hover:text-[#1877F2] cursor-pointer"
            >
              <span className="text-base font-bold text-gray-900 sm:text-lg">
                {user?.following?.length || 0}
              </span>

              <span className="ml-1 text-xs text-gray-500 sm:text-sm">
                Following
              </span>
            </button>

            <div>
              <span className="text-base font-bold text-gray-900 sm:text-lg">
                {posts?.length || 0}
              </span>

              <span className="ml-1 text-xs text-gray-500 sm:text-sm">
                Posts
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;

