export interface WifiPlugin {
  getIP(): Promise<{ ip: string | null }>;
  getSSID(): Promise<{ ssid: string | null }>;
  connect(options: {
    ssid: string,
    password?: string,
    /** iOS only: https://developer.apple.com/documentation/networkextension/nehotspotconfiguration/2887518-joinonce */
    joinOnce?: boolean,
    /** Android only: https://developer.android.com/reference/android/net/wifi/WifiNetworkSpecifier.Builder#setIsHiddenSsid(boolean) */
    isHiddenSsid?: boolean,
  }): Promise<{ ssid: string | null }>;
  connectPrefix(options: {
    ssid: string,
    password?: string,
     /** iOS only: https://developer.apple.com/documentation/networkextension/nehotspotconfiguration/2887518-joinonce */
    joinOnce?: boolean,
  }): Promise<{ ssid: string | null }>;
  disconnect(): Promise<void>;
}
