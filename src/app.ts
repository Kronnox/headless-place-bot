import {CanvasService} from "./canvas.service";
import {Account} from "./model/account.model";
import accountsJson from '../accounts.json';
import {Blueprint} from "./model/blueprint.model";
import {Pixel} from "./model/pixel.model";
import {COLOR_MAPPINGS} from "../colors.config";

class App {

    private accountInfos = accountsJson.accounts
    private accounts: Account[] = [];

    private target: Blueprint = new Blueprint();

    public async main(): Promise<void> {
        await this.target.load('https://veni.vidi.vodka/index.php/s/grtzcSXMqHe9L7r/preview');

        for (let name of Object.keys(this.accountInfos)) {
            const account: Account = new Account(name);
            await account.login(name, this.accountInfos[name]);
            this.accounts.push(account);
        }

        await new Promise(r => setTimeout(r, 500));

        for (let accountId = 0; accountId < this.accounts.length; accountId++) {
            await this.tryPaint(accountId);
        }
    }

    private async tryPaint(accountId: number) {
        const account: Account = this.accounts[accountId];

        await account.authDetails.updateAccessToken();
        const authToken: string = account.authDetails.accessToken;

        const x: number = 1167;
        const y: number = 291;
        const canvasPixels: Pixel[] = await CanvasService.getCanvasSubset(authToken, x, y, this.target.width, this.target.height);

        for (let pixel = 0; pixel < this.target.pixels.length; pixel++) {
            const h1 = this.target.pixels[pixel].getHex();
            const h2 = canvasPixels[pixel].getHex();
            if (h1 == h2) continue;

            const cX: number = x + pixel % this.target.width;
            const cY: number = y + Math.round(pixel / this.target.width);
            const color: number = COLOR_MAPPINGS[this.target.pixels[pixel].getHex()];

            console.log(cX+" "+cY+" "+color);
            await this.paint(accountId, cX, cY, color);
            break;
        }
    }

    private async paint(accountId: number, x: number, y: number, color: number): Promise<void> {
        const account: Account = this.accounts[accountId];

        await account.authDetails.updateAccessToken();
        const authToken: string = account.authDetails.accessToken;
        // const currentCanvasUrl = await CanvasService.getCurrentImageUrl(authToken);
        // const pixels = await CanvasService.getMapFromUrl(currentCanvasUrl);
        console.log('Painting...')
        CanvasService.place(authToken, x, y, color)
            .then(r => this.schedulePaint(accountId, r))
            .catch(r => this.schedulePaint(accountId, r));
    }

    private async schedulePaint(accountId: number, timestamp: number): Promise<void> {
        const remainingMs: number = timestamp - Date.now();
        console.log(`Scheduled paint for ${new Date(timestamp).toTimeString()}`);
        setTimeout(() => this.tryPaint(accountId), remainingMs + 10);
    }
}

new App().main()
    .then(r => console.log(r))
    .catch(r => console.log(r));
