import React, { useState } from "react";
import { ArrowLeft, Sparkle, Text, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleCreateStory = async () => {};
  

  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-black/80 backdrop-blur-sm text-white flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal */}
      <div className="w-full max-w-md py-4">
        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="text-white p-2 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>

          <h2 className="text-lg font-semibold">Create Story</h2>

          <span className="w-10"></span>
        </div>

        {/* -------------------------------- */}
        {/* Story Preview */}
        {/* -------------------------------- */}
        <div
          className="rounded-lg h-96 flex items-center justify-center relative overflow-hidden"
          style={{
            backgroundColor: mode === "text" ? background : "#111827",
          }}
        >
          {/* TEXT MODE */}
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white placeholder-white/60 w-full h-full p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {/* MEDIA MODE */}
          {mode === "media" && previewUrl && (
            <>
              {media?.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Story Preview"
                  className="max-h-full  object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-full object-contain"
                />
              )}
            </>
          )}
        </div>

        {/* -------------------------------- */}
        {/* Background Colors */}
        {/* -------------------------------- */}
        {mode === "text" && (
          <div className="flex gap-2 mt-3">
            {bgColors.map((color) => (
              <button
                key={color}
                onClick={() => setBackground(color)}
                className={`w-4 h-4 rounded-full cursor-pointer border ${
                  background === color
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                    : ""
                }`}
                style={{
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        )}

        {/* -------------------------------- */}
        {/* Text / Photo Video Buttons */}
        {/* -------------------------------- */}
        <div className="flex gap-2 mt-4">
          {/* TEXT BUTTON */}
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "text" ? "bg-white text-black" : "bg-zinc-800 text-white"
            }`}
          >
            <Text size={18} />
            <span>Text</span>
          </button>

          {/* PHOTO / VIDEO */}
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media"
                ? "bg-white text-black"
                : "bg-zinc-800 text-white"
            }`}
          >
            <input
              onChange={(e) => {
                (handleMediaUpload(e), setMode("media"));
              }}
              type="file"
              accept="image/*,video/*"
              className="hidden"
            />

            <Upload size={18} />

            <span>Photo/Video</span>
          </label>
        </div>

        {/* -------------------------------- */}
        {/* Share Button */}
        {/* -------------------------------- */}
        <button
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: "Saving...",
              success: <p>Story added</p>,
              error: (e) => <p>{e.message}</p>,
            })
          }
          className="flex items-center justify-center gap-2 text-white
py-3 mt-4 w-full rounded bg-gradient-to-r from-pink-500 to-purple-600
hover:from-pink-600 hover:to-purple-700 active:scale-95 transition
cursor-pointer"
        >
          <Sparkle size={18} />
          Share Story
        </button>
      </div>
    
    </div>
  );
};

export default StoryModal;
