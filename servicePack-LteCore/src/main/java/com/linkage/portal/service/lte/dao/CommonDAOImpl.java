package com.linkage.portal.service.lte.dao;

import java.sql.Types;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.MapUtils;
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
    
    public List queryCashChargeLog(Map param,String dbKeyWord) throws Exception {
        String phoneNumber = MapUtils.getString(param, "phoneNumber", "");
        String billingCycle = MapUtils.getString(param, "billingCycle", "");
        String doCashTypeCd = MapUtils.getString(param, "doCashTypeCd", "");
        String reqSerial = MapUtils.getString(param, "reqSerial", "");

        StringBuffer sql = new StringBuffer();
        sql.append("SELECT LDCR.PAY_SERIAL_NBR req_Serial,");
        sql.append("       LDCR.ACC_NBR,");
        sql.append("       to_char(LDCR.CREATE_DATE,'yyyy-MM-dd HH24:MI:SS') paid_Time,");
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
    
    public List querybusitype(Map param,String dbKeyWord) throws Exception {
        StringBuffer sql = new StringBuffer();
        sql.append("select * from busi_type a where a.status_cd='0' order by a.busi_type_cd");
        if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
        List rList = null;
        rList = jdbc.queryForList(sql.toString());
        rList = ObjectUtil.transforKeyLowerCase(rList);
        return rList;
    }
    
    public List querybusiactiontype(Map param,String dbKeyWord) throws Exception {
    	String busitypecd = MapUtils.getString(param, "busitypecd", "");
        StringBuffer sql = new StringBuffer();
        sql.append("select * from busi_action_type a where a.busi_type_cd=?");
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
    
    public Map insertorderyslinfo(Map<String, Object> param,String dbKeyWord) throws Exception {
    	Map reallmap = new HashMap();
    	if(param.get("printflag")!=null){
    		String SB_INVOICE_PRINT_ID_SEQ = "select INVOICE_PRINT_ID_SEQ.nextval from dual";
	        int INVOICE_PRINT_ID_SEQ = jdbc.queryForInt(SB_INVOICE_PRINT_ID_SEQ);
	        List invoiceInfos = (List) param.get("invoiceInfos");
	        Map<String, Object> invoiceInfo = (Map<String, Object>) invoiceInfos.get(0);
	        String sb12 = "insert into INVOICE_PRINT_PRESO(INVOICE_PRINT_ID,INVOICE_ID,INVOICE_NBR,INVOICE_NUM,PRINT_DATE,PRINT_STAFF_ID,CUST_ORDER_ID,CUST_SO_NUMBER,CUST_ID,CUST_NAME,COMMON_REGION_ID,COMMON_REGION_NAME,CHANNEL_ID,CHANNEL_NAME,STAFF_ID,STAFF_NAME,BSS_ORG_ID,BSS_ORG_NAME,ACCT_NBR,ACCT_ID,PAYMETHOD,BUSI_NAME,RMB_UPPER,ACCOUNT_UPPER,ACCOUNT,BILL_TYPE,PRINT_FLAG,PRINT_STATE,STATUS_DATE,BILL_NUM,BILL_CODE)"+
	        			  "values ('"+INVOICE_PRINT_ID_SEQ+"','"+
	        			              MapUtils.getString(invoiceInfo, "invoiceId")+"','"+
	        			              MapUtils.getString(invoiceInfo, "invoiceNbr")+"','"+
	        			              MapUtils.getString(invoiceInfo, "invoiceNum")+"',sysdate,'"+
	        			              MapUtils.getString(param, "STAFF_ID")+"','"+
	        			              MapUtils.getString(invoiceInfo, "custOrderId")+"','"+
	        			              MapUtils.getString(invoiceInfo, "custSoNumber")+"','','"+
	        			              MapUtils.getString(param, "partyName")+"','"+
	        			              MapUtils.getString(param, "areaid")+"','"+
	        			              MapUtils.getString(param, "areaname")+"','"+
	        			              MapUtils.getString(param, "CHANNEL_ID")+"','"+
	        			              MapUtils.getString(param, "channel_name")+"','"+
	        			              MapUtils.getString(param, "STAFF_ID")+"','"+
	        			              MapUtils.getString(param, "STAFF_NAME")+"','"+
	        			              MapUtils.getString(param, "org_id")+"','"+
	        			              MapUtils.getString(param, "org_name")+"','"+
	        			              MapUtils.getString(invoiceInfo, "acctNbr")+"','','"+
	        			              MapUtils.getString(param, "payMethod")+"','"+
	        			              MapUtils.getString(invoiceInfo, "boActionTypeName")+"','"+
	        			              MapUtils.getString(invoiceInfo, "rmbUpper")+"','"+
	        			              MapUtils.getString(invoiceInfo, "accountUpper")+"','"+
	        			              MapUtils.getString(invoiceInfo, "account")+"','"+
	        			              MapUtils.getString(invoiceInfo, "billType")+"','0','0',sysdate,'','')";
	        jdbc.update(sb12.toString());
	        
	        List items = (List) param.get("items");
	        for(int z=0;z<items.size();z++){
	        	Map item = (Map)items.get(z);
	        	String SB_INVOICE_ITEM_ID_SEQ = "select INVOICE_ITEM_ID_SEQ.nextval from dual";
		        int INVOICE_ITEM_ID_SEQ = jdbc.queryForInt(SB_INVOICE_ITEM_ID_SEQ);
		        String sb13 = "insert into INVOICE_DETAIL_PRESO(INVOICE_ITEM_ID,INVOICE_ID,ITEM_VALUE,ITEM_NAME,TAX,TAX_RATE)"+
		        			  "values ('"+INVOICE_ITEM_ID_SEQ+"','"+
		        			  			  MapUtils.getString(invoiceInfo, "invoiceId")+"','"+
		        			  			  item.get("charge")+"','"+
		        			  			  item.get("itemName")+"','','')";
		        jdbc.update(sb13.toString());
	        }
	        
	        String sb14 = "update INVOICE_PRESO set PRINT_COUNT=1 where INVOICE_ID = "+MapUtils.getString(invoiceInfo, "invoiceId");
	        jdbc.update(sb14.toString());
    	}if(param.get("queryflag")!=null){
    		String sb15 = "update cust_order set status_cd = '"+MapUtils.getString(param, "status_cd")+"' where cust_so_number = '"+MapUtils.getString(param, "cust_so_number")+"'";
    		jdbc.update(sb15.toString());
    	}else{
	        //客户预受理订单序列
    		String sb1 = "select cust_order_id_seq.nextval from dual";
	        int Serialnumber = jdbc.queryForInt(sb1);
	        
	        String CUST_SO_NUMBER = MapUtils.getString(param, "CUST_SO_NUMBER");
	        if("9".equals(MapUtils.getString(param, "BUSI_TYPE_CD"))){
	        	String sql = "select SEQ_RESERVATION_NUMBER.nextval from dual";
	        	int sqlval = jdbc.queryForInt(sql);
	        	if("免费预约".equals(MapUtils.getString(param, "appointmentflag"))){
	        		CUST_SO_NUMBER = "1"+String.valueOf(sqlval);
	        	}else{
	        		CUST_SO_NUMBER = "2"+String.valueOf(sqlval);
	        	}
	        }
	        //客户预受理订单
	        String sb2 = "insert into cust_order(cust_order_id,busi_type_cd,action_type_cd,cust_so_number,staff_id,channel_id,lan_id,accept_time,common_region_id,handle_people_name,remarks,status_cd,status_date,channel_name,common_region_name,staff_nbr)"+
	        			 "values('"+Serialnumber+"','"+
				        			 MapUtils.getString(param, "BUSI_TYPE_CD")+"','"+
				        			 MapUtils.getString(param, "ACTION_TYPE_CD")+"','"+
				        			 CUST_SO_NUMBER+"','"+
				        			 MapUtils.getString(param, "STAFF_ID")+"','"+
				        			 MapUtils.getString(param, "CHANNEL_ID")+"','"+
				        			 MapUtils.getString(param, "areaid")+"',sysdate,'"+
				        			 MapUtils.getString(param, "areaid")+"','','"+
				        			 MapUtils.getString(param, "REMARKS")+"','1',sysdate,'"+
				        			 MapUtils.getString(param, "channel_name")+"','"+
				        			 MapUtils.getString(param, "areaname")+"','"+
				        			 MapUtils.getString(param, "staff_nbr")+"')";
	        jdbc.update(sb2.toString());        			 
	        //客户资料		 	
	        String sb3 = "insert into CUST_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,CUST_TYPE_CD,IDENTIDIES_TYPE_CD,IDENTITY_NUM,NAME,ADDRESS_STR,CONTACT_NO,STATE,LINK_NAME)"+
	        			  "values (CUST_ITEM_ID_SEQ.nextval,'"+
	        			             Serialnumber+"','"+
	        			             MapUtils.getString(param, "CUST_TYPE_CD")+"','"+
				        			 MapUtils.getString(param, "IDENTIDIES_TYPE_CD")+"','"+
				        			 MapUtils.getString(param, "IDENTITY_NUM")+"','"+
				        			 MapUtils.getString(param, "NAME")+"','"+
				        			 MapUtils.getString(param, "ADDRESS_STR")+"','"+
				        			 MapUtils.getString(param, "CONTACT_NO")+"','ADD','')";
	        jdbc.update(sb3.toString());  
	        
	        List offerlist = (List)param.get("openofferMap");
	        String sb4 = "";
	        for (int i=0;i<offerlist.size();i++){
	        	Map offermap = (Map)offerlist.get(i);
	        	//销售品信息
	        	if("0".equals(offermap.get("type").toString()) || "1".equals(offermap.get("type").toString())){
	        		String SB_OFFER_ITEM_ID_SEQ = "select OFFER_ITEM_ID_SEQ.nextval from dual";
	                int OFFER_ITEM_ID_SEQ = jdbc.queryForInt(SB_OFFER_ITEM_ID_SEQ);
	        		sb4 = "insert into OFFER_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,OFFER_SPEC_NAME,OFFER_SPEC_CD,OFFER_TYPE_CD,CREATE_DATE,APP_START_DT,APP_END_DT,START_DT,END_DT,STATE)"+
	        				 "values ('"+OFFER_ITEM_ID_SEQ+"','"+
	        				 			 Serialnumber+"','"+
	        				 			 offermap.get("name")+"','"+
	        				 			 offermap.get("id")+"','"+
	        				 			 offermap.get("type")+"',sysdate,'','','','','"+
	        				 			 offermap.get("proactiontype")+"')";
	        		jdbc.update(sb4.toString());
	        		
	        		ArrayList<Object> dealerlist = new ArrayList<Object>();
	        		for (String k : ((HashMap<String, Object>) param.get("dealerMap")).keySet()) {
	        			dealerlist.add(((HashMap<String, Object>) param.get("dealerMap")).get(k));
					}
//	        		List dealerlist = (List)param.get("dealerMap");
	        		for (int x=0;x<dealerlist.size();x++){
	        			Map dealermap = (Map)dealerlist.get(x);
	        			if(dealermap.get("detype").toString().equals(offermap.get("type").toString()) && dealermap.get("dename").toString().equals(offermap.get("name").toString())){
	        				String SB_BUSI_DEVELOP_ID_SEQ = "select BUSI_DEVELOP_ID_SEQ.nextval from dual";
	                        int BUSI_DEVELOP_ID_SEQ = jdbc.queryForInt(SB_BUSI_DEVELOP_ID_SEQ);
	                        String SB_BO_STAFF_RELA_ID_SEQ = "select BO_STAFF_RELA_ID_SEQ.nextval from dual";
	                        int BO_STAFF_RELA_ID_SEQ = jdbc.queryForInt(SB_BO_STAFF_RELA_ID_SEQ);
	                        //业务发展人
	                        String sb9 = "insert into BUSI_STAFF_RELA(BO_STAFF_RELA_ID,PARTY_RELA_ROLE_CD,STAFF_ID,STAFF_NBR,SALE_NBR,SALE_NAME,DEVELOP_TYPE,ORG_ID,CREATE_DT)"+
					           			 "values ('"+BO_STAFF_RELA_ID_SEQ+"','','"+
					           			 dealermap.get("STAFF_ID")+"','"+
					           			 dealermap.get("STAFF_NBR")+"','"+
					           			 dealermap.get("SALE_NBR")+"','"+
					           			 dealermap.get("SALE_NAME")+"','"+
					           			 dealermap.get("DEVELOP_TYPE")+"','',sysdate)";
					        jdbc.update(sb9.toString());
	                        //业务发展对象
	                        String sb8 = "insert into BUSI_DEVELOP_OBJ(BUSI_DEVELOP_ID,BO_STAFF_RELA_ID,OFFER_ORDER_ITEM_ID,PROD_ORDER_ITEM_ID,COUP_ORDER_ITEM_ID)"+
	                        			 "values ('"+BUSI_DEVELOP_ID_SEQ+"','"+
	                        			 			 BO_STAFF_RELA_ID_SEQ+"','"+
	                        			 			 OFFER_ITEM_ID_SEQ+"','','')";
	                        jdbc.update(sb8.toString());
	        			}
	        		}//产品信息
	        	}else if("2".equals(offermap.get("type").toString())){
	        		sb4 = "insert into PRODUCT_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,PROD_SPEC_ID,IS_ACCESS_PROD,PROD_SPEC_CD,PROD_SPEC_NAME,ACCESS_NBR,PROD_PWD,PAYMENT_TYPE_CD,CREATE_DATE,STATE)"+
			        		"values (PRODUCT_ITEM_ID_SEQ.nextval,'"+
			        				     Serialnumber+"','"+
			        				     MapUtils.getString(param, "PROD_SPEC_ID")+"','N','"+
	        				 			 offermap.get("id")+"','"+
	        				 			 offermap.get("name")+"','','','',sysdate,'"+
	        				 			 offermap.get("proactiontype")+"')";
	        		jdbc.update(sb4.toString());
	        	}
	        }
	        //产品信息
	        String sb5 = "insert into PRODUCT_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,PROD_SPEC_ID,IS_ACCESS_PROD,PROD_SPEC_CD,PROD_SPEC_NAME,ACCESS_NBR,PROD_PWD,PAYMENT_TYPE_CD,CREATE_DATE,STATE)"+
						 "values (PRODUCT_ITEM_ID_SEQ.nextval,'"+
								     Serialnumber+"','"+
								     MapUtils.getString(param, "PROD_SPEC_ID")+"','Y','','','"+
								     MapUtils.getString(param, "ACCESS_NBR")+"','"+
								     MapUtils.getString(param, "PROD_PWD")+"','"+
								     MapUtils.getString(param, "PAYMENT_TYPE_CD")+"',sysdate,'ADD')";
	        jdbc.update(sb5.toString());
	        //物品信息
	        if(!"".equals(param.get("uimcode").toString())){
	        	String sb6 = "insert into COUPON_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,COUPON_TYPE_CD,COUPON_SPEC_ID,COUPON_INST_NBR,COUPON_NAME,STATE)"+
		         			 "values (COUPON_ITEM_ID_SEQ.nextval,'"+
			                  Serialnumber+"','1','','"+
			                  MapUtils.getString(param, "uimcode")+"','','ADD')";
	        	jdbc.update(sb6.toString());
	        }
	        //物品信息
	        if(!"".equals(param.get("terminalcode").toString())){
	        	String sb7 = "insert into COUPON_ITEM(ORDER_ITEM_ID,CUST_ORDER_ID,COUPON_TYPE_CD,COUPON_SPEC_ID,COUPON_INST_NBR,COUPON_NAME,STATE)"+
		         			 "values (COUPON_ITEM_ID_SEQ.nextval,'"+
			                  Serialnumber+"','2','','"+
			                  MapUtils.getString(param, "terminalcode")+"','','ADD')";
	        	jdbc.update(sb7.toString());
	        }
	        //发票记录
	        String SB_INVOICE_PRESO_ID_SEQ = "select INVOICE_PRESO_ID_SEQ.nextval from dual";
	        int INVOICE_PRESO_ID_SEQ = jdbc.queryForInt(SB_INVOICE_PRESO_ID_SEQ);
	        String sb10 = "insert into INVOICE_PRESO(INVOICE_ID,PRINT_COUNT,PRINT_FLAG,INVOICE_TYPE,CREATED_DATE,STAFF_ID,REAL_PAY,TAX)"+
	        			  "values ('"+INVOICE_PRESO_ID_SEQ+"','0','2','58B',sysdate,'"+
	        			              MapUtils.getString(param, "STAFF_ID")+"','"+
	        			              MapUtils.getString(param, "paytotal")+"','')";
	        jdbc.update(sb10.toString());
	        //订单帐目费用
	        List paylist = (List)param.get("paymentMap");
			for (int y=0;y<paylist.size();y++){
				Map paymap = (Map)paylist.get(y);
				int ACCT_ITEM_TYPE_ID = 0;
				if("".equals(paymap.get("ACCT_ITEM_TYPE_ID").toString())){
					String SB_PRESO_ACCT_ITEM_TYPE_ID_SEQ = "select PRESO_ACCT_ITEM_TYPE_ID_SEQ.nextval from dual";
					ACCT_ITEM_TYPE_ID = jdbc.queryForInt(SB_PRESO_ACCT_ITEM_TYPE_ID_SEQ);
				}else{
					ACCT_ITEM_TYPE_ID = Integer.parseInt((String) paymap.get("ACCT_ITEM_TYPE_ID")) ;
				}
		        String sb11 = "insert into ORDER_FEE(CUST_ORDER_ID,ACCT_ITEM_TYPE_ID,ACCT_ITEM_TYPE,PAY_METHOD_CD,INVOICE_ID,ACCT_ITEM_FEE,ACCT_ITEM_FEE_DEMO,CREATE_DATE)"+
				  			  "values ('"+Serialnumber+"','"+
				  			  			  ACCT_ITEM_TYPE_ID+"','"+
				  			  			  paymap.get("ACCT_ITEM_TYPE")+"','"+
				  			  			  paymap.get("PAY_METHOD_CD")+"','"+
				  			  			  INVOICE_PRESO_ID_SEQ+"','"+
				  			  			  paymap.get("ACCT_ITEM_FEE")+"','',sysdate)";
		        jdbc.update(sb11.toString());
			}
			
			//终端预约订单属性，关联agent_portal_config表
			if (param.containsKey("terminalinfo")) {
				ArrayList<Object> terminalinfolist = new ArrayList<Object>();
				for (String k : ((HashMap<String, Object>) param.get("terminalinfo")).keySet()) {
					terminalinfolist.add(((HashMap<String, Object>) param.get("terminalinfo")).get(k));
				}
//				List terminalinfolist = (List)param.get("terminalinfo");
				for(int i=0;i<terminalinfolist.size();i++){
					Map termap = (Map)terminalinfolist.get(i);
					String sql = "insert into PRESO_ORDER_ATTR(CUST_ORDER_ID,ATTR_ID,ATTR_VALUE_ID,VALUE)"+
						"values('"+Serialnumber+"','"+termap.get("Id")+"','','"+termap.get("value")+"')";
					jdbc.update(sql.toString());
				}
			}
	        
	        reallmap.put("INVOICE_ID", INVOICE_PRESO_ID_SEQ);
	        reallmap.put("CUST_ORDER_ID", Serialnumber);
	        reallmap.put("CUST_SO_NUMBER", CUST_SO_NUMBER);
    	}
        return reallmap ;
    }
    
    public Map queryorderyslinfo(Map<String, Object> param,String dbKeyWord) throws Exception {
    	Map reallmap = new HashMap();
    	if(param.get("queryflag")!=null && "9".equals(param.get("queryflag"))){
    		//终端预约，查询证件号码是否已订购终端
    		String sql = "select count(1) from cust_order a,cust_item b where a.cust_order_id=b.cust_order_id and a.action_type_cd='9' and a.status_cd!='3' and b.identity_num='"+param.get("IdentityCard")+"'";
    		int sqlcount = jdbc.queryForInt(sql.toString());
    		reallmap.put("sqlcount", sqlcount);
    		return reallmap;
    	}
    	if(param.get("detail")==null){
	    	String sb1 = "select cust_order_id,cust_so_number,name,access_nbr,common_region_name,channel_name,status_cd,ROWNUM rn from("+
	    				 "select a.cust_order_id,a.cust_so_number,b.name,c.access_nbr,a.common_region_name,a.channel_name,a.status_cd,ROWNUM rn from CUST_ORDER a,CUST_ITEM b,PRODUCT_ITEM c where "+
	    				 "a.cust_order_id = b.cust_order_id and a.cust_order_id=c.cust_order_id and c.is_access_prod='Y' and (a.status_cd='1' or a.status_cd='2') "+
	    				 "and a.accept_time between (to_date('"+param.get("startDt")+"','yyyy/mm/dd hh24:mi:ss')) and (to_date('"+param.get("endDt")+"','yyyy/mm/dd hh24:mi:ss') ) "+
	    				 "and a.common_region_id='"+param.get("areaId")+"' ";
	    	String sb2 = "select count(1) from CUST_ORDER a,CUST_ITEM b,PRODUCT_ITEM c where "+
						 "a.cust_order_id = b.cust_order_id and a.cust_order_id=c.cust_order_id and c.is_access_prod='Y' and (a.status_cd='1' or a.status_cd='2') "+
						 "and a.accept_time between (to_date('"+param.get("startDt")+"','yyyy/mm/dd hh24:mi:ss')) and (to_date('"+param.get("endDt")+"','yyyy/mm/dd hh24:mi:ss') ) "+
						 "and a.common_region_id='"+param.get("areaId")+"' ";
	    	if(!"".equals(param.get("busitype"))){
	    		sb1+="and a.busi_type_cd='"+param.get("busitype")+"' ";
	    		sb2+="and a.busi_type_cd='"+param.get("busitype")+"' ";
	    	}
	    	if(!"".equals(param.get("olNbr"))){
	    		sb1+="and a.cust_so_number='"+param.get("olNbr")+"' ";
	    		sb2+="and a.cust_so_number='"+param.get("olNbr")+"' ";
	    	}			 
	    	if(!"".equals(param.get("channelId"))){
	    		sb1+="and a.channel_id='"+param.get("channelId")+"' ";
	    		sb2+="and a.channel_id='"+param.get("channelId")+"' ";
	    	}
	    	if(!"".equals(param.get("accnum"))){
	    		sb1+="and c.access_nbr='"+param.get("accnum")+"' ";
	    		sb2+="and c.access_nbr='"+param.get("accnum")+"' ";
	    	}
	    	if(!"".equals(param.get("custname"))){
	    		sb1+="and b.name='"+param.get("custname")+"' ";
	    		sb2+="and b.name='"+param.get("custname")+"' ";
	    	}
	    	if(!"".equals(param.get("CustIdCard"))){
	    		sb1+="and b.identity_num='"+param.get("CustIdCard")+"' ";
	    		sb2+="and b.identity_num='"+param.get("CustIdCard")+"' ";
	    	}
	    	sb1+=") where rn>="+param.get("nowPage")+"  and   "+param.get("pageSize")+">=rn order by cust_order_id";
	    	List rList = null;
	        rList = jdbc.queryForList(sb1.toString());
	        int totalCnt = jdbc.queryForInt(sb2.toString());
	        reallmap.put("orderLists", rList);
	        reallmap.put("totalCnt", totalCnt);
    	}else{
    		String cust_so_number = param.get("cust_so_number").toString();
    		//客户预受理订单
    		String sb3 = "select a.*, b.busi_type_name from CUST_ORDER a, busi_type b "+
    					 "where a.busi_type_cd = b.busi_type_cd  and a.cust_so_number='"+cust_so_number+"'";
    		List CUST_ORDER = jdbc.queryForList(sb3.toString());
    		reallmap.put("CUST_ORDER", CUST_ORDER);
    		//CUST_ORDER_ID
    		Map CUST_ORDER_Map = (Map)CUST_ORDER.get(0);
    		String CUST_ORDER_ID = CUST_ORDER_Map.get("CUST_ORDER_ID").toString();
    		//客户资料
    		String sb4 = "select * from CUST_ITEM a where a.cust_order_id='"+CUST_ORDER_ID+"'";
    		List CUST_ITEM = jdbc.queryForList(sb4.toString());
    		reallmap.put("CUST_ITEM", CUST_ITEM);
    		//套餐信息
    		String sb5 = "select * from OFFER_ITEM a where a.cust_order_id='"+CUST_ORDER_ID+"' and a.offer_type_cd='0'";
    		List taocan = jdbc.queryForList(sb5.toString());
    		reallmap.put("taocan", taocan);
    		//开通/关闭
    		String sb6 = "select * from OFFER_ITEM a where a.cust_order_id='"+CUST_ORDER_ID+"' and a.offer_type_cd='1'";
    		List kexuanbao = jdbc.queryForList(sb6.toString());
    		String sb7 = "select * from PRODUCT_ITEM a where a.cust_order_id='"+CUST_ORDER_ID+"' and a.is_access_prod='N'";
    		List gnchanpin = jdbc.queryForList(sb7.toString());
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
    		String sb8 = "select * from PRODUCT_ITEM a where a.cust_order_id='"+CUST_ORDER_ID+"' and a.is_access_prod='Y'";
    		List PRODUCT_ITEM = jdbc.queryForList(sb8.toString());
    		reallmap.put("PRODUCT_ITEM", PRODUCT_ITEM);
    		//物品信息
    		String sb9 = "select * from COUPON_ITEM t where t.cust_order_id='"+CUST_ORDER_ID+"'";
    		List COUPON_ITEM = jdbc.queryForList(sb9.toString());
    		reallmap.put("COUPON_ITEM", COUPON_ITEM);
    		//发展人
    		String sb10 = "select c.*, e.offer_spec_cd,e.offer_spec_name,e.offer_type_cd from BUSI_STAFF_RELA c, BUSI_DEVELOP_OBJ d, OFFER_ITEM e " +
    					  "where d.OFFER_ORDER_ITEM_ID = e.order_item_id and d.BO_STAFF_RELA_ID = c.bo_staff_rela_id and c.bo_staff_rela_id in "+
    					  "(select a.bo_staff_rela_id from BUSI_DEVELOP_OBJ a where a.offer_order_item_id in "+
    					  "(select b.order_item_id  from OFFER_ITEM b "+
    					  "where b.cust_order_id = '"+CUST_ORDER_ID+"')) order by e.offer_type_cd,e.offer_spec_cd";
    		List BUSI_STAFF_RELA = jdbc.queryForList(sb10.toString());
    		reallmap.put("BUSI_STAFF_RELA", BUSI_STAFF_RELA);
//    		String sb12 = "select c.*, e.offer_spec_cd,e.offer_spec_name from BUSI_STAFF_RELA c, BUSI_DEVELOP_OBJ d, OFFER_ITEM e " +
//    					  "where d.OFFER_ORDER_ITEM_ID = e.order_item_id and d.BO_STAFF_RELA_ID = c.bo_staff_rela_id and c.bo_staff_rela_id in "+
//						  "(select a.bo_staff_rela_id from BUSI_DEVELOP_OBJ a where a.offer_order_item_id in "+
//						  "(select b.order_item_id  from OFFER_ITEM b "+
//						  "where b.offer_type_cd='1' and b.cust_order_id = '"+CUST_ORDER_ID+"'))";
//			List KX_BUSI_STAFF_RELA = jdbc.queryForList(sb12.toString());
//			reallmap.put("KX_BUSI_STAFF_RELA", KX_BUSI_STAFF_RELA);
    		//费用
    		String sb11 = "select a.*,b.name from ORDER_FEE a,PAYMENT_METHOD_PRESO b where "+
    					  "a.pay_method_cd=b.pay_method_cd and a.cust_order_id='"+CUST_ORDER_ID+"'";
    		List ORDER_FEE = jdbc.queryForList(sb11.toString());
    		reallmap.put("ORDER_FEE", ORDER_FEE);
    	}
    	return reallmap;
    }
    
    public Map updateorderzdyyinfo(Map<String, Object> param,String dbKeyWord) throws Exception {
    	if (StringUtils.isNotBlank(dbKeyWord)){
            DataSourceRouter.currentRouterStrategy.setKey(dbKeyWord);
        }
    	Map reallmap = new HashMap();
    		String sb = "update cust_order set status_cd = '"+MapUtils.getString(param, "status_cd")+"' where cust_so_number = '"+MapUtils.getString(param, "cust_so_number")+"'";
    		jdbc.update(sb.toString());
    	StringBuffer insertStr=new StringBuffer();
    	insertStr.append(" insert into preso_order_handle(cust_order_id,seq,staff_id,channel_id,common_region_id,status_cd,status_dt)");
    	insertStr.append(" values('"+MapUtils.getString(param, "cust_order_id")+"'");
    	insertStr.append(",preso_order_handle_id_seq.nextval");
    	insertStr.append(",'"+MapUtils.getString(param, "staff_id")+"'");
    	insertStr.append(",'"+MapUtils.getString(param, "channel_id")+"'");
    	insertStr.append(",'"+MapUtils.getString(param, "areaid")+"'");
    	insertStr.append(",'"+MapUtils.getString(param, "status_cd")+"'");
    	insertStr.append(",to_date('"+DateUtil.getFormatTimeString(Calendar.getInstance().getTime(), DateUtil.DATE_FORMATE_STRING_A)+"','yyyy-mm-dd hh24:mi:ss'))");
    	jdbc.update(insertStr.toString());
    	
        return reallmap ;
    }
    
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
		String whereCom=" where a.accept_time between (to_date('"+startDt+"','yyyy/mm/dd hh24:mi:ss')) and (to_date('"+endDt+"','yyyy/mm/dd hh24:mi:ss') ) and a.common_region_id like '"+areaHead+"%' ";
		String fromTable = "  from cust_order a left join cust_item b on a.cust_order_id = b.cust_order_id left join preso_order_attr c on a.cust_order_id = c.cust_order_id ";
		
		StringBuffer sb1=new StringBuffer();
		StringBuffer sb2=new StringBuffer();
		StringBuffer sb3=new StringBuffer();
		
		//查询sql
		sb1.append("select cust_order_id,cust_so_number,name,contact_no,common_region_name,channel_name,status_cd,rownum rn ");
		sb1.append("  from (select aa.*, rownum rn");
		sb1.append("  from (select a.cust_order_id,a.cust_so_number,b.name,b.contact_no,a.common_region_name,a.channel_name,a.status_cd");
		sb1.append(fromTable);
		
		//总记录数
		sb2.append("select count(distinct a.cust_order_id) ");
		sb2.append(fromTable);
		
		//预约总数，已销售总数，已取消总数		
		sb3.append("select status_cd, count(status_cd) num");
		sb3.append("  from (select distinct a.cust_order_id, a.status_cd ");
		sb3.append(fromTable);
				
    	if(!"".equals(param.get("busitype"))){
    		whereCon+="and a.busi_type_cd='"+param.get("busitype")+"' ";
    	}
    	if(!"".equals(param.get("olNbr"))){
    		whereCon+="and a.cust_so_number='"+param.get("olNbr")+"' ";
    	}			 
    	if(!"".equals(param.get("channelId"))){
    		whereCon+="and a.channel_id='"+param.get("channelId")+"' ";
    	}
    	if(!"".equals(param.get("accnum"))){
    		whereCon+="and b.contact_no='"+param.get("accnum")+"' ";
    	}
    	if(!"".equals(param.get("custname"))){
    		whereCon+="and b.name='"+param.get("custname")+"' ";
    	}
    	if(!"".equals(param.get("CustIdCard"))){
    		whereCon+="and b.identity_num='"+param.get("CustIdCard")+"' ";
    	}
    	if(!"".equals(param.get("olType"))){
    		whereCon+="and c.value ='"+param.get("olType")+"' ";
    	}
    	//添加where条件
    	sb1.append(whereCom).append(whereCon);
    	sb1.append(" group by a.cust_order_id,a.cust_so_number,b.name,b.contact_no,a.common_region_name,a.channel_name,a.status_cd");
    	sb1.append(" order by cust_order_id) aa");
    	sb1.append(") where rn>="+param.get("nowPage")+"  and   "+param.get("pageSize")+">=rn order by cust_order_id");
    	
    	sb2.append(whereCom).append(whereCon);
    	sb3.append(whereCom).append(whereCon).append(") group by status_cd order by status_cd");
    	
    	List rList = jdbc.queryForList(sb1.toString());
        int totalCnt = jdbc.queryForInt(sb2.toString());
        List<Map<String, Object>> countList=jdbc.queryForList(sb3.toString());
        
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
    		String sb = "select * from CUST_ORDER a left join CUST_ITEM b on a.cust_order_id=b.cust_order_id "+
    					 "where a.busi_type_cd='9' and a.cust_so_number='"+cust_so_number+"'";
    		List CUST_ORDER = jdbc.queryForList(sb.toString());
    		if(null!=CUST_ORDER&&CUST_ORDER.size()==1)
    		reallmap.put("CUST_ORDER", CUST_ORDER.get(0));
    		
    		StringBuffer sb1=new StringBuffer();
    		sb1.append("select a.cust_order_id,a.attr_id,a.value,b.column_value_name value_name,c.cust_so_number,c.busi_type_cd ");
			sb1.append("  from preso_order_attr a ");
			sb1.append("  left join agent_portal_config b ");
			sb1.append("    on a.attr_id = b.conf_id ");
			sb1.append("    left join cust_order c on a.cust_order_id=c.cust_order_id ");
			sb1.append(" where b.table_name = 'PRESO_ORDER_ATTR' ");
			sb1.append("   and b.column_name = 'ATTR_ID' ");
			sb1.append("   and c.busi_type_cd='9' ");
			sb1.append(" and c.cust_so_number='"+cust_so_number+"'");
			
			List CUST_ORDER_ATTR=jdbc.queryForList(sb1.toString());
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
    		String sb = "insert into TOKEN_STAFF_CACHE(TOKEN,STAFFID,STAFFCODE,STAFFNAME,AREAID,AREACODE,AREANAME,CITYNAME,PROVINCENAME,CREATDATE,STATUS,COL1,COL2,COL3)"+
			"values ('"+param.get("TOKEN")+"','"+
						param.get("STAFFID")+"','"+
						param.get("STAFFCODE")+"','"+
						param.get("STAFFNAME")+"','"+
						param.get("AREAID")+"',"+
						Integer.parseInt(param.get("AREACODE").toString())+",'"+
						param.get("AREANAME")+"','"+
						param.get("CITYNAME")+"','"+
						param.get("PROVINCENAME")+"',SYSDATE,0,'','','')";
			jdbc.update(sb.toString());
    	}else if ("select".equals(param.get("FLAG"))){
    		String sb = "select * from (select * from TOKEN_STAFF_CACHE a where "+
    						" a.token='"+param.get("TOKEN")+"' and a.STATUS=0 "+
    						" order by a.creatdate desc )where rownum = 1";
    		rList = jdbc.queryForList(sb.toString());	
    	}else if ("report".equals(param.get("FLAG"))){
    		String sb = "select * from TOKEN_STAFF_CACHE a where "+
			" a.token='"+param.get("TOKEN")+"' and a.STATUS=0 "+" and a.staffid='"+param.get("STAFFID")+"'"+
			" order by a.creatdate desc ";
			rList = jdbc.queryForList(sb.toString());	
		}else if ("update".equals(param.get("FLAG"))){
			if(param.get("TOKEN")!=null){
				if(StringUtils.isNotBlank(param.get("TOKEN").toString())){
					String sb = "update TOKEN_STAFF_CACHE a set a.STATUS=1 where "+
							" a.token='"+param.get("TOKEN")+"' and a.STATUS=0 ";
					jdbc.update(sb.toString());	
				}
			}
		}
        return rList;
	}
    
    public List GetOLpos(Map<String, Object> param) throws Exception {
    	List rList = null;
    	if("insert".equals(param.get("FLAG"))){
    		String sb = "insert into ol_pos(OLID,OLNBR,TYPECLASS,RESULT,MESSAGE,ACCEPT_TIME,PARAM)"+
			"values ('"+param.get("olId")+"','"+
						param.get("olNbr")+"','"+
						param.get("typeclass")+"','"+
						param.get("result")+"','"+
						param.get("message")+"',SYSDATE,'"+param.get("param")+"')";
			jdbc.update(sb.toString());
    	}else if ("update".equals(param.get("FLAG"))){
    		String ud = "update ol_pos set typeclass='"+param.get("typeclass")+"', result='"+param.get("result")+"', message='"+param.get("message")+"' where olid='"+param.get("olId")+"'";
    		jdbc.update(ud.toString());
    		if("0".equals(param.get("result"))){
    			String sb = "select * from (select * from ol_pos a where "+
				" a.olid='"+param.get("olId")+"'"+
				" order by a.ACCEPT_TIME desc )where rownum = 1";
    			rList = jdbc.queryForList(sb.toString());	
    		}
    	}else if ("select".equals(param.get("FLAG"))){
			String sb = "select * from (select * from ol_pos a where "+
			" a.olid='"+param.get("olId")+"'"+
			" order by a.ACCEPT_TIME desc )where rownum = 1";
			rList = jdbc.queryForList(sb.toString());	
    	}
        return rList;
	}
    
    public void insert_sp_busi_run_log(Map<String, Object> param) throws Exception {
		String sb = "insert into sp_busi_run_log(STAFF_CODE,SESSIONINFO,STATUS_CD,INTF_URL,IDENTIDIES_TYPE,IDENTITY_NUM,CREATED_TIME,OPERATION_PLATFORM,ACTION_IP,CHANNEL_ID,OPERATORS_ID,IN_PARAM)"+
		"values ('"+param.get("STAFF_CODE")+"','"+
					param.get("SESSIONINFO")+"','"+
					param.get("STATUS_CD")+"','"+
					param.get("INTF_URL")+"','"+
					param.get("IDENTIDIES_TYPE")+"','"+
					param.get("IDENTITY_NUM")+"',SYSDATE,'"+
					param.get("OPERATION_PLATFORM")+"','"+
					param.get("ACTION_IP")+"','"+
					param.get("CHANNEL_ID")+"','"+
					param.get("OPERATORS_ID")+"','"+
					param.get("IN_PARAM")+"')";
		jdbc.update(sb.toString());
	}

    //查询蓝牙密钥
	public Map queryBlueToothKey(Map<String, Object> paramMap) throws Exception {
		String sql = "select * from sp_bluetooth_key s where s.mac='"+ paramMap.get("mac")+"'";
		return jdbc.queryForMap(sql);
	}
}
