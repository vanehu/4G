package com.linkage.portal.service.lte.dto;

import java.util.HashMap;
import java.util.Map;

public class SrcODSSystemCode {
	private static Map<String, String> code = new HashMap<String, String>();
	static {
	    code.put("600101","6001010003");//广东 ODS
	    code.put("600102","6001020003");//上海
	    code.put("600103","6001030003");//江苏
	    code.put("600104","6001040003");//浙江
	    code.put("600105","6001050003");//福建
	    code.put("600201","6002010003");//四川
	    code.put("600202","6002020003");//湖北
	    code.put("600203","6002030003");//湖南
	    code.put("600204","6002040003");//陕西
	    code.put("600205","6002050003");//云南
	    code.put("600301","6003010003");//安徽
	    code.put("600302","6003020003");//广西
	    code.put("600303","6003030003");//新疆
	    code.put("600304","6003040003");//重庆
	    code.put("600305","6003050003");//江西
	    code.put("600401","6004010003");//甘肃
	    code.put("600402","6004020003");//贵州
	    code.put("600403","6004030003");//海南
	    code.put("600404","6004040003");//宁夏
	    code.put("600405","6004050003");//青海
	    code.put("600406","6004060003");//西藏
	    code.put("609001","6090010003");//北京
	    code.put("609801","6098010003");//港、澳、台
	    code.put("609902","6099020003");//天津
	    code.put("609903","6099030003");//山东
	    code.put("609904","6099040003");//河南
	    code.put("609905","6099050003");//辽宁
	    code.put("609906","6099060003");//河北
	    code.put("609907","6099070003");//山西
	    code.put("609908","6099080003");//内蒙古
	    code.put("609909","6099090003");//吉林
	    code.put("609910","6099100003");//黑龙江
	}

	public static String getValue(String key) {
		return code.get(key);

	}

	public static boolean containsKey(String key) {
		return code.containsKey(key);

	}
}
