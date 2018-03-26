/**
 * 首页 功能控制
 * 
 * @author liusd
 */
CommonUtils.regNamespace("main", "home");
main.home = (function(){
	//原有配置
	var _pre_shortcut = [];
	//变化内容
	var _change_shortcut = [];
	//首页请求公告
	var _queryNotice = function(bulletinId){
		var param = {};
		if(bulletinId){
			 param = {"bulletinId" : bulletinId};
		}
		$.callServiceAsHtmlGet(contextPath + "/pad/main/notice",$.param(param), {
			"before":function(){
				if(!$.isEmptyObject(param))
					$.ecOverlay("公告查询中,请稍等...</strong>");
			},
			"always":function(){
				if(!$.isEmptyObject(param))
					$.unecOverlay();
			},
			"done" : function(response){
				if(!$.isEmptyObject(param)){
					$.popup("#dlg_notice_detail",response.data,{"transition":"slidedown"});
					return;
				}
				//没查到数据保留页面提示信息
				if(!response && !(response.data)){
					return ;
				}
				
				$("#div_notice").html(response.data);
				//滚动处理
				var intervalTime = $("#input_interval_time").val();
				if(intervalTime == ""){
					intervalTime = 3000;
				}
				//滚动一次的长度，必须是行高的倍数,这样滚动的时候才不会断行
				var _stepSize = 40;
				//可选("slow", "normal", or "fast")，或者滚动动画时长的毫秒数
				var _scrollSpeed = "slow";
				var _objInterval = null;
				var _scrollObj = $("#span_scroll_notice");
				//启动定时器，开始滚动
				var _start = function(){
					_objInterval=setInterval(function(){
						if(_scrollObj.scrollTop() >= $("#span_notice_body").outerHeight()){
							_scrollObj.scrollTop(_scrollObj.scrollTop()-$("#span_notice_body").outerHeight());
						}
						//使用jquery创建滚动时的动画效果
						_scrollObj.animate({"scrollTop" : _scrollObj.scrollTop()+_stepSize +"px"},_scrollSpeed,function(){});
					},intervalTime);
				}
				//清除定时器，停止滚动
				var _stop = function(){
					window.clearInterval(_objInterval);
				}
				//用上部的内容填充下部
				$("#span_notice_hide").html($("#span_notice_body").html());
				//给显示的区域绑定鼠标事件
				_scrollObj.bind("mouseover",function(){_stop();});
				_scrollObj.bind("mouseout",function(){_start();});
				//事件绑定 
				$("#span_notice_body a").on("tap",function(){
					_queryNotice($(this).attr("nid"));
				})
				$("#span_notice_hide a").on("tap",function(){
					_queryNotice($(this).attr("nid"));
				})
				_start();
			}
		});
	};
	
	//首页请求已设置的快捷菜单
	var _queryMainShortcut = function(){
		$.callServiceAsHtmlGet(contextPath + "/pad/menu/mainShortcut.html",{}, {
			"before":function(){
				$("#ul_quick_set").animate({"margin-left":"1400px"},500);
			},
			"done":function(response){
				var obj = $("#ul_quick_set");
				obj.html(response.data).delay(1000).animate({"margin-left":"0px"},1500);
				obj.find("li[ctrl='add']").off("tap").on("tap",function(){
					$(this).off("tap").on("tap",_configShortCut);
				});
				obj.find("li[ctrl!='add']").off("tap").on("tap",function(){
					window.location.href=$(this).attr("url");
				});
			}
		});
	};
	//隐藏首页非业务操作入口内容,保留三个入口 ok
	var _hideMainIco = function(){
		$("#div_notice").hide();
		$("#div_user_info").hide();
		$("#div_quick_set").hide();
		$("#ul_quick_set").hide();
	};
	//隐藏首页所有内容  ok
	var _hideMainAllIco = function(){
		$("#div_notice").hide();
		$("#ul_busi_area").hide();
		$("#div_user_info").hide();
		$("#div_quick_set").hide();
		$("#ul_quick_set").hide();
	};
	//配置快捷菜单
	var _configShortCut = function(){
		//登录窗口
		var response = $.callServiceAsJson(contextPath+"/staff/login/isLogin");
		if (response.code !=0){
			login.windowpub.alertLoginWindow(response.data);
			return;
		}
		$.callServiceAsHtmlGet(contextPath+"/pad/menu/configPrepare.html",{},{
			"before":function(){
				$.ecOverlay("<strong>查询菜单中,请稍等...</strong>");
			},
			"always":function(){
				$.unecOverlay();
			},		
			"done":function(response){
				if (!response || !response.data) {
					$.alert("提示","抱歉,没有找到可供配置的菜单信息.");
					return;
				}
				$.popup("#dlg_shortcut_quickset",response.data,{
					width:$(window).width()-200,
					height:$(window).height(),
					contentHeight:$(window).height()-120,
					afterClose:function(){_queryMainShortcut();}
				});
				
				$("#dlg_shortcut_quickset li").each(function(){
					var _this = $(this);
					_this.off("tap").on("tap",function(){
						if($("#dlg_shortcut_quickset li.set").length >=8 && !_this.hasClass("set")){
							$.alert("提示","最多允许添加8个图标,请取消已选图标后再添加！");
							return;
						}
						_this.toggleClass("set");
						var _data = {};
						if(_this.hasClass("set")){
							_data = {"resourceId":_this.attr("rid"),"actionType":"ADD"};
						}else{
							_data = {"resourceId":_this.attr("rid"),"actionType":"DEL"};
						}
						_saveShortcut(_data);
					});
				});
			}
		});	
	};
	var _saveShortcut = function(dataObj){
		var url = contextPath+"/menu/setShortcut";
		var param = dataObj;
		$.callServiceAsJson(url,param, {
			"before":function(){
				$.ecOverlay("保存中,请稍等...");
			},
			"always":function(){
				$.unecOverlay();
			},
			"done":function(response){
				if(response.code != 0){
					$.alertM(response.data);
				}					
			},
			"fail":function(response){
				$.unecOverlay();
				$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	}
	//退出系统操作 ok
	var _callExit = function(){
		$.callServiceAsJson(contextPath+"/staff/login/padloginout", {}, {
			"done" : function(response){
				if(response.code==0){
					MyPlugin.exitSystem([],function(result) {},function(error) {});
				}
			},
			"fail" : function(response){
				MyPlugin.exitSystem([],function(result) {},function(error) {});
			}
		});
	}
	//菜单控制
	var _menuCtrl = function(){
		$("#a_logobar").off("tap").on("tap",function(){
		    $("#navbar").slideToggle(400);
		});
		$("#a_logobar").off("taphold").on("taphold",function(){
		    window.location.href = contextPath+"/pad/main/home";
		});
	}
	//页面初始化块 ok
	var _mainInit = function(){			
		//查询公告
		_queryNotice();
		//查询已配置快捷菜单
		_queryMainShortcut();
		//首页事件
		_bindMainEvent();
		//首页数据
		_bindMainData();
	}
	//业务数据在首页初始加载 ok
	var _bindMainData = function(){
		//业务办理所需用户信息
		var _obj = $("#_session_staff_info");
		OrderInfo.staff={
			staffId 		: _obj.attr("staffId"),
			staffCode 		: _obj.attr("staffCode"),
			staffName 		: _obj.attr("staffName"),
			channelId 		: _obj.attr("channelId"),
			channelName 	: _obj.attr("channelName"),
			areaId 			: _obj.attr("areaId"),
			areaCode 		: _obj.attr("areaCode"),
			areaName 		: _obj.attr("areaName"),
			areaAllName 	: _obj.attr("areaAllName"),
			orgId 			: _obj.attr("orgId"),
			distributorId 	: _obj.attr("partnerId"),
			operatorsId 	: _obj.attr("operatorsId"),
			operatorsName 	: _obj.attr("operatorsName"),
			operatorsNbr 	: _obj.attr("operatorsNbr"),
			soAreaId 		: _obj.attr("areaId"),
			soAreaCode 		: _obj.attr("areaCode"),
			soAreaName 		: _obj.attr("areaName"),
			soAreaAllName 	: _obj.attr("areaAllName")
		};
	}
	//绑定主页面所有事件 ok
	var _bindMainEvent = function(){			
		//绑定退出与渠道切换
		$("#a_sys_exit").off("tap").on("tap",_callExit);
		$("#a_channel_exchange").off("tap").on("tap",function(){
			$("#dlg-exchange-channel").popup("open");
		    $("#dlg-exchange-channel li").on("tap", function (){
		    	_chooseChannel($(this).find("a"));
		    });
		});
		//菜单控制
		_menuCtrl();
		//快捷菜单配置
		$("#div_quick_set a").off("tap").on("tap",_configShortCut);
		//客户查询相关数据初始化
		order.cust.mgr.init();
	}
	//选定渠道后设置会话中的信息 ok
	var _chooseChannel= function(obj){
		$.confirm("信息","您当前正在进行渠道切换的操作，点击确定按钮，将清除当前页所有数据！",{
			yes:function(){
				var setUrl  = contextPath + "/staffMgr/setCurrentChannel";
				var param = {"channelId":$(obj).attr("cnlid")};
				var response = $.callServiceAsJson(setUrl,param);
				if(response.code == 0){
					$("#dlg-exchange-channel").popup("close");
					//关闭后再重新载入页面,防止url中存在#&ui-state等信息
					if(!$("#dlg-exchange-channel").hasClass("ui-page-active")){
						window.location.reload();
					}
				}else {
					$.alert("提示","渠道设定异常，请稍后再试");
				}
		},no:function(){
			$("#dlg-exchange-channel").popup("close");
		}});
	};
	return {
		saveShortcut	:_saveShortcut,
		hideMainIco		:_hideMainIco,
		hideMainAllIco	:_hideMainAllIco,
		mainInit		:_mainInit
	};
})();
//首页初始化
$(function(){
	main.home.mainInit();
})