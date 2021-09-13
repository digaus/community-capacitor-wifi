package com.digaus.capacitor.wifi;


import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.net.NetworkRequest;
import android.net.Uri;
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

import java.util.List;
import java.util.Locale;

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
        String ssid = call.getString("ssid");
        String password = call.getString("password");
        boolean isHiddenSsid = false;
        if (call.hasOption("isHiddenSsid")) {
            isHiddenSsid = call.getBoolean("isHiddenSsid");
        }
        /*String connectedSSID = this.getWifiServiceInfo(call);

        if (!ssid.equals(connectedSSID)) {*/
        // Release current connection if there is one
        this.releasePreviousConnection();

        if (API_VERSION < 29) {
            int networkId = this.addNetwork(call);
            if (networkId > -1) {
                wifiManager.enableNetwork(networkId, true);
                wifiManager.reconnect();

                this.forceWifiUsage(null);


            } else {
                call.reject("INVALID_NETWORK_ID_TO_CONNECT");
            }
        } else {
                WifiNetworkSpecifier.Builder builder = new WifiNetworkSpecifier.Builder();
                builder.setSsid(ssid);
                if (password != null && password.length() > 0) {
                    builder.setWpa2Passphrase(password);
                }
                if (isHiddenSsid) {
                    builder.setIsHiddenSsid(true);
                }

                WifiNetworkSpecifier wifiNetworkSpecifier = builder.build();
                NetworkRequest.Builder networkRequestBuilder = new NetworkRequest.Builder();
                networkRequestBuilder.addTransportType(NetworkCapabilities.TRANSPORT_WIFI);
                networkRequestBuilder.setNetworkSpecifier(wifiNetworkSpecifier);
                networkRequestBuilder.removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
                NetworkRequest networkRequest = networkRequestBuilder.build();
                this.forceWifiUsage(networkRequest);
        }

        /*} else {
            this.getSSID(call);
        }*/
    }

    public void connectPrefix(PluginCall call) {
        this.savedCall = call;
        if (API_VERSION < 29) {
            call.reject("ERROR_API_29_OR_GREATER_REQUIRED");
        } else {
            String ssid = call.getString("ssid");
            String password = call.getString("password");

            /*String connectedSSID = this.getWifiServiceInfo(call);

            if (!ssid.equals(connectedSSID)) {*/
            this.releasePreviousConnection();

            WifiNetworkSpecifier.Builder builder = new WifiNetworkSpecifier.Builder();
            PatternMatcher ssidPattern = new PatternMatcher(ssid, PatternMatcher.PATTERN_PREFIX);
            builder.setSsidPattern(ssidPattern);
            if (password != null && password.length() > 0) {
                builder.setWpa2Passphrase(password);
            }

            WifiNetworkSpecifier wifiNetworkSpecifier = builder.build();
            NetworkRequest.Builder networkRequestBuilder = new NetworkRequest.Builder();
            networkRequestBuilder.addTransportType(NetworkCapabilities.TRANSPORT_WIFI);
            networkRequestBuilder.setNetworkSpecifier(wifiNetworkSpecifier);
            networkRequestBuilder.removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
            NetworkRequest networkRequest = networkRequestBuilder.build();
            this.forceWifiUsage(networkRequest);

            // Wait for connection to finish, otherwise throw a timeout error
            new ValidateConnection().execute(call, this);
            /*} else {
                this.getSSID(call);
            }*/
        }

    }

    public void disconnect(PluginCall call) {
        this.savedCall = call;
        if (API_VERSION < 29) {
            wifiManager.disconnect();
        }
        this.releasePreviousConnection();
        call.success();
    }

    private void releasePreviousConnection() {
        if (API_VERSION >= 23) {
            ConnectivityManager manager = (ConnectivityManager) this.context.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (this.networkCallback != null) {
                manager.unregisterNetworkCallback(this.networkCallback);
                this.networkCallback = null;
            }
            manager.bindProcessToNetwork(null);
        } else if (API_VERSION >= 21) {
            ConnectivityManager.setProcessDefaultNetwork(null);
        }

    }
    private int addNetwork(PluginCall call) {

        String ssid = call.getString("ssid");
        String password =  call.getString("password");
        boolean isHiddenSsid = call.getBoolean("isHiddenSsid");

        WifiConfiguration conf = new WifiConfiguration();
        conf.SSID = "\"" + ssid + "\"";   // Please note the quotes. String should contain ssid in quotes
        conf.status = WifiConfiguration.Status.ENABLED;
        conf.priority = 4000;
        if (isHiddenSsid) {
            conf.hiddenSSID = true;
        }
        if (password != null) {
            conf.allowedProtocols.set(WifiConfiguration.Protocol.RSN);
            conf.allowedProtocols.set(WifiConfiguration.Protocol.WPA);
            conf.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK);
            conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP);
            conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP40);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP104);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP);

            conf.preSharedKey = "\"" + password + "\"";

        } else {

            conf.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.NONE);
            conf.allowedProtocols.set(WifiConfiguration.Protocol.RSN);
            conf.allowedProtocols.set(WifiConfiguration.Protocol.WPA);
            conf.allowedAuthAlgorithms.clear();
            conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP);
            conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP40);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.WEP104);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP);
            conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP);
        }


        WifiManager wifiManager = (WifiManager) this.context.getSystemService(Context.WIFI_SERVICE);
        int networkId = -1;
        try {
            networkId = wifiManager.addNetwork(conf);
        } catch (Exception e) {
            /** */
        }
        // Fallback and search for SSID if adding failed
        if (networkId == -1) {
            @SuppressLint("MissingPermission") List<WifiConfiguration> currentNetworks = wifiManager.getConfiguredNetworks();
            for (WifiConfiguration network : currentNetworks) {
                if (network.SSID != null) {
                    if(network.SSID.equals(ssid)) {
                        networkId = network.networkId;
                    }
                }
            }
        }
        return networkId;
    }

    private void forceWifiUsage(NetworkRequest networkRequest) {
        boolean allowed;

        // Only need ACTION_MANAGE_WRITE_SETTINGS on 6.0.0, 6.0.1 does not need it
        if (API_VERSION != 23 || Build.VERSION.RELEASE.equals("6.0.1")) {
            allowed = true;
        } else {
            allowed = Settings.System.canWrite(this.context);
            if (!allowed) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS);
                intent.setData(Uri.parse("package:" + this.context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                this.context.startActivity(intent);
            }
        }

        if (allowed) {
            if (networkRequest == null) {
                networkRequest = new NetworkRequest.Builder()
                        .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
                        .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                        .build();
            }
            final ConnectivityManager manager = (ConnectivityManager) this.context.getSystemService(Context.CONNECTIVITY_SERVICE);
            ConnectivityManager.NetworkCallback networkCallback = new ConnectivityManager.NetworkCallback() {
                @Override
                public void onAvailable(Network network) {
                    if (API_VERSION >= 23) {
                        manager.bindProcessToNetwork(network);
                    } else {
                        //deprecated in API level 23
                        ConnectivityManager.setProcessDefaultNetwork(network);
                    }

                    // Wait for connection to finish, otherwise throw a timeout error
                    new ValidateConnection().execute(WifiService.this.savedCall, WifiService.this);
                }

                @Override
                public void onUnavailable() {
                    PluginCall call = WifiService.this.savedCall;
                    if (call != null) {
                        call.reject("ERROR_CONNECTION_UNAVAILABLE");
                    }
                }
            };
            this.networkCallback = networkCallback;
            manager.requestNetwork(networkRequest, networkCallback);
        }

    }


    private class ValidateConnection extends AsyncTask<Object, Void, Boolean> {
        PluginCall call;
        WifiService wifiService;

        @Override
        protected void onPostExecute(Boolean success) {
            if (!success) {
                PluginCall call = this.wifiService.savedCall;
                boolean prefix = call.getMethodName().equals("connectPrefix");
                if (prefix) {
                    if (API_VERSION < 29) {
                        this.wifiService.wifiManager.disconnect();
                    }
                    this.wifiService.releasePreviousConnection();
                }
                this.call.reject("ERROR_CONNECT_FAILED_TIMEOUT");
            } else {
                this.wifiService.getSSID(call);
            }
        }

        @Override
        protected Boolean doInBackground(Object... params) {
            this.call = (PluginCall) params[0];
            this.wifiService = (WifiService) params[1];

            final int TIMES_TO_RETRY = 20;
            for (int i = 0; i < TIMES_TO_RETRY; i++) {

                WifiInfo info = wifiManager.getConnectionInfo();
                NetworkInfo.DetailedState connectionState = info
                        .getDetailedStateOf(info.getSupplicantState());

                PluginCall call = this.wifiService.savedCall;
                String currentSSID = this.wifiService.getWifiServiceInfo(null);
                String ssid = call.getString("ssid");
                boolean prefix = call.getMethodName().equals("connectPrefix");
                boolean isConnected = currentSSID != null && (!prefix && currentSSID.equals(ssid) || prefix && currentSSID.startsWith(ssid)) &&
                        (
                                connectionState == NetworkInfo.DetailedState.CONNECTED ||
                                        // Android seems to sometimes get stuck in OBTAINING_IPADDR after it has received one
                                        (connectionState == NetworkInfo.DetailedState.OBTAINING_IPADDR
                                                && info.getIpAddress() != 0)
                        );

                if (isConnected) {
                    return true;
                }

                Log.d(TAG, "Got " + connectionState.name() + " on " + (i + 1) + " out of " + TIMES_TO_RETRY);

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Log.e(TAG, e.getMessage());
                    return false;
                }
            }
            Log.d(TAG, "Network failed to finish connecting within the timeout");
            return false;
        }
    }

    private String formatIP(int ip) {
        return String.format(
                Locale.ENGLISH,
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
            if (call != null) {
                call.reject("ERROR_READING_WIFI_INFO");
            }
            return null;
        }

        // Throw Error when there connection is not finished
        SupplicantState state = info.getSupplicantState();
        if (!state.equals(SupplicantState.COMPLETED)) {
            if (call != null) {
                call.reject("ERROR_CONNECTION_NOT_COMPLETED");
            }
            return null;
        }

        String serviceInfo;
        serviceInfo = info.getSSID();

        if (serviceInfo == null || serviceInfo.isEmpty() || serviceInfo == "0x") {
            if (call != null) {
                call.reject("ERROR_EMPTY_WIFI_INFORMATION");
            }
            return null;
        }

        if (serviceInfo.startsWith("\"") && serviceInfo.endsWith("\"")) {
            serviceInfo = serviceInfo.substring(1, serviceInfo.length() - 1);
        }

        return serviceInfo;

    }

}