import { isMuted } from "@/lib/backgroundMusic"; // Import the global mute state
import { Howl } from "howler";

const sounds = {
  move: new Howl({ src: ["/sounds/move.mp3"], volume: 0.5, mute: isMuted() }),
  collision: new Howl({
    src: ["/sounds/collision.mp3"],
    volume: 0.5,
    mute: isMuted(),
  }),
  win: new Howl({ src: ["/sounds/win.mp3"], volume: 0.5, mute: isMuted() }),
};

export const playSound = (sound: keyof typeof sounds) => {
  if (!isMuted()) {
    sounds[sound]?.play();
  }
};

export const setSoundsMute = (mute: boolean) => {
  Object.values(sounds).forEach((sound) => sound.mute(mute));
};
