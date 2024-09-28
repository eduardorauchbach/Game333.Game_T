import { Configurations } from "../config.js";
import { KillableControlEntity } from "../Generic/control.js";
import { Enemy } from "./enemy.js";
import { EnemyTemplateControl } from "./enemy-templates.js";
import { KillableEntity } from "../Generic/entitiy.js";
import { Helper } from "../Generic/helper.js";
import { ScoreControl, ScoreModule } from "../Control/score.js";
import { SpeedNormalizer, VectorSpeed } from "../Generic/vector.js";

export module LevelModule {
    class Values {
        public static levels: Array<Level> = [];
        public static currentIndex: number = -1;
    }

    export class LevelControl extends KillableControlEntity<Level> {
        private static _instance: LevelControl | null = null;

        public static getInstance(): LevelControl {
            if (!this._instance) {
                this._instance = new LevelControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
        }

        public reset() {
            Values.levels = [];
            Values.currentIndex = -1;
        }

        public addLevel(index: number): void {
            Values.levels.push(new Level(index));
        }

        public kill(level: Level): void {
            level.kill();
        }

        public update(): void {
            Values.levels.forEach((item) => {
                item.update(this.canvas);
            });
        }

        public render(): void {
            if (this.buffering) {
                Values.levels.forEach((item) => {
                    item.render(this.buffering);
                });
            }
        }

        public control(): void {
            if (Values.levels.length == 0) {
                const maxIndex = EnemyTemplateControl.levelTemplates.length - 1;
                Values.currentIndex = Values.currentIndex < maxIndex ? Values.currentIndex + 1 : 1;

                this.addLevel(Values.currentIndex);
            } else if (this.buffering) {
                Values.levels.forEach((item) => {
                    item.control();
                });
            }
        }
    }

    class Level extends KillableEntity {
        public enemies: Array<Array<Enemy>>;

        public projectileInterval: SpeedNormalizer;
        public projectileCanShoot: boolean;

        public spawn: boolean;

        private itemHeight: number;
        private itemWidth: number;
        private currentStep: number;

        private _scoreControl: ScoreModule.ScoreControl;

        constructor(index: number) {
            super();

            this._scoreControl = ScoreControl;

            this.itemHeight = Configurations.Level.itemSize;
            this.itemWidth = Configurations.Level.itemSize;

            const currentLevelInfo = EnemyTemplateControl.levelTemplates[index];

            this.position = {
                x: Helper.getCanvasCenterX(),
                y: -currentLevelInfo.grid.length * this.itemHeight,
            };

            this.velocity = new VectorSpeed({ x: 0, y: 0 }, Configurations.Enemy.tilt);

            this.proportions.width = currentLevelInfo.grid[0].length * this.itemWidth;
            this.proportions.height = currentLevelInfo.grid.length * this.itemHeight;
            this.projectileInterval = new SpeedNormalizer(currentLevelInfo.projectileInterval);
            this.projectileCanShoot = false;
            this.spawn = true;
            this.hp = 1;

            this.currentStep = this.height / 2 + Configurations.Level.step;

            this.loadEnemies(currentLevelInfo.grid);
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            for (let ri = 0; ri < this.enemies.length; ri++) {
                for (let ei = 0; ei < this.enemies[ri].length; ei++) {
                    this.enemies[ri][ei].render(buffering);
                }
            }
        }

        protected _update(canvas: HTMLCanvasElement): void {
            let centerPosition = Helper.getCanvasPositionX(this);

            this.updateSpawn();

            if (this.velocity.x != 0) {
                if (this.velocity.x > 0) {
                    if (centerPosition <= canvas.width - this.width) {
                        this.position.x += this.velocity.x;
                    } else {
                        this.velocity.baseY = Math.abs(this.velocity.x);
                        this.velocity.baseX = 0;
                        this.currentStep = this.position.y + Configurations.Level.step;
                    }
                } else {
                    if (centerPosition >= 0) {
                        this.position.x += this.velocity.x;
                    } else {
                        this.velocity.baseY = Math.abs(this.velocity.x);
                        this.velocity.baseX = 0;
                        this.currentStep = this.position.y + Configurations.Level.step;
                    }
                }
            }

            if (this.velocity.x == 0) {
                if (this.position.y < this.currentStep) {
                    this.position.y += this.velocity.y;
                } else if (!this.spawn) {
                    if (this.position.x < canvas.width / 2) {
                        this.velocity.baseX = Configurations.Level.speed;
                    } else {
                        this.velocity.baseX = -Configurations.Level.speed;
                    }
                    this.velocity.baseY = 0;
                }
            }

            this.updateUnits(canvas);
        }

        private updateSpawn(): void {
            if (this.spawn) {
                if (this.position.y > this.currentStep) {
                    this.velocity.baseX =
                        Math.random() > 0.5 ? Configurations.Level.speed : -Configurations.Level.speed;

                    this.currentStep = this.position.y + Configurations.Level.step;
                    this.velocity.baseY = 0;
                    this.spawn = false;
                    this.projectileCanShoot = true;
                } else if (this.position.y < this.currentStep) {
                    const curr = Math.abs(this.position.y - this.currentStep);
                    this.velocity.baseY = curr > 10 ? curr / 20 : 0.5;
                }
            }
        }

        private updateUnits(canvas: HTMLCanvasElement): void {
            for (let ri = this.enemies.length - 1; ri >= 0; ri--) {
                for (let ei = this.enemies[ri].length - 1; ei >= 0; ei--) {
                    this.enemies[ri][ei].velocity = this.velocity;
                    this.enemies[ri][ei].update(canvas); //The level already controls the speed

                    if (this.enemies[ri][ei].isDead(true, !this.spawn)) {
                        this.enemies[ri].splice(ei, 1);
                        if (this.enemies[ri].length == 0) {
                            this.enemies.splice(ri, 1);
                        }

                        this.updateSize();
                    }
                }
            }
        }

        public updateSize(): void {
            let allXPositions = this.enemies.flatMap((group) => group.map((enemy) => enemy.position.x));
            let allYPositions = this.enemies.flatMap((group) => group.map((enemy) => enemy.position.y));

            if (allXPositions.length > 0 && allYPositions.length > 0) {
                let minX = Math.min(...allXPositions);
                let maxX = Math.max(...allXPositions);
                let minY = Math.min(...allYPositions);
                let maxY = Math.max(...allYPositions);

                this.position.x = (maxX + minX) / 2;
                this.position.y = (maxY + minY) / 2;
                this.proportions.width = maxX - minX + this.itemWidth;
                this.proportions.height = maxY - minY + this.itemHeight;
            } else {
                this.kill();
            }
        }

        public control() {
            const column = Math.round(Math.random() * (this.enemies[0].length - 1));
            const row = Math.round(Math.random() * (this.enemies.length - 1));

            if (this.projectileCanShoot && this.enemies[row][column] !== undefined) {
                this.enemies[row][column].shoot();

                this.projectileCanShoot = false;
                setTimeout(() => {
                    this.projectileCanShoot = true;
                }, this.projectileInterval.value);
            }
        }

        public kill(): void {
            this._scoreControl.addLevelKill();

            let index = Values.levels.findIndex((p) => p === this);
            Values.levels.splice(index, 1);
        }

        private loadEnemies(grid: Array<Array<number>>): void {
            this.enemies = new Array<Array<Enemy>>();

            for (let ri = 0; ri < grid.length; ri++) {
                let row = grid[ri];

                const enemyRow = new Array<Enemy>();

                for (let ci = 0; ci < row.length; ci++) {
                    let item = row[ci];

                    let template = EnemyTemplateControl.enemyTemplates[item - 1];
                    enemyRow.push(
                        new Enemy({
                            template: template,
                            position: {
                                x: Helper.getCanvasPositionX(this) + this.itemWidth * ci + this.itemWidth / 2,
                                y: Helper.getCanvasPositionY(this) + this.itemHeight * ri + this.itemHeight / 2,
                            },
                        })
                    );
                }

                this.enemies.push(enemyRow);
            }
        }
    }
}

export const LevelControl = LevelModule.LevelControl.getInstance();
