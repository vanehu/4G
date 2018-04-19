<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page language="java" import="java.lang.*"%>
<%
String path = request.getContextPath();
Properties prop = System.getProperties();

String os = prop.getProperty("os.name");
%>
<!DOCTYPE html SYSTEM>
<html>
	<head>
		<meta charset="UTF-8"/>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>无法找到该页</title>
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
		<script src="<%=path%>/js/third-js/jquery/jquery-1.7.2.min.js" type="text/javascript"></script>
		<script src="<%=path%>/js/our-js/common.js" type="text/javascript"></script>
		<script src="<%=path%>/js/our-js/ec.util.js" type="text/javascript"></script>
	</head>
	<body>
		<!--内容-->
		<div class="main_div" style="margin-top: 70px">
		    <div class="main_content">
		    	<div class="m_top20">
		     		<div class="main_warp">
		                <div class="error_page" >
		                    <div class="error_body">
		                        <div class="error_body_l">
		                        		<div class="error_img"></div><div style="display: none;"><%=os %></div>
		                        </div>
		                        <div class="error_body_r">
		                            <h1>无法找到该页</h1>
		                             <p class="line">HTTP 错误 404：您正在搜索的页面可能已经删除、更名或暂时不可用。</p> 
		                             <p>☉  您可以：</p>
		                             <ul>
		                                 <li>确保浏览器的地址栏中显示的网站地址的拼写和格式正确无误。</li>
		                                 <li>如果通过单击链接而到达了该网页，请与网站管理员联系，通知他们该链接的格式不正确。</li>
		                                 <li>单击 <a href="javascript:void(0);" onclick="javascript:ec.util.back();"><font class="f_red">后退</font></a> 按钮尝试另一个链接。</li>
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