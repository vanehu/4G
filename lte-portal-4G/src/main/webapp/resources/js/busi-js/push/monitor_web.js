var pomelo = window.pomelo;
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
function queryEntry(uid, callback) {
	var route = 'gate.gateHandler.queryEntry';
	pomelo.init({
		host : '192.168.1.49',// window.location.hostname,
		port : 3014,
		log : true
	}, function() {
		pomelo.request(route, {
			uid : uid
		}, function(data) {
			pomelo.disconnect();
			if (data.code === 500) {
				showError(LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port);
		});
	});
};

$(document).ajaxSuccess(function(event, xhr, settings) {
	var reqQuestType = settings.type;
	var requestURL = settings.url;
	data = requestURL;
	var username = "2";
	var rid = "1";
	var target = "2";
	console.log('url:' + requestURL + ",type:" + reqQuestType);
	if (requestURL.indexOf("/staff/login/logindo")!=-1){
		var msg = "登录";
		var route = "chat.chatHandler.send";
		pomelo.request(route, {
			rid: rid,
			content: msg,
			from: username,
			target: target
		}, function(data) {
			//$("#entry").attr("value", ""); // clear the entry field.
			//if(target != '*' && target != username) {
			//	addMessage(username, target, msg);
			//	$("#chatHistory").show();
			//}
			alert("data===:"+JSON.stringify(data));
		});
	}

});

$(document).ready(function() {
	// alert(0);
	// when first time into chat room.
	// showLogin();

	// wait message from the server.
	pomelo.on('onChat', function(data) {
		alert("onchat");
		// alert(JSON.stringify(data));
		// addMessage(data.from, data.target, data.msg);
		// $("#chatHistory").show();
		// if(data.from !== username)
		// tip('message', data.from);
	});

	// update user list
	pomelo.on('onAdd', function(data) {
		alert("onadd");
		// var user = data.user;
		// tip('online', user);
		// addUser(user);
	});

	// update user list
	pomelo.on('onLeave', function(data) {
		alert("onLeave");
		// var user = data.user;
		// tip('offline', user);
		// removeUser(user);
	});

	// handle disconect message, occours when the client is disconnect with
	// servers
	pomelo.on('disconnect', function(reason) {
		alert("disconnect");
		// showLogin();
	});

	// deal with login button click.
	// $("#login").click(function() {
	// username = $("#loginUser").attr("value");
	// rid = $('#channelList').val();
	//
	// if(username.length > 20 || username.length == 0 || rid.length > 20 ||
	// rid.length == 0) {
	// showError(LENGTH_ERROR);
	// return false;
	// }
	//
	// if(!reg.test(username) || !reg.test(rid)) {
	// showError(NAME_ERROR);
	// return false;
	// }
	var username = '2';
	var rid = "1";
	// query entry of connection
	queryEntry(username, function(host, port) {
		pomelo.init({
			host : host,
			port : port,
			log : true
		}, function() {
			var route = "connector.entryHandler.enter";
			pomelo.request(route, {
				username : username,
				rid : rid
			}, function(data) {
				if (data.error) {
					showError(DUPLICATE_ERROR);
					return;
				}
				//setName();
				//setRoom();
				//showChat();
				//initUserList(data);
			});
		});
	});
});