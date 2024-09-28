import { Configurations } from "../config.js";
import { SoundHelper, SoundType } from "../Generic/helper.js";

export module SoundModule {
    class Values {
        public static soundEffects: Array<HTMLAudioElement> = [];
        public static music: HTMLAudioElement;
    }

    export class SoundControl {
        private static _instance: SoundControl | null = null;

        private in: boolean = false;
        private out: boolean = false;

        public static getInstance(): SoundControl {
            if (!this._instance) {
                this._instance = new SoundControl();
            }
            return this._instance;
        }

        public async createSoundEffect(audio: SoundType, volume: number, startTime: number = 0) {
            let sound = await SoundHelper.getSound(audio);
            if (!sound) {
                console.error("Sound not found:", audio);
                return;
            }

            sound.volume = volume * Configurations.Volume.global;
            sound.currentTime = startTime;
            sound.play();
            sound.onended = () => {
                this.kill(sound);
            };

            Values.soundEffects.push(sound);
        }

        public async playStageSound() {
            Values.music = await SoundHelper.getSound(SoundType.BackgroundMusic);
            Values.music.currentTime = 0;
            Values.music.volume = Configurations.Volume.global * Configurations.Volume.music;
            Values.music.loop = true;
            Values.music.play();
        }

        public resumeStageSound() {
            Values.music.play();
        }

        public fadeOutMusic() {
            this.out = true;
            this.in = false;

            if (Values.music.volume > 0) {
                const amount = 0.02;
                if (Values.music.volume > amount) {
                    Values.music.volume -= amount;
                } else {
                    Values.music.volume = 0;
                }

                if (this.out) {
                    setTimeout(() => {
                        this.fadeOutMusic();
                    }, 100);
                }
            } else {
                Values.music.pause();
            }
        }

        public fadeInMusic() {
            this.in = true;
            this.out = false;

            if (Values.music.paused) {
                Values.music.play();
                this.fadeInMusic();
            } else {
                const amount = 0.02;
                const maxVolume = Configurations.Volume.global * Configurations.Volume.music;

                if (Values.music.volume < maxVolume) {
                    Values.music.volume += amount;

                    if (this.in) {
                        setTimeout(() => {
                            this.fadeInMusic();
                        }, 100);
                    }
                } else {
                    Values.music.volume = maxVolume;
                }
            }
        }

        private kill(sound: HTMLAudioElement) {
            let index = Values.soundEffects.findIndex((s) => s === sound);
            if (index !== -1) {
                Values.soundEffects.splice(index, 1);
            }
        }
    }
}

export const SoundControl = SoundModule.SoundControl.getInstance();
