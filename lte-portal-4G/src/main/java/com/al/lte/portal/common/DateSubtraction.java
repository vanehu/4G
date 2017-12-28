package com.al.lte.portal.common;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 * 
 * @author ynhuang
 *
 */
public class DateSubtraction {

	/**
	 * 获取年龄
	 * 
	 * @param dateOfBirth
	 * @return
	 */
	public static int getAge(Date dateOfBirth) {
		int age = 0;
		Calendar born = Calendar.getInstance();
		Calendar now = Calendar.getInstance();
		if (dateOfBirth != null) {
			now.setTime(new Date());
			born.setTime(dateOfBirth);
			if (born.after(now)) {
				throw new IllegalArgumentException("年龄不能超过当前日期");
			}
			age = now.get(Calendar.YEAR) - born.get(Calendar.YEAR);
			int nowDayOfYear = now.get(Calendar.DAY_OF_YEAR);
			int bornDayOfYear = born.get(Calendar.DAY_OF_YEAR);
			if (nowDayOfYear < bornDayOfYear) {
				age -= 1;
			}
		}
		return age;
	}

	/**
	 * 字符串转换为date类型
	 * 
	 * @param strDate
	 * @return
	 */
	public static Date stringToDate(String strDate) {
		SimpleDateFormat dateFormat = null;
		if (strDate.length() == 6) {
			dateFormat = new SimpleDateFormat("yyMMdd");
		} else {
			dateFormat = new SimpleDateFormat("yyyyMMdd");
		}
		Date date = null;
		try {
			date = dateFormat.parse(strDate);
			return date;
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return null;
	}
}
