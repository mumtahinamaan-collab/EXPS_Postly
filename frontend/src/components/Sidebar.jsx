import React from "react";
import logo from "../assets/logo.png";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Menu from "./Menu";
import { CirclePlus, LogOut } from "lucide-react";
import { UserButton, useClerk } from "@clerk/react";
import { dummyUserData } from "../assets/dummyData";
import { useSelector } from "react-redux";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.value);

  const { signOut } = useClerk();


  

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-[#f3dce8] flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${
        sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300 ease-in-out`}
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

        <Menu setSidebarOpen={setSidebarOpen} />

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
          <UserButton />

          <div>
            <h1 className="text-sm font-medium text-gray-800">
              {user.full_name}
            </h1>

            <p className="text-xs text-slate-400">
              @{user.username}
            </p>
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