import { PivotType } from "../Generic/render.js";
import { StaticControlEntity } from "../Generic/control.js";
import { ScoreControl, ScoreModule } from "../Control/score.js";
import { LifeBar, SpecialBar, TextElement } from "./ui-elements.js";
import { VectorSpeed } from "../Generic/vector.js";

export module UiModule {
    export class UiControl extends StaticControlEntity<Ui> {
        private _ui: Ui;
        private static _instance: UiControl | null = null;

        public static getInstance(): UiControl {
            if (!this._instance) {
                this._instance = new UiControl();
            }
            return this._instance;
        }

        public initialize(canvas: HTMLCanvasElement, buffering: CanvasRenderingContext2D): void {
            this.buffering = buffering;
            this.canvas = canvas;
            this._ui = new Ui();
        }

        public render(): void {
            this._ui.render(this.buffering);
        }
    }

    export class Ui {
        private scoreLabel: TextElement;
        private scoreAmount: TextElement;
        private lifeBar: LifeBar;
        private specialBar: SpecialBar;

        private scoreControl: ScoreModule.ScoreControl;

        constructor() {
            this.scoreControl = ScoreControl;

            //Score Label
            this.scoreLabel = new TextElement({
                position: { x: 15, y: 15 },
                velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                color: "white",
                size: 16,
                font: "Arial",
                pivotType: PivotType.origin,
                content: "Score:",
                fadePerTick: 0,
                fadeTime: 0,
            });

            //Score Amount
            this.scoreAmount = new TextElement({
                position: { x: 70, y: 14 },
                velocity: new VectorSpeed({ x: 0, y: 0 }, 0),
                color: "white",
                size: 18,
                font: "Arial",
                pivotType: PivotType.origin,
                content: () => this.scoreControl.amount,
                fadePerTick: 0,
                fadeTime: 0,
            });

            //Life Bar
            this.lifeBar = new LifeBar({
                position: { x: 700, y: 15 },
                size: 30,
            });

            //Special Bar
            this.specialBar = new SpecialBar({
                position: { x: 700, y: 45 },
                proportions: { width: 90, height: 10 },
            });
        }

        public render(buffering: CanvasRenderingContext2D) {
            this.scoreLabel.render(buffering);
            this.scoreAmount.render(buffering);
            this.lifeBar.render(buffering);
            this.specialBar.render(buffering);
        }
    }
}

export const UiControl = UiModule.UiControl.getInstance();
