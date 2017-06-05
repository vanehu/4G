package com.ailk.ecsp.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class DateUtil {

	public static final String FMT_DATE_TIME = "yyyy-MM-dd HH:mm:ss";

	public static final String FMT_DATE = "yyyy-MM-dd";

	private static Logger log = LoggerFactory.getLogger(DateUtil.class);

	/**
	 * 获取当前时间的前n个月或者后n个月
	 * 
	 *  format
	 *            返回格式
	 *  n
	 *            月数
	 *  flag
	 *            1 表示当前时间前,2表示当前时间后
	 * 
	 */
	public static String getBeforDate(String format, int n, int flag) {

		if (StringUtils.isBlank(format)) {
			format = FMT_DATE;
		}

		SimpleDateFormat df = new SimpleDateFormat(format);

		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date());
		calendar.set(Calendar.DATE, 1);

		if (1 == flag) {
			calendar.set(Calendar.MONTH, calendar.get(Calendar.MONTH) - n);
		} else {
			calendar.set(Calendar.MONTH, calendar.get(Calendar.MONTH) + n);
		}

		return df.format(calendar.getTime());

	}

	/**
	 * 获取系统当前日期时间(格式自定)
	 * 
	 *  format
	 *            返回日期的格式 默认为 yyyy-MM-dd HH:mm:ss
	 * 
	 */
	public static String getFormatDate(String format) {

		if (Toolkit.isEmptyStr(format)) {
			format = FMT_DATE_TIME;
		}
		Date d = new Date();
		DateFormat df = new SimpleDateFormat(format);

		return df.format(d);
	}

	public static String getFormatDate() {
		return getFormatDate(FMT_DATE_TIME);
	}

	/**
	 * 获取当前日期前N个月份列表
	 * 
	 *  scope
	 * 
	 */
	public List getMonthList(int scope) {

		List<Object> list = new ArrayList<Object>();
		for (int i = 1; i <= scope; i++) {
			HashMap<String,String> map = new HashMap<String,String>();
			String startdate = getBeforDate("yyyyMMdd", i, 1);
			String enddate = getBeforDate("yyyyMMdd", i - 1, 1);
			String name = startdate.substring(0, 4) + "年" + startdate.substring(4, 6);
			map.put("startdate", startdate);
			map.put("enddate", enddate);
			map.put("name", name);
			list.add(map);
		}

		return list;
	}

	/**
	 * 获取当前月份
	 * 
	 * 
	 */
	public static String getMonth() {
		Date date = new Date();
		DateFormat df = new SimpleDateFormat("MM");
		return df.format(date);
	}

	/**
	 * 获取当前小时
	 */
	public static String getHour() {
		Date date = new Date();
		DateFormat df = new SimpleDateFormat("HH");
		return df.format(date);
	}

	/**
	 * 获取当前年份
	 */
	public static String getYear() {
		Date date = new Date();
		DateFormat df = new SimpleDateFormat("yyyy");
		return df.format(date);
	}

	/**
	 * 获取当前日期
	 */
	public static String getDate() {
		Date date = new Date();
		DateFormat df = new SimpleDateFormat("dd");

		return df.format(date);
	}
	
	/**
	 * 获取每个月的第一天
	 * 
	 *  nowdate
	 *  inFormat
	 *  outFormat
	 * 
	 */
	public static String getFistDay(String nowdate, String inFormat, String outFormat) {

		String returndate = "";

		Date date = null;
		SimpleDateFormat sdf = new SimpleDateFormat(inFormat);
		try {
			date = sdf.parse(nowdate);

			Calendar cl = Calendar.getInstance();
			cl.setTime(date);
			cl.set(Calendar.DAY_OF_MONTH, 1);

			date = cl.getTime();

			sdf = new SimpleDateFormat(outFormat);
			returndate = sdf.format(date);

		} catch (ParseException e) {
			log.error("",e);
		}

		return returndate;

	}

	/**
	 * 获取后一个月的第一天
	 * 
	 *  nowdate
	 *  inFormat
	 *  outFormat
	 * 
	 */
	public static String getNextMonthFistDay(String nowdate, String inFormat,
			String outFormat) {

		String returndate = "";

		Date date = null;
		SimpleDateFormat sdf = new SimpleDateFormat(inFormat);
		try {
			date = sdf.parse(nowdate);

			Calendar cl = Calendar.getInstance();
			cl.setTime(date);
			cl.set(Calendar.MONTH, cl.get(Calendar.MONTH) + 1);
			cl.set(Calendar.DAY_OF_MONTH, 1);

			date = cl.getTime();

			sdf = new SimpleDateFormat(outFormat);
			returndate = sdf.format(date);

		} catch (ParseException e) {
			log.error("",e);
		}

		return returndate;
	}


	/**
	 * 详细设计： 1.被400整除是闰年，否则： 2.不能被4整除则不是闰年 3.能被4整除同时不能被100整除则是闰年
	 * 3.能被4整除同时能被100整除则不是闰年
	 */
	public static boolean isLeapYear(int year) {

		if ((year % 400) == 0) {
			return true;
		} else if ((year % 4) == 0) {
			if ((year % 100) == 0) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	/**
	 * 格式化Date
	 * 
	 *  date
	 *  format
	 * 
	 */
	public static String formatDate(Date date, String format) {
		if (date == null) {
			date = new Date();
		}
		DateFormat df = new SimpleDateFormat(format);
		return df.format(date);
	}

	public static long getMillis(java.util.Date date) {
		java.util.Calendar c = java.util.Calendar.getInstance();
		c.setTime(date);
		return c.getTimeInMillis();
	}
	
	public static String nowDate(String format) {
		return formatDate(new Date(),format);
	}
	
	public static String nowDateDefaut() {
		return formatDate(new Date(),"yyyyMMddHHmmss");
	}
	
	public static long getMinutes(){
		long n = Calendar.getInstance().getTimeInMillis();
		return n/1000/60;
	}

}
