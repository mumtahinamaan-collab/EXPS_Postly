import React, { useEffect, useState } from "react";
import { dummyStoriesData } from "../assets/dummyData";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";
const StoriesBar = () => {
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(false);

  const fetchStories = async () => {
    setStories(dummyStoriesData);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-4 pb-5 ">
        <div
          onClick={() => setShowModal(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-orange-300 bg-white"
        >
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="size-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mb-3 shadow">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-black text-center">
              Create Story
            </p>
          </div>
        </div>
        {stories.map((story, index) => (
          <div
            key={index}
            onClick={() => setViewStory(story)}
            className="relative rounded-xl min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-200 overflow-hidden border border-orange-300  active:scale-95"
          >
            {" "}
            <img
              src={story.media_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-white/90"></div>
            <div className="absolute top-3 left-3 z-10 p-[2px] rounded-full bg-gradient-to-br from-orange-500 to-pink-600 shadow">
              <img
                src={story.user.profile_picture}
                alt=""
                className="size-7 rounded-full border-2 border-white object-cover"
              />
            </div>
            <p className="absolute top-14 left-3 text-white text-xs font-medium truncate max-w-24 z-10">
              {story.content}
            </p>
            <p className="text-white/80 absolute bottom-2 right-2 z-10 text- font-medium">
              {moment(story.createdAt).fromNow()}
            </p>
            {story.media_type !== "text" && (
              <div
                className="absolute inset-0 z-1 rounded-lg
bg-black overflow-hidden"
              >
                {story.media_type === "image" ? (
                  <img
                    src={story.media_url}
                    alt=""
                    className="h-full
  w-full object-cover hover:scale-110 transition
  duration-500 opacity-70 hover:opacity-80"
                  />
                ) : (
                  <video
                    src={story.media_url}
                    className="h-full w-full
  object-cover hover:scale-110 transition duration-500
  opacity-70 hover:opacity-80"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Story Modal */}
      {showModal && (
        <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />
      )}

      {/* View Story Viewer Modal */}
      {viewStory && (
        <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />
      )}
    </div>
  );
};

export default StoriesBar;
