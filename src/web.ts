import { WebPlugin } from '@capacitor/core';
import { WifiPlugin } from './definitions';

export class WifiWeb extends WebPlugin implements WifiPlugin {

  async getIP(): Promise<{ ip: string | null }> {
    return { ip: null };
  }
  
  async getSSID(): Promise<{ssid: string | null}> {
    return { ssid: null }
  }

  async connect(options: { ssid: string, password?: string, authType?: string }): Promise<{ ssid: string | null }> {
    console.log(options);
    return { ssid: null };
  }
  async connectPrefix(options: { ssid: string, password?: string, authType?: string }): Promise<{ ssid: string | null }> {
    console.log(options);
    return { ssid: null };
  }
  async disconnect(): Promise<void> {
    return;
  }
}