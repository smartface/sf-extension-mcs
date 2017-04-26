/* globals */
const Page = require("sf-core/ui/page");
const WebView = require("sf-core/ui/webview");
const extend = require("js-base/core/extend");
const FlexLayout = require('sf-core/ui/flexlayout');
const ActivityIndicator = require('sf-core/ui/activityindicator');
const Color = require('sf-core/ui/color');

var webView;
var loadingView;


const imagePage = extend(Page)(
    function(_super) {
        _super(this);


        loadingView = loadingViewCreator(99999);
    
        webView = new WebView({
            onChangedURL: function(event) {
                console.log("Event Change URL: " + event.url);
            },
            onError: function(event) {
                console.log("Event Error : " + event.message + ", URL: " + event.url);
            },
            onLoad: function(event) {
                console.log("Event Load: " + event.url);
            },
            onShow: function(event) {
                loadingView.visible = false;
            }
        });
        webView.flexGrow = 1;

        this.layout.addChild(webView);
        this.layout.addChild(loadingView);



        this.onLoad = function() {

            //this.layout.backgroundColor =  Color.TRA;

        };



        this.onShow = function(params) {


            if (params) {
                var collectionId = params.collectionId;
                var imageId = params.imageId;
                var MCS = params.MCS;
                
                loadingView.visible = true;
                
                MCS.getItem({
                        'collectionId': collectionId,
                        'itemId': imageId
                    },
                    function(err, result) { 

                        if (err) {
                            loadingView.visible = false;
                            return alert("getItem FAILED.  " + err);
                        }
                        
                        
                        var html = '<img src="data:image/png;base64, ' + result + '"/>';
                        webView.loadHTML(html);
                

                    }
                );

                
            }


        };

    }
);




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

module && (module.exports = imagePage);
