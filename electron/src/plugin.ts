import type { WifiPlugin } from '../../src/definitions';

class Network {
    ssid: string;
    bssid: string;
    mac: string; // equals to bssid (for retrocompatibility)
    channel: number;
    frequency: number; // in MHz
    signal_level: number; // in dB
    quality: number; // same as signal level but in %
    security: string; // format depending on locale for open networks in Windows
    security_flags: string; // encryption protocols (format currently depending of the OS)
    mode: string;// network mode like Infra (format currently depending of the OS)
      
}
export class Wifi implements WifiPlugin {
    Path: any = null;
    NodeFs: any = null;
    RemoteRef: any = null;
    Os: any = null;
    Wifi: any = null;
    ExecFile: any = null;

    constructor() {
        this.RemoteRef = require('electron');
        this.Path = require('path');
        this.NodeFs = require('fs');
        this.Os = require('os');
        this.Wifi = require('node-wifi');
        this.Wifi.init({
            iface: null, // network interface, choose a random wifi interface if set to null
        });
        this.ExecFile = require('child_process').execFile;

    }

    async getIP(): Promise<{ ip: string }> {
        var ifs = this.Os.networkInterfaces();
        var ip = Object.keys(ifs)
            .map(x => ifs[x].filter((x: any) => x.family === 'IPv4' && !x.internal)[0])
            .filter(x => x)[0].address;
        return { ip };
    }

    async getSSID(): Promise<{ssid: string | null}> {
        const currentConnections: Network[] = await this.Wifi.getCurrentConnections();
        if (currentConnections && currentConnections[0]) {
            return { ssid: currentConnections[0].ssid };
        } else {
            throw new Error('ERROR_NO_NETWORK_FOUND');
        }
    }

    async connect(options: { ssid: string, password?: string }): Promise<{ ssid: string | null }> {
       await this.Wifi.connect(options)
       return this.checkConnection();
    }

    async connectPrefix(options: { ssid: string, password?: string }): Promise<{ ssid: string | null }> {
        let currentNetwork: { ssid: string | null };

        if (process.platform === 'win32') {
            currentNetwork = await this.getSSID().catch(() => ({ ssid: null }));
            await this.Wifi.disconnect().catch();
            await this.timeout(2000);
        }

        const networks: Network[] = await this.Wifi.scan().catch((): any => []);
        if (process.platform === 'win32') {
            await this.reconnect(currentNetwork.ssid).catch();
        }
        const filteredNetworks: Network[] = networks.filter((val: Network) => val.ssid?.startsWith(options.ssid));
        if (filteredNetworks.length === 0) {
            throw new Error('ERROR_NO_NETWORK_FOUND');
        } else {
            const network: Network = await this.insertSelect(filteredNetworks)
            if (!network) {
                throw new Error('ERROR_NO_WIFI_SELECTED');
            } else {
                options.ssid = network.ssid;
                await this.Wifi.connect(options)
                return this.checkConnection();
            }
        }
     
    }

    async disconnect(): Promise<void> {
        await this.Wifi.disconnect();
    }

    private async checkConnection(retry: number = 10): Promise<{ ssid: string | null }> {
        let result: { ssid: string };
        let count: number = 0;
        while (!result && count < retry) {
            count++;
            result = await this.getSSID().catch(() => null);
            await this.timeout(1000);
        }
        if (!result) {
            throw new Error('ERROR_FAILED_TO_CONNECT');
        } else {
            return result;
        }
    }

    private timeout(millis: number): Promise<void> {
        return new Promise(async (resolve: () => void) => {
            setTimeout(() => {
                resolve();
            }, millis);
        });
    }

    
    private insertSelect(networks: Network[]): Promise<Network> {
        return new Promise(async (resolve: (network: Network) => void) => {
            let htmlString: string = '<dialog id="wifiDialog" open style="transition: opacity 0.2s ease-in-out; opacity: 0; z-index: 2000;width: 300px;top: 50%; transform: translateY(-50%); max-height: 80vh; overflow-y: auto; box-shadow: 0px 10px 18px #888888; border: none; border-radius: 5px"><form method="dialog">'
            
            for (const network of networks) {
                htmlString += `<button id="${network.ssid}" value="${network.ssid}" style="width: 100%; padding: 5px; font-size: 15px; margin-bottom: 5px;">${network.ssid}</button>`
            }
            htmlString += '</form></dialog';
            document.body.insertAdjacentHTML('beforeend', '<div id="wifiBackdrop" style="transition: opacity 0.2s ease-in-out; opacity: 0; height: 100vh; width: 100vw; background-color: grey;"></div>');
            document.body.insertAdjacentHTML('beforeend', htmlString);
            const backdropEl: HTMLElement = document.getElementById('wifiBackdrop') as HTMLElement;
            const dialogEL: HTMLElement = document.getElementById('wifiDialog') as HTMLElement;
            await this.timeout(1);
            backdropEl.style.opacity = '0.5';
            dialogEL.style.opacity = '1';

            for (const network of networks) {
                const networkEl: HTMLElement = document.getElementById(network.ssid) as HTMLElement;
                networkEl.addEventListener('click', async () =>  {
                    backdropEl.style.opacity = '0';
                    dialogEL.style.opacity = '0';
                    await this.timeout(200);
                    backdropEl.remove();
                    dialogEL.remove();
                    resolve(network);
                });
            }
            backdropEl.addEventListener('click', async () =>  {
                backdropEl.style.opacity = '0';
                dialogEL.style.opacity = '0';
                await this.timeout(200);
                backdropEl.remove();
                dialogEL.remove();
                resolve(null);
            });
            
        });

    }

    private async reconnect(ssid: string): Promise<void> {
        return new Promise(async (resolve: (res: any) => void, reject: (err: any) => void) => {
            const env: any = Object.assign(process.env, {
                LANG: 'en_US.UTF-8',
                LC_ALL: 'en_US.UTF-8',
                LC_MESSAGES: 'en_US.UTF-8'
            });
            this.ExecFile('netsh', ['wlan', 'connect', 'ssid="' + ssid + '"', 'name="' + ssid + '"'], { env, shell: true }, (err: any, stdout: any, stderr: any) =>  {
            if (err) {
              // Add command output to error, so it's easier to handle
              err.stdout = stdout;
              err.stderr = stderr;
              reject(err);
            } else {
              resolve(stdout);
            }
          });
        });
    }
}

