<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">    	
		<#if SvcCont?exists && SvcCont.MsgInfo?exists>
		<code>POR-0000</code>
		<message>成功,请求流水号为[${TcpCont.TransactionID}]</message>
    	<#list SvcCont.MsgInfo as item>
    	<msgInfo type = 'list'>
    		<seq>${item.Seq}</seq>
    		<msgType>${item.ReqOrRsp}</msgType>
    		<msgClob>${item.Msg?html}</msgClob>
    	</msgInfo>
    	</#list>
    	<#else>
    	<code>POR-2004</code>
    	<message>请求成功但未返回报文信息，本次查询流水[${TcpCont.TransactionID}]</message>
    	</#if>
    <#else>
    	<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>
	</#if>
</result>