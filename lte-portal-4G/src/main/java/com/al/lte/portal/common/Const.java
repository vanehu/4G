package com.al.lte.portal.common;

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

}
