import { ImageHelper, ImageType } from "../Generic/helper.js";
import { VectorSpeed } from "../Generic/vector.js";

export module EnemyTemplateModule {
    export class EnemyTemplateControl {
        public enemyTemplates: Array<EnemyTemplate>;
        public levelTemplates: Array<LevelTemplate>;
        private static _instance: EnemyTemplateControl | null = null;

        public static getInstance(): EnemyTemplateControl {
            if (!this._instance) {
                this._instance = new EnemyTemplateControl();
            }
            return this._instance;
        }

        public initialize() {
            this.levelTemplates = [
                // Original Level 1
                new LevelTemplate({
                    projectileInterval: 1000,
                    grid: [
                        [1, 1, 1, 1, 1, 1, 1],
                        [1, 1, 1, 1, 1, 1, 1],
                        [1, 1, 1, 1, 1, 1, 1],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 987,
                    grid: [
                        [1, 1, 2, 1, 2, 1, 1],
                        [1, 2, 2, 2, 2, 2, 1],
                        [1, 1, 2, 1, 2, 1, 1],
                    ],
                }),
                // Original Level 2
                new LevelTemplate({
                    projectileInterval: 975,
                    grid: [
                        [2, 1, 1, 1, 1, 1, 2],
                        [2, 1, 1, 1, 1, 1, 2],
                        [2, 1, 1, 1, 1, 1, 2],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 962,
                    grid: [
                        [2, 2, 1, 2, 1, 2, 2],
                        [2, 1, 2, 2, 2, 1, 2],
                        [2, 2, 1, 2, 1, 2, 2],
                    ],
                }),
                // Original Level 3
                new LevelTemplate({
                    projectileInterval: 950,
                    grid: [
                        [1, 2, 2, 2, 2, 2, 2, 2, 1],
                        [1, 2, 1, 1, 1, 1, 1, 2, 1],
                        [1, 2, 1, 1, 1, 1, 1, 2, 1],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 938,
                    grid: [
                        [1, 2, 2, 3, 2, 3, 2, 2, 1],
                        [1, 3, 1, 1, 2, 1, 1, 3, 1],
                        [1, 2, 1, 2, 3, 2, 1, 2, 1],
                    ],
                }),
                // Original Level 4
                new LevelTemplate({
                    projectileInterval: 925,
                    grid: [
                        [3, 3, 3, 3, 3, 3, 3, 3, 3],
                        [1, 2, 2, 2, 2, 2, 2, 2, 1],
                        [1, 2, 2, 2, 2, 2, 2, 2, 1],
                        [1, 2, 2, 2, 2, 2, 2, 2, 1],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 913,
                    grid: [
                        [3, 3, 4, 3, 4, 3, 4, 3, 3],
                        [1, 4, 2, 2, 3, 2, 2, 4, 1],
                        [1, 3, 2, 4, 4, 4, 2, 3, 1],
                        [1, 2, 4, 3, 3, 3, 4, 2, 1],
                    ],
                }),
                // Original Level 5
                new LevelTemplate({
                    projectileInterval: 900,
                    grid: [
                        [2, 3, 3, 4, 3, 4, 3, 3, 2],
                        [2, 3, 2, 2, 2, 2, 2, 3, 2],
                        [2, 3, 2, 2, 2, 2, 2, 3, 2],
                        [2, 3, 2, 2, 2, 2, 2, 3, 2],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 888,
                    grid: [
                        [2, 4, 3, 4, 4, 4, 3, 4, 2],
                        [2, 3, 3, 3, 3, 3, 3, 3, 2],
                        [2, 4, 2, 2, 4, 2, 2, 4, 2],
                        [2, 3, 2, 4, 3, 4, 2, 3, 2],
                    ],
                }),
                // Original Level 6
                new LevelTemplate({
                    projectileInterval: 875,
                    grid: [
                        [3, 4, 4, 3, 3, 3, 4, 4, 3],
                        [3, 4, 4, 3, 3, 3, 4, 4, 3],
                        [3, 4, 4, 3, 3, 3, 4, 4, 3],
                        [3, 2, 2, 2, 2, 2, 2, 2, 3],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 863,
                    grid: [
                        [3, 4, 4, 4, 3, 4, 4, 4, 3],
                        [4, 4, 3, 3, 3, 3, 3, 4, 4],
                        [3, 4, 3, 3, 4, 3, 3, 4, 3],
                        [3, 3, 4, 3, 3, 3, 4, 3, 3],
                    ],
                }),
                // Original Level 7
                new LevelTemplate({
                    projectileInterval: 850,
                    grid: [
                        [3, 4, 4, 4, 4, 4, 4, 4, 3],
                        [3, 4, 4, 4, 4, 4, 4, 4, 3],
                        [3, 4, 4, 4, 4, 4, 4, 4, 3],
                        [3, 3, 3, 3, 3, 3, 3, 3, 3],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 838,
                    grid: [
                        [4, 4, 4, 4, 4, 4, 4, 4, 4],
                        [3, 4, 4, 3, 4, 3, 4, 4, 3],
                        [3, 4, 3, 4, 4, 4, 3, 4, 3],
                        [3, 3, 4, 3, 3, 3, 4, 3, 3],
                    ],
                }),
                // Original Level 8
                new LevelTemplate({
                    projectileInterval: 825,
                    grid: [
                        [5, 4, 4, 4, 4, 4, 4, 4, 5],
                        [5, 4, 4, 4, 4, 4, 4, 4, 5],
                        [5, 3, 3, 3, 3, 3, 3, 3, 5],
                        [5, 3, 3, 3, 3, 3, 3, 3, 5],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 813,
                    grid: [
                        [5, 5, 4, 4, 5, 4, 4, 5, 5],
                        [4, 5, 4, 4, 4, 4, 4, 5, 4],
                        [5, 4, 5, 3, 3, 3, 5, 4, 5],
                        [5, 3, 3, 5, 5, 5, 3, 3, 5],
                    ],
                }),
                // Original Level 9
                new LevelTemplate({
                    projectileInterval: 800,
                    grid: [
                        [6, 6, 6, 6, 6, 6, 6, 6, 6],
                        [6, 5, 5, 5, 5, 5, 5, 5, 6],
                        [6, 5, 5, 5, 5, 5, 5, 5, 6],
                        [6, 5, 5, 5, 5, 5, 5, 5, 6],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 788,
                    grid: [
                        [6, 6, 6, 6, 7, 6, 6, 6, 6],
                        [6, 6, 5, 5, 5, 5, 5, 6, 6],
                        [6, 5, 6, 5, 6, 5, 6, 5, 6],
                        [6, 5, 5, 6, 6, 6, 5, 5, 6],
                    ],
                }),
                // Original Level 10
                new LevelTemplate({
                    projectileInterval: 775,
                    grid: [
                        [5, 6, 7, 7, 7, 7, 7, 7, 7, 6, 5],
                        [5, 6, 7, 7, 7, 7, 7, 7, 7, 6, 5],
                        [5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5],
                        [5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 763,
                    grid: [
                        [5, 7, 7, 7, 8, 7, 7, 7, 5],
                        [5, 7, 6, 6, 6, 6, 6, 7, 5],
                        [5, 6, 7, 6, 7, 6, 7, 6, 5],
                        [5, 6, 6, 7, 7, 7, 6, 6, 5],
                    ],
                }),
                // Original Level 11
                new LevelTemplate({
                    projectileInterval: 750,
                    grid: [
                        [5, 6, 7, 7, 7, 7, 7, 7, 7, 6, 5],
                        [5, 6, 7, 7, 7, 7, 7, 7, 7, 6, 5],
                        [5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5],
                        [5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5],
                        [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                    ],
                }),
                // New Intermediate Level
                new LevelTemplate({
                    projectileInterval: 738,
                    grid: [
                        [8, 7, 7, 8, 8, 8, 7, 7, 8],
                        [6, 7, 6, 7, 7, 7, 6, 7, 6],
                        [6, 6, 7, 6, 6, 6, 7, 6, 6],
                        [6, 7, 6, 7, 7, 7, 8, 7, 6],
                        [5, 6, 6, 6, 6, 6, 6, 6, 5],
                    ],
                }),
                // Original Level 12 (Final Level)
                new LevelTemplate({
                    projectileInterval: 700,
                    grid: [
                        [6, 8, 8, 8, 8, 8, 8, 8, 8, 8, 6],
                        [6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6],
                        [6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6],
                        [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
                        [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                    ],
                }),
            ];

            this.enemyTemplates = [
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 3 }),
                    projectileColor: "LimeGreen",
                    projectileSize: 12,
                    image: ImageType.Invader01,
                    imageBloom: ImageType.Invader01Bloom,
                    imageBloomShadow: ImageType.Invader01BloomShadow,
                    points: 100,
                    hp: 1,
                    size: 0.5,
                }),
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 3.5 }),
                    projectileColor: "Cyan",
                    projectileSize: 12,
                    image: ImageType.Invader02,
                    imageBloom: ImageType.Invader02Bloom,
                    imageBloomShadow: ImageType.Invader02BloomShadow,
                    points: 150,
                    hp: 1,
                    size: 0.5,
                }),
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 3.5 }),
                    projectileColor: "Orange",
                    projectileSize: 12,
                    image: ImageType.Invader03,
                    imageBloom: ImageType.Invader03Bloom,
                    imageBloomShadow: ImageType.Invader03BloomShadow,
                    points: 200,
                    hp: 1,
                    size: 0.6,
                }),
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 4 }),
                    projectileColor: "Salmon",
                    projectileSize: 12,
                    image: ImageType.Invader04,
                    imageBloom: ImageType.Invader04Bloom,
                    imageBloomShadow: ImageType.Invader04BloomShadow,
                    points: 250,
                    hp: 1,
                    size: 0.5,
                }),
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 4 }),
                    projectileColor: "OrangeRed",
                    projectileSize: 12,
                    image: ImageType.Invader05,
                    imageBloom: ImageType.Invader05Bloom,
                    imageBloomShadow: ImageType.Invader05BloomShadow,
                    points: 280,
                    hp: 1,
                    size: 0.5,
                }),
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 4 }),
                    projectileColor: "Orchid",
                    projectileSize: 12,
                    image: ImageType.Invader06,
                    imageBloom: ImageType.Invader06Bloom,
                    imageBloomShadow: ImageType.Invader06BloomShadow,
                    points: 600,
                    hp: 2,
                    size: 0.6,
                }),
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 4 }),
                    projectileColor: "MediumPurple",
                    projectileSize: 12,
                    image: ImageType.Invader07,
                    imageBloom: ImageType.Invader07Bloom,
                    imageBloomShadow: ImageType.Invader07BloomShadow,
                    points: 700,
                    hp: 2,
                    size: 0.7,
                }),
                new EnemyTemplate({
                    projectileVelocity: new VectorSpeed({ x: 0, y: 5 }),
                    projectileColor: "Fuchsia",
                    projectileSize: 12,
                    image: ImageType.Invader08,
                    imageBloom: ImageType.Invader08Bloom,
                    imageBloomShadow: ImageType.Invader08BloomShadow,
                    points: 1000,
                    hp: 3,
                    size: 0.6,
                }),
            ];
        }
    }

    interface LevelTemplateParameters {
        projectileInterval: number;
        grid: Array<Array<number>>;
    }

    interface EnemyTemplateParameters {
        projectileVelocity: VectorSpeed;
        projectileColor: string;
        projectileSize: number;
        image: ImageType;
        imageBloom: ImageType;
        imageBloomShadow: ImageType;
        points: number;
        hp: number;
        size: number;
    }

    export class LevelTemplate {
        public projectileInterval: number;
        public grid: Array<Array<number>>;

        constructor(parameters: LevelTemplateParameters) {
            this.projectileInterval = parameters.projectileInterval;
            this.grid = parameters.grid;
        }
    }

    export class EnemyTemplate {
        public projectileVelocity: VectorSpeed;
        public projectileColor: string;
        public projectileSize: number;
        public image: HTMLImageElement;
        public imageBloom: HTMLImageElement;
        public imageBloomShadow: HTMLImageElement;
        public points: number;
        public hp: number;
        public size: number;

        constructor(parameters: EnemyTemplateParameters) {
            this.loadImages(parameters);

            this.projectileVelocity = parameters.projectileVelocity;
            this.projectileColor = parameters.projectileColor;
            this.projectileSize = parameters.projectileSize;

            this.points = parameters.points;
            this.hp = parameters.hp;
            this.size = parameters.size;
        }

        async loadImages(parameters: EnemyTemplateParameters) {
            this.image = await ImageHelper.getImage(parameters.image);
            this.imageBloom = await ImageHelper.getImage(parameters.imageBloom);
            this.imageBloomShadow = await ImageHelper.getImage(parameters.imageBloomShadow);
        }
    }
}

export const EnemyTemplateControl = EnemyTemplateModule.EnemyTemplateControl.getInstance();
