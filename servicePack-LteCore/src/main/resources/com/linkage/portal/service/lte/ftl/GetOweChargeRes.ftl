<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspType == "0">
    	<#if SvcCont.BillQueryByAcctIDRsp?exists>
		<#if SvcCont.BillQueryByAcctIDRsp.ServiceResultCode=='0'>			
			<code>POR-0000</code>
			<message>成功，请求流水号为[${TcpCont.TransactionID}]</message>
			<MID>${TcpCont.Response.RspDesc}</MID>
		<#else>
			<code>POR-2004</code>
			<message>错误编码[${SvcCont.BillQueryByAcctIDRsp.ServiceResultCode}]，错误描述[${SvcCont.BillQueryByAcctIDRsp.ParaFieldResult}],请求流水号为[${TcpCont.TransactionID}]</message>
			<MID>${TcpCont.Response.RspDesc}</MID>		
		</#if>		
		</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${TcpCont.Response.RspCode}]，错误描述[${TcpCont.Response.RspDesc}],请求流水号为[${TcpCont.TransactionID}]</message>		
	</#if>
	
	<#if SvcCont?exists>
	<#if SvcCont.BillQueryByAcctIDRsp.BillQueryInformation?exists>
	<result>
		<acctId>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.AcctID}</acctId>
		<acctName>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.AcctName}</acctName>
		<accNbr>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.AccNbr}</accNbr>
		<due>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.Due}</due>
		<derateDue>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.DerateDue}</derateDue>
		<validBalance>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.ValidBalance}</validBalance>
		<shouldCharge>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.ShoulldCharge}</shouldCharge>
		<previousChange>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.PreviousChange}</previousChange>
		<currentChange>${SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.CurrentChange}</currentChange>
		<#list SvcCont.BillQueryByAcctIDRsp.BillQueryInformation.FeeBillingCycleInfo as item>
		<feeBillingCycle type = 'list'>
			<billingCycleId>${item.BillingCycleID}</billingCycleId>
			<#list item.AcctItemGroup as item2>
			<acctItemGroup type = 'list'>
				<acctItemGroupId>${item2.AcctItemGroupId}</acctItemGroupId>
				<#list item2.AcctItemType as item3>
				<acctItemType type = 'list'>
					<acctItemTypeName>${item3.AcctItemTypeName}</acctItemTypeName>
					<acctItemCharge>${item3.AcctItemCharge}</acctItemCharge>
				</acctItemType>
				</#list>
			</acctItemGroup>
			</#list>
		</feeBillingCycle>
	    </#list>  	
	</result>   
	</#if>
	</#if>	
</result>


