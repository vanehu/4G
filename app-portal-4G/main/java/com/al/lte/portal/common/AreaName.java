package com.al.lte.portal.common;

public class AreaName {
	
	/**
	 * araeId转换成对应的省份路由编码
	 * @param areaId
	 * @return
	 */
	public static String getAreaName(String areaId){
		if(areaId==null || "".equals(areaId)){
			return "";
		}
		areaId = areaId.substring(0, 3);
		Integer i = Integer.valueOf(areaId);
		String areaName = "";
		switch(i){
			case 811: areaName = "beijing";  break;
			case 812: areaName = "tianjing"; break;
			case 814: areaName = "shxi"; break;
			case 815: areaName = "neimenggu"; break;
			case 821: areaName = "liaoning"; break;
			case 822: areaName = "jilin"; break;
			case 835: areaName = "fujian";  break;
			case 843: areaName = "hunan"; break;
			case 850: areaName = "chongqing"; break;
			case 852: areaName = "guizhou"; break;
			case 853: areaName = "yunnan"; break;
			case 854: areaName = "xizang"; break;	
			case 863: areaName = "qinghai";  break;
			case 864: areaName = "ningxia"; break;
			case 865: areaName = "xinjiang"; break;
			case 844: areaName = "guangdong"; break;
			case 832: areaName = "jiangsu"; break;
			case 851: areaName = "sichuang"; break;	
			case 833: areaName = "zhejiang";  break;
			case 834: areaName = "anhui"; break;
			case 861: areaName = "shanxi"; break;
			case 842: areaName = "hubei"; break;
			case 831: areaName = "shanghai"; break;
			case 813: areaName = "hebei"; break;
			case 837: areaName = "shandong";  break;
			case 845: areaName = "guangxi"; break;
			case 841: areaName = "henan"; break;
			case 862: areaName = "gansu"; break;
			case 836: areaName = "jiangxi"; break;
			case 846: areaName = "hainan"; break;
			case 823: areaName = "heilongjiang"; break;
			case 899: areaName = "xuni"; break;
		}
		return areaName;
	}
}
