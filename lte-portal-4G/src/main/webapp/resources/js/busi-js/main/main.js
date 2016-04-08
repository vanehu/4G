/**
 *
 * 首页
 * 
 * @author tang
 */
CommonUtils.regNamespace("main", "home");
//首页初始化
$(function(){
//main.home.queryNotice();   
  /*
	//首页中热卖套餐tab切换
   $(".selser_tab_panel:first").show();
   $(".side_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".side_nav").siblings(".selser_tab_content").find(".selser_tab_panel").eq(index).show().siblings().hide();
		});
	});	
   	
   //首页中最新信息展示tab切换
   $(".news_tab_panel:first").show();
   $(".news_nav li").each(function(index){
	 $(this).click(function(){
		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".news_nav").siblings(".news_tab_content").find(".news_tab_panel").eq(index).show().siblings().hide();
		});
	});
      	
   //首页中最新信息展示tab切换
   $(".phone_list:first").show();
   $(".main_title a").each(function(index){
	 $(this).click(function(){
		 
		 $(".goodsListInfor").eq(index).show().siblings().hide();

		$(this).addClass("current").siblings().removeClass("current");
		$(this).parents(".news_nav").siblings(".news_tab_content").find(".news_tab_panel").eq(index).show().siblings().hide();
		});
	});
   */

   
});
main.home = (function(){
	
	// Tab管理对象
	var _tabManager = {};
	
	/**
	 * 获得选中的TAB项.
	 */
	var _getSelectedTabItem = function() {
		var tabId = this.tabManager.getSelectedTabItemID();
		return $(".l-tab-content-item[tabid=" + tabId + "]");
	};
	
	var _getSelectedTabName = function() {
		return $("li.l-selected a").text();
	};
	
	var _addTab = function(tabid, text, url) {
		this.tabManager.addTabItem({tabid: tabid, text: text, url: url});
		
		$("#"+tabid).css("min-height","550px");
		$("#"+tabid).css("height","550px");
		
		$(".allsort").removeClass("showme");
		//$(".main_quick_div").css("display","none");
		$("#updateNews").css("margin-left","80px");
		$("#new").css("margin-left","100px").css("width","90%");
		$(".homecon").css("width","100%").css("margin-left","0px");
		//$("#div_main_index").removeClass("main_index").addClass("main_div");
		
		//		$("#" + tabid).after('<iframe frameborder="0" style="height: 548px; min-height: 551px; display: none;"></iframe>');
	};
	
	var _backTab = function(funName) {
		var tabItem = main.getSelectedTabItem();
		$("iframe:last", tabItem).removeAttr("src");
		$("iframe:first", tabItem).show();
		if (funName !== undefined) {
			var tabId = this.tabManager.getSelectedTabItemID();
			var dom = $("#" + tabId).get(0);
			//var win = $.browser.msie ? dom.window : dom.contentWindow;
			dom.contentWindow.window.eval(funName);
		}
	};
	
	var _loadTab = function(url) {
		var tabItem = main.getSelectedTabItem();
		var iframeloading = $(".l-tab-loading:first", tabItem);
		var iframe = $("iframe:last", tabItem);
		$("iframe:first", tabItem).hide();
		iframe.show();
		iframeloading.show();
		iframe.attr("src", url).unbind("load.tab").bind("load.tab", function() {
			iframeloading.hide();
		});
	};
	
	//首页置顶公告或公告详情
	var _queryNotice = function(bulletinId){
		
		var params = {
				"queryType" : "focus",
				"pageIndex" : 1,
				"pageSize" : 5
		}
		if(typeof(bulletinId)!="undefined"){
			params.queryType = "detail";
			params.bulletinId = bulletinId;
		}
		$.callServiceAsHtml(contextPath + "/main/notice", params, {
			"done" : function(response){
				if(typeof(bulletinId)!="undefined"){
					$("#noticeDetail").html(response.data);
					_createNoticeDialog();
					return;
				}
				if(!response){
					response = {};
					response.data='<li><a href="javascript:void(0)">[ 暂无公告，请刷新 ]</a></li>';
				}
				$(".news").html(response.data);
				var _hasClass = $(".allsort").hasClass("showme");
				if(_hasClass){
					$("#updateNews").css("margin-left","190px");
					$("#new").css("margin-left","200px").css("width","82%");
				}
			},
			"fail" : function(response){
			}
		});
	};
	
	//隐藏弹窗公告
	var _hidePopNotice = function(){
		$("#popNotice").css("height", "0px");
		setTimeout('$("#popNotice").hide();', 1000);
	};
	
	var _createNoticeDialog = function(){
		easyDialog.open({
			container : "ec-dialog-form-container-notice-items"
		});
		document.getElementById("ec-dialog-form-container-notice-items").setAttribute("style", "margin-top:40px;display: block;");
		$("#noticeItemsConCancel").click(function(){
			easyDialog.close();
		});
	};
	
	//首页请求已设置的快捷菜单
	var _queryMainShortcut = function(){
		$.callServiceAsHtmlGet(contextPath + "/menu/mainshortcut", {
			"done":function(response){
				$("#faster_ul").html(response.data).show();
			},
			fail:function(response){
				$.unecOverlay();
				//$.alert("提示","请求可能发生异常，请稍后再试！");
			}
		});
	};
	
	var _hideMainIco = function(){
		$(".allsort").removeClass("showme");
		$(".main_quick_div").css("display","none");
		$("#updateNews").css("margin-left","80px");
		$("#new").css("margin-left","100px").css("width","90%");
//		$(".news").css("display","none");
		$(".homecon").css("width","100%").css("margin-left","0px");
		$("#div_main_index").removeClass("main_index").addClass("main_div");
		$(".l-tab-content-item").css("min-height","500px");
	};
	
	/*****************************************************首页弹出框初始化调用函数*****************************************************/
	var _createDialog = function(){
		var _hasClass = $(".allsort").hasClass("showme");
		if(_hasClass){
			$(".allsort").removeClass("showme"); //打开弹出框的时候收起菜单导航
		}
		//登录窗口
		//校验是否已在异地登陆，先去除前台触发的校验，后续会在后端添加统一的验证
//		var response = $.callServiceAsJson(contextPath+"/staff/login/isLogin");
//		if (response.code !=0){
//			login.windowpub.alertLoginWindow(response.data);
//			return;
//		}
		//快捷菜单设置窗口
		easyDialog.open({
			container : "q_menu_dialog"
		});
		main.home.getMyList();
		main.home.getLv1();
		$("#q_menuclose").off("click").on("click",function(event){
			easyDialog.close();
			if(_hasClass){
				$(".allsort").addClass("showme"); //关闭弹出框的时候重新展开菜单导航
			}
			main.home.queryMainShortcut();
		});
	};

	/*******************************************************快捷菜单设置调用函数*******************************************************/			
		//(弹出框上部分)已设置的快捷菜单
		var _getMyList = function(){
			var param = {
					setShortcut : 1
			};
			$.callServiceAsHtmlGet(contextPath + "/menu/mainshortcut", param, {
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					$("#shortcut_getmylist").html(response.data).show();
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		};
		
		//(弹出框下部分左侧)第一级菜单
		var _getLv1 = function(){
			var url = contextPath+"/menu/inquireLv1";
			$.callServiceAsHtmlGet(url,{
				"done":function(response){
					$("#parentslist").html(response.data).show();
					$("#first_level a:first").addClass("side_nav_hover");
					var parentId = $("#first_level").find("a[class=side_nav_hover]").attr("id");
					main.home.getLv2(parentId);
				}
			});
		};
		
		//点击第一级菜单项目切换第二级菜单
		var _changeParent = function(parentId){
			$("#first_level").find("a[class=side_nav_hover]").removeClass();
			$("#first_level").find("a[id="+parentId+"]").addClass("side_nav_hover");
			main.home.getLv2(parentId);
		};
		
		//(弹出框下部分右侧)第二级菜单
		var _getLv2 = function(parentId){
			var url = contextPath+"/menu/inquireLv2";
			var param = {"parentId":parentId};
			$.callServiceAsHtmlGet(url,param, {
				"before":function(){
					$.ecOverlay("<strong>菜单查询中,请稍等...</strong>");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.data == ""){
						$("#son_list").html("<font style='color:#FA3D03;'>您没有权限添加此菜单</font>").show();
					}else {
						$("#son_list").html(response.data).show();
						$("#shortcut_getmylist").find("li").each(function(){
							var menuId=$(this).attr("id");
							var menu$=$("#second_level").find("ul[id="+menuId+"]");
							if(menu$ && menu$.length>0){
								menu$.addClass("ul_sel").removeAttr("onclick").css("cursor", "auto").find("a.close").show();	
							}
						});	
					}
				}
			});
		};
		
		//(弹出框下部分右侧)第三级菜单
		var _getLv3 = function(grandParentId, parentId){
			var url = contextPath+"/menu/inquireLv3";
			var param = {
					"grandParentId":grandParentId,
					"parentId":parentId
			};
			$.callServiceAsHtmlGet(url,param, {
					"before":function(){
					$.ecOverlay("<strong>菜单查询中,请稍等...</strong>");
				},"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.data == ""){
						$("#son_list").html("<font style='color:#FA3D03;'>您没有权限添加此菜单</font>").show();
					}else {
						$("#son_list").html(response.data).show();
						$("#shortcut_getmylist").find("li").each(function(){
							var menuId=$(this).attr("id");
							var menu$=$("#son_list").find("ul[id="+menuId+"]");
							if(menu$ && menu$.length>0){
								menu$.addClass("ul_sel").removeAttr("onclick").css("cursor", "auto").find("a.close").show();
							}
						});	
					}
				}
			});
		};
		
		//快捷菜单添加
		var _addShortcut = function(resourceId,isDrag){
			var ul$=$("#son_list").find("ul[id="+resourceId+"]");
			var dispOrder=1;
			var shortcutList$=$("#shortcut_getmylist");
			if(!isDrag){
				var lis = $("#shortcut_getmylist ul li");
				var lastEle$=shortcutList$.find("li:last");
				if(lis.length >=8){
					$.alert("提示","最多允许添加8个图标,请取消已选图标后再添加！");
					return;
				}
				if(lastEle$.length>0){
					dispOrder=lastEle$.attr("disporder")/1+1;
				}else{
					dispOrder=1;
				}
			}else {
				dispOrder=$("#shortcut_getmylist").find("#"+resourceId).index()+1;
			}	
			var url = contextPath+"/menu/setShortcut";
			var param = {
				    "dispOrder":dispOrder,
					"resourceId":resourceId,
					"actionType":"ADD"
			};
			$.callServiceAsJson(url,param, {
				"before":function(){
					$.ecOverlay("添加中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code==0){
						if(!isDrag){
							ul$.addClass("ul_sel").removeAttr("onclick").css("cursor", "auto").find("a.close").show();
							var dragAdd$=changeQuickLi(ul$.clone());
							var darg$=shortcutList$.find("ul").append(dragAdd$.html()).find("#"+dragAdd$.attr("id")).attr("disporder",dispOrder);
//			        		addDragEvent(darg$);
//			        		addDropEvent(darg$);
//			        		ul$.draggable("destroy");
						}
					}else if(response.code==-2){
						$.alertM(response.data);
					}					
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		};
		
		//将待选的菜单ul元素转为已选的快捷菜单li元素
		function changeQuickLi(ulEle$){
			ulEle$.find("a").remove();
			ulEle$.find("div").removeClass("ul_list_img").addClass("quick_top_ul_img");
			ulEle$.find("li").attr("id",ulEle$.attr("id")).attr("onclick","main.home.deleteShortcut("+ulEle$.attr("id")+")");
			return ulEle$;
		}
		
		//快捷菜单删除
		var _deleteShortcut = function(resourceId,isDrag){
			var url = contextPath+"/menu/setShortcut";
			var param = {
					"resourceId":resourceId,
					"actionType":"DEL"
			};
			$.callServiceAsJson(url,param, {
				"before":function(){
					$.ecOverlay("删除中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
					if(response.code==0){
						var ulEle$=$("#son_list").find("#"+resourceId);
						if(ulEle$ && ulEle$.length>0){
							ulEle$.removeClass("ul_sel").attr("onclick","main.home.addShortcut("+resourceId+")").css("cursor", "pointer").find("a.close").hide();
						}
						if(!isDrag){
//							addDragEvent(ulEle$,true);
						}
						$("#shortcut_getmylist ul").find("li[id="+resourceId+"]").remove();
					}else if(response.code==-2){
						$.alertM(response.data);
					}	
				},
				fail:function(response){
					$.unecOverlay();
					$.alert("提示","请求可能发生异常，请稍后再试！");
				}
			});
		};
		
		function _gotoPrepare(id){
			$("#mktResTypeCd").val($("#"+id).attr("mktResTypeCd"));
			$("#mktResCd").val($("#"+id).attr("mktResCd"));
			$("#mktResId").val($("#"+id).attr("mktResId"));
			$("#brand").val($("#"+id).attr("brand"));
			$("#phoneType").val($("#"+id).attr("phoneType"));
			$("#phoneColor").val($("#"+id).attr("phoneColor"));
			$("#mktName").val($("#"+id).attr("mktName"));
			$("#mktPrice").val($("#"+id).attr("mktPrice"));
			$("#mktPicA").val($("#"+id).attr("mktPicA"));
			$("#oprepare_form").submit();
		}
		
		function _gotoPrepare2(id){
			$("#prodOfferId").val(id);
			$("#oprepare_form2").submit();
		}
		
		var _refreshValidateCodeImg=function(){
			$("#vali_code_input").val("");
			$('#validatecodeImg').css({"width":"80px","height":"32px"}).attr('src',contextPath+'/validatecode/codeimg.jpg?' + Math.floor(Math.random()*100)).fadeIn();
		};
		
		var _closeVerificationcode = function(){
			var code = $("#vali_code_input").val().toUpperCase();
			$.callServiceAsJson(contextPath+"/main/checkVerificationcode?validatecode="+code, {}, {
				"before" : function(){
					$.ecOverlay("<strong>验证验证码中,请稍等会儿....</strong>");
				},
				"done" : function(response){
					if(response.code!=0){
						$("#vali_code_input").val("");
						$('#validatecodeImg').css({"width":"80px","height":"32px"}).attr('src',contextPath+'/validatecode/codeimg.jpg?' + Math.floor(Math.random()*100)).fadeIn();
						$.alert("失败", "<br>验证码不正确", 'error');
					}else if(response.code==0){
						easyDialog.close();
					}
				},
				"always" : function(){
					$.unecOverlay();
				},
				"fail" : function(response){
					$.alert("提示","请求可能发生异常，请稍候");
				}
			});
		}
		
/**************************	以下为拖拽相关,暂不使用
	
		function sortQuickByUpdate(){
			var shortCutInfo=[];
			$("#shortcut_getmylist").find("ul > li").each(function(i){
				var id=$(this).attr("id");
				if(!!id){
					shortCutInfo.push({"resourceId":$(this).attr("id"),"dispOrder":i+1});
					$(this).attr("disporder",i+1);
				}
			});
			var url = contextPath+"/menu/sortquick";
			$.callServiceAsJson(url,{"shortlist":shortCutInfo}, {
				"before":function(){
					$.ecOverlay("排序中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
				}
			});
		}
		
		function sortQuickByInsertUpdate(){
			var shortCutInfo=[];
			$("#shortcut_getmylist").find("ul > li").each(function(i){
				var id=$(this).attr("id");
				if(!!id){
					shortCutInfo.push({"resourceId":$(this).attr("id"),"dispOrder":i+1});
				}
			});
			var url = contextPath+"/menu/sortquick";
			$.callServiceAsJson(url,{"shortlist":shortCutInfo}, {
				"before":function(){
					$.ecOverlay("排序中...");
				},
				"always":function(){
					$.unecOverlay();
				},
				"done":function(response){
				}
			});
		}
		
		function dragSort(){
			$("#shortcut_getmylist").find("li").draggable({
			      helper: "clone",
			      opacity: .75,
			      zIndex:1011,
			      containment:"#ec-dialog-container",
			      refreshPositions: true, // Performance?
			      revert: "invalid",
			      revertDuration: 300,
			      scroll: true,
			      stop:function(event,ui){
			    	  if($(this).data("drop")){
			    		  sortQuickByUpdate();
			    		  $(this).removeData("drop");
			    	  }
			      }
		   });

			$("#shortcut_getmylist").find("li").droppable({
			        drop: function(e, ui) {
			        		if($(ui.draggable).parent("ul").hasClass("quick_top_ul")){
			        			//右拖
			        			if($(ui.draggable).index()<$(this).index()){
			        				$(this).after($(ui.draggable));
			        			}else{
			        				$(ui.draggable).after($(this));
			        			}
			        			$(ui.draggable).data("drop",true); 
				        		addDropEvent($(ui.draggable));
				        	}else {
				        		var dragAdd$=changeQuickLi($(ui.draggable).clone());
				        		$(this).after(dragAdd$.html());
				        		$(ui.draggable).addClass("ul_sel").find("a.close").show();     
				        		var darg$=$(this).parent().find("#"+dragAdd$.attr("id"));
				        		addDragEvent(darg$);
				        		addDropEvent(darg$);
				        		choseson(dragAdd$.attr("id"),true);
				        	}
			        },
			        hoverClass: "accept",
			        over: function(e, ui) {
			        }
			   });
		}
		
		function dragDelete(){
			$("#son_list").parent("div").droppable({
		        drop: function(e, ui) {
		        	var parentUl$=$(ui.draggable).parent("ul");
		        	if(parentUl$ && parentUl$.length>0 && parentUl$.hasClass("quick_top_ul")){
		        		var id=$(ui.draggable).attr("id");
		        		$(ui.draggable).remove();
		        		var ulEle$=$("#son_list").find("#"+id);
		        		ulEle$.attr("onclick","main.home.choseson("+id+")").removeClass("ul_sel").find("a.close").hide();
		        		cancelshortcut(id,true);
		        		addDragEvent(ulEle$,true);
		        	}
		        },
		        hoverClass: "accept",
		        over: function(e, ui) {
		        	
		        }
		   });
		}
		

		function dragAdd(){

			$("#son_list").find("ul").not(".ul_sel").draggable({
			      helper: "clone",
			      opacity: .75,
			      zIndex:1011,
			      containment:"#ec-dialog-container",
			      refreshPositions: true, // Performance?
			      revert: "invalid",
			      revertDuration: 300,
			      scroll: true,
			      stop:function(event,ui){
			    	  if($(this).hasClass("ul_sel")){
			    		  $(this).draggable("destroy");
			    	  }
			      }
		   });
		}
		
		function addDragEvent(ele$,isDestroy){
			if(isDestroy){
				ele$.draggable({
				      helper: "clone",
				      opacity: .75,
				      zIndex:1011,
				      containment:"#ec-dialog-container",
				      refreshPositions: true, // Performance?
				      revert: "invalid",
				      revertDuration: 300,
				      scroll: true,
				      stop:function(event,ui){
				    	  if($(this).hasClass("ul_sel")){
				    		  $(this).draggable("destroy");
				    	  }
				      }
			   });
			}else{
				ele$.draggable({
				      helper: "clone",
				      opacity: .75,
				      zIndex:1011,
				      containment:"#ec-dialog-container",
				      refreshPositions: true, // Performance?
				      revert: "invalid",
				      revertDuration: 300,
				      scroll: true,
				      stop:function(event,ui){
				    	  if($(this).data("drop")){
				    		  sortQuickByUpdate();
				    		  $(this).removeData("drop");
				    	  }
				      }
			   });
			}
		}
		
		function addDropEvent(ele$){
			ele$.droppable({
		        drop: function(e, ui) {
		        	if($(ui.draggable).parent("ul").hasClass("quick_top_ul")){
		        		//右拖
	        			if($(ui.draggable).index()<$(this).index()){
	        				$(this).after($(ui.draggable));
	        			}else{
	        				$(ui.draggable).after($(this));
	        			}
	        			$(ui.draggable).data("drop",true); 
		        	}else {
		        		var dragAdd$=changeQuickLi($(ui.draggable).clone());
		        		$(this).after(dragAdd$.html());
		        		$(ui.draggable).addClass("ul_sel").find("a.close").show();      
		        		var darg$=$(this).parent().find("#"+dragAdd$.attr("id"));
		        		addDragEvent(darg$);
		        		addDropEvent(darg$);
		        	}
		        },
		        hoverClass: "accept",
		        over: function(e, ui) {
		        	
		        }
		   });
		}
		
**************************/


	/**
	 * 渠道搜索过滤
	 * @private
	 */
		var _searchChannel = function () {
			var searchParam = $.trim($("#qudao #searchParam").val());
			var channelList = $("#qudao>table>tbody>tr");
			$.each(channelList, function () {
				var channel_name = $(this).find("td:eq(0)>dd>i").attr("channel_name");
				if (channel_name.indexOf(searchParam) == -1) {
					$(this).hide();
				} else {
					$(this).show();
				}
			});
		};


	return {
		tabManager				:_tabManager,
		queryNotice				:_queryNotice,
		hidePopNotice          : _hidePopNotice,
		queryMainShortcut		:_queryMainShortcut,
		getMyList				:_getMyList,
		getLv1					:_getLv1,
		getLv2					:_getLv2,
		getLv3					:_getLv3,
		createDialog			:_createDialog,
		addShortcut				:_addShortcut,
		deleteShortcut			:_deleteShortcut,
		changeParent			:_changeParent,
		gotoPrepare				:_gotoPrepare,
		gotoPrepare2			:_gotoPrepare2,
		hideMainIco				:_hideMainIco,
		refreshValidateCodeImg	:_refreshValidateCodeImg,
		closeVerificationcode	:_closeVerificationcode,
		getSelectedTabItem		:_getSelectedTabItem,
		getSelectedTabName		:_getSelectedTabName,
		addTab					:_addTab,
		backTab					:_backTab,
		loadTab					:_loadTab,
		searchChannel			:_searchChannel
	};
	
})();


