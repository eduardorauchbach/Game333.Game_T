export interface Proportions {
    width: number;
    height: number;
}

export class RenderInformation {
    public brightness: number = 0;
    public opacity: number = 1;
    public rotation: number = 0;
    public color: string;
    public pivotType: PivotType = PivotType.center;
}

export enum PivotType {
    center,
    origin,
}
