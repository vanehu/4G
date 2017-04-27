package  com.al.lte.portal.bmo.log;

import  com.al.ecs.common.entity.OperatorLog;
import  com.al.ecs.log.Log;
import  com.al.ecs.spring.annotation.log.LogDB;

/**
 * 操作日志 数据库记录实现类 .
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午4:13:52
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public class LogDbBmo implements LogDB {
	Log log=Log.getLog(LogDbBmo.class);
	/**
	 * 操作日志记录
	 * @param operatorLog  OperatorLog 操作日志对象
	 */
	public void addLog(OperatorLog operatorLog) {
		// TODO Auto-generated method stub
		log.debug("LogDbBmo={}", "operatorLog");
	}

}
