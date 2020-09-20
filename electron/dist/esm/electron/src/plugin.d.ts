import { WebPlugin } from '@capacitor/core';
import { WifiPlugin } from './definitions';
export declare class WifiWebElectron extends WebPlugin implements WifiPlugin {
    Path: any;
    NodeFs: any;
    RemoteRef: any;
    Os: any;
    Wifi: any;
    constructor();
    getIP(): Promise<{
        ip: string;
    }>;
    getSSID(): Promise<{
        ssid: string | null;
    }>;
}
declare const Wifi: WifiWebElectron;
export { Wifi };
