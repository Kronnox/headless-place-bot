import WebSocket from 'ws';
import axios from "axios";
import {Blueprint} from "./model/blueprint.model";
import {Pixel} from "./model/pixel.model";
import {Logger, LogLevel, LogType} from "./util/logger.util";

const getPixels = require("get-pixels");

export class CanvasService {

    public static async getCurrentImageUrl(accessToken: string, id: number = 0): Promise<string> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', 'graphql-ws', {
                headers : {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0",
                    "Origin": "https://hot-potato.reddit.com"
                }
            });

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    'type': 'connection_init',
                    'payload': {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }));
                ws.send(JSON.stringify({
                    'id': '1',
                    'type': 'start',
                    'payload': {
                        'variables': {
                            'input': {
                                'channel': {
                                    'teamOwner': 'AFD2022',
                                    'category': 'CANVAS',
                                    'tag': id+""
                                }
                            }
                        },
                        'extensions': {},
                        'operationName': 'replace',
                        'query': `subscription replace($input: SubscribeInput!) {
						subscribe(input: $input) {
							id
							... on BasicMessage {
								data {
									__typename
									... on FullFrameMessageData {
										__typename
										name
										timestamp
									}
								}
								__typename
							}
							__typename
						}
					}
					`
                    }
                }));
            };

            ws.onmessage = (message) => {
                const { data } = message;
                const parsed = JSON.parse(data);

                // TODO: ew
                if (!parsed.payload || !parsed.payload.data || !parsed.payload.data.subscribe || !parsed.payload.data.subscribe.data) return;

                ws.close();
                resolve(parsed.payload.data.subscribe.data.name);
            }


            ws.onerror = reject;
        });
    }

    public static async getMapFromUrl(url) {
        return new Promise((resolve, reject) => {
            getPixels(url, function(error, pixels) {
                if(error) {
                    reject(error);
                    return;
                }
                resolve(pixels);
            })
        });
    }

    public static async getCanvasSubset(accessToken: string, x: number, y: number, w: number, h: number): Promise<Pixel[]> {
        const canvasUrl: string = await this.getCurrentImageUrl(accessToken);
        const canvas2Url: string = await this.getCurrentImageUrl(accessToken, 1);
        const canvas: Blueprint = new Blueprint();
        await canvas.load(canvasUrl);
        const canvas2: Blueprint = new Blueprint();
        await canvas2.load(canvas2Url);

        const totalWidth: number = canvas.width + canvas2.width;

        let canvasPixels: Pixel[][] = [];

        let outPixels: Pixel[] = [];

        for (let cY = 0; cY < canvas.height; cY++) {
            let row: Pixel[] = [];
            for (let cX = 0; cX < canvas.width; cX++) {
                row.push(canvas.pixels[cX + cY*canvas.width]);
            }
            for (let cX = 0; cX < canvas2.width; cX++) {
                row.push(canvas2.pixels[cX + cY*canvas2.width]);
            }
            canvasPixels.push(row);
        }

        for (let cY = y; cY < y+h; cY++) {
            for (let cX = x; cX < x+w; cX++) {
                outPixels.push(canvasPixels[cY][cX]);
            }
        }

        return outPixels;
    }

    public static async place(accessToken: string, x: number, y: number, color): Promise<number> {

        const body: any = {
            'operationName': 'setPixel',
            'variables': {
                'input': {
                    'actionName': 'r/replace:set_pixel',
                    'PixelMessageData': {
                        'coordinate': {
                            'x': x % 1000,
                            'y': y % 1000
                        },
                        'colorIndex': color,
                        'canvasIndex': (x > 999 ? 1 : 0)
                    }
                }
            },
            'query': `mutation setPixel($input: ActInput!) {
				act(input: $input) {
					data {
						... on BasicMessage {
							id
							data {
								... on GetUserCooldownResponseMessageData {
									nextAvailablePixelTimestamp
									__typename
								}
								... on SetPixelResponseMessageData {
									timestamp
									__typename
								}
								__typename
							}
							__typename
						}
						__typename
					}
					__typename
				}
			}
			`
        };

        const response = await axios.post(
            'https://gql-realtime-2.reddit.com/query',
            body,
            {
                headers: {
                    'origin': 'https://hot-potato.reddit.com',
                    'referer': 'https://hot-potato.reddit.com/',
                    'apollographql-client-name': 'mona-lisa',
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const data = await response.data;
        if (data.errors != undefined) {
            Logger.log('Painting pixel failed! Waiting for cooldown...', LogLevel.WARNING, LogType.PAINTER);
            console.log(data.error);
            return data.errors[0].extensions?.nextAvailablePixelTs;
        }
        return data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp;
    }
}
