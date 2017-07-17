<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
		<MID>${TcpCont.Response.RspDesc}</MID>
	<#else>
		<code>POR-2004</code>
		<MID>${TcpCont.Response.RspDesc}</MID>
	</#if>	
	<message>CSB流水号为${TcpCont.TransactionID+","+TcpCont.Response.RspDesc}</message>
	
	<#if SvcCont?exists>
	<recordInfo>
		<#list SvcCont.PaymentRecQueryRsp.PaymentRecordInfo as item>
		<paymentRecordInfo type = 'list'>
			<paymentAmount>${item.PaymentAmount}</paymentAmount>
			<paymentMethod>${item.PaymentMethod}</paymentMethod>
			<reqSerial>${item.Res_Serial}</reqSerial>
			<paidTime>${datetime(item.PaidTime)}</paidTime>
		</paymentRecordInfo>
        </#list>  		
	</recordInfo>	
	</#if>
</result>


