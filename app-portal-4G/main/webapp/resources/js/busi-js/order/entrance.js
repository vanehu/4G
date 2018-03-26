
CommonUtils.regNamespace("order", "entrance");

order.entrance = (function(){
	
	//初始化
	var _init = function() {
		_initEvent();
	}
	
	//初始化页面点击事件
	var _initEvent = function() {
		$("#buyOffer").click(function(){
			_buyOffer()
		});
		$("#buyTerminal").click(function(){
			_buyTerminal()
		});
		$("#choosePrettyNumber").click(function(){
			_choosePrettyNumber();
		});
	}
	
	//购套餐
	var _buyOffer = function() {
		if (!_checkIfQueryCust()) {
			return;
		}
	}
	
	//购终端
	var _buyTerminal = function() {
		if (!_checkIfQueryCust()) {
			return;
		}
	}
	
	//挑靓号
	var _choosePrettyNumber = function() {
		if (!_checkIfQueryCust()) {
			return;
		}
	}
	
	var _checkIfQueryCust = function() {
		if (!order.cust.getCustInfo()) {
			$.alert("提示","请先定位客户！");
			return false;
		}
		return true;
	}
	
	return {
		init : _init,
		checkIfQueryCust : _checkIfQueryCust
	}
})()
$(function(){
	order.entrance.init();
})