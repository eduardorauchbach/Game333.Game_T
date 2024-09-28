import { ControlEntity } from "../Generic/control.js";
import { Entity } from "../Generic/entitiy.js";
import { Helper } from "../Generic/helper.js";
import { Vector, VectorSpeed } from "../Generic/vector.js";

export module ParticleModule {
    interface ExplosionParameters {
        position: Vector;
        maxSpeed: number;
        maxRadius: number;
        color: string;
        fallout: number;
        amount: number;
    }

    interface ParticleParameters {
        position: Vector;
        velocity: VectorSpeed;
        radius: number;
        color: string;
        fallout: number;
    }

    class Values {
        public static particles: Array<Particle> = [];
    }

    export class ParticleControl extends ControlEntity<Particle> {
        private static _instance: ParticleControl | null = null;

        public static getInstance(): ParticleControl {
            if (!this._instance) {
                this._instance = new ParticleControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
        }

        public createExplosion(parameters: ExplosionParameters) {
            for (let i = 0; i < parameters.amount; i++) {
                this.addParticle({
                    position: parameters.position,
                    radius: Math.random() * parameters.maxRadius,
                    velocity: this.getRadiusVelocity(parameters.maxSpeed),
                    color: parameters.color,
                    fallout: parameters.fallout,
                });
            }
        }

        public createStarExplosion(parameters: ExplosionParameters) {
            let randomRotation = Math.random() * 2 * Math.PI;

            for (let i = 0; i < parameters.amount; i++) {
                this.addParticle({
                    position: parameters.position,
                    radius: Math.random() * parameters.maxRadius,
                    velocity: this.getRadiusStartVelocity(
                        parameters.maxSpeed,
                        randomRotation
                    ),
                    color: parameters.color,
                    fallout: parameters.fallout,
                });
            }
        }

        public addParticle(parameters: ParticleParameters) {
            Values.particles.push(new Particle(parameters));
        }

        public kill(particles: Particle): void {
            particles.kill();
        }

        public render(): void {
            if (this.buffering) {
                Values.particles.forEach((item) => {
                    item.render(this.buffering);
                });
            }
        }

        public update(): void {
            Values.particles.forEach((item) => {
                item.update(this.canvas);
            });
        }

        private getRadiusVelocity(maxSpeed: number): VectorSpeed {
            let speed = Math.random() * maxSpeed;
            let angle = Math.random() * 2 * Math.PI;

            return new VectorSpeed({
                x: speed * Math.cos(angle),
                y: speed * Math.sin(angle),
            });
        }

        private getRadiusStartVelocity(maxSpeed: number, rotation: number): VectorSpeed {
            const innerRadiusFactor = -4;
            const fivePointedAngle = (2 * Math.PI) / 5;
            const smoothness = 0.1;

            let speed = Math.random() * maxSpeed;

            // Get a random angle between 0 and 2*PI
            let angle = Math.random() * 2 * Math.PI;

            // Calculate how far the angle is from the nearest star tip
            let fractionFromNearestTip = (angle % fivePointedAngle) / fivePointedAngle;

            // Interpolate between outer and inner radii
            if (fractionFromNearestTip > 0.5) {
                fractionFromNearestTip = 1 - fractionFromNearestTip;
            }
            let interpolation = 1 - smoothness * Math.sin(fractionFromNearestTip * Math.PI);

            speed = speed * (innerRadiusFactor + interpolation * (1 - innerRadiusFactor));

            let velocity = {
                x: speed * Math.cos(angle),
                y: speed * Math.sin(angle),
            };

            const cosRot = Math.cos(rotation);
            const sinRot = Math.sin(rotation);

            return new VectorSpeed({
                x: velocity.x * cosRot - velocity.y * sinRot,
                y: velocity.x * sinRot + velocity.y * cosRot,
            });
        }

        public clear() {
            Values.particles = [];
        }
    }

    export class Particle extends Entity {
        public radius: number;
        public fallout: number;

        public min: Vector;
        public max: Vector;

        constructor(parameters: ParticleParameters) {
            super();
            this.position = {
                x: parameters.position.x,
                y: parameters.position.y,
            };
            this.velocity = parameters.velocity;
            this.radius = parameters.radius;
            this.fallout = parameters.fallout;

            this.renderInformation.color = parameters.color;
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            buffering.beginPath();
            buffering.fillStyle = this.renderInformation.color;
            buffering.globalAlpha = this.renderInformation.opacity;
            buffering.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

            buffering.fill();

            buffering.globalAlpha = 1;
            buffering.closePath();
        }

        protected _update(canvas: HTMLCanvasElement): void {
            this.renderInformation.opacity -= this.fallout;

            if (this.renderInformation.opacity <= 0 || Helper.outOfBounds(this.position)) {
                this.kill();
            } else {
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
            }
        }

        public kill(): void {
            let index = Values.particles.findIndex((p) => p === this);
            Values.particles.splice(index, 1);
        }
    }
}

export const ParticleControl = ParticleModule.ParticleControl.getInstance();
