package com.al.lte.portal.bmo.crm;

import java.text.DateFormat;
import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import com.al.ecs.common.util.DateUtil;

public class TestHashMap {

	@SuppressWarnings("unused")
	public static void main(String[] args) {
		
		try {
			//20150201000000
			Date date = DateUtil.getDateFromString("20160825000000", DateUtil.DATE_FORMATE_STRING_DEFAULT);
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(date);
			Calendar calendarNow = Calendar.getInstance();
//			calendar.set(Calendar.MONTH, 5);
//			calendar.add(Calendar.MONTH, 5);
			
			int year = calendar.get(Calendar.YEAR);
			int month = calendar.get(Calendar.MONTH) + 1;
			int res = calendarNow.compareTo(calendar);
			
			calendar.add(Calendar.MONTH, -2);
			
			year = calendar.get(Calendar.YEAR);
			month = calendar.get(Calendar.MONTH) + 1;
			res = calendarNow.compareTo(calendar);
			
//			int calendarDate = calendar.get(Calendar.DATE);
//			int dateOfMonth = calendar.get(Calendar.DAY_OF_MONTH);
			
			Date now = new Date();
			int result = now.compareTo(date);
			
			DateFormat dateFormat = DateFormat.getDateInstance();
			dateFormat.parse("2016-08-23");
		} catch (ParseException e) {
			e.printStackTrace();
		}
	}
}
