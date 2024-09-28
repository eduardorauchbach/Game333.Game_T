import { Configurations } from "../config.js";
import { Game, GameModule } from "../game.js";

declare const google: any;

export module CredentialsModule {
    export class CredentialsControl {
        public userData: UserData | null;
        private loginOn: boolean = false;

        private static _instance: CredentialsControl | null = null;
        declare google: any;

        public static getInstance(): CredentialsControl {
            if (!this._instance) {
                this._instance = new CredentialsControl();
            }
            return this._instance;
        }

        public initialize() {
            this.userData = new UserData({
                userId: "",
                userName: "",
                userEmail: "",
                highestScore: 0,
            })

            if (Configurations.Game.enableCredentials) {
                google.accounts.id.initialize({
                    client_id: Configurations.Game.googleKey,
                    callback: this.handleResult.bind(this),
                    use_fedcm_for_prompt: true
                });
            }
        }

        public login() {
            if (!this.loginOn) {
                this.loginOn = true;
                google.accounts.id.prompt();
            }
        }

        handleResult(response: any) {
            console.log("Encoded JWT ID token: " + response.credential);

            // Decode the JWT token to extract user information
            const base64Url = response.credential.split(".")[1]; // Get the payload part
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Convert Base64Url to Base64
            const payload = JSON.parse(atob(base64)); // Decode Base64 and parse JSON

            this.userData = new UserData({
                userId: payload.sub,
                userName: payload.name,
                userEmail: payload.email,
                highestScore: payload.highestScore,
            });

            this.loginOn = false;
            Game.setStatus(GameModule.GameStatus.Menu);
        }
    }

    export interface UserDataParameters {
        userId: string;
        userName: string;
        userEmail: string;
        highestScore: number;
    }

    export class UserData {
        public userId: string;
        public userName: string;
        public userEmail: string;
        public highestScore: number;

        constructor(parameters: UserDataParameters) {
            this.userId = parameters.userId;
            this.userName = parameters.userName;
            this.userEmail = parameters.userEmail;
            this.highestScore = parameters.highestScore;
        }
    }
}

export const CredentialsControl = CredentialsModule.CredentialsControl.getInstance();
