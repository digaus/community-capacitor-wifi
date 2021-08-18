import { registerPlugin } from '@capacitor/core';
const Wifi = registerPlugin('Wifi', {
    web: () => import('./web').then(m => new m.WifiWeb()),
});
export { Wifi };
//# sourceMappingURL=index.js.map