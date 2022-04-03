import axios from "axios";

export class OderService {

    private placeOrders: any;

    constructor() {
        axios.defaults.headers = {
            // @ts-ignore
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        };
    }

    public async updateOrders() {
        axios.get(`https://placede.github.io/pixel/pixel.json`).then(async (response) => {
            if (response.status != 200) return console.warn('Loading Orders failed!');
            const data = await response.data;

            if (data !== this.placeOrders) {
                const structureCount = Object.keys(data.structures).length;
                let pixelCount = 0;
                for (const structureName in data.structures) {
                    pixelCount += data.structures[structureName].pixels.length;
                }
                console.log(`Loaded new structures. Images: ${structureCount} - Pixels: ${pixelCount}.`);
            }
            this.placeOrders = data;
        }).catch((e) => console.warn('Loading Orders rejected!', e));
    }

}
