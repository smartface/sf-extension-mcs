const extend = require("js-base/core/extend");
const Button = require('sf-core/ui/button');
const Page = require("sf-core/ui/page");
const Router = require("sf-core/ui/router");
const Color = require('sf-core/ui/color');
const FlexLayout = require('sf-core/ui/flexlayout');
const ActivityIndicator = require('sf-core/ui/activityindicator');

const MCS_Extension = require('sf-extension-mcs');
var MCS = new MCS_Extension();

var loginSuccess = false;
var loadingView;

const Page1 = extend(Page)(
    function(_super) {
        var self = this;
        _super(self);


        loadingView = loadingViewCreator(99999);


        var button1 = new Button({
            text: 'Login',
            flexGrow: 1,
            onPress: MCS_LOGIN
        });
        var button2 = new Button({
            text: 'Register Device For Push Notification',
            flexGrow: 1,
            onPress: MCS_REGISTER
        });
        var button3 = new Button({
            text: 'Deregister Device For Push Notification',
            flexGrow: 1,
            onPress: MCS_DEREGISTER
        });
        var button4 = new Button({
            text: 'Send Analytic - Basic Event',
            flexGrow: 1,
            onPress: MCS_SEND_BASIC_ANALYTIC
        });
        var button5 = new Button({
            text: 'Send Analytic',
            flexGrow: 1,
            onPress: MCS_SEND_ANALYTIC
        });
        var button6 = new Button({
            text: 'Api Caller (GET)',
            flexGrow: 1,
            onPress: MCS_APICALLER_GET
        });

        var button7 = new Button({
            text: 'Demo App',
            backgroundColor: Color.GREEN,
            flexGrow: 1,
            onPress: DEMO_APP
        });



        // MCS INIT
        var options = {
            'backendId': 'YOUR BACKEND ID',
            'baseUrl': 'YOUR BASE URL',
            'androidApplicationKey': 'YOUR ANDROID APP KEY',
            'iOSApplicationKey': 'YOUR IOS APP KEY'

        };
        MCS.init(options);


        this.layout.addChild(button1);
        this.layout.addChild(button2);
        this.layout.addChild(button3);
        this.layout.addChild(button4);
        this.layout.addChild(button5);
        this.layout.addChild(button6);
        this.layout.addChild(button7);
        this.layout.addChild(loadingView);


    });

// Gets/sets press event callback for btn
function MCS_LOGIN() {

    loadingView.visible = true;

    MCS.login({
            'username': 'YOUR USER NAME',
            'password': 'YOUR PASSWORD'
        },

        function(err, result) {

            loadingView.visible = false;

            if (err) {
                return alert("LOGIN FAILED.  " + err);
            }

            alert('Success ' + result);
            loginSuccess = true;

        }

    );

}


function MCS_SEND_BASIC_ANALYTIC() {



    if (loginSuccess == false) {
        return alert("Login should be made first.");
    }

    loadingView.visible = true;

    var optionsAnalytic = {
        'deviceID': '112233',
        'sessionID': '112233',
        'eventName': 'sendBasicEvent'
    };

    MCS.sendBasicEvent(optionsAnalytic, function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("sendBasicEvent FAILED.  " + err);
        }

        alert("sendBasicEvent SUCC.  " + result.toString());

    });
}

function MCS_SEND_ANALYTIC() {

    if (loginSuccess == false) {
        return alert("Login should be made first.");
    }

    loadingView.visible = true;

    var optionsAnalytic = {
        'deviceID': '112233',
        'sessionID': '112233',
        'body': [{
            "name": "testMCSEvent",
            "type": "custom",
            "timestamp": new Date().toISOString()
        }]
    };

    MCS.sendAnalytic(optionsAnalytic, function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("sendAnalytic FAILED.  " + err);
        }

        alert("sendAnalytic SUCC.  " + result.toString());

    });
}

function MCS_REGISTER() {

    if (loginSuccess == false) {
        return alert("Login should be made first.");
    }

    loadingView.visible = true;

    var optionsRegisterDevice = {
        'packageName': 'io.smartface.mcstest',
        'version': '1.0.0',
    };


    MCS.registerDeviceToken(optionsRegisterDevice, function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("registerDeviceToken FAILED.  " + err);
        }

        alert("registerDeviceToken SUCC.  " + result.toString());


    });
}

function MCS_DEREGISTER() {

    if (loginSuccess == false) {
        return alert("Login should be made first.");
    }

    loadingView.visible = true;

    var optionsRegisterDevice = {
        'packageName': 'io.smartface.mcstest',
        'version': '1.0.0',
    };

    MCS.deregisterDeviceToken(optionsRegisterDevice, function(err, result) {


        loadingView.visible = false;

        if (err) {
            return alert("deregisterDeviceToken FAILED.  " + err);
        }

        alert("deregisterDeviceToken SUCC.  " + result.toString());

    });
}

function MCS_APP_POLICIES() {


    if (loginSuccess == false) {
        return alert("Login should be made first.");
    }

    loadingView.visible = true;

    MCS.getAppPolicies(function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("registerDeviceToken FAILED.  " + err);
        }

        alert("registerDeviceToken SUCC.  " + result.toString());


    });
}

function MCS_APICALLER_GET() {

    if (loginSuccess == false) {
        return alert("Login should be made first.");
    }

    loadingView.visible = true;

    var optionsGetMethod = {
        'apiName': 'weather',
        'endpointName': 'getCity',
        'parameters': [

            {
                key: 'q',
                value: 'ankara'

            }, {
                key: 'appid',
                value: 'caf032ca9a5364cb41ca768e3553d9b3'

            }
        ]
    };
    MCS.apiCallerGetMethod(optionsGetMethod, function(err, result) {

        loadingView.visible = false;

        if (err) {
            return alert("sendAnalytic FAILED.  " + err);
        }

        alert("sendAnalytic SUCC.  " + result.toString());


    });

}


function DEMO_APP() {

    Router.go('page2', {
        'MCS': MCS
    });

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
    if (Device.deviceOS != "Android") {
        myActivityIndicator.flexGrow = 1;
    }
    loadingLayout.addChild(myActivityIndicator);
    loadingLayout.justifyContent = FlexLayout.JustifyContent.CENTER;
    return loadingLayout;
};


module && (module.exports = Page1);
