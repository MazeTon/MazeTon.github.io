import React, { FC, ReactElement } from "react";
import { GiMaceHead, GiMaze, GiOverkill, GiThreeFriends } from "react-icons/gi";

const BottomNav = () => (
  <nav className="fixed bottom-4 w-full flex justify-around py-8">
    <NavButton icon={<GiMaze />} text="Play" color="text-red-500" />
    <NavButton icon={<GiMaceHead />} text="Stuff" color="text-cyan-500" />
    <NavButton icon={<GiThreeFriends />} text="Frens" color="text-yellow-500" />
    <NavButton icon={<GiOverkill />} text="Profile" color="text-lime-500" />
  </nav>
);

interface NavButtonProps {
  icon: ReactElement;
  text: string;
  color: string;
}

const NavButton: FC<NavButtonProps> = ({ icon, text, color }) => (
  <button className="flex flex-col gap-2 items-center rounded-lg px-6 py-4 bg-gray-800/40 shadow-xl relative overflow-hidden group/item focus:outline-none">
    <div
      className={`absolute inset-0 flex items-center justify-center text-9xl ${color} opacity-5 font-['Rubik_Maze']`}
    >
      {text}
    </div>
    <div
      className={`absolute inset-0 flex items-end justify-center text-xs ${color} opacity-70 font-['Tektur'] hover:font-['Rubik_Maze'] hover:text-2xl hover:items-center`}
    >
      {text}
    </div>
    {React.cloneElement(icon, {
      className: `${color} h-10 w-10 pointer-events-none group-hover/item:opacity-20`,
    })}
  </button>
);

export default BottomNav;
