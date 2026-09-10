import React from "react";
import logo from "../assets/logo.png";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Menu from "./Menu";
import { CirclePlus, LogOut } from "lucide-react";
import { useClerk } from "@clerk/react";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.value);

  const { signOut } = useClerk();

  return (
    <div
      className="
  hidden
  sm:flex
  sm:w-60
  h-screen
  sticky
  top-0
  xl:w-72
  bg-white
  border-r
  border-[#f3dce8]
  flex-col
  justify-between
  items-center
  z-20
"
    >
      {/* TOP */}
      <div className="w-full">
        <img
          onClick={() => navigate("/")}
          src={logo}
          className="w-26 ml-7 my-2 cursor-pointer"
          alt="SayIt"
        />

        <hr className="border-[#f3dce8] mb-8" />

        <Menu />

        {/* Create Post */}
        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg
          bg-pink-500
          hover:opacity-90 active:scale-95 transition
          text-white cursor-pointer shadow-sm"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      {/* USER */}
      <div className="w-full border-t border-[#f3dce8] p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          <img
            src={user?.profile_picture}
            alt={user.full_name}
            className="w-9 h-9 rounded-full object-cover"
          />

          <div>
            <h1 className="text-sm font-medium text-gray-800">
              {user.full_name}
            </h1>

            <p className="text-xs text-slate-400">@{user.username}</p>
          </div>
        </div>

        <LogOut
          onClick={() => signOut()}
          className="w-5 h-5 text-gray-400 hover:text-[#FF2D55] transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;
