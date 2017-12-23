
	//套餐上的按钮显示
	//$(".contract_list2 i").hide();
	//$(".contract_list2 td").hover(
	//	function () {
	//		$(this).find("i").show();
	//	},
	//	function () {
	//		$(this).find("i").hide();
	//	});
		

	

$(document).ready(function(){
	
	//展开已订购业务
	$("#orderbutton").toggle(
		function () {
			$("#orderlist").show();
			$("#arroworder").addClass("arrowup");
			$("#arroworder").removeClass("arrow");
			$(".main_div.location .s_title").css("border-bottom","0px solid #4f7d3f");
			$("#orderbutton").css({"height":"34px","border-bottom":"1px solid #fff"});
			$("#orderbutton span").css({"color":"#327501"});
		},function(){
		$("#orderlist").hide();
		$("#arroworder").addClass("arrow");
			$("#arroworder").removeClass("arrowup");
			$("#orderbutton").css({"height":"24px","border-bottom":"1px solid #4f7d3f"});
	}
	);
	//展开已订购业务 End
	
	//客户区域按钮下拉菜单
    $(".useredit").hover(function(){
		$(".useredit_hover").show();
	},
	function(){
		$(".useredit_hover").hide();
	}
	);
	//客户区域按钮下拉菜单 End
	//客户区域按钮下拉菜单点击后隐藏菜单
	$(".useredit_hover li").click(function(){
		$(".useredit_hover").hide();
	});
	
	//手机品牌更多
	$(".btn_more").toggle(
		function () {
			//$("#termManf_small").css("height","300px");
			$("#termManf_small").hide();
			$("#termManf_all").show();
			$("#termManf_all").parent("dl").css("overflow","inherit");
		},
		function () {
			$("#termManf_small").show();
			$("#termManf_all").hide();
			$("#termManf_all").parent("dl").css("overflow","hidden");
		});
	
	$("#hy").click(function(){
		$("#treaty").show();
		$("#sel_number").show();
		$("#lj").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
		$("#hy").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
		});
	$("#lj").click(function(){
		$("#treaty").hide();
		$("#sel_number").hide();
		$("#lj").addClass("selectBoxTwoOn").removeClass("selectBoxTwo");
		$("#hy").addClass("selectBoxTwo").removeClass("selectBoxTwoOn");
		});
	
	function unfoldMenu(pn, cn){
		var p = $('strong.menu-p'), c = $('div.menu-c'), cc = $('div.menu-c-current');
		if(c.index(cn) != c.index(cc)){
			p.removeClass('menu-p-current');
			cc.hide(200, function(){
				$(this).removeAttr('style').removeClass('menu-c-current');
			})
			pn.addClass('menu-p-current');
			cn.show(200, function(){
				$(this).removeAttr('style').addClass('menu-c-current');
			});
		}
	}
	
	function menuHandle(){
		$('strong.menu-p').click(function(){
			var pn = $(this), cn = pn.next();
			unfoldMenu(pn, cn);
		});
	}
	
	//设置默认下当前展开
	function menuCurrent(){
		var idx = $('input.menu-code-index').val(), m, pn, cn, p = $('strong.menu-p'), c = $('div.menu-c'), cc = $('div.menu-c-current');
		if(/c(\d)+/.test(idx)){ //判断c（十进制）条件
			m = $('a[aid="' + idx + '"]').addClass('current');
			cn = m.parents('div.menu-c');
			pn = cn.prev();
			unfoldMenu(pn, cn);
		}
	}
	
	menuCurrent();
	menuHandle();
	
});