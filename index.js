const Notications = require("sf-core/notifications");
const Http = require('sf-core/net/http');
const System = require('sf-core/device/system');

const Base64_Helper = require("./base64");

function MCS() {

    var Base64 = new Base64_Helper();
    var self = this;

    this._backendID;
    this._deviceToken;
    this._baseUrl;
    this._authorization;
    this._androidApplicationKey;
    this._iOSApplicationKey;

    /**
     * Init to MCS
     * @params {object} options - init object
     * @params {string} options.baseUrl - MCS Base URL
     * @params {string} options.backendId - MCS BackendId
     * @params {string} options.androidApplicationKey - MCS Android Client Key
     * @params {string} options.iOSApplicationKey - MCS iOS Client Key
     */
    this.init = function init(options) {
        this._baseUrl = options.baseUrl;
        this._backendID = options.backendId;
        this._androidApplicationKey = options.androidApplicationKey;
        this._iOSApplicationKey = options.iOSApplicationKey;
    };


    /**
    * login to MCS
    * @params {object} options - login options
    * @params {string} options.username - MCS Username
    * @params {string} options.password - MCS Password
    * 
    * @callback callback
    * @params {string} err - Error 
    * @params {string} result - json result
    * 
    * @example result:
        {
          "id": "295e450a-63f0-41fa-be43-cd2dbcb21598",
          "username": "joe",
          "email": "joe@example.com",
          "firstName": "Joe",
          "lastName": "Doe",
          "links": [
            { "rel": "canonical", "href": "/mobile/platform/users/joe" },
            { "rel": "self", "href": "/mobile/platform/users/joe" } 
          ]
        } 
    */
    this.login = function login(options, callback) { // callback sadece 

        var username = options.username;
        var password = options.password;

        var url = self._baseUrl + '/mobile/platform/users/' + username;
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': 'Basic ' + Base64.encode(username + ':' + password) // burada base 64 çevir
        };
        var body = '';


        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                self._authorization = 'Basic ' + Base64.encode(username + ':' + password);

                var response = JSON.parse(e.body.toString());

                if (response.id == null) {
                    callback(e.body.toString());
                } else {
                    callback(null, e.body.toString());
                }

            },
            function(e) {
                callback(e);
            }
        );
    };


    /**
    * Register device push notification token to MCS
    * @params {object} options - push notification options
    * @params {string} options.packageName - Application package name
    * @params {string} options.version - Application version
    * 
    * @callback callback
    * @params {string} err - Error
    * @params {string} result - json result
    * 
    * @example result:
        {
          "id": "8a8a1eff-83c3-41b4-bea8-33357962d9a7",
          "user": "joe",
          "notificationToken": "03767dea-29ac-4440-b4f6-75a755845ade",
          "notificationProvider": "APNS",
          "mobileClient": {
            "id": "com.oracle.myapplication",
            "version": "1.0",
            "platform": "IOS"
          },
          "modifiedOn": "2015-05-05'T'12:09:33.281'Z"
        }
    */
    this.registerDeviceToken = function registerDeviceToken(options, callback) {

        var packageName = options.packageName;
        var version = options.version;

        Notications.registerForPushNotifications(
            function(e) {

                self._deviceToken = e.token;

                var notificationProvider = (System.OS == 'iOS') ? 'APNS' : 'GCM';
                var url = self._baseUrl + '/mobile/platform/devices/register';
                var headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Oracle-Mobile-Backend-Id': self._backendID,
                    'Authorization': self._authorization
                };

                var body = {
                    notificationToken: self._deviceToken,
                    notificationProvider: notificationProvider,
                    mobileClient: {
                        id: packageName,
                        version: version,
                        platform: (System.OS == 'iOS') ? 'IOS' : 'ANDROID'

                    }


                };

                Http.request({
                        'url': url,
                        'headers': headers,
                        'method': 'POST',
                        'body': JSON.stringify(body, null, '\t')

                    },
                    function(e) {

                        var response = JSON.parse(e.body.toString());

                        if (response.id == null) {
                            callback(e.body.toString());
                        } else {
                            callback(null, e.body.toString());
                        }

                    },
                    function(e) {
                        callback(e);
                    }
                );

            },
            function() {
                callback('Register failed.');
            }
        );
    };


    /**
     * Deregister device push notification token to MCS
     * @params {object} options - push notification options
     * @params {string} options.packageName - Application package name
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result 
     * 
     */
    this.deregisterDeviceToken = function deregisterDeviceToken(options, callback) {

        Notications.registerForPushNotifications(
            function(e) {

                var packageName = options.packageName;

                var notificationProvider = (System.OS == 'iOS') ? 'APNS' : 'GCM';
                var url = self._baseUrl + '/mobile/platform/devices/deregister';
                var headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Oracle-Mobile-Backend-Id': self._backendID,
                    'Authorization': self._authorization
                };

                var body = {
                    notificationToken: e.token,
                    notificationProvider: notificationProvider,
                    mobileClient: {
                        id: packageName,
                        platform: (System.OS == 'iOS') ? 'IOS' : 'ANDROID'

                    }


                };


                Http.request({
                        'url': url,
                        'headers': headers,
                        'method': 'POST',
                        'body': JSON.stringify(body, null, '\t')

                    },
                    function(e) {

                        callback(null, 'Device Deleted.');
                    },
                    function(e) {
                        callback(e);
                    }
                );

            },
            function() {
                callback('Register failed.');
            }
        );
    };

    /**
    * Send Analytic Event to MCS
    * @params {object} options - Analytic options
    * @params {string} options.deviceId - Specific Device ID
    * @params {string} options.sessionId - Session ID
    * @params {object} options.body - Event json array
    * @example options.body:
    * https://docs.oracle.com/en/cloud/paas/mobile-cloud/mcsra/op-mobile-platform-analytics-events-post.html
    * 
    * @callback callback
    * @params {string} err - Error
    * @params {string} result - json result
    * 
    * @example result:
        {"message": "1 events accepted for processing."}
    */
    this.sendAnalytic = function sendAnalytic(options, callback) {

        var deviceID = options.deviceId;
        var sessionID = options.sessionId;
        var jsonBody = options.body;

        if (typeof jsonBody === "object")
            jsonBody = JSON.stringify(jsonBody);

        var url = self._baseUrl + '/mobile/platform/analytics/events';
        var headers = {
            'Oracle-Mobile-Backend-Id': self._backendID,
            'authorization': self._authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'oracle-mobile-application-key': (System.OS == 'iOS') ? self._iOSApplicationKey : self._androidApplicationKey,
            'oracle-mobile-analytics-session-id': sessionID,
            'oracle-mobile-device-id': deviceID,
        };
        var body = jsonBody;

        Http.request({
                'url': url,
                'headers': headers,
                'method': 'POST',
                'body': body

            },
            function(e) {

                var response = JSON.parse(e.body.toString());

                if (response.message == null) {
                    callback(e.body.toString());
                } else {
                    callback(null, e.body.toString());
                }

            },
            function(e) {
                alert("Error " + e);
                callback(e);
            }
        );
    };

    /**
    * Send Analytic Event to MCS
    * @params {object} options - Analytic options
    * @params {string} options.deviceId - Specific Device ID
    * @params {string} options.sessionId - Session ID
    * @params {object} options.eventName - Event name
    *
    * @callback callback
    * @params {string} err - Error
    * @params {string} result - json result
    * 
    * @example result:
        {"message": "1 events accepted for processing."}
    */
    this.sendBasicEvent = function sendBasicEvent(options, callback) {

        var eventName = options.eventName;

        var body = [{
            "name": eventName,
            "type": "custom",
            "timestamp": new Date().toISOString()
        }];

        options.body = body;

        self.sendAnalytic(options, callback);

    };


    /**
     * Get all collections list from MCS
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {array} result
     * @params {string} result.id - collection id
     * @params {string} result.description - collection description
     * 
     */
    this.getCollectionList = function getCollectionList(callback) {


        var url = self._baseUrl + '/mobile/platform/storage/collections';
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization
        };
        var body = '';


        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                var response = JSON.parse(e.body.toString());

                if (response.items == null) {
                    callback(e.body.toString());
                } else {
                    var resultArr = [];
                    for (var i = 0; i < response.items.length; i++) {

                        var arrayObject = {};

                        arrayObject.id = response.items[i].id;
                        arrayObject.description = response.items[i].description;

                        resultArr.push(arrayObject);

                    }

                    callback(null, resultArr);
                }

            },
            function(e) {
                callback(e);
            }
        );
    };


    /**
     * Get item list in collection from MCS
     * @params {string|object} options - MCS collection id
     * @params {string} options.collectionId - MCS collection id
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {array} result
     * @params {string} result.id - item id
     * @params {string} result.name - item name
     * @params {string} result.contentType - item contentType
     * @params {string} result.createdBy - item createdBy
     * @params {string} result.createdOn - item createdOn
     * @params {string} result.modifiedBy - item modifiedBy
     * @params {string} result.modifiedOn - item modifiedOn
     * 
     */
    this.getItemListInCollection = function getItemListInCollection(options, callback) {

        var collectionId = options;

        if (typeof options === "object" && options.collectionId)
            collectionId = options.collectionId;

        var url = self._baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects';
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization
        };
        var body = '';


        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                var response = JSON.parse(e.body.toString());

                if (response.items == null) {
                    callback(e.body.toString());
                } else {
                    var resultArr = [];

                    for (var i = 0; i < response.items.length; i++) {

                        var arrayObject = {};

                        arrayObject.id = response.items[i].id;
                        arrayObject.name = response.items[i].name;
                        arrayObject.contentType = response.items[i].contentType;
                        arrayObject.createdBy = response.items[i].createdBy;
                        arrayObject.createdOn = response.items[i].createdOn;
                        arrayObject.modifiedBy = response.items[i].modiedBy;
                        arrayObject.modifiedOn = response.items[i].modiedOn;

                        resultArr.push(arrayObject);

                    }

                    callback(null, resultArr);
                }

            },
            function(e) {
                callback(e);
            }
        );
    };


    /**
     * Get item data from MCS
     * @params {object} options - Analytic options
     * @params {string} options.collectionId - MCS collection Id
     * @params {string} options.itemId - MCS item Id
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result - base64 encoded file data
     * 
     */
    this.getItem = function getItem(options, callback) {

        var collectionId = options.collectionId;
        var itemId = options.itemId;

        var url = self._baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects/' + itemId;
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization
        };
        var body = '';


        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                callback(null, e.body.toString());

            },
            function(e) {
                callback(e);
            }
        );
    };

    /**
    * Store item to MCS
    * @params {object} options - Analytic options
    * @params {string} options.collectionId - MCS collection Id
    * @params {string} options.itemName - item full name
    * @params {string} options.base64EncodeData - item base64 encode data
    * @params {string} options.contentType - item content type
    * 
    * @callback callback
    * @params {string} err - Error
    * @params {string} result - json result
    * 
    * @example result :
        {
          "id": "947119e5-b45c-498b-a643-dca279b24f07",
          "name": "947119e5-b45c-498b-a643-dca279b24f07",
          "user": "8c8f1a5a-e56b-494b-9a99-f03d562c1ee7",
          "contentLength": 59,
          "contentType": "text/plain",
          "eTag": "\"1\"",
          "createdBy": "mobileuser",
          "createdOn": "2015-06-24T02:59:08Z",
          "modifiedBy": "mobileuser",
          "modifiedOn": "2015-06-24T02:59:08Z",
          "links": [
            {
              "rel": "canonical",
              "href": "/mobile/platform/storage/collections/technicianNotes/objects/947119e5-b45c-498b-a643-dca279b24f07?user=8c8f1a5a-e56b-494b-9a99-f03d562c1ee7"
            },
            {
              "rel": "self",
              "href": "/mobile/platform/storage/collections/technicianNotes/objects/947119e5-b45c-498b-a643-dca279b24f07"
            }
          ]
        }
    */
    this.storeItem = function storeItem(options, callback) {

        var collectionId = options.collectionId;
        var itemName = options.itemName;
        var base64EncodeData = options.base64EncodeData;
        var contentType = options.contentType;


        var url = self._baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects';
        var headers = {
            //'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization,
            'Oracle-Mobile-Name': itemName,
            'Content-Type': contentType
        };
        var body = base64EncodeData;

        Http.request({
                'url': url,
                'headers': headers,
                'method': 'POST',
                'body': body

            },
            function(e) {

                callback(null, e.body.toString());

            },
            function(e) {
                callback(e);
            }
        );
    };

    /**
     * Delete item data from MCS
     * @params {object} options - Analytic options
     * @params {string} options.collectionId - MCS collection Id
     * @params {string} options.itemId - MCS item Id
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result - info message
     * 
     */
    this.deleteItem = function deleteItem(options, callback) {

        var collectionId = options.collectionId;
        var itemId = options.itemId;

        var url = self._baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects/' + itemId;
        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization
        };
        var body = '';

        Http.request({
                'url': url,
                'headers': headers,
                'method': 'DELETE',
                'body': body

            },
            function(e) {

                callback(null, 'Item Deleted.');

            },
            function(e) {
                callback(e);
            }
        );
    };

    /**
     * Custom Api Caller to MCS
     * @params {object} options - api caller options
     * @params {string} options.apiName - MCS Custom Api name
     * @params {string} options.endpointName - MCS Custom Api endpoint name
     * @params {array}  options.parameters - MCS query parameters array
     * @params {string} options.parameters.key - MCS query parameter name
     * @params {string} options.parameters.value - MCS query parameter value
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result - your web service result
     * 
     */
    this.apiCallerGetMethod = function apiCallerGetMethod(options, callback) {

        var apiName = options.apiName;
        var endpointName = options.endpointName;
        var query = '';
        for (var i = 0; i < options.parameters.length; i++) {
            query += options.parameters[i].key + '=' + options.parameters[i].value + '&';
        }
        query = query.slice(0, query.length - 1);

        var url = self._baseUrl + '/mobile/custom/' + apiName + '/' + endpointName + '?' + query;

        console.log(url);
        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization
        };
        var body = '';

        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                callback(null, e.body.toString());

            },
            function(e) {
                callback(e);
            }
        );
    };

    /**
     * Custom Api Caller to MCS
     * @params {object} options - api caller options
     * @params {string} options.apiName - MCS Custom Api name
     * @params {string} options.endpointName - MCS Custom Api endpoint name
     * @params {string|object} options.body - MCS Custom Api string or object body
     * @params {array}  options.headerParameters - MCS header parameters array
     * @params {string} options.headerParameters.key - MCS header parameter name
     * @params {string} options.headerParameters.value - MCS header parameter value
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result - your web service result
     * 
     */
    this.apiCallerPostMethod = function apiCallerPostMethod(options, callback) {

        var apiName = options.apiName;
        var endpointName = options.endpointName;
        var headerParameters = options.headerParameters;

        var url = self._baseUrl + '/mobile/custom/' + apiName + '/' + endpointName;
        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization
        };

        for (var i = 0; i < headerParameters.length; i++) {
            headers[headerParameters[i].key] = headerParameters[i].value;
        }


        var body = options.body;

        Http.request({
                'url': url,
                'headers': headers,
                'method': 'POST',
                'body': body

            },
            function(e) {

                callback(null, e.body.toString());

            },
            function(e) {
                callback(e);
            }
        );
    };



    /**
     * Get application policies from MCS
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    this.getAppPolicies = function getAppPolicies(callback) {

        var url = self._baseUrl + '/mobile/platform/appconfig/client';

        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization
        };
        var body = '';

        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                callback(null, e.body.toString());

            },
            function(e) {
                callback(e);
            }
        );
    };



    /**
     * Get Device Location List by Name
     * @params {object} options 
     * @params {string} options.name 
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    this.getDeviceLocationsByName = function getDeviceLocationsByName(options, callback) {


        var optionsLocal = {};
        optionsLocal['key'] = 'name';
        optionsLocal['value'] = options.name;
        optionsLocal['pathStr'] = 'devices';
        optionsLocal['isQuery'] = true;

        getLocationList(optionsLocal, callback);

    };


    /**
     * Get Device Location List by Id
     * @params {object} options 
     * @params {string} options.id 
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    this.getDeviceLocationsById = function getDeviceLocationsById(options, callback) {


        var optionsLocal = {};
        optionsLocal['key'] = 'name';
        optionsLocal['value'] = options.id;
        optionsLocal['pathStr'] = 'devices';
        optionsLocal['isQuery'] = false;

        getLocationList(optionsLocal, callback);

    };


    /**
     * Get Places List by Name
     * @params {object} options
     * @params {string} options.name 
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    this.getPlaceByName = function getPlaceByName(options, callback) {


        var optionsLocal = {};
        optionsLocal['key'] = 'name';
        optionsLocal['value'] = options.name;
        optionsLocal['pathStr'] = 'places';
        optionsLocal['isQuery'] = true;

        getLocationList(optionsLocal, callback);

    };


    /**
     * Get Places List by Id
     * @params {object} options 
     * @params {string} options.id 
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    this.getPlaceById = function getPlaceById(options, callback) {


        var optionsLocal = {};
        optionsLocal['key'] = 'name';
        optionsLocal['value'] = options.id;
        optionsLocal['pathStr'] = 'places';
        optionsLocal['isQuery'] = false;

        getLocationList(optionsLocal, callback);

    };


    /**
     * Get Asset List by Name
     * @params {object} options
     * @params {string} options.name 
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    this.getAssetByName = function getAssetByName(options, callback) {


        var optionsLocal = {};
        optionsLocal['key'] = 'name';
        optionsLocal['value'] = options.name;
        optionsLocal['pathStr'] = 'assets';
        optionsLocal['isQuery'] = true;

        getLocationList(optionsLocal, callback);

    };


    /**
     * Get Asset List by Id
     * @params {object} options 
     * @params {string} options.id 
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    this.getAssetById = function getAssetById(options, callback) {


        var optionsLocal = {};
        optionsLocal['key'] = 'name';
        optionsLocal['value'] = options.id;
        optionsLocal['pathStr'] = 'assets';
        optionsLocal['isQuery'] = false;

        getLocationList(optionsLocal, callback);

    };


    /**
     * Get Location List Base Function
     * @params {object} options
     * @params {string} options.key
     * @params {string} options.value 
     * @params {string} options.pathStr 
     * @params {string} options.isQuery 
     * 
     * @callback callback
     * @params {string} err - Error
     * @params {string} result
     * 
     */
    function getLocationList(options, callback) {

        var key = options.key;
        var value = options.value;
        var pathStr = options.pathStr;
        var isQuery = options.isQuery;

        var url = self._baseUrl + '/mobile/platform/location/' + pathStr;



        if (isQuery) {

            url += '?' + key + '=' + value;
        } else {
            url += '/' + value;
        }


        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': self._backendID,
            'Authorization': self._authorization,
            key: value
        };
        var body = '';

        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                callback(null, e.body.toString());

            },
            function(e) {
                callback(e);
            }
        );
    }


}


module.exports = MCS;