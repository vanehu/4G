/**
 * 针对个某个element，指定在可视窗口内不可见时，
 * 自动将本身element浮动或针对其他隐藏的element浮动
 * @author tang zheng yu
 * @version 1.0 2012-7-17 
 * @sample
 *  1. 销毁浮动层和滚动事件 $.floatToolbar.destory();
 *  2.创建浮动层
 *  a.根据 floatclass 克隆创建同样的浮动层,如果id值，会把id改成 id_float
 *  <div align="right" style="margin: 20px auto;"  class="floatingbutton"  floatclass="content-header-floating">>/div>
 *  code:
 *   	$(".floatingbutton").floatToolbar();
 *	a.根据 targetfloatid 指定另一个元素为浮动层
 *  <div align="right" style="margin: 20px auto;"  class="floatingbutton"  targetfloatid="tool1"></div>
 *  <div id="tool1">aa</div>
 *  code:
 *   	$(".floatingbutton").floatToolbar();
 */
(function($){
	/**
	* 取窗口距离顶部滚动高度
	*/
	function getScrollTop()
	{
	    var scrollTop=0;
	    if (window.pageYOffset){
	    	scrollTop = window.pageYOffset;
	    }else if(document.documentElement && document.documentElement.scrollTop) {
	        scrollTop=document.documentElement.scrollTop;
	    } else if(document.body) {
	        scrollTop=document.body.scrollTop;
	    }
	    return scrollTop;
	};
	/**
	* 取窗口可视范围的高度 
	*/
	function getClientHeight()
	{
	    var clientHeight=0;
	    if(document.body.clientHeight&&document.documentElement.clientHeight){
	        clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;        
	    }else{
	        clientHeight = (document.body.clientHeight>document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;    
	    }
	    return clientHeight;
	};
	/**
	* 取文档内容实际高度 
	*/
	function getScrollHeight()
	{
	    return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
	};
	var showFloatToolbar=function(self,conf){
		 if(conf.changeId && self.data("id")){
			 self.attr("id",self.data("id")+conf.changeId);
			 self.floattarget.attr("id",self.data("id"));
		 }
		 if(conf.beforeShow){
			 conf.beforeShow.apply(this,[self,conf]);
		 }
		switch(conf.showEffect)
        {
               case 'fade': 
                  self.floattarget.fadeIn(conf.showTime);break;
               case 'slide': 
                  self.floattarget.slideDown(conf.showTime); break;
               case 'custom':
                  conf.showCustom.call(self.floattarget,conf.showTime); break;
               default:
               case 'none':
                  self.floattarget.show(); break;
         };
		 if(conf.afterShow){
			 conf.afterShow.apply(this,[self,conf]);
		 }
	};
	var hideFloatToolbar=function(self,conf){
		 if(conf.changeId  && self.data("id")){
			 self.attr("id",self.data("id"));
			 self.floattarget.attr("id",self.data("id")+conf.changeId);
		 }
		 if(conf.beforeHide){
			 conf.beforeHide.apply(this,[self,conf]);
		 }
		switch(conf.hideEffect)
        {
               case 'fade': 
                  self.floattarget.fadeOut(conf.hideTime);break;
               case 'slide': 
                  self.floattarget.slideUp(conf.hideTime); break;
               case 'custom':
                  conf.hideCustom.call(self.floattarget,conf.hideTime); break;
               default:
               case 'none':
                  self.floattarget.hide(); break;
            };
		 if(conf.afterHide){
			 conf.afterHide.apply(this,[self,conf]);
		 }
	};
	function floatTolBar(self,conf){
		var selftTop=self.offset().top;
		  var scrollTop=getScrollTop();
		  var clientHeight=getClientHeight();
		  if((selftTop+self.height()+conf.threshold)>scrollTop && (selftTop-conf.threshold)<(scrollTop+clientHeight)){//元素可视范围内,则隐藏浮动层
			  hideFloatToolbar(self,conf);
		  }else{
			  showFloatToolbar(self,conf);
		  }
	};
	function floatToolbar(elem, conf){
		var self=jQuery(elem);
		  var floatTarget$=null;

		  if(self.attr(conf.targetFloatAttr)){
			  floatTarget$=jQuery("#"+self.attr(conf.targetFloatAttr));
			  if(conf.append=="after"){
				  if(conf.appendTarget){
				 	floatTarget$.insertAfter(jQuery(conf.appendTarget)); 
				  }else{
					 floatTarget$.insertAfter(self); 
				  }
			  }else if(conf.append=="before"){
				
				 if(conf.appendTarget){
					 floatTarget$.insertBefore(jQuery(conf.appendTarget)); 
				}else{
					floatTarget$.insertBefore(self); 
				}
			  }else if(conf.append=="prependTo"){
				 if(conf.appendTarget){
					 floatTarget$.prependTo(jQuery(conf.appendTarget)); 
				}else{
					floatTarget$.prependTo("BODY");  
				}
			  }else{
				  if(conf.appendTarget){
					  floatTarget$.appendTo($(conf.appendTarget)); 
				}else{
						  floatTarget$.appendTo("BODY"); 
				}
			  }
			 
		 }else {
			 floatTarget$=self.clone();
			 if(conf.changeId){
				 if(self.attr("id")){
					 self.data("id",self.attr("id"));
					 floatTarget$.attr("id",self.data("id")+conf.changeId);
				 }

			 }
			  if(conf.append=="after"){
				  if(conf.appendTarget){
					  floatTarget$.addClass(self.attr(conf.floatclass)).insertAfter(jQuery(conf.appendTarget));
				  }else{
					  floatTarget$.addClass(self.attr(conf.floatclass)).insertAfter(self);
				  }
				  
			  }else if(conf.append=="before"){
				  if(conf.appendTarget){
					  floatTarget$.addClass(self.attr(conf.floatclass)).insertBefore(jQuery(conf.appendTarget));
				  }else{
					  floatTarget$.addClass(self.attr(conf.floatclass)).insertBefore(self);
				  }
			  }else  if(conf.append=="prependTo"){
				 
				  if(conf.appendTarget){
					  floatTarget$.addClass(self.attr(conf.floatclass)).prependTo(jQuery(conf.appendTarget)); 
				  }else{
					  floatTarget$.addClass(self.attr(conf.floatclass)).prependTo("BODY"); 
				  }
			  }else{
				  if(conf.appendTarget){
					  floatTarget$.addClass(self.attr(conf.floatclass)).appendTo(jQuery(conf.appendTarget)); 
				  }else{
					  floatTarget$.addClass(self.attr(conf.floatclass)).appendTo("BODY"); 
				  }
			  }
		 }
		  floatTarget$.attr("floatclone","true");
		  jQuery.extend(self,{"floattarget":floatTarget$});
		 floatTolBar(self,conf);
		 if(!self.data("floattool.eventNames")){
			 self.data("floattool.eventNames",conf.eventNamespace);
			 jQuery([document, window]).on("scroll."+conf.eventNamespace+" resize."+conf.eventNamespace,function(){
				floatTolBar(self,conf);
			  });
		 }
	}

   jQuery.floatToolbar={
		  destory:function(ele,eventNamespace){//为class 或者 id
			  try{
				  if(arguments && arguments.length==1 && typeof arguments[0]=="string" 
					  && (arguments[0].indexOf(".")>0 || arguments[0].indexOf("#")>0)){
					  $([document, window]).off("."+arguments[0]);
					  return;
				  }
				  if(!!eventNamespace){
					  $([document, window]).off("."+eventNamespace);
				  }
				 $([document, window]).off(".floatToolbar");
				  if(typeof ele=="string"){
					  var ele$=$(ele);
					  if(ele$.attr("floatclone"))
						  ele$.remove();
				  }else if(typeof ele=="object" && ele.length>0) {//jquery object
					  if(ele.attr("floatclone"))
						  ele.remove();
				  }
			  }catch(e){}

		  }
   };
   
   jQuery.fn.floatToolbar = function(option)
   {
		// Default configuration
	    var defaultConf = {
	    	 showEffect: 'slide',
	         showTime: 200,
	         showCustom: null,
	         hideEffect: 'slide',
	         hideTime: 150,
	         hideCustom: null,
	    	targetFloatAttr:"targetfloatid",
	    	floatclass:"floatclass",
	    	threshold:0,//间距多少隐藏
	    	append:"appendTo",//"body",after,before prependTo
	    	appendTarget:null,//body #id 或 .class 或 element tag
	    	beforeShow:null,
	    	beforeHide:null,
	    	afterShow:null,
	    	afterHide:null,
	    	eventNamespace:"floattoolbar",//事件命名空间
	    	changeId:null//克隆时,是否改变原来的ID值，默认会加上 changeId
	    };

	  var cssfixedsupport=!document.all || document.all && document.compatMode=="CSS1Compat" && window.XMLHttpRequest;
	  jQuery.extend(defaultConf,option||{},{"cssfixedsupport":cssfixedsupport});
	  if(!this || this.length==0 || !cssfixedsupport){
		  return;
	  }
	  return this.each(function() {
		  floatToolbar(jQuery(this), defaultConf);
	  });
   };
})(jQuery);