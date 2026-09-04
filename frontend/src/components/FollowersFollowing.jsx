
import React, { useState } from "react";
import {
  UserPlus,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  dummyFollowersData,
  dummyFollowingData,
} from "../assets/dummyData";

const FollowersFollowing = ({
  user,
  initialTab = "Followers",
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const navigate = useNavigate();

  const followers = user?.followersData || dummyFollowersData || [];
  const following = user?.followingData || dummyFollowingData || [];

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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-gray-100 hover:text-slate-900 active:scale-95 cursor-pointer"
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
                className={`relative flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
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
              const personId = person?._id || person?.id;

              return (
                <div
                  key={personId}
                  onClick={() => handleUserClick(personId)}
                  className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-gray-50 sm:px-5 sm:py-4"
                >
                  {/* IMAGE */}
                  <div className="shrink-0">
                    <img
                      src={
                        person?.profile_picture || "/logo.png"
                      }
                      alt={person?.full_name || "User"}
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
                      {person?.bio || "No bio available"}
                    </p>
                  </div>

                  {/* ACTION */}
                  <div className="shrink-0">
                    {activeTab === "Followers" && (
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-[#1877F2] px-3 text-xs font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer"
                      >
                        <UserPlus className="h-4 w-4" />

                        <span className="hidden sm:inline">
                          Follow Back
                        </span>
                      </button>
                    )}

                    {activeTab === "Following" && (
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-[#1877F2] px-3 text-xs font-semibold text-white transition hover:bg-[#166fe5] active:scale-95 cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4" />

                        <span className="hidden sm:inline">
                          Following
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
              People will appear here when your connections grow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersFollowing;

