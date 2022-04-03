import axios from "axios";

export class AuthDetails {

    private readonly _cookie;
    private readonly _modhash: string;

    private _accessToken: string;

    constructor(cookie, modhash: string) {
        this._cookie = cookie;
        this._modhash = modhash;
    }

    public async updateAccessToken(): Promise<void> {
        //const usingOldReddit = window.location.href.includes('new.reddit.com');
        //const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
        const response = await axios.get('https://new.reddit.com/r/place/', { headers: {cookie: this._cookie, 'x-modhash': this._modhash,}});
        const responseText = await response.data;

        // TODO: dirty stuff... make it fancy
        this._accessToken = responseText.split('\"accessToken\":\"')[1].split('"')[0];
    }

    get accessToken(): string {
        return this._accessToken;
    }
}
