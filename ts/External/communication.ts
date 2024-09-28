import { CredentialsControl, CredentialsModule } from "./credentials.js";
import { Game, GameModule } from "../game.js";
import { LoadingControl } from "../Menu/loading.js";
import { ScoreControl } from "../Control/score.js";

export module CommunicationModule {
    export class CommunicationControl {
        public communication: Communication;
        private static _instance: CommunicationControl | null = null;

        public static getInstance() {
            if (!this._instance) {
                this._instance = new CommunicationControl();
            }
            return this._instance;
        }

        public initialize(): void {
            this.communication = new Communication();
        }

        public async getScores(): Promise<Array<UserScore>> {
            return await this.communication.getScores();
        }

        public createSession() {
            this.communication.createSession();
        }

        public commitSession() {
            this.communication.commitSession();
        }
    }

    export class Communication {
        private errorMessage: string;

        private sessionId: string;
        private running: boolean;

        constructor() {
            this.sessionId = "";
            this.errorMessage = "Ops! There was some problem, try again later";
        }

        public async getScores(): Promise<Array<UserScore>> {
            if (!this.running) {
                this.lock();

                try {
                    let id = CredentialsControl.userData ? CredentialsControl.userData.userId : null;

                    const result: any = await this.getRequest("http://localhost:5126/api/v1/score", id);
                    this.unlock();

                    return result.data as Array<UserScore>;
                } catch (error) {
                    this.unlock();
                    alert(this.errorMessage);

                    return null;
                }
            } else {
                return null;
            }
        }

        public createSession() {
            window.focus();

            if (!this.running) {
                this.lock();

                this.postRequest("http://localhost:5126/api/v1/score", CredentialsControl.userData)
                    .then((response: any) => {
                        if (response.status != 500) {
                            this.sessionId = response.data.id;
                            CredentialsControl.userData.highestScore = response.data.amount;

                            Game.setStatus(GameModule.GameStatus.Starting);
                        } else {
                            alert(this.errorMessage);
                        }
                        this.unlock();
                    })
                    .catch((data) => {
                        this.unlock();
                        alert(this.errorMessage);
                    });
            }
        }

        public commitSession() {
            if (!this.running) {
                this.lock();
                let data = new SyncData(CredentialsControl.userData);

                data.id = this.sessionId;
                data.amount = ScoreControl.amount;
                data.kills = ScoreControl.kills;
                data.levelKills = ScoreControl.levelKills;
                data.shoots = ScoreControl.shoots;
                data.hits = ScoreControl.hits;
                data.received = ScoreControl.received;

                return this.putRequest("http://localhost:5126/api/v1/score", this.sessionId, data)
                    .then((response: any) => {
                        if (response.status != 500) {
                            Game.setStatus(GameModule.GameStatus.Menu);
                        } else {
                            alert(this.errorMessage);
                        }
                        this.unlock();
                    })
                    .catch((data) => {
                        this.unlock();
                        alert(this.errorMessage);
                    });
            }
        }

        private getRequest(url: string, id: string) {
            url = id != null ? `${url}?userid=${id}` : url;

            return new Promise((resolve, reject) => {
                fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then(async (response) => {
                        return response.json().then((json) => ({ status: response.status, data: json }));
                    })
                    .then((data) => resolve(data))
                    .catch((error) => reject(error));
            });
        }

        private postRequest(url: string, data: CredentialsModule.UserData) {
            return new Promise((resolve, reject) => {
                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: data != null ? JSON.stringify(data) : null,
                })
                    .then(async (response) => {
                        return response.json().then((json) => ({ status: response.status, data: json }));
                    })
                    .then((data) => resolve(data))
                    .catch((error) => reject(error));
            });
        }

        private putRequest(url: string, id: string, data: SyncData) {
            return new Promise((resolve, reject) => {
                fetch(`${url}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: data != null ? JSON.stringify(data) : null,
                })
                    .then(async (response) => {
                        return response.json().then((json) => ({ status: response.status, data: json }));
                    })
                    .then((data) => resolve(data))
                    .catch((error) => reject(error));
            });
        }

        private lock() {
            this.running = true;
            LoadingControl.loading.activate();
        }

        private unlock() {
            this.running = false;
            LoadingControl.loading.inactivate();
        }
    }

    class UserScore {
        public index: number;
        public userId?: string;
        public userName: string;
        public amount: number;
        public self: boolean;
    }

    class SyncData {
        public userId: string;
        public userName: string;
        public userEmail: string;
        public highestScore: number;

        public id: string;
        public amount: number;
        public kills: number;
        public levelKills: number;
        public shoots: number;
        public hits: number;
        public received: number;

        constructor(userData: CredentialsModule.UserData) {
            this.userId = userData.userId;
            this.userName = userData.userName;
            this.userEmail = userData.userEmail;
            this.highestScore = userData.highestScore;
        }
    }
}

export const CommunicationControl = CommunicationModule.CommunicationControl.getInstance();
