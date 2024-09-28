import { PivotType, Proportions } from "../Generic/render.js";
import { Entity, StaticEntity } from "../Generic/entitiy.js";
import { Helper, ImageHelper, ImageType } from "../Generic/helper.js";
import { PlayerControl, PlayerModule } from "../Entities/player.js";
import { SpeedNormalizer, Vector, VectorSpeed } from "../Generic/vector.js";
import { Game } from "../game.js";

export interface TextParameters {
    position: Vector;
    velocity: VectorSpeed;
    color: string;
    size: number;
    font: string;
    rotation?: number;
    pivotType: PivotType;
    content: String | Function;

    fadePerTick?: number;
    fadeTime?: number;

    breathingPerTick?: number;
    breathingMinOpacity?: number;

    pulsatingPerTick?: number;
    pulsatingMaxSize?: number;
}

export class TextElement extends Entity {
    public content: String | Function;
    public size: number;
    public originalSize: number;
    public font: string;

    public fade: boolean;
    private fadePerTick: number;
    private fadeSpeed: SpeedNormalizer;

    private breathingPerTick: number;
    private breathingMinOpacity: number;
    private breathingIncrease: boolean;

    private pulsatingPerTick: number;
    private pulsatingMaxSize: number;
    private pulsatingIncrease: boolean;

    constructor(parameters: TextParameters) {
        super();

        this.position = parameters.position;
        this.velocity = parameters.velocity;

        this.renderInformation.color = parameters.color;
        this.content = parameters.content;
        this.size = parameters.size;
        this.originalSize = parameters.size;
        this.font = parameters.font;
        this.renderInformation.pivotType = parameters.pivotType;
        this.renderInformation.rotation = parameters.rotation ?? 0;

        this.fade = false;
        this.fadePerTick = parameters.fadePerTick ?? 0;
        this.fadeSpeed = new SpeedNormalizer(parameters.fadeTime ?? 0);

        this.breathingPerTick = parameters.breathingPerTick ?? 0;
        this.breathingMinOpacity = parameters.breathingMinOpacity ?? 1;
        this.breathingIncrease = true;

        this.pulsatingPerTick = parameters.pulsatingPerTick ?? 0;
        this.pulsatingMaxSize = parameters.pulsatingMaxSize ?? 0;
        this.pulsatingIncrease = true;
    }

    protected _render(buffering: CanvasRenderingContext2D): void {
        buffering.translate(this.position.x, this.position.y);
        buffering.rotate(this.renderInformation.rotation);
        buffering.translate(-this.position.x, -this.position.y);

        buffering.font = `600 ${this.size}px ${this.font}`;
        buffering.fillStyle = this.renderInformation.color;

        const currentContent = (this.content instanceof Function ? this.content() : this.content).toString();

        this.proportions = this.measureText(buffering, currentContent, this.font);

        buffering.globalAlpha = this.renderInformation.opacity > 0 ? this.renderInformation.opacity : 0;
        buffering.textAlign = this.renderInformation.pivotType == PivotType.center ? "center" : "left";
        buffering.fillText(
            currentContent,
            this.position.x,
            this.renderInformation.pivotType == PivotType.center
                ? Helper.getCanvasPositionY(this) + this.height * 0.95
                : this.position.y + this.height
        );
    }

    protected _update(canvas: HTMLCanvasElement, mouseEvent: null, killEvent: Function): void {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.fade) {
            this.renderInformation.opacity -= this.fadePerTick;
            if (this.renderInformation.opacity <= 0 && killEvent) {
                killEvent(this);
            }
        } else if (this.fadePerTick > 0) {
            setTimeout(() => {
                this.fade = true;
            }, this.fadeSpeed.value);
        } else {
            this.updateBreathEffect();
        }

        this.updatePulseEffect();
    }

    private updatePulseEffect(): void {
        if (this.pulsatingPerTick > 0) {
            if (this.pulsatingIncrease) {
                this.size += this.pulsatingPerTick;
                if (this.size >= this.pulsatingMaxSize) {
                    this.pulsatingIncrease = false;
                }
            } else {
                this.size -= this.pulsatingPerTick;
                if (this.size < this.originalSize) {
                    this.pulsatingIncrease = true;
                }
            }
        }
    }

    private updateBreathEffect(): void {
        if (this.breathingPerTick > 0) {
            if (this.breathingIncrease) {
                this.renderInformation.opacity += this.breathingPerTick;
                if (this.renderInformation.opacity >= 1) {
                    this.renderInformation.opacity = 1;
                    this.breathingIncrease = false;
                }
            } else {
                this.renderInformation.opacity -= this.breathingPerTick;
                if (this.renderInformation.opacity < this.breathingMinOpacity) {
                    this.renderInformation.opacity = this.breathingMinOpacity;
                    this.breathingIncrease = true;
                }
            }
        }
    }

    private measureText(buffering: CanvasRenderingContext2D, text: string, font: string): Proportions {
        buffering.font = font;

        const metrics = buffering.measureText(text);

        const width = metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        return { width, height };
    }
}

export interface LifeBarParameters {
    position: Vector;
    size: number;
}

export class LifeBar extends StaticEntity {
    private _playerControl: PlayerModule.PlayerControl;

    constructor(parameters: LifeBarParameters) {
        super();

        this.position = parameters.position;
        this.proportions.height = parameters.size;
        this.renderInformation.pivotType = PivotType.origin;
        this._playerControl = PlayerControl;
    }

    protected _render(buffering: CanvasRenderingContext2D): void {
        const currentPoints = this._playerControl.player.currentHp;

        this.proportions.width = currentPoints * this.height - 0.2;
        for (let i = 0; i < this._playerControl.player.currentHp; i++) {
            buffering.drawImage(
                this._playerControl.player.animation.image,
                this.position.x + i * this.height,
                this.position.y,
                this.height * 0.8,
                this.height
            );
        }
    }
}

export interface SpecialBarParameters {
    position: Vector;
    proportions: Proportions;
}

export class SpecialBar extends StaticEntity {
    private _playerControl: PlayerModule.PlayerControl;

    constructor(parameters: SpecialBarParameters) {
        super();

        this.position = parameters.position;
        this.proportions = parameters.proportions;
        this.renderInformation.pivotType = PivotType.origin;
        this._playerControl = PlayerControl;
    }

    protected _render(buffering: CanvasRenderingContext2D): void {
        const cooldownTime = this._playerControl.player.projectileSpecialInterval.value;
        const currentTime = cooldownTime - (Date.now() - this._playerControl.player.projectileSpecialLastShot);
        let percentage = currentTime / cooldownTime;
        percentage = percentage > 0 ? percentage : 0;

        // Calculate the fill width based on the percentage
        const fillWidth = this.proportions.width * percentage;

        // Calculate the starting X-coordinate for the fill
        const fillX = this.position.x + this.proportions.width - fillWidth;

        buffering.fillStyle = "white"; // Background color
        buffering.fillRect(this.position.x, this.position.y, this.proportions.width, this.proportions.height);

        buffering.fillStyle = "darkgray"; // Fill color for the cooldown portion
        buffering.fillRect(fillX, this.position.y, fillWidth, this.proportions.height);
    }
}
