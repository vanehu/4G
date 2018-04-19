<?xml version="1.0" encoding="UTF-8"?>

<result>
	<#if TcpCont.Response.RspType=="0">
		<#if SvcCont?exists>
    		<#if SvcCont.resultCode=="0">
				<resultCode>0</resultCode>
				<resultMsg>${SvcCont.resultMsg}，请求流水号为[${TcpCont.TransactionID}]</resultMsg>
			<#else>
				<resultCode>1</resultCode>
				<resultMsg>${SvcCont.resultMsg}，请求流水号为[${TcpCont.TransactionID}]，异常编码为[SvcCont.errCode]</resultMsg>
			</#if>
		<#--<#else>-->
			<#--<resultCode>1</resultCode>-->
			<#--<resultMsg>回参缺少业务体，请求流水号为[${TcpCont.TransactionID}]</resultMsg>-->
		</#if>
	<#else>
		<resultCode>1</resultCode>
		<resultMsg>[${TcpCont.Response.RspCode}]${TcpCont.Response.RspDesc}，请求流水号为[${TcpCont.TransactionID}]</resultMsg>
	</#if>

	<#if SvcCont?exists>
	<#if SvcCont.result?exists>
	<result>
		<custOrderId>${SvcCont.result.custOrderId}</custOrderId>
		<custSoNumber>${SvcCont.result.custSoNumber}</custSoNumber>
		<#list SvcCont.result.ruleInfos as ruleInfo>
		<ruleInfos>
			<ruleCode>${ruleInfo.ruleCode}</ruleCode>
			<ruleDesc>${ruleInfo.ruleDesc}</ruleDesc>
			<ruleLevel>${ruleInfo.ruleLevel}</ruleLevel>
		</ruleInfos>
		</#list>
	</result>
	</#if>
	</#if>	
</result>