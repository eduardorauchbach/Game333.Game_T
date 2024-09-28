import { ScoreControl } from "../Control/score.js";

export interface Shooter {
    projectileVelocity: VectorSpeed;
    projectileColor: string;
    projectileSize: number;

    projectileSpecialVelocity: VectorSpeed;
    projectileSpecialColor: string;
    projectileSpecialSize: number;

    position: Vector;
    width: number;
    height: number;
}

export interface Vector {
    x: number;
    y: number;
}

//Stores a base axis speed so the game speed can be calculated from it every time
export class VectorSpeed implements Vector {
    private speed = () => ScoreControl.speed;

    get x(): number {
        return this.baseX * this.speed();
    }
    get y(): number {
        return this.baseY * this.speed();
    }
    get tilt(): number {
        return this.baseTilt * this.speed();
    }

    public baseX: number;
    public baseY: number;
    public baseTilt: number;

    constructor(vector: Vector, tilt: number = 0) {
        this.baseX = vector.x;
        this.baseY = vector.y;
        this.baseTilt = tilt;
    }
}

export class SpeedNormalizer {
    private speed = () => ScoreControl.speed;

    get value(): number {
        return this.baseValue / this.speed();
    }

    public baseValue: number;

    constructor(baseTime: number) {
        this.baseValue = baseTime;
    }
}