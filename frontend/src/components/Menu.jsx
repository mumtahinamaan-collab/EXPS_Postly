import React from "react";
import { NavLink } from "react-router-dom";
import { House, MessageCircle, Users, Search, UserRound } from "lucide-react";

const MenuItems = ({ setSidebarOpen }) => {
  const menuItems = [
    { to: "/", label: "Feed", icon: House },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/connections", label: "Connections", icon: Users },
    { to: "/discover", label: "Discover", icon: Search },
    { to: "/profile", label: "Profile", icon: UserRound },
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
                ? "bg-gray-200"
                : "hover:bg-gray-100"
            }`
          }
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;
