<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css-pub/system/css/main.css"/>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css-pub/artDialog/simple.css"/>
<link type="text/css" rel="stylesheet" href="${pageContext.request.contextPath}/js/common/highlight/styles/shCoreDefault.css"/>
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
<script type="text/javascript" src="${pageContext.request.contextPath}/js/common/highlight/scripts/shCore.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/common/highlight/scripts/shBrushJScript.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/common/highlight/scripts/shBrushXml.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/service/wsdl.js"></script>

<title>平台管理</title>
</head>
<body>
<div class="menu-path">
	<span style="color:#727272">当前位置：服务平台管理</span> &gt; <span style="color:#727272">服务配置</span> &gt; WSDL解析
</div>

<div class="l-form" id="service_view">
	<div class="yy">
		<span style="color:#727272">&nbsp;</span>
		<div class="l-form l-group-bg" id="portal_edit_page">
			<table width="100%" cellspacing="0" cellpadding="4" border="0">
			<tbody>
				<tr>
					<td width="15%" align="right"><label>*WSDL地址：</label></td>
					<td width="70%">
						<input style="max-width: 590px"  type="text" maxlength="100" value="" id="wsdl_url">
					</td>
					<td width="15%" align="left">
						<input type="button" onclick="Wsdl.f_query()" class="l-button l-button-submit" id="btnQuery" value="查      询">
					</td>
				</tr>
				<tr>
					<td width="15%" align="right"><label>接口列表：</label></td>
					<td width="70%">
						<select id="wsdl_operation" onchange="Wsdl.f_select()" style="width: 500px">
						</select>
						<label id="wsdl_operation_selected"></label>
					</td>
					<td width="15%" align="left">
						<input type="button" onclick="Wsdl.f_call()" class="l-button l-button-submit" id="btnQuery" value="调     用 ">
					</td>
				</tr>
				<tr>
					<td colspan="3" id="code_pre">
						
					</td>
			</tbody>
			</table>
		</div>
	</div>
</div>

</body>
</html>