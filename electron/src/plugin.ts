import { WebPlugin } from "@capacitor/core";
import { WifiPlugin } from "./definitions";
const { remote } = require("electron");
export class WifiPluginWeb extends WebPlugin
    implements WifiPlugin {
    Path: any = null;
    NodeFs: any = null;
    RemoteRef: any = null;
    constructor() {
        super({
            name: "WifiPlugin",
            platforms: ["electron"],
        });
        console.log("WifiPlugin");
        this.RemoteRef = remote;
        this.Path = require("path");
        this.NodeFs = require("fs");
    }
    async echo(options: { value: string }): Promise<{ value: string }> {
        console.log("ECHO", options);
        console.log(this.RemoteRef);
        return options;
    }
}
const Wifi = new WifiPluginWeb();
export { Wifi };
import { registerWebPlugin } from "@capacitor/core";
registerWebPlugin(Wifi);