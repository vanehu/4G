<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript">
	var contextPath = "${pageContext.request.contextPath}";
</script>
<link rel="Shortcut Icon" href="${pageContext.request.contextPath}/image/favicon.ico"/>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css-pub/system/css/main.css"/>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css-pub/system/css/menu.css"/>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/jquery/jquery-1.5.2.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/jquery/jquery.accordion.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/jquery/jquery.easing.1.3.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/json/json2.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/json/jsonpath-0.8.0.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/ligerUI/ligerui.min.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/main.js"></script>


<title>电子渠道服务平台管理系统</title>
</head>
<body>
<div id="main_top" class="l-topmenu">
	<div class="l-topmenu-logo" id="top_left">
	      <table border="0" cellspacing="0" cellpadding="0" >
	        <tr>
	          <td><font style="color: white;width: 45px; font-size: 35px;">电子渠道服务平台管理系统</font></td>
	          <td align="right" style="vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;您好，Administrator!&nbsp;&nbsp;</td>
	          <td style="vertical-align: bottom;"><img src="${pageContext.request.contextPath}/css-pub/system/image/logout.png" width="13" height="13" /></td>
	          <td style="vertical-align: bottom;">&nbsp;注销</td>
	        </tr>
	      </table>
	</div>
	
</div>
<div id="layout" style="position:absolute;top:65px;bottom:47px;width:100%">
    <div id="accordion" style="position:absolute;bottom:0px;top:10px;overflow:auto;">
    	<div id="st-accordion" class="st-accordion"></div>
    </div>
	<div id="framecenter">
    	<div title="我的主页">
			<h2>这是一个例子！</h2>
		</div>
	</div>
</div>
<div class="footer-copy">Copyright © 2011-2013 亚信联创科技（南京）有限公司</div>
</body>
</html>