import {
  Calendar,
  MapPin,
  SquarePen,
  BadgeCheck,
  UserPlus,
  UserCheck,
  UserRoundPen,
  UserRoundCheck,
  UserRoundX,
  MessageCircle,
  Plus,
} from "lucide-react";
import StoryModal from "./StoryModal";
import moment from "moment";
import React, { useState } from "react";
import { dummyUserData } from "../assets/dummyData";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
  const currentUser = dummyUserData;
  const [showStoryModal, setShowStoryModal] = useState(false);

  const handleFollow = (e) => { e.stopPropagation(); };
  const handleAccept = (e) => { e.stopPropagation(); };
  const handleReject = (e) => { e.stopPropagation(); };
  const handleMessage = (e) => { e.stopPropagation(); };

  const following = currentUser?.following || [];
  const followers = currentUser?.followers || [];
  const sentRequests = currentUser?.sentRequests || [];
  const receivedRequests = currentUser?.receivedRequests || [];

  const isFollowing = following.includes(user?._id);
  const isFollower = followers.includes(user?._id);
  const isRequested = sentRequests.includes(user?._id);
  const isPending = receivedRequests.includes(user?._id);

  const renderAction = () => {
    if (isPending) {
      return (
        <div className="flex w-full gap-2">
          <button type="button" onClick={handleAccept} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 text- font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer">
            <UserRoundCheck className="h-3.5 w-3.5" /> Accept
          </button>
          <button type="button" onClick={handleReject} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 text- font-semibold text-red-500 transition hover:bg-red-100 active:scale-95 cursor-pointer">
            <UserRoundX className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      );
    }

    if (isFollowing) {
      return (
        <div className="flex w-full gap-2">
          <button type="button" onClick={(e) => e.stopPropagation()} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 text- font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer">
            <UserCheck className="h-3.5 w-3.5" /> Following
          </button>
          <button type="button" title="Message" onClick={handleMessage} className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer">
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    if (isFollower) {
      return (
        <div className="flex w-full gap-2">
          <button type="button" onClick={handleFollow} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 text- font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer">
            <UserPlus className="h-3.5 w-3.5" /> Follow Back
          </button>
          <button type="button" title="Message" onClick={handleMessage} className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer">
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    if (isRequested) {
      return (
        <div className="flex w-full gap-2">
          <button type="button" disabled className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-[#dbeafe] bg-[#eff6ff] px-3 text- font-semibold text-[#1877F2] cursor-default">
            <UserRoundPen className="h-3.5 w-3.5" /> Requested
          </button>
          <button type="button" title="Message" onClick={handleMessage} className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer">
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex w-full gap-2">
        <button type="button" onClick={handleFollow} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 text- font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer">
          <UserPlus className="h-3.5 w-3.5" /> Follow
        </button>
        <button type="button" title="Message" onClick={handleMessage} className="flex h-8 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2] active:scale-95 cursor-pointer">
          <MessageCircle className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="relative bg-white px-4 py-4 sm:px-6 md:px-8">
      <div className="flex flex-col items-start gap-5 md:flex-row md:gap-6">
        <div className="absolute -top-14 left-4 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg sm:left-6 md:left-8 md:-top-16 md:h-32 md:w-32">
          <img src={user?.profile_picture || "/logo.png"} alt={user?.full_name || "profile"} className="h-full w-full rounded-full object-cover" />
        </div>

        <div className="w-full pt-16 md:pl-36 md:pt-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{user?.full_name || "No Name"}</h1>
                <BadgeCheck className="h-5 w-5 shrink-0 text-blue-500 sm:h-6 sm:w-6" />
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{user?.username? `@${user.username}` : "Add a username"}</p>
            </div>

            {!profileId && (
                <button type="button" onClick={() => setShowEdit(true)} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text- font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 cursor-pointer sm:flex-none">
                  <SquarePen className="h-3.5 w-3.5" /> Edit
                </button>
            )}
          </div>

          <p className="mt-4 max-w-md text-sm leading-5 text-gray-700">{user?.bio || "No bio added yet."}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500 sm:text-sm">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0" />{user?.location || "Add Location"}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 shrink-0" />Joined <span className="font-medium">{user?.createdAt? moment(user.createdAt).fromNow() : "recently"}</span></span>
          </div>

          <div className="mt-5 flex items-center gap-5 border-t border-gray-200 pt-4 sm:gap-7">
            <div><span className="text-base font-bold text-gray-900 sm:text-lg">{user?.followers?.length || 0}</span><span className="ml-1 text-xs text-gray-500 sm:text-sm">Followers</span></div>
            <div><span className="text-base font-bold text-gray-900 sm:text-lg">{user?.following?.length || 0}</span><span className="ml-1 text-xs text-gray-500 sm:text-sm">Following</span></div>
            <div><span className="text-base font-bold text-gray-900 sm:text-lg">{posts?.length || 0}</span><span className="ml-1 text-xs text-gray-500 sm:text-sm">Posts</span></div>
          </div>

          {profileId && <div className="mt-5 w-full max-w-md">{renderAction()}</div>}
        </div>
      </div>

      {showStoryModal && <StoryModal onClose={() => setShowStoryModal(false)} />}
    </div>
  );
};

export default UserProfileInfo;