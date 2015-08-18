<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.ReversePaymentRsp?exists>
		<#if SvcCont.ReversePaymentRsp.Service_Result_Code=='0'>			
			<code>POR-0000</code>
			<message>成功，CSB流水号为${TcpCont.TransactionID}</message>
		<#else>
			<code>POR-2004</code>
			<#if SvcCont.ReversePaymentRsp.Para_Field_Result?exists>
				<message>错误编码[${SvcCont.ReversePaymentRsp.Service_Result_Code}]，错误描述[${SvcCont.ReversePaymentRsp.Para_Field_Result}],请求流水号为[${TcpCont.TransactionID}]</message>		
			<#else>
				<message>错误编码[${SvcCont.ReversePaymentRsp.Service_Result_Code}]，错误描述[${SvcCont}],请求流水号为[${TcpCont.TransactionID}]</message>		
			</#if>
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>		
	</#if>
	
	<#if SvcCont?exists>
	<#if SvcCont.ReversePaymentRsp?exists>
	<#if SvcCont.ReversePaymentRsp.Reverse_Information?exists>
	<result>
		<reverseAmount>${SvcCont.ReversePaymentRsp.Reverse_Information.Reverse_Amount}</reverseAmount>	
		<reverseSerialNbr>${SvcCont.ReversePaymentRsp.Reverse_Information.Reverse_Serial_Nbr}</reverseSerialNbr>		
		<reverseDate>${datetime(SvcCont.ReversePaymentRsp.Reverse_Information.Reverse_Date)}</reverseDate>		
	</result>	
	</#if>	
	</#if>	
	</#if>	
</result>


