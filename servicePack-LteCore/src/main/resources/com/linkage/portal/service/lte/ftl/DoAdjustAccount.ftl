<?xml version="1.0" encoding="UTF-8"?>
<ContractRoot>
	<TcpCont>
		<TransactionID>${TcpCont.TransactionID}</TransactionID>
		<ActionCode>${TcpCont.ActionCode}</ActionCode>
		<BusCode>${TcpCont.BusCode}</BusCode>
        <ServiceCode>${TcpCont.ServiceCode}</ServiceCode>
        <ServiceContractVer>${TcpCont.ServiceContractVer}</ServiceContractVer>
		<ServiceLevel>${TcpCont.ServiceLevel}</ServiceLevel>
		<SrcOrgID>${TcpCont.SrcOrgID}</SrcOrgID>
		<SrcSysID>${TcpCont.SrcSysID}</SrcSysID>
		<SrcSysSign>${TcpCont.SrcSysSign}</SrcSysSign>
		<DstOrgID>${TcpCont.DstOrgID}</DstOrgID>
		<DstSysID>${TcpCont.DstSysID}</DstSysID>
		<ReqTime>${TcpCont.ReqTime}</ReqTime>		
	</TcpCont>
	<SvcCont>
	  <#if adjustPaymentReqs?exists>
	   <#list adjustPaymentReqs as item>
	       <AdjustPaymentReq>
				    <Operate_Seq>${TcpCont.TransactionID}</Operate_Seq>
				    <Oper_Date>${TcpCont.ReqTime}</Oper_Date>
				    <SpDescription>${item.spDescription}</SpDescription>
				     <Billing_Cycle_ID>${item.billingCycleId}</Billing_Cycle_ID>
				    <Channel_Staff_Id>[${channelId}]${staffId}</Channel_Staff_Id>
				    <Acct_ID>${item.acctID}</Acct_ID>
				    <Serv_Id>${item.servId}</Serv_Id>
				    <Acc_Nbr>${item.accNbr}</Acc_Nbr>
				    <#list item.billItemDetails as item2>
						<Item_Information>
							<Acct_Item_Type_Id>${item2.acctItemTypeId}</Acct_Item_Type_Id>
							<Item_Source_Id>${item2.itemSourceId}</Item_Source_Id>
							<Acct_Item_Charge>${item2.acctItemCharge}</Acct_Item_Charge>
						</Item_Information>
					 </#list>
					<Mvno_Id>${ownerId}</Mvno_Id>
			</AdjustPaymentReq>
		</#list>
	</SvcCont>
	</#if>
</ContractRoot>
