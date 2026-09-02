
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { dummyUserData, dummyPostsData } from "../assets/dummyData";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import moment from "moment";
import ProfileModal from "../components/ProfileModal";

const Profile = () => {
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showedit, setShowEdit] = useState(false);

  const navigate = useNavigate();

  const fetchUser = async () => {
    setUser(dummyUserData);
    setPosts(dummyPostsData);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Cover Photo */}
          <div className="h-44 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        {/* Tabs */}
        <div className="mt-4 sm:mt-6">

          {/* Tab Navigation */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex min-w-full border-b border-gray-200 bg-white rounded-t-xl">

              {["posts", "media", "likes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex min-w-[100px] flex-1 items-center justify-center px-3 py-3 text-xs font-semibold capitalize transition-colors duration-200 cursor-pointer sm:px-4 sm:py-3.5 sm:text-sm ${
                    activeTab === tab
                      ? "text-[#1877F2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1877F2] after:rounded-t-full"
                      : "text-gray-500 hover:text-[#1877F2] hover:bg-blue-50/50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}

            </div>
          </div>

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="mt-4 flex w-full flex-col items-center gap-4 sm:mt-6 sm:gap-5">

              {/* Create Post - Only Own Profile */}
              {!profileId && (
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3">

                  {/* Profile Picture */}
                  <img
                    src={user?.profile_picture}
                    alt=""
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
                  />

                  {/* Create Post Input */}
                  <button
                    onClick={() => navigate("/create-post")}
                    className="flex-1 text-left bg-[#f0f2f5] hover:bg-[#e4e6eb] transition rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm text-gray-500 cursor-pointer"
                  >
                    What's on your mind?
                  </button>

                  {/* Photo Button */}
                  <button
                    onClick={() => navigate("/create-post")}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1877F2] flex items-center justify-center transition cursor-pointer shrink-0"
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
                <div className="w-full max-w-xl bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No posts yet
                  </p>
                </div>
              )}

            </div>
          )}

          {/* Media */}
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

                        <p
                          className="
                            absolute bottom-0 right-0
                            rounded-tl-lg
                            bg-black/50
                            px-2.5 py-1
                            text-[10px] text-white
                            opacity-0
                            backdrop-blur-md
                            transition duration-300
                            group-hover:opacity-100
                            sm:text-xs
                          "
                        >
                          {moment(post?.createdAt).fromNow()}
                        </p>

                      </Link>
                    ))}

                  </React.Fragment>
                ))}

            </div>
          )}

          {/* Likes */}
          {activeTab === "likes" && (
            <div className="mt-6 w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">
                No likes yet
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Modal */}
      {showedit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <p className="font-semibold">
              Edit Profile
            </p>

            <button
              onClick={() => setShowEdit(false)}
              className="mt-4 text-sm text-[#1877F2]"
            >
              Close
            </button>

          </div>

        </div>
      )}
      {showedit && (
        <ProfileModal
          setShowEdit={setShowEdit}
        />
      )}

    </div>
  ) : (
    <Loading />
  );
};

export default Profile;

