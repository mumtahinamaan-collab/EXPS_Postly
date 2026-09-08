import React from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  Search,
  UserRound,
  Bell,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";

const MenuItems = ({ setSidebarOpen }) => {
  const { unreadCount } = useNotifications();

  const menuItems = [
    {
      to: "/",
      label: "Feed",
      icon: House,
    },
    {
      to: "/discover",
      label: "Discover",
      icon: Search,
    },
    {
      to: "/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: UserRound,
    },
  ];

  return (
    <div className="px-6 text-gray-600 space-y-1 font-medium">
      {menuItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-3 py-2 flex items-center gap-3 rounded-xl transition ${
              isActive
                ? "bg-gray-200 text-gray-900"
                : "hover:bg-gray-100"
            }`
          }
        >
          <div className="relative">
            <Icon className="w-5 h-5" />

            {label === "Notifications" && unreadCount > 0 && (
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

          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;