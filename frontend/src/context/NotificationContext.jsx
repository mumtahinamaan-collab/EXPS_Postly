import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";

import api from "../api/axios";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { getToken } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  // ==================================================
  // PREPARE NOTIFICATION SOUND
  // ==================================================

  useEffect(() => {
    const audio = new Audio("/sounds/notification.mp3");

    audio.preload = "auto";
    audio.volume = 0.7;

    audioRef.current = audio;

    const unlockAudio = () => {
      if (audioUnlockedRef.current) {
        return;
      }

      const currentAudio = audioRef.current;

      if (!currentAudio) {
        return;
      }

      currentAudio
        .play()
        .then(() => {
          currentAudio.pause();
          currentAudio.currentTime = 0;

          audioUnlockedRef.current = true;
        })
        .catch(() => {
          // Browser may still block audio.
        });
    };

    window.addEventListener("click", unlockAudio, { once: true });

    window.addEventListener("touchstart", unlockAudio, { once: true });

    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockAudio);

      window.removeEventListener("touchstart", unlockAudio);

      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // ==================================================
  // PLAY NOTIFICATION SOUND
  // ==================================================

  const playNotificationSound = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = 0;

    audio
      .play()
      .then(() => {
        audioUnlockedRef.current = true;
      })
      .catch(() => {
        // Browser blocked audio.
      });
  }, []);

  // ==================================================
  // FETCH UNREAD COUNT
  // ==================================================

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const { data } = await api.get("/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // Keep notification errors silent.
    }
  }, [getToken]);

  // ==================================================
  // WEBSOCKET
  // ==================================================

  useEffect(() => {
    let socket;
    let cancelled = false;

    const connectWebSocket = async () => {
      try {
        const token = await getToken();

        if (!token || cancelled) {
          return;
        }

        const apiBaseUrl = import.meta.env.VITE_BASEURL;

        const httpUrl = apiBaseUrl.replace(/\/api\/?$/, "");

        const wsUrl = httpUrl
          .replace(/^https:\/\//, "wss://")
          .replace(/^http:\/\//, "ws://");

        socket = new WebSocket(
          `${wsUrl}/ws/notifications/?token=${encodeURIComponent(token)}`,
        );
        socket.onopen = () => {
          fetchUnreadCount();
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type !== "notification" || !data.notification) {
              return;
            }

            setUnreadCount((prev) => prev + 1);

            // 🔊 PLAY NOTIFICATION SOUND
            playNotificationSound();

            toast.success(
              data.notification.message || "You have a new notification",
            );
          } catch {
            // Ignore invalid WebSocket messages.
          }
        };

        socket.onclose = () => {
          if (cancelled) {
            return;
          }

          setTimeout(() => {
            if (!cancelled) {
              connectWebSocket();
            }
          }, 3000);
        };
      } catch {
        // Keep connection errors silent.
      }
    };

    connectWebSocket();

    return () => {
      cancelled = true;

      if (socket) {
        socket.close();
      }
    };
  }, [getToken, playNotificationSound]);

  // ==================================================
  // INITIAL COUNT
  // ==================================================

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // ==================================================
  // MARK AS READ
  // ==================================================

  const decreaseUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        fetchUnreadCount,
        decreaseUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
};
