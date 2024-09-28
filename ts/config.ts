module Settings {
    export class Debug {
        public static static = true;
        public static base = true;
        public static killable = true;
        public static asset = false;
    }

    export class Game {
        public static baseSpeed = 50;
        public static enableCredentials = false;
        public static googleKey = "";
    }

    export class Volume {
        public static global = 1;

        public static music = 0.5;
        public static enemy = 0.4;
        public static player = 0.4;
    }

    export class Player {
        public static projectileInterval = 400;
        public static projectileSize = 6;
        public static projectileSpeed = 4;
        public static projectileSpecialInterval = 10000;
        public static projectileSpecialSize = 10;
        public static projectileSpecialSpeed = 8;
        public static projectileSpecialHp = 10;
        public static collisionTolerance = 10;
        public static hp = 3;
    }

    export class FloatingText {
        public static fadeTime = 100;
    }

    export class Enemy {
        public static collisionTolerance = 2;
        public static tilt = 0.02;
    }

    export class Level {
        public static speed = 0.8;
        public static itemSize = 50;
        public static step = 15;
    }

    export class Garden {
        public static height = 40;
        public static scale = 0.4;
    }

    export class Countdown {
        public static eventDelay = 300;
        public static killDelay = 1000;
    }

    export class Scoreboard {
        public static collumn1 = 50;
        public static collumn2 = 400;
        public static collumn3 = 50;
        public static collumnSpace = 10;
        public static lineSpace = 25;        
    }
}

export const Configurations = Settings;