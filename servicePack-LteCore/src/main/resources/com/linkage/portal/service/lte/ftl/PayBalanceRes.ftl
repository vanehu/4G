<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.BalDrawBalanceRsp?exists>
		<#if SvcCont.BalDrawBalanceRsp.Service_Result_Code=='0'>			
			<code>POR-0000</code>
			<message>成功，CSB流水号为${TcpCont.TransactionID}</message>
		<#else>
			<code>POR-2004</code>
			<message>错误编码[${SvcCont.BalDrawBalanceRsp.Service_Result_Code}]，错误描述[${SvcCont.BalDrawBalanceRsp.Para_Field_Result}],请求流水号为[${TcpCont.TransactionID}]</message>		
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>		
	</#if>
	
	
	<#if SvcCont?exists>
	<balanceInfo>
		<sumCharge>${SvcCont.BalDrawBalanceRsp.Balance_Amount}</sumCharge>	 		
	</balanceInfo>	
	</#if>
</result>


