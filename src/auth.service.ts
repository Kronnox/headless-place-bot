import axios from "axios";
import FormData from "form-data";
import {Auth} from "./model/auth.model";

export class AuthService {

    public static async getAccessToken(auth: Auth): Promise<string> {
        //const usingOldReddit = window.location.href.includes('new.reddit.com');
        //const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
        const response = await axios.get('https://new.reddit.com/r/place/', { headers: {cookie: auth.cookie, 'x-modhash': auth.modhash,}});
        const responseText = await response.data;

        return responseText.split('\"accessToken\":\"')[1].split('"')[0];
    }

    public static async login(): Promise<Auth> {
        const data = new FormData();
        data.append('op', 'login');
        data.append('user', '<user>');
        data.append('passwd', '<password>');
        data.append('api_type', 'json');

        const response = await axios.post('https://www.reddit.com/api/login', data, { headers: { ...data.getHeaders() } })

        if (response.data.json.data) {
            const modhash = response.data.json.data.modhash;
            const cookie = response.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
            return new Auth(cookie, modhash);
            // cookies.set(user, cookie, modhash)
        } else {
            const msg = response.data.json.errors[0][0];
            if (msg === 'INCORRECT_USERNAME_PASSWORD') {
                console.log('Invalid user name or password');
            } else {
                console.log(response.data.json);
            }
        }

        return undefined;
    }
}
