var pomelo = window.pomelo;
var webreq = {};
function enterRoom(){
	$("#sp_loading").text("加载中请稍等...");
	var usname = $("#usname").val();//本机名称
	var channelId = $("#channelId").val();
	queryEntry(usname, function(host, port) {
		pomelo.init({
			host: host,
			port: port,
			log: true
		}, function() {
			var route = "connector.entryHandler.enter";
			pomelo.request(route, {
				username: usname,
				rid: channelId
			}, function(data) {
				if(data.error) {
					$.alert("提示","该用户已登录！");
					$("#sp_loading").text("请返回首页再点击菜单进入！");
					return;
				}
				var param = {
					"name":usname,
					"channel":channelId
				};
				$.callServiceAsHtml(contextPath+"/app/push/room",param,{
					"before":function(){
						$.ecOverlay("加载中请稍等...");
					},
					"done" : function(response){
						$.unecOverlay();
						$("#order-content").hide();
						$("#spts_room").html(response.data).show();
						$.cookie("STICKYID", OrderInfo.staff.staffId+"");
						OrderInfo.actionFlag = 110;
					},fail:function(response){
						$.unecOverlay();
						$.alert("提示","查询失败，请稍后再试！");
						$("#sp_loading").text("请返回首页再点击菜单进入！");
					}
				});
			});
		});
	});
}

function outRoom(){
	var usname = $("#usname").val();//本机名称
	var channelId = $("#channelId").val();
		pomelo.init({
			host: $("#host").val(),
			port: $("#port").val(),
			log: true
		}, function() {
			var route = "connector.entryHandler.kick";
			pomelo.request(route, {
				username: usname,
				rid: channelId
			}, function(data) {
//				if(data.error) {
//					$.alert("提示","该用户已登录！");
//					return;
//				}
			});
		});
}

function queryEntry(uid, callback) {
//	var route = 'gate.gateHandler.queryEntry';
//	pomelo.init({
//		host: $("#host").val(),
//		port: $("#port").val(),
//		log: true
//	}, function() {
//		pomelo.request(route, {
//			uid: uid
//		}, function(data) {
//			pomelo.disconnect();
//			if(data.code === 500) {
//				$.alert("提示","500 查询失败，请稍后再试！");
//				return;
//			}
//			callback(data.host, data.port);
//		});
//	});
//	callback("allen1707.xicp.net", "80");
	callback($("#host").val(), $("#port").val());
};

function senNum(){
	var msg = {};
	msg.req = webreq;//$("#msg").val();
	msg.result = null;
	msg.result = $("#number").val();
	if(msg.result.length>0){
		msg.code = "0";
	}else{
		msg.code = "1";
		msg.result = "扫描失败！";
	}
	chat($("#rid").val(),msg,$("#username").val(),$("#tag_username").val());
};

function readCard(){
	var msg = {};
	msg.req = webreq;//$("#msg").val();
	msg.result = null;
	var cust = {};
	//$("#custname").val("姓名"); //姓名
	//	$("#idcard").val("412725199009227450");//身份证号码
	//	$("#address").val("地址地址地址地址");//地址
	//	$("#identityPic").val("/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAB+AGYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6oooooAKjuJ4raFpbiRI41GSznAFOkdY42eQhUUFiT2Ar4x+O/wAWrvxTqcmnaXL5eiwOVVVb/XsDjeSOo7gfj6YBN2Pa/HPx68P6M7W2hk6pcg4MkZxCv/Au/wCGa88v/wBpPVUJNvplvt/2n/8ArV4BbM8o3SYPv1qO+/1bBRk/7uBTRnzNs+jvCH7TAvdSS2120S2jY48yPkD9K1fEH7Smk2uqtBpcL3FshwZSuM/TNfJNpp0t1KBs+U0l9ZtZXDRuCMHAouti9T7m8BfHLwx4mlFrdztp14W2oLgBVk6Yw3TJJxjrXq8brIgeNlZDyGU5Br80dMDfKehr6Q+APxLuNMvLXw9rU5lsLhgltJIeYW7LnuD0HvgdMYGhKR9QUUUUiwooooAKKKa7qiM7nCqMk+goA8a/aZ8av4e8JrpWnTtFqOoZBZDgpEPvc9s5x688dK+KpSzz5Ga9J+N/ieTxX4/v7mPzDbROYIA391eOMdickH0Iqj4M8F3WoTJNPCRE3rWcpW3HGm6j0Mnw9pVzeriMMM/xYrqV8HssW2Z98h7cZ/KvUdN8LQWMAjgXDnHbFdJZ6CkaZZcyHrXPKt2OyOGS3PJ/C/gVlYvcrtAGQBVDxj4JabfLDHlu3Fe+R6fsiUY7VSvdNVlwR0qVVle5p7CLVj5QFjPp8piuYyrDocVC+qy213H5bsjIQVdTgqQeCD617t4x8JpdW8ssS5k7cV4Z4l0K608GSWMgZ4NdcKqkjgrUHF6H3n8JfEbeKvAOl6nKAJmj8uTHQsvBx7V2FfOX7G2sGfw9q+kyGRngkWddx+VVYYwB9QT+NfRtWQtgooooGFU9YONIviOogf8A9BNXKa6q6MjjKsMEeooA/P3RLCXU/FieYpI3ZI/KvonTbWO1t0GNoUYrj7fw0ujfE/U7UBWjSR3iZVwNp5AH06fhXZ3Fu7nLSsqH+HtXJWnzOx20IKKLkTRSzhkYEj3ragVic8H6VyZsrdYztuzE57pgkVd0f7ZbyqovJLiL1cislBG6ldnTujnoKz71XTJYcVavr544QYlG4j1rlb37XcyGW51R7aLP3Qwx+tFkU3YsXTxvGylhz2zXnfxD0yO50SVQgO0giuwmtIdoMF6J27NuHP5Vm6tbO+lXKzEt+7Y/oaF7sjOXvRIP2PoRFq/iID/n3h/9Cavp+vBv2WNIjs9M1K/dh9oumCquf4F/+vmvea707nnSXK7BRRRTEFQ3hIs5ypwRG2D+FTUjqHRlboRg0Aj57sreT+2YZ5cswjYMxOSSfWt29tTcQFVYj6VNqlp9h1ee37RuQMenUfpV20UHFec73PTum7xOA1rwcL69sLgZjNsMNgcy85yx611EMZgEjCMRqTkKOgrpWhXFYequfOEaZpplKNmVbm5cxx5+lZ2uaINWsZbcqCJMYfHKc9q0r23ZbZSB2zWjoEwltcMfnGARQnZjlG6OQ0zwv/ZtjbQAbniGN+ACec9BxV+/t9lnIjZYshBz9K7C4jxGWrmNUfk0N3dyVGysWPg1ZC11qBVXGy2dcD6ivaq88+E1sDHe3eepEeCOmOc/rXoddlL4TixDvMKKKK0MAooooA5LxrpDTD7fABlFxIPUetcraNjFeqyoJI2RujDBryq5AtbuaH5gUYr8w5rlrQs7o7MPNtW7F2SbCnmue1RJp3cQTGFm48wKCR+Bqze3LhMxgt7Cufk1uaOXYYGHsev6VkkdkdTSvLS9ks4449SmV0Iy+xTuA6jGMc1b0cmFnLgBmOTisJ9amHIifHoVOKfa6y8z48nafUZpSjYp6HY3E+6EjNc5NBLdXaQW6b5HOFX1q0t1mI7zzW94AtTda01yVDRQIRk9mPTH+e9EI8zsYznyxbOw8JaW+k6LDbTbTLks231POK2aKK70rKx5jd3dhRRRTEFFFFABXDePtJEYOpxEAcLIvr6Guw1G+tdOtJLm+njggjUszuwAAFeFX/jO/wDHfjJ7LTJGg0O0geYgD5pcELlvbLDA/H6TON0XTbUtDVtZRJ90io7qxdpd8S5as1RJEBJCSM84FXbTWWTAn3A1yPTY9CM7C/Y7yT5XUbfrSfYxaqdwxVyTXYNh/ec1ialq7XClIsknvSd2W53HT3K52qea9p8MaZDpekQxRAbnUO7D+JiOteFW1s21ZJDhsgZxmuq8GfElrHxXc+GPEsioVZBa3J43BlDKre/PX8OvXehDdnHiJX0PYaKQEMAQQQeQRS1ucoUUUUABIAyeBXI+LfiF4e8MIRe3qS3WMrbQEO7f4dOp4r5l8QfEnxLrjyC71GaOJ3LiKBjGiZ/hGOcD3JrmFHmfMxyaFqTzHZ/EXx1e+L9R8yXMVjGf3FuDwvufVv5fnnpP2eFil1/VISB5stoQvuMjP/steUtHn0rsvhLqg0fxtZzMxRJAYXPs2P64qm9LEqVnc9iuNKazuprdhgI2F9xWbdWETyYkUEV6lrmmpfQCVAPOUcEVw15bsshSVCsi8Hjr9K4ZqzO+lNSRhjQbBo/MwDjqMVW+yQRPiBABWq1s4J2thT2pqWm1lVVLOxwABms023ob/CrsZYWJu7iGALuLNyPYcmvOv2gNMS28VwX8C/fh2OfXBwP0r6F8O6KumWzXNyoa6cY/3AeoFeLfH7hrdCoywyPzrspJxR59apzPQ5zwt8ZfEOiW8dtLMl7bpjCzjLAegb/HJr0PRfj7aTSquqaVJEjEAPA+7b6kg4P5V82yJsapIJWBGOlaxRjzM+09J+InhTU4Vki1uzgyCdt1IIWGDjo2KK+PEkJFFVyj5iIoQ2B0FNSXYQrFgT+VTqep9aBGJCC3OKyiJEyD1Az61Zt5DDcxyA42MGB9CDUIABAAwKcQCcHpVtXJPsDwJqn9seF7C8zl3jBf681d1zSotRty3CTL0fv9K81/Z31GWbQr+0k5jgmATnoCucfnn867nxotxd6Je2dpdSWcrRtieP7wwOnPrWfIpOzNFJw1Rw+pv9guDDPPAJM44kGB9a7XwZpcCWy3jyRzzSDKsjBlUegIr5kVJhLPDcyeY8RwW9eK6j4MajrP/CVvb2V4I7IbjJAxO1iB14rSWEUFzI09tKSsz6UmUucV87ftCyD+27KBeixNn86+i4X8xd2AK+XfjncPL41uVbohKCojsYNanmMqB8/Lk1GkOAMVaXg0sYzJj2rSIiSJQq42g0VJH0oqwP/Z");//证件照片
	//	$("#signature").val("1111111");
	cust.partyName = $("#custname").val();//姓名
	cust.idiesTypeCd = "1";//客户类型
	cust.certNumber = $("#idcard").val();//身份证号码
	cust.certAddress = $("#address").val();//地址
	cust.identityPic = $("#identityPic").val();//证件照片
	cust.signature = $("#signature").val();
	msg.result = cust;
	if(msg.result.partyName.length>0){
		msg.code = "0";
	}else{
		msg.code = "1";
		msg.result = "读取身份证失败！";
	}
	$('#duihua').modal('hide');
	chat($("#rid").val(),msg,$("#username").val(),$("#tag_username").val());
};

function chat(rid, msg, username, tag_username) {
	var route = "chat.chatHandler.send";
	pomelo.request(route, {
		rid: rid,
		content: msg,
		from: username,
		target: tag_username
	});
};