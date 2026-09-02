import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import Connection from "./pages/Connection";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Layout from "./pages/Layout";
import Loading from "./components/Loading";
import { useUser } from "@clerk/react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Loading />;

  return (
    <>
      <Toaster />

      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />

          <Route path="/messages" element={<Messages />} />

          <Route path="/messages/:userId" element={<Messages />} />
          <Route path="/connections" element={<Connection />} />

          <Route path="/discover" element={<Discover />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/profile/:profileId" element={<Profile />} />

          <Route path="/create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;