var capacitorPlugin = (function (exports, core) {
    'use strict';

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class WifiWeb extends core.WebPlugin {
        constructor() {
            super({
                name: 'Wifi',
                platforms: ['web'],
            });
        }
        echo(options) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('ECHO', options);
                return options;
            });
        }
        getIp() {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('getIp');
                return { value: null };
            });
        }
    }
    const Wifi = new WifiWeb();
    core.registerWebPlugin(Wifi);

    exports.Wifi = Wifi;
    exports.WifiWeb = WifiWeb;

    return exports;

}({}, capacitorExports));
//# sourceMappingURL=plugin.js.map
