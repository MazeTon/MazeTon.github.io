import { HeaderProps } from "@/types/game";
import React from "react";
import { LiaVolumeOffSolid, LiaVolumeUpSolid } from "react-icons/lia";
import { TbBadge3D, TbBadge3DFilled } from "react-icons/tb";

const Header: React.FC<HeaderProps> = ({
  score,
  showSimpleMap,
  isSoundMuted,
  toggleSimpleMap,
  handleMuteToggle,
}) => {
  return (
    <header className="absolute top-0 p-2 w-full flex items-center justify-center z-20">
      <div className="absolute left-2 flex items-center">
        <img
          src={`logo.svg`}
          className="opacity-80 h-16 w-auto"
          alt="MazeTon"
        />
      </div>

      <div className="flex flex-col items-center text-lg relative font-['Tektur'] overflow-hidden w-full">
        <div className="absolute inset-0 flex items-center justify-center text-6xl text-white opacity-5 font-['Rubik_Maze']">
          {score}
        </div>
        {score} <div className="text-xs text-green-400">$MAZE</div>
      </div>

      <div className="absolute right-2 flex gap-2 items-center">
        <button
          onClick={handleMuteToggle}
          className="flex items-center text-white/20 hover:text-white/50 p-2 transition focus:outline-none"
        >
          {isSoundMuted ? (
            <LiaVolumeOffSolid className="h-10 w-12" />
          ) : (
            <LiaVolumeUpSolid className="h-10 w-12" />
          )}
        </button>

        <button
          onClick={toggleSimpleMap}
          className="flex items-center text-white/20 hover:text-white/50 p-2 transition focus:outline-none"
        >
          <span>
            {showSimpleMap ? (
              <TbBadge3D className="h-10 w-12" />
            ) : (
              <TbBadge3DFilled className="h-10 w-12" />
            )}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
