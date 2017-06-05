<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.RatableResourceQueryRsp?exists>
    	<#if SvcCont.RatableResourceQueryRsp.Service_Result_Code == "0">
			<code>POR-0000</code>
			<message>成功,CSB流水号为${TcpCont.TransactionID}</message>
			<MID>${TcpCont.Response.RspDesc}</MID>		
		<#else>
			<code>POR-2004</code>
			<message>返回错误,CSB流水号为${TcpCont.TransactionID},错误信息为：${SvcCont.RatableResourceQueryRsp.Para_Field_Result}</message>
			<MID>${TcpCont.Response.RspDesc}</MID>	
		</#if>
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>		
	</#if>	
	
	<#if SvcCont?exists>
	<offerUsageInfo>
		<#if SvcCont.RatableResourceQueryRsp.Product_OFF_info?exists>
		<#list SvcCont.RatableResourceQueryRsp.Product_OFF_info as item>
		<productOFInfo type = 'list'>
			<prodOffName>${item.Product_OFF_Name}</prodOffName>
			<startDate>${datetime(item.Begin_Date)}</startDate>
			<endDate>${datetime(item.End_Date)}</endDate>
			<#list item.Respond_Ratable_Query as itemAcc>
			<accuInfo type = 'list'>
				<ownerType>${itemAcc.Owner_Type}</ownerType>
				<ownerID>${itemAcc.Owner_ID}</ownerID>
				<accuRscID>${itemAcc.Ratable_Resource_ID}</accuRscID>
				<accuRscname>${itemAcc.Ratable_Resource_name}</accuRscname>
				<startTime>${datetime(itemAcc.BeginTime)}</startTime>
				<endTime>${datetime(itemAcc.EndTime)}</endTime>
				<accuAmount>${itemAcc.Ratable_Amount}</accuAmount>
				<ratableAmount>${itemAcc.Balance_Amount}</ratableAmount>
				<balanceAmount>${itemAcc.Usage_Amount}</balanceAmount>
				<unitTypeId>${itemAcc.UnitType_Id}</unitTypeId>
			</accuInfo>
	        </#list>
		</productOFInfo>
        </#list>
        </#if>
	</offerUsageInfo>
	</#if>
	
</result>

