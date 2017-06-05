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
		<voiceInfo type = 'list'>
			<callStartTime>${item.通话开始时间}</callStartTime>
			<callDur>${item["通话时长(秒)"]}</callDur>
			<callType>${item["呼叫类型"]}</callType>
			<zoneType>${item["通话类型"]}</zoneType>
			<otherPartyNum>${item["对方号码"]}</otherPartyNum>
			<basicFee>${item["基本通话费(元)"]}</basicFee>	
			<tollFee>${item["长途通话费(元)"]}</tollFee>
			<totalFee>${item["费用(元)"]}</totalFee>
		</voiceInfo>
        </#list>  		
	</billInfo>	
</result>

