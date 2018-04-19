<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
	<#else>
		<code>POR-2004</code>
	</#if>	
	<message>${TcpCont.Response.RspDesc}</message>
	
	<#if SvcCont?exists>
	<result>
		<#list SvcCont.QueryWriteOffPaymentRsp.Write_Off_Information as item>
		<writeOffInfomation type = 'list'>
		<billSerialNbr>${item.Bill_Serial_Nbr}</billSerialNbr>
		<paymentSerialNbr>${item.Payment_Serial_Nbr}</paymentSerialNbr>
		<#list item.Billing_Cycle_Group as item2>
		<billingCycleGroup type = 'list'>
			<billingCycleId>${item2.Billing_Cycle_ID}</billingCycleId>
		</billingCycleGroup>
		</#list>  	
		<sumCharge>${item.Sum_Charge}</sumCharge>
		<previousCharge>${item.Previous_Change}</previousCharge>
		<currentCharge>${item.Current_Change}</currentCharge>	
		</writeOffInfomation>
		</#list>
	</result>	
	</#if>
</result>


