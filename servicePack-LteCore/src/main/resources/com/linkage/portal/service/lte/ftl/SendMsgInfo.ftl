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
		<BillInfo>
			<UserVo>
				<passWord>18e0e5f3389efa0b31738c2fd44630d8</passWord>
				<userName>wsuser</userName>
				<sysCode>001</sysCode>
				<productId>123</productId>
			</UserVo>
			<ArrayOfBillReqVo>
				<BillReqVo>
					<beginDate></beginDate>
					<endDate></endDate>
					<beginHour></beginHour>
					<endHour></endHour>
					<channelType>1</channelType>
					<toTel>${phoneNumber}</toTel>
					<sentContent></sentContent>
					<params>${key}</params>
					<sysCode>001</sysCode>
					<flowCode>${TcpCont.TransactionID}</flowCode>
					<latnId>${areaId}</latnId>
					<sentType>SUB</sentType>
					<businessId>${businessId}</businessId>
					<crtDate>${nowDateTime}</crtDate>
					<distributorID>105</distributorID>
					<createDespart>${channelName}</createDespart>
					<createStaff>${staffName}</createStaff>	
				</BillReqVo> 
			</ArrayOfBillReqVo>
		</BillInfo>
	</SvcCont>
</ContractRoot>
