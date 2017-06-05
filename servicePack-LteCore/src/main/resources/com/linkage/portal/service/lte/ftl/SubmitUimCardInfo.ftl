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
		<BusinessEvent>
			<SubmitInfo>
				<!--此处修改 号码-->
				<MDN>${submitInfo.phoneNumber}</MDN>
				<!--此处修改 IMSI -->
				<IMSI>${submitInfo.imsi}</IMSI>
				<!--此处修改 空卡序列号 -->
				<ICCSERIAL>${submitInfo.iccserial}</ICCSERIAL>
				<!--此处修改 ICCID -->
				<ICCID>${submitInfo.iccid}</ICCID>
				<ResultCode>${submitInfo.resultCode}</ResultCode>
				<ResultMessage>${submitInfo.resultMessage}</ResultMessage>
			</SubmitInfo>
		</BusinessEvent>
	</SvcCont>
</ContractRoot>