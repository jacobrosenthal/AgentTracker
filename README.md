AgentTracker
============

BLE HeartRate monitor to Skynet.im over Phonegap iOS and Android tested

##Dependencies
Cordova plugins
```bash
cordova plugin add org.apache.cordova.console
cordova plugin add org.apache.cordova.device
cordova plugin add https://github.com/randdusing/BluetoothLE.git
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git
cordova plugin add https://github.com/zgiles/cordova-plugin-background-geolocation.git
```
Skynet uuid and token:
http://skynet.im

##Use
Edit index.js and hm-skynet.js for your UUID and TOKEN. Load up the app.

HR En will attempt to detect your ble heartrate reader like:
http://www.amazon.com/Wahoo-TICKR-Monitor-iPhone-Android/dp/B00INQVYZ8
http://www.amazon.com/Polar-Bluetooth-Smart-Heart-Sensor/dp/B007S088F4

If detected it will send the data to skynet and you'll get a success callback below the buttons with your heartrate and other skynet data. If you dont see anything check your console logs. As much as possible, the app will attempt to continue sending data even when you background the app.

GEO En will enable BACKGROUND geo updates. These can be very infrequenct in order to save battery life and will depend on how fast you're moving, etc. When one is received it will attempt to be sent to skynet as well. It helps to kill the app if heartrate is already logging in order to see geo reqeusts without the extra heartrate noise.

GEO Query will do a geo request, will send that data to skynet, and will pop an alert with the data. These manual queries are handy because while standing still you wont get any additional geolocations otherwise.

##View Data
Check out http://github.com/zgiles/heart/ for an html Agent Viewer. Input your UUID(s) to track and load it up in any modern browser. As soon as it receives a geolocation request it should add a heart marker with your Agent's live heartrate data!
