package com.al.lte.portal.token.app.controller.crm;

import java.util.HashMap;
import java.util.Map;

/**
 * 公共参数校验
 * @author huangjian
 *
 */
public class ConstantValues {

	//公共参数
	public static final String PROVISALE = "provIsale";
	public static final String PROVCUSTIDENTITYCD = "provCustIdentityCd";
	public static final String CUSTNUMBER = "custNumber";
	public static final String PROVCUSTIDENTITYNUM = "provCustIdentityNum";
	public static final String PROVCUST_AREAID = "provCustAreaId";
	public static final String ACTION_FLAG = "actionFlag";
	public static final String RELOAD_FLAG = "reloadFlag";
	public static final String ISFEE = "isFee";
	
	/**
	 * 参数校验时，参数对应的提示信息
	 */
	public static final Map<String, String> warningMsgMap = new HashMap<String, String>(){
		private static final long serialVersionUID = 2311960412603246492L;
		{
			put("null", "参数不能为空");		
			//公共的参数
			put(PROVISALE, "缺少受理流水无法进行受理");
			put(PROVCUSTIDENTITYCD, "缺少客户定位证件类型无法进行受理");
			put(CUSTNUMBER, "缺少客户编码无法进行受理");
			put(PROVCUSTIDENTITYNUM, "缺少证件类型的编码值无法进行受理");
			put(PROVCUST_AREAID, "缺少客户所属区域编码无法进行处理");
			put(ACTION_FLAG, "缺少业务类型无法进行处理");
			put(RELOAD_FLAG, "缺少加载标识无法进行处理");			
			put(ISFEE, "缺少收费标识无法进行受理");					
		}
	};
}
