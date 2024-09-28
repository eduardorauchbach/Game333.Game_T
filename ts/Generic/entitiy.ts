import { PivotType, Proportions, RenderInformation } from "./render.js";
import { Configurations } from "../config.js";
import { Helper } from "./helper.js";
import { Vector, VectorSpeed } from "./vector.js";

export abstract class StaticEntity {
    public position: Vector;
    public proportions: Proportions;

    public get height(): number {
        return this.proportions.height;
    }
    public get width(): number {
        return this.proportions.width;
    }

    public renderInformation: RenderInformation;

    protected constructor() {
        this.renderInformation = new RenderInformation();
        this.position = { x: 0, y: 0 };
        this.proportions = { width: 0, height: 0 };
    }

    public render(buffering: CanvasRenderingContext2D): void {
        buffering.restore(); //Prevent cross storing

        buffering.save(); //Save buffer current configuration
        this._render(buffering);
        buffering.restore(); //Restore the buffering configuration

        if (Configurations.Debug.static && !(this instanceof KillableEntity)) {
            buffering.save();

            buffering.translate(this.position.x, this.position.y);
            buffering.rotate(this.renderInformation.rotation);
            buffering.translate(-this.position.x, -this.position.y);

            buffering.strokeStyle = "Cyan";
            buffering.lineWidth = 1;
            buffering.strokeRect(
                this.renderInformation.pivotType == PivotType.center
                    ? Helper.getCanvasPositionX(this)
                    : this.position.x,
                this.renderInformation.pivotType == PivotType.center
                    ? Helper.getCanvasPositionY(this)
                    : this.position.y,
                this.proportions.width,
                this.proportions.height
            );

            buffering.restore();
        }
    }

    protected abstract _render(buffering: CanvasRenderingContext2D): void;
}

export abstract class Entity extends StaticEntity {
    public velocity: VectorSpeed;

    public update(
        canvas: HTMLCanvasElement,
        mouseEvent: MouseEvent | null = null,
        killEvent: Function | null = null
    ): void {
        this._update(canvas, mouseEvent, killEvent);
    }

    protected abstract _update(
        canvas: HTMLCanvasElement,
        mouseEvent: MouseEvent | null,
        killEvent: Function | null
    ): void;
}

export abstract class KillableEntity extends Entity {
    public collisionTolerance: number;
    public hp: number;
    private hitTiming: number;
    //Possible to have an array of projectile collision history

    protected constructor() {
        super();

        this.hp = 1;
        this.hitTiming = 0;
        this.collisionTolerance = 0;
    }

    public registerHit(damage: number, flashCount: number = null, ignoreInvulnerability: boolean = false) {
        //Is invulnerability hit? if not
        if (this.hitTiming == 0 || ignoreInvulnerability) {
            this.hp -= damage;

            if (flashCount) {
                this.hitTiming = flashCount * 2;
            }
        }
    }

    public override render(buffering: CanvasRenderingContext2D) {
        super.render(buffering);

        if (Configurations.Debug.killable) {
            let strokeColor: string = null;
            if (this.hp > 0) {
                if (this.velocity.baseY < 0) {
                    strokeColor = "Lime";
                } else {
                    strokeColor = "Magenta";
                }
            } else if (this.hp <= 0 && Configurations.Debug.asset) {
                strokeColor = "White";
            }

            if (strokeColor) {
                buffering.save();

                buffering.strokeStyle = strokeColor;
                buffering.lineWidth = 1;
                buffering.strokeRect(
                    this.renderInformation.pivotType == PivotType.center
                        ? Helper.getCanvasPositionX(this, this.collisionTolerance)
                        : this.position.x,
                    this.renderInformation.pivotType == PivotType.center
                        ? Helper.getCanvasPositionY(this, this.collisionTolerance)
                        : this.position.y,
                    this.proportions.width - this.collisionTolerance * 2,
                    this.proportions.height - this.collisionTolerance * 2
                );

                buffering.fillStyle = strokeColor;
                for (let i = 0; i < this.hp; i++) {
                    buffering.fillRect(
                        Helper.getCanvasPositionX(this, this.collisionTolerance) + i * 6,
                        Helper.getCanvasPositionY(this, this.collisionTolerance) - 6,
                        3,
                        4
                    );
                }

                buffering.restore();
            }
        }
    }

    public updateHitAnimation() {
        if (this.hitTiming > 0) {
            if (this.hitTiming % 2 == 0) {
                this.renderInformation.brightness = 1;
            } else {
                this.renderInformation.brightness = 0;
            }

            this.hitTiming--;
        } else if (this.renderInformation.brightness > 0) {
            this.renderInformation.brightness = 0;
        }
    }

    public isDead(killEnabled: boolean, outOfBoundsEnabled: boolean = false): boolean {
        let noHp = this.hp <= 0;
        let outOfBounds = false;

        if (!noHp && outOfBoundsEnabled) {
            outOfBounds = Helper.outOfBounds(this.position);
        }

        const isDead = noHp || outOfBounds;
        if (isDead && killEnabled) {
            this.kill(!outOfBounds);
        }

        return isDead;
    }

    public abstract kill(emitParticles: boolean): void;
}
