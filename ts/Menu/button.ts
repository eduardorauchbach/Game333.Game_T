import { Proportions, RenderInformation } from "../Generic/render.js";
import { KillableControlEntity } from "../Generic/control.js";
import { Entity } from "../Generic/entitiy.js";
import { Helper, SoundType } from "../Generic/helper.js";
import { SoundControl, SoundModule } from "../Components/sound.js";
import { Vector } from "../Generic/vector.js";

export module ButtonModule {
    export interface ButtonParameters {
        position: Vector;
        size: Proportions;
        content: string;
        color: string;
        colorFocus: string;
        fontColor: string;
        fontColorFocus: string;
        event: Function;
    }

    class Values {
        public static buttons: Array<Button> = [];
    }

    export class ButtonControl extends KillableControlEntity<Button> {
        private static _instance: ButtonControl | null = null;

        public static getInstance(): ButtonControl {
            if (!this._instance) {
                this._instance = new ButtonControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
        }

        public addButton(parameters: ButtonParameters) {
            Values.buttons.push(new Button(parameters));
        }

        public render(): void {
            if (this.buffering) {
                Values.buttons.forEach((item) => {
                    item.render(this.buffering);
                });
            }
        }

        public update(event: MouseEvent): void {
            Values.buttons.forEach((item) => {
                item.update(this.canvas, event);
            });
        }

        public click(): void {
            Values.buttons.forEach((item) => {
                item.click();
            });
        }

        public kill(): void {
            Values.buttons = [];
        }
    }

    class RenderInformationButton extends RenderInformation {
        public colorFocus: string;
        public fontColor: string;
        public fontColorFocus: string;
    }

    export class Button extends Entity {
        public renderInformation: RenderInformationButton;
        public content: string;
        public event: Function;
        public isFocus: boolean;

        private _soundControl: SoundModule.SoundControl;

        constructor(parameters: ButtonParameters) {
            super();

            this.position = parameters.position;
            this.proportions.width = parameters.size.width;
            this.proportions.height = parameters.size.height;
            this.content = parameters.content;
            this.renderInformation.color = parameters.color;
            this.renderInformation.colorFocus = parameters.colorFocus;
            this.renderInformation.fontColor = parameters.fontColor;
            this.renderInformation.fontColorFocus = parameters.fontColorFocus;
            this.event = parameters.event;
            this.isFocus = false;

            this._soundControl = SoundControl;
        }

        public _render(buffering: CanvasRenderingContext2D) {
            buffering.fillStyle = this.isFocus
                ? this.renderInformation.color
                : this.renderInformation.colorFocus;
            buffering.fillRect(
                Helper.getCanvasPositionX(this),
                Helper.getCanvasPositionY(this),
                this.width,
                this.height
            );

            buffering.fillStyle = this.isFocus
                ? this.renderInformation.fontColor
                : this.renderInformation.fontColorFocus;
            buffering.font = "600 16px Arial";
            buffering.textAlign = "center";

            buffering.fillText(this.content, this.position.x, this.position.y + 4);
        }

        public _update(canvas: HTMLCanvasElement, event: MouseEvent) {
            if (canvas !== null) {
                const offsetX = event.offsetX * (canvas.width / canvas.parentElement.offsetWidth);
                const offsetY = event.offsetY * (canvas.height / canvas.parentElement.offsetHeight);

                let oldFocus = this.isFocus;

                this.isFocus =
                    offsetX >= this.position.x - this.width / 2 &&
                    offsetX <= this.position.x + this.width / 2 &&
                    offsetY >= this.position.y - this.height / 2 &&
                    offsetY <= this.position.y + this.height / 2;

                if (this.isFocus && !oldFocus) {
                    this._soundControl.createSoundEffect(SoundType.Select, 0.4);
                }
            }
        }

        public click() {
            if (this.isFocus) {
                this.isFocus = false;
                this.event();
            }
        }
    }
}

export const ButtonControl = ButtonModule.ButtonControl.getInstance();
