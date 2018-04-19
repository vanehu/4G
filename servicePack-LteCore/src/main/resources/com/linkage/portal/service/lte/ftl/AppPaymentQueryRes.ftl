<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
		<message>${TcpCont.Response.RspDesc}，请求流水号为[${TcpCont.TransactionID}]</message>
	<#else>
		<code>POR-2004</code>
		<message>
			RspCode[${TcpCont.Response.RspCode}]，RspDesc[${TcpCont.Response.RspDesc}]，请求流水号为[${TcpCont.TransactionID}]
			<#if TcpCont.Response.errCode?exists>
				,errCode[${TcpCont.Response.errCode}]
			</#if>
			<#if TcpCont.Response.errDesc?exists>
				,errDesc[${TcpCont.Response.errDesc}]
			</#if>
		</message>		
	</#if>
	<#if SvcCont?exists>
		<#if SvcCont.PaymentRecQueryRsp?exists>
			<#list SvcCont.PaymentRecQueryRsp as item>
				<PaymentRecQueryRsp type = 'list'>
					<ServiceResultCode>${item.ServiceResultCode}</ServiceResultCode>
					<ParaFieldResult/>
					<PaymentRecordInfo>
						<AccNbr>${item.PaymentRecordInfo.AccNbr}</AccNbr>
						<PaymentAmount>${item.PaymentRecordInfo.PaymentAmount}</PaymentAmount>
						<PaymentMethod>${item.PaymentRecordInfo.PaymentMethod}</PaymentMethod>
						<PaidTime>${item.PaymentRecordInfo.PaidTime}</PaidTime>
						<Status>${item.PaymentRecordInfo.Status}</Status>
						<ReqSerial>${item.PaymentRecordInfo.ReqSerial}</ReqSerial>
						<TranId_FromCsb>${item.PaymentRecordInfo.TranId_FromCsb}</TranId_FromCsb>
						<TranId_ToCsb>${item.PaymentRecordInfo.TranId_ToCsb}</TranId_ToCsb>
						<MID>${item.PaymentRecordInfo.MID}</MID>
					</PaymentRecordInfo>
				</PaymentRecQueryRsp>
			</#list>
		</#if>
	</#if>
</result>


