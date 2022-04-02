import {AuthService} from "./auth.service";
import {CanvasService} from "./canvas.service";
import {Auth} from "./model/auth.model";

class App {

    static async main(): Promise<void> {
        const auth: Auth = await AuthService.login();
        const authToken: string = await AuthService.getAccessToken(auth);
        // const currentCanvasUrl = await CanvasService.getCurrentImageUrl(authToken);
        // const pixels = await CanvasService.getMapFromUrl(currentCanvasUrl);
        CanvasService.place(authToken, auth, 776, 528, 2)
            .then(r => console.log(r))
            .catch(r => console.log(r));
    }
}

void App.main();
