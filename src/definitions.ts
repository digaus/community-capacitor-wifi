declare module '@capacitor/core' {
  interface PluginRegistry {
    Wifi: WifiPlugin;
  }
}

export interface WifiPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
