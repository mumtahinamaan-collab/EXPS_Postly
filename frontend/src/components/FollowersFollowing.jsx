import React, { useEffect, useState } from "react";
import {
  UserPlus,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";

const FollowersFollowing = ({
  user,
  initialTab = "Followers",
  onClose,
  onFollowUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loadingUserId, setLoadingUserId] = useState(null);

  // Local copies so follow/unfollow updates immediately
  const [followers, setFollowers] = useState(
    user?.followersData || []
  );

  const [following, setFollowing] = useState(
    user?.followingData || []
  );

  const navigate = useNavigate();
  const { getToken } = useAuth();

  /*
   * Jab parent se user data change ho
   * to local lists bhi update ho jayein.
   */
  useEffect(() => {
    setFollowers(user?.followersData || []);
    setFollowing(user?.followingData || []);
  }, [user?.followersData, user?.followingData]);

  const dataArray = [
    {
      label: "Followers",
      value: followers,
      icon: Users,
    },
    {
      label: "Following",
      value: following,
      icon: UserCheck,
    },
  ];

  const activeData = dataArray.find(
    (item) => item.label === activeTab
  );

  const handleUserClick = (userId) => {
    if (!userId) return;

    onClose?.();
    navigate(`/profile/${userId}`);
  };

  const handleFollowToggle = async (person) => {
    const personId = person?.id || person?._id;

    if (!personId) return;

    try {
      setLoadingUserId(personId);

      const token = await getToken();

      const { data } = await api.post(
        "/users/follow/",
        {
          id: personId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(
          data.message || "Unable to update follow status"
        );
        return;
      }

      /*
       * FOLLOW
       */
      if (data.following) {
        // Followers tab:
        // update that person's following status
        setFollowers((prev) =>
          prev.map((item) =>
            String(item.id) === String(personId)
              ? {
                  ...item,
                  following: true,
                }
              : item
          )
        );

        // Following list mein user add karo
        setFollowing((prev) => {
          const alreadyExists = prev.some(
            (item) =>
              String(item.id) === String(personId)
          );

          if (alreadyExists) {
            return prev;
          }

          return [
            ...prev,
            {
              ...person,
              following: true,
            },
          ];
        });
      }

      /*
       * UNFOLLOW
       */
      else {
        // Followers tab:
        // person ab current user ko follow nahi kar raha
        // actually backend response "following" current user's
        // relationship ko represent karta hai.
        setFollowers((prev) =>
          prev.map((item) =>
            String(item.id) === String(personId)
              ? {
                  ...item,
                  following: false,
                }
              : item
          )
        );

        // Following tab mein unfollow ke baad remove
        setFollowing((prev) =>
          prev.filter(
            (item) =>
              String(item.id) !== String(personId)
          )
        );
      }

      /*
       * Parent Profile ko updated counts bhej do.
       */
      onFollowUpdate?.({
        following: data.following,
        followers_count: data.followers_count,
        following_count: data.following_count,
      });

      toast.success(
        data.following
          ? "User followed successfully"
          : "User unfollowed successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update follow status"
      );
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Connections
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Manage followers and following
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-gray-100 hover:text-slate-900 active:scale-95"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200 px-3 sm:px-4">
        <div className="flex items-center">
          {dataArray.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.label)}
                className={`relative flex flex-1 cursor-pointer items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.label
                    ? "text-[#1877F2]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />

                <span>{tab.label}</span>

                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    activeTab === tab.label
                      ? "bg-blue-50 text-[#1877F2]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.value.length}
                </span>

                {activeTab === tab.label && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#1877F2]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST HEADER */}
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-slate-900">
          {activeTab}
        </h3>

        <p className="mt-0.5 text-xs text-slate-400">
          {activeTab === "Followers"
            ? "People who follow this profile"
            : "People this profile follows"}
        </p>
      </div>

      {/* USERS LIST */}
      <div className="max-h-[55vh] overflow-y-auto">
        {activeData?.value.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {activeData.value.map((person) => {
              const personId = person?.id || person?._id;

              const isLoading =
                loadingUserId === personId;

              /*
               * Followers:
               * API ka `following` batata hai ke
               * current logged-in user is person ko follow karta hai ya nahi.
               *
               * Following:
               * list mein jo user hai wo already followed hai.
               */
              const isFollowing =
                activeTab === "Following"
                  ? true
                  : person?.following === true;

              return (
                <div
                  key={personId}
                  onClick={() =>
                    handleUserClick(personId)
                  }
                  className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-gray-50 sm:px-5 sm:py-4"
                >
                  {/* IMAGE */}
                  <div className="shrink-0">
                    <img
                      src={
                        person?.profile_picture ||
                        "/logo.png"
                      }
                      alt={
                        person?.full_name || "User"
                      }
                      className="h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12"
                    />
                  </div>

                  {/* INFO */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {person?.full_name || "User"}
                    </p>

                    <p className="truncate text-xs font-medium text-slate-400">
                      {person?.username
                        ? `@${person.username}`
                        : ""}
                    </p>

                    <p className="mt-0.5 hidden max-w-md truncate text-xs text-slate-400 sm:block">
                      {person?.bio ||
                        "No bio available"}
                    </p>
                  </div>

                  {/* ACTION */}
                  <div className="shrink-0">
                    {/* FOLLOWERS */}
                    {activeTab === "Followers" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(person);
                        }}
                        className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                          isFollowing
                            ? "bg-gray-100 text-slate-700 hover:bg-gray-200"
                            : "bg-[#1877F2] text-white hover:bg-[#166fe5]"
                        }`}
                      >
                        {isLoading ? (
                          <span>...</span>
                        ) : isFollowing ? (
                          <UserCheck className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}

                        <span className="hidden sm:inline">
                          {isFollowing
                            ? "Following"
                            : "Follow Back"}
                        </span>
                      </button>
                    )}

                    {/* FOLLOWING */}
                    {activeTab === "Following" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(person);
                        }}
                        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-gray-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <UserMinus className="h-4 w-4" />

                        <span className="hidden sm:inline">
                          {isLoading
                            ? "..."
                            : "Unfollow"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY */
          <div className="px-4 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
              <Users className="h-5 w-5" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No {activeTab.toLowerCase()} yet
            </p>

            <p className="mx-auto mt-1 max-w-xs text-xs text-slate-400">
              People will appear here when your
              connections grow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersFollowing;