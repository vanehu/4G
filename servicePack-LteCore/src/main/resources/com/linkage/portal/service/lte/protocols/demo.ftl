<?xml version="1.0" encoding="UTF-8"?>
<user>
	<name>${name}</name>
	<email>${email}</email>
	<#list telphoneList as tel>
		<tel>${tel}</tel>
	</#list>
		<#list addressList as address>
		<zpcode>${address.zpcode}</zpcode>
	</#list>
	<ATTR CD="${attr.cd}" VAL="${attr.val}"/>
</user>



