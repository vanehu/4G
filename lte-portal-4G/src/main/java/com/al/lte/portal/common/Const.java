package com.al.lte.portal.common;

import java.util.HashMap;
import java.util.Map;

/**
 * 常量
 * @author whb
 *
 */
public class Const {
	
	//产品规格
	public static final String PROD_SPEC_CDMA="235010000";
	public static final String PROD_SPEC_DATA_CARD="280000000";
	public static final String PROD_SPEC_PROD_FUN_4G="280000020";
	
	
	public static final String OBJ_TYPE_PROD="2";//接入类产品
	public static final String OBJ_TYPE_FUN_PROD="4";//功能类产品
	public static final String OBJ_TYPE_SERV="4";//功能类产品
	public static final String OBJ_TYPE_OFFER="7";//销售品
	
	//业务动作小类
	public static final String BO_ACTION_TYPE_ACTIVERETURN="1020500000";//产品返档(活卡销售返档)
	public static final String BO_ACTION_TYPE_BUY_OFFER="S1";//订购销售品
	public static final String BO_ACTION_TYPE_DEL_OFFER="S2";//退订销售品

	
	public static final String OFFERCHANGE_FLAG="2";//套餐变更的标识
	public static final String ACTIVERETURN_FLAG="9";//产品返档(活卡销售返档)的标识
	
	
	public static final String OL_TYPE_CD = "15";// app 系统标示
	
	//发展人数据
	public static Object ASSISTANT_TYPE = null;
	
	//证件类型
	public static Object ID_CARD_TYPE=null;

	//20位长度的随机字符串
	public static final int RANDOM_STRING_LENGTH = 20;
	
	public static final String CACHE_CERTINFO="CACHE_CERTINFO";
	
	/**
	 * #896069对于省级工号只配置了一个省级渠道的情况，将登录地区加载到受理地区(三级地区)；若登录地区为直辖市
	 * 则将其地区ID降级为三级地区ID，再加载到受理地区<br/>
	 * 对于直辖市省级读地区ID的处理原则是:areaId + 100 = 新的降级后的地区ID，并改名为XX-市辖区
	 */
	public static final Map<String, Object> loginArea2BusinessArea = new HashMap<String, Object>() {
		private static final long serialVersionUID = 1L;
		{
			put("8110000", new String[]{"8110100","北京-市辖区"});
			put("8310000", new String[]{"8310100","上海-市辖区"});
			put("8120000", new String[]{"8120100","天津-市辖区"});
			put("8500000", new String[]{"8500100","重庆-市辖区"});
			put("8630000", new String[]{"8630100","青海西宁市"});
			put("8450000", new String[]{"8450100","广西南宁市"});
			put("8610000", new String[]{"8610100","陕西西安市"});
			put("8420000", new String[]{"8420100","湖北武汉市"});
			put("8350000", new String[]{"8350100","福建福州市"});
			put("8320000", new String[]{"8320100","江苏南京市"});
			put("8460000", new String[]{"8460100","海南海口市"});
			put("8640000", new String[]{"8640100","宁夏银川市"});
			put("8140000", new String[]{"8140100","山西太原市"});
			put("8530000", new String[]{"8530100","云南昆明市"});
			put("8360000", new String[]{"8360100","江西南昌市"});
			put("8370000", new String[]{"8370100","山东济南市"});
			put("8430000", new String[]{"8430100","湖南长沙市"});
			put("8510000", new String[]{"8510100","四川成都市"});
			put("8440000", new String[]{"8440100","广东广州市"});
			put("8410000", new String[]{"8410100","河南郑州市"});
			put("8210000", new String[]{"8210100","辽宁沈阳市"});
			put("8220000", new String[]{"8220100","吉林长春市"});
			put("8340000", new String[]{"8340100","安徽合肥市"});
			put("8330000", new String[]{"8330100","浙江杭州市"});
			put("8520000", new String[]{"8520100","贵州贵阳市"});
			put("8620000", new String[]{"8620100","甘肃兰州市"});
			put("8540000", new String[]{"8540100","西藏拉萨市"});
			put("8990000", new String[]{"8540100","西藏拉萨市"});
			put("8130000", new String[]{"8130100","河北石家庄市"});
			put("8230000", new String[]{"8230100","黑龙江哈尔滨市"});
			put("8650000", new String[]{"8650100","新疆乌鲁木齐市"});
			put("8150000", new String[]{"8150100","内蒙古呼和浩特市"});
		}
	};
	
	/**
	 * 正则：匹配省级地区ID，针对直辖市使用
	 */
	public static final String AREA_ID_REGEX_Z = "^(811|831|812|850)0000$";
	
	/**
	 * 正则：除直辖市以外，匹配全国各省的省级地区ID
	 */
	public static final String AREA_ID_REGEX_C = "^(854|863|815|823|845|861|842|835|832|846|864|814|853|836|837|843|851|844|813|841|821|822|834|833|852|862|865|899)0000$";

	/**
	 * 正则：匹配全国各省的省级地区ID(32省)
	 */
	public static final String AREA_ID_REGEX_A = "^(811|831|812|850|854|863|815|823|845|861|842|835|832|846|864|814|853|836|837|843|851|844|813|841|821|822|834|833|852|862|865|899)0000$";

}
