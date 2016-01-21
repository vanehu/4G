package com.linkage.portal.service.lte.dao;

import java.sql.Types;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.jdbc.core.JdbcTemplate;

import com.ailk.ecsp.core.DataSourceRouter;
import com.ailk.ecsp.util.SpringContextUtil;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.ObjectUtil;
import com.linkage.portal.service.lte.DBUtil;
import com.linkage.portal.service.lte.LteConstants;


public class CommonDAOImpl implements CommonDAO {

    private JdbcTemplate jdbc = (JdbcTemplate) SpringContextUtil.getBean(DBUtil.PORTAL_TEMPLATE);

    /**
     * 根据渠道类型、表名、字段名取出相应配置数据
     */
    @SuppressWarnings("unchecked")
    public List queryInvoiceTemplate(Map param,String dbKeyWord) throws Exception {
        String areaId = MapUtils.getString(param, "areaId", "");
        //渠道类型
        //String channelType = MapUtils.getString(param, "channelType", "");
        StringBuffer sql = new StringBuffer();
        sql.append("SELECT A.* ");
        sql.append("  FROM INVOICE_TEMPLATE A WHERE ");
        if (!("".equals(areaId))){
            sql.append(" A.AREA_ID IN ( ");
            sql.append(" SELECT C.COMMON_REGION_ID FROM COMMON_REGION C WHERE C.AREA_LEVEL<>1");      
            sql.append(" START WITH C.COMMON_REGION_ID = ? ");
            sql.append("CONNECT BY C.COMMON_REGION_ID = PRIOR C.UP_REGION_ID) AND");
        }
        sql.append(" A.IS_ENABLE = '0' ");
        sql.append(" ORDER BY A.AREA_ID DESC");
        Object[] paramObj = {areaId};
        List rList = null;
        int[] paramType = { Types.VARCHAR};
        if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        if (!("".equals(areaId))){
        	rList = jdbc.queryForList(sql.toString(), paramObj, paramType);
        }else{
        	rList = jdbc.queryForList(sql.toString());
        }
        rList = ObjectUtil.transforKeyLowerCase(rList);
        return rList;
    }
    
    public void insertCashChargeLog(Map<String, Object> logMap,String dbKeyWord) throws Exception{
        String paySerialNbr = DBUtil.SEQ.SEQ_LOG_DO_CASH.val() + ".NEXTVAL";
        if (StringUtils.isNotBlank(MapUtils.getString(logMap, "PAY_SERIAL_NBR"))){
        	paySerialNbr = MapUtils.getString(logMap, "PAY_SERIAL_NBR");
        }
        StringBuffer sql = new StringBuffer(200);

        sql.append("INSERT INTO LOG_DO_CASH_RECORD");
        sql.append("  (PAY_SERIAL_NBR,OLD_PAY_SERIAL_NBR,ACC_NBR,PAY_AMOUNT,PAY_STATUS,PAY_TYPE,AREA_ID,CHANNEL_ID,CHANNEL_NAME,STAFF_NUMBER,STAFF_ID,CREATE_DATE) ");
        sql.append("VALUES ");
        sql.append("(").append(paySerialNbr+",");
        if(MapUtils.getString(logMap, "CREATE_DATE","").equals("")){
        	sql.append("?,?,?,?,?,?,?,?,?,?,SYSDATE)");
        }else{
        	sql.append("?,?,?,?,?,?,?,?,?,?,TO_DATE(?,'yyyy/mm/dd HH24:mi:ss'))");
        }
        
        Object[] param = new Object[] {
            MapUtils.getString(logMap, "OLD_PAY_SERIAL_NBR"),
        	MapUtils.getString(logMap, "ACC_NBR"),
            MapUtils.getLongValue(logMap, "PAY_AMOUNT"),
            MapUtils.getString(logMap, "PAY_STATUS"),
            MapUtils.getString(logMap, "PAY_TYPE"),
            MapUtils.getString(logMap, "AREA_ID"),
            MapUtils.getString(logMap, "CHANNEL_ID"),
            MapUtils.getString(logMap, "CHANNEL_NAME"),
            MapUtils.getString(logMap, "STAFF_NUMBER","").toUpperCase(),
            MapUtils.getString(logMap, "STAFF_ID"),
            MapUtils.getString(logMap, "CREATE_DATE","")
   		};
        if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        jdbc.update(sql.toString(), param);
    }
    
    public void updateCashChargeLog(Map<String, Object> logMap,String dbKeyWord) throws Exception{
    	 
        String doCashTypeCd = MapUtils.getString(logMap, "PAY_TYPE");
        StringBuffer sql = new StringBuffer(200);
        sql.append(" UPDATE LOG_DO_CASH_RECORD LDCR");
        sql.append("    SET LDCR.PAY_STATUS = ? ");
        if (!(LteConstants.CON_PAY_TYPE_R_DO_CASH.equals(doCashTypeCd))){
        	if(MapUtils.getString(logMap, "CALLBACK_DATE", "").equals("")){
        		sql.append("    , LDCR.CALLBACK_DATE = SYSDATE");
        	}else{
        		sql.append("    , LDCR.CALLBACK_DATE = TO_DATE(?,'yyyy/mm/dd HH24:mi:ss')");
        	}
        }
        sql.append("  WHERE LDCR.PAY_SERIAL_NBR = ?");
        
        if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        
        if (!(LteConstants.CON_PAY_TYPE_R_DO_CASH.equals(doCashTypeCd)) && !MapUtils.getString(logMap, "CALLBACK_DATE", "").equals("")){
        	Object[] param = new Object[] {
        			MapUtils.getString(logMap, "PAY_STATUS"),
        			MapUtils.getString(logMap, "CALLBACK_DATE", ""),
        			MapUtils.getString(logMap, "PAY_SERIAL_NBR")
        	};
        	jdbc.update(sql.toString(), param);
        }else{
        	Object[] param = new Object[] {
                    MapUtils.getString(logMap, "PAY_STATUS"),
                    MapUtils.getString(logMap, "PAY_SERIAL_NBR")
           		};
        	 jdbc.update(sql.toString(), param);
        }
    }
    
    @SuppressWarnings("unchecked")
    public List queryCashChargeLog(Map param,String dbKeyWord) throws Exception {
        String phoneNumber = MapUtils.getString(param, "phoneNumber", "");
        String billingCycle = MapUtils.getString(param, "billingCycle", "");
        String doCashTypeCd = MapUtils.getString(param, "doCashTypeCd", "");
        String reqSerial = MapUtils.getString(param, "reqSerial", "");

        StringBuffer sql = new StringBuffer();
        sql.append("SELECT LDCR.PAY_SERIAL_NBR req_Serial,");
        sql.append("       LDCR.ACC_NBR,");
        sql.append("       TO_CHAR(LDCR.CREATE_DATE,'yyyy-MM-dd HH24:MI:SS') paid_Time,");
        sql.append("       LDCR.PAY_AMOUNT payment_Amount,");
        sql.append("       '15' payment_Method");
        sql.append("  FROM LOG_DO_CASH_RECORD LDCR");
        sql.append(" WHERE ");
        if (StringUtils.isNotBlank(phoneNumber)){
            sql.append("    LDCR.ACC_NBR = "+phoneNumber+" AND");
        }
        if (StringUtils.isNotBlank(doCashTypeCd)){
            sql.append("    LDCR.PAY_TYPE = '0' AND");
        }
        if(StringUtils.isNotBlank(reqSerial)){
        	sql.append("	  LDCR.PAY_SERIAL_NBR = "+reqSerial+" AND");
        }
        sql.append(" LDCR.CREATE_DATE>=trunc(to_date('"+billingCycle+"01','yyyyMMdd'), 'MM') and LDCR.CREATE_DATE<=last_day(to_date('"+billingCycle+"01 23:59:59','yyyyMMdd HH24:MI:SS')) AND ");
        
        sql.append("    LDCR.PAY_STATUS = '0'");
        sql.append(" ORDER BY LDCR.CREATE_DATE DESC");
        if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        List rList = null;
        rList = jdbc.queryForList(sql.toString());
        rList = ObjectUtil.transforKeyLowerCase(rList);
        return rList;
    }
    
    @SuppressWarnings({ "deprecation", "unchecked" })
    public List querybusitype(Map param,String dbKeyWord) throws Exception {
        StringBuffer sql = new StringBuffer();
        sql.append("SELECT * FROM BUSI_TYPE A WHERE A.STATUS_CD='0' ORDER BY A.BUSI_TYPE_CD");
        if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        List rList = null;
        rList = jdbc.queryForList(sql.toString());
        rList = ObjectUtil.transforKeyLowerCase(rList);
        return rList;
    }
    
    @SuppressWarnings({ "deprecation", "unchecked" })
    public List querybusiactiontype(Map param,String dbKeyWord) throws Exception {
    	String busitypecd = MapUtils.getString(param, "busitypecd", "");
        StringBuffer sql = new StringBuffer();
        sql.append("SELECT * FROM BUSI_ACTION_TYPE A WHERE A.BUSI_TYPE_CD=?");
        Object[] paramObj = {busitypecd};
        int[] paramType = { Types.VARCHAR};
        if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        List rList = null;
        rList = jdbc.queryForList(sql.toString(), paramObj, paramType);
        rList = ObjectUtil.transforKeyLowerCase(rList);
        return rList;
    }
    
    @SuppressWarnings("unchecked")
    public Map insertorderyslinfo(Map<String, Object> param,String dbKeyWord) throws Exception {
    	Map reallmap = new HashMap();
    	if(param.get("printflag")!=null){
    		String SB_INVOICE_PRINT_ID_SEQ = "select INVOICE_PRINT_ID_SEQ.nextval from dual";
	        int INVOICE_PRINT_ID_SEQ = jdbc.queryForInt(SB_INVOICE_PRINT_ID_SEQ);
	        List invoiceInfos = (List) param.get("invoiceInfos");
	        Map<String, Object> invoiceInfo = (Map<String, Object>) invoiceInfos.get(0);
	        String sb12 = "INSERT INTO INVOICE_PRINT_PRESO(INVOICE_PRINT_ID,INVOICE_ID,INVOICE_NBR,INVOICE_NUM,PRINT_DATE,PRINT_STAFF_ID," +
	        		"CUST_ORDER_ID,CUST_SO_NUMBER,CUST_ID,CUST_NAME,COMMON_REGION_ID,COMMON_REGION_NAME,CHANNEL_ID," +
	        		"CHANNEL_NAME,STAFF_ID,STAFF_NAME,BSS_ORG_ID,BSS_ORG_NAME,ACCT_NBR,ACCT_ID,PAYMETHOD,BUSI_NAME," +
	        		"RMB_UPPER,ACCOUNT_UPPER,ACCOUNT,BILL_TYPE,PRINT_FLAG,PRINT_STATE,STATUS_DATE,BILL_NUM,BILL_CODE)"+
	        			  "VALUES(?,?,?,?,SYSDATE,?,?,?,'',?,?,?,?,?,?,?,?,?,?,'',?,?,?,?,?,?,'0','0',SYSDATE,'','')";
	        
	        Object[] paramObj = { INVOICE_PRINT_ID_SEQ, MapUtils.getString(invoiceInfo, "invoiceId"), MapUtils.getString(invoiceInfo, "invoiceNbr"),
	                MapUtils.getString(invoiceInfo, "invoiceNum"),MapUtils.getString(param, "STAFF_ID"),MapUtils.getString(invoiceInfo, "custOrderId"),
	                MapUtils.getString(invoiceInfo, "custSoNumber"),MapUtils.getString(param, "partyName"),MapUtils.getString(param, "areaid"),
	                MapUtils.getString(param, "areaname"),MapUtils.getString(param, "CHANNEL_ID"),MapUtils.getString(param, "channel_name"),
	                MapUtils.getString(param, "STAFF_ID"),MapUtils.getString(param, "STAFF_NAME"),MapUtils.getString(param, "org_id"),
	                MapUtils.getString(param, "org_name"),MapUtils.getString(invoiceInfo, "acctNbr"),MapUtils.getString(param, "payMethod"),
	                MapUtils.getString(invoiceInfo, "boActionTypeName"),MapUtils.getString(invoiceInfo, "rmbUpper"),
	                MapUtils.getString(invoiceInfo, "accountUpper"),MapUtils.getString(invoiceInfo, "account"),MapUtils.getString(invoiceInfo, "billType")
	        };
	        int[] paramType = { Types.INTEGER, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR
	                ,Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR
	                , Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR
	                , Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
	        
	        
	        jdbc.update(sb12.toString(),paramObj,paramType);
	        
	        List items = (List) param.get("items");
	        for(int z=0;z<items.size();z++){
	        	Map item = (Map)items.get(z);
	        	String SB_INVOICE_ITEM_ID_SEQ = "SELECT INVOICE_ITEM_ID_SEQ.NEXTVAL FROM DUAL";
		        int INVOICE_ITEM_ID_SEQ = jdbc.queryForInt(SB_INVOICE_ITEM_ID_SEQ);
		        String sb13 = "INSERT INTO INVOICE_DETAIL_PRESO(INVOICE_ITEM_ID,INVOICE_ID,ITEM_VALUE,ITEM_NAME,TAX,TAX_RATE) "+
		        			  "VALUES(?,?,?,?,'','')";
		        Object[] subParamObj = {INVOICE_ITEM_ID_SEQ,MapUtils.getString(invoiceInfo, "invoiceId"),item.get("charge"),item.get("itemName")};
		        int[] subParamType = {Types.INTEGER, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
		        jdbc.update(sb13.toString(),subParamObj,subParamType);
	        }
	        
	        String sb14 = "UPDATE INVOICE_PRESO SET PRINT_COUNT=1 WHERE INVOICE_ID = ? ";
	        Object[] sb14ParamObj = {MapUtils.getString(invoiceInfo, "invoiceId")};
            int[] sb14ParamType = {Types.VARCHAR};
	        jdbc.update(sb14.toString(),sb14ParamObj,sb14ParamType);
    	}if(param.get("queryflag")!=null){
    		String sb15 = "UPDATE CUST_ORDER SET STATUS_CD = ? WHERE CUST_SO_NUMBER =  ? ";
    		Object[] sb15ParamObj = {MapUtils.getString(param, "status_cd"),MapUtils.getString(param, "cust_so_number")};
            int[] sb15ParamType = {Types.VARCHAR,Types.VARCHAR};
    		jdbc.update(sb15.toString(),sb15ParamObj,sb15ParamType);
    	}else{
	        //客户预受理订单序列
    		String sb1 = "SELECT CUST_ORDER_ID_SEQ.NEXTVAL FROM DUAL";
	        int Serialnumber = jdbc.queryForInt(sb1);
	        
	        String CUST_SO_NUMBER = MapUtils.getString(param, "CUST_SO_NUMBER");
	        if("9".equals(MapUtils.getString(param, "BUSI_TYPE_CD"))){
	        	String sql = "SELECT SEQ_RESERVATION_NUMBER.NEXTVAL FROM DUAL";
	        	int sqlval = jdbc.queryForInt(sql);
	        	if("免费预约".equals(MapUtils.getString(param, "appointmentflag"))){
	        		CUST_SO_NUMBER = "1"+String.valueOf(sqlval);
	        	}else{
	        		CUST_SO_NUMBER = "2"+String.valueOf(sqlval);
	        	}
	        }
	        //客户预受理订单
	        String sb2 = "INSERT INTO CUST_ORDER(CUST_ORDER_ID,BUSI_TYPE_CD,ACTION_TYPE_CD,CUST_SO_NUMBER,STAFF_ID,CHANNEL_ID,LAN_ID,ACCEPT_TIME,COMMON_REGION_ID,HANDLE_PEOPLE_NAME,REMARKS,STATUS_CD,STATUS_DATE,CHANNEL_NAME,COMMON_REGION_NAME,STAFF_NBR) "+
	        			 "VALUES(?,?,?,?,?,?,?,sysdate,?,'',?,'1',SYSDATE,?,?,?)";
	        
	        Object[] sb2ParamObj = {Serialnumber,MapUtils.getString(param, "BUSI_TYPE_CD"),MapUtils.getString(param, "ACTION_TYPE_CD")
	                ,CUST_SO_NUMBER,MapUtils.getString(param, "STAFF_ID"),MapUtils.getString(param, "CHANNEL_ID")
	                ,MapUtils.getString(param, "areaid"),MapUtils.getString(param, "areaid"),MapUtils.getString(param, "REMARKS")
	                ,MapUtils.getString(param, "channel_name"),MapUtils.getString(param, "areaname"),MapUtils.getString(param, "staff_nbr")};
            int[] sb2ParamType = {Types.INTEGER, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR
                    , Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR
                    , Types.VARCHAR, Types.VARCHAR};
	        
	        jdbc.update(sb2.toString(),sb2ParamObj,sb2ParamType);        			 
	        //客户资料		 	
	        String sb3 = "INSERT INTO CUST_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,CUST_TYPE_CD,IDENTIDIES_TYPE_CD,IDENTITY_NUM,NAME,ADDRESS_STR,CONTACT_NO,STATE,LINK_NAME) "+
	        			  "VALUES(CUST_ITEM_ID_SEQ.NEXTVAL,?,?,?,?,?,?,?,'ADD','')";

	        Object[] sb3ParamObj = {Serialnumber,MapUtils.getString(param, "CUST_TYPE_CD"),MapUtils.getString(param, "IDENTIDIES_TYPE_CD")
                    ,MapUtils.getString(param, "IDENTITY_NUM"),MapUtils.getString(param, "NAME"),MapUtils.getString(param, "ADDRESS_STR")
                    ,MapUtils.getString(param, "CONTACT_NO")};
            int[] sb3ParamType = {Types.INTEGER, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR
                    , Types.VARCHAR, Types.VARCHAR};
            
	        jdbc.update(sb3.toString(),sb3ParamObj,sb3ParamType);  
	        
	        List offerlist = (List)param.get("openofferMap");
	        String sb4 = "";
	        for (int i=0;i<offerlist.size();i++){
	        	Map offermap = (Map)offerlist.get(i);
	        	//销售品信息
	        	if("0".equals(offermap.get("type").toString()) || "1".equals(offermap.get("type").toString())){
	        		String SB_OFFER_ITEM_ID_SEQ = "SELECT OFFER_ITEM_ID_SEQ.NEXTVAL FROM DUAL";
	                int OFFER_ITEM_ID_SEQ = jdbc.queryForInt(SB_OFFER_ITEM_ID_SEQ);
	        		sb4 = "INSERT INTO OFFER_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,OFFER_SPEC_NAME,OFFER_SPEC_CD,OFFER_TYPE_CD,CREATE_DATE,APP_START_DT,APP_END_DT,START_DT,END_DT,STATE) "+
	        				 "VALUES(?,?,?,?,?,SYSDATE,'','','','',?)";
	        		
	        		Object[] sb4ParamObj = {OFFER_ITEM_ID_SEQ,Serialnumber,offermap.get("name")
	                        ,offermap.get("id"),offermap.get("type"),offermap.get("proactiontype")};
	                int[] sb4ParamType = {Types.INTEGER,Types.INTEGER, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
	                
	        		jdbc.update(sb4.toString(),sb4ParamObj,sb4ParamType);
	        		
	        		ArrayList<Object> dealerlist = new ArrayList<Object>();
	        		//翼销售get("dealerMap")结点为HsahMap,4G为List，分支兼容
	        		if(param.get("dealerMap") instanceof List){
		        		dealerlist = (ArrayList)param.get("dealerMap");
	        		}else{
	        			for (String k : ((HashMap<String, Object>) param.get("dealerMap")).keySet()) {
	        				dealerlist.add(((HashMap<String, Object>) param.get("dealerMap")).get(k));
	        			}
	        		}
	        		for (int x=0;x<dealerlist.size();x++){
	        			Map dealermap = (Map)dealerlist.get(x);
	        			if(dealermap.get("detype").toString().equals(offermap.get("type").toString()) && dealermap.get("dename").toString().equals(offermap.get("name").toString())){
	        				String SB_BUSI_DEVELOP_ID_SEQ = "SELECT BUSI_DEVELOP_ID_SEQ.NEXTVAL FROM DUAL";
	                        int BUSI_DEVELOP_ID_SEQ = jdbc.queryForInt(SB_BUSI_DEVELOP_ID_SEQ);
	                        String SB_BO_STAFF_RELA_ID_SEQ = "SELECT BO_STAFF_RELA_ID_SEQ.NEXTVAL FROM DUAL";
	                        int BO_STAFF_RELA_ID_SEQ = jdbc.queryForInt(SB_BO_STAFF_RELA_ID_SEQ);
	                        //业务发展人
	                        String sb9 = "INSERT INTO BUSI_STAFF_RELA(BO_STAFF_RELA_ID,PARTY_RELA_ROLE_CD,STAFF_ID,STAFF_NBR,SALE_NBR,SALE_NAME,DEVELOP_TYPE,ORG_ID,CREATE_DT) "+
					           			 "VALUES(?,'',?,?,?,?,?,'',SYSDATE)";
	                        
	                        Object[] sb9ParamObj = {BO_STAFF_RELA_ID_SEQ,dealermap.get("STAFF_ID"),dealermap.get("STAFF_NBR")
	                                ,dealermap.get("SALE_NBR"),dealermap.get("SALE_NAME"),dealermap.get("DEVELOP_TYPE")};
	                        int[] sb9ParamType = {Types.INTEGER,Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
	                        
					        jdbc.update(sb9.toString(),sb9ParamObj,sb9ParamType);
	                        //业务发展对象
	                        String sb8 = "INSERT INTO BUSI_DEVELOP_OBJ(BUSI_DEVELOP_ID,BO_STAFF_RELA_ID,OFFER_ORDER_ITEM_ID,PROD_ORDER_ITEM_ID,COUP_ORDER_ITEM_ID) "+
	                        			 "VALUES(?,?,?,'','')";
	                        
	                        Object[] sb8ParamObj = {BUSI_DEVELOP_ID_SEQ,BO_STAFF_RELA_ID_SEQ,OFFER_ITEM_ID_SEQ};
	                        int[] sb8ParamType = {Types.INTEGER,Types.INTEGER,Types.INTEGER };
	                        
	                        jdbc.update(sb8.toString(),sb8ParamObj,sb8ParamType);
	        			}
	        		}//产品信息
	        	}else if("2".equals(offermap.get("type").toString())){
	        		sb4 = "INSERT INTO PRODUCT_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,PROD_SPEC_ID,IS_ACCESS_PROD,PROD_SPEC_CD,PROD_SPEC_NAME,ACCESS_NBR,PROD_PWD,PAYMENT_TYPE_CD,CREATE_DATE,STATE)"+
			        		"VALUES(PRODUCT_ITEM_ID_SEQ.NEXTVAL,?,?,'N',?,?,'','','',sysdate,?)";
	        		
	        		Object[] sb4ParamObj = {Serialnumber,MapUtils.getString(param, "PROD_SPEC_ID"),offermap.get("id")
                            ,offermap.get("name"),offermap.get("proactiontype")};
                    int[] sb4ParamType = {Types.INTEGER,Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
                    
	        		jdbc.update(sb4.toString(),sb4ParamObj,sb4ParamType);
	        	}
	        }
	        //产品信息
	        String sb5 = "INSERT INTO PRODUCT_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,PROD_SPEC_ID,IS_ACCESS_PROD,PROD_SPEC_CD,PROD_SPEC_NAME,ACCESS_NBR,PROD_PWD,PAYMENT_TYPE_CD,CREATE_DATE,STATE) "+
						 "VALUES(PRODUCT_ITEM_ID_SEQ.NEXTVAL,?,?,'Y','','',?,?,?,SYSDATE,'ADD')";
	        
	        Object[] sb5ParamObj = {Serialnumber,MapUtils.getString(param, "PROD_SPEC_ID"),MapUtils.getString(param, "ACCESS_NBR")
                    ,MapUtils.getString(param, "PROD_PWD"),MapUtils.getString(param, "PAYMENT_TYPE_CD")};
            int[] sb5ParamType = {Types.INTEGER,Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
            
	        jdbc.update(sb5.toString(),sb5ParamObj,sb5ParamType);
	        //物品信息
	        if(!"".equals(param.get("uimcode").toString())){
	        	String sb6 = "INSERT INTO COUPON_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,COUPON_TYPE_CD,COUPON_SPEC_ID,COUPON_INST_NBR,COUPON_NAME,STATE) "+
		         			 "VALUES(COUPON_ITEM_ID_SEQ.NEXTVAL,?,'1','',?,'','ADD')";
	        	
	        	Object[] sb6ParamObj = {Serialnumber,MapUtils.getString(param, "uimcode")};
                int[] sb6ParamType = {Types.INTEGER,Types.VARCHAR};
                
	        	jdbc.update(sb6.toString(),sb6ParamObj,sb6ParamType);
	        }
	        //物品信息
	        if(!"".equals(param.get("terminalcode").toString())){
	        	String sb7 = "INSERT INTO COUPON_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,COUPON_TYPE_CD,COUPON_SPEC_ID,COUPON_INST_NBR,COUPON_NAME,STATE) "+
		         			 "VALUES(COUPON_ITEM_ID_SEQ.NEXTVAL,?,'2','',?,'','ADD')";
	        	
	        	Object[] sb7ParamObj = {Serialnumber,MapUtils.getString(param, "terminalcode")};
                int[] sb7ParamType = {Types.INTEGER,Types.VARCHAR};
                
	        	jdbc.update(sb7.toString(),sb7ParamObj,sb7ParamType);
	        }
	        //发票记录
	        String SB_INVOICE_PRESO_ID_SEQ = "SELECT INVOICE_PRESO_ID_SEQ.NEXTVAL FROM DUAL";
	        int INVOICE_PRESO_ID_SEQ = jdbc.queryForInt(SB_INVOICE_PRESO_ID_SEQ);
	        String sb10 = "INSERT INTO INVOICE_PRESO(INVOICE_ID,PRINT_COUNT,PRINT_FLAG,INVOICE_TYPE,CREATED_DATE,STAFF_ID,REAL_PAY,TAX) "+
	        			  "VALUES(?,'0','2','58B',SYSDATE,?,?,'')";
	        
	        Object[] sb10ParamObj = {INVOICE_PRESO_ID_SEQ,MapUtils.getString(param, "STAFF_ID"),MapUtils.getString(param, "paytotal")};
            int[] sb10ParamType = {Types.INTEGER,Types.VARCHAR, Types.VARCHAR};
            
	        jdbc.update(sb10.toString(),sb10ParamObj,sb10ParamType);
	        //订单帐目费用
	        List paylist = (List)param.get("paymentMap");
			for (int y=0;y<paylist.size();y++){
				Map paymap = (Map)paylist.get(y);
				int ACCT_ITEM_TYPE_ID = 0;
				if("".equals(paymap.get("ACCT_ITEM_TYPE_ID").toString())){
					String SB_PRESO_ACCT_ITEM_TYPE_ID_SEQ = "SELECT PRESO_ACCT_ITEM_TYPE_ID_SEQ.NEXTVAL FROM DUAL";
					ACCT_ITEM_TYPE_ID = jdbc.queryForInt(SB_PRESO_ACCT_ITEM_TYPE_ID_SEQ);
				}else{
					ACCT_ITEM_TYPE_ID = Integer.parseInt((String) paymap.get("ACCT_ITEM_TYPE_ID")) ;
				}
		        String sb11 = "INSERT INTO ORDER_FEE(CUST_ORDER_ID,ACCT_ITEM_TYPE_ID,ACCT_ITEM_TYPE,PAY_METHOD_CD,INVOICE_ID,ACCT_ITEM_FEE,ACCT_ITEM_FEE_DEMO,CREATE_DATE) "+
				  			  "VALUES(?,?,?,?,?,?,'',SYSDATE)";
		        
		        Object[] sb11ParamObj = {Serialnumber,ACCT_ITEM_TYPE_ID,paymap.get("ACCT_ITEM_TYPE")
                        ,paymap.get("PAY_METHOD_CD"),INVOICE_PRESO_ID_SEQ,paymap.get("ACCT_ITEM_FEE")};
                int[] sb11ParamType = {Types.INTEGER,Types.INTEGER, Types.VARCHAR, Types.VARCHAR, Types.INTEGER, Types.VARCHAR};
                
		        jdbc.update(sb11.toString(),sb11ParamObj,sb11ParamType);
			}
			
			//终端预约订单属性，关联agent_portal_config表
			if (param.containsKey("terminalinfo")) {
				ArrayList<Object> terminalinfolist = new ArrayList<Object>();				
				//翼销售get("terminalinfo")结点为HsahMap,4G为List，分支兼容
        		if(param.get("terminalinfo") instanceof List){
        			terminalinfolist = (ArrayList)param.get("terminalinfo");
        		}else{
        			for (String k : ((HashMap<String, Object>) param.get("terminalinfo")).keySet()) {
    					terminalinfolist.add(((HashMap<String, Object>) param.get("terminalinfo")).get(k));
    				}
        		}			
				for(int i=0;i<terminalinfolist.size();i++){
					Map termap = (Map)terminalinfolist.get(i);
					String sql = "INSERT INTO PRESO_ORDER_ATTR(CUST_ORDER_ID,ATTR_ID,ATTR_VALUE_ID,VALUE) VALUES(?,?,'',?)";
					
					Object[] sqlParamObj = {Serialnumber,termap.get("Id"),termap.get("value")};
	                int[] sqlParamType = {Types.INTEGER,Types.VARCHAR, Types.VARCHAR};
	                
					jdbc.update(sql.toString(),sqlParamObj,sqlParamType);
				}
			}
	        
	        reallmap.put("INVOICE_ID", INVOICE_PRESO_ID_SEQ);
	        reallmap.put("CUST_ORDER_ID", Serialnumber);
	        reallmap.put("CUST_SO_NUMBER", CUST_SO_NUMBER);
    	}
        return reallmap ;
    }
    
    @SuppressWarnings("unchecked")
    public Map queryorderyslinfo(Map<String, Object> param,String dbKeyWord) throws Exception {
    	Map reallmap = new HashMap();
    	if(param.get("queryflag")!=null && "9".equals(param.get("queryflag"))){
    		//终端预约，查询证件号码是否已订购终端
    		String sql = "SELECT COUNT(1) FROM CUST_ORDER A,CUST_ITEM B WHERE A.CUST_ORDER_ID=B.CUST_ORDER_ID AND A.ACTION_TYPE_CD='9' AND A.STATUS_CD!='3' AND B.IDENTITY_NUM= ? ";
    		
    		Object[] sqlParamObj = {param.get("IdentityCard")};
            int[] sqlParamType = {Types.VARCHAR};
    		
    		int sqlcount = jdbc.queryForInt(sql.toString(),sqlParamObj,sqlParamType);
    		reallmap.put("sqlcount", sqlcount);
    		return reallmap;
    	}
    	if(param.get("detail")==null){
    	    int k =0;
    	    Object[] sbParamObj = new Object[20];
            int[] sbParamType = new int[20];
    	    
	    	String sb1 = "SELECT cust_order_id,cust_so_number,name,access_nbr,common_region_name,channel_name,status_cd,rownum rn FROM("+
	    				 "SELECT a.cust_order_id,a.cust_so_number,b.name,c.access_nbr,a.common_region_name,a.channel_name,a.status_cd,ROWNUM rn from CUST_ORDER a,CUST_ITEM b,PRODUCT_ITEM c where "+
	    				 "a.cust_order_id = b.cust_order_id and a.cust_order_id=c.cust_order_id and c.is_access_prod='Y' and (a.status_cd='1' or a.status_cd='2') "+
	    				 "and a.accept_time between (to_date('"+param.get("startDt")+"','yyyy/mm/dd hh24:mi:ss')) and (to_date('"+param.get("endDt")+"','yyyy/mm/dd hh24:mi:ss') ) "+
	    				 "and a.common_region_id= ? ";
	    	String sb2 = "select count(1) from CUST_ORDER a,CUST_ITEM b,PRODUCT_ITEM c where "+
						 "a.cust_order_id = b.cust_order_id and a.cust_order_id=c.cust_order_id and c.is_access_prod='Y' and (a.status_cd='1' or a.status_cd='2') "+
						 "and a.accept_time between (to_date('"+param.get("startDt")+"','yyyy/mm/dd hh24:mi:ss')) and (to_date('"+param.get("endDt")+"','yyyy/mm/dd hh24:mi:ss') ) "+
						 "and a.common_region_id= ? ";
	    	
	    	sbParamObj[k] = param.get("areaId");
	    	sbParamType[k] = Types.VARCHAR;
	    	k++;
	    	
	    	if(!"".equals(param.get("busitype"))){
	    		sb1+="AND A.BUSI_TYPE_CD= ? ";
	    		sb2+="AND A.BUSI_TYPE_CD= ? ";
	    		
	    		sbParamObj[k] = param.get("busitype");
	            sbParamType[k] = Types.VARCHAR;
	            k++;
	    	}
	    	if(!"".equals(param.get("olNbr"))){
	    		sb1+="AND A.CUST_SO_NUMBER= ? ";
	    		sb2+="AND A.CUST_SO_NUMBER= ? ";
	    		
	    		sbParamObj[k] = param.get("olNbr");
	            sbParamType[k] = Types.VARCHAR;
	            k++;
	    	}			 
	    	if(!"".equals(param.get("channelId"))){
	    		sb1+="AND A.CHANNEL_ID= ? ";
	    		sb2+="AND A.CHANNEL_ID= ? ";
	    		
	    		sbParamObj[k] = param.get("channelId");
	            sbParamType[k] = Types.VARCHAR;
	            k++;
	    	}
	    	if(!"".equals(param.get("accnum"))){
	    		sb1+="AND C.ACCESS_NBR= ? ";
	    		sb2+="AND C.ACCESS_NBR= ? ";
	    		
	    		sbParamObj[k] = param.get("accnum");
	            sbParamType[k] = Types.VARCHAR;
	            k++;
	    	}
	    	if(!"".equals(param.get("custname"))){
	    		sb1+="AND B.NAME= ? ";
	    		sb2+="AND B.NAME= ? ";
	    		
	    		sbParamObj[k] = param.get("custname");
	            sbParamType[k] = Types.VARCHAR;
	            k++;
	    	}
	    	if(!"".equals(param.get("CustIdCard"))){
	    		sb1+="AND B.IDENTITY_NUM= ? ";
	    		sb2+="AND B.IDENTITY_NUM= ? ";
	    		
	    		sbParamObj[k] = param.get("CustIdCard");
	            sbParamType[k] = Types.VARCHAR;
	            k++;
	    	}
	    	sb1+=") WHERE RN>= ? AND ? >=RN ORDER BY CUST_ORDER_ID";
	    	
	    	sbParamObj[k] = param.get("nowPage");
            sbParamType[k] = Types.INTEGER;
            k++;
            sbParamObj[k] = param.get("pageSize");
            sbParamType[k] = Types.INTEGER;
            k++;
	    	List rList = null;
	    	
            Object[] subParamObj = ArrayUtils.subarray(sbParamObj, 0, k);
            int[] subParamType = ArrayUtils.subarray(sbParamType, 0, k);
            
	        rList = jdbc.queryForList(sb1.toString(),subParamObj,subParamType);
//	        int totalCnt = jdbc.queryForInt(sb2.toString(),subParamObj,subParamType);
	        int totalCnt = jdbc.queryForInt(sb2.toString(),ArrayUtils.subarray(sbParamObj, 0, k-2),ArrayUtils.subarray(sbParamType, 0, k-2));
	        reallmap.put("orderLists", rList);
	        reallmap.put("totalCnt", totalCnt);
    	}else{
    		String cust_so_number = param.get("cust_so_number").toString();
    		//客户预受理订单
    		String sb3 = "SELECT a.*, b.busi_type_name FROM CUST_ORDER A, BUSI_TYPE B "+
    					 "WHERE A.BUSI_TYPE_CD = B.BUSI_TYPE_CD  AND A.CUST_SO_NUMBER= ?";
    		
    		Object[] sb3ParamObj = {cust_so_number};
            int[] sb3ParamType = {Types.VARCHAR};
            
    		List CUST_ORDER = jdbc.queryForList(sb3.toString(),sb3ParamObj,sb3ParamType);
    		reallmap.put("CUST_ORDER", CUST_ORDER);
    		//CUST_ORDER_ID
    		Map CUST_ORDER_Map = (Map)CUST_ORDER.get(0);
    		String CUST_ORDER_ID = CUST_ORDER_Map.get("CUST_ORDER_ID").toString();
    		//客户资料
    		String sb4 = "SELECT * FROM CUST_ITEM A WHERE A.CUST_ORDER_ID= ?";
    		
    		Object[] sb4ParamObj = {CUST_ORDER_ID};
            int[] sb4ParamType = {Types.VARCHAR};
            
    		List CUST_ITEM = jdbc.queryForList(sb4.toString(),sb4ParamObj,sb4ParamType);
    		reallmap.put("CUST_ITEM", CUST_ITEM);
    		//套餐信息
    		String sb5 = "SELECT * FROM OFFER_ITEM A WHERE A.CUST_ORDER_ID= ? AND A.OFFER_TYPE_CD='0'";
    		
    		Object[] sb5ParamObj = {CUST_ORDER_ID};
            int[] sb5ParamType = {Types.VARCHAR};
            
    		List taocan = jdbc.queryForList(sb5.toString(),sb5ParamObj,sb5ParamType);
    		reallmap.put("taocan", taocan);
    		//开通/关闭
    		String sb6 = "SELECT * FROM OFFER_ITEM A WHERE A.CUST_ORDER_ID= ? AND A.OFFER_TYPE_CD='1'";
    		
    		Object[] sb6ParamObj = {CUST_ORDER_ID};
            int[] sb6ParamType = {Types.VARCHAR};
            
    		List kexuanbao = jdbc.queryForList(sb6.toString(),sb6ParamObj,sb6ParamType);
    		
    		String sb7 = "SELECT * FROM PRODUCT_ITEM A WHERE A.CUST_ORDER_ID= ? AND A.IS_ACCESS_PROD='N'";
    		
    		Object[] sb7ParamObj = {CUST_ORDER_ID};
            int[] sb7ParamType = {Types.VARCHAR};
            
    		List gnchanpin = jdbc.queryForList(sb7.toString(),sb7ParamObj,sb7ParamType);
    		List openlist= new ArrayList();
    		List closelist=new ArrayList();
    		for (int i=0;i<kexuanbao.size();i++){
    			Map OFFER_ITEM_Map = (Map)kexuanbao.get(i);
    			if("ADD".equals(OFFER_ITEM_Map.get("STATE"))){
    				openlist.add(OFFER_ITEM_Map);
    			}else if("DEL".equals(OFFER_ITEM_Map.get("STATE"))){
    				closelist.add(OFFER_ITEM_Map);
    			}
    		}
    		for (int j=0;j<gnchanpin.size();j++){
    			Map PRODUCT_ITEM_Map = (Map)gnchanpin.get(j);
    			if("ADD".equals(PRODUCT_ITEM_Map.get("STATE"))){
    				openlist.add(PRODUCT_ITEM_Map);
    			}else if("DEL".equals(PRODUCT_ITEM_Map.get("STATE"))){
    				closelist.add(PRODUCT_ITEM_Map);
    			}
    		}
    		reallmap.put("openlist", openlist);
    		reallmap.put("closelist", closelist);
    		//产品信息
    		String sb8 = "SELECT * FROM PRODUCT_ITEM A WHERE A.CUST_ORDER_ID= ? AND A.IS_ACCESS_PROD='Y'";
    		
    		Object[] sb8ParamObj = {CUST_ORDER_ID};
            int[] sb8ParamType = {Types.VARCHAR};
            
    		List PRODUCT_ITEM = jdbc.queryForList(sb8.toString(),sb8ParamObj,sb8ParamType);
    		reallmap.put("PRODUCT_ITEM", PRODUCT_ITEM);
    		//物品信息
    		String sb9 = "SELECT * FROM COUPON_ITEM T WHERE T.CUST_ORDER_ID= ? ";
    		
    		Object[] sb9ParamObj = {CUST_ORDER_ID};
            int[] sb9ParamType = {Types.VARCHAR};
            
    		List COUPON_ITEM = jdbc.queryForList(sb9.toString(),sb9ParamObj,sb9ParamType);
    		reallmap.put("COUPON_ITEM", COUPON_ITEM);
    		//发展人
    		String sb10 = "SELECT c.*, e.offer_spec_cd,e.offer_spec_name,e.offer_type_cd FROM BUSI_STAFF_RELA C, BUSI_DEVELOP_OBJ D, OFFER_ITEM E " +
    					  "WHERE D.OFFER_ORDER_ITEM_ID = E.ORDER_ITEM_ID AND D.BO_STAFF_RELA_ID = C.BO_STAFF_RELA_ID AND C.BO_STAFF_RELA_ID IN "+
    					  "(SELECT a.bo_staff_rela_id FROM BUSI_DEVELOP_OBJ A WHERE A.OFFER_ORDER_ITEM_ID IN "+
    					  "(SELECT b.order_item_id  FROM OFFER_ITEM B "+
    					  "WHERE B.CUST_ORDER_ID = ?)) ORDER BY E.OFFER_TYPE_CD,E.OFFER_SPEC_CD";
    		
    		Object[] sb10ParamObj = {CUST_ORDER_ID};
            int[] sb10ParamType = {Types.VARCHAR};
            
    		List BUSI_STAFF_RELA = jdbc.queryForList(sb10.toString(),sb10ParamObj,sb10ParamType);
    		reallmap.put("BUSI_STAFF_RELA", BUSI_STAFF_RELA);
//    		String sb12 = "select c.*, e.offer_spec_cd,e.offer_spec_name from BUSI_STAFF_RELA c, BUSI_DEVELOP_OBJ d, OFFER_ITEM e " +
//    					  "where d.OFFER_ORDER_ITEM_ID = e.order_item_id and d.BO_STAFF_RELA_ID = c.bo_staff_rela_id and c.bo_staff_rela_id in "+
//						  "(select a.bo_staff_rela_id from BUSI_DEVELOP_OBJ a where a.offer_order_item_id in "+
//						  "(select b.order_item_id  from OFFER_ITEM b "+
//						  "where b.offer_type_cd='1' and b.cust_order_id = '"+CUST_ORDER_ID+"'))";
//			List KX_BUSI_STAFF_RELA = jdbc.queryForList(sb12.toString());
//			reallmap.put("KX_BUSI_STAFF_RELA", KX_BUSI_STAFF_RELA);
    		//费用
    		String sb11 = "SELECT a.*,b.name FROM ORDER_FEE A,PAYMENT_METHOD_PRESO B WHERE "+
    					  "A.PAY_METHOD_CD=B.PAY_METHOD_CD AND A.CUST_ORDER_ID= ? ";
    		
    		Object[] sb11ParamObj = {CUST_ORDER_ID};
            int[] sb11ParamType = {Types.VARCHAR};
            
    		List ORDER_FEE = jdbc.queryForList(sb11.toString(),sb11ParamObj,sb11ParamType);
    		reallmap.put("ORDER_FEE", ORDER_FEE);
    	}
    	return reallmap;
    }
    
    @SuppressWarnings({ "deprecation", "unchecked" })
    public Map updateorderzdyyinfo(Map<String, Object> param,String dbKeyWord) throws Exception {
    	if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
    	Map reallmap = new HashMap();
		String sb = "UPDATE CUST_ORDER SET STATUS_CD = ? WHERE CUST_SO_NUMBER = ? ";
		
		Object[] sbParamObj = {MapUtils.getString(param, "status_cd"),MapUtils.getString(param, "cust_so_number")};
        int[] sbParamType = {Types.VARCHAR, Types.VARCHAR};
        
		jdbc.update(sb.toString(),sbParamObj,sbParamType);
		
    	StringBuffer insertStr=new StringBuffer();
    	insertStr.append(" INSERT INTO PRESO_ORDER_HANDLE(CUST_ORDER_ID,SEQ,STAFF_ID,CHANNEL_ID,COMMON_REGION_ID,STATUS_CD,STATUS_DT)");
    	insertStr.append(" VALUES( ? ,PRESO_ORDER_HANDLE_ID_SEQ.NEXTVAL");
    	insertStr.append(",? ,? ,? ,? ");
    	insertStr.append(",to_date('"+DateUtil.getFormatTimeString(Calendar.getInstance().getTime(), DateUtil.DATE_FORMATE_STRING_A)+"','yyyy-mm-dd hh24:mi:ss'))");
    	
    	Object[] insertStrParamObj = {MapUtils.getString(param, "cust_order_id"),MapUtils.getString(param, "staff_id")
    	        ,MapUtils.getString(param, "channel_id"),MapUtils.getString(param, "areaid"),MapUtils.getString(param, "status_cd")};
        int[] insertStrParamType = {Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
        
        
    	jdbc.update(insertStr.toString(),insertStrParamObj,insertStrParamType);
    	
        return reallmap ;
    }
    
    @SuppressWarnings("unchecked")
    public Map queryorderzdyyinfo(Map<String, Object> param,String dbKeyWord) throws Exception {
    	if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
    	Map reallmap = new HashMap();
    	if(param.get("detail")==null){
    	
		String startDt=param.get("startDt").toString();
		String endDt=param.get("endDt").toString();
		String areaId=param.get("areaId").toString();
		String areaHead = areaId;
		
		//地区ID处理
		if(StringUtils.isNotBlank(areaId)&&7==areaId.length()){
			String level1=areaId.substring(5,7);
			String level2=areaId.substring(3,7);
			if("00".equals(level1)){
				areaHead = areaId.substring(0,5);
			}
			if("0000".equals(level2)){
				areaHead = areaId.substring(0,3);
			}
		}
		
		String whereCon="";
		String whereCom=" WHERE A.ACCEPT_TIME BETWEEN (TO_DATE('"+startDt+"','yyyy/mm/dd hh24:mi:ss')) AND (TO_DATE('"+endDt+"','yyyy/mm/dd hh24:mi:ss') ) AND A.COMMON_REGION_ID LIKE '"+areaHead+"%' ";
		String fromTable = "  FROM CUST_ORDER A LEFT JOIN CUST_ITEM B ON A.CUST_ORDER_ID = B.CUST_ORDER_ID LEFT JOIN PRESO_ORDER_ATTR C ON A.CUST_ORDER_ID = C.CUST_ORDER_ID ";
		
		StringBuffer sb1=new StringBuffer();
		StringBuffer sb2=new StringBuffer();
		StringBuffer sb3=new StringBuffer();
		
		//查询sql
		sb1.append("SELECT cust_order_id,cust_so_number,name,contact_no,common_region_name,channel_name,status_cd,rownum rn ");
		sb1.append("  FROM (select aa.*, rownum rn");
		sb1.append("  FROM (SELECT a.cust_order_id,a.cust_so_number,b.name,b.contact_no,a.common_region_name,a.channel_name,a.status_cd");
		sb1.append(fromTable);
		
		//总记录数
		sb2.append("SELECT COUNT(DISTINCT a.cust_order_id) ");
		sb2.append(fromTable);
		
		//预约总数，已销售总数，已取消总数		
		sb3.append("SELECT status_cd, count(status_cd) num");
		sb3.append("  FROM (SELECT DISTINCT a.cust_order_id, a.status_cd ");
		sb3.append(fromTable);

		//计数
		int k=0;
		Object[] sbParamObj = new Object[20];
        int[] sbParamType = new int[20];
        
    	if(!"".equals(param.get("busitype"))){
    		whereCon+="AND A.BUSI_TYPE_CD= ? ";
    		sbParamObj[k] = param.get("busitype");
    		sbParamType[k] = Types.VARCHAR;
    		k++;
    	}
    	if(!"".equals(param.get("olNbr"))){
    		whereCon+="AND A.CUST_SO_NUMBER= ? ";
    		sbParamObj[k] = param.get("olNbr");
            sbParamType[k] = Types.VARCHAR;
            k++;
    	}			 
    	if(!"".equals(param.get("channelId"))){
    		whereCon+="AND A.CHANNEL_ID= ? ";
    		sbParamObj[k] = param.get("channelId");
            sbParamType[k] = Types.VARCHAR;
            k++;
    	}
    	if(!"".equals(param.get("accnum"))){
    		whereCon+="AND B.CONTACT_NO= ? ";
    		sbParamObj[k] = param.get("accnum");
            sbParamType[k] = Types.VARCHAR;
            k++;
    	}
    	if(!"".equals(param.get("custname"))){
    		whereCon+="AND B.NAME= ? ";
    		sbParamObj[k] = param.get("custname");
            sbParamType[k] = Types.VARCHAR;
            k++;
    	}
    	if(!"".equals(param.get("CustIdCard"))){
    		whereCon+="AND B.IDENTITY_NUM= ? ";
    		sbParamObj[k] = param.get("CustIdCard");
            sbParamType[k] = Types.VARCHAR;
            k++;
    	}
    	if(!"".equals(param.get("olType"))){
    		whereCon+="AND C.VALUE = ? ";
    		sbParamObj[k] = param.get("olType");
            sbParamType[k] = Types.VARCHAR;
            k++;
    	}
    	
    	//添加where条件
    	sb1.append(whereCom).append(whereCon);
    	sb1.append(" GROUP BY A.CUST_ORDER_ID,A.CUST_SO_NUMBER,B.NAME,B.CONTACT_NO,A.COMMON_REGION_NAME,A.CHANNEL_NAME,A.STATUS_CD");
    	sb1.append(" ORDER BY CUST_ORDER_ID) AA");
    	sb1.append(") WHERE rn>= ? AND ? >=rn ORDER BY CUST_ORDER_ID");
    	
    	sbParamObj[k] = param.get("nowPage");
        sbParamType[k] = Types.INTEGER;
        k++;
        sbParamObj[k] = param.get("pageSize");
        sbParamType[k] = Types.INTEGER;
    	k++;
    	
    	Object[] subParamObj = ArrayUtils.subarray(sbParamObj,0,k);
        int[] subParamType = ArrayUtils.subarray(sbParamType,0,k);
        
    	sb2.append(whereCom).append(whereCon);
    	sb3.append(whereCom).append(whereCon).append(") GROUP BY STATUS_CD ORDER BY STATUS_CD");
        
    	List rList = jdbc.queryForList(sb1.toString(),subParamObj,subParamType);
        int totalCnt = jdbc.queryForInt(sb2.toString(),subParamObj,subParamType);
        
        List<Map<String, Object>> countList=jdbc.queryForList(sb3.toString(),subParamObj,subParamType);
        
		String countInfo = "总数量:" + totalCnt + ";";
		for (Map<String, Object> map : countList) {
			if ("1".equals(map.get("status_cd"))) {
				countInfo += "预定未领数:" + map.get("num") + ";";
			} else if ("2".equals(map.get("status_cd"))) {
				countInfo += "已销售数:" + map.get("num") + ";";
			} else if ("3".equals(map.get("status_cd"))) {
				countInfo += "已取消数:" + map.get("num") + ";";
			}
		}
        
        reallmap.put("orderLists", rList);
        reallmap.put("totalCnt", totalCnt);
        reallmap.put("countInfo", countInfo);
    	}else{
    		String cust_so_number = param.get("cust_so_number").toString();
    		//终端预约订单详细
    		String sb = "SELECT * FROM CUST_ORDER A LEFT JOIN CUST_ITEM B ON A.CUST_ORDER_ID=B.CUST_ORDER_ID "+
    					 "WHERE A.BUSI_TYPE_CD='9' AND A.CUST_SO_NUMBER= ?";
    		
    		Object[] sbParamObj = {cust_so_number};
            int[] sbParamType = {Types.VARCHAR};
    		
    		List CUST_ORDER = jdbc.queryForList(sb.toString(),sbParamObj,sbParamType);
    		if(null!=CUST_ORDER&&CUST_ORDER.size()==1)
    		reallmap.put("CUST_ORDER", CUST_ORDER.get(0));
    		
    		StringBuffer sb1=new StringBuffer();
    		sb1.append("SELECT a.cust_order_id,a.attr_id,a.value,b.column_value_name value_name,c.cust_so_number,c.busi_type_cd ");
			sb1.append("  FROM PRESO_ORDER_ATTR A ");
			sb1.append("  LEFT JOIN AGENT_PORTAL_CONFIG B ");
			sb1.append("    ON A.ATTR_ID = B.CONF_ID ");
			sb1.append("    LEFT JOIN CUST_ORDER C ON A.CUST_ORDER_ID=C.CUST_ORDER_ID ");
			sb1.append(" WHERE B.TABLE_NAME = 'PRESO_ORDER_ATTR' ");
			sb1.append("   AND B.COLUMN_NAME = 'ATTR_ID' ");
			sb1.append("   AND C.BUSI_TYPE_CD='9' ");
			sb1.append("   AND C.CUST_SO_NUMBER= ?");
			
			Object[] sb1ParamObj = {cust_so_number};
            int[] sb1ParamType = {Types.VARCHAR};
            
			List CUST_ORDER_ATTR=jdbc.queryForList(sb1.toString(),sb1ParamObj,sb1ParamType);
			reallmap.put("CUST_ORDER_ATTR", CUST_ORDER_ATTR);
    	}
	    return reallmap;
    }
 
    public long GetTranId(Map<String, Object> param,String dbKeyWord) throws Exception {
    	if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
    	String seq = MapUtils.getString(param, "seq", "");
		String LTE_TRANSACTIONID_SEQ = "select "+seq+".nextval from dual";
        long LTE_TRANSACTIONID = jdbc.queryForLong(LTE_TRANSACTIONID_SEQ);
        return LTE_TRANSACTIONID;
	}
    
    public List insertloginsession(Map<String, Object> param) throws Exception {
    	List rList = null;
    	if("insert".equals(param.get("FLAG"))){
    		String sb = "INSERT INTO TOKEN_STAFF_CACHE(TOKEN,STAFFID,STAFFCODE,STAFFNAME,AREAID,AREACODE,AREANAME,CITYNAME,PROVINCENAME,CREATDATE,STATUS,COL1,COL2,COL3) "+
			"VALUES(?,?,?,?,?,?,?,?,?,SYSDATE,0,'','','')";
    		
    		Object[] sbParamObj = {param.get("TOKEN"),param.get("STAFFID"),param.get("STAFFCODE"),param.get("STAFFNAME")
    		        ,param.get("AREAID"),param.get("AREACODE"),param.get("AREANAME"),param.get("CITYNAME"),param.get("PROVINCENAME")};
            int[] sbParamType = {Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR,Types.INTEGER,Types.VARCHAR,Types.VARCHAR,Types.VARCHAR};
            
			jdbc.update(sb.toString(),sbParamObj,sbParamType);
    	}else if ("select".equals(param.get("FLAG"))){
    		String sb = "SELECT * FROM (SELECT * FROM TOKEN_STAFF_CACHE A WHERE "+
    						" A.TOKEN= ? AND A.STATUS=0 ORDER BY A.CREATDATE DESC )WHERE ROWNUM = 1";
    		
    		Object[] sbParamObj = {param.get("TOKEN")};
            int[] sbParamType = {Types.VARCHAR};
            
    		rList = jdbc.queryForList(sb.toString(),sbParamObj,sbParamType);	
    	}else if ("report".equals(param.get("FLAG"))){
    		String sb = "SELECT * FROM TOKEN_STAFF_CACHE A WHERE A.TOKEN= ? AND A.STATUS=0 AND A.STAFFID= ? ORDER BY A.CREATDATE DESC ";
    		
    		Object[] sbParamObj = {param.get("TOKEN"),param.get("STAFFID")};
            int[] sbParamType = {Types.VARCHAR, Types.VARCHAR};
            
			rList = jdbc.queryForList(sb.toString(),sbParamObj,sbParamType);	
		}else if ("update".equals(param.get("FLAG"))){
			if(param.get("TOKEN")!=null){
				if(StringUtils.isNotBlank(param.get("TOKEN").toString())){
					String sb = "UPDATE TOKEN_STAFF_CACHE A SET A.STATUS=1 WHERE A.TOKEN= ? AND A.STATUS=0 ";
					
					Object[] sbParamObj = {param.get("TOKEN")};
                    int[] sbParamType = {Types.VARCHAR};
                    
					jdbc.update(sb.toString(),sbParamObj,sbParamType);	
				}
			}
		}
        return rList;
	}
    
    public List GetOLpos(Map<String, Object> param) throws Exception {
    	List rList = null;
    	if("insert".equals(param.get("FLAG"))){
    		String sb = "INSERT INTO OL_POS(OLID,OLNBR,TYPECLASS,RESULT,MESSAGE,ACCEPT_TIME,PARAM) "+
			"VALUES(?,?,?,?,?,SYSDATE,?)";
    		
    		Object[] sbParamObj = {param.get("olId"),param.get("olNbr"),param.get("typeclass"),param.get("result"),param.get("message"),param.get("param")};
            int[] sbParamType = {Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
            
			jdbc.update(sb.toString(),sbParamObj,sbParamType);
    	}else if ("update".equals(param.get("FLAG"))){
    		String ud = "UPDATE OL_POS SET TYPECLASS=?, RESULT=?, MESSAGE=? WHERE OLID=? ";
    		
    		Object[] udParamObj = {param.get("typeclass"),param.get("result"),param.get("message"),param.get("olId")};
            int[] udParamType = {Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
    		
    		jdbc.update(ud.toString(),udParamObj,udParamType);
    		if("0".equals(param.get("result"))){
    			String sb = "SELECT * FROM (SELECT * FROM OL_POS A WHERE A.OLID=? ORDER BY A.ACCEPT_TIME DESC ) WHERE ROWNUM = 1";
    			
    			Object[] sbParamObj = {param.get("olId")};
                int[] sbParamType = {Types.VARCHAR};
                
    			rList = jdbc.queryForList(sb.toString(),sbParamObj,sbParamType);	
    		}
    	}else if ("select".equals(param.get("FLAG"))){
			String sb = "SELECT * FROM (SELECT * FROM OL_POS A WHERE A.OLID=? ORDER BY A.ACCEPT_TIME DESC ) WHERE ROWNUM = 1";
			
			Object[] sbParamObj = {param.get("olId")};
            int[] sbParamType = {Types.VARCHAR};
            
			rList = jdbc.queryForList(sb.toString(),sbParamObj,sbParamType);	
    	}
        return rList;
	}
    
    public void insert_sp_busi_run_log(Map<String, Object> param) throws Exception {
		String sb = "INSERT INTO SP_BUSI_RUN_LOG(STAFF_CODE,SESSIONINFO,STATUS_CD,INTF_URL,IDENTIDIES_TYPE,IDENTITY_NUM,CREATED_TIME,OPERATION_PLATFORM,ACTION_IP,CHANNEL_ID,OPERATORS_ID,IN_PARAM) "+
		"VALUES(?,?,?,?,?,?,SYSDATE,?,?,?,?,?)";
		
		Object[] sbParamObj = {param.get("STAFF_CODE"),param.get("SESSIONINFO"),param.get("STATUS_CD")
		            ,param.get("INTF_URL"),param.get("IDENTIDIES_TYPE"),param.get("IDENTITY_NUM")
		            ,param.get("OPERATION_PLATFORM"),param.get("ACTION_IP"),param.get("CHANNEL_ID")
		            ,param.get("OPERATORS_ID"),param.get("IN_PARAM")};
        int[] sbParamType = {Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR
                ,Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR, Types.VARCHAR};
        
		jdbc.update(sb.toString(),sbParamObj,sbParamType);
	}

    //查询蓝牙密钥
	public Map queryBlueToothKey(Map<String, Object> paramMap) throws Exception {
		String sql = "SELECT * FROM SP_BLUETOOTH_KEY S WHERE S.MAC='"+ paramMap.get("mac")+"'";
		
		Object[] sqlParamObj = {paramMap.get("mac")};
        int[] sqlParamType = {Types.VARCHAR};
        
		return jdbc.queryForMap(sql,sqlParamObj,sqlParamType);
	}
}
