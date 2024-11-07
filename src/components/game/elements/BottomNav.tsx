import { Button } from "@/components/ui/button";
import { NavButtonProps } from "@/types/game";
import React, { FC } from "react";
import { GiMaceHead, GiMaze, GiOverkill, GiThreeFriends } from "react-icons/gi";

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const BottomNav: FC<BottomNavProps> = ({ currentView, setCurrentView }) => (
  <nav className="fixed bottom-4 w-full flex justify-around py-8 bg-none z-10">
    <NavButton
      icon={<GiMaze />}
      text="Play"
      color="text-red-500"
      active={currentView === "play"}
      onClick={() => setCurrentView("play")}
    />
    <NavButton
      icon={<GiMaceHead />}
      text="Items"
      color="text-cyan-500"
      active={currentView === "items"}
      onClick={() => setCurrentView("items")}
    />
    <NavButton
      icon={<GiThreeFriends />}
      text="Frens"
      color="text-yellow-500"
      active={currentView === "frens"}
      onClick={() => setCurrentView("frens")}
    />
    <NavButton
      icon={<GiOverkill />}
      text="Profile"
      color="text-lime-500"
      active={currentView === "profile"}
      onClick={() => setCurrentView("profile")}
    />
  </nav>
);

const NavButton: FC<NavButtonProps & { onClick: () => void }> = ({
  icon,
  text,
  color,
  onClick,
  active,
}) => (
  <Button
    onClick={onClick}
    className="flex flex-col gap-2 items-center rounded-lg px-10 py-10 !bg-transparent shadow-transparent relative overflow-hidden group/item focus:outline-none"
  >
    <div
      className={`absolute inset-0 flex items-center justify-center bg-none text-9xl ${color} ${
        active ? `opacity-30` : `opacity-10`
      } font-['Rubik_Maze']`}
    >
      - O -
    </div>
    <div
      className={`absolute inset-0 flex items-end justify-center bg-none text-xs ${color} opacity-70 font-['Tektur'] hover:font-['Rubik_Maze'] hover:text-2xl hover:items-center`}
    >
      {text}
    </div>
    {React.cloneElement(icon, {
      className: `${color} !w-12 !h-12 pointer-events-none bg-none group-hover/item:opacity-20`,
    })}
  </Button>
);

export default BottomNav;
