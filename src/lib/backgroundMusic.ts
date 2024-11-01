import { Howl } from "howler";

let isGlobalMuted = false; // Global mute state

const backgroundMusic = new Howl({
  src: ["/sounds/background-music.mp3"],
  loop: true,
  volume: 0.5,
  mute: isGlobalMuted,
});

export const playMusic = () => {
  if (!isGlobalMuted && !backgroundMusic.playing()) {
    backgroundMusic.play();
  }
};

export const pauseMusic = () => {
  if (backgroundMusic.playing()) {
    backgroundMusic.pause();
  }
};

export const setGlobalMute = (mute: boolean) => {
  isGlobalMuted = mute;
  backgroundMusic.mute(mute);
};

export const toggleGlobalMute = () => {
  isGlobalMuted = !isGlobalMuted;
  backgroundMusic.mute(isGlobalMuted);
};

export const isMuted = () => isGlobalMuted;
