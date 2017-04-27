package com.al.lte.portal.common;

import java.util.HashMap;
import java.util.Map;

/**
 * 充值卡充值结果码.
 */
public class CardRechargeCode {
	private static Map<String,String> codeMap = new  HashMap<String,String>();
	static{
		codeMap.put("2001", "卡密码错误");
		codeMap.put("2002", "卡归属地区不匹配（应该发给广西的卡鉴权消息发到了广东）");
		codeMap.put("2003", "卡号不存在");
		codeMap.put("2101", "卡未激活");
		codeMap.put("2102", "卡被锁定");
		codeMap.put("2103", "卡已被使用");
		codeMap.put("2104", "卡已过期");
		codeMap.put("2105", "卡为已注销");
		codeMap.put("2201", "专卡专用不提供跨省充值");
		codeMap.put("2202", "卡业务类型受限");
		codeMap.put("2203", "卡面额与拆分金额总额不一致");
		codeMap.put("2204", "卡使用区域范围受限");
		codeMap.put("2301", "流水号错误导致卡冲正失败");
		codeMap.put("2302", "卡号不符导致卡冲正失败 ");
		codeMap.put("2303", "卡信息不符合业务管理规定（如：卡面额不在省业务部门规定的卡面额范围内、卡有效期超长等）");
		codeMap.put("2304", "跨省卡鉴权超时");
		codeMap.put("2305", "跨省卡鉴权失败（除了上述卡状态异常导致的其他原因失败）");
		codeMap.put("2306", "跨省卡鉴权冲正失败");
		codeMap.put("2307", "找不到卡归属地（用户归属地找不到卡路由，不知道发往哪个卡平台）");
		codeMap.put("3001", "用户不存在（用户输入错误，没有相关资料匹配）");
		codeMap.put("3002", "用户处于冷冻期");
		codeMap.put("3003", "用户未使用");
		codeMap.put("3004", "用户处于挂失状态");
		codeMap.put("3005", "用户服务密码不正确（服务密码是用于用户查询充值记录等时使用）");
		codeMap.put("3006", "流水号错误导致帐户冲正失败");
		codeMap.put("3007", "跨省后付费用户暂时不提供余额查询");
		codeMap.put("3008", "用户进入风险控制名单（黑名单）");
		codeMap.put("3009", "用户归属地区不匹配（eg：应该发给广西的充值消息发到了广东）");
		codeMap.put("3010", "非中国电信用户（eg：被充值用户非中国电信用户）");
		codeMap.put("3011", "找不到用户归属地（eg：接入地H码表或区号表缺失，找不到用户归属地）");
		codeMap.put("3012", "用户资料错误（用户已拆机等）");
		codeMap.put("3013", "充值用户受限，不允许充值（如公话，网厅给外省电话充值等）");
		codeMap.put("3014", "代理商帐号不存在");
		codeMap.put("3015", "代理商余额不足");
		codeMap.put("3016", "代理商状态：注销");
		codeMap.put("3017", "代理商状态：锁定（即进入黑名单）");
		codeMap.put("3018", "代理商状态：暂停（暂时不可使用）");
		codeMap.put("3019", "Wifi时长卡购买金额和卡余额不符");
		codeMap.put("4001", "VC平台内部操作超时");
		codeMap.put("4002", "VC平台内部错误，操作失败");
		codeMap.put("4003", "系统繁忙");
		codeMap.put("4004", "VC平台数据库操作失败");
		codeMap.put("4005", "VC平台写文件错误（如摊分文件、充值记录、日志等）");
		codeMap.put("4006", "VC平台处于升级或维护期，暂时不能充值  ");
		codeMap.put("4007", "VC平台内部操作超时");
		codeMap.put("4008", "VC平台内部错误，操作失败");
		codeMap.put("4009", "系统繁忙");
		codeMap.put("4010", "VC平台数据库操作失败");
		codeMap.put("4011", "VC平台写文件错误（如摊分文件、充值记录、日志等）");
		codeMap.put("4012", "VC平台处于升级或维护期，暂时不能充值  ");
		codeMap.put("4013", "接入地VC等待超时");
		codeMap.put("4101", "余额归属系统超时（包括ABM、HB、OCS、智能网平台等管理余额的平台和系统）");
		codeMap.put("4102", "计费系统数据库错误");
		codeMap.put("4103", "计费系统内部错误（內存分配失敗等）");
		codeMap.put("4104", "VC与计费系统连接异常（网络异常连接不上，接口挂死等）");
		codeMap.put("4105", "充值失败（不易归类的错误导致的充值失败）");
		codeMap.put("4106", "充值失败，不支持客户级充值");
		codeMap.put("4107", "冲正失败（用户的余额已被使用，导致金额不足，或者有其它限制）");
		codeMap.put("4108", "查帐户信息失败（余额帐本不存在等）");
		codeMap.put("4109", "该帐户信息被锁定，可能正执行某些操作，请重试（锁帐户失败）");
		codeMap.put("4110", "无法新增帐本（首次充值可能需要新增帐本对象）");
		codeMap.put("4111", "充值失败，对应的余额类型不存在（余额帐本类型不支持balanceType，余额类型无效）");
		codeMap.put("4112", "计费系统处于出帐或维护期，暂时不能充值  （禁充时间） ");
		codeMap.put("4113", "帐户下付费用户过多，不能充值（如：一个合同号下有1000个用户）");
		codeMap.put("4201", "用户鉴权系统超时");
		codeMap.put("4202", "VC与用户鉴权系统连接异常（网络异常连接不上，接口挂死等）");
		codeMap.put("4203", "用户鉴权系统数据库错误");
		codeMap.put("4204", "用户鉴权系统内部错误");
		codeMap.put("4205", "帐号找不到相应的余额归属系统");
		codeMap.put("5001", "超过被充值用户的最大限额");
		codeMap.put("5002", "批量充值不可拆分充值");
		codeMap.put("5003", "拆分充值中某笔失败导致整体回滚");
		codeMap.put("501", "用户不存在（用户输入错误，没有相关资料匹配）");
		codeMap.put("502", "用户处于冷冻期");
		codeMap.put("503", "用户未使用");
		codeMap.put("504", "用户处于挂失状态");
		codeMap.put("505", "流水号错误导致帐户冲正失败");
		codeMap.put("506", "跨省后付费用户暂时不提供余额查询");
		codeMap.put("507", "非中国电信用户（eg：被充值用户非中国电信用户）");
		codeMap.put("508", "用户资料错误（用户已拆机等）");
		codeMap.put("509", "充值用户受限，不允许充值（如公话，网厅给外省电话充值等）");
		codeMap.put("510", "代理商帐号不存在");
		codeMap.put("511", "代理商余额不足");
		codeMap.put("512", "代理商状态：注销");
		codeMap.put("513", "代理商状态：锁定（即进入黑名单）");
		codeMap.put("514", "代理商状态：暂停（暂时不可使用）");
		codeMap.put("515", "计费系统数据库错误  ");
		codeMap.put("516", "计费系统内部错误（內存分配失敗等）");
		codeMap.put("517", "充值失败（不易归类的错误导致的充值失败）");
		codeMap.put("518", "充值失败，不支持客户级充值");
		codeMap.put("519", "冲正失败（用户的余额已被使用，导致金额不足，或者有其它限制）  ");
		codeMap.put("520", "查帐户信息失败（余额帐本不存在等）");
		codeMap.put("521", "该帐户信息被锁定，可能正执行某些操作，请重试（锁帐户失败）");
		codeMap.put("522", "无法新增帐本（首次充值可能需要新增帐本对象）");
		codeMap.put("523", "充值失败，对应的余额类型不存在（余额帐本类型不支持balanceType，余额类型无效）");
		codeMap.put("524", "计费系统处于出帐或维护期，暂时不能充值  （禁充时间）");
		codeMap.put("525", "帐户下付费用户过多，不能充值（如：一个合同号下有1000个用户）");  
	}
	
	public static String getCode(String code){
		return codeMap.get(code);
	}
}
