<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.WriteOffPaymentRsp?exists>
		<#if SvcCont.WriteOffPaymentRsp.Service_Result_Code=='0'>			
			<code>POR-0000</code>
			<message>成功，CSB流水号为${TcpCont.TransactionID}</message>
		<#else>
			<code>POR-2004</code>
			<message>错误编码[${SvcCont.WriteOffPaymentRsp.Service_Result_Code}]，错误描述[${SvcCont.WriteOffPaymentRsp.Para_Field_Result}],请求流水号为[${TcpCont.TransactionID}]</message>		
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>		
	</#if>	

	<#if SvcCont?exists>
	<#if SvcCont.WriteOffPaymentRsp?exists>
	<#if SvcCont.WriteOffPaymentRsp.Write_Off_Information?exists>
	<#if SvcCont.WriteOffPaymentRsp.Write_Off_Information.Bill_Serial_Nbr?exists>
	<result>
		<billSerialNbr>${SvcCont.WriteOffPaymentRsp.Write_Off_Information.Bill_Serial_Nbr}</billSerialNbr>
		<paymentSerialNbr>${SvcCont.WriteOffPaymentRsp.Write_Off_Information.Payment_Serial_Nbr}</paymentSerialNbr>
		<#list SvcCont.WriteOffPaymentRsp.Write_Off_Information.Billing_Cycle_Group as itm>		
		<billingCycleGroup  type = 'list'>
		    <billingCycleId>${itm.Billing_Cycle_ID}</billingCycleId>
		</billingCycleGroup>
		</#list>
		<sumCharge>${SvcCont.WriteOffPaymentRsp.Write_Off_Information.Sum_Charge}</sumCharge>
		<previousChange>${SvcCont.WriteOffPaymentRsp.Write_Off_Information.Previous_Change}</previousChange>
		<currentChange>${SvcCont.WriteOffPaymentRsp.Write_Off_Information.Current_Change}</currentChange>
		<#if SvcCont.WriteOffPaymentRsp.Write_Off_Information.Invioce_Information_Detail?exists>
		<invioceInformationDetail>
		<#list SvcCont.WriteOffPaymentRsp.Write_Off_Information.Invioce_Information_Detail.Fee_Billing_Cycle as item>		
	    	<feeBillingCycle type = 'list'>
	    	    <billingCycleId>${item.Billing_Cycle_ID}</billingCycleId>
				<#list item.Invioce_Item_Detail as item2>	    	    
	    	    <invioceItemDetail type = 'list'>
	    	        <invioceItemName>${item2.Invioce_Item_Name}</invioceItemName>
	    	        <invioceItemMoney>${item2.Invioce_Item_Money}</invioceItemMoney>
	    	    </invioceItemDetail>
	    	    </#list>
	    	</feeBillingCycle>
	    </#list>	    	
		</invioceInformationDetail>
		</#if>
	</result>
	</#if>			
	</#if>		
	</#if>	
	</#if>	
</result>


