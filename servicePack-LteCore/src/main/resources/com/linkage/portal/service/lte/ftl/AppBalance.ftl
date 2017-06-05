<?xml version="1.0" encoding="UTF-8"?>
<ContractRoot>
	<TcpCont>
		<AppKey>1000000244</AppKey>
		<Method>billing.queryBalance</Method>
		<TransactionID>${TcpCont.TransactionID}</TransactionID>
		<ReqTime>${TcpCont.ReqTime}</ReqTime>
		<Sign>|sign|</Sign>
		<Version>V1.0</Version>
	</TcpCont>
	<SvcCont>
		<Service_Information>
			<Balance_Information>
				<Destination_Id>${destinationId}</Destination_Id>
				<Destination_Id_Type>${destinationIdType}</Destination_Id_Type>
				<Destination_Attr>${destinationAttr}</Destination_Attr>
				<AreaCode>${areaCode}</AreaCode>
				<Query_Flag>${queryFlag}</Query_Flag>
				<Query_Item_Type>${queryItemType}</Query_Item_Type>
				<ProvinceID>${provinceId}</ProvinceID>
			</Balance_Information>
		</Service_Information>
	</SvcCont>
</ContractRoot>
