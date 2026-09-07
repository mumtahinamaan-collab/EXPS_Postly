import React, { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  Trash2,
} from "lucide-react";

import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";
import Loading from "../components/Loading";


const Notifications = () => {

  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);


  const fetchNotifications = async () => {

    try {

      setLoading(true);

      const token = await getToken();

      const { data } = await api.get(
        "/notifications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {

        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);

      } else {

        toast.error(
          data.message || "Unable to load notifications"
        );

      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to load notifications"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchNotifications();

  }, []);


  const markAsRead = async (notification) => {

    if (notification.is_read) {
      return;
    }

    try {

      const token = await getToken();

      const { data } = await api.post(
        `/notifications/${notification.id}/read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item
          )
        );

        setUnreadCount((prev) =>
          Math.max(prev - 1, 0)
        );

      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to update notification"
      );

    }
  };


  const markAllAsRead = async () => {

    if (unreadCount === 0) {
      return;
    }

    try {

      const token = await getToken();

      const { data } = await api.post(
        "/notifications/read-all/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {

        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            is_read: true,
          }))
        );

        setUnreadCount(0);

      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to mark notifications"
      );

    }
  };


  const deleteNotification = async (id) => {

    try {

      const token = await getToken();

      const { data } = await api.delete(
        `/notifications/${id}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {

        const deletedNotification =
          notifications.find(
            (item) => item.id === id
          );

        setNotifications((prev) =>
          prev.filter(
            (item) => item.id !== id
          )
        );

        if (
          deletedNotification &&
          !deletedNotification.is_read
        ) {
          setUnreadCount((prev) =>
            Math.max(prev - 1, 0)
          );
        }

      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to delete notification"
      );

    }
  };


  const getIcon = (type) => {

    if (type === "like") {
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <Heart
            size={20}
            className="text-red-500 fill-red-500"
          />
        </div>
      );
    }

    if (type === "comment") {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <MessageCircle
            size={20}
            className="text-blue-500"
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
        <UserPlus
          size={20}
          className="text-purple-500"
        />
      </div>
    );
  };


  const formatTime = (date) => {

    const created = new Date(date);
    const now = new Date();

    const seconds = Math.floor(
      (now - created) / 1000
    );

    if (seconds < 60) {
      return "just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return created.toLocaleDateString();
  };


  const handleNotificationClick = async (
    notification
  ) => {

    await markAsRead(notification);

    if (notification.type === "follow") {

      navigate(
        `/profile/${notification.actor.id}`
      );

      return;
    }

    if (
      notification.type === "like" ||
      notification.type === "comment"
    ) {

      if (notification.post_id) {
        navigate(
          `/post/${notification.post_id}`
        );
      }
    }
  };


  if (loading) {
    return <Loading />;
  }


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">

      <div className="max-w-3xl mx-auto">

        {/* Header */}

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center">

              <Bell
                size={21}
                className="text-white"
              />

            </div>

            <div>

              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Notifications
              </h1>

              <p className="text-sm text-gray-500">
                Stay updated with your activity
              </p>

            </div>

          </div>


          {unreadCount > 0 && (

            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
            >

              <CheckCheck size={17} />

              <span className="hidden sm:block">
                Mark all as read
              </span>

            </button>

          )}

        </div>


        {/* Notification list */}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

          {notifications.length === 0 ? (

            <div className="py-20 flex flex-col items-center justify-center">

              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">

                <Bell
                  size={28}
                  className="text-gray-400"
                />

              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                No notifications yet
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                When someone interacts with you,
                you'll see it here.
              </p>

            </div>

          ) : (

            notifications.map((notification) => (

              <div
                key={notification.id}
                className={`
                  group flex items-center gap-3 p-4
                  border-b border-gray-100 last:border-b-0
                  transition
                  ${
                    !notification.is_read
                      ? "bg-purple-50/60"
                      : "bg-white"
                  }
                  hover:bg-gray-50
                `}
              >

                {/* Actor */}

                <button
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  className="shrink-0"
                >

                  {notification.actor
                    ?.profile_picture ? (

                    <img
                      src={
                        notification.actor
                          .profile_picture
                      }
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />

                  ) : (

                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">

                      {notification.actor
                        ?.username
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}

                    </div>

                  )}

                </button>


                {/* Content */}

                <button
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  className="flex-1 text-left min-w-0"
                >

                  <div className="flex items-center gap-3">

                    <div className="shrink-0">

                      {getIcon(
                        notification.type
                      )}

                    </div>


                    <div className="min-w-0">

                      <p className="text-sm text-gray-800">

                        <span className="font-semibold">
                          {notification.actor
                            ?.username ||
                            notification.actor
                              ?.full_name ||
                            "Someone"}
                        </span>{" "}

                        {notification.type ===
                          "follow" &&
                          "started following you."}

                        {notification.type ===
                          "like" &&
                          "liked your post."}

                        {notification.type ===
                          "comment" &&
                          "commented on your post."}

                      </p>


                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(
                          notification.created_at
                        )}
                      </p>

                    </div>

                  </div>

                </button>


                {/* Unread indicator */}

                {!notification.is_read && (

                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />

                )}


                {/* Delete */}

                <button
                  onClick={() =>
                    deleteNotification(
                      notification.id
                    )
                  }
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-50 transition shrink-0"
                  title="Delete"
                >

                  <Trash2
                    size={17}
                    className="text-gray-400 hover:text-red-500"
                  />

                </button>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
};

export default Notifications;