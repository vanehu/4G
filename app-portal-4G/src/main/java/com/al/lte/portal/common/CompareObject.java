package com.al.lte.portal.common;

import java.util.Comparator;
import java.util.Map;

import com.al.ecs.log.Log;

public class CompareObject implements Comparator<Object>{
	
	private static Log log = Log.getLog(CompareObject.class);
	
	private String type = "" ;
	public void setType(String sType){
		type = sType ;
	}
	public int compare(Object o1, Object o2) {
		if(type=="YWSL"){
			return compareYWSL(o1,o2);
		}else if(type=="cartLinkTime"){
			return compareCartLinkTime(o1,o2);
		}
		return 0;
	}
	/*二次业务菜单 按照lableTypeId，resourceId排序*/
	@SuppressWarnings("unchecked")
	public static int compareYWSL(Object o1, Object o2) {
		Map<String, Object> map1 = (Map<String, Object>) o1;
		Map<String, Object> map2 = (Map<String, Object>) o2;
		String sInt1 = "0";
		String sInt2 = "0";
		int flag = 0;
		try {
			sInt1 = map1.get("lableTypeId") == null ? "0" : map1.get(
					"lableTypeId").toString();
			sInt2 = map2.get("lableTypeId") == null ? "0" : map2.get(
					"lableTypeId").toString();
			flag = sInt1.compareTo(sInt2);
			if (flag == 0) {
				sInt1 = map1.get("resourceId") == null ? "0" : map1.get(
						"resourceId").toString();
				sInt2 = map2.get("resourceId") == null ? "0" : map2.get(
						"resourceId").toString();
				flag = sInt1.compareTo(sInt2);
			}
		} catch (Exception e) {
			log.error("二次业务菜单 排序异常");
		}
		return flag;
	}
	/*受理单环节 按照时间排序*/
	@SuppressWarnings("unchecked")
	public static int compareCartLinkTime(Object o1, Object o2) {
		Map<String, Object> map1 = (Map<String, Object>) o1;
		Map<String, Object> map2 = (Map<String, Object>) o2;
		String sInt1 = "0";
		String sInt2 = "0";
		int flag = 0;
		try {
			sInt1 = map1.get("linkFlag") == null ? "0" : map1.get("linkFlag").toString();
			sInt2 = map2.get("linkFlag") == null ? "0" : map2.get("linkFlag").toString();
			flag = sInt1.compareTo(sInt2);
		} catch (Exception e) {
			log.error("受理单环节 排序异常");
		}
		return flag;
	}
}
