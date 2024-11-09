import ta from "@/tonapi";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import React, { useCallback, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

interface ProfileProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any; // Replace with the appropriate type
  initData: string;
}

const Profile: React.FC<ProfileProps> = ({ userData, initData }) => {
  const [maze, setMaze] = useState("0");
  const rawAddress = useTonAddress(false); // Get raw address
  const connectedAddressString = useTonAddress();

  useEffect(() => {
    if (!connectedAddressString) {
      setMaze("0");
      return;
    }

    ta.accounts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .getAccountJettonsBalances(connectedAddressString as any)
      .then((res) => {
        if (res && res.balances) {
          let balance = "0";
          res.balances.map((j) => {
            if (j && j.jetton && j.balance && j.jetton.name === "MAZE") {
              balance = j.balance.toString();
            }
          });
          if (balance !== "0") {
            setMaze(balance);
          }
        }
      })
      .catch((err) => console.error(err.message || "Failed to fetch jettons"));
  }, [connectedAddressString]);

  const saveAddressToDatabase = useCallback(
    async (address: string) => {
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
                tonAddress: address,
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Error saving address:", data.error);
          window.Telegram.WebApp.showAlert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error saving address:", error);
        window.Telegram.WebApp.showAlert("An unexpected error occurred.");
      }
    },
    [initData]
  );

  useEffect(() => {
    if (rawAddress) {
      saveAddressToDatabase(rawAddress);
    }
  }, [rawAddress, saveAddressToDatabase]);

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
      <div className="flex flex-col items-center my-6">
        <p>
          <div className="text-green-400">$MAZE</div>: {maze} tokens
        </p>
      </div>
      <TonConnectButton />
    </div>
  );
};

export default Profile;
