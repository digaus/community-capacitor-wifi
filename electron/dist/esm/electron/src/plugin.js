import { __awaiter } from "tslib";
import { WebPlugin } from '@capacitor/core';
const { remote } = require('electron');
export class WifiWebElectron extends WebPlugin {
    constructor() {
        super({
            name: 'Wifi',
            platforms: ['electron'],
        });
        this.Path = null;
        this.NodeFs = null;
        this.RemoteRef = null;
        this.Os = null;
        this.Wifi = null;
        this.RemoteRef = remote;
        this.Path = require('path');
        this.NodeFs = require('fs');
        this.Os = require('os');
        this.Wifi = require('node-wifi');
        this.Wifi.init({
            iface: null,
        });
    }
    getIP() {
        return __awaiter(this, void 0, void 0, function* () {
            var ifs = this.Os.networkInterfaces();
            var ip = Object.keys(ifs)
                .map(x => ifs[x].filter((x) => x.family === 'IPv4' && !x.internal)[0])
                .filter(x => x)[0].address;
            return { ip };
        });
    }
    getSSID() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentConnections = yield this.Wifi.getCurrentConnections();
            if (currentConnections && currentConnections[0]) {
                return { ssid: currentConnections[0].ssid };
            }
            else {
                throw new Error('ERROR_NO_NETWORK_FOUND');
            }
        });
    }
    connect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Wifi.connect(options);
            return this.checkConnection();
        });
    }
    connectPrefix(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO List Networks in Popup which are available via SCAN and match the prefix
            yield this.Wifi.connect(options);
            return this.checkConnection();
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Wifi.disconnect();
            return { ssid: null };
        });
    }
    checkConnection(retry = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            let count = 0;
            while (!result && count < retry) {
                count++;
                result = yield this.getSSID().catch(() => null);
                yield this.timeout(100);
            }
            if (!result) {
                throw new Error('ERROR_FAILED_TO_CONNECT');
            }
            else {
                return result;
            }
        });
    }
    timeout(millis) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            setTimeout(() => {
                resolve();
            }, millis);
        }));
    }
}
const Wifi = new WifiWebElectron();
export { Wifi };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Wifi);
//# sourceMappingURL=plugin.js.map