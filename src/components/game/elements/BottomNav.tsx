import { Button } from "@/components/ui/button";
import { NavButtonProps } from "@/types/game";
import React, { FC } from "react";
import { GiMaceHead, GiMaze, GiOverkill, GiThreeFriends } from "react-icons/gi";

const BottomNav = () => (
  <nav className="fixed bottom-4 w-full flex justify-around py-8 bg-none">
    <NavButton icon={<GiMaze />} text="Play" color="text-red-500" />
    <NavButton icon={<GiMaceHead />} text="Items" color="text-cyan-500" />
    <NavButton icon={<GiThreeFriends />} text="Frens" color="text-yellow-500" />
    <NavButton icon={<GiOverkill />} text="Profile" color="text-lime-500" />
  </nav>
);

const NavButton: FC<NavButtonProps> = ({ icon, text, color }) => (
  <Button className="flex flex-col gap-2 items-center rounded-lg px-8 py-10 !bg-transparent shadow-transparent relative overflow-hidden group/item focus:outline-none">
    <div
      className={`absolute inset-0 flex items-center justify-center bg-none text-9xl ${color} opacity-10 font-['Rubik_Maze']`}
    >
      &nbsp;0&nbsp;
    </div>
    <div
      className={`absolute inset-0 flex items-end justify-center bg-none text-xs ${color} opacity-70 font-['Tektur'] hover:font-['Rubik_Maze'] hover:text-2xl hover:items-center`}
    >
      {text}
    </div>
    {React.cloneElement(icon, {
      className: `${color} !w-10 !h-10 pointer-events-none bg-none group-hover/item:opacity-20`,
    })}
  </Button>
);

export default BottomNav;
