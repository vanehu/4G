package com.linkage.portal.service.lte.dto;

import java.util.HashMap;
import java.util.Map;

public class SrcSystemCode {
	private static Map<String, String> code = new HashMap<String, String>();
	static {
		code.put("600101","6001010001");//广东crm
		code.put("600102","6001020001");//上海
		code.put("600103","6001030001");//江苏
		code.put("600104","6001040001");//浙江
		code.put("600105","6001050001");//福建
		code.put("600201","6002010001");//四川
		code.put("600202","6002020001");//湖北
		code.put("600203","6002030001");//湖南
		code.put("600204","6002040001");//陕西
		code.put("600205","6002050001");//云南
		code.put("600301","6003010001");//安徽
		code.put("600302","6003020001");//广西
		code.put("600303","6003030001");//新疆
		code.put("600304","6003040001");//重庆
		code.put("600305","6003050001");//江西
		code.put("600401","6004010001");//甘肃
		code.put("600402","6004020001");//贵州
		code.put("600403","6004030001");//海南
		code.put("600404","6004040001");//宁夏
		code.put("600405","6004050001");//青海
		code.put("600406","6004060001");//西藏
		code.put("609001","6090010001");//北京
		code.put("609801","6098010001");//港、澳、台
		code.put("609902","6099020001");//天津
		code.put("609903","6099030001");//山东
		code.put("609904","6099040001");//河南
		code.put("609905","6099050001");//辽宁
		code.put("609906","6099060001");//河北
		code.put("609907","6099070001");//山西
		code.put("609908","6099080001");//内蒙古
		code.put("609909","6099090001");//吉林
		code.put("609910","6099100001");//黑龙江
	}

	public static String getValue(String key) {
		return code.get(key);

	}

	public static boolean containsKey(String key) {
		return code.containsKey(key);

	}
}
