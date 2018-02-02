<%@ page language="java" pageEncoding="GB18030"%>

<html>
	<head>
		<title>应用检测Sniffer</title>
		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="Content-Type" content="text/html; charset=GB18030" />
		<meta http-equiv="refresh" content="60">
		<style type="text/css">
			body,a,table,td,th,input,textarea,button,select{ font: 12px/16px Verdana,"宋体",sans-serif;}
			.btn {
				BORDER-RIGHT: #7b9ebd 1px solid; PADDING-RIGHT: 2px; BORDER-TOP: #7b9ebd 1px solid; PADDING-LEFT: 2px; FONT-SIZE: 16px; font-weight :bold;FILTER: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=#ffffff, EndColorStr=#cecfde); BORDER-LEFT: #7b9ebd 1px solid; CURSOR: hand; COLOR: black; PADDING-TOP: 2px; BORDER-BOTTOM: #7b9ebd 1px solid
			}
			.title_span {
				font-size: 17; font-weight: bold;
			}
		</style>
	</head>
	<body bgcolor="white">
		<div style="width: 100%; height: 25px;"><span class="title_span" style="margin-right: 30px;">应用及数据库状态侦测</span>
			<button class="btn" onclick="window.location.reload();">检测应用</button><p/>
		</div>
		<hr/><br/>
		<span class="title_span">状态:</span><br/>
		<%
			out.print("<br/>当前页面正常。<br/>");
		%>
		<p></p>
		<hr/>
	</body>
</html>


