import { WebPlugin } from "@capacitor/core";
import { WifiPlugin } from "./definitions";
export declare class WifiWeb extends WebPlugin implements WifiPlugin {
    Path: any;
    NodeFs: any;
    RemoteRef: any;
    constructor();
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    getIp(): Promise<{
        value: string;
    }>;
}
declare const Wifi: WifiWeb;
export { Wifi };
