import Foundation
import Capacitor
import SystemConfiguration.CaptiveNetwork
import NetworkExtension
import CoreLocation

class WifiHandler: NSObject, CLLocationManagerDelegate {
    var locationManager : CLLocationManager!
    var call: CAPPluginCall

    init(call: CAPPluginCall) {
        self.call = call
        super.init()
        checkSSID()
        
    }
    @objc func checkSSID() {
        if #available(iOS 13.0, *) {
            requestPermission()
        } else {
            getSSID()
        }
    }

    @objc func requestPermission() {
        locationManager = CLLocationManager()
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        switch status {
            case .notDetermined:
                manager.requestWhenInUseAuthorization()
                break
            case .authorizedWhenInUse:
                self.getSSID()
                break
            case .authorizedAlways:
                self.getSSID()
                break
            case .restricted:
                call.reject("ERROR_LOCATION_DENIED");
                break
            case .denied:
                call.reject("ERROR_LOCATION_DENIED");
                break
        }
    }
    @objc func getSSID() {
        var ssid: String?

        if let interfaces = CNCopySupportedInterfaces() as NSArray? {
            for interface in interfaces {
                if let interfaceInfo = CNCopyCurrentNetworkInfo(interface as! CFString) as NSDictionary? {
                    ssid = interfaceInfo[kCNNetworkInfoKeySSID as String] as? String
                    break
                }
            }
        }

        guard let myString = ssid, !myString.isEmpty else {
            self.call.reject("ERROR_WIFI_INFORMATION_EMPTY");
           return
        }
        self.call.success([
           "ssid": ssid!
        ])
    }
}

@objc(Wifi)
public class Wifi: CAPPlugin {
    
    var wifiHandler: WifiHandler?

    @objc func getIP(_ call: CAPPluginCall) {
        let address = getWiFiAddress()
        guard let myString = address, !myString.isEmpty else {
            call.reject("ERROR_NO_WIFI_IP_AVAILABLE");
            return
        } 
        call.success([
            "ip": address!
        ])
    }

    @objc func getSSID(_ call: CAPPluginCall)  {
        DispatchQueue.main.async {
            self.wifiHandler = WifiHandler(call: call)
        }
    }

    @objc func connect(_ call: CAPPluginCall) {
        guard let ssid = call.options["ssid"] as? String else {
            call.reject("ERROR_SSID_REQUIRED")
            return
        }
        let password : String? = call.getString("password") ?? nil
        let joinOnce : Bool = call.getBool("joinOnce") ?? false

        if #available(iOS 11, *) {
            var configuration : NEHotspotConfiguration
            if password != nil {
                configuration = NEHotspotConfiguration.init(ssid: ssid, passphrase: password!, isWEP: false)
            } else {
                configuration = NEHotspotConfiguration.init(ssid: ssid)
            }
            configuration.joinOnce = joinOnce

            NEHotspotConfigurationManager.shared.apply(configuration) { (error) in
                if error != nil {
                    if error?.localizedDescription == "already associated."
                    {
                        call.resolve([
                            "ssid": ssid
                        ])
                    }
                    else {
                        call.reject("ERROR_CONNECTION_FAILED")
                    }
                }
                else {
                    call.resolve([
                        "ssid": ssid
                    ])
                }
            }
        } else {
            call.reject("ERROR_ONLY_SUPPORTED_IOS_11")
        }
    }

    @objc func connectPrefix(_ call: CAPPluginCall) {
        guard let ssid = call.options["ssid"] as? String else {
            call.reject("ERROR_SSID_REQUIRED")
            return
        }
        let password : String? = call.getString("password") ?? nil
        let joinOnce : Bool = call.getBool("joinOnce") ?? false

        if #available(iOS 13, *) {
            var configuration : NEHotspotConfiguration
            if password != nil {
                configuration = NEHotspotConfiguration.init(ssidPrefix: ssid, passphrase: password!, isWEP: false)
            } else {
                configuration = NEHotspotConfiguration.init(ssidPrefix: ssid)
            }
            configuration.joinOnce = joinOnce

            NEHotspotConfigurationManager.shared.apply(configuration) { (error) in
                if error != nil {
                    if error?.localizedDescription == "already associated."
                    {
                        call.resolve([
                            "ssid": ssid
                        ])
                    }
                    else {
                        call.reject("ERROR_CONNECTION_FAILED")
                    }
                }
                else {
                    call.resolve([
                        "ssid": ssid
                    ])
                }
            }
        } else {
            call.reject("ERROR_ONLY_SUPPORTED_IOS_11")
        }
    }

    @objc func disconnect(_ call: CAPPluginCall) {
       /* if #available(iOS 11, *) {
            guard let ssid = call.options["ssid"] as? String else {
                call.reject("ERROR_SSID_REQUIRED")
                return
            }
            NEHotspotConfigurationManager.shared.removeConfigurationForSSID(ssid) { (error) in
                if error != nil {
                    call.reject("ERROR_CONNECTION_FAILED")
                }
                else {
                    call.resolve()
                }
            }
        } else {
            call.reject("ERROR_ONLY_SUPPORTED_IOS_11")
        }*/
        call.reject("ERROR_NOT_SUPPORTED")
    }

    @objc func getWiFiAddress() -> String? {
        var address : String?

        // Get list of all interfaces on the local machine:
        var ifaddr : UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&ifaddr) == 0 else { return nil }
        guard let firstAddr = ifaddr else { return nil }

        // For each interface ...
        for ifptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
            let interface = ifptr.pointee

            // Check for IPv4:
            let addrFamily = interface.ifa_addr.pointee.sa_family
            // addrFamily == UInt8(AF_INET6)
            if addrFamily == UInt8(AF_INET) {
                // Check interface name:
                let name = String(cString: interface.ifa_name)
                if  name == "en0" || name.starts(with: "tap") || name.starts(with: "ppp") || name.starts(with: "ipsec") || name.starts(with: "utun") {
                    // Convert interface address to a human readable string:
                    var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                    getnameinfo(interface.ifa_addr, socklen_t(interface.ifa_addr.pointee.sa_len),
                                &hostname, socklen_t(hostname.count),
                                nil, socklen_t(0), NI_NUMERICHOST)
                    address = String(cString: hostname)
                }
            }
        }
        freeifaddrs(ifaddr)

        return address
    }
}
