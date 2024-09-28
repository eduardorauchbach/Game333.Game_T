import { PivotType, RenderInformation } from "../Generic/render.js";
import { Configurations } from "../config.js";
import { StaticControlEntity } from "../Generic/control.js";
import { Enemy } from "../Entities/enemy.js";
import { StaticEntity } from "../Generic/entitiy.js";
import { ImageHelper, ImageType } from "../Generic/helper.js";
import { Vector } from "../Generic/vector.js";
import { EnemyTemplateControl } from "../Entities/enemy-templates.js";

export module GardenModule {
    export class GardenControl extends StaticControlEntity<Garden> {
        public garden: Garden;
        private static _instance: GardenControl | null = null;

        public static getInstance(): GardenControl {
            if (!this._instance) {
                this._instance = new GardenControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;

            this.reset();
        }

        public reset() {
            if (!this.garden) {
                this.garden = new Garden(this.canvas);
            } else {
                this.garden.reset();
            }
        }

        public addFlower(origin: Enemy) {
            this.garden.addFlower(origin);
        }

        public loadFullGarden() {
            for (let i = 0; i < 500; i++) {
                let index = Math.floor(Math.random() * (EnemyTemplateControl.enemyTemplates.length - 0.1));
                let template = EnemyTemplateControl.enemyTemplates[index];

                let current = new Enemy({
                    position: {
                        x: Math.random() * this.canvas.width,
                        y: Math.random() * this.garden.height + this.canvas.height - this.garden.height,
                    },
                    template: template,
                });

                current.planted = true;
                current.hp = 0;

                this.addFlower(current);
            }
        }

        public render(): void {
            this.garden.render(this.buffering);
        }
    }

    class RenderInformationGarden extends RenderInformation {
        public color2: string;
    }

    class Garden extends StaticEntity {
        private flowers: Array<Enemy> = [];
        private grass: Array<Vector> = [];

        public get flowerCount(): number {
            return this.flowers.length;
        }

        override renderInformation: RenderInformationGarden;

        public grassImage: HTMLImageElement;
        public grassWidth: number;
        public grassHeight: number;

        initializer() {}

        constructor(canvas: HTMLCanvasElement) {
            super();

            this.proportions.width = canvas.width;
            this.proportions.height = Configurations.Garden.height;

            this.position = {
                x: 0,
                y: canvas.height - this.height,
            };

            this.renderInformation = new RenderInformationGarden();
            this.renderInformation.color = "Green";
            this.renderInformation.color2 = "DarkGreen";
            this.renderInformation.pivotType = PivotType.origin;

            this.loadgrass(canvas);
            this.loadImage();
        }

        async loadImage() {
            this.grassImage = await ImageHelper.getImage(ImageType.Grass);
            this.grassWidth = this.grassImage.width * Configurations.Garden.scale;
            this.grassHeight = this.grassImage.height * Configurations.Garden.scale;
        }

        public reset() {
            this.flowers = [];
        }

        public addFlower(origin: Enemy) {
            this.flowers.push(origin);

            if (this.flowers.length > 500) {
                this.flowers.splice(0, 1);
            }
        }

        private loadgrass(canvas: HTMLCanvasElement): void {
            for (let i = 0; i < 200; i++) {
                this.grass.push({
                    x: Math.random() * (canvas.width + 10) - 10,
                    y: Math.random() * (this.height + 10) + canvas.height - this.height - 10,
                });
            }
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            const gradient = buffering.createLinearGradient(
                this.position.x,
                this.position.y,
                this.position.x,
                this.position.y + this.height
            );

            gradient.addColorStop(0, this.renderInformation.color);
            gradient.addColorStop(0.4, this.renderInformation.color2);

            buffering.fillStyle = gradient;

            buffering.fillRect(this.position.x, this.position.y, this.width, this.height);

            this.grass.forEach((position) => {
                if (this.grassImage) {
                    buffering.globalAlpha = 0.3;
                    buffering.drawImage(this.grassImage, position.x, position.y, this.grassWidth, this.grassHeight);
                }
            });

            this.flowers.forEach((f) => {
                f.render(buffering);
            });
        }
    }
}

export const GardenControl = GardenModule.GardenControl.getInstance();
