import {
  ConnectedWallet,
  TonConnectButton,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import React, { useCallback, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

interface ProfileProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any; // Replace with the appropriate type
  initData: string;
}

const Profile: React.FC<ProfileProps> = ({ userData, initData }) => {
  const [tonAddress, setTonAddress] = useState(userData.tonAddress || "");
  const [tonConnectUI] = useTonConnectUI();

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
    const handleConnection = (status: ConnectedWallet | null) => {
      if (status?.account) {
        const address = status.account.address;
        setTonAddress(address);
        saveAddressToDatabase(address);
      } else {
        setTonAddress("");
      }
    };

    const wallet = tonConnectUI.wallet;

    // Check if the wallet is of type ConnectedWallet
    if (wallet && "account" in wallet) {
      handleConnection(wallet as ConnectedWallet);
    } else {
      handleConnection(null);
    }

    tonConnectUI.onStatusChange((status) => {
      if (status && "account" in status) {
        handleConnection(status as ConnectedWallet);
      } else {
        handleConnection(null);
      }
    });
  }, [tonConnectUI, saveAddressToDatabase]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
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
      <div className="w-full max-w-md text-center my-4">
        <p className="block text-sm mb-1">TON Address:</p>
        {tonAddress ? (
          <p className="bg-gray-800 text-white p-2 rounded text-sm opacity-90 bg-teal-700/10 shadow-md">
            {formatAddress(tonAddress)}
          </p>
        ) : (
          <p className="text-gray-500">Not connected</p>
        )}
      </div>
      <TonConnectButton />
    </div>
  );
};

export default Profile;
