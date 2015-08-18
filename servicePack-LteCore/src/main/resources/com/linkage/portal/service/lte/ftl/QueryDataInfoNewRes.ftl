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
		<dataInfo type = 'list'>
			<sessionStartTime>${item["上线日期"]}</sessionStartTime>
			<totalTime>${item["时长(秒)"]}</totalTime>
			<sessionEndTime>${item["结束日期"]}</sessionEndTime>
			<volumn>${item["合计流量"]}</volumn>
			<roamAreaCode>${item["上网地点"]}</roamAreaCode>
			<basicFee>${item["费用(元)"]}</basicFee>
		</dataInfo>
        </#list>
	</billInfo>	
</result>

