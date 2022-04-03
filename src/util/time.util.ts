export class TimeUtil {

    public static timeUntilAsString(timestamp: number): string {
        console.log((timestamp - Date.now())/1000);
        return new Date(timestamp).toTimeString();
    }
}
