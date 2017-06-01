const extend = require("js-base/core/extend");
const Button = require('sf-core/ui/button');
const Page = require("sf-core/ui/page");
const Router = require("sf-core/ui/router");
const Color = require('sf-core/ui/color');
const FlexLayout = require('sf-core/ui/flexlayout');
const ActivityIndicator = require('sf-core/ui/activityindicator');
const Http = require('sf-core/net/http');
const System = require('sf-core/device/system');

var mcs = require('../mcs');

var loadingView;

const Page1 = extend(Page)(
    function(_super) {
        var self = this;
        _super(self);


        loadingView = loadingViewCreator(99999);


        var btnLogin = new Button({
            text: 'Login',
            flexGrow: 1,
            onPress: mcsLogin
        });
        var btnRegister = new Button({
            text: 'Register Device For Push Notification',
            flexGrow: 1,
            onPress: mcsRegister
        });
        var btnDeregister = new Button({
            text: 'Deregister Device For Push Notification',
            flexGrow: 1,
            onPress: mcsDeregister
        });
        var btnSendBasicEvent = new Button({
            text: 'Send Analytic - Basic Event',
            flexGrow: 1,
            onPress: mcsSendBasicAnalytic
        });
        var btnSendAnalytic = new Button({
            text: 'Send Analytic',
            flexGrow: 1,
            onPress: mcsSendAnalytic
        });
        var btnApiCaller = new Button({
            text: 'Api Caller (GET)',
            flexGrow: 1,
            onPress: mcsCreateRequest
        });

        var btnDemoApp = new Button({
            text: 'Demo App',
            backgroundColor: Color.GREEN,
            flexGrow: 1,
            onPress: demoApp
        });



        // MCS INIT

        this.layout.addChild(btnLogin);
        this.layout.addChild(btnRegister);
        this.layout.addChild(btnDeregister);
        this.layout.addChild(btnSendBasicEvent);
        this.layout.addChild(btnSendAnalytic);
        this.layout.addChild(btnApiCaller);
        this.layout.addChild(btnDemoApp);
        this.layout.addChild(loadingView);


    });

// Gets/sets press event callback for btn
function mcsLogin() {

    loadingView.visible = true;

    mcs.login({
            'username': 'YOUR USER NAME',
            'password': 'YOUR PASSWORD'
        },

        function(err, result) {

            loadingView.visible = false;

            if (err) {
                return alert("LOGIN FAILED.  " + err);
            }

            alert('Success ' + result);
        }

    );

}


function mcsSendBasicAnalytic() {
    loadingView.visible = true;

    var optionsAnalytic = {
        'deviceId': '112233',
        'sessionId': '112233',
        'eventName': 'sendBasicEvent'
    };

    mcs.sendBasicEvent(optionsAnalytic, function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("sendBasicEvent FAILED.  " + err);
        }

        alert("sendBasicEvent SUCC.  " + result.toString());

    });
}

function mcsSendAnalytic() {
    loadingView.visible = true;

    var optionsAnalytic = {
        'deviceId': '112233',
        'sessionId': '112233',
        'body': [{
            "name": "testMCSEvent",
            "type": "custom",
            "timestamp": new Date().toISOString()
        }]
    };

    mcs.sendAnalytic(optionsAnalytic, function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("sendAnalytic FAILED.  " + err);
        }

        alert("sendAnalytic SUCC.  " + result.toString());

    });
}

function mcsRegister() {
    loadingView.visible = true;

    var optionsRegisterDevice = {
        'packageName': 'io.smartface.mcstest',
        'version': '1.0.0',
    };


    mcs.registerDeviceToken(optionsRegisterDevice, function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("registerDeviceToken FAILED.  " + err);
        }

        alert("registerDeviceToken SUCC.  " + result.toString());


    });
}

function mcsDeregister() {

    loadingView.visible = true;

    var optionsRegisterDevice = {
        'packageName': 'io.smartface.mcstest',
        'version': '1.0.0',
    };

    mcs.deregisterDeviceToken(optionsRegisterDevice, function(err, result) {


        loadingView.visible = false;

        if (err) {
            return alert("deregisterDeviceToken FAILED.  " + err);
        }

        alert("deregisterDeviceToken SUCC.  " + result.toString());

    });
}

function mcsCreateRequest() {
    loadingView.visible = true;

    var options = {
        'apiName': 'weather',
        'endpointName': 'getCity',
    };
    var requestOptions = mcs.createRequestOptions(options);
    var query = 'q=sanfrancisco&appid=caf032ca9a5364cb41ca768e3553d9b3';

    var url = requestOptions.url + query;
    var headers = requestOptions.headers;
    var body = '';

    Http.request({
            'url': url,
            'headers': headers,
            'method': 'GET',
            'body': body

        },
        function(e) {

            loadingView.visible = false;

            alert("mcsCreateRequest SUCC.  " + e.body.toString());
        },
        function(e) {
            if (e.statusCode == 403)
                return alert("You need to login first");
            alert("mcsCreateRequest FAILED.  " + (e.body && e.body.toString()));
        }
    );

}


function demoApp() {

    Router.go('page2');

}

var loadingViewCreator = function(id) {
    var loadingLayout = new FlexLayout({
        id: id,
        backgroundColor: Color.BLACK,
        alpha: 0.5,
        visible: false,
        touchEnabled: true
    });
    loadingLayout.positionType = FlexLayout.PositionType.ABSOLUTE;
    loadingLayout.top = 0;
    loadingLayout.left = 0;
    loadingLayout.right = 0;
    loadingLayout.bottom = 0;
    var myActivityIndicator = new ActivityIndicator({
        color: Color.WHITE,
        backgroundColor: Color.TRANSPARENT,
        touchEnabled: true
    });
    if (System.OS != "Android") {
        myActivityIndicator.flexGrow = 1;
    }
    loadingLayout.addChild(myActivityIndicator);
    loadingLayout.justifyContent = FlexLayout.JustifyContent.CENTER;
    return loadingLayout;
};


module && (module.exports = Page1);
