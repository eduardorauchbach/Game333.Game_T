import { PivotType } from "../Generic/render.js";
import { Configurations } from "../config.js";
import { ControlEntity } from "../Generic/control.js";
import { Entity } from "../Generic/entitiy.js";
import { Helper } from "../Generic/helper.js";
import { ParticleModule } from "./particle.js";
import { VectorSpeed } from "../Generic/vector.js";

export module BackgroundModule {
    class Values {
        public static stars: Array<Star> = [];
    }

    export class BackgroundControl extends ControlEntity<Background> {
        public background: Background;
        private static _instance: BackgroundControl | null = null;

        public static getInstance(): BackgroundControl {
            if (!this._instance) {
                this._instance = new BackgroundControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
            this.initializeBackground();
        }

        public initializeBackground() {
            if (!this.background) {
                this.background = new Background(this.canvas);
            }
        }

        public render(): void {
            this.background.render(this.buffering);
        }
        public update(): void {
            this.background.update(this.canvas);
        }
    }

    class Background extends Entity {
        private _startLimit: number;

        constructor(canvas: HTMLCanvasElement) {
            super();

            this.position = {
                x: 0,
                y: 0,
            };

            this.velocity = new VectorSpeed({ x: 0, y: 0.5 });

            this._startLimit = 100;

            this.proportions.width = canvas.width;
            this.proportions.height = canvas.height - Configurations.Garden.height;

            this.renderInformation.color = "black";
            this.renderInformation.pivotType = PivotType.origin;

            this.fillStars(canvas);
        }

        private fillStars(canvas: HTMLCanvasElement): void {
            for (let i = 0; i < 100; i++) {
                Values.stars.push(
                    new Star({
                        position: {
                            x: Math.random() * canvas.width,
                            y: Math.random() * canvas.height,
                        },
                        radius: Math.random(),
                        velocity: this.velocity,
                        color: "white",
                        fallout: 0,
                    })
                );
            }
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            buffering.fillStyle = this.renderInformation.color;
            buffering.fillRect(this.position.x, this.position.y, this.width, this.height);

            Values.stars.forEach((e) => {
                e.render(buffering);
            });
        }

        protected _update(canvas: HTMLCanvasElement): void {
            Values.stars.forEach((e) => {
                e.update(canvas);
                if (Helper.outOfBounds(e.position)) {
                    e.kill();
                }
            });

            if (this._startLimit > Values.stars.length) {
                Values.stars.push(
                    new Star({
                        position: {
                            x: Math.random() * canvas.width,
                            y: 1,
                        },
                        radius: Math.random(),
                        velocity: this.velocity,
                        color: "white",
                        fallout: 0,
                    })
                );
            }
        }
    }

    class Star extends ParticleModule.Particle {
        public override kill() {
            let index = Values.stars.findIndex((p) => p === this);
            Values.stars.splice(index, 1);
        }
    }
}

export const BackgroundControl = BackgroundModule.BackgroundControl.getInstance();
