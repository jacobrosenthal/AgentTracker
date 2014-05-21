var addressKey = "address";

var heartRateServiceUuid = "180d";
var heartRateMeasurementCharacteristicUuid = "2a37";
var clientCharacteristicConfigDescriptorUuid = "2902"; //?not on wahoo, not used here except logging anyway
var batteryServiceUuid = "180f";
var batteryLevelCharacteristicUuid = "2a19";

var scanTimer = null;
var connectTimer = null;
var reconnectTimer = null;

var iOSPlatform = "iOS";
var androidPlatform = "Android";


function initializeSuccess(obj)
{
    console.log("initializeSuccess");
    
    if (obj.status == "initialized")
    {
	// if address os null from config, then get it from saved item
	if (address == null) {
		address = window.localStorage.getItem(addressKey);
	}
	// if saved item is still null, then search for one
        if (address == null)
        {
            console.log("Bluetooth initialized successfully, starting scan for heart rate devices.");
            var paramsObj = {"serviceUuids":[heartRateServiceUuid]};
            bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
        }
        else
        {
            connectDevice(address);
        }
    }
    else
    {
        console.log("Unexpected initialize status: " + obj.status);
    }
}

function initializeError(obj)
{
    console.log("Initialize error: " + obj.error + " - " + obj.message);
}

function startScanSuccess(obj)
{
    console.log("startScanSuccess");
    
    if (obj.status == "scanResult")
    {
        console.log("Stopping scan..");
        bluetoothle.stopScan(stopScanSuccess, stopScanError);
        clearScanTimeout();
        
        window.localStorage.setItem(addressKey, obj.address);
        connectDevice(obj.address);
    }
    else if (obj.status == "scanStarted")
    {
        console.log("Scan was started successfully, stopping in 10");
        scanTimer = setTimeout(scanTimeout, 10000);
    }
    else
    {
        console.log("Unexpected start scan status: " + obj.status);
    }
}

function startScanError(obj)
{
    console.log("Start scan error: " + obj.error + " - " + obj.message);
}

function scanTimeout()
{
    console.log("Scanning time out, stopping");
    bluetoothle.stopScan(stopScanSuccess, stopScanError);
}

function clearScanTimeout()
{
    console.log("Clearing scanning timeout");
    if (scanTimer != null)
    {
        clearTimeout(scanTimer);
    }
}

function stopScanSuccess(obj)
{
    if (obj.status == "scanStopped")
    {
        console.log("Scan was stopped successfully");
    }
    else
    {
        console.log("Unexpected stop scan status: " + obj.status);
    }
}

function stopScanError(obj)
{
    console.log("Stop scan error: " + obj.error + " - " + obj.message);
}

function connectDevice(address)
{
    console.log("Begining connection to: " + address + " with 5 second timeout");
    var paramsObj = {"address":address};
    bluetoothle.connect(connectSuccess, connectError, paramsObj);
    connectTimer = setTimeout(connectTimeout, 5000);
}

function connectSuccess(obj)
{
    console.log("connectSuccess");
    
    if (obj.status == "connected")
    {
        console.log("Connected to : " + obj.name + " - " + obj.address);

        clearConnectTimeout();

        tempDisconnectDevice();

    }
    else if (obj.status == "connecting")
    {
        console.log("Connecting to : " + obj.name + " - " + obj.address);
    }
    else
    {
        console.log("Unexpected connect status: " + obj.status);
        clearConnectTimeout();
    }
}

function connectError(obj)
{
    console.log("Connect error: " + obj.error + " - " + obj.message);
    clearConnectTimeout();
}

function connectTimeout()
{
    console.log("Connection timed out");
}

function clearConnectTimeout()
{
    console.log("Clearing connect timeout");
    if (connectTimer != null)
    {
        clearTimeout(connectTimer);
    }
}

function tempDisconnectDevice()
{
    console.log("Disconnecting from device to test reconnect");
    bluetoothle.disconnect(tempDisconnectSuccess, tempDisconnectError);
}

function tempDisconnectSuccess(obj)
{
    if (obj.status == "disconnected")
    {
        console.log("Temp disconnect device and reconnecting in 1 second. Instantly reconnecting can cause issues");
        setTimeout(reconnect, 1000);
    }
    else if (obj.status == "disconnecting")
    {
        console.log("Temp disconnecting device");
    }
    else
    {
        console.log("Unexpected temp disconnect status: " + obj.status);
    }
}

function tempDisconnectError(obj)
{
    console.log("Temp disconnect error: " + obj.error + " - " + obj.message);
}

function reconnect()
{
    console.log("Reconnecting with 5 second timeout");
    bluetoothle.reconnect(reconnectSuccess, reconnectError);
    reconnectTimer = setTimeout(reconnectTimeout, 5000);
}

function reconnectSuccess(obj)
{
    if (obj.status == "connected")
    {
        console.log("Reconnected to : " + obj.name + " - " + obj.address);
        
        clearReconnectTimeout();
        
        if (window.device.platform == iOSPlatform)
        {
            console.log("Discovering heart rate service");
            var paramsObj = {"serviceUuids":[heartRateServiceUuid]};
            bluetoothle.services(servicesHeartSuccess, servicesHeartError, paramsObj);
        }
        else if (window.device.platform == androidPlatform)
        {
            console.log("Beginning discovery");
            bluetoothle.discover(discoverSuccess, discoverError);
        }
    }
    else if (obj.status == "connecting")
    {
        console.log("Reconnecting to : " + obj.name + " - " + obj.address);
    }
    else
    {
        console.log("Unexpected reconnect status: " + obj.status);
        disconnectDevice();
    }
}

function reconnectError(obj)
{
    console.log("Reconnect error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function reconnectTimeout()
{
    console.log("Reconnection timed out");
}

function clearReconnectTimeout()
{
    console.log("Clearing reconnect timeout");
    if (reconnectTimer != null)
    {
        clearTimeout(reconnectTimer);
    }
}

function servicesHeartSuccess(obj)
{
    console.log("servicesHeartSuccess");
    
    if (obj.status == "discoveredServices")
    {
        var serviceUuids = obj.serviceUuids;
        for (var i = 0; i < serviceUuids.length; i++)
        {
            var serviceUuid = serviceUuids[i];
            
            if (serviceUuid == heartRateServiceUuid)
            {
                console.log("Finding heart rate characteristics");
                var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuids":[heartRateMeasurementCharacteristicUuid]};
                bluetoothle.characteristics(characteristicsHeartSuccess, characteristicsHeartError, paramsObj);
                return;
            }
        }
        console.log("Error: heart rate service not found");
    }
    else
    {
        console.log("Unexpected services heart status: " + obj.status);
    }
    disconnectDevice();
}

function servicesHeartError(obj)
{
    console.log("Services heart error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function characteristicsHeartSuccess(obj)
{
    if (obj.status == "discoveredCharacteristics")
    {
        var characteristicUuids = obj.characteristicUuids;
        for (var i = 0; i < characteristicUuids.length; i++)
        {
            console.log("Heart characteristics found, now discovering descriptor");
            var characteristicUuid = characteristicUuids[i];
            
            if (characteristicUuid == heartRateMeasurementCharacteristicUuid)
            {
                var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuid":heartRateMeasurementCharacteristicUuid};
                bluetoothle.descriptors(descriptorsHeartSuccess, descriptorsHeartError, paramsObj);
                return;
            }
        }
        console.log("Error: Heart rate measurement characteristic not found.");
    }
    else
    {
        console.log("Unexpected characteristics heart status: " + obj.status);
    }
    disconnectDevice();
}

function characteristicsHeartError(obj)
{
    console.log("Characteristics heart error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function descriptorsHeartSuccess(obj)
{
    if (obj.status == "discoveredDescriptors")
    {
        console.log("Discovered heart descriptors, now discovering battery service");
        var paramsObj = {"serviceUuids":[batteryServiceUuid]};
        bluetoothle.services(servicesBatterySuccess, servicesBatteryError, paramsObj);
    }
    else
    {
        console.log("Unexpected descriptors heart status: " + obj.status);
        disconnectDevice();
    }
}

function descriptorsHeartError(obj)
{
    console.log("Descriptors heart error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function servicesBatterySuccess(obj)
{
    if (obj.status == "discoveredServices")
    {
        var serviceUuids = obj.serviceUuids;
        for (var i = 0; i < serviceUuids.length; i++)
        {
            var serviceUuid = serviceUuids[i];
            
            if (serviceUuid == batteryServiceUuid)
            {
                console.log("Found battery service, now finding characteristic");
                var paramsObj = {"serviceUuid":batteryServiceUuid, "characteristicUuids":[batteryLevelCharacteristicUuid]};
                bluetoothle.characteristics(characteristicsBatterySuccess, characteristicsBatteryError, paramsObj);
                return;
            }
        }
        console.log("Error: battery service not found");
    }
    else
    {
        console.log("Unexpected services battery status: " + obj.status);
    }
    disconnectDevice();
}

function servicesBatteryError(obj)
{
    console.log("Services battery error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function characteristicsBatterySuccess(obj)
{
    if (obj.status == "discoveredCharacteristics")
    {
        var characteristicUuids = obj.characteristicUuids;
        for (var i = 0; i < characteristicUuids.length; i++)
        {
            var characteristicUuid = characteristicUuids[i];
            
            if (characteristicUuid == batteryLevelCharacteristicUuid)
            {
                readBatteryLevel();
                return;
            }
        }
        console.log("Error: Battery characteristic not found.");
    }
    else
    {
        console.log("Unexpected characteristics battery status: " + obj.status);
    }
    disconnectDevice();
}

function characteristicsBatteryError(obj)
{
    console.log("Characteristics battery error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function discoverSuccess(obj)
{
    if (obj.status == "discovered")
    {
        console.log("Discovery completed");
        
        readBatteryLevel();
    }
    else
    {
        console.log("Unexpected discover status: " + obj.status);
        disconnectDevice();
    }
}

function discoverError(obj)
{
    console.log("Discover error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function readBatteryLevel()
{
    console.log("Reading battery level");
    var paramsObj = {"serviceUuid":batteryServiceUuid, "characteristicUuid":batteryLevelCharacteristicUuid};
    bluetoothle.read(readSuccess, readError, paramsObj);
}

function readSuccess(obj)
{
    if (obj.status == "read")
    {
        var bytes = bluetoothle.encodedStringToBytes(obj.value);
        console.log("Battery level: " + bytes[0]);
        
        console.log("Subscribing to heart rate for 5 seconds");
        var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuid":heartRateMeasurementCharacteristicUuid};
        bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
        // setTimeout(unsubscribeDevice, 5000);
    }
    else
    {
        console.log("Unexpected read status: " + obj.status);
        disconnectDevice();
    }
}

function readError(obj)
{
    console.log("Read error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function subscribeSuccess(obj)
{
    if (obj.status == "subscribedResult")
    {
        console.log("Subscription data received");
        
        //Parse array of int32 into uint8
        var bytes = bluetoothle.encodedStringToBytes(obj.value);
        
        //Check for data
        if (bytes.length == 0)
        {
            console.log("Subscription result had zero length data");
            return;
        }
        
        //Get the first byte that contains flags
        var flag = bytes[0];
        
        //Check if u8 or u16 and get heart rate
        var hr;
        if ((flag & 0x01) == 1)
        {
            var u16bytes = bytes.buffer.slice(1, 3);
            var u16 = new Uint16Array(u16bytes)[0];
            hr = u16;
        }
        else
        {
            var u8bytes = bytes.buffer.slice(1, 2);
            var u8 = new Uint8Array(u8bytes)[0];
            hr = u8;
        }
        console.log("Heart Rate: " + hr);

        var div = document.getElementById('result');
        div.innerHTML = 'Loading...';

        var send = "heartrate="+ hr;

        var r = new XMLHttpRequest();
        r.open("POST", "http://skynet.im/data/"+UUID, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        r.setRequestHeader("skynet_auth_uuid",UUID);
        r.setRequestHeader("skynet_auth_token",TOKEN);

        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;
            console.log("Success: " + r.responseText);
            div.innerHTML = r.responseText;
        };

        r.send(send);

    }
    else if (obj.status == "subscribed")
    {
        console.log("Subscription started");
    }
    else
    {
        console.log("Unexpected subscribe status: " + obj.status);
        disconnectDevice();
    }
}

function subscribeError(msg)
{
    console.log("Subscribe error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function unsubscribeDevice()
{
    console.log("Unsubscribing heart service");
    var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuid":heartRateMeasurementCharacteristicUuid};
    bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
}

function unsubscribeSuccess(obj)
{
    if (obj.status == "unsubscribed")
    {
        console.log("Unsubscribed device");
        
        console.log("Reading client configuration descriptor");
        var paramsObj = {"serviceUuid":heartRateServiceUuid, "characteristicUuid":heartRateMeasurementCharacteristicUuid, "descriptorUuid":clientCharacteristicConfigDescriptorUuid};
        bluetoothle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);
    }
    else
    {
        console.log("Unexpected unsubscribe status: " + obj.status);
        disconnectDevice();
    }
}

function unsubscribeError(obj)
{
    console.log("Unsubscribe error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function readDescriptorSuccess(obj)
{
    if (obj.status == "readDescriptor")
    {
        var bytes = bluetoothle.encodedStringToBytes(obj.value);
        var u16Bytes = new Uint16Array(bytes.buffer);
        console.log("Read descriptor value: " + u16Bytes[0]);
        disconnectDevice();
    }
    else
    {
        console.log("Unexpected read descriptor status: " + obj.status);
        disconnectDevice();
    }
}

function readDescriptorError(obj)
{
    console.log("Read Descriptor error: " + obj.error + " - " + obj.message);
    disconnectDevice();
}

function disconnectDevice()
{
    bluetoothle.disconnect(disconnectSuccess, disconnectError);
}

function disconnectSuccess(obj)
{
    if (obj.status == "disconnected")
    {
        console.log("Disconnect device");
        closeDevice();
    }
    else if (obj.status == "disconnecting")
    {
        console.log("Disconnecting device");
    }
    else
    {
        console.log("Unexpected disconnect status: " + obj.status);
    }
}

function disconnectError(obj)
{
    console.log("Disconnect error: " + obj.error + " - " + obj.message);
}

function closeDevice()
{
    bluetoothle.close(closeSuccess, closeError);
}

function closeSuccess(obj)
{
    if (obj.status == "closed")
    {
        console.log("Closed device");
    }
    else
    {
        console.log("Unexpected close status: " + obj.status);
    }
}

function closeError(obj)
{
    console.log("Close error: " + obj.error + " - " + obj.message);
}
