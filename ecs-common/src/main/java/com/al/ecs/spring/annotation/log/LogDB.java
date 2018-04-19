package com.al.ecs.spring.annotation.log;

import com.al.ecs.common.entity.OperatorLog;

/**
 * 数据库日志记录 .
 * 实现接口 addLog
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午4:01:59
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public interface LogDB {

	/**
	 * 添加日志
	 * @param operatorLog 操作日志
	 */
	public void addLog(OperatorLog operatorLog);
}
