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
		<PaymentRecQueryReq>
			<qryType>${qryType}</qryType>
			<AccNbr>${accNbr}</AccNbr>
			<ReqSerial>${reqSerial}</ReqSerial>
			<ChargeGroupId>${chargeGroupId}</ChargeGroupId>
			<Status>${olStatus}</Status>
			<qryFromTime>${qryFromTime}</qryFromTime>
			<qryEndTime>${qryEndTime}</qryEndTime>
			<DestinationAttr>2</DestinationAttr>
			<MvnoId>${ownerId}</MvnoId>
		</PaymentRecQueryReq>
	</SvcCont>
</ContractRoot>
