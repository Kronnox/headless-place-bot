import {CanvasService} from "../canvas.service";
import {Pixel} from "./pixel.model";

export class Blueprint {

    private _width: number;
    private _height: number;

    private _pixels: Pixel[] = [];

    public async load(url: string) {
        const image: any = await CanvasService.getMapFromUrl(url);
        this._width = image.shape[0];
        this._height = image.shape[1];

        for (let i = 0; i < image.data.length; i = i+4) {
            this._pixels.push(new Pixel(image.data[i], image.data[i+1], image.data[i+2], image.data[i+3]));
        }
    }

    get height(): number {
        return this._height;
    }

    get width(): number {
        return this._width;
    }

    get pixels(): Pixel[] {
        return this._pixels;
    }
}
