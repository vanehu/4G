<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.QueryBalanceRsp?exists>
		<#if SvcCont.QueryBalanceRsp.ServiceResultCode=='0'>			
			<code>POR-0000</code>
			<message>成功，请求流水号为[${TcpCont.TransactionID}]</message>
			<MID>${TcpCont.Response.RspDesc}</MID>
		<#else>
			<code>POR-2004</code>
			<message>错误编码[${SvcCont.QueryBalanceRsp.ServiceResultCode}]，错误描述[${SvcCont.QueryBalanceRsp.ParaFieldResult}],请求流水号为[${TcpCont.TransactionID}]</message>
			<MID>${TcpCont.Response.RspDesc}</MID>		
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>		
	</#if>	

	<#if SvcCont?exists>
	<balanceInfo>
		<totalBalanceAvailable>${SvcCont.QueryBalanceRsp.TotalBalanceAvailable}</totalBalanceAvailable>
		
		<#if SvcCont.QueryBalanceRsp.BalanceInformation?exists>
		<#list SvcCont.QueryBalanceRsp.BalanceInformation.BalanceItemDetail as item>
		<balanceItemDetail type = 'list'>
			<balanceItemTypeDetail>${item.BalanceItemTypeDetail}</balanceItemTypeDetail>
			<unitTypeId>${item.UnitTypeId}</unitTypeId>
			<balanceAmount>${item.BalanceAmount}</balanceAmount>
			<balanceAvailable>${item.BalanceAvailable}</balanceAvailable>
			<balanceUsed>${item.BalanceUsed}</balanceUsed>
			<balanceReserved>${item.BalanceReserved}</balanceReserved>
			<effDate>${datetime(item.EffDate)}</effDate>
			<expDate>${datetime(item.ExpDate)}</expDate>	
		</balanceItemDetail>
        </#list>  	
        </#if>	
	</balanceInfo>						
	</#if>		
</result>


