<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if Response.RspType == "0">
		<code>POR-0000</code>
		<message>${Response.RspDesc}</message>
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${Response.RspCode}],错误描述[${Response.RspDesc}],请求流水号为[${TransactionID}]</message>
	</#if>
	<reqSerial>${TransactionID}</reqSerial>
</result>


