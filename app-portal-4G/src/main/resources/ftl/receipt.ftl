<orderList>
	<orderListInfo>
		<extCustOrderId>${orderNo}</extCustOrderId>
		<#if item.phonenumber??>
		<areaName>${item.phonenumber.areaName}</areaName>
		</#if>
	</orderListInfo>
	<custOrderList>
		<partyName><#if item.cust??>${item.cust.name}</#if></partyName>
		<addressStr><#if item.cust??>${item.cust.address}</#if></addressStr>
		<identityType><#if item.cust??>${item.cust.idTypeName}</#if></identityType>
		<identityCardNo><#if item.cust??>${item.cust.idNo}</#if></identityCardNo>
		<linkName><#if item.cust??>${item.cust.name}</#if></linkName>
		<linkNumber><#if item.phonenumber??>${item.phonenumber.number}</#if></linkNumber>
		<#if orderType != '12'>
		<orderEvent>
			<state>1</state>
			<orderNum>1</orderNum>
			<prodInfos>
				<prodInfo>
					<accessNumber><#if item.phonenumber??>${item.phonenumber.number}</#if></accessNumber>
					<#if orderType == '1'>
					<prodAction>新装</prodAction>
					<#elseif  orderType == '2' >
					<prodAction>变更</prodAction>
					<#elseif orderType == '3' >
					<prodAction>套餐换档</prodAction>
					<#elseif orderType == '4' >
					<prodAction>拆机</prodAction>
					<#elseif orderType == '5' >
					<prodAction>终端</prodAction>
					<#elseif orderType == '6' >
					<prodAction>补换卡</prodAction>
					<#elseif orderType == '7' >
					<prodAction>撤单</prodAction>
					<#elseif orderType == '11' >
					<prodAction>新装主副卡</prodAction>
					<#elseif orderType == '12' >
					<prodAction>新装副卡</prodAction>
					<#elseif orderType == '13' >
					<prodAction>新装组合产品</prodAction>
					<#else>
					<prodAction>其他</prodAction>
					</#if>
					<#if item.attachOffer??>
					<#list item.attachOffer as it>
					<servInfo>
						<#if it.action =='ADD'>
						<action>开</action>
						<#else>
						<action>关</action>
						</#if>
						<servSpecName>${it.name}</servSpecName>
					</servInfo>
					</#list>
					</#if>
				</prodInfo>
			</prodInfos>
			<busiOrderInfos>
			<#if item.offer??>
				<#list item.offer as it1>
				<busiOrderInfo>
					<boActionTypeCd>S1</boActionTypeCd>
					<#if it1.action =='ADD'>
					<boActionName>订购</boActionName>
					<#else>
					<boActionName>退订</boActionName>
					</#if>
					<actionClassCd>3</actionClassCd>
					<objName>${it1.name}</objName>
				</busiOrderInfo>
				</#list>
			</#if>
			<#if item.attachOffer??>
				<#list item.attachOffer as it2>
				<busiOrderInfo>
					<boActionTypeCd>S1</boActionTypeCd>
					<#if it2.action =='ADD'>
					<boActionName>订购附属销售品</boActionName>
					<#else>
					<boActionName>退订附属销售品</boActionName>
					</#if>
					<actionClassCd>3</actionClassCd>
					<objName>${it2.name}</objName>
				</busiOrderInfo>
				</#list>
			</#if>
			</busiOrderInfos>
			
			<boProdTds>
				<#if item.mhk??>
				<boProdTd>
					<#if item.mhk.action =='ADD'>
					<action>订购</action>
					<#else>
					<action>退订</action>
					</#if>
					<deviceModelName>${item.mhk.mktResName}</deviceModelName>
					<band>${item.mhk.brand}</band>
					<pattern>${item.mhk.type}</pattern> 
					<color>${item.mhk.color}</color>
					<terminalCode>${item.mhk.sn}</terminalCode>
					<iccid></iccid>
				</boProdTd>
				</#if>
			</boProdTds>
			<boCoupons>
				<#if item.mhk?exists>
				<boCoupon>
					<#if item.mhk.action =='ADD'>
					<action>订购</action>
					<#else>
					<action>退订</action>
					</#if>
					<couponName>${item.mhk.mktResName}</couponName>
					<amount>1</amount>
					<insNbr>${item.mhk.sn}</insNbr>
				</boCoupon>
				</#if>
				<#if item.uim??>
					<boCoupon>
					<#if item.uim.action =='ADD'>
					<action>订购</action>
					<#else>
					<action>退订</action>
					</#if>
					<couponName>UIM卡</couponName>
					<amount>1</amount>
					<insNbr>${item.uim.uim}</insNbr>
				</boCoupon>
				</#if>
			</boCoupons>
		</orderEvent>
		</#if>
		<#if subItem.phonenumber?? && subItem.phonenumber.number??>
		<orderEvent>
			<state>1</state>
			<orderNum>2</orderNum>
			<prodInfos>
				<prodInfo>
					<accessNumber><#if subItem.phonenumber??>${subItem.phonenumber.number}</#if></accessNumber>
					<#if orderType == '1'>
					<prodAction>新装</prodAction>
					<#elseif  orderType == '2' >
					<prodAction>变更</prodAction>
					<#elseif orderType == '3' >
					<prodAction>套餐换档</prodAction>
					<#elseif orderType == '4' >
					<prodAction>拆机</prodAction>
					<#elseif orderType == '5' >
					<prodAction>终端</prodAction>
					<#elseif orderType == '6' >
					<prodAction>补换卡</prodAction>
					<#elseif orderType == '7' >
					<prodAction>撤单</prodAction>
					<#elseif orderType == '11' >
					<prodAction>新装主副卡</prodAction>
					<#elseif orderType == '12' >
					<prodAction>新装副卡</prodAction>
					<#elseif orderType == '13' >
					<prodAction>新装组合产品</prodAction>
					<#else>
					<prodAction>其他</prodAction>
					</#if>
					<#if subItem.attachOffer??>
					<#list subItem.attachOffer as it>
					<servInfo>
						<#if it.action =='ADD'>
						<action>开</action>
						<#else>
						<action>关</action>
						</#if>
						<servSpecName>${it.name}</servSpecName>
					</servInfo>
					</#list>
					</#if>
				</prodInfo>
			</prodInfos>
			<busiOrderInfos>
			<#if subItem.offer??>
				<#list subItem.offer as it1>
				<busiOrderInfo>
					<boActionTypeCd>S1</boActionTypeCd>
					<#if it1.action =='ADD'>
					<boActionName>订购</boActionName>
					<#else>
					<boActionName>退订</boActionName>
					</#if>
					<actionClassCd>3</actionClassCd>
					<objName>${it1.name}</objName>
				</busiOrderInfo>
				</#list>
			</#if>
			<#if subItem.attachOffer??>
				<#list subItem.attachOffer as it2>
				<busiOrderInfo>
					<boActionTypeCd>S1</boActionTypeCd>
					<#if it2.action =='ADD'>
					<boActionName>订购附属销售品</boActionName>
					<#else>
					<boActionName>退订附属销售品</boActionName>
					</#if>
					<actionClassCd>3</actionClassCd>
					<objName>${it2.name}</objName>
				</busiOrderInfo>
				</#list>
			</#if>
			</busiOrderInfos>
			<boCoupons>
				<#if subItem.uim??>
					<boCoupon>
					<#if subItem.uim.action =='ADD'>
					<action>订购</action>
					<#else>
					<action>退订</action>
					</#if>
					<couponName>UIM卡</couponName>
					<amount>1</amount>
					<insNbr>${subItem.uim.uim}</insNbr>
				</boCoupon>
				</#if>
			</boCoupons>
		</orderEvent>	
		</#if>
	</custOrderList>
</orderList>