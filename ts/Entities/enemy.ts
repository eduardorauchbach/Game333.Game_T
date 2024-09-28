import { Helper, SoundType } from "../Generic/helper.js";
import { EnemyTemplateModule } from "./enemy-templates.js";
import { SeedControl, SeedModule } from "../Components/seed.js";
import { ProjectileControl, ProjectileModule } from "../Components/projectile.js";
import { SoundControl, SoundModule } from "../Components/sound.js";
import { Configurations } from "../config.js";
import { ParticleControl } from "../Components/particle.js";
import { FloatingTextControl, FloatingTextModule } from "../Components/floatingText.js";
import { KillableEntity } from "../Generic/entitiy.js";
import { ScoreControl, ScoreModule } from "../Control/score.js";
import { Shooter, Vector, VectorSpeed } from "../Generic/vector.js";

export interface EnemyParameters {
    template: EnemyTemplateModule.EnemyTemplate;
    position: Vector;
}

export class Enemy extends KillableEntity implements Shooter {
    public projectileVelocity: VectorSpeed;
    public projectileColor: string;
    public projectileSize: number;

    public projectileSpecialVelocity: VectorSpeed;
    public projectileSpecialColor: string;
    public projectileSpecialSize: number;

    public template: EnemyTemplateModule.EnemyTemplate;
    public planted: boolean;

    public baseSize: number = 64;
    public baseShadowSize: number = 0.65;

    private _projectileControl: ProjectileModule.ProjectileControl;
    private _seedControl: SeedModule.SeedControl;
    private _soundControl: SoundModule.SoundControl;
    private _floatingTextControl: FloatingTextModule.FloatingTextControl;
    private _scoreControl: ScoreModule.ScoreControl;

    constructor(parameters: EnemyParameters) {
        super();

        this.template = parameters.template;
        this.position = {
            x: parameters.position.x,
            y: parameters.position.y,
        };
        this.velocity = new VectorSpeed({ x: 0, y: 0 }, 0);

        this.projectileVelocity = parameters.template.projectileVelocity;
        this.projectileColor = parameters.template.projectileColor;
        this.projectileSize = parameters.template.projectileSize;

        this.planted = false;

        this.proportions.width = this.baseSize * this.template.size;
        this.proportions.height = this.baseSize * this.template.size;

        this.hp = this.template.hp;
        this.collisionTolerance = Configurations.Enemy.collisionTolerance;

        this._projectileControl = ProjectileControl;
        this._seedControl = SeedControl;
        this._soundControl = SoundControl;
        this._floatingTextControl = FloatingTextControl;
        this._scoreControl = ScoreControl;
    }

    protected _render(buffering: CanvasRenderingContext2D): void {
        if (this.template.image && this.template.imageBloom && this.template.imageBloomShadow) {
            buffering.translate(this.position.x, this.position.y);
            buffering.rotate(this.renderInformation.rotation);
            buffering.translate(-this.position.x, -this.position.y);

            const originalAlpha = buffering.globalAlpha;
            const xPosition = Helper.getCanvasPositionX(this);
            const yPosition = Helper.getCanvasPositionY(this);

            if (this.planted) {
                buffering.globalAlpha = 0.5;
                buffering.drawImage(
                    this.template.imageBloomShadow,
                    xPosition,
                    yPosition + 12,
                    this.width,
                    this.height * this.baseShadowSize
                );
                buffering.globalAlpha = originalAlpha;

                buffering.drawImage(this.template.imageBloom, xPosition, yPosition, this.width, this.height);
            } else {
                if (this.renderInformation.brightness > 0) {
                    buffering.filter = `brightness(500%)`;
                }

                buffering.drawImage(this.template.image, xPosition, yPosition, this.width, this.height);
            }
        }
    }

    protected _update(canvas: HTMLCanvasElement): void {
        let xPosition = Helper.getCanvasPositionX(this);

        if (this.velocity.x != 0) {
            if (this.velocity.x > 0) {
                if (xPosition <= canvas.width - this.width) {
                    this.position.x += this.velocity.x;
                }
            } else {
                if (xPosition >= 0) {
                    this.position.x += this.velocity.x;
                }
            }
        }

        if (this.velocity.y != 0) {
            if (this.velocity.y != 0) {
                this.position.y += this.velocity.y;
            }
        }

        this.updateHitAnimation();

        this.renderInformation.rotation += this.velocity.tilt;

        this._projectileControl.calculateEnemyHit(this);
    }

    public shoot() {
        this._projectileControl.addProjectile(this);
    }

    kill() {
        this._scoreControl.addKill();
        this._scoreControl.addScore(this.template.points);

        this._soundControl.createSoundEffect(SoundType.Explode, Configurations.Volume.enemy);
        this._floatingTextControl.addEffect(this);
        this._seedControl.addSeed(this);

        ParticleControl.createStarExplosion({
            amount: 360,
            color: this.projectileColor,
            position: this.position,
            maxSpeed: 1,
            maxRadius: 3,
            fallout: 0.03,
        });
    }
}
