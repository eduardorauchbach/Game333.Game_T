import { ButtonModule } from "./button.js";
import { CommunicationControl } from "../External/communication.js";
import { Configurations } from "../config.js";
import { CredentialsControl } from "../External/credentials.js";
import { Game, GameModule } from "../game.js";
import { PivotType } from "../Generic/render.js";
import { ScoreControl, ScoreModule } from "../Control/score.js";
import { Scoreboard } from "./scoreboard.js";
import { TextElement } from "../Ui/ui-elements.js";
import { VectorSpeed } from "../Generic/vector.js";

export module MenuTemplatesModule {
    export class MenuTemplateControl {
        public menus: Array<MenuTemplate>;

        private _game: GameModule.Game;
        private _scoreControl: ScoreModule.ScoreControl;
        private static _instance: MenuTemplateControl | null = null;

        public static getInstance(): MenuTemplateControl {
            if (!this._instance) {
                this._instance = new MenuTemplateControl();
            }
            return this._instance;
        }

        public initialize() {
            this._game = Game;
            this._scoreControl = ScoreControl;

            this.menus = [
                new MenuTemplate({
                    type: MenuTypes.Start,
                    buttons: [
                        new ButtonModule.Button({
                            content: "START",
                            color: "Grey",
                            fontColor: "White",
                            colorFocus: "Purple",
                            fontColorFocus: "White",
                            position: {
                                x: 400,
                                y: 350,
                            },
                            size: {
                                width: 200,
                                height: 75,
                            },
                            event: () =>
                                this._game.setStatus(
                                    Configurations.Game.enableCredentials
                                        ? GameModule.GameStatus.Login
                                        : GameModule.GameStatus.Menu
                                ),
                        }),
                    ],
                    texts: [
                        new TextElement({
                            position: { x: 400, y: 200 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 60,
                            font: "Brush Script MT",
                            pivotType: PivotType.center,
                            content: "☆ 333 Stars ☆",
                        }),
                    ],
                }),
                new MenuTemplate({
                    type: MenuTypes.Login,
                    buttons: [],
                    texts: [
                        new TextElement({
                            position: { x: 400, y: 200 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 60,
                            font: "Brush Script MT",
                            pivotType: PivotType.center,
                            content: "☆ 333 Stars ☆",
                        }),
                        new TextElement({
                            position: { x: 400, y: 400 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 30,
                            font: "Arial",
                            pivotType: PivotType.center,
                            content: "waiting for login",
                            breathingPerTick: 0.015,
                            breathingMinOpacity: 0.2,
                        }),
                    ],
                }),
                new MenuTemplate({
                    type: MenuTypes.Main,
                    buttons: [
                        new ButtonModule.Button({
                            content: "PLAY",
                            color: "Grey",
                            fontColor: "White",
                            colorFocus: "Purple",
                            fontColorFocus: "White",
                            position: {
                                x: 400,
                                y: 300,
                            },
                            size: {
                                width: 200,
                                height: 75,
                            },
                            event: () => {
                                if (Configurations.Game.enableCredentials) {
                                    CommunicationControl.createSession();
                                } else {
                                    this._game.setStatus(GameModule.GameStatus.Starting);
                                }
                            },
                        }),
                        new ButtonModule.Button({
                            content: "SCORE BOARD",
                            color: "Grey",
                            fontColor: "White",
                            colorFocus: "Purple",
                            fontColorFocus: "White",
                            position: {
                                x: 400,
                                y: 400,
                            },
                            size: {
                                width: 200,
                                height: 75,
                            },
                            event: () => this._game.setStatus(GameModule.GameStatus.Scoreboard),
                        }),
                    ],
                    texts: [
                        new TextElement({
                            position: { x: 400, y: 200 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 60,
                            font: "Brush Script MT",
                            pivotType: PivotType.center,
                            content: "☆ 333 Stars ☆",
                        }),
                    ],
                }),
                new MenuTemplate({
                    type: MenuTypes.Scoreboard,
                    buttons: [
                        new ButtonModule.Button({
                            content: "MENU",
                            color: "Grey",
                            fontColor: "White",
                            colorFocus: "Purple",
                            fontColorFocus: "White",
                            position: {
                                x: 400,
                                y: 450,
                            },
                            size: {
                                width: 200,
                                height: 75,
                            },
                            event: () => this._game.setStatus(GameModule.GameStatus.Menu),
                        }),
                    ],
                    texts: () => {
                        return new Scoreboard().buildBoard({
                            userData: CredentialsControl.userData,
                            position: {
                                x: 400,
                                y: 100,
                            },
                        });
                    },
                }),
                new MenuTemplate({
                    type: MenuTypes.GameOver,
                    buttons: [
                        new ButtonModule.Button({
                            content: "MENU",
                            color: "Grey",
                            fontColor: "White",
                            colorFocus: "Purple",
                            fontColorFocus: "White",
                            position: {
                                x: 400,
                                y: 350,
                            },
                            size: {
                                width: 200,
                                height: 75,
                            },
                            event: () => this._game.setStatus(GameModule.GameStatus.Menu),
                        }),
                    ],
                    texts: [
                        new TextElement({
                            position: { x: 400, y: 100 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 45,
                            font: "Arial",
                            pivotType: PivotType.center,
                            content: "GAME OVER",
                        }),
                        new TextElement({
                            position: { x: 400, y: 200 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 30,
                            font: "Arial",
                            pivotType: PivotType.center,
                            content: () => {
                                return `Your Score: ${this._scoreControl.amount}`;
                            },
                        }),
                    ],
                }),
                new MenuTemplate({
                    type: MenuTypes.GameOverRecord,
                    buttons: [
                        new ButtonModule.Button({
                            content: "SUBMIT SCORE",
                            color: "Grey",
                            fontColor: "White",
                            colorFocus: "Purple",
                            fontColorFocus: "White",
                            position: {
                                x: 400,
                                y: 350,
                            },
                            size: {
                                width: 200,
                                height: 75,
                            },
                            event: () => {
                                if (Configurations.Game.enableCredentials) {
                                    CommunicationControl.commitSession();
                                } else {
                                    this._game.setStatus(GameModule.GameStatus.Menu);
                                }
                            },
                        }),
                    ],
                    texts: [
                        new TextElement({
                            position: { x: 400, y: 100 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 45,
                            font: "Arial",
                            pivotType: PivotType.center,
                            content: "GAME OVER",
                        }),
                        new TextElement({
                            position: { x: 400, y: 200 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "white",
                            size: 30,
                            font: "Arial",
                            pivotType: PivotType.center,
                            content: () => {
                                return `Your Score: ${this._scoreControl.amount}`;
                            },
                        }),
                        new TextElement({
                            position: { x: 550, y: 200 },
                            velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                            color: "Yellow",
                            size: 15,
                            font: "Arial",
                            pulsatingMaxSize: 25,
                            pulsatingPerTick: 0.2,
                            rotation: -0.8,
                            pivotType: PivotType.center,
                            content: "Personal Best!",
                        }),
                    ],
                }),
            ];
        }

        public getTemplate(type: MenuTypes): MenuTemplate {
            return this.menus.find((x) => x.type == type);
        }
    }

    interface MenuTemplateParameters {
        type: MenuTypes;
        buttons: Array<ButtonModule.Button>;
        texts: Array<TextElement> | (() => Promise<Array<TextElement>>);
    }

    class MenuTemplate {
        public type: MenuTypes;
        public buttons: Array<ButtonModule.Button>;
        public texts: Array<TextElement> | (() => Promise<Array<TextElement>>);

        constructor(parameters: MenuTemplateParameters) {
            this.type = parameters.type;
            this.buttons = parameters.buttons;
            this.texts = parameters.texts;
        }
    }

    export enum MenuTypes {
        Start,
        Login,
        Main,
        Scoreboard,
        GameOver,
        GameOverRecord,
    }
}

export const MenuTemplateControl = MenuTemplatesModule.MenuTemplateControl.getInstance();
