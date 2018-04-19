/**
 * jqm控件工具类
 * @createby liusd
 * @date 2014-07-22
 * @param {Object} $
 */
(function($) {
	$.extend($,{
		//强制刷新,主要用于当前标签与标签下的jqm控件进行刷新,如果控件不多,不需要进行此操作,可以具体执行相应控件的refresh事件
		jqmRefresh:function(jqmObj){
			if(!jqmObj)
				return;
			var obj = $(jqmObj);
			obj.enhanceWithin();
			var dr = obj.attr("data-role");
			if(dr){
				if(dr == "page") obj.trigger('pagecreate');
				if(dr == "content") obj.trigger('create');
				if(dr == "footer") obj.trigger('create');
				if(dr == "listview") obj.listview().listview("refresh");
				if(dr == "navbar") obj.navbar();
				if(dr == "table") obj.trigger("create");
			}
			return ;
			/**obj.find("[data-role='page']").trigger('pagecreate');
			obj.find("[data-role='content']").trigger("create");
			obj.find("[data-role='footer']").trigger("create");
			obj.find("[data-role='listview']").listview().listview("refresh");
			obj.find("[data-role='button']").button().button("refresh");
			obj.find("button").buttonMarkup();
			obj.find("[data-role='navbar']").navbar();
			obj.find("[type='text']").textinput().textinput("refresh");
			obj.find("[type='radio']").checkboxradio().checkboxradio('refresh');
			obj.find("[data-role='slider']").slider().slider("refresh");
			obj.find("select[data-role!='slider']").selectmenu().selectmenu("refresh");
			obj.find("[data-role='table']").trigger("create");
			//自身刷新
			var dr = obj.attr("data-role");
			if(dr){
				if(dr == "page") obj.trigger('pagecreate');
				if(dr == "content") obj.trigger('create');
				if(dr == "footer") obj.trigger('create');
				if(dr == "listview") obj.listview().listview("refresh");
				if(dr == "navbar") obj.navbar();
				if(dr == "table") obj.trigger("create");
			}*/
		},
		//公共弹窗 动态创建 使用popup ,popOpt={cache:false,width:,height:,contentHeight:,afterClose:,transition:"slide" }
		popup:function(to,content,popOpt){
			if(!to)return ;
			
			var _popOpt = $.extend({},popOpt); 
			
			if(!_popOpt || $.isEmptyObject(_popOpt) || !_popOpt.cache)
				$.mobile.activePage.find(to).remove();
			if(content && content !="")
				_content = content;
			else
				_content = "";
			$.mobile.activePage.append(_content);
			
			var wheight = $(window).height();
			var wwidth = $(window).width();
			var _popup = $(to);
			//-7为防止整体过高导致滚动//.height(wheight-7);
			if(_popOpt.width)
				_popup.width(_popOpt.width);
			if(_popOpt.height && _popOpt.height == wheight)
				_popup.height(wheight - 7);
			if(_popOpt.height && _popOpt.height < wheight)
				_popup.height(_popOpt.height);
			if(_popOpt.contentHeight && _popOpt.contentHeight < wheight)
				_popup.find("div[data-role='content']").height(_popOpt.contentHeight);
			
			//解决content 不会自动追加ui-content问题针对popup
			$.mobile.activePage.page('destroy').page();
			//重新计算page高度
			$.mobile.resetActivePageHeight();
			var _transition = "slide";
			if(_popOpt.transition)
				_transition = _popOpt.transition;
			
			_popup.enhanceWithin().popup().popup("open",{positionTo:"window",transition:_transition}).trigger("create");
			_popup.popup({afterclose : function(event,ui){
				if(_popOpt.afterClose)
					_popOpt.afterClose.apply(this,[]);
			}});
			return _popup;
		},
		//二级弹窗
		popupSmall:function(to,popOpt){
			if(!to)return ;
			
			var _popOpt = $.extend({},popOpt); 
			var wheight = $(window).height();
			var wwidth = $(window).width();
			var _popup = $(to);
			//-7为防止整体过高导致滚动//.height(wheight-7);
			if(_popOpt.width){
				_popup.width(_popOpt.width);
				_popup.find(".dialog_box_title").width(_popOpt.width);
			}
			if(_popOpt.height)
				_popup.height(_popOpt.height);
			_popup.show();
			var myOffset = new Object();
			myOffset.left = (wwidth-_popup.width())/2;
			myOffset.top = (wheight-_popup.height())/2;
			_popup.offset(myOffset);
			_popup.find(".ui-btn").off("tap").on("tap",function(event){
				_popup.hide();
			});
		}

	});
})(jQuery);