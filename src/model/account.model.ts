import {AuthDetails} from "./auth-details.model";
import FormData from "form-data";
import axios from "axios";

export class Account {

    private name: string;

    private _authDetails: AuthDetails;
    private _authenticated: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    public async login(name: string, password: string): Promise<AuthDetails> {
        console.log(`Logging in ${name}...`);

        const data = new FormData();
        data.append('op', 'login');
        data.append('user', name);
        data.append('passwd', password);
        data.append('api_type', 'json');

        const response = await axios.post('https://www.reddit.com/api/login', data, { headers: { ...data.getHeaders() } })

        if (response.data.json.data) {
            const modhash = response.data.json.data.modhash;
            const cookie = response.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
            this._authDetails = new AuthDetails(cookie, modhash);
            this._authenticated = true;
        } else {
            const msg = response.data.json.errors[0][0];
            if (msg === 'INCORRECT_USERNAME_PASSWORD') {
                console.log(`Invalid user name or password for ${name}`);
            } else {
                console.log(`Error: ${response.data.json}`);
            }
        }

        return undefined;
    }

    get authDetails(): AuthDetails {
        return this._authDetails;
    }

    get authenticated(): boolean {
        return this._authenticated;
    }
}
