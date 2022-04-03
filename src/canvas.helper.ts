import axios from "axios";

import {Logger, LogLevel, LogType} from "./util/logger.util";

export class CanvasHelper {

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
