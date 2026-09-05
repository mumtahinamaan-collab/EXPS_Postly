
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import Loading from "../components/Loading";
import { dummyUserData, dummyPostsData } from "../assets/dummyData";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import ProfileModal from "../components/ProfileModal";
import FollowersFollowing from "../components/FollowersFollowing";

import moment from "moment";

const Profile = () => {
  const { profileId } = useParams();
  const { getToken } = useAuth();

  const [connectionTab, setConnectionTab] = useState(null);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showedit, setShowEdit] = useState(false);

  const navigate = useNavigate();

  const fetchUser = async (profileId) => {
    const token = await  getToken
    try{
        const { data } = await api.post('/users/profiles',{profileId}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data.success) {
          setUser(data.profile);
        }
        
        setPosts(data.posts);
    }
    catch (error) {
      console.error("Error fetching user data:", error);
    }
    setUser(dummyUserData);
    setPosts(dummyPostsData);
  };

  useEffect(() => {
    fetchUser();
  }, [profileId]);

  const userId = user?._id || user?.id || profileId;

  return user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl">

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Cover Photo */}
          <div className="h-44 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 md:h-56">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
            onConnectionClick={(tab) => setConnectionTab(tab)}
          />
        </div>

        {/* Tabs */}
        <div className="mt-4 sm:mt-6">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex min-w-full rounded-t-xl border-b border-gray-200 bg-white">
              {["posts", "media", "liked", "about"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex min-w-[90px] flex-1 items-center justify-center px-3 py-3 text-xs font-semibold capitalize transition-colors duration-200 cursor-pointer sm:min-w-[100px] sm:px-4 sm:py-3.5 sm:text-sm ${
                    activeTab === tab
                      ? "text-[#1877F2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-t-full after:bg-[#1877F2]"
                      : "text-gray-500 hover:text-[#1877F2] hover:bg-blue-50/50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ================= POSTS ================= */}
          {activeTab === "posts" && (
            <div className="mt-4 flex w-full flex-col items-center gap-4 sm:mt-6 sm:gap-5">

              {/* Create Post - Own Profile */}
              {!profileId && (
                <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
                  <img
                    src={user?.profile_picture || "/logo.png"}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
                  />

                  <button
                    type="button"
                    onClick={() => navigate("/create-post")}
                    className="flex-1 rounded-full bg-[#f0f2f5] px-4 py-2.5 text-left text-sm text-gray-500 transition hover:bg-[#e4e6eb] sm:px-5 sm:py-3 cursor-pointer"
                  >
                    What's on your mind?
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/create-post")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1877F2] transition hover:bg-blue-100 sm:h-11 sm:w-11 cursor-pointer"
                  >
                    📷
                  </button>
                </div>
              )}

              {/* Posts */}
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post?._id || post?.id}
                    className="w-full max-w-xl"
                  >
                    <PostCard post={post} />
                  </div>
                ))
              ) : (
                <div className="w-full max-w-xl rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No posts yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= MEDIA ================= */}
          {activeTab === "media" && (
            <div className="mt-4 grid w-full grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
              {posts
                ?.filter((post) => post?.image_urls?.length > 0)
                .map((post) => (
                  <React.Fragment key={post?._id || post?.id}>
                    {post.image_urls.map((image, index) => (
                      <Link
                        target="_blank"
                        to={image}
                        key={index}
                        className="group relative block overflow-hidden rounded-xl bg-gray-100"
                      >
                        <img
                          src={image}
                          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          alt=""
                        />

                        <p className="absolute bottom-0 right-0 rounded-tl-lg bg-black/50 px-2.5 py-1 text-[10px] text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100 sm:text-xs">
                          {moment(post?.createdAt).fromNow()}
                        </p>
                      </Link>
                    ))}
                  </React.Fragment>
                ))}
            </div>
          )}

          {/* ================= LIKES ================= */}
          {activeTab === "liked" && (
            <div className="mt-6 w-full rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                No likes yet
              </p>
            </div>
          )}

          {/* ================= ABOUT ================= */}
          {activeTab === "about" && (
            <div className="mt-4 w-full rounded-xl border border-gray-200 bg-white p-5 sm:mt-6 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900">
                About
              </h2>

              <div className="mt-5 space-y-5">

                {/* Bio */}
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Bio
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-700">
                    {user?.bio || "No bio added yet."}
                  </p>
                </div>

                {/* Profile Link */}
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Profile Link
                  </p>

                  <Link
                    to={`/profile/${userId}`}
                    className="mt-1 block break-all text-sm text-[#1877F2] hover:underline"
                  >
                    {window.location.origin}/profile/{userId}
                  </Link>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {user?.location || "No location added"}
                  </p>
                </div>

                {/* Joined */}
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Joined
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {user?.createdAt
                      ? moment(user.createdAt).format("MMMM YYYY")
                      : "Recently"}
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Followers / Following Overlay */}
      {connectionTab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={() => setConnectionTab(null)}
        >
          <div
            className="w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <FollowersFollowing
              user={user}
              initialTab={connectionTab}
              onClose={() => setConnectionTab(null)}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showedit && (
        <ProfileModal setShowEdit={setShowEdit} />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Profile;
