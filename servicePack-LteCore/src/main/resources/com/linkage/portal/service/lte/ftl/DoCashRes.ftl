<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
	<#else>
		<code>POR-2004</code>
	</#if>	
	<message>CSB流水号为${TcpCont.TransactionID+","+TcpCont.Response.RspDesc}</message>	
	<reqSerial>${TcpCont.TransactionID}</reqSerial>
</result>


