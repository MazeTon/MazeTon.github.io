import React from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { FaMapLocationDot, FaRegMap } from "react-icons/fa6";

interface HeaderProps {
  score: number;
  showMiniMap: boolean;
  isSoundMuted: boolean;
  toggleMiniMap: () => void;
  handleMuteToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  score,
  showMiniMap,
  isSoundMuted,
  toggleMiniMap,
  handleMuteToggle,
}) => {
  return (
    <header className="absolute top-0 w-full flex justify-between items-center p-4 text-white z-10">
      <div className="text-2xl font-bold tracking-widest">MazeTon</div>
      <div className="flex flex-col items-center text-lg font-semibold bg-gray-800/60 px-4 py-2 rounded-lg shadow-md">
        {score} <div className="text-xs text-gray-500">$MAZE</div>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleMiniMap}
          className="flex items-center space-x-2 text-white bg-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-700 transition"
        >
          <span>
            {showMiniMap ? (
              <FaMapLocationDot className="h-10 w-12" />
            ) : (
              <FaRegMap className="h-10 w-12" />
            )}
          </span>
        </button>

        <button
          onClick={handleMuteToggle}
          className="flex items-center text-white bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-700 transition"
        >
          {isSoundMuted ? (
            <FaVolumeMute className="h-10 w-12" />
          ) : (
            <FaVolumeUp className="h-10 w-12" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
