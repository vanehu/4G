<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/js/common/highlight/shCoreDefault.css"/>
<script type="text/javascript">
	var contextPath = "${pageContext.request.contextPath}";
</script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js-pub/jquery/jquery-1.5.2.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/common/highlight/shCore.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath}/js/common/highlight/shBrushXml.js"></script>
<script type="text/javascript">SyntaxHighlighter.all();</script>
</head>
<body>
	<div id="req_content" class="brush: xml;">${xml}</div>
</body>
</html>