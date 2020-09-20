import { WebPlugin } from '@capacitor/core';
import { WifiPlugin } from './definitions';

export class WifiWeb extends WebPlugin implements WifiPlugin {
  constructor() {
    super({
      name: 'Wifi',
      platforms: ['web'],
    });
  }

  async getIP(): Promise<{ ip: string | null }> {
    return { ip: null };
  }
  
  async getSSID(): Promise<{ssid: string | null}> {
    return { ssid: null }
  }
}

const Wifi = new WifiWeb();

export { Wifi };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Wifi);
