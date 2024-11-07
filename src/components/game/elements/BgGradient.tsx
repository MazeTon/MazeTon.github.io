import { useRef } from "react";

const BgGradient = () => {
  const generateVeryDarkGradient = () => {
    const randomDarkTone = () =>
      `rgba(${Math.floor(Math.random() * 50)}, ${Math.floor(
        Math.random() * 50
      )}, ${Math.floor(Math.random() * 50)}, 1)`;

    const angle = Math.floor(Math.random() * 360);
    const gradient = `linear-gradient(${angle}deg, ${randomDarkTone()}, ${randomDarkTone()}, ${randomDarkTone()})`;
    return gradient;
  };

  const gradient = useRef(generateVeryDarkGradient());

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: gradient.current,
      }}
    ></div>
  );
};

export default BgGradient;
