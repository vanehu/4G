<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.QueryBalanceRsp?exists>
		<#if SvcCont.QueryBalanceRsp.ServiceResultCode=='0'>			
			<code>POR-0000</code>
			<message>成功，CSB流水号为${TcpCont.TransactionID}</message>
		<#else>
			<code>POR-2004</code>
			<message>充值鉴权失败，错误编码[${SvcCont.QueryBalanceRsp.ServiceResultCode}]，错误描述[${TcpCont.Response.RspDesc}]，鉴权流水号[${TcpCont.TransactionID}]</message>		
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>充值鉴权失败，错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}]，鉴权流水号[${TcpCont.TransactionID}]</message>		
	</#if>	
</result>
