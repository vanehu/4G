<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
		<message>成功，CSB流水号为${TcpCont.TransactionID+","+TcpCont.Response.RspDesc}</message>		
	<#else>
		<code>POR-2004</code>
		<message>返回错误，CSB流水号为${TcpCont.TransactionID},错误信息为：${SvcCont}</message>		
	</#if>	
</result>