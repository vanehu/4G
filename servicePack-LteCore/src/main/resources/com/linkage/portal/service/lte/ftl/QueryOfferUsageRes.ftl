<?xml version="1.0" encoding="UTF-8"?>
<result>

	<#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.RatableResourceQueryRsp?exists>
    	<#if SvcCont.RatableResourceQueryRsp.ServiceResultCode == "0">
			<code>POR-0000</code>
			<message>成功,CSB流水号为${TcpCont.TransactionID}</message>
			<MID>${TcpCont.Response.RspDesc}</MID>		
		<#else>
			<code>POR-2004</code>
			<message>返回错误,CSB流水号为${TcpCont.TransactionID},错误信息为：${SvcCont.RatableResourceQueryRsp.ParaFieldResult}</message>
			<MID>${TcpCont.Response.RspDesc}</MID>	
		</#if>
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>		
	</#if>	
	
	<#if SvcCont?exists>
	<offerUsageInfo>
		<#if SvcCont.RatableResourceQueryRsp.ProductOFInfo?exists>
		<#list SvcCont.RatableResourceQueryRsp.ProductOFInfo as item>
		<productOFInfo type = 'list'>
			<prodOffName>${item.ProdOffName}</prodOffName>
			<startDate>${datetime(item.BeginDate)}</startDate>
			<endDate>${datetime(item.EndDate)}</endDate>
			<#list item.RespondRatableQuery as itemAcc>
			<accuInfo type = 'list'>
				<ownerType>${itemAcc.OwnerType}</ownerType>
				<ownerID>${itemAcc.OwnerID}</ownerID>
				<accuRscID>${itemAcc.RatableResourceID}</accuRscID>
				<accuRscname>${itemAcc.RatableResourceName}</accuRscname>
				<startTime>${datetime(itemAcc.BeginTime)}</startTime>
				<endTime>${datetime(itemAcc.EndTime)}</endTime>
				<accuAmount>${itemAcc.AccuAmount}</accuAmount>
				<ratableAmount>${itemAcc.RatableAmount}</ratableAmount>
				<balanceAmount>${itemAcc.BalanceAmount}</balanceAmount>
				<unitTypeId>${itemAcc.UnitTypeId}</unitTypeId>
			</accuInfo>
	        </#list>
		</productOFInfo>
        </#list>
        </#if>
	</offerUsageInfo>
	</#if>
	
</result>

