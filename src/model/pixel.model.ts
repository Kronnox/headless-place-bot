export class Pixel {

    private r: number;
    private g: number;
    private b: number;
    private a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public getHex(): string {
        return '#' + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1).toUpperCase();
    }
}
