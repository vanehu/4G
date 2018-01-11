<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
		<message>成功，请求流水号为[${TcpCont.TransactionID}]</message>
	<#else>
		<code>POR-2004</code>
		<message>
			RspCode[${TcpCont.Response.RspCode}]，请求流水号为[${TcpCont.TransactionID}]
			<#if TcpCont.Response.RspDesc?exists>
				，RspDesc[${TcpCont.Response.RspDesc}]
			</#if>
		</message>
	</#if>
	<#if SvcCont?exists>
		<SvcCont>
			<#if SvcCont.Service_Information?exists>
			    <Service_Information>
			        <Service_Result_Code>${SvcCont.Service_Information.Service_Result_Code}</Service_Result_Code>
			        <Para_Field_Result>${SvcCont.Service_Information.Para_Field_Result}</Para_Field_Result>
			        <PaymentFlag>${SvcCont.Service_Information.PaymentFlag}</PaymentFlag>
					<Total_Balance_Available>${SvcCont.Service_Information.Total_Balance_Available}</Total_Balance_Available>
					<#if SvcCont.Service_Information.Balance_Information?exists>
						<Balance_Information>
							<BalanceTypeFlag>${SvcCont.Service_Information.Balance_Information.BalanceTypeFlag}</BalanceTypeFlag>
							<Balance_Available>${SvcCont.Service_Information.Balance_Information.Balance_Available}</Balance_Available>
						</Balance_Information>
			        </#if>
			    </Service_Information>
			</#if>
		</SvcCont>
	</#if>	
</result>


