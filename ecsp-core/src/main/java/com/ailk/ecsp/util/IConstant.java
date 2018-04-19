package com.ailk.ecsp.util;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;

/**
 * 
 * @author Administrator
 *
 */
public interface IConstant {


	/**接口包回参适配方式 原始报文返回*/
	final String CON_OUT_PARAM_TYPE_TO_XML = "0";
	/**接口包回参适配方式  解析成MAP返回*/
    final String CON_OUT_PARAM_TYPE_TO_MAP = "1";
	/**接口包回参适配方式  根据配置模板解析*/
	final String CON_OUT_PARAM_TYPE_TEMPLATE = "3";
	/**接口包回参适配方式  将DOM的属性根据配置模板解析*/
	final String CON_OUT_PARAM_TYPE_DOM_TEMPLATE = "4";
    /**接口回参模板默认节点*/
    final String CON_INTERFACE_RES_ROOT_NAME = "ContractRoot";
    /**ftl模板默认位置*/
    final String CON_INTERFACE_RES_FTL_PATH = "/com/linkage/portal/service/lte/ftl";
    /**分库关键字*/
    final String CON_DB_KEY_WORD = DataRepository.getInstence().getSysParamValue("","sys.dbKeyWord", SysConstant.CON_SYS_PARAM_GROUP_INTF_URL)==null?"ownerId":DataRepository.getInstence().getSysParamValue("","sys.dbKeyWord", SysConstant.CON_SYS_PARAM_GROUP_INTF_URL);

}
