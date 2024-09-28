export module FrameDetectorModule {
    export class FrameDetectorControl {
        public frameRate: number = 60;
        private static _instance: FrameDetectorControl | null = null;

        public static getInstance(): FrameDetectorControl {
            if (!this._instance) {
                this._instance = new FrameDetectorControl();
            }

            return this._instance;
        }

        //Most browsers limit to 60s fps, but it get a more smooth value for the frame
        public async estimateFrameRate() {
            let frameCount = 0;
            let startTime: number;

            const measure = (timestamp: number) => {
                if (!startTime) {
                    startTime = timestamp;
                }

                frameCount++;

                // Check if 5 seconds have passed
                if (timestamp - startTime >= 5000) {
                    // Calculate average FPS
                    const fps = frameCount / 5; // since 5 seconds
                    this.getStandardFrameRate(fps).then((standardFps) => {
                        this.frameRate = Math.floor(standardFps);
                    });
                } else {
                    requestAnimationFrame(measure);
                }
            };

            requestAnimationFrame(measure);
        }

        private async getStandardFrameRate(fps: number): Promise<number> {
            const standardRates = [60, 120, 144, 240, 300]; // Add more standard rates as needed
            return standardRates.reduce((prev, curr) => (Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev));
        }
    }
}

export const FrameDetectorControl = FrameDetectorModule.FrameDetectorControl.getInstance();
