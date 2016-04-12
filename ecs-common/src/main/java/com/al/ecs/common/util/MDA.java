package com.al.ecs.common.util;

import java.util.HashMap;
import java.util.Map;

@com.al.common.annotation.AppModule(moduleName = "Lte4GManager")
public class MDA {
	/**
	 * 调用接口过csb的webservice地址
	 */
	public static final String CSB_WS_URL=new String("");
	/**
	 * 调用接口过csb的http地址
	 */
	public static final String CSB_HTTP_URL=new String("");
	/**
	 * CSB标识 ON OFF
	 */
	public static final String CSB_FLAG=new String("");
	/**
	 * 异步标识 ON OFF
	 */
	public static final String ASYNC_FLAG=new String("");
	/**
	 * 默认HTTP调用 ON OFF
	 */
	public static final String DEF_HTTP_FLAG=new String("");
	/**
	 * 是否显示省内订单属性 0-打开，1-关闭
	 */
	public static final Map<String,String> PROVORDERATTR_FLAG=new HashMap<String,String>();
	/**
	 * 通过CSB调外围接口使用此地址
	 */
	public static final String CN2CSBHTTP_URL=new String("");
	/**
	 * 通过CSB调外围接口使用此地址
	 */
	public static final String CN2CSBWS_URL=new String("");
	/**
	 * CRM系统批量预开通功能优化需求开关，ON：改造之后；OFF：改造之前
	 */
	public static final String BATCHORDER_QRY_FLAG=new String("");
	/**
	 * 批量订单查询权限控制优化开关，ON：改造之后；OFF：改造之前
	 */
	public static final String BATCHORDER_AUTH_FLAG=new String("");
	/**
	 * 回执打印新旧版本开关 ON OFF
	 */
	public static final String PRINTNEW=new String("");
	/**
	 * 写卡走新组件 ON OFF
	 */
	public static final String CARD_NEW_DLL=new String("");
	/**
	 * 营销资源图片地址
	 */
	public static final String MKT_RES_PIC_URL=new String("");
	/**
	 * 公告附件下载地址
	 */
	public static final String NOTICE_URL=new String("");
	/**
	 * 操作手册下载地址
	 */
	public static final String MANUAL_URL=new String("");
	/**
	 * ITSM系统URL
	 */
	public static final String ITSM_URL=new String("");
	/**
	 * 翼支付绑卡添益宝生产环境DCN
	 */
	public static final String YIPAYBOUNDCARD_URL=new String("");
	/**
	 * 主副卡纳入老用户权限开关  ON OFF
	 */
	public static final Map<String,String> ADDOLDCUSTAUTH_FLAG=new HashMap<String,String>();
	/**
	 * 拦截跳转到unifylogin的登陆页开关  ON OFF
	 */
	public static final String UNIFYLOGIN=new String("");
	/**
	 * 接口优化查询开关 ON OFF
	 */
	public static final String INTERFACEOPTIMIZATION=new String("");
	/**
	 * 新建客户时候身份证证件类型开关  ON OFF
	 */
	public static final Map<String,String> IDTYPE_FLAG=new HashMap<String,String>();
	/**
	 * 套餐变更时候是否调用预校验开关  ON：调用预校验  OFF：不调用预校验
	 */
	public static final Map<String,String> YJY_FLAG=new HashMap<String,String>();
	/**
	 * 在订单确认页面，在下省校验成功之后调用业务提醒接口，获取提醒信息开关  ON：调用业务提醒接口  OFF：不调用业务提醒接口
	 */
	public static final Map<String,String> YWTX_FLAG=new HashMap<String,String>();
	/**
	 * 能力开放(客户架构、全量查询)接口标识
	 */
	public static final String INTERFACE_MERGE=new String("");
	
	/**
	 * 令牌失效时间
	 * */
	public static final String TOKENTIMES=new String("");
	/***
	 * 省份公钥密码
	 * 
	 */
	public static final String TOKENPROVINEKEY=new String("");
	
	/**
	 * 令牌key
	 * */
	public static final String TOKENKEY=new String ("");
	
	/**
	 * PC版本跳转url
	 * */
	public static final Map<String,String> PC_URL=new HashMap<String,String>();
	/***
	 * APP版本跳转url
	 * */
	public static final Map<String,String> APP_URL=new HashMap<String,String>();
	/***
	 * PAD版本跳转url
	 * */
	public static final Map<String,String> PAD_URL=new HashMap<String,String>();
	
	/**
	 * 公共参数加密key
	 * */
	
	public static final String COMMON_PARAM_KEY=new String ("");
	
	/**
	 * 省份私钥 TOKEN_JMPROVINCECODE_KEY
	 * */
	public static final Map<String,String> TOKEN_JMPROVINCECODE_KEY=new HashMap<String,String>();
	
	/**
	 * 省份回调地址PC
	 * 
	 * */
	public static final Map<String,String> PC_URL_BACK=new HashMap<String,String>();
	
	/**
	 * 省份回调地址APP
	 * */
	public static final Map<String,String> APP_URL_BACK=new HashMap<String,String>();
	/**
	 * 省份回调地址PAD
	 * */
	public static final Map<String,String> PAD_URL_BACK=new HashMap<String,String>();
	/***
	 * LTE 或 MVNO
	 * */
	public static final String APPDESC=new String("");
	/**
	 *#如果启用绝对路径，则使用下面路径作为父级路径
	 * */
	public static final String ABS_DIRECTORY_KEY=new String ("");
	
	/***
	 * 决定参数是先从以下配置中取，还是先从数据库参数表取
	 * */
	public static final String FILE_PREFER_FLAG=new String ("");
	/**
	 *  # NONE - 不压缩
        # BASE - 第三方和基础JS压缩为一个JS
        # BUSI - 第三方和基础JS压缩为一个JS，业务类JS压缩为一个JS
	 * */
	public static final String COMPRESS_JS_LEVEL=new String("");
	
	/**
	 * BASE 版本
	 * */
	public static final String BASE_VERSION=new String("");
	
	/**
	 * BUSI 版本
	 * */
	public static final String BUSI_VERSION=new String("");
	
	/***
	 * 推荐浏览器
	 * */
	public static final String RECOMMEND_BROWSERS=new String("");
	/**
	 * 告警浏览器
	 * */
	public static final String WARNING_BROWSERS=new String ("");
	/**
	 * 禁止浏览器
	 * */
	public static final String FORBIDDEN_BROWSERS=new String ("");
	
	/**
	 * 是否记录接口日志
	 * */
	public static final String WRITE_LOG_FLAG=new String ("");
	/**
	 * 
	 * */
	public static final String COMPRESS_ALL_JS=new String ("");
	/**
	 * 记录过频间隔
	 * */
	public static final String OF_TIME=new String ("");
	/**
	 * 记录过频次数
	 * */
	public static final String OF_COUNT=new String ("");
}
