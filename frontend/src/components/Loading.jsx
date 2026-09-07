import React from "react";

const Loading = ({ height = "100vh" }) => {
  return (
    <div style={{ height }} className="flex items-center justify-center bg-white">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
};
export default Loading;
