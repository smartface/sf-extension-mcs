const Notications = require("sf-core/notifications");
const Http = require('sf-core/net/http');
const System = require('sf-core/device/system');
const expect = require('chai').expect
const Base64_Helper = require("./base64");
const Base64 = new Base64_Helper();

/**
 * Creates new instace of MCS
 * @class
 * @param {object} options - init object
 * @param {string} options.baseUrl - MCS Base URL
 * @param {string} options.backendId - MCS BackendId
 * @param {string} options.androidApplicationKey - MCS Android Client Key
 * @param {string} options.iOSApplicationKey - MCS iOS Client Key
 * @param {string} options.anonymousKey - MCS Basic Anonymous Key
 */
function MCS(options) {

    expect(options).to.be.a('object');
    expect(options).to.have.property('backendId').that.is.a('string');
    expect(options).to.have.property('baseUrl').that.is.a('string');

    const self = this;
    var backendID = options.backendId;
    var deviceToken;
    var baseUrl = options.baseUrl;
    var anonymousKey = options.anonymousKey;
    var authorization = anonymousKey ? "Basic " + anonymousKey : "";
    var androidApplicationKey = options.androidApplicationKey;
    var iOSApplicationKey = options.iOSApplicationKey;

    /**
     * login to MCS
     * @method
     * @param {object} options - login options
     * @param {string} options.username - MCS Username
     * @param {string} options.password - MCS Password
     * @param {MCS~loginCallback} callback for login
     * @example result:
     *   {
     *     "id": "295e450a-63f0-41fa-be43-cd2dbcb21598",
     *     "username": "joe",
     *     "email": "joe@example.com",
     *     "firstName": "Joe",
     *     "lastName": "Doe",
     *     "links": [
     *       { "rel": "canonical", "href": "/mobile/platform/users/joe" },
     *       { "rel": "self", "href": "/mobile/platform/users/joe" }
     *     ]
     *   }
     */
    this.login = function login(options, callback) {

        var username = options.username;
        var password = options.password;

        var url = baseUrl + '/mobile/platform/users/' + username;
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': 'Basic ' + Base64.encode(username + ':' + password)
        };
        var body = '';


        Http.request({
                'url': url,
                'headers': headers,
                'method': 'GET',
                'body': body

            },
            function(e) {

                authorization = 'Basic ' + Base64.encode(username + ':' + password);

                var response = JSON.parse(e.body.toString());

                if (response.id == null) {
                    callback(e.body.toString());
                }
                else {
                    callback(null, e.body.toString());
                }

            },
            function(e) {
                callback(e);
            }
        );
    };

    /**
     * @callback MCS~loginCallback
     * @param {string} err - Error
     * @param {string} result - json result
     */


    /**
     * Logs out authenticated user, using Anonymous Key if provided
     */
    this.logout = function logout() {
        authorization = anonymousKey ? "Basic " + anonymousKey : "";
    };


    /**
     * Register device push notification token to MCS
     * @method
     * @param {object} options - push notification options
     * @param {string} options.packageName - Application package name
     * @param {string} options.version - Application version
     * @param {MCS~registerDeviceTokenCallback} callback for registerDeviceToken
     * @example result:
     *   {
     *     "id": "8a8a1eff-83c3-41b4-bea8-33357962d9a7",
     *     "user": "joe",
     *     "notificationToken": "03767dea-29ac-4440-b4f6-75a755845ade",
     *     "notificationProvider": "APNS",
     *     "mobileClient": {
     *       "id": "com.oracle.myapplication",
     *       "version": "1.0",
     *       "platform": "IOS"
     *     },
     *     "modifiedOn": "2015-05-05'T'12:09:33.281'Z"
     *   }
     */
    this.registerDeviceToken = function registerDeviceToken(options, callback) {

        var packageName = options.packageName;
        var version = options.version;

        Notications.registerForPushNotifications(
            function(e) {

                deviceToken = e.token;

                var notificationProvider = (System.OS == 'iOS') ? 'APNS' : 'GCM';
                var url = baseUrl + '/mobile/platform/devices/register';
                var headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Oracle-Mobile-Backend-Id': backendID,
                    'Authorization': authorization
                };

                var body = {
                    notificationToken: deviceToken,
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
                        }
                        else {
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
     * @callback MCS~registerDeviceTokenCallback
     * @param {string} err - Error
     * @param {string} result - json result
     */


    /**
     * Deregister device push notification token from MCS
     * @method
     * @param {object} options - push notification options
     * @param {string} options.packageName - Application package name
     * @param {MCS~deregisterDeviceTokenCallback} callback for deregisterDeviceToken
     */
    this.deregisterDeviceToken = function deregisterDeviceToken(options, callback) {

        Notications.registerForPushNotifications(
            function(e) {

                var packageName = options.packageName;

                var notificationProvider = (System.OS == 'iOS') ? 'APNS' : 'GCM';
                var url = baseUrl + '/mobile/platform/devices/deregister';
                var headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Oracle-Mobile-Backend-Id': backendID,
                    'Authorization': authorization
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
     * @callback MCS~deregisterDeviceTokenCallback
     * @param {string} err - Error
     * @param {string} result
     */

    /**
     * Send Analytic Event to MCS
     * @see {@link https://docs.oracle.com/en/cloud/paas/mobile-cloud/mcsra/op-mobile-platform-analytics-events-post.html Oracle Docs}
     * @method
     * @param {object} options - Analytic options
     * @param {string} options.deviceId - Specific Device ID
     * @param {string} options.sessionId - Session ID
     * @param {object} options.body - Event json array
     * @param {MCS~sendAnalyticCallback} callback for sendAnalytic
     */
    this.sendAnalytic = function sendAnalytic(options, callback) {

        var deviceID = options.deviceId;
        var sessionID = options.sessionId;
        var jsonBody = options.body;
        var applicationKey = (System.OS == 'iOS') ? iOSApplicationKey : androidApplicationKey;
        expect(applicationKey).to.be.a('string');

        if (typeof jsonBody === "object")
            jsonBody = JSON.stringify(jsonBody);

        var url = baseUrl + '/mobile/platform/analytics/events';
        var headers = {
            'Oracle-Mobile-Backend-Id': backendID,
            'authorization': authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'oracle-mobile-application-key': applicationKey,
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
                }
                else {
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
     * @callback MCS~sendAnalyticCallback
     * @param {string} err - Error
     * @param {string} result - json result
     * @example result:
     *  {"message": "1 events accepted for processing."}
     */

    /**
     * Send Analytic Event to MCS
     * @method
     * @param {object} options - Analytic options
     * @param {string} options.deviceId - Specific Device ID
     * @param {string} options.sessionId - Session ID
     * @param {object} options.eventName - Event name
     * @param {MCS~sendBasicEventCallback} callback for sendBasicEvent
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
     * @callback MCS~sendBasicEventCallback
     * @param {string} err - Error
     * @param {string} result - json result
     * @example result:
     *  {"message": "1 events accepted for processing."}
     */


    /**
     * Get all collections list from MCS
     * @method
     * @param {MCS~getCollectionListCallback} callback for getCollectionList
     */
    this.getCollectionList = function getCollectionList(callback) {


        var url = baseUrl + '/mobile/platform/storage/collections';
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization
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
                }
                else {
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
     * @callback MCS~getCollectionListCallback
     * @param {string} err - Error
     * @param {object[]} result array for collections
     * @param {string} result[].id - collection id
     * @param {string} result[].description - collection description
     */


    /**
     * Get item list in collection from MCS
     * @param {string|object} options - MCS collection id
     * @param {string} options.collectionId - MCS collection id
     * @param {getItemListInCollectionCallback} callback for getItemListInCollection
     */
    this.getItemListInCollection = function getItemListInCollection(options, callback) {

        var collectionId = options;

        if (typeof options === "object" && options.collectionId)
            collectionId = options.collectionId;

        var url = baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects';
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization
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
                }
                else {
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
     * @callback MCS~getItemListInCollectionCallback
     * @param {string} err - Error
     * @param {object[]} result
     * @param {string} result[].id - item id
     * @param {string} result[].name - item name
     * @param {string} result[].contentType - item contentType
     * @param {string} result[].createdBy - item createdBy
     * @param {string} result[].createdOn - item createdOn
     * @param {string} result[].modifiedBy - item modifiedBy
     * @param {string} result[].modifiedOn - item modifiedOn
     */


    /**
     * Get item data from MCS
     * @param {object} options - Analytic options
     * @param {string} options.collectionId - MCS collection Id
     * @param {string} options.itemId - MCS item Id
     * @param {MCS~getItemCallback} callback for getItem
     *
     */
    this.getItem = function getItem(options, callback) {

        var collectionId = options.collectionId;
        var itemId = options.itemId;

        var url = baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects/' + itemId;
        var headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization
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
     * @callback MCS~getItemCallback
     * @param {string} err - Error
     * @param {string} result - base64 encoded file data
     */

    /**
     * Store item to MCS
     * @param {object} options - Analytic options
     * @param {string} options.collectionId - MCS collection Id
     * @param {string} options.itemName - item full name
     * @param {string} options.base64EncodeData - item base64 encode data
     * @param {string} options.contentType - item content type
     * @param {MCS~storeItemCallback} callback for storeItem
     */
    this.storeItem = function storeItem(options, callback) {

        var collectionId = options.collectionId;
        var itemName = options.itemName;
        var base64EncodeData = options.base64EncodeData;
        var contentType = options.contentType;


        var url = baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects';
        var headers = {
            //'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization,
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
     * @callback MCS~storeItemCallback
     * @param {string} err - Error
     * @param {string} result - json result
     * @example
     *   {
     *     "id": "947119e5-b45c-498b-a643-dca279b24f07",
     *     "name": "947119e5-b45c-498b-a643-dca279b24f07",
     *     "user": "8c8f1a5a-e56b-494b-9a99-f03d562c1ee7",
     *     "contentLength": 59,
     *     "contentType": "text/plain",
     *     "eTag": "\"1\"",
     *     "createdBy": "mobileuser",
     *     "createdOn": "2015-06-24T02:59:08Z",
     *     "modifiedBy": "mobileuser",
     *     "modifiedOn": "2015-06-24T02:59:08Z",
     *     "links": [
     *       {
     *         "rel": "canonical",
     *         "href": "/mobile/platform/storage/collections/technicianNotes/objects/947119e5-b45c-498b-a643-dca279b24f07?user=8c8f1a5a-e56b-494b-9a99-f03d562c1ee7"
     *       },
     *       {
     *         "rel": "self",
     *         "href": "/mobile/platform/storage/collections/technicianNotes/objects/947119e5-b45c-498b-a643-dca279b24f07"
     *       }
     *     ]
     *   }
     */

    /**
     * Delete item data from MCS
     * @param {object} options - Analytic options
     * @param {string} options.collectionId - MCS collection Id
     * @param {string} options.itemId - MCS item Id
     * @param {MCS~deleteItemCallback} callback for deleteItem
     */
    this.deleteItem = function deleteItem(options, callback) {

        var collectionId = options.collectionId;
        var itemId = options.itemId;

        var url = baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects/' + itemId;
        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization
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
     * @callback MCS~deleteItemCallback
     * @param {string} err - Error
     * @param {string} result - info message
     */


    /**
     * Custom Api Caller to MCS
     * @param {object} options - api caller options
     * @param {string} options.apiName - MCS Custom Api name
     * @param {string} options.endpointName - MCS Custom Api endpoint name
     * @param {array}  options.parameters - MCS query parameters array
     * @param {string} options.parameters.key - MCS query parameter name
     * @param {string} options.parameters.value - MCS query parameter value
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result - your web service result
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

        var url = baseUrl + '/mobile/custom/' + apiName + '/' + endpointName + '?' + query;

        console.log(url);
        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization
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
     * @param {object} options - api caller options
     * @param {string} options.apiName - MCS Custom Api name
     * @param {string} options.endpointName - MCS Custom Api endpoint name
     * @param {string|object} options.body - MCS Custom Api string or object body
     * @param {array}  options.headerParameters - MCS header parameters array
     * @param {string} options.headerParameters.key - MCS header parameter name
     * @param {string} options.headerParameters.value - MCS header parameter value
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result - your web service result
     *
     */
    this.apiCallerPostMethod = function apiCallerPostMethod(options, callback) {

        var apiName = options.apiName;
        var endpointName = options.endpointName;
        var headerParameters = options.headerParameters;

        var url = baseUrl + '/mobile/custom/' + apiName + '/' + endpointName;
        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization
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
     * @param {string} err - Error
     * @param {string} result
     *
     */
    this.getAppPolicies = function getAppPolicies(callback) {

        var url = baseUrl + '/mobile/platform/appconfig/client';

        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization
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
     * @param {object} options
     * @param {string} options.name
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result
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
     * @param {object} options
     * @param {string} options.id
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result
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
     * @param {object} options
     * @param {string} options.name
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result
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
     * @param {object} options
     * @param {string} options.id
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result
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
     * @param {object} options
     * @param {string} options.name
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result
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
     * @param {object} options
     * @param {string} options.id
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result
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
     * @param {object} options
     * @param {string} options.key
     * @param {string} options.value
     * @param {string} options.pathStr
     * @param {string} options.isQuery
     *
     * @callback callback
     * @param {string} err - Error
     * @param {string} result
     *
     */
    function getLocationList(options, callback) {

        var key = options.key;
        var value = options.value;
        var pathStr = options.pathStr;
        var isQuery = options.isQuery;

        var url = baseUrl + '/mobile/platform/location/' + pathStr;



        if (isQuery) {

            url += '?' + key + '=' + value;
        }
        else {
            url += '/' + value;
        }


        var headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': backendID,
            'Authorization': authorization,
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
