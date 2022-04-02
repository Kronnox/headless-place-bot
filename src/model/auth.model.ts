export class Auth {

    private readonly _cookie;
    private readonly _modhash;

    constructor(cookie, modhash) {
        this._cookie = cookie;
        this._modhash = modhash;
    }

    get cookie() {
        return this._cookie;
    }

    get modhash() {
        return this._modhash;
    }
}
