import { WebPlugin } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
export class WifiWeb extends WebPlugin {
    constructor() {
        super({
            name: 'Wifi',
            platforms: ['web'],
        });
    }
    async getIP() {
        return { ip: null };
    }
    async getSSID() {
        return { ssid: null };
    }
    async connect(options) {
        console.log(options);
        return { ssid: null };
    }
    async connectPrefix(options) {
        console.log(options);
        return { ssid: null };
    }
    async disconnect() {
        return;
    }
}
const Wifi = registerPlugin('Wifi', {
    web: () => import('./web').then(m => new m.WifiWeb()),
});
export { Wifi };
//# sourceMappingURL=web.js.map