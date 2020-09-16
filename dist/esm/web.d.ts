import { WebPlugin } from '@capacitor/core';
import { WifiPlugin } from './definitions';
export declare class WifiWeb extends WebPlugin implements WifiPlugin {
    constructor();
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    getIp(): Promise<{
        value: string | null;
    }>;
}
declare const Wifi: WifiWeb;
export { Wifi };
