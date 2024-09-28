import { KillableControlEntity } from "../Generic/control.js";
import { KillableEntity } from "../Generic/entitiy.js";
import { Configurations } from "../config.js";
import { Enemy } from "../Entities/enemy.js";
import { Helper, SoundType } from "../Generic/helper.js";
import { ParticleControl, ParticleModule } from "./particle.js";
import { PlayerControl, PlayerModule } from "../Entities/player.js";
import { SoundControl, SoundModule } from "./sound.js";
import { Shooter, Vector, VectorSpeed } from "../Generic/vector.js";
import { ScoreControl, ScoreModule } from "../Control/score.js";

export module ProjectileModule {
    class Values {
        public static enemyProjectiles: Array<EnemyProjectile> = [];
        public static playerProjectiles: Array<PlayerProjectile> = [];
    }

    export class ProjectileControl extends KillableControlEntity<Projectile> {
        private static _instance: ProjectileControl | null = null;

        private _playerControl: PlayerModule.PlayerControl | null;
        private _scoreControl: ScoreModule.ScoreControl | null;

        public static getInstance(): ProjectileControl {
            if (!this._instance) {
                this._instance = new ProjectileControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;

            this._playerControl = PlayerControl;
            this._scoreControl = ScoreControl;
        }

        public addProjectile(origin: Shooter, special: boolean = false) {
            if (origin instanceof Enemy) {
                Values.enemyProjectiles.push(new EnemyProjectile(origin));
            } else {
                Values.playerProjectiles.push(new PlayerProjectile(origin, special));
            }
        }

        public override kill(projectile: Projectile, emitParticles: boolean = true): void {
            projectile.kill(emitParticles);
        }

        public override render(): void {
            if (this.buffering) {
                Values.enemyProjectiles.forEach((item) => {
                    item.render(this.buffering);
                });

                Values.playerProjectiles.forEach((item) => {
                    item.render(this.buffering);
                });
            }
        }

        public override update(): void {
            Values.enemyProjectiles.forEach((item) => {
                item.update(this.canvas);
            });

            Values.playerProjectiles.forEach((item) => {
                item.update(this.canvas);
            });
        }

        public calculatePlayerHit(): void {
            const enemyProjectiles = Values.enemyProjectiles;
            const player = this._playerControl.player;

            let pHit: Projectile;

            for (let e = enemyProjectiles.length - 1; e >= 0; e--) {
                const pE = enemyProjectiles[e];

                //Calculate Player Hits
                pHit = this.calculateCollision(pE, player);
                if (pHit) {
                    pE.registerHit(1);
                    player.registerHit(pE.damage, 12);
                    this._scoreControl.addReceived();

                    //If the shot does not have anymore HP, it will disapear
                    if (pE.isDead(true)) {
                        continue;
                    }
                }
            }
        }

        public calculateEnemyHit(enemy: KillableEntity) {
            const enemyProjectiles = Values.enemyProjectiles;
            const playerProjectiles = Values.playerProjectiles;
            const tolerance = -this._playerControl.player.projectileSize;

            let pHit: Projectile;

            for (let p = playerProjectiles.length - 1; p >= 0; p--) {
                const pP = playerProjectiles[p];

                //Calculate Player Hits
                pHit = this.calculateCollision(pP, enemy);
                if (pHit) {
                    pP.registerHit(1);
                    enemy.registerHit(pP.damage, 8, true);
                    this._scoreControl.addHits();

                    //If the shot does not have anymore HP, it will disapear
                    if (pP.isDead(true)) {
                        continue;
                    }
                }

                for (let e = enemyProjectiles.length - 1; e >= 0; e--) {
                    const pE = enemyProjectiles[e];

                    //Calculate Projectile Hits
                    pHit = this.calculateCollision(pP, pE);
                    if (pHit) {
                        pE.registerHit(pP.damage);
                        pP.registerHit(pE.damage);
                    }

                    if (pE.isDead(true)) {
                        continue;
                    }
                }

                pP.isDead(true);
            }
        }

        private calculateCollision(projectile: KillableEntity, target: KillableEntity): Projectile {
            // Calculate the bounds X of the target
            let targetLeft = target.position.x - target.width / 2 + target.collisionTolerance;
            let targetRight = target.position.x + target.width / 2 - target.collisionTolerance;

            // Calculate the bounds X of the projectile
            let projectileLeft = projectile.position.x - projectile.width / 2 + projectile.collisionTolerance;
            let projectileRight = projectile.position.x + projectile.width / 2 - projectile.collisionTolerance;

            // Check for X overlap
            if (projectileLeft < targetRight && projectileRight > targetLeft) {
                // Calculate the bounds Y of the target
                let targetTop = target.position.y - target.height / 2 + target.collisionTolerance;
                let targetBottom = target.position.y + target.height / 2 - target.collisionTolerance;

                // Calculate the bounds Y of the projectile
                let projectileTop = projectile.position.y - projectile.height / 2 + projectile.collisionTolerance;
                let projectileBottom = projectile.position.y + projectile.height / 2 - projectile.collisionTolerance;

                // Check for Y overlap
                if (projectileTop < targetBottom && projectileBottom > targetTop) {
                    // Collision detected
                    return projectile as Projectile;
                }
            }

            return null;
        }

        public clear() {
            Values.enemyProjectiles = [];
            Values.playerProjectiles = [];
        }
    }

    export abstract class Projectile extends KillableEntity {
        public color: string;

        public damage: number;
        public rotation: number;
    }

    class EnemyProjectile extends Projectile {
        public color: string;

        public damage: number;
        public rotation: number;

        private _particleControl: ParticleModule.ParticleControl;
        private _soundControl: SoundModule.SoundControl;

        constructor(owner: Shooter) {
            super();

            this.position = {
                x: owner.position.x,
                y: owner.position.y,
            };
            this.velocity = owner.projectileVelocity;

            this.color = owner.projectileColor;
            this.proportions.width = owner.projectileSize / 3;
            this.proportions.height = owner.projectileSize;

            this.hp = 1;
            this.damage = 1;
            this.rotation = 0;
            this.collisionTolerance = 0;

            this.calculateDirection(owner.position, PlayerControl.player.position, owner.projectileVelocity);

            this._particleControl = ParticleControl;
            this._soundControl = SoundControl;
            this._soundControl.createSoundEffect(SoundType.EnemyShoot, Configurations.Volume.player);
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            buffering.save();

            buffering.translate(this.position.x, this.position.y);
            buffering.rotate(this.rotation);
            buffering.translate(-this.position.x, -this.position.y);

            buffering.beginPath();
            buffering.fillStyle = this.color;
            buffering.globalAlpha = (this.renderInformation.opacity * this.position.y) / 200;

            buffering.fillRect(
                Helper.getCanvasPositionX(this),
                Helper.getCanvasPositionY(this),
                this.width,
                this.height
            );
            buffering.closePath();

            buffering.restore();
        }

        protected _update(): void {
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;

            if (Helper.outOfBounds(this.position, Configurations.Garden.height * 0.75)) {
                this.kill(true);
            }
        }

        private calculateDirection(originPosition: Vector, targetPosition: Vector, baseVelocity: VectorSpeed) {
            const directionX = targetPosition.x - originPosition.x;
            const directionY = targetPosition.y - originPosition.y;

            const distance = Math.sqrt(directionX * directionX + directionY * directionY);

            const normalizedDirectionX = directionX / distance;
            const normalizedDirectionY = directionY / distance;

            const velocityX = normalizedDirectionX * baseVelocity.baseY;
            const velocityY = normalizedDirectionY * baseVelocity.baseY;

            this.velocity = new VectorSpeed({ x: velocityX, y: velocityY });
            // Add (90 degrees in radians) to the rotation
            this.rotation = Math.atan2(velocityY, velocityX) + Math.PI / 2;
        }

        public kill(emitParticles: boolean = true) {
            let index = Values.enemyProjectiles.findIndex((p) => p === this);
            Values.enemyProjectiles.splice(index, 1);

            if (emitParticles) {
                this._particleControl.createStarExplosion({
                    amount: 120,
                    color: this.color,
                    position: this.position,
                    maxSpeed: 1,
                    maxRadius: 3,
                    fallout: 0.09,
                });
            }
        }
    }

    class PlayerProjectile extends Projectile {
        public color: string;

        public damage: number;
        public rotation: number;

        private _particleControl: ParticleModule.ParticleControl;
        private _soundControl: SoundModule.SoundControl;

        constructor(owner: Shooter, special: boolean) {
            super();

            this._particleControl = ParticleControl;
            this._soundControl = SoundControl;   

            this.position = {
                x: owner.position.x,
                y: owner.position.y,
            };

            if (special) {
                this.color = owner.projectileSpecialColor;
                this.proportions.width = owner.projectileSpecialSize;
                this.proportions.height = owner.projectileSpecialSize;
                this.velocity = owner.projectileSpecialVelocity;
                this.hp = Configurations.Player.projectileSpecialHp;
                this._soundControl.createSoundEffect(SoundType.Die, Configurations.Volume.player);
            } else {
                this.color = owner.projectileColor;
                this.proportions.width = owner.projectileSize;
                this.proportions.height = owner.projectileSize;
                this.velocity = owner.projectileVelocity;
                this.hp = 1;
                this._soundControl.createSoundEffect(SoundType.PlayerShoot, Configurations.Volume.player);
            }

            this.damage = 1;
            this.rotation = 0;
            this.collisionTolerance = -this.width;         
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            for (let i = 1; i <= this.width; i = Math.round((i + 0.2) * 100) / 100) {
                let jump = i != this.width ? 2 : 0;

                let y = this.position.y + (this.width / i) * (2 * jump);
                let x = this.position.x;
                let tortion = Math.sin((Math.PI * y) / 80) * 3;
                x += i != this.width ? (Math.round(i) % 2 == 0 ? -tortion : tortion) : 0;

                const gradient = buffering.createRadialGradient(x, y, 0, x, y, i);
                gradient.addColorStop(0, "white");
                gradient.addColorStop(0.4, "black");
                gradient.addColorStop(1, this.color);

                buffering.beginPath();
                buffering.fillStyle = gradient;
                buffering.globalAlpha = (this.renderInformation.opacity * this.position.y) / 200;

                buffering.arc(x, y, i, 0, Math.PI * 2);
                buffering.fill();

                buffering.closePath();
            }
        }

        protected _update(): void {
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;

            if (Helper.outOfBounds(this.position)) {
                this.kill(false);
            }
        }

        public kill(emitParticles: boolean) {
            let index = Values.playerProjectiles.findIndex((p) => p === this);
            Values.playerProjectiles.splice(index, 1);

            if (emitParticles) {
                this._particleControl.createStarExplosion({
                    amount: 120,
                    color: this.color,
                    position: this.position,
                    maxSpeed: 1,
                    maxRadius: 3,
                    fallout: 0.09,
                });
            }
        }
    }
}

export const ProjectileControl = ProjectileModule.ProjectileControl.getInstance();
