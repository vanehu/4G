<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
		<MID>${TcpCont.Response.RspDesc}</MID>
	<#else>
		<code>POR-2004</code>
		<MID>${TcpCont.Response.RspDesc}</MID>
	</#if>	
	<message>CSB流水号为${TcpCont.TransactionID+","+TcpCont.Response.RspDesc}</message>
	
	<billInfo>
		<sumCharge>${sumCharge}</sumCharge>
		<totalRecordCount>${count}</totalRecordCount><!--计费支持分页前用的总记录数，现为当前页记录数-->
		<totalRecords>${totalRecords}</totalRecords><!--总记录数，仅当查询第一页时返回-->
		<#list list as item>
		<spInfo type = 'list'>
			<spServiceName>${item["业务名称"]}</spServiceName>
			<spCode>${item["提供商代码"]}</spCode>
			<eventTime>${item["订购时间"]}</eventTime>
			<basicFee>${item["费用(元)"]}</basicFee>
		</spInfo>
        </#list>  		
	</billInfo>	
</result>

