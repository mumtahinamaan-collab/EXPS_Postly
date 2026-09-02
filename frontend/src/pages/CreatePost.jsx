
import React, { useState } from "react";
import { dummyUserData } from "../assets/dummyData";
import toast from "react-hot-toast";
import { Image, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {};

  const user = dummyUserData;
  const navigate = useNavigate();

  const bgColors = [
  "#6b7280", // Gray
  "#9ca3af", // Light Gray
  "#1e40af", // Blue
  "#4f46e5", // Indigo
  "#6d28d9", // Violet
  "#7c3aed", // Purple
  "#be185d", // Pink
  "#db2777", // Rose Pink
  "#b91c1c", // Red
  "#e11d48", // Crimson
  "#a16207", // Yellow/Brown
  "#ca8a04", // Golden
  "#0f766e", // Teal
  "#0d9488", // Cyan Teal
];

  const [background, setBackground] = useState(bgColors[0]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

      {/* Popup Card */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Top Heading */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">

          <div className="w-8"></div>

          <h2 className="text-lg font-semibold text-gray-900">
            Create Post
          </h2>

          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-4">

          {/* User Header */}
          <div className="flex items-center gap-3">

            <img
              src={user?.profile_picture}
              alt=""
              className="w-12 h-12 rounded-full shadow object-cover"
            />

            <div>
              <h2 className="font-semibold text-gray-900">
                {user?.full_name}
              </h2>

              <p className="text-sm text-gray-500">
                @{user?.username}
              </p>
            </div>

          </div>

          {/* Text Area */}
          <textarea
            className="w-full resize-none min-h-32 max-h-40 text-sm outline-none rounded-xl p-4 transition text-white placeholder-white/60"
            style={{
              backgroundColor: background,
            }}
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Background Colors */}
          <div className="flex items-center gap-3">

            <span className="text-sm text-gray-500">
              Background
            </span>

            {bgColors.map((color) => (
              <button
                key={color}
                onClick={() => setBackground(color)}
                className={`w-5 h-5 rounded-full cursor-pointer border border-gray-300 ${
                  background === color
                    ? "ring-2 ring-gray-800 ring-offset-2"
                    : ""
                }`}
                style={{
                  backgroundColor: color,
                }}
              />
            ))}

          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">

              {images.map((image, i) => (
                <div
                  key={i}
                  className="relative group"
                >

                  <img
                    src={URL.createObjectURL(image)}
                    className="h-20 w-20 object-cover rounded-md"
                    alt=""
                  />

                  {/* Remove Image */}
                  <div
                    onClick={() =>
                      setImages(
                        images.filter(
                          (_, index) => index !== i
                        )
                      )
                    }
                    className="absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </div>

                </div>
              ))}

            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">

            {/* Add Photos */}
            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <Image className="size-6" />
              <span>Add Photos</span>
            </label>

            {/* Hidden Input */}
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setImages([
                  ...images,
                  ...e.target.files,
                ])
              }
            />

            {/* Post Button */}
            <button
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "Uploading ...",
                  success: <p>Post Added</p>,
                  error: <p>Post Not Added</p>,
                })
              }
              disabled={loading}
              className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatePost;

