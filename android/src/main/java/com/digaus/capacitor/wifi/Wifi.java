package com.digaus.capacitor.wifi;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;



@NativePlugin(
        requestCodes={Wifi.REQUEST_ACCESS_FINE_LOCATION}
)
public class Wifi extends Plugin {
    private static final int API_VERSION = Build.VERSION.SDK_INT;

    static final int REQUEST_ACCESS_FINE_LOCATION = 8000;

    private static String TAG = "Wifi";

    WifiService wifiService;

    @Override
    public void load() {
      super.load();
      this.wifiService = new WifiService();
      this.wifiService.load(this.bridge);
    }
    
    @PluginMethod()
    public void getIP(PluginCall call) {
        if (API_VERSION >= 23 && !hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)) {
            saveCall(call);
            pluginRequestPermission(Manifest.permission.ACCESS_FINE_LOCATION, REQUEST_ACCESS_FINE_LOCATION);
        } else {
            this.wifiService.getIP(call);
        }
    }

    @PluginMethod()
    public void getSSID(PluginCall call) {
        if (!hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)) {
            saveCall(call);
            pluginRequestPermission(Manifest.permission.ACCESS_FINE_LOCATION, REQUEST_ACCESS_FINE_LOCATION);
        } else {
            this.wifiService.getSSID(call);
        }
    }

    @PluginMethod()
    public void connect(PluginCall call) {
        if (!call.getData().has("ssid")) {
            call.reject("Must provide an ssid");
            return;
        }
        if (API_VERSION >= 23 && !hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)) {
            saveCall(call);
            pluginRequestPermission(Manifest.permission.ACCESS_FINE_LOCATION, REQUEST_ACCESS_FINE_LOCATION);
        } else {
            this.wifiService.connect(call);
        }

    }

    @PluginMethod()
    public void disconnect(PluginCall call) {
        this.wifiService.disconnect(call);
    }

    @Override
    protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {

        super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

        PluginCall savedCall = getSavedCall();
        if (savedCall == null) {
            return;
        }

        for(int result : grantResults) {
            if (result == PackageManager.PERMISSION_DENIED) {
                savedCall.error("User denied permission");
                return;
            }
        }
        if (savedCall.getMethodName().equals("getSSID")) {
            this.wifiService.getSSID(savedCall);
        } else if (savedCall.getMethodName().equals("getIp")) {
            this.wifiService.getIP(savedCall);
        }


    }

}
