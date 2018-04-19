<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.InvoiceReverseRsp?exists>
			<#if SvcCont.InvoiceReverseRsp.Service_Result_Code=='0'>			
				<code>POR-0000</code>
				<message>接口调用成功，CSB流水号为${TcpCont.TransactionID}</message>
			<#else>
				<code>POR-2004</code>
				<message>接口调用成功，返回错误信息：CSB流水号为${TcpCont.TransactionID},返回的错误编码为：${SvcCont.InvoiceReverseRsp.Service_Result_Code},错误信息为：${SvcCont.InvoiceReverseRsp.Para_Field_Result}</message>		
			</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>接口调用失败，返回错误信息：CSB流水号为${TcpCont.TransactionID},错误编码：${TcpCont.Response.RspCode},错误信息为：${TcpCont.Response.RspDesc}</message>		
	</#if>	
</result>

