
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Notifications from "./pages/Notifications";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Layout from "./pages/Layout";
import Loading from "./components/Loading";

import { useUser, useAuth } from "@clerk/react";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";

import { fetchUser } from "./features/users/usersSlice";
import { NotificationProvider } from "./context/NotificationContext";

const App = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();

        if (token) {
          dispatch(fetchUser(token));
        }
      }
    };

    fetchData();
  }, [user, getToken, dispatch]);

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <>
      <Toaster />

      {!user ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Feed />} />

              <Route
                path="/notifications"
                element={<Notifications />}
              />

              <Route
                path="/discover"
                element={<Discover />}
              />

              <Route
                path="/profile"
                element={<Profile />}
              />

              <Route
                path="/profile/:profileId"
                element={<Profile />}
              />

              <Route
                path="/create-post"
                element={<CreatePost />}
              />
            </Route>
          </Routes>
        </NotificationProvider>
      )}
    </>
  );
};

export default App;

