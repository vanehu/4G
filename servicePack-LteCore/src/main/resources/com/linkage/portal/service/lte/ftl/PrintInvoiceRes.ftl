<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.InvoicePrintPaymentRsq?exists>
		<#if SvcCont.InvoicePrintPaymentRsq.Service_Result_Code=='0'>			
			<code>POR-0000</code>
			<message>成功，CSB流水号为${TcpCont.TransactionID}</message>
		<#else>
			<code>POR-2004</code>
			<message>返回错误，CSB流水号为${TcpCont.TransactionID},错误信息为：${SvcCont.InvoicePrintPaymentRsq.Para_Field_Result}</message>		
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>返回错误，CSB流水号为${TcpCont.TransactionID},错误信息为：${TcpCont.Response.RspDesc}</message>		
	</#if>	

    <#if SvcCont?exists>
    
	<#if SvcCont.InvoicePrintPaymentRsq?exists>
	<result>
	     <count>${SvcCont.InvoicePrintPaymentRsq.Invoice_Print_Count}</count>
	     <#if SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information?exists>
		   		<accId>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Acct_ID}</accId>	
				<acctName>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Acct_Name}</acctName>	
				<accNbr>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Acc_Nbr}</accNbr>	
				<billSerialNbr>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Bill_Serial_Nbr}</billSerialNbr>
				<paymentSerialNbr>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Payment_Serial_Nbr}</paymentSerialNbr>
				<#list SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Billing_Cycle_Group as item>
				   <billingCycleGroup type = 'list'>		
				        <billingCycleId>${item.Billing_Cycle_ID}</billingCycleId>
					    <#list item.Bill_Item_Detail as item2>
						     <invioceItemDetail type = 'list'>
					    	        <invoiceItemName>${item2.Bill_Item_Name}</invoiceItemName>
					    	        <invoiceItemMoney>${item2.Invioce_Item_Money}</invoiceItemMoney>
					    	 </invioceItemDetail>
				    	 </#list>
					</billingCycleGroup>
				</#list>
				<sumCharge>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Sum_Charge}</sumCharge>
				<previousChange>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Previous_Change}</previousChange>
				<currentChange>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Current_Change}</currentChange>
				<balance>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Balance}</balance>
				<paymentAmount>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Payment_Amount}</paymentAmount>
				<shouldCharge>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Should_Charge}</shouldCharge>
				
				<staffId>${SvcCont.InvoicePrintPaymentRsq.InvoicePrint_Information.Channel_Staff_Id}</staffId>
				
		</#if>
	</result>
	</#if>		
	</#if>	
</result>


