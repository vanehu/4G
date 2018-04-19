$(document).ready(function() {
	$(".done").click(function() {
		var a = $(this).parents(".tab-top.active").index();
		$(this).parents(".tab-top.active").removeClass("active in").addClass("hasdata").slideUp().next(".tab-top").slideDown().addClass("active in").siblings().hide();
		$(".nav-top li").eq(a).removeClass("active").find(".tab-result-icon:hidden").show().css("opacity", "1.0");
		$(".nav-top li").eq(a + 1).addClass("animated fadeInDown active");
		setTimeout(function() {
			$(".nav-top li").eq(a + 1).removeClass("animated fadeInDown")
		}, 1000)
	});
	$(".nav-top li").click(function() {
		var a = $(this).index();
		$(".tab-content .tab-top").eq(a).slideDown().addClass("active in").siblings().removeClass("active in").slideUp()
	});
	$("#goback").on("click", function() {
		$("#modal-goback").modal("show")
	})
});
$(".tab-pane .open-list").on("click", function() {
	$(".list-open").removeClass("list-open");
	$(this).parent().parent().parent().parent(".list-box").addClass("list-open")
});
$(".arrow-right-box").on("click", function() {
	$(".meal-text").addClass("dis-none");
	$(this).next(".meal-text").removeClass("dis-none")
});
$(".open-noness").on("click", function() {
	if($(this).parent("li").nextAll(".non-ess").hasClass("dis-none")) {
		$(".non-ess").removeClass("dis-none")
	} else {
		$(".non-ess").addClass("dis-none")
	}
});

function Slider(a) {
	this.wrap = a.dom;
	this.list = a.list;
	this.outer = a.dom;
	this.init();
	this.bindDOM()
}
Slider.prototype.init = function() {
	this.radio = window.innerHeight / window.innerWidth;
	this.scaleW = window.innerWidth;
	this.idx = 0
};
Slider.prototype.renderDOM = function() {
	var d = this.wrap;
	var f = this.list;
	var b = f.length;
	this.outer = document.createElement("ul");
	for(var c = 0; c < b; c++) {
		var a = document.createElement("li");
		var e = f[c];
		a.style.width = window.innerWidth + "px";
		a.style.webkitTransform = "translate3d(" + c * this.scaleW + "px, 0, 0)";
		if(e) {
			if(e.height / e.width > this.radio) {
				a.innerHTML = '<img height="' + window.innerHeight + '" src="' + e.img + '">'
			} else {
				a.innerHTML = '<img width="' + window.innerWidth + '" src="' + e.img + '">'
			}
		}
		this.outer.appendChild(a)
	}
	this.outer.style.cssText = "width:" + this.scaleW + "px";
	d.appendChild(this.outer)
};
Slider.prototype.goIndex = function(e) {
	var c = this.idx;
	var d = $(this.outer).children();
	var b = d.length;
	var a;
	if(typeof e == "number") {
		a = c
	} else {
		if(typeof e == "string") {
			a = c + e * 1
		}
	}
	if(a > b - 1) {
		a = b - 1
	} else {
		if(a < 0) {
			a = 0
		}
	}
	this.idx = a;
	d[a].style.webkitTransition = "-webkit-transform 0.2s ease-out";
	d[a - 1] && (d[a - 1].style.webkitTransition = "-webkit-transform 0.2s ease-out");
	d[a + 1] && (d[a + 1].style.webkitTransition = "-webkit-transform 0.2s ease-out");
	d[a].style.webkitTransform = "translate3d(0, 0, 0)";
	d[a - 1] && (d[a - 1].style.webkitTransform = "translate3d(-" + this.scaleW + "px, 0, 0)");
	d[a + 1] && (d[a + 1].style.webkitTransform = "translate3d(" + this.scaleW + "px, 0, 0)")
};
Slider.prototype.bindDOM = function() {
	var b = this;
	var d = b.scaleW;
	var c = b.outer;
	var a = b.list.length;
	var f = function(h) {
		b.startTime = new Date() * 1;
		b.startX = h.touches[0].pageX;
		b.offsetX = 0;
		var i = h.target;
		while(i.nodeName != "LI" && i.nodeName != "BODY") {
			i = i.parentNode
		}
		b.target = i
	};
	var g = function(j) {
		j.preventDefault();
		b.offsetX = j.targetTouches[0].pageX - b.startX;
		var k = $(c).children();
		var l = b.idx - 1;
		var h = l + 3;
		for(l; l < h; l++) {
			k[l] && (k[l].style.webkitTransition = "-webkit-transform 0s ease-out");
			k[l] && (k[l].style.webkitTransform = "translate3d(" + ((l - b.idx) * b.scaleW + b.offsetX) + "px, 0, 0)")
		}
	};
	var e = function(h) {
		h.preventDefault();
		var k = d / 6;
		var i = new Date() * 1;
		var j = $(c).children();
		if(i - b.startTime > 300) {
			if(b.offsetX >= k) {
				b.goIndex("-1")
			} else {
				if(b.offsetX < 0 && b.offsetX < -k) {
					b.goIndex("+1")
				} else {
					b.goIndex("0")
				}
			}
		} else {
			if(b.offsetX > 50) {
				b.goIndex("-1")
			} else {
				if(b.offsetX < -50) {
					b.goIndex("+1")
				} else {
					b.goIndex("0")
				}
			}
		}
	};
	c.addEventListener("touchstart", f);
	c.addEventListener("touchmove", g);
	c.addEventListener("touchend", e)
};