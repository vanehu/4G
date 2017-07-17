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
		<#if SvcCont.Service_Information?exists>
			<SvcCont>
			    <Service_Information>
			        <Service_Result_Code>${SvcCont.Service_Information.Service_Result_Code}</Service_Result_Code>
			        <Para_Field_Result>${SvcCont.Service_Information.Para_Field_Result}</Para_Field_Result>
			        <#if SvcCont.Service_Information.Bill_Query_Information?exists>
				        <Bill_Query_Information>
				            <Acct_ID>${SvcCont.Service_Information.Bill_Query_Information.Acct_ID}</Acct_ID>
				            <Acc_Nbr>${SvcCont.Service_Information.Bill_Query_Information.Acc_Nbr}</Acc_Nbr>
				            <#if SvcCont.Service_Information.Bill_Query_Information.Fee_Billing_Cycle?exists>
					            <Fee_Billing_Cycle>
					                <Billing_Cycle_ID>${SvcCont.Service_Information.Bill_Query_Information.Fee_Billing_Cycle.Billing_Cycle_ID}</Billing_Cycle_ID>
					                <#if SvcCont.Service_Information.Bill_Query_Information.Fee_Billing_Cycle.Acct_Item_Group?exists>
						                <Acct_Item_Group>
						                    <Acct_Item_Group_Id>${SvcCont.Service_Information.Bill_Query_Information.Fee_Billing_Cycle.Acct_Item_Group.Acct_Item_Group_Id}</Acct_Item_Group_Id>
						                    <#if SvcCont.Service_Information.Bill_Query_Information.Fee_Billing_Cycle.Acct_Item_Group.Acct_Item_Type?exists>
							                    <Acct_Item_Type>
							                        <Acct_Item_Type_Name>${SvcCont.Service_Information.Bill_Query_Information.Fee_Billing_Cycle.Acct_Item_Group.Acct_Item_Type.Acct_Item_Type_Name}</Acct_Item_Type_Name>
							                        <Acct_Item_Charge>${SvcCont.Service_Information.Bill_Query_Information.Fee_Billing_Cycle.Acct_Item_Group.Acct_Item_Type.Acct_Item_Charge}</Acct_Item_Charge>
							                    </Acct_Item_Type>
						                    </#if>
						                </Acct_Item_Group>
					                </#if>    
					            </Fee_Billing_Cycle>
				            </#if>
				            <Charge_Payed>${SvcCont.Service_Information.Bill_Query_Information.Charge_Payed}</Charge_Payed>
				            <Sum_Charge>${SvcCont.Service_Information.Bill_Query_Information.Sum_Charge}</Sum_Charge>
				        </Bill_Query_Information>
			        </#if>
			    </Service_Information>
			</SvcCont>
		</#if>
	</#if>	
</result>


