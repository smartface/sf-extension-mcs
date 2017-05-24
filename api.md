## Classes

<dl>
<dt><a href="#MCS">MCS</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Custom Api Caller to MCS</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Custom Api Caller to MCS</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get application policies from MCS</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get Device Location List by Name</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get Device Location List by Id</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get Places List by Name</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get Places List by Id</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get Asset List by Name</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get Asset List by Id</p>
</dd>
<dt><a href="#callback">callback</a> : <code>function</code></dt>
<dd><p>Get Location List Base Function</p>
</dd>
</dl>

<a name="MCS"></a>

## MCS
**Kind**: global class  

* [MCS](#MCS)
    * [new MCS(options)](#new_MCS_new)
    * _instance_
        * [.login(options, callback)](#MCS+login)
        * [.logout()](#MCS+logout)
        * [.registerDeviceToken(options, callback)](#MCS+registerDeviceToken)
        * [.deregisterDeviceToken(options, callback)](#MCS+deregisterDeviceToken)
        * [.sendAnalytic(options, callback)](#MCS+sendAnalytic)
        * [.sendBasicEvent(options, callback)](#MCS+sendBasicEvent)
        * [.getCollectionList(callback)](#MCS+getCollectionList)
        * [.getItemListInCollection(options, callback)](#MCS+getItemListInCollection)
        * [.getItem(options, callback)](#MCS+getItem)
        * [.storeItem(options, callback)](#MCS+storeItem)
        * [.deleteItem(options, callback)](#MCS+deleteItem)
    * _inner_
        * [~loginCallback](#MCS..loginCallback) : <code>function</code>
        * [~registerDeviceTokenCallback](#MCS..registerDeviceTokenCallback) : <code>function</code>
        * [~deregisterDeviceTokenCallback](#MCS..deregisterDeviceTokenCallback) : <code>function</code>
        * [~sendAnalyticCallback](#MCS..sendAnalyticCallback) : <code>function</code>
        * [~sendBasicEventCallback](#MCS..sendBasicEventCallback) : <code>function</code>
        * [~getCollectionListCallback](#MCS..getCollectionListCallback) : <code>function</code>
        * [~getItemListInCollectionCallback](#MCS..getItemListInCollectionCallback) : <code>function</code>
        * [~getItemCallback](#MCS..getItemCallback) : <code>function</code>
        * [~storeItemCallback](#MCS..storeItemCallback) : <code>function</code>
        * [~deleteItemCallback](#MCS..deleteItemCallback) : <code>function</code>

<a name="new_MCS_new"></a>

### new MCS(options)
Creates new instace of MCS


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | init object |
| options.baseUrl | <code>string</code> | MCS Base URL |
| options.backendId | <code>string</code> | MCS BackendId |
| options.androidApplicationKey | <code>string</code> | MCS Android Client Key |
| options.iOSApplicationKey | <code>string</code> | MCS iOS Client Key |
| options.anonymousKey | <code>string</code> | MCS Basic Anonymous Key |

<a name="MCS+login"></a>

### mcS.login(options, callback)
login to MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | login options |
| options.username | <code>string</code> | MCS Username |
| options.password | <code>string</code> | MCS Password |
| callback | [<code>loginCallback</code>](#MCS..loginCallback) | for login |

**Example**  
```js
result:
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
```
<a name="MCS+logout"></a>

### mcS.logout()
Logs out authenticated user, using Anonymous Key if provided

**Kind**: instance method of [<code>MCS</code>](#MCS)  
<a name="MCS+registerDeviceToken"></a>

### mcS.registerDeviceToken(options, callback)
Register device push notification token to MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | push notification options |
| options.packageName | <code>string</code> | Application package name |
| options.version | <code>string</code> | Application version |
| callback | [<code>registerDeviceTokenCallback</code>](#MCS..registerDeviceTokenCallback) | for registerDeviceToken |

**Example**  
```js
result:
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
```
<a name="MCS+deregisterDeviceToken"></a>

### mcS.deregisterDeviceToken(options, callback)
Deregister device push notification token from MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | push notification options |
| options.packageName | <code>string</code> | Application package name |
| callback | [<code>deregisterDeviceTokenCallback</code>](#MCS..deregisterDeviceTokenCallback) | for deregisterDeviceToken |

<a name="MCS+sendAnalytic"></a>

### mcS.sendAnalytic(options, callback)
Send Analytic Event to MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  
**See**: [Oracle Docs](https://docs.oracle.com/en/cloud/paas/mobile-cloud/mcsra/op-mobile-platform-analytics-events-post.html)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Analytic options |
| options.deviceId | <code>string</code> | Specific Device ID |
| options.sessionId | <code>string</code> | Session ID |
| options.body | <code>object</code> | Event json array |
| callback | [<code>sendAnalyticCallback</code>](#MCS..sendAnalyticCallback) | for sendAnalytic |

<a name="MCS+sendBasicEvent"></a>

### mcS.sendBasicEvent(options, callback)
Send Analytic Event to MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Analytic options |
| options.deviceId | <code>string</code> | Specific Device ID |
| options.sessionId | <code>string</code> | Session ID |
| options.eventName | <code>object</code> | Event name |
| callback | [<code>sendBasicEventCallback</code>](#MCS..sendBasicEventCallback) | for sendBasicEvent |

<a name="MCS+getCollectionList"></a>

### mcS.getCollectionList(callback)
Get all collections list from MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>getCollectionListCallback</code>](#MCS..getCollectionListCallback) | for getCollectionList |

<a name="MCS+getItemListInCollection"></a>

### mcS.getItemListInCollection(options, callback)
Get item list in collection from MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>string</code> \| <code>object</code> | MCS collection id |
| options.collectionId | <code>string</code> | MCS collection id |
| callback | <code>getItemListInCollectionCallback</code> | for getItemListInCollection |

<a name="MCS+getItem"></a>

### mcS.getItem(options, callback)
Get item data from MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Analytic options |
| options.collectionId | <code>string</code> | MCS collection Id |
| options.itemId | <code>string</code> | MCS item Id |
| callback | [<code>getItemCallback</code>](#MCS..getItemCallback) | for getItem |

<a name="MCS+storeItem"></a>

### mcS.storeItem(options, callback)
Store item to MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Analytic options |
| options.collectionId | <code>string</code> | MCS collection Id |
| options.itemName | <code>string</code> | item full name |
| options.base64EncodeData | <code>string</code> | item base64 encode data |
| options.contentType | <code>string</code> | item content type |
| callback | [<code>storeItemCallback</code>](#MCS..storeItemCallback) | for storeItem |

<a name="MCS+deleteItem"></a>

### mcS.deleteItem(options, callback)
Delete item data from MCS

**Kind**: instance method of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Analytic options |
| options.collectionId | <code>string</code> | MCS collection Id |
| options.itemId | <code>string</code> | MCS item Id |
| callback | [<code>deleteItemCallback</code>](#MCS..deleteItemCallback) | for deleteItem |

<a name="MCS..loginCallback"></a>

### MCS~loginCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> | json result |

<a name="MCS..registerDeviceTokenCallback"></a>

### MCS~registerDeviceTokenCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> | json result |

<a name="MCS..deregisterDeviceTokenCallback"></a>

### MCS~deregisterDeviceTokenCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="MCS..sendAnalyticCallback"></a>

### MCS~sendAnalyticCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> | json result |

**Example**  
```js
result:
 {"message": "1 events accepted for processing."}
```
<a name="MCS..sendBasicEventCallback"></a>

### MCS~sendBasicEventCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> | json result |

**Example**  
```js
result:
 {"message": "1 events accepted for processing."}
```
<a name="MCS..getCollectionListCallback"></a>

### MCS~getCollectionListCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>Array.&lt;object&gt;</code> | array for collections |
| result[].id | <code>string</code> | collection id |
| result[].description | <code>string</code> | collection description |

<a name="MCS..getItemListInCollectionCallback"></a>

### MCS~getItemListInCollectionCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>Array.&lt;object&gt;</code> |  |
| result[].id | <code>string</code> | item id |
| result[].name | <code>string</code> | item name |
| result[].contentType | <code>string</code> | item contentType |
| result[].createdBy | <code>string</code> | item createdBy |
| result[].createdOn | <code>string</code> | item createdOn |
| result[].modifiedBy | <code>string</code> | item modifiedBy |
| result[].modifiedOn | <code>string</code> | item modifiedOn |

<a name="MCS..getItemCallback"></a>

### MCS~getItemCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> | base64 encoded file data |

<a name="MCS..storeItemCallback"></a>

### MCS~storeItemCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> | json result |

**Example**  
```js
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
```
<a name="MCS..deleteItemCallback"></a>

### MCS~deleteItemCallback : <code>function</code>
**Kind**: inner typedef of [<code>MCS</code>](#MCS)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> | info message |

<a name="callback"></a>

## callback : <code>function</code>
Custom Api Caller to MCS

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | api caller options |
| options.apiName | <code>string</code> | MCS Custom Api name |
| options.endpointName | <code>string</code> | MCS Custom Api endpoint name |
| options.parameters | <code>array</code> | MCS query parameters array |
| options.parameters.key | <code>string</code> | MCS query parameter name |
| options.parameters.value | <code>string</code> | MCS query parameter value |
| err | <code>string</code> | Error |
| result | <code>string</code> | your web service result |

<a name="callback"></a>

## callback : <code>function</code>
Custom Api Caller to MCS

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | api caller options |
| options.apiName | <code>string</code> | MCS Custom Api name |
| options.endpointName | <code>string</code> | MCS Custom Api endpoint name |
| options.body | <code>string</code> \| <code>object</code> | MCS Custom Api string or object body |
| options.headerParameters | <code>array</code> | MCS header parameters array |
| options.headerParameters.key | <code>string</code> | MCS header parameter name |
| options.headerParameters.value | <code>string</code> | MCS header parameter value |
| err | <code>string</code> | Error |
| result | <code>string</code> | your web service result |

<a name="callback"></a>

## callback : <code>function</code>
Get application policies from MCS

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="callback"></a>

## callback : <code>function</code>
Get Device Location List by Name

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.name | <code>string</code> |  |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="callback"></a>

## callback : <code>function</code>
Get Device Location List by Id

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.id | <code>string</code> |  |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="callback"></a>

## callback : <code>function</code>
Get Places List by Name

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.name | <code>string</code> |  |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="callback"></a>

## callback : <code>function</code>
Get Places List by Id

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.id | <code>string</code> |  |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="callback"></a>

## callback : <code>function</code>
Get Asset List by Name

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.name | <code>string</code> |  |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="callback"></a>

## callback : <code>function</code>
Get Asset List by Id

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.id | <code>string</code> |  |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

<a name="callback"></a>

## callback : <code>function</code>
Get Location List Base Function

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> |  |
| options.key | <code>string</code> |  |
| options.value | <code>string</code> |  |
| options.pathStr | <code>string</code> |  |
| options.isQuery | <code>string</code> |  |
| err | <code>string</code> | Error |
| result | <code>string</code> |  |

