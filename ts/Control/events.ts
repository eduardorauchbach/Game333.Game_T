export module EventModule {
    export class EventControl {
        public leftControl: boolean | null;
        public rightControl: boolean | null;
        public shootControl: boolean | null;
        public specialControl: boolean | null;

        private static _instance: EventControl | null = null;

        public static getInstance(): EventControl {
            if (!this._instance) {
                this._instance = new EventControl();
            }
            return this._instance;
        }

        public initialize(): void {
            this.leftControl = false;
            this.rightControl = false;
            this.shootControl = false;
            this.specialControl = false;

            addEventListener("keydown", (event) => {
                switch (event.code.toLowerCase()) {
                    case "keya":
                    case "arrowleft":
                        {
                            this.leftActivate();
                        }
                        break;
                    case "keyd":
                    case "arrowright":
                        {
                            this.rightActivate();
                        }
                        break;
                    case "space":
                        {
                            this.shootActivate();
                        }
                        break;
                    case "keyw":
                    case "arrowup":
                        {
                            this.shootSpecialActivate();
                        }
                        break;
                }
            });

            addEventListener("keyup", (event) => {
                switch (event.code.toLowerCase()) {
                    case "keya":
                    case "arrowleft":
                        {
                            this.leftDeactivate();
                        }
                        break;
                    case "keyd":
                    case "arrowright":
                        {
                            this.rightDeactivate();
                        }
                        break;
                    case "space":
                        {
                            this.shootDeactivate();
                        }
                        break;
                    case "keyw":
                    case "arrowup":
                        {
                            this.shootSpecialDeactivate();
                        }
                        break;
                }
            });
        }

        public leftActivate(): void {
            this.leftControl = true;
        }
        public leftDeactivate(): void {
            this.leftControl = false;
        }

        public rightActivate(): void {
            this.rightControl = true;
        }
        public rightDeactivate(): void {
            this.rightControl = false;
        }

        public shootActivate(): void {
            this.shootControl = true;
        }
        public shootDeactivate(): void {
            this.shootControl = false;
        }

        public shootSpecialActivate(): void {
            this.specialControl = true;
        }
        public shootSpecialDeactivate(): void {
            this.specialControl = false;
        }
    }
}

export const EventControl = EventModule.EventControl.getInstance();
