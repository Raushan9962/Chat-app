import React, { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { Camera, User, Mail } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
      };
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl p-4 py-8">
        <div className="space-y-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Your profile information</p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-24 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 rounded-full bg-gray-900 p-2 transition-all duration-200 hover:scale-105 dark:bg-gray-100 ${
                  isUpdatingProfile ? "pointer-events-none animate-pulse" : "cursor-pointer"
                }`}
              >
                <Camera className="size-5 text-white dark:text-gray-900" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to upload your photo. Allowed JPG, GIF, or PNG. Max size of 800K"}
            </p>
          </div>

          {/* User Information */}
          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="size-4" />
                Full Name
              </div>
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {authUser?.fullName}
              </p>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Mail className="size-4" />
                Email Address
              </div>
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-6 rounded-xl bg-gray-50 p-6 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                <span className="text-gray-900 dark:text-white">{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                <span className="text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;