<?xml version="1.0" encoding="UTF-8"?>
<ContractRoot>
	<TcpCont>
		<AppKey>1000000244</AppKey>
		<Method>recharge.rechargeQuery</Method>
		<TransactionID>${TcpCont.TransactionID}</TransactionID>
		<ReqTime>${TcpCont.ReqTime}</ReqTime>
		<Sign>|sign|</Sign>
		<Version>V1.2</Version>
	</TcpCont>
	<SvcCont>
		<#if qryType == "1">
			<qryType>${qryType}</qryType>
			<Req_Serial>${reqSerial}</Req_Serial>
		</#if>
		<#if qryType == "2">
			<qryType>${qryType}</qryType>
			<AccNbr>${accNbr}</AccNbr>
			<qryFromTime>${qryFromTime}</qryFromTime>
			<qryEndTime>${qryEndTime}</qryEndTime>
		</#if>
	</SvcCont>
</ContractRoot>
