import { ControlEntity } from "../Generic/control.js";
import { Entity } from "../Generic/entitiy.js";
import { ButtonModule } from "./button.js";
import { MenuTemplateControl, MenuTemplatesModule } from "./menu-templates.js";
import { TextElement } from "../Ui/ui-elements.js";
import { PivotType } from "../Generic/render.js";
import { Enemy } from "../Entities/enemy.js";
import { EnemyTemplateControl, EnemyTemplateModule } from "../Entities/enemy-templates.js";
import { Vector, VectorSpeed } from "../Generic/vector.js";
import { Configurations } from "../config.js";
import { GardenControl, GardenModule } from "../Components/garden.js";
import { Helper, SoundType } from "../Generic/helper.js";
import { SoundControl } from "../Components/sound.js";

export module MenuModule {
    class Values {
        public static flowers: Array<Enemy> = [];
    }

    export class MenuControl extends ControlEntity<Menu> {
        public menu: Menu | null;
        private static _instance: MenuControl | null = null;

        public static getInstance(): MenuControl {
            if (!this._instance) {
                this._instance = new MenuControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;

            this.canvas.addEventListener("mousemove", (event) => this.update(event));
            this.canvas.addEventListener("click", () => this.click());
        }

        public setMenu(type: MenuTemplatesModule.MenuTypes) {
            if (!this.menu || this.menu.type != type) {
                this.menu = new Menu(type, this.canvas);
            }
        }

        public render(): void {
            if (this.buffering && this.menu) {
                this.menu.render(this.buffering);
            }
        }

        public update(event: MouseEvent | null): void {
            if (this.canvas && this.menu) {
                this.menu.update(this.canvas, event);
            }
        }

        public click(): void {
            if (this.menu) {
                this.menu.click();
            }
        }

        public clear() {
            Values.flowers = [];
            this.menu = null;
        }
    }

    class Menu extends Entity {
        public type: MenuTemplatesModule.MenuTypes;
        public buttons: Array<ButtonModule.Button>;
        public texts: Array<TextElement>;

        private spawnFlower: boolean;

        constructor(type: MenuTemplatesModule.MenuTypes, canvas: HTMLCanvasElement) {
            super();

            if (type == MenuTemplatesModule.MenuTypes.GameOverRecord) {
                SoundControl.createSoundEffect(SoundType.Record, 0.4);
            }

            const template = MenuTemplateControl.getTemplate(type);

            this.type = type;
            this.buttons = template.buttons;

            if (template.texts instanceof Function) {
                template.texts().then((data) => {
                    this.texts = data;
                });
            } else {
                this.texts = template.texts;
            }

            this.position = { x: 0, y: 0 };
            this.proportions.width = canvas.width;
            this.proportions.height = canvas.height;
            this.renderInformation.pivotType = PivotType.origin;

            this.spawnFlower = true;

            if (type == MenuTemplatesModule.MenuTypes.Start && GardenControl.garden.flowerCount == 0) {
                GardenControl.loadFullGarden();
            }
        }

        protected _render(buffering: CanvasRenderingContext2D): void {
            //First to render, so it go behind the others
            Values.flowers.forEach((item) => {
                item.render(buffering);
            });

            this.buttons.forEach((item) => {
                item.render(buffering);
            });

            if (this.texts != undefined) {
                this.texts.forEach((item) => {
                    item.render(buffering);
                });
            }
        }

        protected _update(canvas: HTMLCanvasElement, event: MouseEvent): void {
            if (event) {
                this.buttons.forEach((item) => {
                    item.update(canvas, event);
                });
            } else {
                if (this.texts != undefined) {
                    this.texts.forEach((item) => {
                        item.update(canvas, event);
                    });
                }

                Values.flowers.forEach((item) => {
                    item.update(canvas);

                    if (item.position.y > canvas.height) {
                        let index = Values.flowers.findIndex((p) => p === item);
                        Values.flowers.splice(index, 1);
                    }
                });

                this.spawnFlowerControl(canvas);
            }
        }

        private spawnFlowerControl(canvas: HTMLCanvasElement) {
            if (this.spawnFlower) {
                this.spawnFlower = false;

                this.spawnNewFlower({
                    x: Math.random() * canvas.width,
                    y: -100,
                });

                setTimeout(() => {
                    this.spawnFlower = true;
                }, 300);
            }
        }

        public spawnNewFlower(position: Vector): void {
            let index = Math.floor(Math.random() * (EnemyTemplateControl.enemyTemplates.length - 0.1));
            let template = EnemyTemplateControl.enemyTemplates[index];

            let current = new Enemy({
                position: {
                    x: 0,
                    y: 0,
                },
                template: template,
            });

            current.position = position;
            current.velocity = new VectorSpeed({ x: 0, y: 2 }, Configurations.Enemy.tilt);

            Values.flowers.push(current);
        }

        public click() {
            this.buttons.forEach((item) => {
                item.click();
            });
        }
    }
}

export const MenuControl = MenuModule.MenuControl.getInstance();
