import { FC, ReactNode } from "react";
import { FaHome, FaStore, FaUserCircle, FaUsers } from "react-icons/fa";

const BottomNav = () => (
  <nav className="fixed bottom-0 w-full text-white flex justify-around py-2">
    <NavButton icon={<FaHome className="h-6 w-6 text-red-500" />} text="Home" />
    <NavButton
      icon={<FaStore className="h-6 w-6 text-cyan-500" />}
      text="Market"
    />
    <NavButton
      icon={<FaUsers className="h-6 w-6 text-yellow-500" />}
      text="Friends"
    />
    <NavButton
      icon={<FaUserCircle className="h-6 w-6 text-lime-500" />}
      text="Profile"
    />
  </nav>
);

interface NavButtonProps {
  icon: ReactNode;
  text: string;
}

const NavButton: FC<NavButtonProps> = ({ icon, text }) => (
  <button className="flex flex-col gap-2 items-center rounded-lg px-6 py-4 bg-gray-800/40">
    {icon}
    <span className="text-xs">{text}</span>
  </button>
);

export default BottomNav;
