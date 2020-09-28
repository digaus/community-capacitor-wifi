import { __awaiter } from "tslib";
import { WebPlugin } from '@capacitor/core';
const { remote } = require('electron');
class Network {
}
export class WifiElectron extends WebPlugin {
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
        this.ExecFile = null;
        this.RemoteRef = remote;
        this.Path = require('path');
        this.NodeFs = require('fs');
        this.Os = require('os');
        this.Wifi = require('node-wifi');
        this.Wifi.init({
            iface: null,
        });
        this.ExecFile = require('child_process').execFile;
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
            let currentNetwork;
            if (process.platform === 'win32') {
                currentNetwork = yield this.getSSID().catch(() => ({ ssid: null }));
                yield this.Wifi.disconnect().catch();
                yield this.timeout(1000);
            }
            const networks = yield this.Wifi.scan().catch(() => []);
            if (process.platform === 'win32') {
                yield this.reconnect(currentNetwork.ssid).catch();
            }
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
                yield this.timeout(1000);
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
            let htmlString = '<dialog id="wifiDialog" open style="transition: opacity 0.2s ease-in-out; opacity: 0; z-index: 2000;width: 300px;top: 50%; transform: translateY(-50%); max-height: 80vh; overflow-y: auto; box-shadow: 0px 10px 18px #888888; border: none; border-radius: 5px"><form method="dialog">';
            for (const network of networks) {
                htmlString += `<button id="${network.ssid}" value="${network.ssid}" style="width: 100%; padding: 5px; font-size: 15px; margin-bottom: 5px;">${network.ssid}</button>`;
            }
            htmlString += '</form></dialog';
            document.body.insertAdjacentHTML('beforeend', '<div id="wifiBackdrop" style="transition: opacity 0.2s ease-in-out; opacity: 0; height: 100vh; width: 100vw; background-color: grey;"></div>');
            document.body.insertAdjacentHTML('beforeend', htmlString);
            const backdropEl = document.getElementById('wifiBackdrop');
            const dialogEL = document.getElementById('wifiDialog');
            yield this.timeout(1);
            backdropEl.style.opacity = '0.5';
            dialogEL.style.opacity = '1';
            for (const network of networks) {
                const networkEl = document.getElementById(network.ssid);
                networkEl.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    backdropEl.style.opacity = '0';
                    dialogEL.style.opacity = '0';
                    yield this.timeout(200);
                    backdropEl.remove();
                    dialogEL.remove();
                    resolve(network);
                }));
            }
            backdropEl.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                backdropEl.style.opacity = '0';
                dialogEL.style.opacity = '0';
                yield this.timeout(200);
                backdropEl.remove();
                dialogEL.remove();
                resolve(null);
            }));
        }));
    }
    reconnect(ssid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const env = Object.assign(process.env, {
                    LANG: 'en_US.UTF-8',
                    LC_ALL: 'en_US.UTF-8',
                    LC_MESSAGES: 'en_US.UTF-8'
                });
                this.ExecFile('netsh', ['wlan', 'connect', 'ssid="' + ssid + '"', 'name="' + ssid + '"'], { env, shell: true }, (err, stdout, stderr) => {
                    if (err) {
                        // Add command output to error, so it's easier to handle
                        err.stdout = stdout;
                        err.stderr = stderr;
                        reject(err);
                    }
                    else {
                        resolve(stdout);
                    }
                });
            }));
        });
    }
}
const Wifi = new WifiElectron();
export { Wifi };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Wifi);
//# sourceMappingURL=plugin.js.map