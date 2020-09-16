import { __awaiter } from "tslib";
import { WebPlugin } from "@capacitor/core";
const { remote } = require("electron");
export class WifiWeb extends WebPlugin {
    constructor() {
        super({
            name: "WifiPlugin",
            platforms: ["electron"],
        });
        this.Path = null;
        this.NodeFs = null;
        this.RemoteRef = null;
        console.log("WifiPlugin");
        this.RemoteRef = remote;
        this.Path = require("path");
        this.NodeFs = require("fs");
    }
    echo(options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ECHO", options);
            console.log(this.RemoteRef);
            return options;
        });
    }
    getIp() {
        return __awaiter(this, void 0, void 0, function* () {
            var ifs = require('os').networkInterfaces();
            console.log(ifs);
            var ip = Object.keys(ifs)
                .map(x => ifs[x].filter((x) => x.family === 'IPv4' && !x.internal)[0])
                .filter(x => x)[0].address;
            return ip;
        });
    }
}
const Wifi = new WifiWeb();
export { Wifi };
import { registerWebPlugin } from "@capacitor/core";
registerWebPlugin(Wifi);
//# sourceMappingURL=plugin.js.map