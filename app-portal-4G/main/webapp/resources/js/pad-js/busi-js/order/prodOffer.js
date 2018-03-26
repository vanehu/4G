/**
 * 套餐入口
 * 
 * @author dujb3
 */
CommonUtils.regNamespace("order", "prodOffer");
/**
 * 套餐入口
 */
order.prodOffer = (function($){
	
	var _init = function(){
		order.prodOffer.queryApConfig();
		
	};
	
	
	//查询平台配置信息
	var _queryApConfig=function(){
		var configParam={"CONFIG_PARAM_TYPE":"PROD_AND_OFFER"};
		var qryConfigUrl=contextPath+"/order/queryApConf";
		$.callServiceAsJsonGet(qryConfigUrl, configParam,{
			"done" : call_back_success_queryApConfig
		});
	};
	
	var call_back_success_queryApConfig=function(response){
		var OFFER_PRICE ;
		var OFFER_INFLUX ;
		var OFFER_INVOICE ;
		
		var OFFER_PRICE_html   = "<a href='javascript:void(0);' class='selected' val='' >不限</a>";
		var OFFER_INFLUX_html  = "<a href='javascript:void(0);' class='selected' val='' >不限</a>";
		var OFFER_INVOICE_html = "<a href='javascript:void(0);' class='selected' val='' >不限</a>";
		if(response.data){
			var dataLength=response.data.length;
			for (var i=0; i < dataLength; i++) {
				if(response.data[i].OFFER_PRICE){
					OFFER_PRICE = response.data[i].OFFER_PRICE ;
					for(var j=0;j<OFFER_PRICE.length;j++){
						var rowKey=OFFER_PRICE[j].COLUMN_VALUE;
						var rowVal=OFFER_PRICE[j].COLUMN_VALUE_NAME;
						OFFER_PRICE_html=OFFER_PRICE_html+"<a href='javascript:void(0);' val='"+rowKey+"'>"+rowVal+"</a>";
					}
					$("#price_basic").html(OFFER_PRICE_html);
					$("#price_basic a").each(function(){
						$(this).off("click").on("click",function(event){
							$("#price_basic a").each(function(){$(this).removeClass("selected");});
							$(this).addClass("selected");
							event.stopPropagation();
							order.service.searchPack(1);
						});
					});
				}else if(response.data[i].OFFER_INFLUX){
					OFFER_INFLUX = response.data[i].OFFER_INFLUX ;
					for(var j=0;j<OFFER_INFLUX.length;j++){
						var rowKey=OFFER_INFLUX[j].COLUMN_VALUE;
						var rowVal=OFFER_INFLUX[j].COLUMN_VALUE_NAME;
						OFFER_INFLUX_html=OFFER_INFLUX_html+"<a href='javascript:void(0);' val='"+rowKey+"'>"+rowVal+"</a>";
					}
					$("#influx_basic").html(OFFER_INFLUX_html);
					$("#influx_basic a").each(function(){
						$(this).off("click").on("click",function(event){
							$("#influx_basic a").each(function(){$(this).removeClass("selected");});
							$(this).addClass("selected");
							event.stopPropagation();
							order.service.searchPack(1);
						});
					});
				}else if(response.data[i].OFFER_INVOICE){
					OFFER_INVOICE = response.data[i].OFFER_INVOICE ;
					for(var j=0;j<OFFER_INVOICE.length;j++){
						var rowKey=OFFER_INVOICE[j].COLUMN_VALUE;
						var rowVal=OFFER_INVOICE[j].COLUMN_VALUE_NAME;
						OFFER_INVOICE_html=OFFER_INVOICE_html+"<a href='javascript:void(0);' val='"+rowKey+"'>"+rowVal+"</a>";
					}
					$("#invoice_basic").html(OFFER_INVOICE_html);
					$("#invoice_basic a").each(function(){
						$(this).off("click").on("click",function(event){
							$("#invoice_basic a").each(function(){$(this).removeClass("selected");});
							$(this).addClass("selected");
							event.stopPropagation();
							order.service.searchPack(1);
						});
					});
				}
			}
		}
	};
	
	return {
		init:_init,
		queryApConfig:_queryApConfig
	};
})(jQuery);

//初始化
$(function(){
	
});