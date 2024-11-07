// Items.tsx

import React from "react";
import { FaAppleAlt } from "react-icons/fa";
import { GiBananaBunch } from "react-icons/gi";

interface ItemsProps {
  items: string[];
}

const itemIcons: { [key: string]: JSX.Element } = {
  apple: <FaAppleAlt />,
  banana: <GiBananaBunch />,
};

const Items: React.FC<ItemsProps> = ({ items }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-white p-4">
      <h2 className="text-2xl font-bold mb-4 text-cyan-500">Your Items</h2>
      {items && items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center space-x-2 bg-gray-800 p-2 rounded"
            >
              <div className="text-2xl">{itemIcons[item] || "🍀"}</div>
              <span className="text-sm capitalize">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm">You have no items yet.</p>
      )}
    </div>
  );
};

export default Items;
