
import React, { useState } from "react";
import { Search } from "lucide-react";

import UserCard from "../components/UserCard";
import Loading from "../components/Loading";

import { dummyUserData } from "../assets/dummyData";

const Discover = () => {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState(
    Array.isArray(dummyUserData)
      ? dummyUserData
      : [dummyUserData]
  );
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);

      setTimeout(() => {
        setUsers(
          Array.isArray(dummyUserData)
            ? dummyUserData
            : [dummyUserData]
        );

        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fcfcfc]">

      {/* HEADER */}
      <div className="border-b border-[#f3dce8] bg-white">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8">
          <div className="py-3 sm:py-4">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Discover People
            </h1>

            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Find and connect with amazing people around you
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative mx-auto mt-5 flex w-full max-w-2xl justify-center px-3 sm:px-0">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 sm:left-4"
          size={18}
        />

        <input
          type="text"
          placeholder="Search people..."
          value={input}
          onKeyUp={handleSearch}
          onChange={(e) => setInput(e.target.value)}
          className="
            h-11
            w-full
            rounded-xl
            border
            border-[#f3dce8]
            bg-[#fff8fb]
            pl-11
            pr-4
            text-sm
            text-slate-800
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-[#d9a8c2]
            focus:ring-2
            focus:ring-[#fce3ee]
          "
        />
      </div>

      {/* USERS */}
      {!loading && (
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 px-3 sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {users.map((user) => (
            <UserCard
              user={user}
              key={user?._id || user?.id}
            />
          ))}
        </div>
      )}

      {/* LOADING */}
      {loading && <Loading height="60vh" />}

    </div>
  );
};

export default Discover;

