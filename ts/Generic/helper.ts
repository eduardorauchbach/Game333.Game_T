import { StaticEntity } from "./entitiy.js";
import { Vector } from "./vector.js";

export class Helper {
    private static _canvas: HTMLCanvasElement;

    public static initialize(canvas: HTMLCanvasElement): void {
        this._canvas = canvas;
    }

    public static outOfBounds(position: Vector, bottomPadding: number = 0): boolean {
        return (
            position.y <= 0 ||
            position.y >= Helper._canvas.height - bottomPadding ||
            position.x <= 0 ||
            position.x >= Helper._canvas.width
        );
    }

    public static getCanvasPositionX(entity: StaticEntity, tolerance: number = 0): number {
        return entity.position.x - (entity.width - tolerance * 2) / 2;
    }

    public static getCanvasPositionY(entity: StaticEntity, tolerance: number = 0): number {
        return entity.position.y - (entity.height - tolerance * 2) / 2;
    }

    public static getCanvasCenterX(): number {
        return this._canvas.width / 2;
    }

    public static getCanvasCenterY(): number {
        return this._canvas.height / 2;
    }
}

export class ImageHelper {
    private static _preloadedImages: { [key: string]: Promise<HTMLImageElement> } = {};

    public static async initialize() {
        for (const imageType in ImageType) {
            const url = ImageType[imageType as keyof typeof ImageType];
            this._preloadedImages[url] = this.loadImage(url);
        }
        Promise.all(Object.values(this._preloadedImages));
    }

    private static loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = url;

            if (image.complete && image.naturalWidth !== 0) {
                resolve(image);
            }
        });
    }

    public static async getImage(type: ImageType): Promise<HTMLImageElement> {
        return await this._preloadedImages[type];
    }
}

export class SoundHelper {
    private static _preloadedSounds: { [key: string]:  Promise<HTMLAudioElement> } = {};

    public static async initialize() {
        for (const soundType in SoundType) {
            const url = SoundType[soundType as keyof typeof SoundType];
            this._preloadedSounds[url] = this.loadAudio(url);
        }
    }

    private static loadAudio(url: string): Promise<HTMLAudioElement> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = reject;
            audio.src = url;
        });
    }

    public static async getSound(type: SoundType): Promise<HTMLAudioElement> {
        return await this._preloadedSounds[type];
    }
}

export enum ImageType {
    Grass = "./img/grass.png",
    Invader01 = "./img/invader-01.png",
    Invader01Bloom = "./img/invader-01-bloom.png",
    Invader01BloomShadow = "./img/invader-01-bloom-shadow.png",
    Invader02 = "./img/invader-02.png",
    Invader02Bloom = "./img/invader-02-bloom.png",
    Invader02BloomShadow = "./img/invader-02-bloom-shadow.png",
    Invader03 = "./img/invader-03.png",
    Invader03Bloom = "./img/invader-03-bloom.png",
    Invader03BloomShadow = "./img/invader-03-bloom-shadow.png",
    Invader04 = "./img/invader-04.png",
    Invader04Bloom = "./img/invader-04-bloom.png",
    Invader04BloomShadow = "./img/invader-04-bloom-shadow.png",
    Invader05 = "./img/invader-05.png",
    Invader05Bloom = "./img/invader-05-bloom.png",
    Invader05BloomShadow = "./img/invader-05-bloom-shadow.png",
    Invader06 = "./img/invader-06.png",
    Invader06Bloom = "./img/invader-06-bloom.png",
    Invader06BloomShadow = "./img/invader-06-bloom-shadow.png",
    Invader07 = "./img/invader-07.png",
    Invader07Bloom = "./img/invader-07-bloom.png",
    Invader07BloomShadow = "./img/invader-07-bloom-shadow.png",
    Invader08 = "./img/invader-08.png",
    Invader08Bloom = "./img/invader-08-bloom.png",
    Invader08BloomShadow = "./img/invader-08-bloom-shadow.png",
    MageBack01 = "./img/mage-back-01.png",
    MageBack02 = "./img/mage-back-02.png",
    MageBack03 = "./img/mage-back-03.png",
    MageBack04 = "./img/mage-back-04.png",
}

export enum SoundType {
    EnemyShoot = "./audio/enemyShoot.wav",
    PlayerShoot = "./audio/shoot.wav",
    Explode = "./audio/explode.wav",
    BackgroundMusic = "./audio/backgroundMusic.wav",
    Select = "./audio/select.mp3",
    Record = "./audio/record.mp3",
    Die = "./audio/die.mp3",
}
