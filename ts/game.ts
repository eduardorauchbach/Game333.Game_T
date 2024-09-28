import { BackgroundControl, BackgroundModule } from "./Components/background.js";
import { CommunicationControl, CommunicationModule } from "./External/communication.js";
import { CountdownControl, CountdownModule } from "./Menu/countdown.js";
import { CredentialsControl, CredentialsModule } from "./External/credentials.js";
import { EnemyTemplateControl } from "./Entities/enemy-templates.js";
import { EventControl, EventModule } from "./Control/events.js";
import { FloatingTextControl, FloatingTextModule } from "./Components/floatingText.js";
import { FrameDetectorControl, FrameDetectorModule } from "./Control/frameDetector.js";
import { GardenControl, GardenModule } from "./Components/garden.js";
import { Helper, ImageHelper, SoundHelper } from "./Generic/helper.js";
import { LevelControl, LevelModule } from "./Entities/level.js";
import { LoadingControl, LoadingModule } from "./Menu/loading.js";
import { MenuTemplateControl, MenuTemplatesModule } from "./Menu/menu-templates.js";
import { MenuControl, MenuModule } from "./Menu/menu.js";
import { ParticleControl, ParticleModule } from "./Components/particle.js";
import { PlayerControl, PlayerModule } from "./Entities/player.js";
import { ProjectileControl, ProjectileModule } from "./Components/projectile.js";
import { ScoreControl, ScoreModule } from "./Control/score.js";
import { SeedControl, SeedModule } from "./Components/seed.js";
import { SoundControl, SoundModule } from "./Components/sound.js";
import { UiControl, UiModule } from "./Ui/ui.js";

const game333 = document.getElementById("game333") as HTMLDivElement;
const main = document.createElement("div");
main.style.float = "left";
main.style.width = "100%";
game333.appendChild(main);
export const canvas = document.createElement("canvas");
main.appendChild(canvas);

canvas.width = 800;
canvas.height = 600;
canvas.style.float = "left";
canvas.style.width = "100%";

const bufferingCanvas = document.createElement("canvas");
bufferingCanvas.width = canvas.width;
bufferingCanvas.height = canvas.height;
const buffering = bufferingCanvas.getContext("2d");

//let game;

window.addEventListener(
    "load",
    function () {
        loadGame();

        const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

        if (isMobile || isTouchDevice) {
            const buttons = document.createElement("div");
            game333.appendChild(buttons);
            buttons.style.float = "left";
            buttons.style.width = "100%";

            const left = document.createElement("button");
            left.textContent = "<";
            left.style.float = "left";
            left.style.width = "150px";
            left.style.height = "100px";
            left.style.height = "100px";
            left.style.font = "30px bold";
            left.style.fontFamily = "Fantasy";
            left.addEventListener("touchstart", function (event) {
                event.preventDefault();
                EventControl.leftActivate();
            });
            left.addEventListener("touchend", function (event) {
                event.preventDefault();
                EventControl.leftDeactivate();
            });
            buttons.appendChild(left);

            const right = document.createElement("button");
            right.textContent = ">";
            right.style.float = "left";
            right.style.width = "150px";
            right.style.height = "100px";
            right.style.font = "30px bold";
            right.style.fontFamily = "Fantasy";
            right.addEventListener("touchstart", function (event) {
                event.preventDefault();
                EventControl.rightActivate();
            });
            right.addEventListener("touchend", function (event) {
                event.preventDefault();
                EventControl.rightDeactivate();
            });
            buttons.appendChild(right);

            const shoot = document.createElement("button");
            shoot.textContent = "Fire!";
            shoot.style.float = "right";
            shoot.style.width = "300px";
            shoot.style.height = "100px";
            shoot.style.font = "30px bold";
            shoot.style.fontFamily = "Fantasy";
            shoot.addEventListener("touchstart", function (event) {
                event.preventDefault();
                EventControl.shootActivate();
            });
            shoot.addEventListener("touchend", function (event) {
                event.preventDefault();
                EventControl.shootDeactivate();
            });
            buttons.appendChild(shoot);

            const special = document.createElement("button");
            special.textContent = "SP";
            special.style.float = "right";
            special.style.width = "200px";
            special.style.height = "100px";
            special.style.font = "30px bold";
            special.style.fontFamily = "Fantasy";
            special.addEventListener("touchstart", function (event) {
                event.preventDefault();
                EventControl.shootSpecialActivate();
            });
            special.addEventListener("touchend", function (event) {
                event.preventDefault();
                EventControl.shootSpecialDeactivate();
            });
            buttons.appendChild(special);
        }
    },
    false
);

function loadGame() {
    Game.initialize();
}

export module GameModule {
    export enum GameStatus {
        Start,
        Login,
        Menu,
        Scoreboard,
        GameOver,
        GameOverRecord,
        Paused,
        Resuming,
        Starting,
        Running,
    }

    class GameTimer {
        public lastTime: number;
        public accumulatedTime: number;

        constructor() {
            this.lastTime = 0;
            this.accumulatedTime = 0;
        }
    }

    export class Game {
        public canvas: HTMLCanvasElement;
        public renderContext: CanvasRenderingContext2D;
        public buffering: CanvasRenderingContext2D;

        private _frameDetectorControl: FrameDetectorModule.FrameDetectorControl;
        private _credentailsControl: CredentialsModule.CredentialsControl;
        private _communicationControl: CommunicationModule.CommunicationControl;
        private _scoreControl: ScoreModule.ScoreControl;
        private _eventControl: EventModule.EventControl;
        private _loadingControl: LoadingModule.LoadingControl;
        private _backgroundControl: BackgroundModule.BackgroundControl;
        private _playerControl: PlayerModule.PlayerControl;
        private _levelControl: LevelModule.LevelControl;
        private _seedControl: SeedModule.SeedControl;
        private _gardenControl: GardenModule.GardenControl;
        private _particleControl: ParticleModule.ParticleControl;
        private _projectileControl: ProjectileModule.ProjectileControl;
        private _floatingTextControl: FloatingTextModule.FloatingTextControl;
        private _soundControl: SoundModule.SoundControl;
        private _uiControl: UiModule.UiControl;
        private _menuControl: MenuModule.MenuControl;
        private _countdownControl: CountdownModule.CountdownControl;

        private status: GameStatus | null;
        private timer: GameTimer;
        private gameOverTimeout: number | null;

        private static _instance: Game | null = null;

        public static getInstance(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D | null): Game {
            if (!this._instance) {
                this._instance = new Game(canvas, buffering);
            }
            return this._instance;
        }

        constructor(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D | null) {
            this.canvas = canvas;
            this.buffering = buffering;

            const context = canvas.getContext("2d");
            if (context) {
                this.renderContext = context;
            }

            this.timer = new GameTimer();
            this.status = GameStatus.Start;

            this._frameDetectorControl = FrameDetectorControl;
            this._credentailsControl = CredentialsControl;
            this._communicationControl = CommunicationControl;
            this._scoreControl = ScoreControl;
            this._eventControl = EventControl;
            this._loadingControl = LoadingControl;
            this._backgroundControl = BackgroundControl;
            this._playerControl = PlayerControl;
            this._levelControl = LevelControl;
            this._seedControl = SeedControl;
            this._gardenControl = GardenControl;
            this._particleControl = ParticleControl;
            this._projectileControl = ProjectileControl;
            this._floatingTextControl = FloatingTextControl;
            this._soundControl = SoundControl;
            this._uiControl = UiControl;
            this._menuControl = MenuControl;
            this._countdownControl = CountdownControl;
        }

        public async initialize(): Promise<void> {
            await ImageHelper.initialize();
            await SoundHelper.initialize();

            EnemyTemplateControl.initialize();
            MenuTemplateControl.initialize();

            Helper.initialize(this.canvas);

            this._frameDetectorControl.estimateFrameRate();
            this._credentailsControl.initialize();
            this._communicationControl.initialize();
            this._scoreControl.initialize();
            this._eventControl.initialize();
            this._loadingControl.initialize(this.canvas, this.buffering);
            this._backgroundControl.initialize(this.canvas, this.buffering);
            this._playerControl.initialize(this.canvas, this.buffering);
            this._levelControl.initialize(this.canvas, this.buffering);
            this._seedControl.initialize(this.canvas, this.buffering);
            this._gardenControl.initialize(this.canvas, this.buffering);
            this._particleControl.initialize(this.canvas, this.buffering);
            this._projectileControl.initialize(this.canvas, this.buffering);
            this._floatingTextControl.initialize(this.canvas, this.buffering);
            this._uiControl.initialize(this.canvas, this.buffering);
            this._menuControl.initialize(this.canvas, this.buffering);
            this._countdownControl.initialize(this.canvas, this.buffering);

            this.timer.lastTime = performance.now();

            requestAnimationFrame(this.cron);
        }

        public setStatus(status: GameStatus) {
            this.status = status;

            if (status == GameStatus.Starting) {
                this._scoreControl.initialize();
                this._playerControl.reset();
                this._levelControl.reset();
                this._gardenControl.reset();
                this._particleControl.clear();
                this._projectileControl.clear();
                this._menuControl.clear();
            }
        }

        private cron = (initialTime: number): void => {
            const frameTime = 1000 / this._frameDetectorControl.frameRate;
            const currentTime = initialTime ?? performance.now();

            const deltaTime = currentTime - this.timer.lastTime;
            this.timer.lastTime = currentTime;
            this.timer.accumulatedTime += deltaTime;

            while (this.timer.accumulatedTime >= frameTime) {
                this.timer.accumulatedTime -= frameTime;
                this.control();
                this.update();
            }

            this.render();

            requestAnimationFrame(() => this.cron(performance.now()));
        };

        private update(): void {
            this._backgroundControl.update();

            switch (this.status) {
                case GameStatus.Start:
                    {
                        this._menuControl.setMenu(MenuTemplatesModule.MenuTypes.Start);
                        this._menuControl.update(null);
                    }
                    break;
                case GameStatus.Login:
                    {
                        this._menuControl.setMenu(MenuTemplatesModule.MenuTypes.Login);
                        this._credentailsControl.login();
                        this._menuControl.update(null);
                    }
                    break;
                case GameStatus.Menu:
                    {
                        this._menuControl.setMenu(MenuTemplatesModule.MenuTypes.Main);
                        this._menuControl.update(null);
                    }
                    break;
                case GameStatus.Scoreboard:
                    {
                        this._menuControl.setMenu(MenuTemplatesModule.MenuTypes.Scoreboard);
                        this._menuControl.update(null);
                    }
                    break;
                case GameStatus.GameOver:
                    {
                        this._menuControl.setMenu(MenuTemplatesModule.MenuTypes.GameOver);
                        this._menuControl.update(null);
                    }
                    break;
                case GameStatus.GameOverRecord:
                    {
                        this._menuControl.setMenu(MenuTemplatesModule.MenuTypes.GameOverRecord);
                        this._menuControl.update(null);
                    }
                    break;
                case GameStatus.Starting:
                    {
                        if (!this._countdownControl.exists) {
                            this._countdownControl.createCountdown({
                                duration: 3,
                                event: () => {
                                    this.setStatus(GameStatus.Running);
                                    this._soundControl.playStageSound();
                                },
                                beginMessage: "",
                                finalMessage: "Start!",
                                paused: false,
                            });
                        }
                        this._playerControl.update();
                    }
                    break;
                case GameStatus.Running:
                    {
                        if (this._playerControl.player.alive) {
                            if (!document.hasFocus()) {
                                this.setStatus(GameStatus.Paused);
                                this._soundControl.fadeOutMusic();

                                this._countdownControl.createCountdown({
                                    duration: 3,
                                    event: () => {
                                        this.setStatus(GameStatus.Running);
                                        this._soundControl.fadeInMusic();
                                    },
                                    beginMessage: "Pause",
                                    finalMessage: "GO!",
                                    paused: true,
                                });
                            } else {
                                this._playerControl.update();
                            }
                        } else {
                            if (!this.gameOverTimeout) {
                                this.gameOverTimeout = setTimeout(() => {
                                    if (this._scoreControl.amount > this._credentailsControl.userData.highestScore) {
                                        this.setStatus(GameStatus.GameOverRecord);
                                    } else {
                                        this.setStatus(GameStatus.GameOver);
                                    }

                                    this.gameOverTimeout = null;
                                }, 2000);
                            }
                        }

                        this._levelControl.update();
                        this._seedControl.update();
                        this._projectileControl.update();
                        this._floatingTextControl.update();
                    }
                    break;
                case GameStatus.Paused:
                    {
                        if (document.hasFocus()) {
                            this.setStatus(GameStatus.Resuming);
                            this._soundControl.fadeInMusic();
                            this._countdownControl.run();
                        }
                    }
                    break;
            }

            this._particleControl.update();
            this._loadingControl.update();

            if (this._countdownControl.exists) {
                this._countdownControl.update();
            }
        }

        public render(): void {
            this.buffering.clearRect(0, 0, bufferingCanvas.width, bufferingCanvas.height);

            this._backgroundControl.render();

            switch (this.status) {
                case GameStatus.Start:
                case GameStatus.Login:
                case GameStatus.Menu:
                case GameStatus.Scoreboard:
                case GameStatus.GameOver:
                case GameStatus.GameOverRecord:
                    {
                        this._particleControl.render();
                        this._menuControl.render();
                    }
                    break;
            }

            this._gardenControl.render();

            switch (this.status) {
                case GameStatus.Starting:
                    {
                        this._playerControl.render();
                    }
                    break;
                case GameStatus.Running:
                    {
                        this._particleControl.render();
                        this._projectileControl.render();
                        this._floatingTextControl.render();

                        this._playerControl.render();
                        this._levelControl.render();
                        this._seedControl.render();
                        this._uiControl.render();
                    }
                    break;
            }

            if (this._countdownControl.exists) {
                this._countdownControl.render();
            }

            if (this._loadingControl.loading.isEnabled) {
                this._loadingControl.render();
            }

            this.renderContext.drawImage(bufferingCanvas, 0, 0);
        }

        private control(): void {
            if (this.status == GameStatus.Running) {
                this._playerControl.control();
                this._levelControl.control();
            }
        }
    }
}

export const Game = GameModule.Game.getInstance(canvas, buffering);
