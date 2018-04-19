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
	<#if SvcCont.Service_Information?exists>
	<#if SvcCont.Service_Information.Bill_Information?exists>
	<billInformation>
		<sumCharge>${SvcCont.Service_Information.Bill_Information.Sum_Charge}</sumCharge>	
		<acctName>${SvcCont.Service_Information.Bill_Information.Acct_Name}</acctName>
		<#list SvcCont.Service_Information.Bill_Information.Item_Information as item>
		<itemInformation type = 'list'>
			<showLevel>${item.Showlevel}</showLevel>
			<classId>${item.ClassId}</classId>
			<parentClassId>${item.ParentClassId}</parentClassId>
			<chargeTypeName>${item.Charge_Type_Name}</chargeTypeName>
			<charge>${item.Charge}</charge>		
		</itemInformation>
        </#list>  		
	</billInformation>	
	</#if>
	</#if>
	</#if>	
</result>

