$.fn.tabs = function(tabList, tabTxt, options) {
    var _tabList = $(this).find(tabList);
    var _tabTxt = $(this).find(tabTxt);
    var tabListLi = _tabList.find("li");
    var defaults = { currentTab: 0, defaultClass: "current", isAutoPlay: false, stepTime: 2000, switchingMode: "c" };
    var o = $.extend({}, defaults, options);
    var _isAutoPlay = o.isAutoPlay;
    var _stepTime = o.stepTime;
    var _switchingMode = o.switchingMode;
    _tabList.find("li:eq(" + o.currentTab + ")").addClass(o.defaultClass);
    _tabTxt.children("div").each(function(i) {
        $(this).attr("id", "wp_div" + i);
    }).eq(o.currentTab).css({ "display": "block" });
    tabListLi.each(
		function(i) {
		    $(tabListLi[i]).mouseover(
				function() {
				    if (_switchingMode == "o") {
				        $(this).click();
				    }
				    _isAutoPlay = false;
				}
			);
		    $(tabListLi[i]).mouseout(
				function() {
				    _isAutoPlay = true;
				}
			)
		}
	);

    _tabTxt.each(
		function(i) {
		    $(_tabTxt[i]).mouseover(
				function() {
				    _isAutoPlay = false;
				}
			);
		    $(_tabTxt[i]).mouseout(
				function() {
				    _isAutoPlay = true;
				}
			)
		});

    tabListLi.each(
		function(i) {
		    $(tabListLi[i]).click(
				function() {
					//切换tab窗口 lianld
					var tabName ="" ;
					var paramUrl = "";
					var currentTabDivId = "";
					var currentTabDivId = "";
					if(i=="0"){
						paramUrl=contextPath+"/report/reportBiz";
						tabName="report_tab_panel_biz1 .report_tab_content";
						currentTabDivId="report_tab_panel_biz1";
					}
					if(i=="1"){
						paramUrl=contextPath+"/report/bizStatistic";
						tabName="statistic_tab_panel_biz1 .report_tab_content";
						currentTabDivId="statistic_tab_panel_biz1";
					}
					if(i=="2"){
						paramUrl=contextPath+"/report/reportCust";
						tabName="report_tab_panel_cust1 .report_tab_content";
						currentTabDivId="report_tab_panel_cust1";
					}
					if(i=="3"){
						paramUrl=contextPath+"/report/custStatistic";
						tabName="statistic_tab_panel_cust1 .report_tab_content";
						currentTabDivId="statistic_tab_panel_cust1";
					}
					//region add by chyl
					if(i=="4"){
						paramUrl=contextPath+"/report/reportCard";
						tabName="report_tab_panel_card1 .report_tab_content";
						currentTabDivId="report_tab_panel_card1";
					}
					//endregion add by chyl
					//cash report add by liusd
					if(i=="5"){
						paramUrl=contextPath+"/report/reportCashPrepare";
						tabName="report_tab_panel_cashc .report_tab_content";
						currentTabDivId="report_tab_panel_cashc";
					}
					//cash report add by liusd
					$("#report_tab_list").children("div").hide();
					$("#"+currentTabDivId).show();
					ec.agent.page.pageChildLoadNoHTML5(paramUrl,tabName,function(response){
						if(!!response.code && response.code !=0 && !!response.errorsList ){
							if(response.code==1){
								$.alert("提示信息",response.errorsList[0].msg);
							}else{ 
								$.alert("提示信息",response.errorsList);
							}
						}
						order.report.init();
						if(i=="0"){
							$("#channelSelect").off("click").on("click",function(event){order.report.channelSelect();event.stopPropagation();});
							$("#btn-order-report-biz").bind("click",function(){order.report.listReportData(this);});
							$("#biz_report_b_date").off("click").on("click",function(){$.calendar({ maxDate:'#biz_report_r_e_date',format:'yyyy年MM月dd日 ',real:'#biz_report_r_b_date'});});
							$("#biz_report_e_date").off("click").on("click",function(){$.calendar({ minDate:'#biz_report_r_b_date',format:'yyyy年MM月dd日',real:'#biz_report_r_e_date'});});
						}
						if(i=="1"){
							$("#channelSelectStatisticBiz").off("click").on("click",function(event){order.report.channelSelectStatisticBiz();event.stopPropagation();});
							var resJson="";
							var bindDataUrl=contextPath+"/report/statistic-bindData";
							var param={};
							$.callServiceAsJson(bindDataUrl,param,{
								"before":function(){
									$.ecOverlay("<strong>正在加载配置信息,请稍等会儿....</strong>");
								},
								"always":function(){
									$.unecOverlay();
								},
								"done" : function(resp){
									resJson = resp.data;
									var statisticDimention=$("#statistic_dimention");
									var statisticYear=$("#statistic_year");
									var dimentionHtml="<option value='0' name=''>请选择统计维度</option>";
									var yearHtml="<option value='1' name=''>请选择近几年统计</option>";
									var dimentionData=resJson[0].REPORT_STATISTIC_DIMENTION;
									var yearData=resJson[1].REPORT_STATISTIC_YEAR;
									if(dimentionData){
										for(var i=0;i<dimentionData.length;i++){
											dimentionHtml=dimentionHtml+"<option value='" +dimentionData[i].COLUMN_VALUE + "' name='" +dimentionData[i].COLUMN_VALUE + "'>" + dimentionData[i].COLUMN_VALUE_NAME + "</option>";
										}
									}
									if(yearData){
										for(var j=0;j<yearData.length;j++){
											yearHtml=yearHtml+"<option value='" +yearData[j].COLUMN_VALUE + "' name='" +yearData[j].COLUMN_VALUE + "'>" + yearData[j].COLUMN_VALUE_NAME + "</option>";
										}
									}
									statisticDimention.html(dimentionHtml);
									statisticYear.html(yearHtml);
								}
							});
							$("#biz_report_b_date_statistic").off("click").on("click",function(){$.calendar({ maxDate:'#biz_report_r_e_date_statistic',format:'yyyy年MM月dd日 ',real:'#biz_report_r_b_date_statistic'});});
							$("#biz_report_e_date_statistic").off("click").on("click",function(){$.calendar({ minDate:'#biz_report_r_b_date_statistic',format:'yyyy年MM月dd日',real:'#biz_report_r_e_date_statistic'});});
							$("#statistic_dimention").off("change").on("change",function(event){order.report.dimentionChooseEven(this);event.stopPropagation();});
							$("#btn-order-report-biz-statistic").bind("click",function(){order.report.statisticBiz(this);});
						}
						if(i=="2"){
							$("#channelSelectCust").off("click").on("click",function(event){order.report.channelSelectCust();event.stopPropagation();});
							$("#btn-order-report-cust").bind("click",function(){order.report.listReportData(this);});
							$("#cust_report_b_date").off("click").on("click",function(){$.calendar({ maxDate:'#cust_report_r_e_date',format:'yyyy年MM月dd日 ',real:'#cust_report_r_b_date'});});
							$("#cust_report_e_date").off("click").on("click",function(){$.calendar({ minDate:'#cust_report_r_b_date',format:'yyyy年MM月dd日',real:'#cust_report_r_e_date'});});
						}

						//region add by chyl
						if(i=="4"){
							//$("#btn-order-report-card").bind("click",function(){order.report.listReportData(this);});
							$("#card_report_b_date").off("click").on("click",function(){$.calendar({ maxDate:'#card_report_r_e_date',format:'yyyy年MM月dd日 ',btnBar:false,real:'#card_report_r_b_date' });});
							$("#card_report_e_date").off("click").on("click",function(){$.calendar({ minDate:'#card_report_r_b_date',format:'yyyy年MM月dd日',btnBar:false,real:'#card_report_r_e_date'});});
						}
						//endregion add by chyl

						if(i=="3"){
							$("#channelSelectStatisticCust").off("click").on("click",function(event){order.report.channelSelectStatisticCust();event.stopPropagation();});
							var resJson="";
							var bindDataUrl=contextPath+"/report/statistic-bindData";
							var param={"flag":"cust"};
							$.callServiceAsJson(bindDataUrl,param,{
								"before":function(){
									$.ecOverlay("<strong>正在加载配置信息,请稍等会儿....</strong>");
								},
								"always":function(){
									$.unecOverlay();
								},
								"done" : function(resp){
									resJson = resp.data;
									var statisticDimention=$("#cust_statistic_dimention");
									var dimentionHtml="<option value='0' name=''>请选择统计维度</option>";
									var dimentionData=resJson[0].REPORT_CUST_STATISTIC_DIMENTION;
									if(dimentionData){
										for(var i=0;i<dimentionData.length;i++){
											dimentionHtml=dimentionHtml+"<option value='" +dimentionData[i].COLUMN_VALUE + "' name='" +dimentionData[i].COLUMN_VALUE + "'>" + dimentionData[i].COLUMN_VALUE_NAME + "</option>";
										}
									}
									statisticDimention.html(dimentionHtml);
									$("#cust_report_b_date_statistic").off("click").on("click",function(){$.calendar({ maxDate:'#cust_report_r_b_date_statistic',format:'yyyy年MM月dd日 ',real:'#cust_report_r_b_date_statistic' });});
									$("#cust_report_e_date_statistic").off("click").on("click",function(){$.calendar({ minDate:'#cust_report_r_e_date_statistic',format:'yyyy年MM月dd日',real:'#cust_report_r_e_date_statistic'});});
									$("#btn-order-report-cust-statistic").bind("click",function(){order.report.statisticCust(this);});
								}
							});
						}
					});
					
				    if ($(this).className != o.defaultClass) {
				        $(this).addClass(o.defaultClass).siblings().removeClass(o.defaultClass);
				    }
				    if ($.browser.msie) {
				        _tabTxt.children("div").eq(i).siblings().css({ "display": "none" });
				        _tabTxt.children("div").eq(i).fadeIn(600);
				    } else {
				        _tabTxt.children("div").eq(i).css({ "display": "block" }).siblings().css({ "display": "none" }); 
				    }
				}
			)
		}
	);

    // }
   
    //alert(_isAutoPlay);
    return this;
};




var userName = "wbpbest";
function hello(_name) {
    alert("hello," + _name);
} 
var __sti = setInterval;
window.setInterval = function(callback, timeout, param) {
    var args = Array.prototype.slice.call(arguments, 2);
    var _cb = function() {
        callback.apply(null, args);
    };
    __sti(_cb, timeout);
};
var __sto = setTimeout;
window.setTimeout = function(callback, timeout, param) {
    var args = Array.prototype.slice.call(arguments, 2);
    var _cb = function() {
        callback.apply(null, args);
    };
    __sto(_cb, timeout);
};
var statisticDimentionData;

$(document).ready(function() {
    $("#ex01").tabs(".ContactMenu", ".ContactBox", { currentTab: 0, switchingMode: 'o' });
    $("#ex01").find(".exContent2").tabs(".ContactMenu2", ".ContactBox2", { currentTab: 0, isAutoPlay: false });
    //$("#ex02").tabs(".ContactMenu", ".ContactBox", { currentTab: 1, isAutoPlay: true, switchingMode: 'c' });
    $("#ex02").tabs(".tabTitle", ".tabBox", { currentTab: 1, isAutoPlay: true, switchingMode: 'c' });
});



