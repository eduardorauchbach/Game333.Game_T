import { Configurations } from "../config.js";
import { ControlEntity } from "../Generic/control.js";
import { Entity } from "../Generic/entitiy.js";
import { Helper, SoundType } from "../Generic/helper.js";
import { PivotType } from "../Generic/render.js";
import { SoundControl, SoundModule } from "../Components/sound.js";
import { TextElement } from "../Ui/ui-elements.js";
import { SpeedNormalizer, VectorSpeed } from "../Generic/vector.js";

export module CountdownModule {
    export class CountdownControl extends ControlEntity<Countdown> {
        //Controls overlap in cooldowns to not kill the new one
        public activekill: boolean = false;

        private countdown: Countdown;
        private static _instance: CountdownControl | null = null;

        public static getInstance(): CountdownControl {
            if (!this._instance) {
                this._instance = new CountdownControl();
            }
            return this._instance;
        }

        public get exists() {
            return this.countdown != null;
        }

        public run() {
            if (this.countdown) {
                this.countdown.run();
            }
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
        }

        public createCountdown(parameters: CountdownParameters) {
            this.activekill = false;
            this.countdown = new Countdown(parameters);
        }

        public update(): void {
            this.countdown.update(this.canvas);
        }

        public render(): void {
            this.countdown.render(this.buffering);
        }

        public kill() {
            if (this.activekill) {
                this.countdown = null;
            }
        }
    }

    export interface CountdownParameters {
        duration: number;
        event: Function;
        beginMessage: string;
        finalMessage: string;
        paused: boolean;
    }

    class Countdown extends Entity {
        private duration: number;
        private current: number;
        private second: number;
        private lastTime: number;
        private beginMessage: string;
        private finalMessage: string;
        private event: Function;
        private paused: boolean;

        private text: TextElement;

        private _soundControl: SoundModule.SoundControl;

        constructor(parameters: CountdownParameters) {
            super();

            this.duration = parameters.duration + 1;
            this.current = this.duration;

            this.second = 1000;
            this.lastTime = 0;
            this.beginMessage = parameters.beginMessage;
            this.finalMessage = parameters.finalMessage;
            this.event = parameters.event;
            this.paused = parameters.paused;

            this.text = new TextElement({
                position: { x: Helper.getCanvasCenterX(), y: Helper.getCanvasCenterY() },
                velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                color: "white",
                size: 150,
                font: "Brush Script MT",
                pivotType: PivotType.center,
                content: () => this.getContent(),
                fadePerTick: 0,
                fadeTime: 0,
            });

            this._soundControl = SoundControl;
        }

        public run() {
            this.paused = false;
        }

        protected _update(): void {
            if (!this.paused) {
                const currentTime = performance.now();
                const deltaTime = currentTime - this.lastTime;

                if (deltaTime < this.second || this.current == 0) {
                    if (Number.isInteger(this.current)) {
                        this.text.size -= 2;
                    } else {
                        this.text.size -= 0.5;
                    }
                    this.text.renderInformation.opacity -= 0.02;
                } else {
                    this._soundControl.createSoundEffect(SoundType.EnemyShoot, 0.3);

                    this.text.size = 150;
                    this.text.renderInformation.opacity = 1;

                    this.current--;
                    this.lastTime = currentTime;

                    if (this.current == 0) {
                        this.kill();
                    }
                }
            }
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            this.text.render(buffering);
        }

        private getContent() {
            if (this.paused) {
                return this.beginMessage;
            } else if (this.current > 0) {
                return this.current.toString();
            } else {
                return this.finalMessage;
            }
        }

        public kill() {
            CountdownControl.getInstance().activekill = true;

            setTimeout(() => {
                this.event();
            }, Configurations.Countdown.eventDelay);
            setTimeout(() => {
                CountdownControl.getInstance().kill();
            }, Configurations.Countdown.killDelay);
        }

        public callEvent(): void {
            this.event();
        }
    }
}

export const CountdownControl = CountdownModule.CountdownControl.getInstance();
