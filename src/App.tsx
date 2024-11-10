"use client";

import Game from "@/components/Game";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
    }
  }, []);

  return <Game />;
}
