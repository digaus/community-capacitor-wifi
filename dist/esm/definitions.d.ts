export interface WifiPlugin {
    getIP(): Promise<{
        ip: string | null;
    }>;
    getSSID(): Promise<{
        ssid: string | null;
    }>;
    connect(options: IWifiConnectOptions): Promise<{
        ssid: string | null;
    }>;
    connectPrefix(options: IWifiConnectOptions): Promise<{
        ssid: string | null;
    }>;
    disconnect(): Promise<void>;
}
export interface IWifiConnectOptions {
    ssid: string;
    password?: string;
    /** iOS only: https://developer.apple.com/documentation/networkextension/nehotspotconfiguration/2887518-joinonce */
    joinOnce?: boolean;
    /** Android only: https://developer.android.com/reference/android/net/wifi/WifiNetworkSpecifier.Builder#setIsHiddenSsid(boolean) */
    isHiddenSsid?: boolean;
}
