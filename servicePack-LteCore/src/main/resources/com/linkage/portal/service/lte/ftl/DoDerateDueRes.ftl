<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.OverDueInPaymentRsp?exists>
		<#if SvcCont.OverDueInPaymentRsp.Service_Result_Code=='0'>			
			<code>POR-0000</code>
			<message>成功，请求流水号为[${TcpCont.TransactionID}]</message>
			<MID>${TcpCont.Response.RspDesc}</MID>
		<#else>
			<code>POR-2004</code>
			<message>错误编码[${SvcCont.OverDueInPaymentRsp.Service_Result_Code}]，错误描述[${SvcCont.OverDueInPaymentRsp.Para_Field_Result}],请求流水号为[${TcpCont.TransactionID}]</message>
            <MID>${TcpCont.Response.RspDesc}</MID>      
        </#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message> 
	</#if>	
</result>


