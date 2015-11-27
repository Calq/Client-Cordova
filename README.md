# Client-Cordova
Cordova Calq API Client

Installation
------------

Add the Calq plugin to your project using:

```
cordova plugin add https://github.com/Calq/Client-Cordova.git
```

Getting Started
-----------------

First you should initialize the Calq library using `init`. This will create a client and load any existing user information or properties that have been previously set.

```javascript
calq.init("your_write_key_here");
```

After initialization you can use Calq to track actions a user takes using using `calq.action.track`. Specify the action and any associated data you wish to record.

```javascript
// Track a new action called "Product Review" with a custom rating
calq.action.track("Product Review", { Rating: 9.0 });
```
The properties parameter allows you to send additional custom data about the action. This extra data can be used to make advanced queries within Calq.

This plugin is optimized for mobile use and as such API calls may not be sent straight away. To save battery usage and improve throughput, API calls will be batched and sent together every few minutes.

License
--------

[Licensed under the Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).