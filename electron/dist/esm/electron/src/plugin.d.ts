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
    connect(options: {
        ssid: string;
        password?: string;
        authType?: string;
    }): Promise<{
        ssid: string | null;
    }>;
    connectPrefix(options: {
        ssid: string;
        password?: string;
        authType?: string;
    }): Promise<{
        ssid: string | null;
    }>;
    private checkConnection;
    private timeout;
}
declare const Wifi: WifiWebElectron;
export { Wifi };
