package com.al.ecs.exception;

import java.util.HashMap;
import java.util.Map;

/**
 * 统一异常编码.
 * <P>
 * 抛出异常时，请一定要返回一个错误编码到前台。
 * <P>
 * 添加前先检查是否已经有人写好了，添加完成后按顺序排列再提交
 * <p>
 * @author			wukf
 * @version			V1.0 2013-11-19 
 * @CreateDate	2013-11-19  下午20:40:28
 * @CopyRight	亚信联创电信CRM研发部
 *
 */

public enum ErrorCode {
	CACHE_CLEAR("刷前台缓存","010190","01","010190","01"),
    QUERY_CUST("客户资料查询","010001","01","020001","02"),
    QUERY_CUST_EXINFO("客户详情查询","010002","01","020002","02"),
    QUERY_ACCT("帐户资料查询","010003","01","020003","02"),
    CUST_AUTH("产品密码鉴权","010004","01","020004","02"),
    ORDER_PROD("产品信息查询","010005","01","020005","02"),
    QUERY_ACCT_DETAIL("查询帐户详情","010006","01","020006","02"),
    QUERY_AGREEMENT("合约计划查询","010009","01","020009","02"),
    QUERY_MAIN_OFFER("主销售品规格查询","010010","01","020010","02"),
    QUERY_OFFER_SPEC("销售品构成查询","010011","01","020011","02"),
    SEAL_CA("PDF文件签章接口","010198","01","010159","01"),//无纸化签章系统先暂定为01 为门户异常
    ATTACH_OFFER("可订购附属销售品查询","010012","01","020012","02"),
    QUERY_OFFER_EXCLUDE_DEPEND("销售品互斥依赖关系查询","010013","01","020014","02"),
    QUERY_MUST_OFFER("默认必选销售品查询","010014","01","020015","02"),
    QUERY_MUST_OFFER_SERV("默认必选销售品和功能产品查询","010199","01","020199","02"),
    ORDER_PROD_ITEM("产品规格属性查询","010015","01","020016","02"),
    QUERY_COMPSPEC("产品规格构成查询","010016","01","020017","02"),
    QUERY_ATTACH_OFFER("已定购附属销售品查询","010017","01","020018","02"),
    QUERY_PROTOCOL("协议查询","010088","01","020088","02"),
    QUERY_PROTOCOL_NBR("协议编码查询","010312","01","020088","02"),
    ADD_PROTOCOL("协议添加","010313","01","020088","02"),
    QUERY_PROTOCOL_OFFER_DETAIL("协议销售品详情查询","010314","01","020088","02"),
    QUERY_PROTOCOL_OFFER("协议关联销售品","010315","01","020088","02"), 
    ORDER_PROD_INST("产品实例属性查询（不包括组合产品属性）","010018","01","020019","02"),
    QUERY_OFFER_PARAM("销售品实例构成查询","010019","01","020020","02"),
    QUERY_SEQ("v网群号查询","010316","01","020020","02"),
    QUERY_PROD_ACCT("产品下帐户信息查询","010020","01","020021","02"),
    ORDER_COMP_PROD_INST("产品实例所属群产品查询","010021","01","020022","02"),
    QUERY_COMPPRODMEMBER("群组产品实例成员信息查询","010022","01","020023","02"),
    PROD_INST_DETAIL("产品实例详情查询","010023","01","020024","02"),
    ORDER_CTGMAINDATA("主数据查询","010025","01","020026","02"),
    ORDER_OFFERCOUPON("产品下终端实例数据查询","010026","01","020027","02"),
    ORDER_SUBMIT("订单提交","010028","01","020029","02"),
    CHARGE_LIST("算费","010029","01","020030","02"),
    CHARGE_SUBMIT("收费建档并激活","010030","01","020031","02"),
    CHARGE_ADDITEM("根据业务对象动作查询可操作的费用项","010031","01","020032","02"),
    DEL_ORDER("购物车作废","010032","01","020033","02"),
    ORDER_QUERY("客户下未竣工订单查询","010035","01","020036","02"),
    PRINT_VOUCHER("打印回执","010036","01","020037","02"),
    GET_INVOICE_ITEMS("可打印费用查询","010037","01","020038","02"),
    SAVE_INVOICE_INFO("发票打印处理","010038","01","020039","02"),
    QUERY_COMMPRODUCT("产品实例受理单历史","010039","01","020040","02"),
    REFUND_CHARGE("补退费","010040","01","020041","02"),
    QUERY_FOREGIFTITEMS("押金查询","010041","01","020042","02"),
    BILL_RETUENFOREGIFT("退押金","010042","01","020043","02"),
    BILL_SAVEFOREGIFT("押金收取","010043","01","020044","02"),
    UPDATE_ARCHIVED_AUTO("手动归档","010044","01","020064","02"),
    INVOICE_INVALID("发票作废接口","010045","01","020046","02"),
    CUST_ORDER("购物车列表信息查询","010046","01","020047","02"),
    CUST_ORDER_DETAIL("订单查询","010047","01","020048","02"),
    CUST_ITEM_DETAIL("购物车详情查询","010048","01","020049","02"),
    CHARGE_PAYMETHOD("费用项可支持付费方式查询","010049","01","020050","02"),
    QUERY_BANKINFO("银行详情查询","010050","01","020051","02"),
    QUERY_CART_LINK("查询购物车环节","010051","01","020054","02"),
    BATCH_IMP_SUBMIT("保存批量导入数据","010052","01","020055","02"),
    BATCH_IMP_LIST("查询批量订单数据","010053","01","020056","02"),
    QUERY_CARDNBLIST("一卡双号检验单接口","010317","01","020121","02"),
    BATCH_ORDER_LIST("查询批量种子订单数据","010054","01","020057","02"),
    BATCH_ORDER_DEL("作废种子订单","010055","01","020058","02"),
    QUERY_VIRTUALINFO("一卡双号退订查虚号接口","010318","01","020123","02"),
    CUST_ORDER_SIMPLE_INFO("购物车列表简化信息查询","010056","01","020059","02"),
    RESEND_CUST_ORDER("购物车重发","010057","01","020060","02"),
    QUERY_CHECKBYCHANGE("预校验单接口","010058","01","020061","02"),
    SHORT_NUM_CHECK("短号码校验/预占接口","010059","01","020062","02"),
    PHONENUM_LIST("号码查询接口","010060","01","040002","04"),
    PHONENUM_E_F_C("号码预占与释放、撤单接口","010061","01","040003","04"),
    PHONENUM_IDENTITY("查询预占号码信息接口","010062","01","040004","04"),
    UIM_E_F("UIM卡预占与释放接口","010063","01","040005","04"),
    QRY_PHONENBRLEVELINFO_LIST("号码等级查询","010064","01","040019","04"),
    QUERY_TERMINAL_LIST("终端规格信息查询接口","010065","01","040007","04"),
    CHECK_TERMINAL("终端校验接口","010066","01","040008","04"),
    QUERY_COUPON("根据终端串码查询终端信息","010067","01","020075","02"),
    QUERY_TERMINAL_INFO("终端信息查询接口","010319","01","040009","04"),
    CHECK_UIMANDPHONE("号码和UIM卡批量校验接口","010069","01","040011","04"),
    RESERVENUM_SUBMIT("号码预约接口","010130","01","040047","04"),
    DO_ADJUST_ACCOUNT("调账","010320","01","010130","11"),
    DO_DERATE_DUE_ACCOUNT("滞纳金","010321","01","010130","11"),
    RESERVENUM_QUERY("号码预约接口","010132","01","040048","04"),
    DO_BAD_DEBTS("呆坏账","010322","01","010132","11"),
    QUERY_TERINAL_STORE("终端仓库","010323","01","040011","04"),
    CHECK_TERINAL_USE("终端添加","010133","01","040012","04"),
    RESERVENUM_BATCHSUBMIT("预约号码批量释放接口出错","010324","01","040054","04"),
    CHARGEINFO_CHECK("代理商保证金校验","010325","01","020133","02"),
    DO_TERINAL_USE("终端领用","010326","01","040013","04"),
    RES_UIM_CARD_TYPE_VALIDATE("卡类型查询接口","010155","01","040055","04"),
    CHECK_RULE("客户级业务规则校验接口","010071","01","060001","06"),
    QUERY_CHANNEL("受理渠道查询接口","010072","01","070001","07"),
    STAFF_LOGIN("员工登录接口","010074","01","050001","05"),
    UPDATE_STAFF_PWD("员工密码修改接口","010075","01","050002","05"),
    QUERY_MENU_INFO("菜单列表查询接口","010076","01","050003","05"),
    QUERY_SHORTCUT("快捷菜单查询接口","010080","01","050007","05"),
    SET_SHORTCUT("快捷菜单增删接口","010081","01","050008","05"),
    QUERY_STAFF_INFO("员工信息查询接口","010082","01","050009","05"),
    BULLET_IN_INFO("公告查询接口","010083","01","050010","05"),
    OPERAT_AREA_RANGE("权限地区纬度范围查询接口","010087","01","050014","05"),
    QUERY_FOREGIFTOPERHISTORY("押金操作明细查询","010090","01","020070","02"),
    QUERY_PARTYPROFILE("客户属性规格列表查询","010091","01","020066","02"),
    SAVE_BANK("银行详情保存","010092","01","020053","02"),
    UPDATE_BANK("银行详情更新","010093","01","020052","02"),
    QUERY_CERTTYPE("根据客户类型查询证件类型","010094","01","020077","02"),
    LOAD_INST("全量信息查询","010095","01","020065","02"),
    PROD_INST_ACC_NBR("根据产品实例ID查询实例与接入号关系信息","010096","01","020076","02"),
    QURYTE_TRMSALES_INFO("终端销售详情查询","010327","01","020076","02"), // 终端销售详情查询
    QURYTE_FEE_INFO("费用详情查询","010328","01","020076","02"), // 费用详情查询
    QURYTE_COUNT_INFO("总量查询","010329","01","020076","02"), // 总量查询
    QUERY_MATRESINFO("PUK码查询","010099","01","020089","02"),
    QUERY_CONSTRUCTION_STATE("施工单状态查询","010100","01","020064","02"),
    QRY_NUMBERPOOL("号池查询","010120","01","040020","04"),
    QRY_PNLEVELPRODOFFER("靓号预存和保底金额查询","010125","01","020125","02"),
    FTP_UPLOAD_ERROR("上传文件到FTP服务器异常","010126","01","020097","02"),
    FTP_DOWNLOAD_ERROR("从FTP服务器下载文件异常","010127","01","020098","02"),
    PORTAL_INPARAM_ERROR("门户入参异常","010128","01","010128","01"),  //该异常编码为营业后台使用，请不要占用
    CSB_ORDER("异常订单消息查询","010139","01","010139","02"),
    QUERY_CONST_CONFIG("公共数据查询的服务","010140","01","010140","02"),
    GET_INVOICE_INFO("获取发票代码号码","010151","01","020100","02"),
    QUERY_AUTHENTICDATARANGE("权限数据范围查询","010141","01","050050","05"),
    CHECK_RULETOPRO("下省校验接口","010034","01","020034","02"),
    TERM_ORDER_QUERY_SERVICE("终端预约联动查询","010138","01","040138","04"),
    QUERY_GROUP_BASIC_INFO("群基本信息查询接口","010150","01","020109","02"),
    QUERY_GROUP_INFO("群详细信息查询接口","010152","01","020120","02"),
    EXCHANGE_ACCNBR("一卡双号正式单接口","010330","01","020122","02"),
    CARD_PROGRESS_QUERY("自助换卡查询进度接口","010070","01","020124","02"),
    INTF_QUERY_ORDER_RESALE("实例订单查询接口","010073","01","020126","02"),
    FORBIDDEN_REQUEST("访问被拒绝，包含被屏蔽的关键字","010250","01","010250","01"),
    QUERY_ORDERINFOS("查询暂存单","010251","01","020251","02"),
    QUERY_COUPON_RESERVE("终端预约记录查询","010252","01","020252","02"),
    CONFIG_DATA_QUERY("查询配置数据","010261","01","020116","02"),
    QUERY_COUPON_ATTR_VALUE("以旧换新查询终端属性配置","010271","01","020117","02"),
    QUERY_OLD_COUPON_DISCOUNT_PRICE("以旧换新回购价格查询","010281","01","020306","02"),
    CHECK_NEW_OLD_COUPON_REL("以旧换新旧串码校验","010291","01","020305","02"),
    QUERY_COUPON_RESERVE_CODE_CHECK("终端预约校验","010253","01","020253","02"),
    SAVE_NEW_OLD_COUPON_RELINFO("以旧换新保存新旧串码接口","010311","01","020307","02"),
    QUERY_MY_FAVORITE("查询我的收藏接口","010331","01","020308","02"),
    ADD_MY_FAVORITE("销售品收藏接口","010332","01","020309","02"),
    DEL_MY_FAVORITE("收藏夹销售品删除接口","010333","01","020310","02"),
    QUERY_OFFER_FEE_TYPE("查询主套餐可选付费类型接口","010310","01","020119","02"),
    SAVE_ORDER_ATTRS("保存订单属性接口","010334","01","020311","02"),
    QUERY_ACC_NBR_BY_CUST("根据客户查询接入号","010344","01","020001","02"),
    CHANGEUIM_MSG_SEND("补换卡短信验证","010345","01","050106","05"),
  ///************************************************************服务层接口异常编码（临时使用）************************************************************/ 
    GET_INVOICE_TEMPLATES("获取打印模板","010097","01","010098","01"),
    AREA_ALL("地区字典-门户接口","010101","01","010101","01"),
    QUERY_BILL("账单查询","010102","01","010102","01"),
    QUERY_BILL_DETAIL("详单查询","010103","01","010103","01"),
    QUERY_BALANCE("余额查询","010104","01","010104","01"),
    PAY_BALANCE("余额支取","010105","01","010105","01"),
    QUERY_RES_RELEASE("异常单资源查询","010106","01","010106","01"),
    UPDATE_RES_STATE("异常单资源被释放后状态更新","010107","01","010107","01"),
    QUERY_WRITEOFFCASH("销帐查询","010108","01","010108","01"),
    REVERSE_WRITEOFFCASH("反销帐","010109","01","010109","01"),
    WRITE_OFF_CASH("销账","010110","01","010110","01"),
    CASH_RECHARGE("现金充值","010111","01","010111","01"),
    QUERY_OVERDUE("欠费查询","010112","01","010112","01"),
    GET_CARD_INFO("卡资源申请","010113","01","010113","01"),
    COMPLETE_WRITE_CARD("写卡上报","010114","01","010114","01"),
    GET_AUTH_CODE("获取动态链接库密钥","010115","01","010115","01"),
    CARD_DLL_INFO("获取卡组件","010116","01","010116","01"),
    PRINT_INVOICE("打印发票","010117","01","010117","01"),
    ORDER_UNDO_CHECK("撤单校验","010118","01","010118","01"),
    PRINT_OLD2NEW("打印以旧换新","010166","01","010166","01"),
    WRITEOFFCASH_INVOICE_INFO("销账发票信息查询","010129","01","010129","01"),
    QRY_BUSITYPE("业务类型查询","010121","01","010121","01"),
    QRY_BUSIACTIONTYPE("业务动作查询","010122","01","010122","01"),
    INSERT_ORDERYSL("预受理订单提交","010123","01","010123","01"),
    UPDATE_ORDERZDYY("预约状态更新","010160","01","010160","01"),
    CUSTOMIZE_BILL("客户化账单打印","010119","01","010119","01"),
    QUERY_ORDERYSL("预受理订单查询","010124","01","010124","01"),
    QUERY_ORDERZDYY("预约订单查询","010161","01","010161","01"),
    CREATE_ORDERLONGER("订单时长","010131","01","010131","01"),
    NEW_WRITEOFFCASH_INVOICE_INFO("新票据打印查询","010134","01","010134","01"),
    INVOICENOTICE("新票据成功打印通知","010135","01","010135","01"),
    INVOICEREVERSE("新票据回收通知","010136","01","010136","01"),
    QUERY_NUMBYUIM("通过uim查询用户信息","010142","01","020142","02"),
    QUERY_OCTN("一卡双号业务监控","010143","01","020143","02"),
    QUERY_AUTH_URL_LIST("查询待授权接口","010137","01","010137","01"),
    QUERY_SA_DEAL_RECORDS("用户停复机时间查询","010148","01","010148","01"),
    QUERY_ORDER_LIST_INFO_BY_ORDER_ID("数据抽取查询","010158","01","010158","01"),
    QUERY_SPECLIST_BY_ATTRID("离散值查询接口","010159","01","020144","02"),
    QUERY_COUPON_CONFIG("终端配置查询接口","010160","01","020145","02"),
    SAVE_RESOURCE_DATA("资源补录","010168","01","010168","01"),
    QUERY_ORDERBUSIHINT("查询客户订单业务提示","010169","01","020146","02"),
    IOT_MKTRESCODE("物联网终端串码查询号码","011301","01","1300001","13"),
    IOT_PRODINFO("物联网产品资料查询","011302","01","1300002","13"),
    IOT_TRANSFER_ARCHIVE("物联网过户返档","011303","01","1300003","13");

    String name;  
    String code;
    String oppoCode;
    String sys;
    String oppoSys;
    ErrorCode(String name,String code,String sys,String oppoCode,String oppoSys){
        this.name=name;
        this.code=code;
        this.sys=sys;
        this.oppoCode=oppoCode;
        this.oppoSys=oppoSys;
    }
    public String getName() {
        return name;
    }
    public String getCode() {
        return code;
    }
   
    public String getErrMsg() {
        return SYS_MAP.get(sys)+"异常" +"："+name+"出错";
    }
    public String getOppoCode() {
        return oppoCode;
    }
    public String getOppoErrMsg() {
        return SYS_MAP.get(oppoSys)+"异常" +"："+name+"出错";
    }
    
    public String getSys() {
        return SYS_MAP.get(sys);
    }
    public String getOppoSys() {
        return SYS_MAP.get(oppoSys);
    }
    
    public static String getSysByCode(String code) {
    	code = code.substring(0, 2);
    	return SYS_MAP.get(code);
    }
    
    //异常编码对应系统名称
    public static final Map<String, String> SYS_MAP = new HashMap<String, String>();
    static {
        SYS_MAP.put("01", "集团门户");
        SYS_MAP.put("02", "集团营业受理后台");
        SYS_MAP.put("03", "集团能力开放平台(SAOP)");
        SYS_MAP.put("04", "集团营销资源");
        SYS_MAP.put("05", "集团系统管理");
        SYS_MAP.put("06", "集团业务规则");
        SYS_MAP.put("07", "集团渠道管理");
        SYS_MAP.put("08", "省份");
        SYS_MAP.put("09", "CSB");
        SYS_MAP.put("10", "DEP");
        SYS_MAP.put("11", "公共技术平台");
        SYS_MAP.put("12", "UAM");
        SYS_MAP.put("13", "物联网");
    }
}
