## API

<docgen-index>

* [`getIP()`](#getip)
* [`getSSID()`](#getssid)
* [`connect(...)`](#connect)
* [`connectPrefix(...)`](#connectprefix)
* [`disconnect()`](#disconnect)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### getIP()

```typescript
getIP() => Promise<{ ip: string | null; }>
```

**Returns:** <code>Promise&lt;{ ip: string | null; }&gt;</code>

--------------------


### getSSID()

```typescript
getSSID() => Promise<{ ssid: string | null; }>
```

**Returns:** <code>Promise&lt;{ ssid: string | null; }&gt;</code>

--------------------


### connect(...)

```typescript
connect(options: { ssid: string; password?: string; joinOnce?: boolean; isHiddenSsid?: boolean; }) => Promise<{ ssid: string | null; }>
```

| Param         | Type                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ ssid: string; password?: string; joinOnce?: boolean; isHiddenSsid?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ ssid: string | null; }&gt;</code>

--------------------


### connectPrefix(...)

```typescript
connectPrefix(options: { ssid: string; password?: string; joinOnce?: boolean; }) => Promise<{ ssid: string | null; }>
```

| Param         | Type                                                                  |
| ------------- | --------------------------------------------------------------------- |
| **`options`** | <code>{ ssid: string; password?: string; joinOnce?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ ssid: string | null; }&gt;</code>

--------------------


### disconnect()

```typescript
disconnect() => Promise<void>
```

--------------------

</docgen-api>