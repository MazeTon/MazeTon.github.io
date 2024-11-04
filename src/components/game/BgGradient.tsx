import { useEffect, useState } from "react";

const BgGradient = () => {
  const [gradient, setGradient] = useState("");

  const generateVeryDarkGradient = () => {
    const randomDarkTone = () =>
      `rgba(${Math.floor(Math.random() * 50)}, ${Math.floor(
        Math.random() * 50
      )}, ${Math.floor(Math.random() * 50)}, 1)`;

    const angle = Math.floor(Math.random() * 360);
    const gradient = `linear-gradient(${angle}deg, ${randomDarkTone()}, ${randomDarkTone()}, ${randomDarkTone()})`;
    setGradient(gradient);
  };

  useEffect(() => {
    generateVeryDarkGradient();
  }, []);

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{
        background: gradient,
      }}
    ></div>
  );
};

export default BgGradient;
