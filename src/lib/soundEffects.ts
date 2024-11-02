import { Howl } from "howler";

let isGlobalMuted = false;
let sounds: { [key: string]: Howl } | null = null; // Lazy initialization of sounds

// Initialize sounds only after a user gesture
export const initializeSounds = () => {
  if (sounds) return; // Avoid re-initializing
  sounds = {
    move: new Howl({
      src: ["/sounds/move.mp3"],
      volume: 0.5,
      mute: isGlobalMuted,
    }),
    collision: new Howl({
      src: ["/sounds/collision.mp3"],
      volume: 0.5,
      mute: isGlobalMuted,
    }),
    win: new Howl({
      src: ["/sounds/win.mp3"],
      volume: 0.5,
      mute: isGlobalMuted,
    }),
  };
};

export const playSound = (sound: "move" | "collision" | "win") => {
  if (!isGlobalMuted && sounds) {
    sounds[sound]?.play();
  }
};

export const setSoundsMute = (mute: boolean) => {
  isGlobalMuted = mute;
  if (sounds) {
    Object.values(sounds).forEach((sound) => sound.mute(mute));
  }
};

export const toggleGlobalMute = () => {
  isGlobalMuted = !isGlobalMuted;
  setSoundsMute(isGlobalMuted);
};

export const isMuted = () => isGlobalMuted;
