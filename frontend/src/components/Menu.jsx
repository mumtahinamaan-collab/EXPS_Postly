
import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  House,
  Search,
  UserRound,
  Bell,
  CirclePlus,
} from "lucide-react";

const MenuItems = ({ setSidebarOpen }) => {
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
    <>
      {/* ================= DESKTOP MENU ================= */}

      <div className="hidden sm:block px-6 text-gray-600 space-y-1 font-medium">
        {menuItems.map(
          ({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() =>
                setSidebarOpen(false)
              }
              className={({ isActive }) =>
                `px-3 py-2 flex items-center gap-3 rounded-xl transition ${
                  isActive
                    ? "bg-gray-200 text-gray-900"
                    : "hover:bg-gray-100"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          )
        )}
      </div>

      {/* ================= MOBILE BOTTOM MENU ================= */}

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#f3dce8] shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">

        <div className="h-[70px] flex items-center justify-around px-2">

          {/* FEED */}

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-16 transition ${
                isActive
                  ? "text-pink-500"
                  : "text-gray-500"
              }`
            }
          >
            <House className="w-5 h-5" />

            <span className="text-[10px] font-medium">
              Feed
            </span>
          </NavLink>

          {/* DISCOVER */}

          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-16 transition ${
                isActive
                  ? "text-pink-500"
                  : "text-gray-500"
              }`
            }
          >
            <Search className="w-5 h-5" />

            <span className="text-[10px] font-medium">
              Discover
            </span>
          </NavLink>

          {/* CREATE POST — CENTER */}

          <Link
            to="/create-post"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg border-4 border-white active:scale-95 transition">
              <CirclePlus className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-medium text-gray-600 mt-1">
              Create
            </span>
          </Link>

          {/* NOTIFICATIONS */}

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-16 transition ${
                isActive
                  ? "text-pink-500"
                  : "text-gray-500"
              }`
            }
          >
            <Bell className="w-5 h-5" />

            <span className="text-[10px] font-medium">
              Notifications
            </span>
          </NavLink>

          {/* PROFILE */}

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-16 transition ${
                isActive
                  ? "text-pink-500"
                  : "text-gray-500"
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
    </>
  );
};

export default MenuItems;

