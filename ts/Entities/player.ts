import { Helper, ImageHelper, ImageType, SoundType } from "../Generic/helper.js";
import { ProjectileControl, ProjectileModule } from "../Components/projectile.js";
import { SoundControl, SoundModule } from "../Components/sound.js";
import { Configurations } from "../config.js";
import { ParticleControl, ParticleModule } from "../Components/particle.js";
import { EventControl, EventModule } from "../Control/events.js";
import { ControlEntity } from "../Generic/control.js";
import { KillableEntity } from "../Generic/entitiy.js";
import { ScoreControl, ScoreModule } from "../Control/score.js";
import { Shooter, SpeedNormalizer, Vector, VectorSpeed } from "../Generic/vector.js";

export module PlayerModule {
    export class PlayerControl extends ControlEntity<Player> {
        public player: Player;
        private static _instance: PlayerControl | null = null;

        public static getInstance(): PlayerControl {
            if (!this._instance) {
                this._instance = new PlayerControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
            this.reset();
        }

        public reset() {
            this.player = new Player(this.getStartPosition());
        }

        private getStartPosition(): Vector {
            return { x: this.canvas.width / 2, y: this.canvas.height - 50 };
        }

        public render() {
            if (this.player.alive) {
                this.player.render(this.buffering);
            }
        }

        public update() {
            if (this.player.alive) {
                this.player.update(this.canvas);
            }
        }

        public control() {
            if (this.player.alive) {
                this.player.control();
            }
        }

        public kill() {
            if (this.player.alive) {
                this.player.kill();
            }
        }
    }

    interface VectorDrag extends Vector {
        opacity: number;
    }

    class PlayerAnimation {
        image: HTMLImageElement | null = null;
        images: Array<HTMLImageElement> = [];
        currentImage: number = 2;

        drag: Array<VectorDrag> = [];
        dragFrame: boolean = true;
        dragTime: number = 100;
    }

    class Player extends KillableEntity implements Shooter {
        public projectileVelocity: VectorSpeed;
        public projectileColor: string;
        public projectileSize: number;

        public projectileSpecialVelocity: VectorSpeed;
        public projectileSpecialColor: string;
        public projectileSpecialSize: number;

        public alive: boolean;

        public animation: PlayerAnimation;
        public projectileInterval: SpeedNormalizer;
        public projectileCanShoot: boolean;
        public projectileSpecialInterval: SpeedNormalizer;
        public projectileSpecialCanShoot: boolean;
        public projectileSpecialLastShot: number;

        private _eventControl: EventModule.EventControl;
        private _particleControl: ParticleModule.ParticleControl;
        private _projectileControl: ProjectileModule.ProjectileControl;
        private _soundControl: SoundModule.SoundControl;
        private _scoreControl: ScoreModule.ScoreControl;

        public get currentHp() {
            return this.hp;
        }

        constructor(position: Vector) {
            super();

            this.position = position;
            this.velocity = new VectorSpeed({ x: 0, y: 0 });

            this.projectileVelocity = new VectorSpeed({ x: 0, y: -Configurations.Player.projectileSpeed });
            this.projectileColor = "DarkViolet";
            this.projectileSize = Configurations.Player.projectileSize;

            this.projectileSpecialVelocity = new VectorSpeed({
                x: 0,
                y: -Configurations.Player.projectileSpecialSpeed,
            });
            this.projectileSpecialColor = "LightGray";
            this.projectileSpecialSize = Configurations.Player.projectileSpecialSize;

            this.projectileInterval = new SpeedNormalizer(Configurations.Player.projectileInterval);
            this.projectileCanShoot = true;

            this.projectileSpecialInterval = new SpeedNormalizer(Configurations.Player.projectileSpecialInterval);
            this.projectileSpecialCanShoot = true;

            this._eventControl = EventControl;
            this._particleControl = ParticleControl;
            this._projectileControl = ProjectileControl;
            this._soundControl = SoundControl;
            this._scoreControl = ScoreControl;

            this.animation = new PlayerAnimation();

            this.hp = Configurations.Player.hp;
            this.alive = true;
            this.collisionTolerance = Configurations.Player.collisionTolerance;

            this.loadImages();
        }

        private async loadImages(): Promise<void> {
            this.animation.images.push(await ImageHelper.getImage(ImageType.MageBack01));
            this.animation.images.push(await ImageHelper.getImage(ImageType.MageBack02));
            this.animation.images.push(await ImageHelper.getImage(ImageType.MageBack03));
            this.animation.images.push(await ImageHelper.getImage(ImageType.MageBack04));

            const scaleF = 0.8;
            this.proportions.width = this.animation.images[0].width * scaleF;
            this.proportions.height = this.animation.images[0].height * scaleF;
            this.animation.image = this.animation.images[0];
        }

        private renderDrag(buffering: CanvasRenderingContext2D): void {
            this.animation.drag.forEach((element) => {
                buffering.save();

                buffering.globalAlpha = element.opacity;

                if (this.animation.image != null) {
                    buffering.drawImage(
                        this.animation.image,
                        element.x - this.width / 2,
                        element.y - this.height / 2,
                        this.width,
                        this.height
                    );
                }

                //buffering.globalAlpha = 1;
                buffering.restore();
            });
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            this.renderDrag(buffering);

            if (this.animation.image) {
                if (this.renderInformation.brightness > 0) {
                    buffering.filter = `brightness(300%)`;
                }

                buffering.drawImage(
                    this.animation.image,
                    Helper.getCanvasPositionX(this),
                    Helper.getCanvasPositionY(this),
                    this.width,
                    this.height
                );
            }
        }

        protected _update(canvas: HTMLCanvasElement): void {
            this.updateAnimation();
            this.updateHitAnimation();

            let centerPosition = Helper.getCanvasPositionX(this);

            if (this.velocity.x != 0) {
                if (this.velocity.x > 0) {
                    if (centerPosition <= canvas.width - this.width) {
                        this.position.x += this.velocity.x;
                    }
                } else {
                    if (centerPosition >= 0) {
                        this.position.x += this.velocity.x;
                    }
                }
            }

            this._projectileControl.calculatePlayerHit();
            this.isDead(true);
        }

        private updateAnimation() {
            if (this.animation.images[this.animation.currentImage] && this.animation.dragFrame) {
                this.animation.dragFrame = false;

                this.updateDrag();
                this.updateImage();

                setTimeout(() => {
                    this.animation.dragFrame = true;
                }, this.animation.dragTime);
            }
        }

        private updateDrag() {
            //Control drag array opacity
            this.animation.drag.push({ x: this.position.x, y: this.position.y, opacity: 1 });
            this.animation.drag.forEach((element) => {
                element.opacity = Number((element.opacity - 0.2).toFixed(2));
            });

            //Clean the drag that is not visible
            let index = this.animation.drag.findIndex((d) => d.opacity <= 0);
            if (index != -1) {
                this.animation.drag.splice(index, 1);
            }
        }

        private updateImage() {
            //Update the image _animation
            const maxIndex = this.animation.images.length - 1;
            this.animation.image = this.animation.images[this.animation.currentImage];
            this.animation.currentImage = this.animation.currentImage < maxIndex ? this.animation.currentImage + 1 : 0;
        }

        public control() {
            const velocity = 4;
            this.velocity.baseX = 0;

            if (this._eventControl.leftControl) {
                this.velocity.baseX -= velocity;
            }

            if (this._eventControl.rightControl) {
                this.velocity.baseX += velocity;
            }

            if (this._eventControl.specialControl && this.projectileSpecialCanShoot) {
                this.shoot(true);
                this.projectileSpecialCanShoot = false;
                this.projectileSpecialLastShot = Date.now();

                setTimeout(() => {
                    this.projectileSpecialCanShoot = true;
                }, this.projectileSpecialInterval.value);
            } else if (this._eventControl.shootControl) {
                if (this.projectileCanShoot) {
                    this.shoot();
                    this.projectileCanShoot = false;

                    setTimeout(() => {
                        this.projectileCanShoot = true;
                    }, this.projectileInterval.value);
                }
            }
        }

        private shoot(special: boolean = false) {
            this._scoreControl.addShoot();
            this._projectileControl.addProjectile(this, special);
        }

        public override kill() {
            this._soundControl.fadeOutMusic();
            this._soundControl.createSoundEffect(SoundType.Die, Configurations.Volume.player, 1);

            this._particleControl.createStarExplosion({
                amount: 2000,
                color: this.projectileColor,
                position: this.position,
                maxSpeed: 2,
                maxRadius: 4,
                fallout: 0.005,
            });

            this.alive = false;
        }
    }
}

export const PlayerControl = PlayerModule.PlayerControl.getInstance();
