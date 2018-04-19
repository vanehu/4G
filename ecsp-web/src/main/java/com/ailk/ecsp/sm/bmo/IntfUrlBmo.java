package com.ailk.ecsp.sm.bmo;

import com.ailk.ecsp.mybatis.model.IntfUrl;
import com.ailk.ecsp.sm.common.ResultMap;
/**
 * 
 * @author 陈源龙
 *
 */
public interface IntfUrlBmo {
	public ResultMap queryIntfUrl(int startIndex,int pageSize);
	
	public ResultMap insertIntfUrl(IntfUrl intf);
	
	public ResultMap deleteIntfUrl(Long intfUrlId);
	
	public ResultMap updateIntfUrl(IntfUrl intfUrl);
	
}
