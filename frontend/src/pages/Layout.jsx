
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import MobileMenu from "../components/MobileMenu";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user.value);

  return user ? (
    <div className="flex w-full h-screen">
      {/* DESKTOP SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* PAGE CONTENT */}
      <div className="flex-1 bg-slate-50 min-w-0 pb-[70px] sm:pb-0">
        <Outlet />
      </div>

      {/* MOBILE SIDEBAR CLOSE BUTTON */}
      {sidebarOpen && (
        <X
          className="
            absolute
            top-3
            right-3
            p-2
            z-[100]
            bg-white
            rounded-md
            shadow
            w-10
            h-10
            text-gray-600
            sm:hidden
          "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileMenu
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;

