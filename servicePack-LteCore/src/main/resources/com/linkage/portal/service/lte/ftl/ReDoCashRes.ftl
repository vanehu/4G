<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if RechargeRefundRsp?exists>
	<#if RechargeRefundRsp.VC_Information?exists>
	<#if RechargeRefundRsp.VC_Information.Service_Result_Code=='0'>			
		<code>POR-0000</code>
		<message>成功,CSB流水号为${TransactionID}</message>
	<#else>
		<code>POR-2004</code>
		<message>错误编码[${RechargeRefundRsp.VC_Information.Service_Result_Code}]，错误描述[${RechargeRefundRsp.VC_Information.Para_Field_Result}],请求流水号为[${TransactionID}]</message>	
	</#if>	
	<#else>
		<code>POR-2004</code>
		<message>错误编码[],错误描述[${RechargeRefundRsp}],请求流水号为[${TransactionID}]</message>
	</#if>	
	</#if>
</result>