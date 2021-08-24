'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var require$$0 = require('os');
var require$$1 = require('child_process');
var require$$2 = require('node-wifi');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);

var src = {};

Object.defineProperty(src, "__esModule", { value: true });
const os_1 = require$$0__default['default'];
const child_process_1 = require$$1__default['default'];
const nodeWifi = require$$2__default['default'];
class Wifi {
    constructor() {
        nodeWifi.init({
            iface: null,
        });
    }
    async getIP() {
        var ifs = os_1.default.networkInterfaces();
        var ip = Object.keys(ifs)
            .map(x => ifs[x].filter((x) => x.family === 'IPv4' && !x.internal)[0])
            .filter(x => x)[0].address;
        return { ip };
    }
    async getSSID() {
        return new Promise(async (resolve, reject) => {
            const currentConnections = await nodeWifi.getCurrentConnections().catch(() => []);
            if (currentConnections && currentConnections[0]) {
                resolve({ ssid: currentConnections[0].ssid });
            }
            else {
                reject('ERROR_NO_NETWORK_FOUND');
            }
        });
    }
    async connect(options) {
        await nodeWifi.connect(options);
        return this.checkConnection();
    }
    async connectPrefix(options) {
        let currentNetwork;
        if (process.platform === 'win32') {
            currentNetwork = await this.getSSID().catch(() => ({ ssid: null }));
            await nodeWifi.disconnect().catch();
            await this.timeout(2000);
        }
        const networks = await nodeWifi.scan().catch(() => []);
        if (process.platform === 'win32') {
            await this.reconnect(currentNetwork.ssid).catch();
        }
        const filteredNetworks = networks.filter((val) => { var _a; return (_a = val.ssid) === null || _a === void 0 ? void 0 : _a.startsWith(options.ssid); });
        if (filteredNetworks.length === 0) {
            throw new Error('ERROR_NO_NETWORK_FOUND');
        }
        else {
            const network = await this.insertSelect(filteredNetworks);
            if (!network) {
                throw new Error('ERROR_NO_WIFI_SELECTED');
            }
            else {
                options.ssid = network.ssid;
                await nodeWifi.connect(options);
                return this.checkConnection();
            }
        }
    }
    async disconnect() {
        await nodeWifi.disconnect();
    }
    async checkConnection(retry = 10) {
        let result;
        let count = 0;
        while (!result && count < retry) {
            count++;
            result = await this.getSSID().catch(() => null);
            await this.timeout(1000);
        }
        if (!result) {
            throw new Error('ERROR_FAILED_TO_CONNECT');
        }
        else {
            return result;
        }
    }
    timeout(millis) {
        return new Promise(async (resolve) => {
            setTimeout(() => {
                resolve();
            }, millis);
        });
    }
    insertSelect(networks) {
        return new Promise(async (resolve) => {
            let htmlString = '<dialog id="wifiDialog" open style="transition: opacity 0.2s ease-in-out; opacity: 0; z-index: 2000;width: 300px;top: 50%; transform: translateY(-50%); max-height: 80vh; overflow-y: auto; box-shadow: 0px 10px 18px #888888; border: none; border-radius: 5px"><form method="dialog">';
            for (const network of networks) {
                htmlString += `<button id="${network.ssid}" value="${network.ssid}" style="width: 100%; padding: 5px; font-size: 15px; margin-bottom: 5px;">${network.ssid}</button>`;
            }
            htmlString += '</form></dialog';
            document.body.insertAdjacentHTML('beforeend', '<div id="wifiBackdrop" style="transition: opacity 0.2s ease-in-out; opacity: 0; height: 100vh; width: 100vw; background-color: grey;"></div>');
            document.body.insertAdjacentHTML('beforeend', htmlString);
            const backdropEl = document.getElementById('wifiBackdrop');
            const dialogEL = document.getElementById('wifiDialog');
            await this.timeout(1);
            backdropEl.style.opacity = '0.5';
            dialogEL.style.opacity = '1';
            for (const network of networks) {
                const networkEl = document.getElementById(network.ssid);
                networkEl.addEventListener('click', async () => {
                    backdropEl.style.opacity = '0';
                    dialogEL.style.opacity = '0';
                    await this.timeout(200);
                    backdropEl.remove();
                    dialogEL.remove();
                    resolve(network);
                });
            }
            backdropEl.addEventListener('click', async () => {
                backdropEl.style.opacity = '0';
                dialogEL.style.opacity = '0';
                await this.timeout(200);
                backdropEl.remove();
                dialogEL.remove();
                resolve(null);
            });
        });
    }
    async reconnect(ssid) {
        return new Promise(async (resolve, reject) => {
            const env = Object.assign(process.env, {
                LANG: 'en_US.UTF-8',
                LC_ALL: 'en_US.UTF-8',
                LC_MESSAGES: 'en_US.UTF-8'
            });
            child_process_1.default.execFile('netsh', ['wlan', 'connect', 'ssid="' + ssid + '"', 'name="' + ssid + '"'], { env }, (err, stdout, stderr) => {
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
        });
    }
}
var Wifi_1 = src.Wifi = Wifi;

exports.Wifi = Wifi_1;
exports['default'] = src;
//# sourceMappingURL=plugin.js.map
