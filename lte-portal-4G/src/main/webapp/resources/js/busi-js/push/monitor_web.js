var pomelo = Glob.pomelo;
var username;
var users;
var rid;
var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

util = {
	urlRE : /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	// html sanitizer
	toStaticHTML : function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
				/>/g, "&gt;");
	},
	// pads n with zeros on the left,
	// digits is minimum length of output
	// zeroPad(3, 5); returns "005"
	// zeroPad(2, 500); returns "500"
	zeroPad : function(digits, n) {
		n = n.toString();
		while (n.length < digits)
			n = '0' + n;
		return n;
	},
	// it is almost 8 o'clock PM here
	// timeString(new Date); returns "19:49"
	timeString : function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	// does the argument only contain whitespace?
	isBlank : function(text) {
		var blank = /^\s*$/;
		return (text.match(blank) !== null);
	}
};



// query connector
/*function queryEntry(uid, callback) {
	var route = 'gate.gateHandler.queryEntry';
	pomelo.init({
		//host : '192.168.1.49',// window.location.hostname,
		host : 'allen1707.xicp.net',//'192.168.1.49',// window.location.hostname,
		//port : 3014,
		port : 80,
		log : true
	}, function() {
		pomelo.request(route, {
			uid : uid
		}, function(data) {
			pomelo.disconnect();
			if (data.code === 500) {
				$.alert("提示",LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port);
		});
	});
	callback('allen1707.xicp.net',80);
};*/