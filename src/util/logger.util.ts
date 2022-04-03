export class Logger {

    public static log(msg: string, level: LogLevel = LogLevel.INFO, type: LogType = LogType.GENERAL): void {
        console.log(`(${this.getLogLevelAsString(level)}) [${this.getLogTypeAsString(type)}] \t${msg}`);
    }

    private static getLogLevelAsString(level: LogLevel): string {
        switch (level) {
            case LogLevel.WARNING: return "W";
            case LogLevel.VERBOSE: return "E";
        }
        return "I";
    }

    private static getLogTypeAsString(type: LogType): string {
        switch (type) {
            case LogType.ACCOUNTS: return "ACCOUNTS";
            case LogType.PAINTER: return "PAINTER";
            case LogType.ORDERS: return "ORDERS";
        }
        return "GENERAL";
    }
}

export enum LogType {
    GENERAL, ORDERS, PAINTER, ACCOUNTS
}

export enum LogLevel {
    INFO, WARNING, VERBOSE
}
