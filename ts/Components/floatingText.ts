import { PivotType } from "../Generic/render.js";
import { Configurations } from "../config.js";
import { KillableControlEntity } from "../Generic/control.js";
import { Enemy } from "../Entities/enemy.js";
import { Entity } from "../Generic/entitiy.js";
import { SpeedNormalizer, Vector, VectorSpeed } from "../Generic/vector.js";
import { TextElement } from "../Ui/ui-elements.js";
import { Helper } from "../Generic/helper.js";

export module FloatingTextModule {
    interface FloatingTextParameters {
        position: Vector;
        velocity: VectorSpeed;
        color: string;
        value: number;
        size: number;
    }

    class Values {
        public static floatingTexts: Array<TextElement> = [];
    }

    export class FloatingTextControl extends KillableControlEntity<TextElement> {
        private fadeAmount: number = 0.015;

        private static _instance: FloatingTextControl | null = null;

        public static getInstance(): FloatingTextControl {
            if (!this._instance) {
                this._instance = new FloatingTextControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
        }

        public addEffect(origin: Enemy) {
            Values.floatingTexts.push(
                new TextElement({
                    position: { x: origin.position.x, y: origin.position.y - origin.height / 2 },
                    velocity: new VectorSpeed({
                        x: 0,
                        y: -origin.template.points / 500,
                    }),
                    color: "white",
                    size: 14,
                    font: "Arial",
                    pivotType: PivotType.center,
                    content: String(origin.template.points),
                    fadePerTick: this.fadeAmount,
                    fadeTime: Configurations.FloatingText.fadeTime,
                })
            );
        }

        public render(): void {
            if (this.buffering) {
                Values.floatingTexts.forEach((item) => {
                    item.render(this.buffering);
                });
            }
        }

        public update(): void {
            Values.floatingTexts.forEach((item) => {
                item.update(this.canvas, null, this.kill);
            });
        }

        public kill(element: TextElement): void {
            let index = Values.floatingTexts.findIndex((p) => element === p);
            Values.floatingTexts.splice(index, 1);
        }
    }
}

export const FloatingTextControl = FloatingTextModule.FloatingTextControl.getInstance();
