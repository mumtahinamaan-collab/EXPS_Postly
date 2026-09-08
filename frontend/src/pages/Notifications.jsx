
import React, { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trash2,
} from "lucide-react";

import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";
import Loading from "../components/Loading";
import { useNotifications } from "../context/NotificationContext";

const Notifications = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const {
    decreaseUnreadCount,
    fetchUnreadCount,
  } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) return;

      const { data } = await api.get("/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        toast.error(
          data.message || "Unable to load notifications",
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load notifications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // ==================================================
  // MARK NOTIFICATION AS READ
  // ==================================================

  const markAsRead = async (notification) => {
    if (notification.is_read) return;

    try {
      const token = await getToken();

      const { data } = await api.patch(
        `/notifications/${notification.id}/read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item,
          ),
        );

        decreaseUnreadCount();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update notification",
      );
    }
  };

  // ==================================================
  // DELETE NOTIFICATION
  // ==================================================

  const deleteNotification = async (id) => {
    try {
      const token = await getToken();

      const notificationToDelete = notifications.find(
        (item) => item.id === id,
      );

      const { data } = await api.delete(
        `/notifications/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        setNotifications((prev) =>
          prev.filter((item) => item.id !== id),
        );

        if (
          notificationToDelete &&
          !notificationToDelete.is_read
        ) {
          decreaseUnreadCount();
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete notification",
      );
    }
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (date) => {
    const created = new Date(date);
    const now = new Date();

    const seconds = Math.floor(
      (now - created) / 1000,
    );

    if (seconds < 60) {
      return "just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return created.toLocaleDateString();
  };

  // ==================================================
  // NOTIFICATION CLICK
  // ==================================================

  const handleNotificationClick = async (
    notification,
  ) => {
    const type = notification.notification_type;

    await markAsRead(notification);

    // FOLLOW
    if (type === "follow") {
      if (notification.actor?.id) {
        navigate(
          `/profile/${notification.actor.id}`,
        );
      }

      return;
    }

    // LIKE / COMMENT
    if (
      type === "like" ||
      type === "comment"
    ) {
      if (
        notification.post_id &&
        notification.actor?.id
      ) {
        navigate( `/post/${notification.post_id}` );
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-4 py-6 md:px-8">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
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

        {/* NOTIFICATIONS */}
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

              <p className="text-sm text-gray-500 mt-1 text-center">
                When someone interacts with you,
                you'll see it here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const type =
                notification.notification_type;

              return (
                <div
                  key={notification.id}
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    p-4
                    border-b
                    border-gray-100
                    last:border-b-0
                    transition
                    ${
                      !notification.is_read
                        ? "bg-purple-50/60"
                        : "bg-white"
                    }
                    hover:bg-gray-50
                  `}
                >
                  {/* PROFILE IMAGE */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification,
                        )
                      }
                      className="block"
                    >
                      {notification.actor
                        ?.profile_picture ? (
                        <img
                          src={
                            notification.actor
                              .profile_picture
                          }
                          alt={
                            notification.actor
                              ?.full_name ||
                            notification.actor
                              ?.username ||
                            "User"
                          }
                          className="
                            w-11
                            h-11
                            rounded-full
                            object-cover
                            border
                            border-gray-200
                          "
                        />
                      ) : (
                        <div
                          className="
                            w-11
                            h-11
                            rounded-full
                            bg-gray-200
                            flex
                            items-center
                            justify-center
                            text-gray-500
                            font-semibold
                          "
                        >
                          {(
                            notification.actor
                              ?.full_name ||
                            notification.actor
                              ?.username 

                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </button>

                    {/* TYPE ICON */}
                    <div
                      className="
                        absolute
                        -bottom-1
                        -right-1
                        w-5
                        h-5
                        rounded-full
                        bg-white
                        border
                        border-gray-100
                        flex
                        items-center
                        justify-center
                        shadow-sm
                      "
                    >
                      {type === "like" && (
                        <Heart
                          size={11}
                          className="
                            text-red-500
                            fill-red-500
                          "
                        />
                      )}

                      {type === "comment" && (
                        <MessageCircle
                          size={11}
                          className="text-blue-500"
                        />
                      )}

                      {type === "follow" && (
                        <UserPlus
                          size={11}
                          className="text-purple-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <button
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification,
                      )
                    }
                    className="
                      flex-1
                      text-left
                      min-w-0
                    "
                  >
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">
                        {notification.actor
                          ?.username ||
                          notification.actor
                            ?.full_name ||
                          "Someone"}
                      </span>{" "}

                      {type === "follow" &&
                        "started following you."}

                      {type === "like" &&
                        "liked your post."}

                      {type === "comment" &&
                        "commented on your post."}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(
                        notification.created_at,
                      )}
                    </p>
                  </button>

                  {/* UNREAD DOT */}
                  {!notification.is_read && (
                    <div
                      className="
                        w-2
                        h-2
                        rounded-full
                        bg-purple-500
                        shrink-0
                      "
                    />
                  )}

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      deleteNotification(
                        notification.id,
                      );
                    }}
                    className="
                      opacity-0
                      group-hover:opacity-100
                      p-2
                      rounded-full
                      hover:bg-red-50
                      transition
                      shrink-0
                    "
                    title="Delete"
                  >
                    <Trash2
                      size={17}
                      className="
                        text-gray-400
                        hover:text-red-500
                      "
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

