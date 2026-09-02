import React, { useState } from "react";
import { dummyConnectionsData } from "../assets/dummyData";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";

const Discover = () => {
  const [input, setInput] = useState([]);
  const [users, setUsers] = useState(dummyConnectionsData);
  const [loading, setLoading] = useState(false);
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      setUsers([]);
      setLoading(true);
      setTimeout(() => {
        setUsers(dummyConnectionsData);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fcfcfc]">
      <div className="border-b border-[#f3dce8] bg-white">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col items-left justify-between py-3 sm:py-4">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Discover People
            </h1>
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Find and connect with amazing people around you
            </p>
          </div>
        </div>
      </div>
      <div className="relative mt-5 w-full max-w-2xl mx-auto flex justify-center">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search people..."
          value={input}
          onKeyUp={handleSearch}
          onChange={(e) => setInput(e.target.value)}
          className="
                w-full
                h-11
                pl-11
                pr-4
                rounded-xl
                bg-[#fff8fb]
                border
                border-[#f3dce8]
                text-sm
                text-slate-800
                placeholder:text-slate-400
                outline-none
                transition
                focus:border-[#d9a8c2]
                focus:ring-2
                focus:ring-[#fce3ee]
              "
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-6">
        {users.map((user) => (
          <UserCard user={user} key={user._id} />
        ))}
      </div>
      {Loading && <Loading height="60vh" />}
    </div>
  );
};

export default Discover;
