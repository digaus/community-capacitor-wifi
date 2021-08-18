var capacitorDevice = (function (exports, core) {
    'use strict';

    class WifiWeb extends core.WebPlugin {
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
    const Wifi = core.registerPlugin('Wifi', {
        web: () => Promise.resolve().then(function () { return web; }).then(m => new m.WifiWeb()),
    });

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        WifiWeb: WifiWeb,
        Wifi: Wifi
    });

    exports.Wifi = Wifi;
    exports.WifiWeb = WifiWeb;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}, capacitorExports));
//# sourceMappingURL=plugin.js.map
