<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
		<message>${TcpCont.Response.RspDesc}，请求流水号为[${TcpCont.TransactionID}]</message>
	<#else>
		<code>POR-2004</code>
		<message>
			RspCode[${TcpCont.Response.RspCode}]，RspDesc[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]
			<#if TcpCont.Response.errCode?exists>
				,errCode[${TcpCont.Response.errCode}]
			</#if>
			<#if TcpCont.Response.errDesc?exists>
				,errDesc[${TcpCont.Response.errDesc}]
			</#if>
		</message>		
	</#if>			
</result>


