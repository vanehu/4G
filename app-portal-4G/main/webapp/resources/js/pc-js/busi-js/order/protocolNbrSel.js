CommonUtils.regNamespace("order", "protocolnbr");

order.protocolnbr = (function(){
	var inputID = "input1"; 
	var selectID = "select1"; 
	var widt = 0; 
	var inputWi = 0; 
	var he = 0; 
	var _init = function(){
		inputID = "input1";
		selectID = "select1";
		widt = 200;
		inputWi = widt - 20;
		he = $("#div1").height() - 41;
		var offset = $("input[id=input1]").offset(); 
		$("#" + selectID).change(function() { 
			var newvar = $("#" + selectID).find("option:selected").text(); 
			$("#" + inputID).val(newvar); 
		}).click(function() { 
			$("#select_div_on_key" + selectID).remove(); 
			}).css({ "display": "block", "width": widt + "px", "z-index": 1, "clip": "rect(0px " + widt + "px 51px 151px)" }); 
		$("#" + inputID).keyup(function() { 
			_showSelectCombo(); 
		}).click(function() { 
			_showSelectCombo(); 
		}).css({ "z-index": 2, "width": inputWi + "px" }); ; 
	};
	var _showSelectCombo = function(){
	    var pob = $("#" + inputID); 
		var v = pob.val(); 
		var off = pob.offset(); 
		var wi = pob.width() + 20; 
		var tp = off.top + pob.height() - 100 + 7; 
		var lef = off.left - 200 + 2; 
		var html = "<div class='select_div_list' id='select_div_on_key" + selectID + "' style='width:" + wi + "px;top:" + tp + "px;left:" + lef + "px;'><ul class='select_div_list_ul'>"; 
		$("#" + selectID).find("option").each(function() { 
			var tk = $(this); 
			var matcher = new RegExp("^" + v, "i"); 
			if(matcher.test(tk.val())){
			   html += "<li val='" + tk.val() + "' ht='" + encodeURIComponent(tk.html()) + "'>" + tk.html().replace(v, "<span class='selectSPAN'>" + v + "</span>") + "</li>"; 
		    }
		}); 
		html += "</ul></div>"; 
		var ulDIV = $("#select_div_on_key" + selectID); 
		ulDIV.remove(); 
		$("#div1").append(html); 
		var ulDIV = $("#select_div_on_key" + selectID); 
		var hei = ulDIV.find("ul").height(); 
		var newHeight = hei > he ? he : hei; 
		ulDIV.css({ height: newHeight + "px" }); 
		ulDIV.find("li").hover(function() { 
		$(this).css({ "background-color": "#316ac5" }); 
		}, function() { 
		$(this).css({ "background-color": "white" }); 
		}); 
		ulDIV.find("li").click(function() { 
				var ki = $(this); 
				var va = ki.attr("val"); 
				var htm = ki.attr("ht"); 
				htm = decodeURIComponent(htm); 
				$("#" + inputID).val(htm); 
				$("#" + selectID).val(va); 
				ulDIV.remove(); 
		    }); 
	    };
		return {
			showSelectCombo : _showSelectCombo,
			init : _init
		};
})();
 