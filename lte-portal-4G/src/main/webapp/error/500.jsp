<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String errorJson = (String)request.getAttribute("errorJson");
//errorJson = "{\"code\":-2,\"data\":{\"errCode\":\"20111\",\"errMsg\":\"显示\"}}";
if (errorJson == null) {
	errorJson = "";
}
String errorCode = (String)request.getAttribute("errorCode");
String errorMsg = (String)request.getAttribute("errorMsg");
%>
<!DOCTYPE html SYSTEM>
<html>
	<head>
		<meta charset="UTF-8"/>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>内部服务器错误</title>
		<META HTTP-EQUIV="Pragma" CONTENT="no-cache"> 
		<META HTTP-EQUIV="Cache-Control" CONTENT="no-store,no-cache,must-revalidate"> 
		<META HTTP-EQUIV="Expires" CONTENT="0">
		<META name="keywords" content="电信集团">
		<META name="description" content="电信集团">
		<link rel="Shortcut Icon" href="<%=path%>/image/favicon.ico"/>
		<link href="<%=path%>/css/base.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/css/forms.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/css/layout.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/css/mend.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/css/module.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/css/style.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/skin/default/css/font.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/skin/default/css/themes.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/js/third-js/jquery/zebra-dialog/css/zebra_dialog.css" rel="stylesheet" type="text/css" />
		<script src="<%=path%>/js/third-js/jquery/jquery-1.7.2.min.js" type="text/javascript"></script>
		<script src="<%=path%>/js/our-js/common.js" type="text/javascript"></script>
		<script src="<%=path%>/js/our-js/ec.util.js" type="text/javascript"></script>
		<script src="<%=path%>/js/third-js/jquery/zebra-dialog/zebra_dialog.src.js" type="text/javascript"></script>
		<script src="<%=path%>/js/our-js/ec.dialog.js" type="text/javascript"></script>
		<script type="text/javascript">
			var errorJson = <%=errorJson%>;
		</script>
		<script src="<%=path%>/js/busi-js/common/errorPage.js" type="text/javascript"></script>
	</head>
	<body>
		<!--内容-->
		<div class="main_div" style="margin-top: 70px">
		    <div class="main_content">
		    	<div class="m_top20">
		     		<div class="main_warp">
		                <div class="error_page" >
		                    <div   class="error_body">
		                        <div class="error_body_l">
		                        		<div class="error_img500"></div>
		                        </div>
		                        <div class="error_body_r">
		                            <h1>内部服务器错误</h1>
		                             <p class="line">HTTP 错误500 ：内部服务器错误,您要查找的资源有问题，无法显示。</p> 
<%
if (errorCode != null && !"".equals(errorCode)) {
%>
<p>异常编码：<%=errorCode%></p>
<%
}
%>
<%
if (errorMsg != null && !"".equals(errorMsg)) {
%>
<p><%=errorMsg%></p>
<%
}
%>
		                             <p>☉ 可能原因：</p>
		                             <ul>
		                                 <li>系统正进行维护中。</li>
		                                 <li>系统内部程序问题，请与网站管理员联系。</li>
		                             </ul>
		                             <p>☉  您可以：</p>
		                             <ul>
		                                 <li><a href="javascript:void(0);" onclick="javascript:window.location.reload(true)">刷新</a>页面。</li>
		                                 <li>单击 <a href="javascript:void(0);" onclick="javascript:ec.util.back();">后退</a> 链接，尝试返回上一页。</li>
		                             </ul>
		                        </div>
		                    </div>
		                </div>
		            </div>
		        </div>  
		    </div>  
		</div>
		<!--内容 end-->
	</body>
</html>