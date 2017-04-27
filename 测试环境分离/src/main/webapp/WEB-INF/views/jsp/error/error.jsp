<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
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
		<META name="keywords" content="电信集团,代理商,Agent">
		<META name="description" content="电信集团,代理商,Agent">
		<link rel="Shortcut Icon" href="<%=path%>/image/favicon.ico"/>
		<link href="<%=path%>/css/default/common.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/css/default/reset.css" rel="stylesheet" media="screen" type="text/css" />
		<link href="<%=path%>/css/default/style.css" rel="stylesheet" media="screen" type="text/css" />
		<script src="<%=path%>/js/third-js/jquery/jquery-1.7.2.min.js" type="text/javascript"></script>
		<script src="<%=path%>/js/our-js/common.js" type="text/javascript"></script>
		<script type="text/javascript">var contextPath = '<%=path %>'</script>
		<script src="<%=path%>/js/our-js/ec.util.js" type="text/javascript"></script>
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
		                        		<div class="error_img"></div>
		                        </div>
		                        <div class="error_body_r">
		                            <h1>内部服务器错误</h1>
		                             <p class="line">HTTP 错误500 ：内部服务器错误,您要查找的资源有问题，无法显示。</p> 
		                             <p>☉ 可能原因：</p>
		                             <ul>
		                                 <li>系统正进行维护中。</li>
		                                 <li>系统内部程序问题，请与网站管理员联系。</li>
		                             </ul>
		                             <p>☉  您可以：</p>
		                             <ul>
		                                 <li><a href="javascript:void(0);" onclick="javascript:window.location.reload(true)"><font class="f_red">刷新</font></a>页面。</li>
		                                 <li>单击 <a href="javascript:void(0);" onclick="javascript:ec.util.back();"><font class="f_red">后退</font></a> 链接，尝试返回上一页。</li>
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