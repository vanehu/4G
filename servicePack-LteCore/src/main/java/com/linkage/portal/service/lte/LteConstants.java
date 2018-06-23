package com.linkage.portal.service.lte;


public class LteConstants {
	/**(系统/平台)签名	默认：123（测试）、上线待定 */
	public final static String CON_CSB_URL_KEY = "url.csbWS";
	/**(系统/平台)签名
	 * 容灾改造：通过CSB调外围接口，须使用CSB域名*/
	public final static String CN2_CON_CSB_URL_KEY = "url.CN2csbWS";
	/** 物联网CSB接口地址*/
	public final static String IOT_CSB_URL_KEY = "url.IOTcsbWS";
	/**(系统/平台)签名	默认：123（测试）、上线待定 */
	public final static String CON_TCP_SRC_SYS_SIGN = "123";//"integral10000000660606";//"integral10000000371110";
	/**默认发起方组织ID 集团*/
	public final static String CON_TCP_SRC_ORG_ID = "100000";
	/**默认发起方系统ID 集团转售门户*/
	public final static String CON_TCP_SRC_SYS_ID = "1000000210";
	/**默认发起方系统ID 集团4G门户*/
	public final static String CON_TCP_SRC_SYS_ID_LTE = "1000000206";
	/**缴费种类(充值)*/
	public final static String CON_PAY_TYPE_DO_CASH = "0";
	/**缴费种类(充值冲正)*/
	public final static String CON_PAY_TYPE_R_DO_CASH = "1";
	/**缴费种类(销账)*/
	public final static String CON_PAY_TYPE_WRITE_OFF_CASH = "2";	
	/**缴费种类(反销账)*/
	public final static String CON_PAY_TYPE_R_WRITE_OFF_CASH = "3";
	/**缴费种类(余额提取)*/
	public final static String CON_PAY_TYPE_PAY_BALANCE = "4";
	/**缴费记录状态(成功)*/
	public final static String CON_PAY_STATUS_SUCESS = "0";
	/**缴费记录状态(进行中)*/
	public final static String CON_PAY_STATUS_PROGRESSING = "1";
	/**缴费记录状态(调用充值平台失败)*/
	public final static String CON_PAY_STATUS_FAIL = "2";
	/**缴费记录状态(充值平台调用计费失败)*/
	public final static String CON_PAY_STATUS_CALL_BACK_FAIL = "3";
	/**缴费记录状态(已返销)*/
	public final static String CON_PAY_STATUS_BUY_BACK = "4";


	/** 号码预占释放间隔，默认30分钟，即释放当前时间30分钟前预占的号码*/
	public final static String CON_PHONE_NUMBER_RELEASE_INTERVAL = "30";	
	/** 号码单次释放默认最大个数*/
	public final static String CON_PHONE_NUMBER_RELEASE_MAX_NUM = "50";	
	/** 号码临时预占*/
	public final static String CON_PHONE_NUMBER_OCCUPIED = "E";	
	/** 号码释放*/
	public final static String CON_PHONE_NUMBER_RELEASE = "F";	
	/** 定时器任务配置文件相对路径*/
	public final static String CON_TIME_TASK_CONFIG_PATH = "/apConfig/taskConfig.properties";	
	/** 充值回调接口业务编码*/
	public final static String CON_BUSI_CODE_RECHARGE_CALL_BACK = "BUS37020";
	/** 订单报竣工回调接口业务编码*/
	public final static String CON_BUSI_CODE_ORDER_COMPLETE_CALL_BACK = "BUS37000";	
	
	
    /** csb动作编码 */
    public static final String CSB_ACTION_CODE = "0";
    /** csb服务等级 */
    public static final String CSB_SERVICE_LEVEL = "1";
    /** csb密码 */
    public static final String CSB_SRC_SYS_SIGN = "123";
    /** csb组织编码-集团 */
    public static final String CSB_ORG_ID_GROUP = "100000";
    /** csb发起方编码-集团 4G*/
    public static final String CSB_SRC_SYS_ID_LTE = "1000000206";
    /** csb发起方编码-集团转售*/
    public static final String CSB_SRC_SYS_ID_MVNO = "1000000210";
    /** 写卡常量*/
    public static final String CON_SIP_SS_DATA = "766E65742E6D6F6269FFFFFFFFFFFFFF";
	
	/**
	 * 渠道类型枚举类
	 * @author liusd
	 *
	 */
	public enum ChannelType {
        NORMAL_AGENT("0","普通代理商"),
        ELECTRONIC_AGENT("1","电子代理商"),
        APPLE_AGENT("3","苹果直营店代理商");

        /** 键名 */
        private String key;
        /** 键 值*/
        private String val;

        private ChannelType(String key,String val) {
            this.key = key;
            this.val = val;
        }

        public String key() {
            return this.key;
        }
        public String val() {
            return this.val;
        }
    }
}
