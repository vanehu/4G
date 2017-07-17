package com.al.ecs.common.entity;
/**
 * 日志级别 .
 * <BR>
 *  调试阶段:DEBUG 入数据库:DB 入日志文件:FILE.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 上午11:32:43
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
public enum LevelLog {
		/** 调试阶段 */
		DEBUG,
		/** 入数据库 */
		DB,
		/** 错误时入数据库 */
		ERROR_DB,
		/** 入日志文件 */
		FILE,
		/**错误时 入日志文件 */
		ERROR_FILE
}
