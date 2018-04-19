<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css-pub/system/css/main.css"/>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css-pub/artDialog/simple.css"/>
<script type="text/javascript">
	var contextPath = "${pageContext.request.contextPath}";
</script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/jquery/jquery-1.5.2.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/jquery/jquery.artDialog.source.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/json/json2.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/json/jsonpath-0.8.0.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/ligerUI/ligerui.min.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/common/serviceClient.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/common/combox.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/common/tools.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/common/loadmask.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/service/service.js"></script>

<title>平台管理</title>
</head>
<body>
<div class="menu-path">
	<span style="color:#727272">当前位置：服务平台管理</span> &gt; <span style="color:#727272">服务配置</span> &gt; 服务管理
</div>

<div class="l-form" id="service_view">
	<div class="yy">
		<div class="box" >
			<div id="toolbar"></div>
			<div id="maingrid"></div>
		</div>
		<span style="color:#727272">服务详细信息：</span>
		<div class="l-form l-group-bg" id="portal_edit_page">
			<table width="100%" cellspacing="0" cellpadding="4" border="0">
			<tbody>
				<tr>
					<td width="10%" align="right"><label>服务名称：</label></td>
					<td width="30%" align="left" id="serviceName"></td>
					<td width="2%">&nbsp;</td>
					<td width="10%" align="right" ><label>服务类路径：</label></td>
					<td width="48%" align="left" id="classPath"></td>
				</tr>
				<tr>
					<td align="right"><label>服务包名称：</label></td>
					<td align="left" id="packName"></td>
					<td >&nbsp;</td>
					<td align="right"><label>服务包编码：</label></td>
					<td align="left" id="packCode"></td>
				</tr>
				<tr>
					<td align="right"><label>服务包路径：</label></td>
					<td align="left" id="packPath"></td>
					<td>&nbsp;</td>
					<td align="right"><label>接口地址名称：</label></td>
					<td align="left" id="intfName"></td>
				</tr>
				<tr>
				    <td align="right"><label>输出参数类型：</label></td>
					<td align="left" id="outParamType"></td>
					<td>&nbsp;</td>
					<td align="right"><label>接口地址：</label></td>
					<td align="left" id="intfUrl"></td>
				</tr>
				<tr>
				    <td align="right"><label>角色名称：</label></td>
					<td align="left" colspan="3" id="roleName"></td>
				</tr>
			</tbody>
		</table>
		</div>
	</div>
</div>

</body>
</html>