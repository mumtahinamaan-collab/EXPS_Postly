import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  House,
  Search,
  UserRound,
  Bell,
  CirclePlus,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";

const MobileMenu = () => {
  const { unreadCount } = useNotifications();

  return (
    <div
      className="
        sm:hidden
        fixed
        bottom-0
        left-0
        right-0
        z-50
        bg-white
        border-t
        border-[#f3dce8]
        shadow-[0_-4px_15px_rgba(0,0,0,0.05)]
      "
    >
      <div className="h-[70px] flex items-center justify-around px-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 transition ${
              isActive ? "text-pink-500" : "text-gray-500"
            }`
          }
        >
          <House className="w-5 h-5" />
          <span className="text-[10px] font-medium">
            Feed
          </span>
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 transition ${
              isActive ? "text-pink-500" : "text-gray-500"
            }`
          }
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">
            Discover
          </span>
        </NavLink>

        <Link
          to="/create-post"
          onClick={() => setSidebarOpen(false)}
          className="
            flex
            flex-col
            items-center
            justify-center
            -mt-5
          "
        >
          <div
            className="
              w-12
              h-12
              rounded-full
              bg-pink-500
              text-white
              flex
              items-center
              justify-center
              shadow-lg
              border-4
              border-white
              active:scale-95
              transition
            "
          >
            <CirclePlus className="w-6 h-6" />
          </div>

          <span className="text-[10px] font-medium text-gray-600 mt-1">
            Create
          </span>
        </Link>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center gap-0.5 w-16 transition ${
              isActive ? "text-pink-500" : "text-gray-500"
            }`
          }
        >
          <div className="relative">
            <Bell className="w-5 h-5" />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -top-2
                  -right-2
                  min-w-[18px]
                  h-[18px]
                  px-1
                  rounded-full
                  bg-red-500
                  text-white
                  text-[10px]
                  font-bold
                  flex
                  items-center
                  justify-center
                "
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          <span className="text-[10px] font-medium">
            Notifications
          </span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 transition ${
              isActive ? "text-pink-500" : "text-gray-500"
            }`
          }
        >
          <UserRound className="w-5 h-5" />

          <span className="text-[10px] font-medium">
            Profile
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileMenu;