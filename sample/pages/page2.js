const extend = require("js-base/core/extend");
const Button = require('sf-core/ui/button');
const Page = require("sf-core/ui/page");
const TextBox = require('sf-core/ui/textbox');
const Router = require("sf-core/ui/router");
const Color = require('sf-core/ui/color');
const TextAlignment = require('sf-core/ui/textalignment');
const FlexLayout = require('sf-core/ui/flexlayout');
const ActivityIndicator = require('sf-core/ui/activityindicator');

var MCS;

var usernameTextBox;
var passwordTextBox;
var loadingView;

const Page2 = extend(Page)(
    function(_super) {
        _super(this);


        loadingView = loadingViewCreator(99999);


        usernameTextBox = new TextBox({
            hint: 'Username',
            textColor: Color.BLACK,
            backgroundColor: Color.WHITE,
            hintTextColor: Color.GRAY,
            textAlignment: TextAlignment.BOTTOMLEFT,
            marginLeft: 10,
            marginRight: 10,
            height: 50
        });

        passwordTextBox = new TextBox({
            hint: 'Password',
            isPassword: true,
            textColor: Color.BLACK,
            backgroundColor: Color.WHITE,
            hintTextColor: Color.GRAY,
            textAlignment: TextAlignment.BOTTOMLEFT,
            marginLeft: 10,
            marginRight: 10,
            height: 50
        });


        var loginButton = new Button({
            onPress: loginButton_onPress,
            text: 'Login',
            height: 50,
            marginLeft: 10,
            marginRight: 10,
            marginTop: 20,
            textAlignment: TextAlignment.MIDCENTER,

        });


        this.layout.addChild(usernameTextBox);
        this.layout.addChild(passwordTextBox);
        this.layout.addChild(loginButton);
        this.layout.addChild(loadingView);

        this.onLoad = function() {

            //this.layout.backgroundColor =  Color.TRA;

        };



        this.onShow = function(params) {

            if (params)
                MCS = params.MCS;

        };

    }
);

function loginButton_onPress() {


    loadingView.visible = true;

    MCS.login({
            'username': usernameTextBox.text,
            'password': passwordTextBox.text
        },

        function(err, result) {

            loadingView.visible = false;

            if (err) {
                return alert("LOGIN FAILED.  " + err);
            }


            Router.go('page3', {
                'MCS': MCS
            });
        }

    );


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

module && (module.exports = Page2);
