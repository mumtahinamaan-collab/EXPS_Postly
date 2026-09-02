import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Loading  from "../components/Loading";
import { Outlet } from 'react-router-dom' 
import { X, Menu } from 'lucide-react' 
import { users } from "../assets/dummyData"; 

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = users;

  return user ? (
    <div className="flex w-full h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>

      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>

      <X
        className="absolute top-3 right-3 p-2 z-[100] bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  ) : (
    <Loading/>
  );
};

export default Layout;