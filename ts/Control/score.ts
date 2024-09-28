import { Configurations } from "../config.js";
import { FrameDetectorControl } from "./frameDetector.js";
import { PlayerControl } from "../Entities/player.js";

export module ScoreModule {
    export class ScoreControl {
        private static _instance: ScoreControl | null = null;

        public static getInstance(): ScoreControl {
            if (!this._instance) {
                this._instance = new ScoreControl();
            }
            return this._instance;
        }

        public get speed(): number {
            return (Configurations.Game.baseSpeed + this._amount / 10000) / FrameDetectorControl.frameRate;
        }

        public get amount(): number {
            return this._amount;
        }
        public get kills(): number {
            return this._kills;
        }
        public get levelKills(): number {
            return this._levelKills;
        }
        public get shoots(): number {
            return this._shoots;
        }
        public get hits(): number {
            return this._hits;
        }
        public get received(): number {
            return this._received;
        }

        private _amount: number;
        private _kills: number;
        private _levelKills: number;
        private _shoots: number;
        private _hits: number;
        private _received: number;

        public initialize() {
            this._amount = 100;
            this._kills = 0;
            this._shoots = 0;
            this._hits = 0;
            this._received = 0;
            this._levelKills = 0;
        }

        public addScore(value: number) {
            this._amount += value;
        }

        public addKill() {
            this._kills++;
        }
        public addLevelKill() {
            this._levelKills++;
        }
        public addShoot() {
            this._shoots++;
            this._amount -= 10; //Shoot cost;

            if (this._amount <= 0) {
                PlayerControl.kill();
            }
        }
        public addHits() {
            this._hits++;
        }
        public addReceived() {
            this._received++;
        }
    }
}

export const ScoreControl = ScoreModule.ScoreControl.getInstance();
