package com.ailk.ecsp.jdbc;

import javax.sql.DataSource;

import org.springframework.jdbc.core.JdbcTemplate;
/**
 * =========================================================
 * 亚信联创 电信CRM研发部
 * @author 李茂君
 * @date 2011-4-22 下午06:51:57
 * @Description: TODO(数据源管理器)
 * @version V1.0
 * =========================================================
 * update date                update author     Description
 * 2011-4-22                    李茂君           创建文件
 */
public class ConnectHolder {
	
	private static DataSource dataSource;
	private static DataSource protalDataSource;
	private static JdbcTemplate jdbc;
	private static JdbcTemplate protaljdbc;
	private static String dbKeyWord;

	public static JdbcTemplate getJdbc() {
		return jdbc;
	}

	public static void setJdbc(JdbcTemplate jdbc) {
		ConnectHolder.jdbc = jdbc;
	}

	public static DataSource getDataSource() {
		return dataSource;
	}

	public static void setDataSource(DataSource dataSource) {
		ConnectHolder.dataSource = dataSource;
	}

	public static DataSource getProtalDataSource() {
		return protalDataSource;
	}

	public static void setProtalDataSource(DataSource protalDataSource) {
		ConnectHolder.protalDataSource = protalDataSource;
	}

	public static JdbcTemplate getProtaljdbc() {
		return protaljdbc;
	}

	public static void setProtaljdbc(JdbcTemplate protaljdbc) {
		ConnectHolder.protaljdbc = protaljdbc;
	}
	
	
}
