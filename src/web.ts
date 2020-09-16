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
}

const Wifi = new WifiWeb();

export { Wifi };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Wifi);
