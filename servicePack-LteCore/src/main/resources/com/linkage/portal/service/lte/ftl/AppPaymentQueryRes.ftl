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
					<ServiceResultCode>${SvcCont.PaymentRecQueryRsp.ServiceResultCode}</ServiceResultCode>
					<ParaFieldResult/>
					<PaymentRecordInfo>
						<AccNbr>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.AccNbr}</AccNbr>
						<PaymentAmount>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.PaymentAmount}</PaymentAmount>
						<PaymentMethod>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.PaymentMethod}</PaymentMethod>
						<PaidTime>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.PaidTime}</PaidTime>
						<Status>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.Status}</Status>
						<ReqSerial>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.ReqSerial}</ReqSerial>
						<TranId_FromCsb>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.TranId_FromCsb}</TranId_FromCsb>
						<TranId_ToCsb>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.TranId_ToCsb}</TranId_ToCsb>
						<MID>${SvcCont.PaymentRecQueryRsp.PaymentRecordInfo.MID}</MID>
					</PaymentRecordInfo>
				</PaymentRecQueryRsp>
			</#list>
		</#if>
	</#if>
</result>


