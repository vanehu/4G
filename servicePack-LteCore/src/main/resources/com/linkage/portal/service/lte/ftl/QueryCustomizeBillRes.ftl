<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
		<code>POR-0000</code>
		<message>成功,请求流水号为[${TcpCont.TransactionID}]</message>
		<MID>${TcpCont.Response.RspDesc}</MID>		
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>
		<MID>${TcpCont.Response.RspDesc}</MID>		
	</#if>	
	<#if SvcCont?exists>
	<#if SvcCont.CustomizeBillQueryRsp?exists>
	<#if SvcCont.CustomizeBillQueryRsp.BillInformation?exists>
	<billInformation>
		<sumCharge>${SvcCont.CustomizeBillQueryRsp.BillInformation.SumCharge}</sumCharge>	
		<acctName>${SvcCont.CustomizeBillQueryRsp.BillInformation.AcctName}</acctName>
		<#list SvcCont.CustomizeBillQueryRsp.BillInformation.ItemInformation as item>
		<itemInformation type = 'list'>
			<showLevel>${item.Showlevel}</showLevel>
			<classId>${item.ClassId}</classId>
			<parentClassId>${item.ParentClassId}</parentClassId>
			<chargeTypeName>${item.ChargeTypeName}</chargeTypeName>
			<charge>${item.Charge}</charge>		
		</itemInformation>
        </#list>  		
	</billInformation>	
	</#if>
	</#if>
	</#if>	
</result>

