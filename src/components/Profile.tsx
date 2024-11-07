// Profile.tsx

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaSave, FaUserCircle } from "react-icons/fa";

interface ProfileProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any; // Replace with the appropriate type
  initData: string;
}

const Profile: React.FC<ProfileProps> = ({ userData, initData }) => {
  const [tonAddress, setTonAddress] = useState(userData.tonAddress || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleTonAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTonAddress(e.target.value);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        "https://d2xcq5opb5.execute-api.us-east-1.amazonaws.com/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: initData,
            action: "update",
            updateData: {
              tonAddress: tonAddress,
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Success, update the local userData if necessary
        console.log("Profile updated");
      } else {
        console.error("Error updating profile:", data.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full w-full text-white p-4 mt-20">
      <h2 className="text-2xl font-bold mb-4 text-lime-500">Your Profile</h2>
      <div className="flex flex-col items-center">
        {userData.photoUrl ? (
          <img
            src={userData.photoUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full mb-2"
          />
        ) : (
          <FaUserCircle className="text-6xl mb-2" />
        )}
        <p className="text-sm mb-1">
          {userData.firstName || `Anonymous`} {userData.lastName}
        </p>
        <p className="text-sm mb-4">@{userData.username || `anonymous`}</p>
      </div>
      <div className="w-full max-w-md">
        <label htmlFor="tonAddress" className="block text-sm mb-1">
          TON Address:
        </label>
        <input
          id="tonAddress"
          type="text"
          value={tonAddress}
          onChange={handleTonAddressChange}
          className="bg-gray-800 text-white p-2 rounded w-full text-sm focus:outline-none opacity-90 bg-teal-700/10 shadow-md"
        />
      </div>
      <Button
        onClick={handleSaveProfile}
        className="mt-4 text-sm flex items-center focus:outline-none hover:opacity-90 opacity-80 bg-teal-700/10 shadow-md"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Profile"}
        <FaSave className="ml-2" />
      </Button>
    </div>
  );
};

export default Profile;
