
import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../features/users/usersSlice";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";

const ProfileModal = ({ setShowEdit }) => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const userData = new FormData();

    const {
      username,
      bio,
      location,
      full_name,
      profile_picture,
      cover_photo,
    } = editForm;

    userData.append("username", username);
    userData.append("bio", bio);
    userData.append("location", location);
    userData.append("full_name", full_name);

    if (profile_picture) {
      userData.append("profile_picture", profile_picture);
    }

    if (cover_photo) {
      userData.append("cover_photo", cover_photo);
    }

    const token = await getToken();

    await dispatch(
      updateUser({
        userData,
        token,
      })
    ).unwrap();

    setShowEdit(false);
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen overflow-y-auto bg-black/50 flex items-start justify-center p-4">
      <div className="max-w-2xl w-full sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <form
            className="space-y-5"
            onSubmit={(e) =>
              toast.promise(handleSaveProfile(e), {
                loading: "Saving changes..."

              })
            }
          >

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>

              <input
                hidden
                type="file"
                accept="image/*"
                id="profile_picture"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    profile_picture: e.target.files?.[0] || null,
                  })
                }
              />

              <div className="group/profile relative w-24 h-24">
                <img
                  src={
                    editForm.profile_picture
                      ? URL.createObjectURL(editForm.profile_picture)
                      : user.profile_picture
                  }
                  alt=""
                  className="w-24 h-24 rounded-full object-cover border"
                />

                <div className="absolute hidden group-hover/profile:flex inset-0 bg-black/40 rounded-full items-center justify-center">
                  <label
                    htmlFor="profile_picture"
                    className="cursor-pointer w-full h-full flex items-center justify-center"
                  >
                    <Pencil className="w-5 h-5 text-white" />
                  </label>
                </div>
              </div>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>

              <input
                hidden
                type="file"
                accept="image/*"
                id="cover_photo"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cover_photo: e.target.files?.[0] || null,
                  })
                }
              />

              <label
                htmlFor="cover_photo"
                className="group/cover relative block w-full cursor-pointer"
              >
                <img
                  src={
                    editForm.cover_photo
                      ? URL.createObjectURL(editForm.cover_photo)
                      : user.cover_photo
                  }
                  alt=""
                  className="w-full h-48 rounded-lg object-cover bg-gray-100 border"
                />

                <div className="absolute hidden group-hover/cover:flex inset-0 bg-black/30 rounded-lg items-center justify-center">
                  <div className="bg-white/90 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Change Cover
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>

              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    full_name: e.target.value,
                  })
                }
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1877F2]"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>

              <input
                type="text"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    username: e.target.value,
                  })
                }
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1877F2]"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>

              <textarea
                rows="3"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    bio: e.target.value,
                  })
                }
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1877F2] resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>

              <input
                type="text"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    location: e.target.value,
                  })
                }
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1877F2]"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">

              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-5 py-2 border border-gray-300 cursor-pointer rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-pink-700 text-white rounded-lg text-sm font-medium hover:bg-pink-800 transition-all active:scale-95 cursor-pointer"
              >
                Save Changes
              </button>

            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;


