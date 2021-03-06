import { WebPlugin } from '@capacitor/core';
import { WifiPlugin } from './definitions';
export declare class WifiElectron extends WebPlugin implements WifiPlugin {
    Path: any;
    NodeFs: any;
    RemoteRef: any;
    Os: any;
    Wifi: any;
    ExecFile: any;
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
    }): Promise<{
        ssid: string | null;
    }>;
    connectPrefix(options: {
        ssid: string;
        password?: string;
    }): Promise<{
        ssid: string | null;
    }>;
    disconnect(): Promise<void>;
    private checkConnection;
    private timeout;
    private insertSelect;
    private reconnect;
}
declare const Wifi: WifiElectron;
export { Wifi };
