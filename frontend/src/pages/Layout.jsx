
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import MobileMenu from "../components/MobileMenu";

const Layout = () => {

  const user = useSelector((state) => state.user.value);

  return user ? (
    <div className="flex w-full h-screen">
      {/* DESKTOP SIDEBAR */}
      <Sidebar/>

      {/* PAGE CONTENT */}
      <div className="flex-1 bg-slate-50 min-w-0 pb-[70px] sm:pb-0">
        <Outlet />
      </div>
      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileMenu/>
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;

