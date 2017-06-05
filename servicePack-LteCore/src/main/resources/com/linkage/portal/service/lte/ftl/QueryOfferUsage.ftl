<?xml version="1.0" encoding="UTF-8"?>
<ContractRoot>
	<TcpCont>
		<TransactionID>${TcpCont.TransactionID}</TransactionID>
		<ActionCode>${TcpCont.ActionCode}</ActionCode>
		<BusCode>BUS61004</BusCode>
		<!--具体的服务编码-->
		<ServiceCode>SVC83009</ServiceCode>
		<!--协议当前使用的版本号-->
		<ServiceContractVer>SVC8300920131028</ServiceContractVer>
		<ServiceLevel>${TcpCont.ServiceLevel}</ServiceLevel>
		<SrcOrgID>${TcpCont.SrcOrgID}</SrcOrgID>
		<SrcSysID>${TcpCont.SrcSysID}</SrcSysID>
		<SrcSysSign>123</SrcSysSign>
		<DstOrgID>100000</DstOrgID>
		<DstSysID>1000000203</DstSysID>
		<ReqTime>${TcpCont.ReqTime}</ReqTime>
	</TcpCont>
	<SvcCont>
		<RatableResourceQueryReq>
			<BillInformation>
				<AccNbr>${phoneNumber}</AccNbr>
				<DestinationAttr>2</DestinationAttr>
				<BillingCycle>${billingCycle}</BillingCycle>
			</BillInformation>
			<MvnoId>${ownerId}</MvnoId>
		</RatableResourceQueryReq>	
	</SvcCont>
</ContractRoot>
