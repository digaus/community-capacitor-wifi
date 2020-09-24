import { __awaiter } from "tslib";
import { WebPlugin } from '@capacitor/core';
const { remote } = require('electron');
class Network {
}
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
            const networks = yield this.Wifi.scan().catch(() => []);
            const filteredNetworks = networks.filter((val) => { var _a; return (_a = val.ssid) === null || _a === void 0 ? void 0 : _a.startsWith(options.ssid); });
            if (filteredNetworks.length === 0) {
                throw new Error('ERROR_NO_NETWORK_FOUND');
            }
            else {
                const network = yield this.insertSelect(filteredNetworks);
                if (!network) {
                    throw new Error('ERROR_NO_WIFI_SELECTED');
                }
                else {
                    options.ssid = network.ssid;
                    yield this.Wifi.connect(options);
                    return this.checkConnection();
                }
            }
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
    insertSelect(networks) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let htmlString = '<dialog id="wifiDialog" open style="z-index: 2000;width: 300px;top: 50%; transform: translateY(-50%); max-height: 80vh; overflow-y: auto; box-shadow: 0px 10px 18px #888888; border: none; border-radius: 5px"><form method="dialog">';
            for (const network of networks) {
                htmlString += `<button id="${network.ssid}" value="${network.ssid}" style="width: 100%; padding: 5px; font-size: 15px; margin-bottom: 5px;">${network.ssid}</button>`;
            }
            htmlString += '</form></dialog';
            document.body.insertAdjacentHTML('beforeend', '<div id="wifiBackdrop" style="height: 100vh; width: 100vw; background-color: grey; opacity: 0.5"></div>');
            document.body.insertAdjacentHTML('beforeend', htmlString);
            const el = document.getElementById('wifiBackdrop');
            const dialogEL = document.getElementById('wifiDialog');
            for (const network of networks) {
                const networkEl = document.getElementById(network.ssid);
                networkEl.addEventListener('click', () => {
                    el.remove();
                    dialogEL.remove();
                    resolve(network);
                });
            }
            el.addEventListener('click', () => {
                el.remove();
                dialogEL.remove();
                resolve(null);
            });
        }));
    }
}
const Wifi = new WifiWebElectron();
export { Wifi };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Wifi);
//# sourceMappingURL=plugin.js.map