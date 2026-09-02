import React, { useState } from "react";
import {
  dummyFollowersData as followers,
  dummyFollowingData as following,
  dummyPendingConnectionsData as pendingConnections,
} from "../assets/dummyData";
import UserCard from "../components/UserCard";
import { useNavigate } from "react-router-dom";

import {
  UserPlus,
  UserCheck,
  Users,
  UserRoundCheck,
  UserRoundX,
  UserRoundPen,
} from "lucide-react";


const Connections = () => {
  const [activeTab, setActiveTab] = useState("Followers");
  const navigate =useNavigate()

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
    {
      label: "Pending",
      value: pendingConnections,
      icon: UserRoundPen,
    },
  ];

  const activeData = dataArray.find((item) => item.label === activeTab);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fcfcfc]">
      {/* HEADER */}
      <div className="border-b border-[#f3dce8] bg-white">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Connections
              </h1>

              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Manage your followers and following
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* TABS */}
        <div className="mb-4 overflow-x-auto rounded-xl border border-[#f3dce8] bg-white">
          <div className="flex items-center justify-center gap-4 sm:gap-14">
            {dataArray.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.label)}
                className={`relative flex min-w-[110px] items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer sm:min-w-[150px] ${
                  activeTab === tab.label
                    ? "text-[#1877F2]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <tab.icon className="h-4 w-4" />

                <span>{tab.label}</span>

                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    activeTab === tab.label
                      ? "bg-[#fff1f7] text-[#1877F2]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.value.length}
                </span>

                {/* Active line */}
                {activeTab === tab.label && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#1877F2]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* USERS LIST */}
        <div className="overflow-hidden rounded-xl border border-[#f3dce8] bg-white">
          {/* LIST HEADER */}
          <div className="border-b border-[#f3dce8] px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-900">
              {activeTab}
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {activeTab === "Followers" && "People who follow your profile"}

              {activeTab === "Following" &&
                "People you are currently following"}

              {activeTab === "Pending" &&
                "Follow requests waiting for your response"}
            </p>
          </div>

          {/* USERS */}
          <div  onClick={()=>navigate('/profile/{user._id')}className="divide-y divide-[#f8e8ef] cursor-pointer">
            {activeData?.value.map((user) => (
              <div
                key={user._id}
                className="group flex items-center gap-3 px-3 py-3 transition hover:bg-[#fffafd] sm:px-5 sm:py-4"
              >
                {/* PROFILE IMAGE */}
                <div className="relative shrink-0">
                  <div className="rounded-full ">
                    <img
                      src={user.profile_picture || "/logo.png"}
                      alt={user.full_name || "User"}
                      className="h-11 w-11 rounded-full border-2 border-white object-cover sm:h-12 sm:w-12"
                    />
                  </div>

                </div>

                {/* USER INFO */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.full_name}
                  </p>

                  <p className="truncate text-xs font-medium text-slate-400">
                    @{user.username}
                  </p>

                  <p className="mt-0.5 hidden max-w-md truncate text-xs text-slate-400 sm:block">
                    {user.bio || "No bio available"}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="shrink-0">
                  {activeTab === "Followers" && (
                    <button
                      type="button"
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-[#f3dce8] bg-[#1877F2] px-3 text-white text-xs font-semibold  transition-all hover:border-transparent hover:bg-gradient-to-r hover:from-[#F58529] hover:via-[#FF2D55] hover:to-[#C900A8] hover:text-white active:scale-95 cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />

                      <span className="hidden sm:inline">Follow Back</span>
                    </button>
                  )}

                  {activeTab === "Following" && (
                    <button
                      type="button"
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-[#e7e7e7] bg-[#1877F2] px-3 text-xs font-semibold text-white transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95 cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />

                      <span className="hidden sm:inline">Following</span>
                    </button>
                  )}

                  {activeTab === "Pending" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Accept"
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg  text-white  bg-[#1877F2] px-2 sm:px-3 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 cursor-pointer"
                      >
                        <UserRoundCheck className="h-4 w-4" />
                        <span className="hidden sm:inline">Accept</span>
                      </button>
                      <button
                        type="button"
                        title="Reject"
                        className="flex h-9  items-center justify-center gap-1.5 rounded-lg border border-[#1877F2] text-[#1877F2] px-2 sm:px-3 text-xs font-semibold  transition hover:bg-red-100 active:scale-95 cursor-pointer"
                      >
                        <UserRoundX className="h-4 w-4" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* EMPTY STATE */}
            {activeData?.value.length === 0 && (
              <div className="px-4 py-14 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No {activeTab.toLowerCase()} yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  People will appear here when your connections grow.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;
