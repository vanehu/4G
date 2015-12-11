package com.linkage.portal.service.lte.dto;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.core.SysConstant;
import com.ailk.ecsp.util.IConstant;
import com.al.ec.serviceplatform.client.DataMap;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MapUtil;
import com.linkage.portal.service.lte.LteConstants;
import com.linkage.portal.service.lte.dao.CommonDAO;
import com.linkage.portal.service.lte.dao.CommonDAOImpl;
import com.linkage.portal.service.lte.protocols.FreemarkerHandler;


/**
 * 横向接口模板公共处理类
 * 
 * @author xuj
 */
public class TcpCont {
	@SuppressWarnings("unchecked")
	private final static Logger log = LoggerFactory.getLogger(TcpCont.class);
	
	public static Map createTcp(Map inMap) throws Exception {
		Map<String, String> tcpContMap = (Map) inMap.get("TcpCont");
		String areaCode = String.valueOf(inMap.get("AreaCode"));
		if(tcpContMap == null){
			tcpContMap = new HashMap<String, String>();
		}
		
		String srcSysSign = MapUtils.getString(tcpContMap, "SrcSysSign");
		if (StringUtils.isBlank(srcSysSign)) {
			srcSysSign = DataRepository.getInstence().getSysParamValue("SrcSysSign","4");
			tcpContMap.put("SrcSysSign", srcSysSign);
		}
		
		String srcOrgID = MapUtils.getString(tcpContMap, "SrcOrgID");
		if (StringUtils.isBlank(srcOrgID)) {
			srcOrgID = LteConstants.CON_TCP_SRC_ORG_ID;
			tcpContMap.put("SrcOrgID", srcOrgID);
		}
		
		String srcSysID = MapUtils.getString(tcpContMap, "SrcSysID");
		if (StringUtils.isBlank(srcSysID)) {
			srcSysID = LteConstants.CON_TCP_SRC_SYS_ID;
			tcpContMap.put("SrcSysID", srcSysID);
		}
		
		
		String dstOrgID = MapUtils.getString(tcpContMap, "DstOrgID");
		if (StringUtils.isBlank(dstOrgID)) {
			dstOrgID = LteConstants.CON_TCP_SRC_ORG_ID;
			tcpContMap.put("DstOrgID", dstOrgID);
		}
		

		String dstSysID = MapUtils.getString(tcpContMap, "DstSysID");
		if (StringUtils.isBlank(dstSysID)) {
			dstSysID = LteConstants.CON_TCP_SRC_SYS_ID;
			tcpContMap.put("DstSysID", dstSysID);
		}
		tcpContMap.put("DstSysID", dstSysID);

//		if (null != tcpContMap) {
//            Set<String> keySet = tcpContMap.keySet();
//            for (Iterator it = keySet.iterator(); it.hasNext();) {
//                String key = (String) it.next();
//                String value = tcpContMap.get(key);
//                if (StringUtils.isNotBlank(value)) {
//                    if (("SrcSysID").equals(key)) {
//                        srcSysID = value;
//                    }               
//                }
//            }
//        }
		tcpContMap.put("ActionCode", "0"); // 动作类型标识 0：表示请求
		tcpContMap.put("ServiceLevel", "1"); // 服务等级,处理的优先级 1
		tcpContMap.put("TransactionID", getTranID(srcSysID, inMap));
		tcpContMap.put("TransactionNo", getTranID("", inMap));
		tcpContMap.put("ReqTime",DateFormatUtils.format(new Date(), "yyyyMMddHHmmss"));
		inMap.put("TcpCont", tcpContMap);
		//inMap.put("Common", createCommonInfo(inMap,db));
		return inMap;
	}
/*
	public static Map<String, String> createCommonInfo(Map map,DataBus db) {
		Map<String, String> commonMap = new HashMap<String, String>();
//		DataBus db = (DataBus) map.get("DataBus");
		commonMap.put("ChannelId", db.getOperatChannel());
		commonMap.put("ChannelName", db.getOperatChannelName());
		commonMap.put("StaffId", db.getOperatStaffID());
		commonMap.put("StaffCode", db.getOperatStaff());
		commonMap.put("StaffName", db.getOperatStaffName());
		commonMap.put("OperaterAreaCode", db.getOperaterArea());
		if(null!=map.get("areaFlag")&&"1".equals((String)map.get("areaFlag"))){
			commonMap.put("LanId",String.valueOf(map.get("areaId")));
		}else{
			commonMap.put("LanId",AreaManageCode.getValue(String.valueOf(map.get("AreaCode"))));
		}
		return commonMap;
	}
*/
	private static String getTranID(String id, Map<String, Object> inMap) throws Exception {
		//10位系统平台编码+8位日期编码yyyyMMdd+序列
		String dbKeyWord = MapUtils.getString(inMap, IConstant.CON_DB_KEY_WORD);
    	CommonDAO dao = new CommonDAOImpl();
        Map<String,Object> reqMap = new HashMap<String,Object>();
        if ("provinceAreaId".equals(IConstant.CON_DB_KEY_WORD)){
        	reqMap.put("seq", "SEQ_CRM_CSB");
        }else{
        	reqMap.put("seq", "LTE_TRANSACTIONID_SEQ");
        }
        try{
        	long tranId = dao.GetTranId(reqMap, dbKeyWord);
        	StringBuffer sb = new StringBuffer();
        	sb.append(id)
        	    .append(DateFormatUtils.format(new Date(), "yyyyMMdd"))
        	    .append(String.valueOf(tranId));
        	return sb.toString();
        }catch (Exception e) {
			throw new Exception(e);
		}
	}

	public static String parseTemplate(Map inMap, String ftlName) throws Exception {
		Object serviceCodeObj = null;
		serviceCodeObj = DataRepository.getInstence().getSysParamValue(ftlName, SysConstant.CON_SYS_PARAM_GROUP_CSB_PARAM);
		if (!(serviceCodeObj==null)){
			Map<String, Object> map = JsonUtil.toObject((String)serviceCodeObj, Map.class);
			inMap.put("TcpCont", map);
		}
		Map<String, Object> model = createTcp(inMap);
		return buildInParam(model, ftlName);
	}
	
	public static String parseTemplate(Map inMap, String ftlName,DataMap db) throws Exception {
		Map<String, Object> model = createTcp(inMap);
		return buildInParam(model, ftlName);
	}
	
	public static Map<String,String> parseTemplateMap(Map inMap, String ftlName) throws Exception {
		Map<String,String> returnMap = new HashMap();
		Object serviceCodeObj = null;
		serviceCodeObj = DataRepository.getInstence().getSysParamValue(ftlName, SysConstant.CON_SYS_PARAM_GROUP_CSB_PARAM);
		if (!(serviceCodeObj==null)){
			Map<String, Object> map = JsonUtil.toObject((String)serviceCodeObj, Map.class);
			inMap.put("TcpCont", map);
		}
		Map<String, Object> model = createTcp(inMap);
		String transactionID = (String)MapUtil.path(model,"TcpCont/TransactionID");
		String requestXml = buildInParam(model, ftlName);
		returnMap.put("transactionID", transactionID);
		returnMap.put("requestXml", requestXml);
		return returnMap;
	}

	public static String parseTemplate(Map inMap, Object o) throws Exception {
		return parseTemplate(inMap, o.getClass().getSimpleName());
	}

	/**
	 * 根据入参模板生成入参字符串(xml)
	 * 
	 * @param inMap
	 *            入参数据集
	 * @param ftlName
	 *            入参模板名称
	 * @return 根据模板生成的xml串
	 */
	public static String buildInParam(Map<String, Object> inMap, String ftlName) {
		FreemarkerHandler fh = FreemarkerHandler.getInstance();
		// String path =
		// TcpCont.class.getResource("/com/linkage/portal/service/ess/ftl").getPath();
		// System.out.println("###########"+path);
		fh.setTemplateLoaderPaths("/com/linkage/portal/service/lte/ftl");
		// fh.setTemplateLoaderPaths(path);
		String xml = fh.processTemplate(TcpCont.class, ftlName + ".ftl", inMap);
		if (StringUtils.isNotBlank(xml)) {
			// 清除xml头
			xml = xml.replaceAll("(<\\?xml.+?>)", "");
			xml = xml.replaceAll("\t","");//制表符
			xml = xml.replaceAll("\r","");//回车符
			xml = xml.replaceAll("\n","");//换行符
		}
		log.debug(xml);
		return xml;
	}
	
	public static String buildInParam(Map<String, Object> inMap, String ftlName,boolean templateFlag) {
		FreemarkerHandler fh = FreemarkerHandler.getInstance();
		String xml = "";
		fh.setTemplateLoaderPaths("/com/linkage/portal/service/lte/ftl");
		if (templateFlag == true){
			Map tcpCont = MapUtil.getMap(inMap, "TcpCont");
			Map svcCont = MapUtil.getMap(inMap, "SvcCont");
			Object tcpContRCode = MapUtil.path(inMap, "TcpCont/Response/RspType");
			Object tcpContId = MapUtil.path(inMap, "TcpCont/TransactionID");
			if (svcCont != null && ("0".equals(tcpContRCode))){
				svcCont.put("TransactionID", tcpContId);
				xml = fh.processTemplate(TcpCont.class, ftlName+".ftl", (Map)svcCont);
			}else{	
				if (tcpCont != null){				
					xml = fh.processTemplate(TcpCont.class, "commonRes.ftl", (Map)tcpCont);
				}			
			}
		}else{
			xml = fh.processTemplate(TcpCont.class, ftlName + ".ftl", inMap);

		}
		if (StringUtils.isNotBlank(xml)) {
			// 清除xml头
			xml = xml.replaceAll("(<\\?xml.+?>)", "");
			xml = xml.replaceAll("\t","");//制表符
			xml = xml.replaceAll("\r","");//回车符
			xml = xml.replaceAll("\n","");//换行符
		}
		return xml;
	}
	
	public static String buildInParam(Map<String, Object> inTcpMap,Map<String, Object> inSvcMap, String ftlName) {
		FreemarkerHandler fh = FreemarkerHandler.getInstance();
		// String path =
		// TcpCont.class.getResource("/com/linkage/portal/service/ess/ftl").getPath();
		// System.out.println("###########"+path);
		fh.setTemplateLoaderPaths("/com/linkage/portal/service/lte/ftl");
		// fh.setTemplateLoaderPaths(path);
		String xml = fh.processTemplate(TcpCont.class, ftlName + ".ftl", inTcpMap);
		if (StringUtils.isNotBlank(xml)) {
			// 清除xml头
			xml = xml.replaceAll("(<\\?xml.+?>)", "");
			xml = xml.replaceAll("\t","");//制表符
			xml = xml.replaceAll("\r","");//回车符
			xml = xml.replaceAll("\n","");//换行符
		}
		log.debug(xml);
		return xml;
	}

	public static String getHourInMillis() {
		long h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY) * 60 * 60 * 1000;
		long m = Calendar.getInstance().get(Calendar.MINUTE) * 60 * 1000;
		long s = Calendar.getInstance().get(Calendar.SECOND) * 1000;
		long ms = Calendar.getInstance().get(Calendar.MILLISECOND);
		return StringUtils.leftPad(String.valueOf(h + m + s + ms), 8, '0');
	}
}
