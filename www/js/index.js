/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        document.getElementById("button1").addEventListener('touchstart', app.onButton1Click);
        document.getElementById("button2").addEventListener('touchstart', app.onButton2Click);
        document.getElementById("button3").addEventListener('touchstart', app.onButton3Click);
    },
    
    onButton1Click: function() {
        console.log('clicked button1');
        bluetoothle.initialize(initializeSuccess, initializeError);
    },

    onButton2Click: function() {
        console.log('clicked button2');
        window.navigator.geolocation.getCurrentPosition(function(location) {
                                                        console.log('Location from Phonegap');
                                                        });
        
        var bgGeo = window.plugins.backgroundGeoLocation;
        
        /**
         * This callback will be executed every time a geolocation is recorded in the background on iOS.
         */
        var callbackFn = function(location) {
	    var send = JSON.stringify({
		"location": { 
			"longitude": position.coords.longitude,
			"recorded_at": "",
			"latitude": position.coords.latitude,
			"speed": position.coords.speed,
			"accuracy": position.coords.altitudeAccuracy,
			"altitude": position.coords.altitude }
		});
            console.log(send);

            var r = new XMLHttpRequest();
            r.open("POST", "http://skynet.im/data/"+UUID, true);
            r.setRequestHeader("Content-type", "application/json");
	    r.setRequestHeader("skynet_auth_uuid",UUID);
	    r.setRequestHeader("skynet_auth_token",TOKEN);
            
            r.onreadystatechange = function () {
                if (r.readyState != 4 || r.status != 200) return;
                console.log("Success: " + r.responseText);
            };
            
            r.send(send);
            bgGeo.finish();
        };
        
        var failureFn = function(error) {
            console.log('BackgroundGeoLocation error');
        }
        
        // BackgroundGeoLocation is highly configurable.
        bgGeo.configure(callbackFn, failureFn, {
        		url: 'http://skynet.im/data/' + UUID, // <-- only required for Android; ios allows javascript callbacks for your http
        		params: {                                               // HTTP POST params sent to your server when persisting locations.
        		},
			headers: {
				"skynet_auth_uuid": UUID,
            			"skynet_auth_token": TOKEN
			},
                        desiredAccuracy: 10,
                        stationaryRadius: 20,
                        distanceFilter: 30,
                        debug: true // <-- enable this hear sounds for background-geolocation life-cycle.
                        });
        
        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        bgGeo.start();
    },
    
    onButton3Click: function() {
        console.log('clicked button3');
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {enableHighAccuracy: true, timeout: 15000});
    	var y = new XMLHttpRequest();
    	y.timeout = 10000;
    	y.ontimeout = function() { console.log('XHR timed out'); }
    	y.open("GET", "http://skynet.im/ipaddress", true);
    	y.onreadystatechange = function () {
        if (y.readyState == 4 && y.status == 200) {
 	       console.log("Success: " + y.responseText);
	} else { 
 		console.log("error " + y.status ); return;
	}
    	};
    
    	y.send("");

    },
    
    
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

// onSuccess Callback
//   This method accepts a `Position` object, which contains
//   the current GPS coordinates
//
var onSuccess = function(position) {

    var send = JSON.stringify({
	"location": { 
		"longitude": position.coords.longitude,
		"recorded_at": "",
		"latitude": position.coords.latitude,
		"speed": position.coords.speed,
		"accuracy": position.coords.altitudeAccuracy,
		"altitude": position.coords.altitude }
	});

    console.log("Sending location: " + send);
    var r = new XMLHttpRequest();
    r.open("POST", "http://skynet.im/data/"+UUID, true);
    r.setRequestHeader("Content-type", "application/json");
    r.setRequestHeader("skynet_auth_uuid",UUID);
    r.setRequestHeader("skynet_auth_token",TOKEN);
    r.timeout = 4000;
    r.ontimeout = function() { console.log('XHR timed out'); }

    console.log(UUID);
    console.log(TOKEN);
    
    r.onreadystatechange = function () {
        if (r.readyState == 4 && r.status == 200) {
 	       console.log("Success: " + r.responseText);
	} else { 
 		console.log("error " + r.status ); return;
	}
    };
    
    r.send(send);

};

// onError Callback receives a PositionError object
//
function onError(error) {
    console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}
