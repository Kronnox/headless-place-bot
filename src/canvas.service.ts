import WebSocket from 'ws';
import axios from "axios";
import {Auth} from "./model/auth.model";

const getPixels = require("get-pixels");

export class CanvasService {

    public static async getCurrentImageUrl(accessToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('Create websocket...');
            const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', 'graphql-ws', {
                headers : {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0",
                    "Origin": "https://hot-potato.reddit.com"
                }
            });

            ws.onopen = () => {
                console.log('Init connection...');
                ws.send(JSON.stringify({
                    'type': 'connection_init',
                    'payload': {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }));
                console.log('Request canvas...');
                ws.send(JSON.stringify({
                    'id': '1',
                    'type': 'start',
                    'payload': {
                        'variables': {
                            'input': {
                                'channel': {
                                    'teamOwner': 'AFD2022',
                                    'category': 'CANVAS',
                                    'tag': '0'
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
            getPixels(url, function(err, pixels) {
                if(err) {
                    console.log("Bad image path");
                    reject(err);
                    return;
                }
                console.log("got pixels", pixels.shape.slice());
                resolve(pixels);
            })
        });
    }

    public static async place(accessToken: string, auth: Auth, x: number, y: number, color) {

        const body: any = {
            'operationName': 'setPixel',
            'variables': {
                'input': {
                    'actionName': 'r/replace:set_pixel',
                    'PixelMessageData': {
                        'coordinate': {
                            'x': x,
                            'y': y
                        },
                        'colorIndex': color,
                        'canvasIndex': 0
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
                    // cookie: auth.cookie,
                    // 'x-modhash': auth.modhash,
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
            console.log('Fehler beim Platzieren des Pixels, warte auf Abkühlzeit...');
            console.log(data.errors);
            return data.errors[0].extensions?.nextAvailablePixelTs;
        }
        return data?.data?.act?.data?.[0]?.data?.nextAvailablePixelTimestamp;
    }
}
