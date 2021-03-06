<?xml version="1.0" encoding="UTF-8"?>
<ContractRoot>
	<TcpCont>
		<TransactionID>${TcpCont.TransactionID}</TransactionID>
		<ActionCode>${TcpCont.ActionCode}</ActionCode>
		<BusCode>BUS45002</BusCode>
        <ServiceCode>SVC45001</ServiceCode>
        <ServiceContractVer>SVC4500120131001</ServiceContractVer>
		<ServiceLevel>${TcpCont.ServiceLevel}</ServiceLevel>
		<SrcOrgID>${TcpCont.SrcOrgID}</SrcOrgID>
		<SrcSysID>1000000200</SrcSysID>
		<SrcSysSign>${TcpCont.SrcSysSign}</SrcSysSign>
		<DstOrgID>${TcpCont.DstOrgID}</DstOrgID>
		<DstSysID>1000000125</DstSysID>
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
					<sentContent>${message}</sentContent>
					<params>7B7D</params>
					<sysCode>001</sysCode>
					<flowCode>101110000001127</flowCode>
					<latnId>${areaId}</latnId>
					<sentType>SUB</sentType>
					<businessId>5487</businessId>
					<crtDate>${nowDateTime}</crtDate>
					<distributorID>105</distributorID>
					<createDespart>${channelName}</createDespart>
					<createStaff>${staffName}</createStaff>	
				</BillReqVo> 
			</ArrayOfBillReqVo>
		</BillInfo>
	</SvcCont>
</ContractRoot>
