/**
 * Strictly throttle callbacks to a fixed number of requests per minute (rpm). This may produce overlapping 
 * callbacks if the callback takes too long to complete.
 * 
 * 
 */
export class StrictThrottle<T> {
    private buffer: T[] = [];
    private interval: number;
    private stopped: boolean;

    /**
     * Target rpm and listener
     * 
     * @param rpm 
     * @param listener 
     */
    constructor(private rpm: number, private listener: (v: T, throttle?: StrictThrottle<T>) => void, seed?: T[]) {
        this.interval = (60 * 1000) / rpm;
        if (seed) {
            this.buffer = seed;
        }
        this.trySend();
    }

    push(...value: T[]) {
        this.buffer.push(...value);
    }

    pushAll(values: T[]) {
        this.buffer.push(...values);
    }    

    pause() {
        this.stopped = true;
    }

    resume() {
        this.stopped = false;
    }

    private trySend() {
        if (!this.stopped) {
            if (this.buffer && this.buffer.length > 0) {
                this.listener(this.buffer.shift(), this);
            }

            setTimeout(() => this.trySend(), this.interval);
        }
    }
}