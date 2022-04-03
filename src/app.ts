import {CanvasHelper} from "./canvas.helper";
import {Account} from "./model/account.model";
import accountsJson from '../accounts.json';
import {Logger, LogLevel, LogType} from "./util/logger.util";
import WebSocket from 'ws';

class App {

    private accountInfos = accountsJson.accounts
    private accounts: Account[] = [];

    private ccConnection: WebSocket;
    private VERSION: number = 1;

    public async main(): Promise<void> {
        this.ccConnection = new WebSocket('wss://socketsbay.com/wss/v2/2/demo/')

        const mainClass = this;
        this.ccConnection.onopen = function () {
            Logger.log("WebSocket connection established!");
            mainClass.ccConnection.send(JSON.stringify({ "platform": "nodejs", "version": mainClass.VERSION }));
        };

        this.ccConnection.onerror = function (error) {
            Logger.log('WebSocket Error: '+ error.message);
        };

        this.ccConnection.onmessage  = function (message) {
            mainClass.processOperation(message);
        };

        for (let name of Object.keys(this.accountInfos)) {
            const account: Account = new Account(name);
            await account.login(name, this.accountInfos[name]);
            this.accounts.push(account);
        }

        await new Promise(r => setTimeout(r, 500));

        for (let accountId = 0; accountId < this.accounts.length; accountId++) {
            // await this.tryPaint(accountId);
            this.ccConnection.send("request_pixel");
        }
    }

    private processOperation(message): void {
        console.log('WebSocket Message received: '+message.data);
        let messageData;
        try {
            messageData = JSON.parse(message.data);
        } catch {
            // Ignore malformed messages
            return;
        }
        switch (messageData.operation) {
            case 'place-pixel':
                void this.processOperationPlacePixel(messageData.data);
                return;
            case 'notify-update':
                void this.processOperationNotifyUpdate(messageData.data);
                return;
        }
    }

    private async processOperationPlacePixel(data): Promise<void> {
        const x = data.x;
        const y = data.y;
        const color = data.color;

        const time = new Date().getTime();
        // TODO: accounts
        let nextAvailablePixelTimestamp: number = await CanvasHelper.place(this.accounts[0].authDetails.accessToken, x, y, color) ?? new Date(time + 1000 * 60 * 5 + 1000 * 15).valueOf();

        // Sanity check timestamp
        if (nextAvailablePixelTimestamp < time || nextAvailablePixelTimestamp > time + 1000 * 60 * 5 + 1000 * 15) {
            nextAvailablePixelTimestamp = time + 1000 * 60 * 5 + 1000 * 15;
        }

        // Add a few random seconds to the next available pixel timestamp
        const waitFor = nextAvailablePixelTimestamp - time + (Math.random() * 1000 * 15);

        const minutes = Math.floor(waitFor / (1000 * 60))
        const seconds = Math.floor((waitFor / 1000) % 60)
        Logger.log(`Warten auf Abklingzeit ${minutes}:${seconds} bis ${new Date(nextAvailablePixelTimestamp).toLocaleTimeString()}`)
        setTimeout(this.setReady, waitFor);
    }

    private async processOperationNotifyUpdate(data): Promise<void> {
        Logger.log(`Neue Version verfügbar! Aktulaisiere unter TBD`, LogLevel.WARNING, LogType.PAINTER)
    }

    private setReady(): void {
        this.ccConnection.send("request_pixel");
    }
}

new App().main().catch(r => console.log(r));
