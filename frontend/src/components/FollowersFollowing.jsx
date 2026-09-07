
import React, { useEffect, useState } from "react";
import {
  UserPlus,
  UserCheck,
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

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const navigate = useNavigate();
  const { getToken } = useAuth();

  /*
   * Get followers + following from:
   *
   * GET /api/user/social/<user_id>/
   */
  const fetchSocialData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const token = await getToken();

      const response = await api.get(
        `/user/social/${user.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (!data?.success) {
        toast.error(
          data?.message || "Unable to load connections"
        );
        return;
      }

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   followers: [...],
       *   following: [...],
       *   followers_count: ...,
       *   following_count: ...
       * }
       */

      setFollowers(data.followers || []);
      setFollowing(data.following || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load connections"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Load social data whenever selected profile changes.
   */
  useEffect(() => {
    fetchSocialData();
  }, [user?.id]);

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

  /*
   * Open selected user's profile.
   */
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

      const response = await api.post(
        "/user/follow/",
        {
          id: personId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (!data?.success) {
        toast.error(
          data?.message ||
            "Unable to update follow status"
        );
        return;
      }



      if (data.following) {
        
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

        /*
         * Add user to Following list.
         */
        setFollowing((prev) => {
          const exists = prev.some(
            (item) =>
              String(item.id) ===
              String(personId)
          );

          if (exists) {
            return prev.map((item) =>
              String(item.id) === String(personId)
                ? {
                    ...item,
                    following: true,
                  }
                : item
            );
          }

          return [
            ...prev,
            {
              ...person,
              following: true,
            },
          ];
        });
      } else {
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

        /*
         * Remove user from Following list.
         */
        setFollowing((prev) =>
          prev.filter(
            (item) =>
              String(item.id) !==
              String(personId)
          )
        );
      }

      /*
       * Send updated counts to parent Profile.
       */
      onFollowUpdate?.({
        following: data.following,
        followers_count:
          data.followers_count,
        following_count:
          data.following_count,
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
                onClick={() =>
                  setActiveTab(tab.label)
                }
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

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center px-4 py-14">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#1877F2]" />
          </div>
        ) : activeData?.value.length > 0 ? (
          <div className="divide-y divide-gray-100">

            {activeData.value.map((person) => {
              const personId =
                person?.id || person?._id;

              const isLoading =
                String(loadingUserId) ===
                String(personId);

              /*
               * Followers:
               * backend should provide `following`
               * telling whether current user follows
               * this person.
               *
               * Following:
               * everyone in this list is already followed.
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
                        person?.full_name ||
                        person?.username ||
                        "User"
                      }
                      className="h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12"
                    />
                  </div>

                  {/* INFO */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {person?.full_name ||
                        "User"}
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
                    {activeTab ===
                      "Followers" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(
                            person
                          );
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
                    {activeTab ===
                      "Following" && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(
                            person
                          );
                        }}
                        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-gray-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoading ? (
                          <span>...</span>
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}

                        <span className="hidden sm:inline">
                          {isLoading
                            ? "..."
                            : "Following"}
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

