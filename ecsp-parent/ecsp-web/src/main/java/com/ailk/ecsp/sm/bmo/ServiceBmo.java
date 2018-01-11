package com.ailk.ecsp.sm.bmo;
import com.ailk.ecsp.sm.common.ResultMap;
/**
 * 
 * @author 陈源龙
 *
 */
public interface ServiceBmo {
	/**
	 * 服务分页查询.
	 * @param page 第n页
	 * @param pageSize 分页大小
	 * @return
	 */
	public ResultMap queryService(int page,int pageSize);
	
	public ResultMap serviceAddPage();
	
	public int delService(Long serviceId);
	
}
