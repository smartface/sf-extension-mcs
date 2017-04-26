# MCS Extension from Smartface
[![Twitter: @Smartface_io](https://img.shields.io/badge/contact-@Smartface_io-blue.svg?style=flat)](https://twitter.com/smartface_io)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/smartface/sf-extension-spriteview/master/LICENSE)

An extension to Oracle MCS Connection with Smartface Native Framework.


## Installation
MCS Extension can be installed via npm easily from our public npm repository. The installation is pretty easy via Smartface Cloud IDE.

- Open scripts/package.json file inside your workspace.
- Add MCS extension dependency as:`"sf-extension-mcs": "^1.0.0"`
- Run command `npm install` under the folder `scripts`
- Finally require the extension as: `require("sf-extension-mcs")`

## How to use

1) Init your MCS config

```javascript
const MCS_Extension = require('sf-extension-mcs');
var MCS = new MCS_Extension();

// MCS INIT
var options = {
	'backendId': 'YOUR BACKEND ID',
	'baseUrl': 'YOUR BASE URL',
	'androidApplicationKey': 'YOUR ANDROID APP KEY',
	'iOSApplicationKey': 'YOUR IOS APP KEY'
};
MCS.init(options);
```
2) Login to MCS (Example)
```javascript
MCS.login({
	'username': 'YOUR USER NAME',
	'password': 'YOUR PASSWORD'
},

function(err, result) {

	loadingView.visible = false;

	if (err) {
		return alert("LOGIN FAILED.  " + err);
	}

	alert("LOGIN SUCCESS.  " + result);	

);
```
3) Send Basic Analytic Event (Example)
```javascript
var optionsAnalytic = {
	'deviceID': '112233',
	'sessionID': '112233',
	'eventName': 'sendBasicEvent'
};

MCS.sendBasicEvent(optionsAnalytic, function(err, result) {

	if (err) {
		return alert("sendBasicEvent FAILED.  " + err);
	}

	alert("sendBasicEvent SUCC.  " + result.toString());

});
```

## Need Help?

Please [submit an issue](https://github.com/msmete/sf-extension-mcs/issues) on GitHub and provide information about your problem.

## Support & Documentation & Useful Links
- [Guides](https://developer.smartface.io/)
- [API Docs](http://ref.smartface.io/)
- [Smartface Cloud Dashboard](https://cloud.smartface.io)

## Code of Conduct
We are committed to making participation in this project a harassment-free experience for everyone, regardless of the level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.
Please read and follow our [Code of Conduct](https://github.com/msmete/sf-extension-mcs/blob/master/CODE_OF_CONDUCT.md).

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](https://github.com/msmete/sf-extension-mcs/blob/master/LICENSE) file. Within the scope of this license, all modifications to the source code, regardless of the fact that it is used commercially or not, shall be committed as a contribution back to this repository.
