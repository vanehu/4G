<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.InvoicePrinterRsp?exists>
		<#if SvcCont.InvoicePrinterRsp.Service_Result_Code=='0'>			
			<code>POR-0000</code>
			<message>接口调用成功，CSB流水号为${TcpCont.TransactionID}</message>
		<#else>
			<code>POR-2004</code>
			<message>接口调用成功，返回错误信息：CSB流水号为${TcpCont.TransactionID},返回的错误编码为：${SvcCont.InvoicePrinterRsp.Service_Result_Code},错误信息为：${SvcCont.InvoicePrinterRsp.Para_Field_Result}</message>		
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>接口调用失败，返回错误信息：CSB流水号为${TcpCont.TransactionID},错误信息为：${TcpCont.Response.RspDesc}</message>		
	</#if>	
    <#if SvcCont?exists>
	<#if SvcCont.InvoicePrinterRsp?exists>
	<result>
	     		<invoice_Print_Count>${SvcCont.InvoicePrinterRsp.Invoice_Print_Count}</invoice_Print_Count>
		   		<accId>${SvcCont.InvoicePrinterRsp.Acct_ID}</accId>	
				<acctName>${SvcCont.InvoicePrinterRsp.Acct_Name}</acctName>	
				<accNbr>${SvcCont.InvoicePrinterRsp.Acc_Nbr}</accNbr>	
				<invoiceId>${SvcCont.InvoicePrinterRsp.Invoice_Id}</invoiceId>
				<#list SvcCont.InvoicePrinterRsp.Vat_Item_Detail as item>
					<vat_Item_Detail type = 'list'>
						<vat_Item_Id>${item.Vat_Item_Id}</vat_Item_Id>
				        <vat_Item_Name>${item.Vat_Item_Name}</vat_Item_Name>
				        <vat_Item_Amount>${item.Vat_Item_Amount}</vat_Item_Amount>
				        <vat_Item_Rate_Money>${item.Vat_Item_Rate_Money}</vat_Item_Rate_Money>
				        <vat_Item_Rate>${item.Vat_Item_Rate}</vat_Item_Rate>
					</vat_Item_Detail>
				</#list>
	</result>
	</#if>		
	</#if>	
</result>


