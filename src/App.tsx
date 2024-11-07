"use client";

import Game from "@/components/Game";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      // Initialize the Web App
      tg.ready();
      // Log info and app version
      console.log("initDataUnsafe:", tg.initDataUnsafe);
      // initDataUnsafe:
      //   {
      //     "user": {
      //       "allows_write_to_pm": true,
      //       "first_name": "ㅤ",
      //       "id": 7055854755,
      //       "language_code": "en",
      //       "last_name": ""
      //     },
      //     "chat_instance": "-7800461913948032394",
      //     "chat_type": "private",
      //     "auth_date": "1730919161",
      //     "hash": "8dca2b162e4bd49ce23c7a4e2f8e4752bfa6ed4851abbc458ed4922f15b5af34",
      //     "start_param": "ref234"
      //   }
      console.log("initData:", tg.initData);
      // initData: user=%7B%22id%22%3A7055854755%2C%22first_name%22%3A%22%E3%85%A4%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=-7800461913948032394&chat_type=private&auth_date=1730919898&hash=1fbcc2ff871389817a1637829174d57a936c7734bc209f55cdaf8ef68b9fce39
    }
  }, []);

  return <Game />;
}
