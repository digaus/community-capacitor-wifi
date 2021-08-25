import { registerPlugin } from '@capacitor/core';
const Wifi = registerPlugin('Wifi', {
    web: () => import('./web').then(m => new m.WifiWeb()),
    electron: () => window.CapacitorCustomPlatform.plugins.Wifi,
});
export * from './definitions';
export { Wifi };
//# sourceMappingURL=index.js.map