package com.digaus.capacitor.wifi;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.net.NetworkRequest;
import android.net.Uri;
import android.net.wifi.ScanResult;
import android.net.wifi.SupplicantState;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiNetworkSpecifier;
import android.os.AsyncTask;
import android.os.Build;
import android.os.PatternMatcher;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class WifiService {
    private static String TAG = "WifiService";

    private static final int API_VERSION = Build.VERSION.SDK_INT;

    private PluginCall savedCall;
    private ConnectivityManager.NetworkCallback networkCallback;

    WifiManager wifiManager;
    ConnectivityManager connectivityManager;
    Context context;

    Bridge bridge;

    public void load(Bridge bridge) {
        this.bridge = bridge;
        this.wifiManager = (WifiManager) this.bridge.getActivity().getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        this.connectivityManager = (ConnectivityManager) this.bridge.getActivity().getApplicationContext().getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
        this.context = this.bridge.getContext();
    }


    public void getIP(PluginCall call) {
        WifiInfo wifiInfo = wifiManager.getConnectionInfo();
        int ip = wifiInfo.getIpAddress();
        String ipString = formatIP(ip);

        if (ipString != null && !ipString.equals("0.0.0.0")) {
            JSObject result = new JSObject();
            result.put("ip", ipString);
            call.success(result);
        } else {
            call.reject("NO_VALID_IP_IDENTIFIED");
        }
    }

    public void getSSID(PluginCall call) {

        String connectedSSID = this.getWifiServiceInfo(call);
        Log.i(TAG, "Connected SSID: " + connectedSSID);

        if (connectedSSID != null) {
            JSObject result = new JSObject();
            result.put("ssid", connectedSSID);
            call.success(result);
        }
    }

    public void connect(PluginCall call) {
        this.savedCall = call;
        if (API_VERSION < 29) {
            call.reject("ERROR_ANDROID_VERSION_CURRENTLY_NOT_SUPPORTED");
        } else {
            String ssid = call.getString("ssid");
            String password =  call.getString("password");
            String connectedSSID = this.getWifiServiceInfo(call);

            if (!ssid.equals(connectedSSID)) {
                WifiNetworkSpecifier.Builder builder = new WifiNetworkSpecifier.Builder();
                builder.setSsid(ssid);
                if (password != null && password.length() > 0) {
                    builder.setWpa2Passphrase(password);
                }

                WifiNetworkSpecifier wifiNetworkSpecifier = builder.build();
                NetworkRequest.Builder networkRequestBuilder = new NetworkRequest.Builder();
                networkRequestBuilder.addTransportType(NetworkCapabilities.TRANSPORT_WIFI);
                networkRequestBuilder.addCapability(NetworkCapabilities.NET_CAPABILITY_NOT_RESTRICTED);
                networkRequestBuilder.addCapability(NetworkCapabilities.NET_CAPABILITY_TRUSTED);
                networkRequestBuilder.setNetworkSpecifier(wifiNetworkSpecifier);
                NetworkRequest networkRequest = networkRequestBuilder.build();
                this.forceWifiUsageQ(networkRequest, false);
            } else {
                this.getSSID(call);
            }
        }

    }

    public void connectPrefix(PluginCall call) {
        this.savedCall = call;
        if (API_VERSION < 29) {
            call.reject("ERROR_API_29_OR_GREATER_REQUIRED");
        } else {
            String ssid = call.getString("ssid");
            String password =  call.getString("password");

            String connectedSSID = this.getWifiServiceInfo(call);

            if (!ssid.equals(connectedSSID)) {
                WifiNetworkSpecifier.Builder builder = new WifiNetworkSpecifier.Builder();
                PatternMatcher ssidPattern = new PatternMatcher(ssid, PatternMatcher.PATTERN_PREFIX);
                builder.setSsidPattern(ssidPattern);
                if (password != null && password.length() > 0) {
                    builder.setWpa2Passphrase(password);
                }

                WifiNetworkSpecifier wifiNetworkSpecifier = builder.build();
                NetworkRequest.Builder networkRequestBuilder = new NetworkRequest.Builder();
                networkRequestBuilder.addTransportType(NetworkCapabilities.TRANSPORT_WIFI);
                networkRequestBuilder.addCapability(NetworkCapabilities.NET_CAPABILITY_NOT_RESTRICTED);
                networkRequestBuilder.addCapability(NetworkCapabilities.NET_CAPABILITY_TRUSTED);
                networkRequestBuilder.setNetworkSpecifier(wifiNetworkSpecifier);
                NetworkRequest networkRequest = networkRequestBuilder.build();
                this.forceWifiUsageQ(networkRequest, true);
            } else {
                this.getSSID(call);
            }
        }

    }

    private void forceWifiUsageQ(NetworkRequest networkRequest, boolean prefix) {
        final ConnectivityManager manager = (ConnectivityManager) this.context
                .getSystemService(Context.CONNECTIVITY_SERVICE);
        if (networkRequest == null) {
            networkRequest = new NetworkRequest.Builder()
                    .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
                    .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build();
        }

        manager.requestNetwork(networkRequest, new ConnectivityManager.NetworkCallback() {
            @Override
            public void onAvailable(Network network) {
                manager.bindProcessToNetwork(network);
                String currentSSID = WifiService.this.getWifiServiceInfo(null);
                PluginCall call = WifiService.this.savedCall;
                String ssid = call.getString("ssid");
                if (prefix && currentSSID.startsWith(ssid) || !prefix && currentSSID.equals(ssid)) {
                    WifiService.this.getSSID(WifiService.this.savedCall);
                } else {
                    call.reject("ERROR_CONNECTED_SSID_DOES_NOT_MATCH_REQUESTED_SSID");
                }
                WifiService.this.networkCallback = this;
            }
            @Override
            public void onUnavailable() {
                PluginCall call = WifiService.this.savedCall;
                call.reject("ERROR_CONNECTION_FAILED");
            }
        });
    }

    private String formatIP(int ip) {
        return String.format(
                "%d.%d.%d.%d",
                (ip & 0xff),
                (ip >> 8 & 0xff),
                (ip >> 16 & 0xff),
                (ip >> 24 & 0xff)
        );
    }

    
    private String getWifiServiceInfo(PluginCall call) {

        WifiInfo info = wifiManager.getConnectionInfo();

        if (info == null) {
            call.reject("ERROR_READING_WIFI_INFO");
            return null;
        }

        // Throw Error when there connection is not finished
        SupplicantState state = info.getSupplicantState();
        if (!state.equals(SupplicantState.COMPLETED)) {
            call.reject("ERROR_CONNECTION_NOT_COMPLETED");
            return null;
        }

        String serviceInfo;
        serviceInfo = info.getSSID();

        if (serviceInfo == null || serviceInfo.isEmpty() || serviceInfo == "0x") {
            call.reject("ERROR_EMPTY_WIFI_INFORMATION");
            return null;
        }

        if (serviceInfo.startsWith("\"") && serviceInfo.endsWith("\"")) {
            serviceInfo = serviceInfo.substring(1, serviceInfo.length() - 1);
        }

        return serviceInfo;

    }
    

}