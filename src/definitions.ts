declare module '@capacitor/core' {
  interface PluginRegistry {
    Wifi: WifiPlugin;
  }
}

export interface WifiPlugin {
  getIP(): Promise<{ ip: string | null }>;
  getSSID(): Promise<{ ssid: string | null }>;

}
