<?xml version="1.0" encoding="UTF-8"?>
<result>
    <#if TcpCont.Response.RspCode == "0000">
		<code>POR-0000</code>
		<#if SvcCont?exists>
		<#if SvcCont.SOO.PUB_RES.RspCode=='0000'>
		<resultJSON>{"resultCode":"0","resultMsg":"${ SvcCont.SOO.PUB_RES.RspDesc}","result":{"staffCode":"${ SvcCont.SOO.STAFF_LOGIN_INFO.SYSTEM_USER_CODE}","areaCode":"${ SvcCont.SOO.STAFF_LOGIN_INFO.COMMON_REGION_ID}","staffName":"${ SvcCont.SOO.STAFF_LOGIN_INFO.STAFF_NAME}","areaId":"${ SvcCont.SOO.STAFF_LOGIN_INFO.COMMON_REGION_ID}"}}</resultJSON>
		<#else>
		<resultJSON>{"resultCode":"1","resultMsg":"${ SvcCont.SOO.PUB_RES.RspDesc}","errorCode":"","errorStack":""}</resultJSON>
		</#if>
	</#if>
	<#else>
		<code>POR-2004</code>
		<resultJSON>{"resultCode":"1","resultMsg":"${TcpCont.Response.RspDesc}","errorCode":"","errorStack":""}</resultJSON>
	</#if>
	
</result>