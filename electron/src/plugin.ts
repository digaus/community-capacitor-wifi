import { WebPlugin } from '@capacitor/core';
import { WifiPlugin } from './definitions';
const { remote } = require('electron');
export class WifiWeb extends WebPlugin
    implements WifiPlugin {
    Path: any = null;
    NodeFs: any = null;
    RemoteRef: any = null;
    Os: any = null;
    constructor() {
        super({
            name: 'Wifi',
            platforms: ['electron'],
        });
        console.log('Wifi');
        this.RemoteRef = remote;
        this.Path = require('path');
        this.NodeFs = require('fs');
        this.Os = require('os');
    }
    async echo(options: { value: string }): Promise<{ value: string }> {
        console.log('ECHO', options);
        console.log(this.RemoteRef);
        return options;
    }

    async getIp(): Promise<{ value: string }> {
        var ifs = this.Os.networkInterfaces();
        console.log(ifs)
        var ip = Object.keys(ifs)
            .map(x => ifs[x].filter((x: any) => x.family === 'IPv4' && !x.internal)[0])
            .filter(x => x)[0].address;
        return ip;
    }
}
const Wifi = new WifiWeb();
export { Wifi };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Wifi);
