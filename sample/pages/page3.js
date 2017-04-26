const extend = require("js-base/core/extend");
const Button = require('sf-core/ui/button');
const Page = require("sf-core/ui/page");
const TextBox = require('sf-core/ui/textbox');
const Router = require("sf-core/ui/router");
const Color = require('sf-core/ui/color');
const TextAlignment = require('sf-core/ui/textalignment');
const ListView = require('sf-core/ui/listview');
const ListViewItem = require('sf-core/ui/listviewitem');
const Label = require("sf-core/ui/label");
const Multimedia = require("sf-core/device/multimedia");
const Image = require('sf-core/ui/image');
const FlexLayout = require('sf-core/ui/flexlayout');
const ActivityIndicator = require('sf-core/ui/activityindicator');


var MCS;
var myListView;
var fileArray;
var self;

var CollectionID;
var loadingView;

const Page3 = extend(Page)(
    function(_super) {
        self = this;
        _super(this);



        loadingView = loadingViewCreator(99999);


        myListView = new ListView({
            flexGrow: 1,
            rowHeight: 50,
            marginTop: 0,
            backgroundColor: Color.WHITE,
            itemCount: 0,
            refreshEnabled: false,
        });

        var addFile = new Button({
            onPress: addfile_onPress,
            text: 'Add File',
            height: 50,
            textAlignment: TextAlignment.MIDCENTER,

        });


        myListView.onRowCreate = function() {
            var myListViewItem = new ListViewItem({
                padding: 10
            });

            var myLabel = new Label({
                id: 102,
            });

            myListViewItem.addChild(myLabel);

            return myListViewItem;
        };

        myListView.onRowBind = function(listViewItem, index) {

            var myLabel = listViewItem.findChildById(102);
            myLabel.text = fileArray[index].name;



        };

        myListView.onRowSelected = function(listViewItem, index) {

            Router.go('imagePage', {
                'collectionId': CollectionID,
                'imageId': fileArray[index].id,
                'MCS': MCS
            });

        };

        this.layout.addChild(myListView);
        this.layout.addChild(addFile);
        this.layout.addChild(loadingView);


        this.onShow = function(params) {

            if (params) {
                MCS = params.MCS;
                getItems();
            }

        };



    }
);


function getItems() {

    loadingView.visible = true;

    MCS.getCollectionList(

        function(err, result) { 

            loadingView.visible = false;

            if (err) {
                return alert("getCollectionList FAILED.  " + err);
            }

            CollectionID = result[0].id;


            loadingView.visible = true;
            //----------------------------------------------
            MCS.getItemListInCollection(CollectionID,

                function(err, result) { 


                    loadingView.visible = false;

                    if (err) {
                        return alert("getItemListInCollection FAILED.  " + err);
                    }

                    fileArray = result;

                    myListView.itemCount = result.length;
                    myListView.refreshData();

                }

            );


        }
    );


}





function addfile_onPress() {

    Multimedia.pickFromGallery({
        type: Multimedia.Type.IMAGE,
        onSuccess: onSuccess,
        page: self
    });

    function onSuccess(picked) {

        console.log(JSON.stringify(picked));

        var pickedImage = picked.image;

        var imageBlob = pickedImage.compress(Image.Format.JPEG, 100);


        var base64TestImageData = imageBlob.toBase64();


        loadingView.visible = true;

        var random_number = getRandomArbitrary(1000000000, 9999999999);

        MCS.storeItem({
                'collectionId': CollectionID,
                'itemName': 'testFile_' + random_number + '.png',
                'base64EncodeData': base64TestImageData,
                'contentType': 'image/png'
            },
            function(err, result) {

                loadingView.visible = false;

                if (err) {
                    return alert("storeItem FAILED.  " + err);
                }

                alert("File Upload Success : " + 'testFile_' + random_number + '.png');

                getItems();

            }
        );

    }
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

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


module && (module.exports = Page3);
