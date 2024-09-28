import { Entity } from "../Generic/entitiy.js";
import { Game } from "../game.js";
import { Helper, ImageHelper, ImageType } from "../Generic/helper.js";
import { PivotType } from "../Generic/render.js";

export module LoadingModule {
    export class LoadingControl {
        public loading: Loading;

        private canvas: HTMLCanvasElement;
        private buffering: CanvasRenderingContext2D;
        private static _instance: LoadingControl | null = null;

        public static getInstance() {
            if (!this._instance) {
                this._instance = new LoadingControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.loading = new Loading();

            this.canvas = canvas;
            this.buffering = buffering;
        }

        public update() {
            this.loading.update(this.canvas);
        }

        public render() {
            this.loading.render(this.buffering);
        }

        public activate() {
            this.loading.activate();
        }

        public inactivate() {
            this.loading.inactivate();
        }
    }

    export class Loading extends Entity {
        private _opacityIncreasing: boolean;
        private _enabled: boolean;

        constructor() {
            super();

            this.position = { x: Game.canvas.width - 30, y: 30 };
            this.proportions.height = 30;
            this.proportions.width = 30;
            this.renderInformation.pivotType = PivotType.center;
            this.renderInformation.opacity = 0.3;
            this.renderInformation.rotation = 0;
            this._opacityIncreasing = true;
            this._enabled = false;
        }

        public get isEnabled(): boolean {
            return this._enabled;
        }

        protected async _render(buffering: CanvasRenderingContext2D) {
            const xPosition = Helper.getCanvasPositionX(this);
            const yPosition = Helper.getCanvasPositionY(this);

            buffering.translate(this.position.x, this.position.y);
            buffering.rotate(this.renderInformation.rotation);
            buffering.translate(-this.position.x, -this.position.y);
            buffering.globalAlpha = this.renderInformation.opacity;

            buffering.drawImage(
                await ImageHelper.getImage(ImageType.Invader08),
                xPosition,
                yPosition,
                this.height,
                this.width
            );
        }

        protected _update(canvas: HTMLCanvasElement): void {
            if (this._enabled) {
                const tilt = 0.05;
                this.renderInformation.rotation += tilt;

                if (this._opacityIncreasing) {
                    this.renderInformation.opacity += 0.01;
                    if (this.renderInformation.opacity >= 1) {
                        this._opacityIncreasing = false;
                    }
                } else {
                    this.renderInformation.opacity -= 0.01;
                    if (this.renderInformation.opacity <= 0.3) {
                        this._opacityIncreasing = true;
                    }
                }
            }
        }

        public activate() {
            this._enabled = true;
        }

        public inactivate() {
            this._enabled = false;
        }
    }
}

export const LoadingControl = LoadingModule.LoadingControl.getInstance();
