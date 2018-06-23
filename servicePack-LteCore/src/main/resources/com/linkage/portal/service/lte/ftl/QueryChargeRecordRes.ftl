<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
	<#else>
		<code>POR-2004</code>
	</#if>	
	<message>CSB流水号为${TcpCont.TransactionID+","+TcpCont.Response.RspDesc}</message>

	<#if SvcCont?exists>
	<#if SvcCont.PaymentRecQueryRsp?exists>
	<#list SvcCont.PaymentRecQueryRsp as rspItem>
	<paymentRecQueryRsp type = 'list'>
		<serviceResultCode>${rspItem.ServiceResultCode}</serviceResultCode>
		<paraFieldResult>${rspItem.ParaFieldResult}</paraFieldResult>
		<staffCode>${rspItem.Staff_Code}</staffCode>
		<channelName>${rspItem.Channel_Name}</channelName>
		<chargeGroupId>${rspItem.ChargeGroupId}</chargeGroupId>
		<#if rspItem.PaymentRecordInfo?exists>
		<#list rspItem.PaymentRecordInfo as infoItem>
		<paymentRecordInfo type = 'list'>
			<accNbr>${infoItem.AccNbr}</accNbr>
			<MID>${infoItem.MID}</MID>
			<paidTime>${infoItem.PaidTime}</paidTime>
			<paymentAmount>${infoItem.PaymentAmount}</paymentAmount>
			<paymentMethod>${infoItem.PaymentMethod}</paymentMethod>
			<reqSerial>${infoItem.ReqSerial}</reqSerial>
			<status>${infoItem.Status}</status>
			<tranId_FromCsb>${infoItem.TranId_FromCsb}</tranId_FromCsb>
			<tranId_ToCsb>${infoItem.TranId_ToCsb}</tranId_ToCsb>
		</paymentRecordInfo>
		</#list>
		</#if>
	</paymentRecQueryRsp>
    </#list>
    </#if>
	</#if>
</result>

