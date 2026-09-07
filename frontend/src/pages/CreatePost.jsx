
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Image, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/react";
import api from "../api/axios";

const MAX_IMAGE_SIZE = 50 * 1024; // 50 KB

const CreatePost = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bgColors = [
    "#6b7280",
    "#9ca3af",
    "#1e40af",
    "#4f46e5",
    "#6d28d9",
    "#7c3aed",
    "#be185d",
    "#db2777",
    "#b91c1c",
    "#e11d48",
    "#a16207",
    "#ca8a04",
    "#0f766e",
    "#0d9488",
  ];

  const [background, setBackground] = useState(bgColors[0]);

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Please add at least one image or some text");
      return;
    }

    const oversizedImage = images.find(
      (image) => image.size > MAX_IMAGE_SIZE
    );

    if (oversizedImage) {
      toast.error(
        `"${oversizedImage.name}" is larger than 50 KB. Please choose a smaller image.`
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("content", content);
      formData.append("background_color", background);

      if (content.trim() && images.length > 0) {
        formData.append("post_type", "text_with_image");
      } else if (images.length > 0) {
        formData.append("post_type", "image");
      } else {
        formData.append("post_type", "text");
        
      }

      images.forEach((image) => {
        formData.append("images", image);
      });

      const token = await getToken();

      const { data } = await api.post(
        "/posts/add/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Post could not be created."
        );
      }

      toast.success("Post added successfully!");

      setContent("");
      setImages([]);

      navigate("/profile");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Post could not be added."
      );
    } finally {
      setLoading(false);

    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="w-8"></div>

          <h2 className="text-lg font-semibold text-gray-900">
            Create Post
          </h2>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">

          {/* User */}
          <div className="flex items-center gap-3">
            <img
              src={user?.profile_picture || "/logo.png"}
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

          {/* Text */}
          <textarea
            className="w-full resize-none min-h-32 max-h-40 text-sm outline-none rounded-xl p-4 transition text-white placeholder-white/60"
            style={{ backgroundColor: background }}
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Background colors */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-500">
              Background
            </span>

            {bgColors.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => setBackground(color)}
                className={`w-5 h-5 rounded-full cursor-pointer border border-gray-300 ${
                  background === color
                    ? "ring-2 ring-gray-800 ring-offset-2"
                    : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Image previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  className="relative group"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-20 w-20 object-cover rounded-md"
                    alt=""
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) =>
                        prev.filter(
                          (_, imageIndex) =>
                            imageIndex !== index
                        )
                      )
                    }
                    className="absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">

            {/* Image picker */}
            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <Image className="size-6" />
              <span>Add Photos</span>
            </label>

            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const selectedFiles = Array.from(
                  e.target.files || []
                );

                const validFiles = selectedFiles.filter(
                  (file) => file.size <= MAX_IMAGE_SIZE
                );

                const rejectedFiles = selectedFiles.filter(
                  (file) => file.size > MAX_IMAGE_SIZE
                );

                if (rejectedFiles.length > 0) {
                  toast.error(
                    "Each image must be 50 KB or smaller."
                  );
                }

                setImages((prev) => [
                  ...prev,
                  ...validFiles,
                ]);

                e.target.value = "";
              }}
            />

            {/* Post button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>

          {/* Size info */}
          <p className="text-xs text-gray-400 text-center">
            Maximum image size: 50 KB per image
          </p>

        </div>
      </div>
    </div>
  );
};

export default CreatePost;

