import { Configurations } from "../config.js";
import { ControlEntity } from "../Generic/control.js";
import { Enemy } from "../Entities/enemy.js";
import { GardenControl } from "./garden.js";
import { Entity } from "../Generic/entitiy.js";
import { Helper } from "../Generic/helper.js";
import { ParticleControl, ParticleModule } from "./particle.js";
import { VectorSpeed } from "../Generic/vector.js";

export module SeedModule {
    class Values {
        public static seedProjectiles: Array<Seed> = [];
    }

    export class SeedControl extends ControlEntity<Seed> {
        private static _instance: SeedControl | null = null;

        public static getInstance(): SeedControl {
            if (!this._instance) {
                this._instance = new SeedControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
        }

        public reset() {
            Values.seedProjectiles = [];
        }

        public addSeed(origin: Enemy) {
            Values.seedProjectiles.push(new Seed(origin, this.canvas));
        }

        public kill(seed: Seed, emitParticles: boolean): void {
            seed.kill(emitParticles);
        }

        public render(): void {
            if (this.buffering) {
                Values.seedProjectiles.forEach((item) => {
                    item.render(this.buffering);
                });
            }
        }

        public update(): void {
            Values.seedProjectiles.forEach((item) => {
                item.update(this.canvas);
            });
            this.checkLifeCycle();
        }

        public checkLifeCycle() {
            const gardenControl = GardenControl;
            const garden = gardenControl.garden;

            for (let pi = 0; pi < Values.seedProjectiles.length; pi++) {
                let seed = Values.seedProjectiles[pi];
                let xMin = garden.position.x;
                let xMax = xMin + garden.width;

                if (xMin <= seed.position.x && xMax >= seed.position.x) {
                    if (seed.maxY <= seed.position.y) {
                        //Reset info
                        seed.origin.velocity = new VectorSpeed({ x: 0, y: 0 });
                        seed.origin.renderInformation.rotation = Math.random() - 0.5;
                        seed.origin.position = seed.position;

                        gardenControl.addFlower(seed.origin);

                        seed.kill(true);
                    }
                }
            }
        }
    }

    class Seed extends Entity {
        public gravity: number;
        public origin: Enemy;
        public maxY: number; //Where the seed will land in Garden;

        private _particleControl: ParticleModule.ParticleControl;

        constructor(origin: Enemy, canvas: HTMLCanvasElement) {
            super();

            this.position = {
                x: origin.position.x,
                y: origin.position.y,
            };
            this.velocity = new VectorSpeed({ x: (Math.random() - 0.5) * 2, y: 1 });
            this.gravity = 1.02;

            this.renderInformation.color = "red";
            this.origin = origin;
            this.origin.planted = true;

            this._particleControl = ParticleControl;

            //Removing the possibility from the flowers to be in the extreme border
            const yMargin = Configurations.Garden.height * 0.95 * Math.random() + Configurations.Garden.height * 0.05;
            this.maxY = canvas.height - yMargin;
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            buffering.beginPath();
            buffering.fillStyle = this.renderInformation.color;
            buffering.globalAlpha = this.renderInformation.opacity;

            buffering.arc(this.position.x, this.position.y, 1.8, 0, Math.PI * 2);
            buffering.fill();

            buffering.closePath();
        }

        protected _update(): void {
            this.velocity.baseY = this.gravity * this.velocity.baseY;
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;

            if (this.maxY <= this.position.y) {
                this.position.y = this.maxY;
            }

            if (Helper.outOfBounds(this.position)) {
                this.kill(false);
            }
        }

        public kill(emitParticles: boolean): void {
            let index = Values.seedProjectiles.findIndex((p) => p === this);
            Values.seedProjectiles.splice(index, 1);

            if (emitParticles) {
                this._particleControl.createExplosion({
                    amount: 120,
                    color: this.origin.projectileColor,
                    position: this.position,
                    maxSpeed: 1,
                    maxRadius: 3,
                    fallout: 0.04,
                });
            }
        }
    }
}

export const SeedControl = SeedModule.SeedControl.getInstance();
