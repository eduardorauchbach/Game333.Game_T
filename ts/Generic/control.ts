export abstract class StaticControlEntity<T> {
    protected canvas: HTMLCanvasElement;
    protected buffering: CanvasRenderingContext2D;

    public abstract render(): void;
}

export abstract class ControlEntity<T> extends StaticControlEntity<T> {
    public abstract update(event: MouseEvent): void;
}

export abstract class KillableControlEntity<T> extends ControlEntity<T> {
    public abstract kill(target: T, emitParticles: boolean): void;
}
