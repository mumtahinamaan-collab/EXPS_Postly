import React from "react";
import MessageUsers from "../components/MessageUsers";
import { useParams } from "react-router-dom";
import Chat from "../components/Chatbox";

const Messages = () => {
  const { userId } = useParams();
  return (
    <div className="w-full h-screen flex flex-col bg-[#fcfcfc] overflow-hidden">
      {/* TOP HEADER */}
      <div className="px-2 sm:px-3 lg:px-4 py-2 bg-white border-b border-[#f3dce8] shrink-0">
        <h1 className="text-lg font-bold p-2">Messages</h1>
      </div>

      {/* MAIN AREA - HEIGHT FULL */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* LEFT - SECTION */}
        <div className="w-[300px] lg:w-[340px] shrink-0 h-full bg-white border-r border-[#f3dce8] overflow-hidden">
          <MessageUsers />
        </div>

        {/* RIGHT - SECTION */}
      
        <div
          className={`${
            userId ? "flex" : "hidden sm:flex"
          } flex-1 h-full items-center justify-center bg-gradient-to-br from-[#fffafd] via-white to-[#faf5ff] `}
        >
          {" "}
          {userId ? (
  <Chat userId={userId} />
) : (
  <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full shadow-lg bg-white flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-11 h-11 object-contain"
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Your messages</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 max-w-sm mx-auto">
              Select a conversation to start chatting with your friends and
              family.
            </p>
            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-[#F58529] via-[#FF2D55] to-[#C900A8]" />
            <p className="mt-5 text-xs text-slate-400">
              Stay connected • Share moments • Keep chatting
            </p>
          </div>)}
        </div>
        </div>
    </div>
  );
};

export default Messages;
