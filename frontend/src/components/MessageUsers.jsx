import React, { useEffect, useState } from "react";
import { dummyRecentMessagesData } from "../assets/dummyData";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

const MessageUsers = () => {
  const navigate = useNavigate();
  const { userId } = useParams(); 
  const [messages, setMessages] = useState([]);
  

  const fetchRecentMessagesData = async () => {
    setMessages(dummyRecentMessagesData);
  };

  useEffect(() => {
    fetchRecentMessagesData();
  }, []);

  return (
    <div className="w-full h-full shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-3">

        <div className="flex flex-col gap-1">
          {messages.map((message, index) => {
            const isActive = userId === message.from_user_id._id;
            return (
              <div
                key={message._id || index}
                onClick={() => navigate(`/messages/${message.from_user_id._id}`)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive
                   ? "bg-[#e7f3ff] border border-[#d0e3ff]"
                    : "border border-transparent hover:bg-gray-100"
                }`}
              >
                <img
                  src={message.from_user_id.profile_picture}
                  alt={message.from_user_id.full_name}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-center w-full">
                    <p className="text- font-semibold text-slate-900 truncate">
                      {message.from_user_id.full_name}
                    </p>
                    <p className="text- text-slate-400 shrink-0 ml-2">
                      {moment(message.createdAt).fromNow()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center w-full mt-0.5">
                    <p className="text- text-slate-500 truncate pr-2">
                      {message.text? message.text : "📷 Media"}
                    </p>

                    {!message.seen? (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#1877F2] text-white text- font-bold flex items-center justify-center">
                        1
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageUsers;