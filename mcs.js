const Notications = require("sf-core/notifications");
const Http = require('sf-core/net/http');
const http = new Http();
const System = require('sf-core/device/system');
const Base64_Helper = require("./base64");
const Base64 = new Base64_Helper();
const privates = new WeakMap();
const Data = require('sf-core/data');
const deviceId = Data.getStringVariable("mcs-deviceId") || (function() {
    var id = uuid();
    Data.setStringVariable("mcs-deviceId", id);
    return id;
})();

const sessionId = uuid();

require("sf-extension-utils/lib/base/timers"); //corrects setTimeout & setInterval

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
class MCS {
    constructor(options) {
        privates.set(this, {
            backendID: options.backendId,
            deviceToken: null,
            baseUrl: options.baseUrl,
            anonymousKey: options.anonymousKey || "",
            authorization: options.anonymousKey ? "Basic " + options.anonymousKey : "",
            androidApplicationKey: options.androidApplicationKey,
            iOSApplicationKey: options.iOSApplicationKey,
            autoFlushEventsTimerId: null,
            eventStore: []
        });
    }

    /**
     * Sets API authorization header value. Compared to login, this does not check
     * @method
     * @param {object} options - authorization options
     * @param {string} options.username - MCS Username
     * @param {string} options.password - MCS Password
     */
    setAuthorization(options) {
        privates[this].authorization = 'Basic ' + Base64.encode(options.username + ':' + options.password);
    }


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
    login(options, callback) {
        const p = privates.get(this);
        const username = options.username;
        const password = options.password;
        const url = p.baseUrl + '/mobile/platform/users/' + username;
        const headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': 'Basic ' + Base64.encode(username + ':' + password)
        };
        http.request({
            'url': url,
            'headers': headers,
            'method': 'GET',
            'onLoad': function(e) {
                p.authorization = 'Basic ' + Base64.encode(username + ':' + password);
                const response = JSON.parse(e.body.toString());
                if (response.id == null) {
                    callback(e.body.toString());
                }
                else {
                    callback(null, e.body.toString());
                }
            },
            'onError': function(e) {
                callback(e);
            }
        });
    }

    /**
     * @callback MCS~loginCallback
     * @param {string} err - Error
     * @param {string} result - json result
     */


    /**
     * Logs out authenticated user, using Anonymous Key if provided
     * @method
     */
    logout() {
        const p = privates.get(this);
        p.authorization = p.anonymousKey ? "Basic " + p.anonymousKey : "";
    }


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
    registerDeviceToken(options, callback) {
        const p = privates.get(this);
        const packageName = options.packageName;
        const version = options.version;
        const mcs = this;

        Notications.registerForPushNotifications(
            function(e) {
                p.deviceToken = e.token;
                mcs.notificationToken = e.token;
                const notificationProvider = (System.OS == 'iOS') ? 'APNS' : 'GCM';
                const url = p.baseUrl + '/mobile/platform/devices/register';
                const headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Oracle-Mobile-Backend-Id': p.backendID,
                    'Authorization': p.authorization
                };
                const body = {
                    notificationToken: p.deviceToken,
                    notificationProvider: notificationProvider,
                    mobileClient: {
                        id: packageName,
                        version: version,
                        platform: (System.OS == 'iOS') ? 'IOS' : 'ANDROID'

                    }
                };
                http.request({
                    'url': url,
                    'headers': headers,
                    'method': 'POST',
                    'body': JSON.stringify(body),
                    'onLoad': function(e) {
                        var response;
                        try {
                            response = JSON.parse(e.body.toString());
                        }
                        catch (ex) {
                            return callback(e.body.toString());
                        }
                        if (response.id == null) {
                            callback(response);
                        }
                        else {
                            callback(null, response);
                        }

                    },
                    'onError': function(e) {
                        callback(e);
                    }
                });

            },
            function() {
                callback('Register failed.');
            }
        );
    }
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
    deregisterDeviceToken(options, callback) {
        const p = privates.get(this);
        Notications.registerForPushNotifications(
            function(e) {
                const packageName = options.packageName;
                const notificationProvider = (System.OS == 'iOS') ? 'APNS' : 'GCM';
                const url = p.baseUrl + '/mobile/platform/devices/deregister';
                const headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Oracle-Mobile-Backend-Id': p.backendID,
                    'Authorization': p.authorization
                };
                const body = {
                    notificationToken: e.token,
                    notificationProvider: notificationProvider,
                    mobileClient: {
                        id: packageName,
                        platform: (System.OS == 'iOS') ? 'IOS' : 'ANDROID'

                    }
                };

                http.request({
                    'url': url,
                    'headers': headers,
                    'method': 'POST',
                    'body': JSON.stringify(body),
                    'onLoad': function(e) {
                        callback(null, 'Device Deleted.');
                    },
                    'onError': function(e) {
                        callback(e);
                    }
                });

            },
            function() {
                callback('Deregister failed.');
            }
        );
    }
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
     * @param {string} [options.deviceId] - can override what is set by the mcs lib
     * @param {string} [options.sessionId] - can override what is set by the mcs lib
     * @param {object} options.body - Event json array
     * @param {MCS~sendAnalyticCallback} [callback] for sendAnalytic
     */
    sendAnalytic(options, callback) {
        const p = privates.get(this);
        const deviceID = options.deviceId || deviceId;
        const sessionID = options.sessionId || sessionId;
        const jsonBody = options.body;
        const applicationKey = (System.OS == 'iOS') ? p.iOSApplicationKey : p.androidApplicationKey;

        if (typeof jsonBody === "object")
            jsonBody = JSON.stringify(jsonBody);

        const url = p.baseUrl + '/mobile/platform/analytics/events';
        const headers = {
            'Oracle-Mobile-Backend-Id': p.backendID,
            'authorization': p.authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'oracle-mobile-application-key': applicationKey,
            'oracle-mobile-analytics-session-id': sessionID,
            'oracle-mobile-device-id': deviceID,
        };
        const body = jsonBody;

        http.request({
            'url': url,
            'headers': headers,
            'method': 'POST',
            'body': body,
            'onLoad': function(e) {
                var response = JSON.parse(e.body.toString());
                if (response.message == null) {
                    callback && callback(e.body.toString());
                }
                else {
                    callback && callback(null, e.body.toString());
                }
            },
            'onError': function(e) {
                alert("Error " + e);
                callback && callback(e);
            }

        });
    }
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
     * @param {string} eventName - Event name
     * @param {MCS~sendBasicEventCallback} [callback] for sendBasicEvent
     */
    sendBasicEvent(eventName, callback) {
        const body = [{
            "name": eventName,
            "type": "custom",
            "timestamp": new Date().toISOString()
        }];
        this.sendAnalytic({ body }, callback);

    }

    /**
     * stores basic events to be sent later. Similar to sendBasicEvent
     * @method
     * @param {string} eventName
     */
    storeBasicEvent(eventName) {
        const p = privates.get(this);
        p.eventStore.push({
            "name": eventName,
            "type": "custom",
            "timestamp": new Date().toISOString()
        });
    }

    /**
     * Sends stored events
     * @method
     * @param {MCS~sendBasicEventCallback} [callback] for sendBasicEvent
     */
    flushEvents(callback) {
        const p = privates.get(this);
        if (p.eventStore.length > 0) {
            var eventCache = p.eventStore.slice();
            p.eventStore.length = 0;

            this.sendAnalytic({ body: eventCache }, (err, result) => {
                if (err) {
                    Array.prototype.unshift.apply(p.eventStore, eventCache);
                }
                callback && callback(err, result);
            });
        }
        else {
            callback && callback();
        }
    }

    /**
     * Starts calling flushEvents periodically
     * @method
     * @param {number} [period = 15000] in miliselcods
     */
    startAutoFlushEvents(period = 15000) {
        privates[this].autoFlushEventsTimerId = setInterval(() => {
            this.flushEvents();
        }, period);
    }

    /**
     * Stops calling flushEvents periodically
     * @method
     */
    stopAutoFlushEvents() {
        const p = privates.get(this);
        if (!p.autoFlushEventsTimerId)
            return;
        clearInterval(p.autoFlushEventsTimerId);
        p.autoFlushEventsTimerId = null;
    }

    /**
     * @prop {boolean} gets calling flushEvents periodically is active or not
     */
    get autoFlushEventsStarted() {
        return !!privates[this].autoFlushEventsTimerId;
    }



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
    getCollectionList(callback) {
        const p = privates.get(this);
        const url = p.baseUrl + '/mobile/platform/storage/collections';
        const headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization
        };
        http.request({
            'url': url,
            'headers': headers,
            'method': 'GET',
            'onLoad': function(e) {
                const response = JSON.parse(e.body.toString());
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
            'onError': function(e) {
                callback(e);
            }

        });
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
     * @method
     * @param {string|object} options - MCS collection id
     * @param {string} options.collectionId - MCS collection id
     * @param {getItemListInCollectionCallback} callback for getItemListInCollection
     */
    getItemListInCollection(options, callback) {
        const p = privates.get(this);
        const collectionId = (options && options.collectionId) || options;
        const url = p.baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects';
        const headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization
        };
        http.request({
            'url': url,
            'headers': headers,
            'method': 'GET',
            'onLoad': function(e) {
                const response = JSON.parse(e.body.toString());
                if (response.items == null) {
                    callback(e.body.toString());
                }
                else {
                    callback(null, response.items);
                }

            },
            'onError': function(e) {
                callback(e);
            }
        });
    }
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
     * @method
     * @param {object} options - Analytic options
     * @param {string} options.collectionId - MCS collection Id
     * @param {string} options.itemId - MCS item Id
     * @param {MCS~getItemCallback} callback for getItem
     *
     */
    getItem(options, callback) {
        const p = privates.get(this);
        const collectionId = (options && options.collectionId) || options;
        const itemId = options.itemId;
        const url = p.baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects/' + itemId;
        const headers = {
            'oracle-mobile-api-version': '1.0',
            'Content-Type': 'application/json; charset=utf-8',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization
        };
        http.request({
            'url': url,
            'headers': headers,
            'method': 'GET',
            'onLoad': function(e) {
                callback(null, e);
            },
            'onError': function(e) {
                callback(e);
            }
        });
    }
    /**
     * @callback MCS~getItemCallback
     * @param {string} err - Error
     * @param {string} result - base64 encoded file data
     */

    /**
     * Store item to MCS
     * @method
     * @param {object} options - Analytic options
     * @param {string} options.collectionId - MCS collection Id
     * @param {string} options.itemName - item full name
     * @param {string} options.base64EncodeData - item base64 encode data
     * @param {string} options.contentType - item content type
     * @param {MCS~storeItemCallback} callback for storeItem
     */
    storeItem(options, callback) {
        const p = privates.get(this);
        const collectionId = (options && options.collectionId) || options;
        const itemName = options.itemName;
        const base64EncodeData = options.base64EncodeData;
        const contentType = options.contentType;
        const url = p.baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects';
        const headers = {
            //'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization,
            'Oracle-Mobile-Name': itemName,
            'Content-Type': contentType
        };
        const body = base64EncodeData;
        http.request({
            'url': url,
            'headers': headers,
            'method': 'POST',
            'body': body,
            'onLoad': function(e) {
                callback(null, e.body.toString());
            },
            'onError': function(e) {
                callback(e);
            }

        });
    }
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
     * @method
     * @param {object} options - Analytic options
     * @param {string} options.collectionId - MCS collection Id
     * @param {string} options.itemId - MCS item Id
     * @param {MCS~deleteItemCallback} callback for deleteItem
     */
    deleteItem(options, callback) {
        const p = privates.get(this);
        const collectionId = options.collectionId;
        const itemId = options.itemId;
        const url = p.baseUrl + '/mobile/platform/storage/collections/' + collectionId + '/objects/' + itemId +
            "?v=" + Math.floor(Math.random() * 100000); //added due to the SUPDEV-470 workaround
        const headers = {
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization
        };

        http.request({
            'url': url,
            'headers': headers,
            'method': 'DELETE',
            'onLoad': function(e) {
                callback(null, 'Item Deleted.');
            },
            'onError': function(e) {
                callback(e);
            }

        });
    }
    /**
     * @callback MCS~deleteItemCallback
     * @param {string} err - Error
     * @param {string} result - info message
     */

    /**
     * Create api request options for MCS Custom API
     * @method
     * @param {object} options - Request options
     * @param {string} options.apiName - MCS Api Name
     * @param {string} options.endpointPath - MCS Endpoint path
     * @param {string} [options.version = "1.0"] - API version, by default 1.0
     * @return {object} httpRequestOption to be used in Smartface request
     */
    createRequestOptions(options) {
        const p = privates.get(this);
        const version = options.version || "1.0";
        const apiName = options.apiName;
        const endpointPath = options.endpointPath;
        const urlBase = p.baseUrl + '/mobile/custom/' + apiName + '/' + endpointPath;
        const headersBase = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization,
            'oracle-mobile-api-version': version
        };
        return {
            url: urlBase,
            headers: headersBase
        };

    }

    /**
     * Get application policies from MCS
     * @method
     * @param {MCS~getAppPoliciesCallback} callback for getAppPolicies
     */
    getAppPolicies(callback) {
        const p = privates.get(this);
        const url = p.baseUrl + '/mobile/platform/appconfig/client';
        const headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization
        };
        http.request({
            'url': url,
            'headers': headers,
            'method': 'GET',
            'onLoad': function(e) {
                callback(null, e.body.toString());
            },
            'onError': function(e) {
                callback(e);
            }
        });
    }
    /**
     * @callback MCS~getAppPoliciesCallback
     * @param {string} err - Error
     * @param {string} result
     */


    /**
     * Get Device Location List by Name
     * @method
     * @param {object} options
     * @param {string} options.name
     * @param {MCS~getDeviceLocationsByNameCallback} callback for getDeviceLocationsByName
     */
    getDeviceLocationsByName(options, callback) {
        const optionsLocal = {
            key: 'name',
            value: options.name || options,
            pathStr: 'devices',
            isQuery: true
        };
        this.getLocationList(optionsLocal, callback);
    }
    /**
     * @callback MCS~getDeviceLocationsByNameCallback
     * @param {string} err - Error
     * @param {string} result
     */


    /**
     * Get Device Location List by Id
     * @method
     * @param {object} options
     * @param {string} options.id
     * @param {MCS~getDeviceLocationsByIdCallback} callback for getDeviceLocationsById
     */
    getDeviceLocationsById(options, callback) {
        const optionsLocal = {
            key: 'name',
            value: options.id || options,
            pathStr: 'devices',
            isQuery: false
        };
        this.getLocationList(optionsLocal, callback);

    }
    /**
     * @callback MCS~getDeviceLocationsByIdCallback
     * @param {string} err - Error
     * @param {string} result
     */


    /**
     * Get Places List by Name
     * @method
     * @param {object} options
     * @param {string} options.name
     * @param {MCS~getPlaceByNameCallback} callback for getPlaceByName
     */
    getPlaceByName(options, callback) {
        const optionsLocal = {
            key: 'name',
            value: options.name || options,
            pathStr: 'places',
            isQuery: true
        };
        this.getLocationList(optionsLocal, callback);
    }
    /**
     * @callback MCS~getPlaceByNameCallback
     * @param {string} err - Error
     * @param {string} result
     */



    /**
     * Get Places List by Id,
     * @method
     * @param {object} options
     * @param {string} options.id
     * @param {MCS~getPlaceByIdCallback} callback for getPlaceById
     *
     */
    getPlaceById(options, callback) {
        const optionsLocal = {
            key: 'name',
            value: options.id || options,
            pathStr: 'places',
            isQuery: false
        };
        this.getLocationList(optionsLocal, callback);
    }
    /**
     * @callback MCS~getPlaceByIdCallback
     * @param {string} err - Error
     * @param {string} result
     */


    /**
     * Get Asset List by Name
     * @method
     * @param {object} options
     * @param {string} options.name
     * @param {MCS~getAssetByNameCallback} callback for getAssetByName
     *
     */
    getAssetByName(options, callback) {
        const optionsLocal = {
            key: 'name',
            value: options.name || options,
            pathStr: 'assets',
            isQuery: true
        };
        this.getLocationList(optionsLocal, callback);
    }
    /**
     * @callback MCS~getAssetByNameCallback
     * @param {string} err - Error
     * @param {string} result
     */


    /**
     * Get Asset List by Id
     * @method
     * @param {object} options
     * @param {string} options.id
     * @param {MCS~getAssetByIdCallback} callback for getAssetById
     *
     */
    getAssetById(options, callback) {
        const optionsLocal = {
            key: 'name',
            value: options.id || options,
            pathStr: 'assets',
            isQuery: false
        };
        this.getLocationList(optionsLocal, callback);

    }
    /**
     * @callback MCS~getAssetByIdCallback
     * @param {string} err - Error
     * @param {string} result
     */


    /**
     * Get Location List Base Function
     * @method
     * @param {object} options
     * @param {string} options.key
     * @param {string} options.value
     * @param {string} options.pathStr
     * @param {string} options.isQuery
     * @param {MCS~getLocationListCallback} callback for getLocationList
     */
    getLocationList(options, callback) {
        const p = privates.get(this);
        const key = options.key;
        const value = options.value;
        const pathStr = options.pathStr;
        const isQuery = options.isQuery;

        var url = p.baseUrl + '/mobile/platform/location/' + pathStr;
        if (isQuery) {
            url += '?' + key + '=' + value;
        }
        else {
            url += '/' + value;
        }
        const headers = {
            'Content-Type': 'application/json',
            'Oracle-Mobile-Backend-Id': p.backendID,
            'Authorization': p.authorization,
            key: value
        };

        http.request({
            'url': url,
            'headers': headers,
            'method': 'GET',
            'onLoad': function(e) {
                callback(null, e.body.toString());
            },
            'onError': function(e) {
                callback(e);
            }

        });
    }
    /**
     * @callback MCS~getLocationListCallback
     * @param {string} err - Error
     * @param {string} result
     */


}


module.exports = MCS;



function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
