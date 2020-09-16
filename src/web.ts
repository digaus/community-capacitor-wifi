import { WebPlugin } from '@capacitor/core';
import { WifiPlugin } from './definitions';

export class WifiWeb extends WebPlugin implements WifiPlugin {
  constructor() {
    super({
      name: 'Wifi',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async getIp(): Promise<{ value: string | null }> {
    console.log('getIp');
    return { value: null };
  }
}

const Wifi = new WifiWeb();

export { Wifi };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Wifi);
