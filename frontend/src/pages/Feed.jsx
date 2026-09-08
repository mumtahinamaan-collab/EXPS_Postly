import React, { useState, useEffect } from "react";
import { dummyPostsData } from "../assets/dummyData";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import { useAuth } from "@clerk/react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/posts/feed/", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setFeeds(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 flex justify-center bg-gray-50">
      <div className="w-full max-w-2xl">
      
        <div className="flex flex-col gap-4">
          {feeds.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdated={(updatedPost) => {
                setFeeds((prevFeeds) =>
                  prevFeeds.map((item) =>
                    item.id === updatedPost.id ? updatedPost : item,
                  ),
                );
              }}
            />
          ))}
        </div>
     
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
