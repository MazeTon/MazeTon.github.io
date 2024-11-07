// Frens.tsx

import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState } from "react";
import { FaUserFriends, FaUserPlus } from "react-icons/fa";

interface FrensProps {
  userId: string;
  initData: string;
}

interface Referral {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
}

const Frens: React.FC<FrensProps> = ({ userId, initData }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
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
            action: "ref",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setReferrals(data.referrals || []);
      } else {
        console.error("Error fetching referrals:", data.error);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  }, [initData]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const referralLink = `https://t.me/MazeTonBot/app?startapp=id${userId}`;

  return (
    <div className="flex flex-col items-center justify-start h-full w-full text-white p-4 mt-20">
      <h2 className="text-2xl font-bold mb-4 text-yellow-500">
        Invite Friends
      </h2>
      <p className="text-sm mb-2">Your referral link:</p>
      <div className="flex items-center w-full max-w-md mb-2">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="bg-gray-800 text-white p-2 rounded-l w-full text-sm focus:outline-none opacity-90 bg-teal-700/10 shadow-md"
        />
        <Button
          onClick={() => navigator.clipboard.writeText(referralLink)}
          className="rounded-l-none text-sm hover:opacity-90 bg-teal-700/10 shadow-md"
        >
          Copy
        </Button>
      </div>
      <h3 className="text-base font-semibold mt-4 mb-2 flex items-center">
        <FaUserFriends className="mr-2" /> Your Referrals
      </h3>
      {loading ? (
        <p className="text-sm">Loading referrals...</p>
      ) : referrals && referrals.length > 0 ? (
        <ul className="w-full max-w-md">
          {referrals.map((referral) => (
            <li
              key={referral.userId}
              className="flex items-center space-x-2 bg-gray-800/50 p-2 rounded mb-2"
            >
              <FaUserPlus className="text-xl" />
              <span className="text-sm">
                {referral.firstName} {referral.lastName}{" "}
                {referral.username && `(@${referral.username})`}
                ID {referral.userId}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm">You have no referrals yet.</p>
      )}
    </div>
  );
};

export default Frens;
