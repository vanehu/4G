package com.al.lte.portal.bmo.print;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.NumUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.DataSignTool;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.ChsStringUtil;
import com.al.lte.portal.common.print.PdfPrintHelper;
import com.al.lte.portal.common.print.PrintHelperMgnt;
import com.al.lte.portal.common.print.dto.AcceNbrNewSet;
import com.al.lte.portal.common.print.dto.AgreementIphoneSet;
import com.al.lte.portal.common.print.dto.AgreementSpeNbrSet;
import com.al.lte.portal.common.print.dto.AgreementTerminalSet;
import com.al.lte.portal.common.print.dto.AgreementsSet;
import com.al.lte.portal.common.print.dto.AuditTicketInfoSet;
import com.al.lte.portal.common.print.dto.CustInfoSet;
import com.al.lte.portal.common.print.dto.FeeInfoAPNSet;
import com.al.lte.portal.common.print.dto.FeeInfoBankSet;
import com.al.lte.portal.common.print.dto.FeeInfoRANSet;
import com.al.lte.portal.common.print.dto.FeeInfoSet;
import com.al.lte.portal.common.print.dto.FeeInfoTitleSet;
import com.al.lte.portal.common.print.dto.ItemInfoSet;
import com.al.lte.portal.common.print.dto.ItemInfoTwoNewSet;
import com.al.lte.portal.common.print.dto.ItemInfoTwoSet;
import com.al.lte.portal.common.print.dto.OEAttachOfferSet;
import com.al.lte.portal.common.print.dto.OEMainOfferSet;
import com.al.lte.portal.common.print.dto.OEProdChangeSet;
import com.al.lte.portal.common.print.dto.OETermOfferSet;
import com.al.lte.portal.common.print.dto.OSAttachOfferSet;
import com.al.lte.portal.common.print.dto.OSBaseInfoSet;
import com.al.lte.portal.common.print.dto.OSNormOfferSet;
import com.al.lte.portal.common.print.dto.OSOrderInfoSet;
import com.al.lte.portal.common.print.dto.OSOtherInfoSet;
import com.al.lte.portal.common.print.dto.OSPrompInfoSet;
import com.al.lte.portal.common.print.dto.OSServOfferSet;
import com.al.lte.portal.common.print.dto.OfferProdAttrsSet;
import com.al.lte.portal.common.print.dto.OrderEventSet;
import com.al.lte.portal.common.print.dto.ProvNameSet;
import com.al.lte.portal.common.print.dto.StringBeanSet;
import com.al.lte.portal.common.print.dto.StringTwoSet;
import com.al.lte.portal.common.print.dto.TerminalInfoSet;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 业务接口 .
 * <P>
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.print.PrintBmo")
public class PrintBmoImpl implements PrintBmo {

	private final Log log = Log.getLog(getClass());
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	private static List<String> filterList = new ArrayList<String>();
	static {
		filterList.add("280000010");//不可及转移
		filterList.add("280000014");//呼叫等待
		filterList.add("280000011");//无条件转移
		filterList.add("280000008");//无应答转移
		filterList.add("280000009");//遇忙转移
	}

	/**
	 * 1. 业务类型判断 2. 获取打印参数、设置打印模板 3. 数据驱动模板、展示打印页面
	 */
	public Map<String, Object> printVoucher(Map<String, Object> paramMap,
			String optFlowNum,
			HttpServletRequest request, HttpServletResponse response) 
			throws Exception {

		String busiType = MapUtils.getString(paramMap, "busiType");
		String printType = MapUtils.getString(paramMap, "printType");
		String agreement = MapUtils.getString(paramMap, "needAgreement");
		String signFlag = MapUtils.getString(paramMap, "signFlag");//0:打印 1:数字签名预览 2:生成pdf保存
		if(signFlag==null){
			signFlag="0";
		}
		boolean needAgreement = SysConstant.STR_Y.equals(agreement);
		Map<String,Object> params=new HashMap<String,Object>();
		params.putAll(paramMap);
		if(params.get("signStr")!=null){
			params.remove("signStr");
		}
		if(params.get("signFlag")!=null){
			params.remove("signFlag");
		}
		Map<String, Object> printData = new HashMap<String, Object>();
		
		if (SysConstant.BUSI_TYPE_CRM_COMMON.equals(busiType)) {
			printData = getVoucherData(params, needAgreement, optFlowNum, request);

		} else if (SysConstant.BUSI_TYPE_FRESH_DATA.equals(busiType)) {

		} else if (SysConstant.BUSI_TYPE_WITH_PARAM.equals(busiType)) {

		} else {

		}
		
		//如果printData为空，则返回失败
		if (MapUtils.isEmpty(printData)) {
			return printData;
		}
		if(signFlag.equals(SysConstant.PREVIEW_SIGN)){
			return runVoucherPrint(printData, response, printType, needAgreement,signFlag);
		}else if(signFlag.equals(SysConstant.SAVE_PDF)){
	    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
					.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
			byte[] signBytes = DataSignTool.hexStr2Bytes(paramMap.get("signStr").toString()); 
			byte[] sealBytes = DataSignTool.creatImageToByte(paramMap.get("sealInfo").toString());
			InputStream is = new ByteArrayInputStream(signBytes);
			InputStream is2 = new ByteArrayInputStream(sealBytes);
			printData.put("signPic",is);
			printData.put("companyseal", is2);
			is.close();
			is2.close();
			Map<String, Object> ret=runVoucherPrint(printData, response, printType, needAgreement,signFlag);
			ret.put("olId", params.get("olId"));
			ret.put("areaId", sessionStaff.getAreaId());
			ret.put("action", "ADD");
			if(ret!=null&&ret.get("orderInfo")!=null){
				Map<String,Object> obj= postPdfData(ret,optFlowNum,request);
				return obj;
			}else{
				return null;
			}
		}else{
			// 3. 数据驱动模板、展示打印页面
			runVoucherPrint(printData, response, printType, needAgreement,signFlag);
			return printData;
		}
	}
	private Map<String, Object> postPdfData(Map<String, Object> paramMap, String optFlowNum, HttpServletRequest request)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);
		DataBus db = InterfaceClient.callService(paramMap, 
				PortalServiceCode.INTF_SAVE_PRINTFILE, 
				optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				returnMap.put("code", ResultCode.R_SUCCESS);
			}else{
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg()==null?"pdf提交接口失败，集团营业后台未返回resultMsg【resultMsg=null】":db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.fileOperateService/upLoadPrintFileToFtp服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.FTP_UPLOAD_ERROR, paramMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
	private Map<String, Object> getVoucherData(Map<String, Object> paramMap, boolean needAgreement, String optFlowNum, HttpServletRequest request)
			throws Exception {
		Map<String, Object> resultMap = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		if(paramMap.get("result")!=null){
			resultMap = (Map)paramMap.get("result");
			resultMap = parseVoucherData(resultMap, needAgreement);
		}else{
			DataBus db = InterfaceClient.callService(paramMap, 
					PortalServiceCode.INTF_GET_VOUCHER_DATA, 
					optFlowNum, sessionStaff);
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
				if (resultMap != null) {
					resultMap.put("chargeItems", paramMap.get("chargeItems"));
				}
				resultMap = parseVoucherData(resultMap, needAgreement);
			}
		}
		return resultMap;
	}

	private Map<String, Object> parseVoucherData(Map<String, Object> dataMap, boolean needAgreement) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		int speCustInfoLen = SysConstant.INT_0;
		//通用信息
		retnMap.putAll(parseCommonInfos(dataMap));
		speCustInfoLen = MapUtils.getIntValue(retnMap, "speCustInfoLen", 0);
		//客户信息
		retnMap.put("custInfos", parseCustInfos(dataMap, speCustInfoLen));
		//业务数据
		retnMap.put("orderEvents", parseOrderEvents(dataMap, speCustInfoLen));
		//费用信息
		retnMap.put("feeInfos", parseFeeInfos(dataMap));
		//终端信息
		retnMap.put("terminalInfos", parseTerminalInfos(dataMap));
		//终端抵用券
		retnMap.put("auditTickets", parseAuditTickets(dataMap));
		//备注信息
		retnMap.put("remarkInfos", parseRemarkInfos(dataMap));
		//协议信息
		retnMap.put("agreements", parseAgreements(dataMap, needAgreement));
		
		return retnMap;
	}
	
	private Map<String, Object> parseCommonInfos(Map<String, Object> dataMap) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		// 公共信息－订单数据
		String olNbr = null;
		String staffName = null;
		String staffNumber = null;
		String channelName = null;
		String provName = null;
		String soDate = null;
		int speCustInfoLen = 0;
		Map<String, Object> orderListInfo = MapUtils.getMap(dataMap, "orderListInfo");
		if (MapUtils.isNotEmpty(orderListInfo)) {
			olNbr = MapUtils.getString(orderListInfo, "olNbr");
			staffName = MapUtils.getString(orderListInfo, "staffName");
			staffNumber = MapUtils.getString(orderListInfo, "staffNumber");
			channelName = MapUtils.getString(orderListInfo, "channelName");
			provName = MapUtils.getString(orderListInfo, "provName");
			soDate = MapUtils.getString(orderListInfo, "soDate");
			//设置半行长度，默认预设经验值14
			speCustInfoLen = MapUtils.getIntValue(orderListInfo, "speCustInfoLen", 14);
			//渠道名称超长时换行显示
//			String tmpSource = channelName;
//			String tmpResult = "";
//			int splitLen = 12;
//			int len = tmpSource.length();
//			int start = 0;
//			int end = 0;
//			for (int i = 0; i < len / splitLen + 1; i++) {
//				start = i * splitLen;
//				end = start + splitLen;
//				if (end > len) {
//					end = len;
//				}
//				tmpResult += tmpSource.substring(start, end) + "\n";
//			}
//			channelName = tmpResult;
		}
		retnMap.put("olNbr", olNbr);
		retnMap.put("staffName", staffName);
		retnMap.put("staffNumber", staffNumber);
		retnMap.put("channelName", channelName);
		retnMap.put("speCustInfoLen", speCustInfoLen);
		
		// 公共信息－设置标题
		if (StringUtils.isNotEmpty(provName)) {
			List<ProvNameSet> provNameSets = new ArrayList<ProvNameSet>();
			ProvNameSet nameSet = new ProvNameSet();
			nameSet.setProvName(provName);
			provNameSets.add(nameSet);
			retnMap.put("provNames", provNameSets);
		}
		// 公共信息－受理日期
		if (StringUtils.isNotEmpty(soDate)) {
			soDate = soDate.split(SysConstant.STR_SPE)[0];
			String[] dates = soDate.split(SysConstant.STR_MINUS);
			if (null != dates && dates.length == SysConstant.INT_3) {
				retnMap.put("acceYear", dates[0]);
				retnMap.put("acceMonth", dates[1]);
				retnMap.put("acceDay", dates[2]);
			}
		}
		// 公共信息－温馨提示
		List<StringBeanSet> advtInfos = new ArrayList<StringBeanSet>();
		Object advObj = dataMap.get("advInfos");
		if (advObj != null && advObj instanceof List) {
			List advtInfoList = (List) advObj;
			for (int i = 0; advtInfoList != null && i < advtInfoList.size(); i++) {
				StringBeanSet beanSet = new StringBeanSet((String)advtInfoList.get(i));
				advtInfos.add(beanSet);
			}
		}
		retnMap.put("advtInfos", advtInfos);
		
		return retnMap;
	}
	
	private List<CustInfoSet> parseCustInfos(Map<String, Object> dataMap, int speCustInfoLen) {
		List<CustInfoSet> custInfos = new ArrayList<CustInfoSet>();
		Map<String, Object> custInfoMap = MapUtils.getMap(dataMap, "custInfo");
		if (MapUtils.isNotEmpty(custInfoMap)) {
			CustInfoSet custInfoSet = new CustInfoSet();
			Object obj = MapUtils.getObject(custInfoMap, "norCustInfo");
			if (obj != null && obj instanceof List) {
				List<Map<String, Object>> tmpList = (List<Map<String, Object>>) obj;
				Map<String, Object> norCustInfo = buildCustInfoList(tmpList, speCustInfoLen);
				if(null != norCustInfo && null != norCustInfo.get("specInfoList")){
					custInfoSet.setSpeLineCInfoList((List<ItemInfoSet>) norCustInfo.get("specInfoList"));
				}
				if(null != norCustInfo && null != norCustInfo.get("cInfoList")){
					custInfoSet.setNorCInfoList((List<ItemInfoTwoSet>) norCustInfo.get("cInfoList"));
				}
				if(null != norCustInfo && null != norCustInfo.get("lineCInfoList")){
					custInfoSet.setNorLineCInfoList((List<ItemInfoSet>) norCustInfo.get("lineCInfoList"));
				}
			}
			obj = MapUtils.getObject(custInfoMap, "orgCustInfo");
			if (obj != null && obj instanceof List) {
				List<Map<String, Object>> tmpList = (List<Map<String, Object>>) obj;
				Map<String, Object> orgCustInfo = buildCustInfoList(tmpList, speCustInfoLen);
				if(null != orgCustInfo && null != orgCustInfo.get("cInfoList")){
					custInfoSet.setOrgCInfoList((List<ItemInfoTwoSet>) orgCustInfo.get("cInfoList"));
				}
				if(null != orgCustInfo && null != orgCustInfo.get("lineCInfoList")){
					custInfoSet.setOrgLineCInfoList((List<ItemInfoSet>) orgCustInfo.get("lineCInfoList"));
				}
			}
			custInfos.add(custInfoSet);
		}
		return custInfos;
	}
	
	private Map<String, Object> buildCustInfoList(List<Map<String, Object>> custInfoList, int speCustInfoLen) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		
		Map<String, Object> itemsMap = dealOneLineItems(custInfoList);
		List<Map<String, Object>> specList = null;
		List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
		List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
		
		Map<String, Object> itemsNewMap = splitSpeCustInfoList(normList, speCustInfoLen);
		specList = (List<Map<String, Object>>) itemsNewMap.get("spec");
		normList = (List<Map<String, Object>>) itemsNewMap.get("norm");
		
		List<ItemInfoSet> specCInfoList = buildSpecCInfoList(specList);
		List<ItemInfoTwoSet> cInfoList = buildCInfoList(normList);
		List<ItemInfoSet> lineCInfoList = buildLineCInfoList(lineList);
		
		retnMap.put("specInfoList", specCInfoList);
		retnMap.put("cInfoList", cInfoList);
		retnMap.put("lineCInfoList", lineCInfoList);
		
		return retnMap;
	}
	
	private List<ItemInfoSet> buildSpecCInfoList(List<Map<String, Object>> specList) {
		List<ItemInfoSet> retnList = new ArrayList<ItemInfoSet>();
		for (int i = 0; specList != null && i < specList.size(); i++) {
			Map<String, Object> itemMap = specList.get(i);
			ItemInfoSet itemInfoSet = new ItemInfoSet();
			String itemName = MapUtils.getString(itemMap, "itemName");
			if (itemName != null) {
				itemName += SysConstant.STR_SEP;
			}
			itemInfoSet.setItemName(itemName);
			itemInfoSet.setItemValue(MapUtils.getString(itemMap, "itemValue"));
			retnList.add(itemInfoSet);
		}
		if (retnList.size() == 0) {
			retnList = null;
		}
		return retnList;
	}
	
	private List<ItemInfoTwoSet> buildCInfoList(List<Map<String, Object>> normList) {
		List<ItemInfoTwoSet> retnList = new ArrayList<ItemInfoTwoSet>();
		ItemInfoTwoSet infoTwoSet = null;
		for (int i = 0; normList != null && i < normList.size(); i++) {
			if (i % 2 == 0) {
				infoTwoSet = new ItemInfoTwoSet();
			}
			Map<String, Object> itemMap = normList.get(i);
			String itemName = MapUtils.getString(itemMap, "itemName");
			if (itemName != null) {
				itemName += SysConstant.STR_SEP;
			}
			if (i % 2 == 0) {
				infoTwoSet.setItemName0(itemName);
				infoTwoSet.setItemValue0(MapUtils.getString(itemMap, "itemValue"));
			} else {
				infoTwoSet.setItemName1(itemName);
				infoTwoSet.setItemValue1(MapUtils.getString(itemMap, "itemValue"));
			}
			if (i % 2 != 0) {
				retnList.add(infoTwoSet);
			}
		}

		if (retnList.size() == 0) {
			retnList = null;
		}
		return retnList;
	}
	
	private List<ItemInfoSet> buildLineCInfoList(List<Map<String, Object>> lineList) {
		List<ItemInfoSet> retnList = new ArrayList<ItemInfoSet>();
		for (int i = 0; lineList != null && i < lineList.size(); i++) {
			Map<String, Object> itemMap = lineList.get(i);
			ItemInfoSet itemInfoSet = new ItemInfoSet();
			String itemName = MapUtils.getString(itemMap, "itemName");
			if (itemName != null) {
				itemName += SysConstant.STR_SEP;
			}
			itemInfoSet.setItemName(itemName);
			itemInfoSet.setItemValue(MapUtils.getString(itemMap, "itemValue"));
			retnList.add(itemInfoSet);
		}
		if (retnList.size() == 0) {
			retnList = null;
		}
		return retnList;
	}
	
	private Map<String, Object> dealOneLineItems(List<Map<String, Object>> dataList) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> lineItemList = new ArrayList<Map<String,Object>>();
		for (int i = 0; i < dataList.size(); i++) {
			Map<String, Object> itemMap = dataList.get(i);
			if (validOneLineAttr(itemMap)) {
				lineItemList.add(itemMap);
			} else {
				normItemList.add(itemMap);
			}
		}
		if (normItemList.size() > 0) {
			retnMap.put("norm", normItemList);
		}
		if (lineItemList.size() > 0) {
			retnMap.put("line", lineItemList);
		}
		return retnMap;
	}
	
	private Map<String, Object> splitSpeCustInfoList(List<Map<String, Object>> dataList, int speCustInfoLen) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<Map<String, Object>> specItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		for (int i = 0;dataList != null && i < dataList.size(); i++) {
			Map<String, Object> itemMap = dataList.get(i);
			String itemValue = MapUtils.getString(itemMap, "itemValue");
			if (itemValue != null && itemValue.length() > speCustInfoLen) {
				specItemList.add(itemMap);
			} else {
				normItemList.add(itemMap);
			}
		}
		retnMap.put("spec", specItemList);
		retnMap.put("norm", normItemList);
		return retnMap;
	}
	
	private boolean validOneLineAttr(Map<String, Object> itemMap) {
		String isAloneLine = MapUtils.getString(itemMap, "isAloneLine");
		if (SysConstant.STR_Y.equals(isAloneLine)) {
			return true;
		}
		return false;
	}
	
	private List<OrderEventSet> parseOrderEvents(Map<String, Object> dataMap, int speCustInfoLen) {
		List<OrderEventSet> orderEventSets = new ArrayList<OrderEventSet>();
		if (dataMap.containsKey("orderEvent")) {
			List<Map<String, Object>> orderEventList = (List<Map<String, Object>>) dataMap.get("orderEvent");
			orderEventList = dealOrderEventSeq(orderEventList);
			int eventSize = orderEventList.size();
			boolean attachFlag = false;
			for (int i = 0; i < eventSize; i++) {
				Map<String, Object> event = orderEventList.get(i);
				OrderEventSet set = null;
				String orderEventType = MapUtils.getString(event, "orderEventType", "0");				
				if ("1".equals(orderEventType)) {
					Map<String, Object> finalAttachMap = getAttachForMain(event, 1, orderEventList);
					if (MapUtils.isNotEmpty(finalAttachMap)) {
						attachFlag = true;
					}
				}
			}
			
			
			int orderEventSeq = 1;
			for (int i = 0; i < eventSize; i++) {
				Map<String, Object> event = orderEventList.get(i);
				OrderEventSet set = null;
				String orderEventType = MapUtils.getString(event, "orderEventType", "0");				
				if ("1".equals(orderEventType)) {
					set = buildOrderEvent_1(event, orderEventSeq, eventSize, orderEventList);
				} else if ("2".equals(orderEventType)) {
					set = buildOrderEvent_2(event, orderEventSeq, eventSize);
				} else if ("3".equals(orderEventType)) {
					set = buildOrderEvent_3(event, orderEventSeq, eventSize, attachFlag);
				} else if ("4".equals(orderEventType)) {
					set = buildOrderEvent_4(event, orderEventSeq, eventSize);
				} else if ("5".equals(orderEventType)) {
					set = buildOrderEvent_5(event, orderEventSeq, eventSize, speCustInfoLen, attachFlag);
				} else if ("6".equals(orderEventType)) {
					set = buildOrderEvent_6(event, orderEventSeq, eventSize);
				} 
				
				if (set != null) {
					orderEventSets.add(set);
					orderEventSeq++;
				}
			}
		}
		
		return orderEventSets;
	}
	
	/**
	 * 调整OrderEvent中数据的顺序，把合约计划放在第一个
	 * @param eventList
	 * @return
	 */
	private List<Map<String, Object>> dealOrderEventSeq(List<Map<String, Object>> eventList) {
		if (eventList == null) {
			return new ArrayList<Map<String,Object>>();
		}
		if (eventList.size() <= 1) {
			return eventList;
		}
		for (int i = 0; i < eventList.size(); i++) {
			Map<String, Object> event = eventList.get(i);
			String orderEventType = MapUtils.getString(event, "orderEventType");
			if ("2".equals(orderEventType)) {
				eventList.remove(i);
				eventList.add(0, event);
			}
		}
		return eventList;
	}
	
	private Map<String, Object> getAttachForMain(Map<String, Object> event, int orderSeq, List<Map<String, Object>> orderEventList) {
		//判断是否存在叠加包  BEGIN
//		有叠加包的情况：
//		1、订购了套餐外的可选包
//			规则：orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> offerInfos存在
//		2、存在加装手机或加装
//			规则：
//		3、订购了套餐外的功能产品
//			规则： orderEventType为3的附属销售品[订购、续订、变更、退订]，主销售品[退订、注销] 中，
//				    找orderEventTitle -> boActionTypeCd为7的功能产品，从中过滤掉
//				  orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> servInfos的功能产品，
//				    再过滤掉orderEventCont -> userAcceNbrs -> [x] -> donateItems中的赠送类
//				    剩下的如果存在，就是有订购套餐外功能产品
		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
		boolean attachFlag = false;
		List<Map<String, Object>> attachOneList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> attachTwoList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> attachThreeList = new ArrayList<Map<String,Object>>();
		// seq 1
		Map<String, Object> osAttachInfos = MapUtils.getMap(contMap, "osAttachInfos");
		if (MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> offerInfos = (List<Map<String, Object>>) osAttachInfos.get("offerInfos");
			if (offerInfos != null && offerInfos.size() > 0) {
				attachOneList.addAll(offerInfos);
			}
		}
		// seq 2
		List<Map<String, Object>> userAcceNbrs = (List<Map<String, Object>>) contMap.get("userAcceNbrs");
		if (userAcceNbrs != null && userAcceNbrs.size() > 0) {
			for (int i = 0; i < userAcceNbrs.size(); i++) {
				Map<String, Object> userAcceNbrMap = userAcceNbrs.get(i);
				String memberRoleCd = MapUtils.getString(userAcceNbrMap, "memberRoleCd", "");
				//如果是401加装移动电话（天翼副卡）或501加装无线宽带
				if ("401".equals(memberRoleCd) || "501".equals(memberRoleCd)) {
					attachTwoList.add(userAcceNbrMap);
				}
			}
		}
		// seq 3
		List<String> servObjIdList = new ArrayList<String>();
		if (MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> servInfos = (List<Map<String, Object>>) osAttachInfos.get("servInfos");
			for (int i = 0; servInfos != null && i < servInfos.size(); i++) {
				Map<String, Object> tmpServInfoMap = servInfos.get(i);
				servObjIdList.add(MapUtils.getString(tmpServInfoMap, "objId", "-1"));
			}
		}
		List<String> donateList = new ArrayList<String>();
		if (userAcceNbrs != null && userAcceNbrs.size() > 0) {
			for (int i = 0; i < userAcceNbrs.size(); i++) {
				Map<String, Object> userAcceNbrMap = userAcceNbrs.get(i);
				String acceNbr = (String) userAcceNbrMap.get("acceNbr");
				List<Map<String, Object>> donateItems = (List<Map<String, Object>>) userAcceNbrMap.get("donateItems");
				for (int j = 0; donateItems != null && j < donateItems.size(); j++) {
					String objId = MapUtils.getString(donateItems.get(j), "objId", "");
					donateList.add(objId + "-" + acceNbr);
				}
			}
		}
		for (int i = 0; i < orderEventList.size(); i++) {
			Map<String, Object> tmpOrderEventMap = orderEventList.get(i);
			String orderEventType = MapUtils.getString(tmpOrderEventMap, "orderEventType", "");
			if ("3".equals(orderEventType)) {
				Map<String, Object> tmpTitleMap = MapUtils.getMap(tmpOrderEventMap, "orderEventTitle");
				String boActionTypeCd = MapUtils.getString(tmpTitleMap, "boActionTypeCd", "");
				if ("7".equals(boActionTypeCd)) {
					List<Map<String, Object>> tmpContList = (List<Map<String, Object>>) tmpOrderEventMap.get("orderEventCont");
					for (int j = 0; tmpContList != null && j < tmpContList.size(); j++) {
						Map<String, Object> tmpContMap = tmpContList.get(j);
						String tmpObjId = MapUtils.getString(tmpContMap, "objId", "");
						String relaAcceNbr = MapUtils.getString(tmpContMap, "relaAcceNbr", "");
						if (!servObjIdList.contains(tmpObjId) && !filterProd(tmpObjId) && !donateList.contains(tmpObjId + "-" + relaAcceNbr)) {
							attachThreeList.add(tmpContMap);
						}
					}
				}
			}
		}
		Map<String, Object> finalAttachMap = new HashMap<String, Object>();
		if (attachOneList.size() > 0 || attachTwoList.size() > 0 || attachThreeList.size() > 0) {
			attachFlag = true;
			// 设置业务信息_主销售品_叠加包
			finalAttachMap.put("attachOneList", attachOneList);
			finalAttachMap.put("attachTwoList", attachTwoList);
			finalAttachMap.put("attachThreeList", attachThreeList);
		}
		//判断是否存在叠加包  END
		return finalAttachMap;
	}
	
	
	/**
	 * 组装－业务信息_主销售品订购
	 * @param event
	 * @param orderSeq
	 * @param eventSize
	 * @return
	 */
	private OrderEventSet buildOrderEvent_1(Map<String, Object> event, int orderSeq, int eventSize, List<Map<String, Object>> orderEventList) {
		if (event == null) {
			return null;
		}
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置业务信息_分隔线
		if(orderSeq <= eventSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}
		
		// 设置业务信息_主销售品
		List<OEMainOfferSet> mainOfferList = new ArrayList<OEMainOfferSet>();
		OEMainOfferSet oeMainOfferSet = new OEMainOfferSet();
		
		//判断是否存在叠加包  BEGIN
//		有叠加包的情况：
//		1、订购了套餐外的可选包
//			规则：orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> offerInfos存在
//		2、存在加装手机或加装
//			规则：
//		3、订购了套餐外的功能产品
//			规则： orderEventType为3的附属销售品[订购、续订、变更、退订]，主销售品[退订、注销] 中，
//				    找orderEventTitle -> boActionTypeCd为7的功能产品，从中过滤掉
//				  orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> servInfos的功能产品，
//				    剩下的如果存在，就是有订购套餐外功能产品
		boolean attachFlag = false;
		Map<String, Object> finalAttachMap = getAttachForMain(event, orderSeq, orderEventList);
		if (MapUtils.isNotEmpty(finalAttachMap)) {
			attachFlag = true;
			// 设置业务信息_主销售品_叠加包
			List<OSAttachOfferSet> osAttachOfferList = new ArrayList<OSAttachOfferSet>();
			OSAttachOfferSet attachOfferSet = buildOE_1_AttachOffer_New(1, finalAttachMap);
			
			if (attachOfferSet != null) {
				osAttachOfferList.add(attachOfferSet);
				oeMainOfferSet.setOsAttachOfferList(osAttachOfferList);
			}
		}
		//判断是否存在叠加包  END
		
		//判断是否存在合约 BEGIN
		Map<String, Object> tmpEvent = orderEventList.get(0);
		//如果第一个是合约的
		boolean agreementFlag = false;
		if ("2".equals(MapUtils.getString(tmpEvent, "orderEventType", ""))) {
			agreementFlag = true;
		}
		//判断是否存在合约 END
		
		
		// 设置业务信息_主销售品_标题
		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
		if (event.containsKey("orderEventTitle")) {
			List<StringBeanSet> strList = new ArrayList<StringBeanSet>();
			String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
			String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
			String effectRule = MapUtils.getString(titleMap, "effectRule", "");
			String attachOfferPkg = MapUtils.getString(titleMap, "attachOfferPkg", "");
			String attachOfferSpecName = MapUtils.getString(titleMap, "attachOfferSpecName", "");
			
			StringBeanSet strBean = buildOE_1_Title_New(eventSize, orderSeq, boActionTypeName, prodSpecName, effectRule, attachOfferPkg, attachOfferSpecName, attachFlag, agreementFlag);
//			StringBeanSet strBean = buildOE_1_Title(eventSize, orderSeq, boActionTypeName, prodSpecName, effectRule, attachOfferPkg, attachOfferSpecName);
			strList.add(strBean);
			oeMainOfferSet.setMainOfferTitle(strList);
		}
		// 设置业务信息_主销售品_内容
		if (event.containsKey("orderEventCont")) {
			int busiOrderSeq = 1;
			// 设置业务信息_主销售品_接入号码
			List<AcceNbrNewSet> acceNbrNewList = new ArrayList<AcceNbrNewSet>();
			if (contMap != null && contMap.containsKey("userAcceNbrs")) {
				AcceNbrNewSet acceNbrNewSet = buildOE_1_AcceNbrNew(busiOrderSeq, (List<Map<String, Object>>) contMap.get("userAcceNbrs"));
				if(null != acceNbrNewSet){
					busiOrderSeq ++;
					
					acceNbrNewList.add(acceNbrNewSet);
					
					oeMainOfferSet.setAcceNbrNewList(acceNbrNewList);
				}
			}
			// 设置业务信息_主销售品_套餐月基本费
			List<OSBaseInfoSet> osBaseInfoSets = new ArrayList<OSBaseInfoSet>();
			if (contMap != null && contMap.containsKey("osBaseInfo")) {
				OSBaseInfoSet osBaseInfoSet = 
						buildOE_1_OSInfo(busiOrderSeq, SysConstant.OS_INFO_IN, 
								(List<Map<String, Object>>) contMap.get("osBaseInfo"));
				if (osBaseInfoSet != null) {
					busiOrderSeq++;
					osBaseInfoSets.add(osBaseInfoSet);
					oeMainOfferSet.setOsBaseInfoList(osBaseInfoSets);
				}
			}
			// 设置业务信息_主销售品_套餐超出资费
			List<OSBaseInfoSet> osOutInfoList = new ArrayList<OSBaseInfoSet>();
			if (contMap != null && contMap.containsKey("osOutInfos")) {
				OSBaseInfoSet outInfoSet = 
						buildOE_1_OSInfo(busiOrderSeq, SysConstant.OS_INFO_OUT, 
								(List<Map<String, Object>>) contMap.get("osOutInfos"));
				if (outInfoSet != null) {
					busiOrderSeq++;
					osOutInfoList.add(outInfoSet);
					oeMainOfferSet.setOsOutInfoList(osOutInfoList);
				}
			}
			// 设置业务信息_主销售品_订购当月资费
			List<OSOrderInfoSet> osOrderInfoList = new ArrayList<OSOrderInfoSet>();
			if (contMap != null && contMap.containsKey("osOrderInfo")) {
				OSOrderInfoSet orderInfoSet = buildOE_1_OrderInfo(busiOrderSeq, (String) contMap.get("osOrderInfo"));
				if (orderInfoSet != null) {
					busiOrderSeq++;
					osOrderInfoList.add(orderInfoSet);
					oeMainOfferSet.setOsOrderInfoList(osOrderInfoList);
				}
			}
			// 设置业务信息_主销售品_其它说明
			List<OSOtherInfoSet> osOtherInfoList = new ArrayList<OSOtherInfoSet>();
			if (contMap != null && contMap.containsKey("osOtherInfo")) {
				OSOtherInfoSet otherInfoSet = buildOE_1_OtherInfo(busiOrderSeq, 
						(List<Map<String, Object>>) contMap.get("osOtherInfo"));
				if(otherInfoSet != null){
					busiOrderSeq ++;
					osOtherInfoList.add(otherInfoSet);
					oeMainOfferSet.setOsOtherInfoList(osOtherInfoList);
				}
			}
			// 设置业务信息_主销售品_套餐优惠
			List<OSPrompInfoSet> osPrompInfoList = new ArrayList<OSPrompInfoSet>();
			if (contMap != null && contMap.containsKey("osPrompInfo")) {
				OSPrompInfoSet prompInfoSet = buildOE_1_PrompInfo(busiOrderSeq, MapUtils.getString(contMap, "osPrompInfo"));
				if(null != prompInfoSet){
					busiOrderSeq ++;
					osPrompInfoList.add(prompInfoSet);
					oeMainOfferSet.setOsPrompInfoList(osPrompInfoList);
				}
			}
			// 设置业务信息_主销售品_叠加包
//			List<OSAttachOfferSet> osAttachOfferList = new ArrayList<OSAttachOfferSet>();
//			if(contMap != null && contMap.containsKey("osAttachInfos")){
//				OSAttachOfferSet attachOfferSet = buildOE_1_AttachOffer(busiOrderSeq, 
//						(Map<String, Object>) contMap.get("osAttachInfos"));
//				
//				if (attachOfferSet != null) {
//					osAttachOfferList.add(attachOfferSet);
//					oeMainOfferSet.setOsAttachOfferList(osAttachOfferList);
//				}
//			}
		}
		
		mainOfferList.add(oeMainOfferSet);
		orderEvent.setMainOfferList(mainOfferList);
		return orderEvent;
	}
	
	private StringBeanSet buildOE_1_Title_New(int tolNbr, int seq, String boActionTypeName,
			String offerSpecName, String effectRule, String attachOfferPkg,
			String attachOfferSpecName, boolean attachFlag, boolean agreementFlag) {
		StringBeanSet strBean = new StringBeanSet();
		String titleStr = "";
		//20140408 注释以下判断，使得订购主销售品前面不加上序号
//		if(tolNbr != SysConstant.INT_1){
//			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
//		}
		titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
		if (agreementFlag) {
			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
		}
		
		titleStr += StringUtils.isEmpty(boActionTypeName) ? "" : 
			(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
		titleStr += StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName;

		if (attachFlag) {
			titleStr += SysConstant.STR_ENT + SysConstant.STR_SPE + "套餐" + SysConstant.STR_SPE + SysConstant.STR_SPE;
//			titleStr += SysConstant.STR_ENT + SysConstant.STR_SPE + SysConstant.STR_SPE + "套餐" + SysConstant.STR_SPE + SysConstant.STR_SPE;
		}

		titleStr += StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
//		titleStr += StringUtils.isEmpty(attachOfferSpecName) ? "" : 
//			(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + attachOfferSpecName + SysConstant.STR_RL_BRE);

		strBean.setStrBean(titleStr);
		
		return strBean;
	}
	
	private StringBeanSet buildOE_1_Title(int tolNbr, int seq, String boActionTypeName,
			String offerSpecName, String effectRule, String attachOfferPkg,
			String attachOfferSpecName) {
		StringBeanSet strBean = new StringBeanSet();
		String titleStr = "";
		//20140408 注释以下判断，使得订购主销售品前面不加上序号
//		if(tolNbr != SysConstant.INT_1){
//			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
//		}
		
		titleStr += StringUtils.isEmpty(boActionTypeName) ? "" : 
			(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
		titleStr += StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName;

		if (SysConstant.STR_Y.equals(attachOfferPkg)) {
			titleStr += SysConstant.STR_ENT + SysConstant.STR_SPE + SysConstant.STR_SPE + "套餐" + SysConstant.STR_SPE + SysConstant.STR_SPE;
		}

		titleStr += StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
		titleStr += StringUtils.isEmpty(attachOfferSpecName) ? "" : 
			(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + attachOfferSpecName + SysConstant.STR_RL_BRE);

		strBean.setStrBean(titleStr);
		
		return strBean;
	}
	
	private AcceNbrNewSet buildOE_1_AcceNbrNew(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null) {
			return null;
		}
		AcceNbrNewSet newSet = new AcceNbrNewSet();
		// 设置接入号码头
		List<StringBeanSet> strBeanList = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet(orderSeq + SysConstant.STR_PAU + "用户号码" + SysConstant.STR_SEP);
		strBeanList.add(strBean);
		newSet.setAcceNbrTitle(strBeanList);
		
		// 设置产品属性内容
		List<OfferProdAttrsSet> offerProdInfos = new ArrayList<OfferProdAttrsSet>();
		for (int i = 0; i < paramList.size(); i++) {
			Map<String, Object> offerProdAttrMap = paramList.get(i);
			OfferProdAttrsSet offerProdAttrsSet = new OfferProdAttrsSet();
			
			// 展示产品接入号
			List<StringBeanSet> acceList = new ArrayList<StringBeanSet>();
			String acceType = "";
			String acceNbr = "";
			String userType = "";
			String userParam = "";
			if (offerProdAttrMap.containsKey("acceType")) {
				acceType = MapUtils.getString(offerProdAttrMap, "acceType");
			}
			if (offerProdAttrMap.containsKey("acceNbr")) {
				acceNbr = MapUtils.getString(offerProdAttrMap, "acceNbr");
			}
			if (offerProdAttrMap.containsKey("userType")) {
				userType = MapUtils.getString(offerProdAttrMap, "userType");
			}
			if (offerProdAttrMap.containsKey("userParam")) {
				userParam = MapUtils.getString(offerProdAttrMap, "userParam");
			}
			String memberRoleCd = MapUtils.getString(offerProdAttrMap, "memberRoleCd", "");
			StringBeanSet acceBean = new StringBeanSet();
			String str = "";
			if ("400".equals(memberRoleCd)) {
				str = "手机号码" + SysConstant.STR_SEP + buildOE_1_AcceNbr_Value(acceNbr, userType, userParam) + "（主卡标识）";
			} else if ("401".equals(memberRoleCd) || "501".equals(memberRoleCd)) {
				
			} else {
				str = buildOE_1_AcceNbr_Name(acceType) + buildOE_1_AcceNbr_Value(acceNbr, userType, userParam);
			}
			acceBean.setStrBean(str);
			acceList.add(acceBean);
			offerProdAttrsSet.setAcceNbrInfo(acceList);

			// 展示产品属性
			if (offerProdAttrMap.containsKey("offerProdAttrs")) {
				List<Map<String, Object>> offerProdAttrs = (List<Map<String, Object>>) offerProdAttrMap.get("offerProdAttrs");
				Map<String, Object> itemsMap = dealOneLineItems(offerProdAttrs);
				if (MapUtils.isNotEmpty(itemsMap)) {
					List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
					List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
					if (normList != null && normList.size() > 0) {
						List<ItemInfoTwoNewSet> norOfferProdInfos = new ArrayList<ItemInfoTwoNewSet>();
						ItemInfoTwoNewSet itemTwo = null;
						for (int j = 0; j < normList.size(); j++) {
							if (j % 2 == 0) {
								itemTwo = new ItemInfoTwoNewSet();
							}
							Map<String, Object> normMap = normList.get(j);
							String itemName = MapUtils.getString(normMap, "itemName", "");
							String itemValue = MapUtils.getString(normMap, "itemValue", "");
							// 设置类属性
							if (j % 2 == 0) {
								itemTwo.setItemInfo1(itemName + SysConstant.STR_SEP + itemValue);
							} else {
								itemTwo.setItemInfo2(itemName + SysConstant.STR_SEP + itemValue);
							}
							if (j % 2 != 0) {
								norOfferProdInfos.add(itemTwo);
							}
						}
						if (norOfferProdInfos.size() > 0) {
							offerProdAttrsSet.setNorOfferProdInfos(norOfferProdInfos);
						}
					}
					if (lineList != null && lineList.size() > 0) {
						List<StringBeanSet> lineOfferProdInfos = new ArrayList<StringBeanSet>();
						for (int j = 0; j < lineList.size(); j++) {
							Map<String, Object> lineMap = lineList.get(j);
							String itemName = MapUtils.getString(lineMap, "itemName", "");
							String itemValue = MapUtils.getString(lineMap, "itemValue", "");
							StringBeanSet lineBean = new StringBeanSet();
							lineBean.setStrBean(itemName + SysConstant.STR_SEP + itemValue);
							lineOfferProdInfos.add(lineBean);
						}
						if (lineOfferProdInfos.size() > 0) {
							offerProdAttrsSet.setLineOfferProdInfos(lineOfferProdInfos);
						}
					}
				}
			}
			offerProdInfos.add(offerProdAttrsSet);
		}
		newSet.setOfferProdInfos(offerProdInfos);
		return newSet;
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_接入号－名称
	 * @param acceNbr
	 * @param userType
	 * @param userParam
	 * @return
	 */
	private String buildOE_1_AcceNbr_Name(String acceType){
		return (StringUtils.isEmpty(acceType) ? "" : acceType + SysConstant.STR_SEP);
	}
	/**
	 * 组装－业务信息_主销售品_内容_接入号－参数
	 * @param acceNbr
	 * @param userType
	 * @param userParam
	 * @return
	 */
	private String buildOE_1_AcceNbr_Value(String acceNbr, String userType, String userParam){
		return (StringUtils.isEmpty(acceNbr) ? "" : acceNbr) 
			+ (StringUtils.isEmpty(userType) ? "" : SysConstant.STR_LL_BRE + userType + SysConstant.STR_RL_BRE) 
			+ (StringUtils.isEmpty(userParam) ? "" : userParam);
	}
	
	private OSBaseInfoSet buildOE_1_OSInfo(int orderSeq, int osInfoType, List<Map<String, Object>> paramList) {
		if (paramList == null || paramList.size() == 0) {
			return null;
		}
		OSBaseInfoSet osBaseInfoSet = new OSBaseInfoSet();
		
		// 设置套餐月基本费头
		List<StringBeanSet> baseInfoTitles = new ArrayList<StringBeanSet>();
		StringBeanSet baseInfoTitleSet = new StringBeanSet();
		String titleStr = "";
		//遍历paramList，找出其中itemName为套餐月租费的项，取其中的金额
		if (SysConstant.OS_INFO_IN == osInfoType) {
			for (int i = 0; i < paramList.size(); i++) {
				Map<String, Object> tmpMap = paramList.get(i);
				String itemName = MapUtils.getString(tmpMap, "itemName", "");
				if ("套餐月租费".equals(itemName)) {
					String itemParam = MapUtils.getString(tmpMap, "itemParam", "");
					String itemUnit = MapUtils.getString(tmpMap, "itemUnit", "");
					String itemMark = MapUtils.getString(tmpMap, "itemMark", "");
					//把套餐月租费改为套餐月基本费
					titleStr = buildOE_1_OSInfo_Title(orderSeq, "套餐月基本费", itemParam, itemUnit, itemMark);
					paramList.remove(i);
					break;
				}
			}
		} else {
			titleStr = orderSeq + SysConstant.STR_PAU + "套餐超出资费" + SysConstant.STR_SEP;
		}
//		if (MapUtils.isNotEmpty(firstMap)) {
//			String itemName = MapUtils.getString(firstMap, "itemName", "");
//			String itemParam = MapUtils.getString(firstMap, "itemParam", "");
//			String itemUnit = MapUtils.getString(firstMap, "itemUnit", "");
//			String itemMark = MapUtils.getString(firstMap, "itemMark", "");
//			
//			if ("套餐月基本费".equals(itemName)) {
//				titleStr = buildOE_1_OSInfo_Title(orderSeq, itemName, itemParam, itemUnit, itemMark);
//				paramList.remove(0);
//			} else {
//				if (SysConstant.OS_INFO_IN == osInfoType) {
//					titleStr = buildOE_1_OSInfo_Title(orderSeq, "套餐月基本费", "", "", "");
//				} else if (SysConstant.OS_INFO_OUT == osInfoType) {
//					titleStr = buildOE_1_OSInfo_Title(orderSeq, "套餐超出资费", "", "", "");
//				}
//			}
//		}
		baseInfoTitleSet.setStrBean(titleStr);
		baseInfoTitles.add(baseInfoTitleSet);
		osBaseInfoSet.setBaseInfoTitle(baseInfoTitles);
		// 设置套餐月基本费内容
		Map<String, Object> preMap = dealDonateItems(paramList);
		if (MapUtils.isNotEmpty(preMap)) {
			List<Map<String, Object>> preNormList = (List<Map<String, Object>>) preMap.get("norm");
			List<Map<String, Object>> donateList = (List<Map<String, Object>>) preMap.get("donate");
			
			Map<String, Object> itemsMap = dealOneLineItems(preNormList);
			if (MapUtils.isNotEmpty(itemsMap)) {
				List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
				List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
				if (normList != null && normList.size() > 0) {
					List<StringTwoSet> norOSBaseInfos = new ArrayList<StringTwoSet>();
					StringTwoSet itemTwo = null;
					for (int i = 0; i < normList.size(); i++) {
						if (i % 2 == 0) {
							itemTwo = new StringTwoSet();
						}
						Map<String, Object> tmpMap = normList.get(i);
						String itemName = MapUtils.getString(tmpMap, "itemName", "");
						String itemParam = MapUtils.getString(tmpMap, "itemParam", "");
						String itemUnit = MapUtils.getString(tmpMap, "itemUnit", "");
						String itemMark = MapUtils.getString(tmpMap, "itemMark", "");
						// 设置类属性
						String tmpStr = itemName + SysConstant.STR_SEP + buildOE_1_OSInfo_Cont(itemParam, itemUnit, itemMark);
						if(tmpStr.endsWith(SysConstant.STR_SEP + SysConstant.STR_SPI)){
							tmpStr = itemName + SysConstant.STR_SPI;
						}
						if (i % 2 == 0) {
							itemTwo.setStrBean0(tmpStr);
						} else {
							itemTwo.setStrBean1(tmpStr);
						}
						if (i % 2 != 0) {
							norOSBaseInfos.add(itemTwo);
						}
					}
					if (norOSBaseInfos.size() > 0) {
						osBaseInfoSet.setNorOSBaseInfos(norOSBaseInfos);
					}
				}
				if (lineList != null && lineList.size() > 0) {
					List<StringBeanSet> lineOSBaseInfos = new ArrayList<StringBeanSet>();
					for (int i = 0; i < lineList.size(); i++) {
						Map<String, Object> tmpMap = lineList.get(i);
						StringBeanSet lineBean = new StringBeanSet();
						String itemName = MapUtils.getString(tmpMap, "itemName", "");
						String itemParam = MapUtils.getString(tmpMap, "itemParam", "");
						String itemUnit = MapUtils.getString(tmpMap, "itemUnit", "");
						String itemMark = MapUtils.getString(tmpMap, "itemMark", "");
						// 设置类属性
						String tmpStr = itemName + SysConstant.STR_SEP + buildOE_1_OSInfo_Cont(itemParam, itemUnit, itemMark);
						if(tmpStr.endsWith(SysConstant.STR_SEP + SysConstant.STR_SPI)){
							tmpStr = itemName + SysConstant.STR_SPI;
						}
						lineBean.setStrBean(tmpStr);
						lineOSBaseInfos.add(lineBean);
					}
					if (lineOSBaseInfos.size() > 0) {
						osBaseInfoSet.setLineOSBaseInfos(lineOSBaseInfos);
					}
				}
			}
			// 设置赠送资费项内容
			if (donateList != null && donateList.size() > 0) {
				List<StringBeanSet> donateOSBaseInfos = new ArrayList<StringBeanSet>();
				StringBuffer donateSb = new StringBuffer();
				for (int i = 0; i < donateList.size(); i++) {
					Map<String, Object> tmpMap = donateList.get(i);
					if (tmpMap.containsKey("itemName")) {
						donateSb.append(MapUtils.getString(tmpMap, "itemName", ""));
						donateSb.append(SysConstant.STR_SPI);
					}
				}
				if (donateSb.length() > 0) {
					donateSb.deleteCharAt(donateSb.length() - 1);
					String tmpStr = "赠送" + SysConstant.STR_SEP + SysConstant.STR_SPE + donateSb.toString();
					StringBeanSet donateBean = new StringBeanSet(tmpStr);
					donateOSBaseInfos.add(donateBean);
				}
				if (donateOSBaseInfos.size() > 0) {
					osBaseInfoSet.setDonateOSBaseInfos(donateOSBaseInfos);
				}
			}
		}
		
		return osBaseInfoSet;
	}
	
	
	/**
	 * 组装－业务信息_主销售品_内容_套餐月基本费_标题
	 * @param orderSeq
	 * @param itemName
	 * @param itemParam
	 * @param itemUnit
	 * @param itemMark
	 * @return
	 */
	private String buildOE_1_OSInfo_Title(int orderSeq, String itemName, String itemParam, String itemUnit, String itemMark){
		return orderSeq + SysConstant.STR_PAU + itemName + SysConstant.STR_SEP + itemParam
				+ itemUnit + itemMark + SysConstant.STR_COM + "包含" + SysConstant.STR_SEP;
	}
	
	
	/**
	 * 组装－业务信息_主销售品_内容_套餐月基本费_内容信息
	 * @param itemParam
	 * @param itemUnit
	 * @param itemMark
	 * @return
	 */
	private String buildOE_1_OSInfo_Cont(String itemParam, String itemUnit, String itemMark){
		String tmpStr = itemParam + SysConstant.STR_SPE + itemUnit + SysConstant.STR_SPE;
		if (StringUtils.isNotEmpty(itemMark)) {
			tmpStr += SysConstant.STR_LL_BRE + itemMark + SysConstant.STR_RL_BRE;
		}
		tmpStr += SysConstant.STR_SPI;
		return tmpStr;
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_订购当月资费
	 * @param orderSeq
	 * @param jsonObjParam
	 * @return
	 */
	private OSOrderInfoSet buildOE_1_OrderInfo(int orderSeq, String strParam){
		if(null == strParam){
			return null;
		}
		
		OSOrderInfoSet orderInfoSet = new OSOrderInfoSet();
		
		List<StringBeanSet> orderInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, "订购当月资费"));
		orderInfoTitle.add(strBeanTitle);
		orderInfoSet.setOrderInfoTitle(orderInfoTitle);
		
		List<StringBeanSet> osOrderInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCont = new StringBeanSet(strParam);
		osOrderInfos.add(strBeanCont);
		orderInfoSet.setOsOrderInfos(osOrderInfos);
		
		return orderInfoSet;
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_其它说明
	 * @param orderSeq
	 * @param jsonArrayParam
	 * @return
	 */
	private OSOtherInfoSet buildOE_1_OtherInfo(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null || paramList.size() == 0) {
			return null;
		}
		OSOtherInfoSet otherInfoSet = new OSOtherInfoSet();
		List<StringBeanSet> otherInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, "其它说明"));
		otherInfoTitle.add(strBeanTitle);
		otherInfoSet.setOtherInfoTitle(otherInfoTitle);
		List<StringBeanSet> osOtherInfos = new ArrayList<StringBeanSet>();
		int len = paramList.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> paramMap = paramList.get(i);
			if (paramMap != null && paramMap.containsKey("item")) {
				StringBeanSet strBean = new StringBeanSet(buildOE_1_OtherInfo_Cont(len, i+1, MapUtils.getString(paramMap, "item")));
				osOtherInfos.add(strBean);
			}
		}
		otherInfoSet.setOsOtherInfos(osOtherInfos);
		return otherInfoSet;
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_其它说明_带序号
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private String buildOE_1_OtherInfo_Cont(int tolNbr, int orderSeq, String strParam){
		if(StringUtils.isEmpty(strParam)){
			return null;
		}
		
		if(tolNbr == SysConstant.INT_1){
			return strParam;
		} else {
			return orderSeq + SysConstant.STR_RL_BRE + SysConstant.STR_SPE + strParam;
		}
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_套餐优惠
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private OSPrompInfoSet buildOE_1_PrompInfo(int orderSeq, String strParam){
		if(StringUtils.isEmpty(strParam)){
			return null;
		}
		
		OSPrompInfoSet promInfoSet = new OSPrompInfoSet();
		
		List<StringBeanSet> prompInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, "套餐优惠"));
		prompInfoTitle.add(strBeanTitle);
		promInfoSet.setPrompInfoTitle(prompInfoTitle);
		
		List<StringBeanSet> osPrompInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCont = new StringBeanSet(strParam);
		osPrompInfos.add(strBeanCont);
		promInfoSet.setOsPrompInfos(osPrompInfos);
		
		return promInfoSet;
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_叠加包
	 * 新版，20140409
	 * @param orderSeq
	 * @param jsonArrayParam
	 * @return
	 */
	private OSAttachOfferSet buildOE_1_AttachOffer_New(int orderSeq, Map<String, Object> paramMap){
		if(MapUtils.isEmpty(paramMap)){
			return null;
		}
		
		OSAttachOfferSet attachOfferSet = new OSAttachOfferSet();
		
		// 设置叠加包-标题
		List<StringBeanSet> attachOfferTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, SysConstant.STR_SPE +  "叠加包"));
//		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, SysConstant.STR_SPE + SysConstant.STR_SPE +  "叠加包"));
		attachOfferTitle.add(strBeanTitle);
		attachOfferSet.setAttachOfferTitle(attachOfferTitle);
		
		int busiOrderSeq = SysConstant.INT_1;
		// 设置叠加包-附属
		List<Map<String, Object>> attachOneList = (List<Map<String, Object>>) paramMap.get("attachOneList");
		List<Map<String, Object>> attachTwoList = (List<Map<String, Object>>) paramMap.get("attachTwoList");
		List<Map<String, Object>> attachThreeList = (List<Map<String, Object>>) paramMap.get("attachThreeList");
		List<OSNormOfferSet> normOfferList = new ArrayList<OSNormOfferSet>();
		for (int i = 0; attachOneList != null && i < attachOneList.size(); i++) {
//			2.天翼4G手机短信包（订购次月生效，当月执行过渡期资费）
//			1）订购号码：18912345090 ；
//			2）功能费3元/月，包含国内点对点短信100条；超出资费：国内点对点短信0.1元/条。
//			3）过渡期资费：入网当月套餐月基本费按日计扣（入网当日到月底），费用四舍五入到分；套餐内容（短信）按天折算，向上取整。

			Map<String, Object> offerMap = attachOneList.get(i);
			String itemName = MapUtils.getString(offerMap, "itemName", "");
			String effectRule = MapUtils.getString(offerMap, "effectRule", "");
			String itemParam = MapUtils.getString(offerMap, "itemParam", "");
			String relaAcceNbr = MapUtils.getString(offerMap, "relaAcceNbr", "");
			
			OSNormOfferSet normOfferSet = new OSNormOfferSet();
			List<StringBeanSet> normOfferTitles = new ArrayList<StringBeanSet>();
			List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();
			
			StringBeanSet titleBean = new StringBeanSet();
			String title = busiOrderSeq + "." + itemName + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE;
			titleBean.setStrBean(title);
			normOfferTitles.add(titleBean);
			normOfferSet.setNormOfferTitle(normOfferTitles);
			
			StringBeanSet commentBean = new StringBeanSet();
			String comment = "";
			comment += "1）订购号码：" + relaAcceNbr + " ；";
			List<Map<String, Object>> attachOfferInfos = (List<Map<String, Object>>) offerMap.get("attachOfferInfos");
			if (attachOfferInfos != null && attachOfferInfos.size() > 0) {
				String headStr = "";
				String bodyStr = "";
				String tailStr = "";
				for (int j = 0; j < attachOfferInfos.size(); j++) {
					Map<String, Object> attachOfferInfoMap = attachOfferInfos.get(j);
					String tmpItemName = MapUtils.getString(attachOfferInfoMap, "itemName", "");
					String tmpItemParam = MapUtils.getString(attachOfferInfoMap, "itemParam", "");
					String tmpItemUnit = MapUtils.getString(attachOfferInfoMap, "itemUnit", "");
					String tmpItemMark = MapUtils.getString(attachOfferInfoMap, "itemMark", "");
					if ("功能费".equals(tmpItemName)) {
						headStr = "功能费" + tmpItemParam + tmpItemUnit + "，包含";
					} else {
						bodyStr += tmpItemName + tmpItemParam + tmpItemUnit + "，";
					}
				}
				if (bodyStr.length() > 0) {
					bodyStr = bodyStr.substring(0, bodyStr.length() - 1) + "；";
				}
				List<Map<String, Object>> outAttachOfferInfos = (List<Map<String, Object>>) offerMap.get("outAttachOfferInfos");
				if (outAttachOfferInfos != null && outAttachOfferInfos.size() > 0) {
					tailStr = "超出资费：";
					for (int k = 0; k < outAttachOfferInfos.size(); k++) {
						Map<String, Object> outMap = outAttachOfferInfos.get(k);
						String tmpItemName = MapUtils.getString(outMap, "itemName", "");
						String tmpItemParam = MapUtils.getString(outMap, "itemParam", "");
						String tmpItemUnit = MapUtils.getString(outMap, "itemUnit", "");
						String tmpItemMark = MapUtils.getString(outMap, "itemMark", "");
						tailStr += tmpItemName + tmpItemParam + tmpItemUnit + "，";
					}
					tailStr = tailStr.substring(0, tailStr.length() - 1) + "；";
					bodyStr += tailStr;
				}
				comment += "\n2）" + headStr + bodyStr;
			}
			List<Map<String, Object>> otherAttachOfferInfos = (List<Map<String, Object>>) offerMap.get("otherAttachOfferInfos");
			if (otherAttachOfferInfos != null && otherAttachOfferInfos.size() > 0) {
				String otherStr = "\n3）其他说明：";
				for (int m = 0; m < otherAttachOfferInfos.size(); m++) {
					Map<String, Object> otherMap = otherAttachOfferInfos.get(m);
					String item = MapUtils.getString(otherMap, "item", "");
					otherStr += item + "；";
				}
				comment += otherStr;
			}
			commentBean.setStrBean(comment);
			normOfferComments.add(commentBean);
			normOfferSet.setNormOfferComments(normOfferComments);
			
			normOfferList.add(normOfferSet);
			busiOrderSeq++;
		}
		
		for (int i = 0; attachTwoList != null && i < attachTwoList.size(); i++) {
//			1.加装手机（生效规则同主套餐一致）
//			用户号码：18912340003 （副卡标识） ；功能费10元/月，可共享主套餐语音和流量。
//			赠送：来电显示和189免费邮箱。
//			2.加装无线上网卡（生效规则同主套餐一致）
//			用户号码：189xxxxxxxx （副卡标识）； 功能费5元/月，可共享主套餐的流量。
			Map<String, Object> acceNbrMap = attachTwoList.get(i);
			String acceNbr = MapUtils.getString(acceNbrMap, "acceNbr", "");
			String memberRoleCd = MapUtils.getString(acceNbrMap, "memberRoleCd", "");
			
			OSNormOfferSet normOfferSet = new OSNormOfferSet();
			List<StringBeanSet> normOfferTitles = new ArrayList<StringBeanSet>();
			List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();
			
			StringBeanSet titleBean = new StringBeanSet();
			String title = "";
			if ("401".equals(memberRoleCd)) {
				title = busiOrderSeq + ".加装手机（生效规则同主套餐一致）";
			} else if ("501".equals(memberRoleCd)) {
				title = busiOrderSeq + ".加装无线上网卡（生效规则同主套餐一致）";
			}
			titleBean.setStrBean(title);
			normOfferTitles.add(titleBean);
			normOfferSet.setNormOfferTitle(normOfferTitles);
			
			StringBeanSet commentBean = new StringBeanSet();
			String comment = "用户号码：" + acceNbr + " （副卡标识） ；";
			Map<String, Object> itemParamMap = MapUtils.getMap(acceNbrMap, "itemParam");
			if (MapUtils.isNotEmpty(itemParamMap)) {
				String tmpItemName = MapUtils.getString(itemParamMap, "itemName", "");
				String tmpItemValue = MapUtils.getString(itemParamMap, "itemValue", "");
				String tmpItemUnit = MapUtils.getString(itemParamMap, "itemUnit", "");
				comment += tmpItemName + tmpItemValue + tmpItemUnit;
				if ("401".equals(memberRoleCd)) {
					comment += "，可共享主套餐语音和流量。";
				} else if ("501".equals(memberRoleCd)) {
					comment += "，可共享主套餐的流量。";
				}
			}
			List<Map<String, Object>> donateItems = (List<Map<String, Object>>) acceNbrMap.get("donateItems");
			if (donateItems != null && donateItems.size() > 0) {
				String donateStr = "";
				for (int j = 0; j < donateItems.size(); j++) {
					Map<String, Object> donateItem = donateItems.get(j);
					String tmpItemName = MapUtils.getString(donateItem, "itemName", "");
					donateStr += tmpItemName + "和";
				}
				if (donateStr.length() > 0) {
					donateStr = donateStr.substring(0, donateStr.length() - 1);
				}
				comment += "\n赠送：" + donateStr + "。";
			}
			commentBean.setStrBean(comment);
			normOfferComments.add(commentBean);
			normOfferSet.setNormOfferComments(normOfferComments);
			
			normOfferList.add(normOfferSet);
			busiOrderSeq++;
		}
		
		if (attachThreeList != null) {
			OSNormOfferSet normOfferSet = new OSNormOfferSet();
			List<StringBeanSet> normOfferTitles = new ArrayList<StringBeanSet>();
			List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();
			
			StringBeanSet titleBean = new StringBeanSet();
			String title = busiOrderSeq + ".产品功能 ";
			titleBean.setStrBean(title);
			normOfferTitles.add(titleBean);
			normOfferSet.setNormOfferTitle(normOfferTitles);
			StringBeanSet commentBean = new StringBeanSet();
			String comment = "";
			
			for (int i = 0; i < attachThreeList.size(); i++) {
//				5、产品功能 （当客户在订购某套餐的同时，另外开通了套餐未包含的产品功能，如来电显示，则在此列示）
//				1）[开通]xxxx功能(号码：xxxxxxxxxxx)；xx元/月 ； （xx小时内生效）；  
//				2）[开通]xxxx功能(号码：xxxxxxxxxxx)；（xx小时内生效）；（对于不收费的产品功能，不列示资费）如[开通]国际长途） 
				Map<String, Object> servMap = attachThreeList.get(i);
				
				String actionName = MapUtils.getString(servMap, "actionName", "");
				String itemName = MapUtils.getString(servMap, "itemName", "");
				String itemParam = MapUtils.getString(servMap, "itemParam", "");
				String effectRule = MapUtils.getString(servMap, "effectRule", "");
				String relaAcceNbr = MapUtils.getString(servMap, "relaAcceNbr", "");
				
				comment += (i + 1) + "）[" + actionName + "]" + itemName + "功能(号码：" + relaAcceNbr + ")；（" + effectRule + "）；\n";
			}
			if (StringUtils.isNotEmpty(comment)) {
				commentBean.setStrBean(comment);
				normOfferComments.add(commentBean);
				normOfferSet.setNormOfferComments(normOfferComments);
				
				normOfferList.add(normOfferSet);
				busiOrderSeq++;
			}
		}
		if(null != normOfferList && normOfferList.size() > 0){
			attachOfferSet.setNormOfferList(normOfferList);
		}
		
		
		// 设置叠加包-服务
//		List<Map<String, Object>> servInfos = null;
//		if(paramMap.containsKey("servInfos")){
//			servInfos = (List<Map<String, Object>>) paramMap.get("servInfos");
//		}
//		List<OSServOfferSet> servOfferList = (List<OSServOfferSet>) buildOE_1_AttachOffer_Serv(busiOrderSeq, servInfos);
//		if(null != servOfferList && servOfferList.size() > 0){
//			attachOfferSet.setServOfferList(servOfferList);
//		}
		
		return attachOfferSet;
	}
	
	private boolean filterProd(String objId) {
		if (filterList.contains(objId)) {
			return true;
		}
		return false;
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包
	 * @param orderSeq
	 * @param jsonArrayParam
	 * @return
	 */
	private OSAttachOfferSet buildOE_1_AttachOffer(int orderSeq, Map<String, Object> paramMap){
		if(MapUtils.isEmpty(paramMap)){
			return null;
		}
		
		OSAttachOfferSet attachOfferSet = new OSAttachOfferSet();
		
		// 设置叠加包-标题
		List<StringBeanSet> attachOfferTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, "叠加包"));
		attachOfferTitle.add(strBeanTitle);
		attachOfferSet.setAttachOfferTitle(attachOfferTitle);
		
		int busiOrderSeq = SysConstant.INT_1;
		// 设置叠加包-附属
		List<Map<String, Object>> offerInfos = null;
		if(paramMap.containsKey("offerInfos")){
			offerInfos = (List<Map<String, Object>>) paramMap.get("offerInfos");
		}
		Map<String, Object> rstMap = buildOE_1_AttachOffer_Norm(busiOrderSeq, offerInfos);
		List<OSNormOfferSet> normOfferList = (List<OSNormOfferSet>) rstMap.get("normOfferList");
		if(null != normOfferList && normOfferList.size() > 0){
			attachOfferSet.setNormOfferList(normOfferList);
			busiOrderSeq = (Integer) rstMap.get("busiOrderSeq");
		}
		
		// 设置叠加包-服务
		List<Map<String, Object>> servInfos = null;
		if(paramMap.containsKey("servInfos")){
			servInfos = (List<Map<String, Object>>) paramMap.get("servInfos");
		}
		List<OSServOfferSet> servOfferList = (List<OSServOfferSet>) buildOE_1_AttachOffer_Serv(busiOrderSeq, servInfos);
		if(null != servOfferList && servOfferList.size() > 0){
			attachOfferSet.setServOfferList(servOfferList);
		}
		
		return attachOfferSet;
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_附属销售品
	 * @param jsonArrayParam
	 * @return
	 */
	private Map<String, Object> buildOE_1_AttachOffer_Norm(int busiOrderSeq, List<Map<String, Object>> offerInfos){
		Map<String, Object> rstMap = new HashMap<String, Object>();
		if (offerInfos == null || offerInfos.size() == 0) {
			rstMap.put("busiOrderSeq", busiOrderSeq);
			return rstMap;
		}
		
		List<OSNormOfferSet> normOfferList = new ArrayList<OSNormOfferSet>();
		for (int i = 0; i < offerInfos.size(); i++){
			Map<String, Object> offerInfoMap = offerInfos.get(i);
			
			if (MapUtils.isNotEmpty(offerInfoMap)) {
				OSNormOfferSet normOfferSet = new OSNormOfferSet();
				List<StringBeanSet> normOfferTitle = new ArrayList<StringBeanSet>();
				
				String itemName = MapUtils.getString(offerInfoMap, "itemName", "");
				String itemParam = MapUtils.getString(offerInfoMap, "itemParam", "");
				String effectRule = MapUtils.getString(offerInfoMap, "effectRule", "");
				StringBeanSet strBeanTitle = new StringBeanSet(buildOE_1_AttachOffer_Norm_Title(busiOrderSeq, itemName, itemParam, effectRule));
				normOfferTitle.add(strBeanTitle);
				
				List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();
				String itemDesc = MapUtils.getString(offerInfoMap, "itemDesc", "");
				String relaAcceNbr = MapUtils.getString(offerInfoMap, "relaAcceNbr", "");
				if (relaAcceNbr.matches("\\d+")) {
					relaAcceNbr = null;
				}
				StringBeanSet strBeanCont = new StringBeanSet(buildOE_1_AttachOffer_Norm_Cont(itemDesc, relaAcceNbr));
				normOfferComments.add(strBeanCont);
				
				normOfferSet.setNormOfferTitle(normOfferTitle);
				normOfferSet.setNormOfferComments(normOfferComments);
				
				normOfferList.add(normOfferSet);
				busiOrderSeq ++;
			}
		}
		
		rstMap.put("busiOrderSeq", busiOrderSeq);
		rstMap.put("normOfferList", normOfferList);
		return rstMap;
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_附属销售品_标题行
	 * @param orderSeq
	 * @param itemName
	 * @param itemParam
	 * @param effectRule
	 * @return
	 */
	private String buildOE_1_AttachOffer_Norm_Title(int orderSeq, String itemName, String itemParam, String effectRule){
		return orderSeq + SysConstant.STR_PAU 
			+ (StringUtils.isEmpty(itemName) ? "" : itemName)
			+ (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE))
			+ (StringUtils.isEmpty(itemParam) ? "" : (SysConstant.STR_SEP + itemParam));
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_附属销售品_描述
	 * @param itemDesc
	 * @param relaAcceNbr
	 * @return
	 */
	private String buildOE_1_AttachOffer_Norm_Cont(String itemDesc, String relaAcceNbr){
		return (StringUtils.isEmpty(itemDesc) ? "" : itemDesc)
				+ ((!StringUtils.isEmpty(itemDesc) && !StringUtils.isEmpty(relaAcceNbr)) ? SysConstant.STR_COM : "")
				+ (StringUtils.isEmpty(relaAcceNbr) ? "" : ("订购号码" + SysConstant.STR_SEP + relaAcceNbr + SysConstant.STR_STO));
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_服务销售品
	 * @param jsonArrayParam
	 * @return
	 */
	private List<OSServOfferSet> buildOE_1_AttachOffer_Serv(int orderSeq, List<Map<String, Object>> servInfos){
		if(servInfos == null || servInfos.size() == 0){
			return null;
		}
		
		List<OSServOfferSet> servOfferList = new ArrayList<OSServOfferSet>();
		OSServOfferSet servOfferSet = new OSServOfferSet();
		
		// 设置标题
		List<StringBeanSet> servOfferTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, "产品功能"));
		servOfferTitle.add(strBeanTitle);
		servOfferSet.setServOfferTitle(servOfferTitle);
		
		// 设置内容
		List<StringBeanSet> servOfferInfos = new ArrayList<StringBeanSet>();
		int len = servInfos.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> servInfoMap = servInfos.get(i);
			
			if(MapUtils.isNotEmpty(servInfoMap)){
				StringBeanSet strBeanCont = new StringBeanSet();
				
				String actionType = MapUtils.getString(servInfoMap, "actionName", "");
				String itemName = MapUtils.getString(servInfoMap, "itemName", "");
				String itemParam = MapUtils.getString(servInfoMap, "itemParam", "");
				String itemDesc = MapUtils.getString(servInfoMap, "itemDesc", "");
				String effectRule = MapUtils.getString(servInfoMap, "effectRule", "");
				String relaAcceNbr = MapUtils.getString(servInfoMap, "relaAcceNbr", "");
				if (!relaAcceNbr.matches("\\d+")) {
					relaAcceNbr = "";
				}
				strBeanCont.setStrBean(buildOE_1_AttachOffer_Serv_Cont(len, i + 1, actionType, itemName, itemParam, itemDesc, effectRule, relaAcceNbr));
				servOfferInfos.add(strBeanCont);
			}
		}
		servOfferSet.setServOfferInfos(servOfferInfos);
		
		servOfferList.add(servOfferSet);
		return servOfferList;
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_服务销售品_内容(公用)
	 * @param orderSeq
	 * @param actionType
	 * @param itemName
	 * @param itemParam
	 * @param itemDesc
	 * @param effectRule
	 * @param relaAcceNbr
	 * @return
	 */
	private String buildOE_1_AttachOffer_Serv_Cont(int tolNbr, int orderSeq, String actionType, String itemName, String itemParam, String itemDesc, String effectRule, String relaAcceNbr){
		StringBuffer rstStr = new StringBuffer();
		if(tolNbr != SysConstant.INT_1){
			rstStr.append(orderSeq + SysConstant.STR_RL_BRE + SysConstant.STR_SPE);
		}
		rstStr.append(SysConstant.STR_LM_BRE + actionType + SysConstant.STR_RM_BRE);
		rstStr.append(itemName);
		rstStr.append(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + relaAcceNbr + SysConstant.STR_RL_BRE + SysConstant.STR_SPE);
		rstStr.append(SysConstant.STR_SPI);
		if (StringUtils.isNotBlank(itemParam)) {
			rstStr.append(itemParam + SysConstant.STR_SPI);
		}
		rstStr.append(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE + SysConstant.STR_SPE + SysConstant.STR_SPI);
		
		if(SysConstant.STR_SPI.equals(rstStr.toString())){
			return null;
		} else {
			return rstStr.toString();
		}
	}
	
	/**
	 * 组装－业务信息_主销售品_内容_订购当月资费_标题(公用)
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private String buildBusiInfoTitle(int orderSeq, String titleName) {
		if(StringUtils.isEmpty(titleName)){
			return null;
		}
		
		if(orderSeq == SysConstant.INT_0){
			return titleName + SysConstant.STR_SEP;
		} else {
			return orderSeq + SysConstant.STR_PAU + titleName + SysConstant.STR_SEP;
		}
	}
	
	private Map<String, Object> dealDonateItems(List<Map<String, Object>> paramList) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> donateItemList = new ArrayList<Map<String,Object>>();
		for (int i = 0; i < paramList.size(); i++) {
			Map<String, Object> paramMap = paramList.get(i);
			if (validDonateAttr(paramMap)) {
				donateItemList.add(paramMap);
			} else {
				normItemList.add(paramMap);
			}
		}
		if (normItemList.size() > 0) {
			retnMap.put("norm", normItemList);
		}
		if (donateItemList.size() > 0) {
			retnMap.put("donate", donateItemList);
		}
		return retnMap;
	}
	
	/**
	 * 赠送属性判断
	 * 
	 * @param jsonObj
	 * @return
	 */
	private boolean validDonateAttr(Map<String, Object> paramMap){
		String isDonate = MapUtils.getString(paramMap, "isDonate", "");
		if(SysConstant.STR_Y.equals(isDonate)){
			return true;
		}else {
			return false;
		}
	}
	
	/**
	 * 组装－客户信息_头部(公用)
	 * @param itemName
	 * @return
	 */
	private String buildInfoItemName(String itemName){
		return (StringUtils.isEmpty(itemName) ? "" : (itemName + SysConstant.STR_SEP));
	}
	
	/**
	 * 组装－业务信息_合约计划订购
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_2(Map<String, Object> event, int orderSeq, int oeSize){
		if(MapUtils.isEmpty(event)){
			return null;
		}
		
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if(orderSeq <= oeSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}
		
		List<OETermOfferSet> termOfferList = new ArrayList<OETermOfferSet>();
		OETermOfferSet termOfferSet = new OETermOfferSet();
		// 设置合约计划_标题
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
			String termOfferTitle = buildOrderEvent_2_Title(oeSize, orderSeq, titleMap);
			termOfferSet.setTermOfferTitle(termOfferTitle);
		}
		
		// 设置合约计划_内容
		if(event.containsKey("orderEventCont")){
			Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
			List<StringBeanSet> termOfferInfos = buildOrderEvent_2_Cont(contMap);
			if(null != termOfferInfos && termOfferInfos.size() > 0){
				termOfferSet.setTermOfferInfos(termOfferInfos);
			}
		}
		
		termOfferList.add(termOfferSet);
		orderEvent.setTermOfferList(termOfferList);
		return orderEvent;
	}
	/**
	 * 组装－业务信息_合约计划订购_标题
	 * @param orderSeq
	 * @param jsonObj
	 * @return
	 */
	private String buildOrderEvent_2_Title(int tolNbr, int orderSeq, Map<String, Object> titleMap) {
		if (MapUtils.isEmpty(titleMap)) {
			return null;
		}

		String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
		String offerSpecName = MapUtils.getString(titleMap, "offerSpecName", "");
		String effectRule = MapUtils.getString(titleMap, "effectRule", "");

		return (tolNbr == SysConstant.INT_1 ? "" : ChsStringUtil.getSeqNumByInt(orderSeq))
				+ SysConstant.STR_PAU
				+ (StringUtils.isEmpty(boActionTypeName) ? "" : (SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE))
				+ (StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName)
				+ (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE));
	}
	/**
	 * 组装－业务信息_合约计划订购_内容
	 * @param jsonObj
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_2_Cont(Map<String, Object> contMap){
		if (MapUtils.isEmpty(contMap)) {
			return null;
		}
		
		List<StringBeanSet> strBeanList = new ArrayList<StringBeanSet>();
		if (contMap.containsKey("agrPlanMods")) {
			List<Map<String, Object>> agrPlanMods = (List<Map<String, Object>>) contMap.get("agrPlanMods");
			if (agrPlanMods == null || agrPlanMods.size() == 0){
				return null;
			}
			
			for (int i = 0; i < agrPlanMods.size(); i++) {
				Map<String, Object> modMap = agrPlanMods.get(i);
				if(modMap == null || !modMap.containsKey("mod")){
					continue;
				}
				StringBeanSet strBean = new StringBeanSet();
				String strMod = MapUtils.getString(modMap, "mod", "");
				strBean.setStrBean(strMod);
				strBeanList.add(strBean);
			}
		}
		
		return strBeanList;
	}
	
	/**
	 * 组装－业务信息_附属销售品[订购、续订、变更、退订]，主销售品[退订、注销]
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_3(Map<String, Object> event, int orderSeq, int oeSize, boolean attachFlag){
		if(MapUtils.isEmpty(event)){
			return null;
		}
		
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if (orderSeq <= oeSize && orderSeq != SysConstant.INT_1) {
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}
		
		List<OEAttachOfferSet> attachOfferList = new ArrayList<OEAttachOfferSet>();
		OEAttachOfferSet attachOfferSet = new OEAttachOfferSet();
		// 设置附属销售品业务_标题
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = (Map<String, Object>) event.get("orderEventTitle");
			String boActionTypeCd = MapUtils.getString(titleMap, "boActionTypeCd", "");
			if ("7".equals(boActionTypeCd) && attachFlag) {
				return null;
			}
			List<StringBeanSet> attachOfferTitle = buildOrderEvent_3_Title(oeSize, orderSeq, titleMap);
			if(null != attachOfferTitle && attachOfferTitle.size() > 0){
				attachOfferSet.setAttachOfferTitle(attachOfferTitle);
			}
		}
		
		// 设置附属销售品业务_内容
		if(event.containsKey("orderEventCont")){
			List<StringBeanSet> attachOfferCont = 
					buildOrderEvent_3_Cont((List<Map<String, Object>>) event.get("orderEventCont"));
			if(null != attachOfferCont && attachOfferCont.size() > 0){
				attachOfferSet.setAttachOfferCont(attachOfferCont);
			}
		}
		
		attachOfferList.add(attachOfferSet);
		orderEvent.setAttachOfferList(attachOfferList);
		
		return orderEvent;
	}
	/**
	 * 组装－业务信息_附属销售品_标题(公用)
	 * @param tolNbr
	 * @param orderSeq
	 * @param jsonObj
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_3_Title(int tolNbr, int orderSeq, Map<String, Object> titleMap){
		if(MapUtils.isEmpty(titleMap)){
			return null;
		}
		
		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet();
		
		String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
		String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
		String prodSpecParam = MapUtils.getString(titleMap, "prodSpecParam", "");
		String effectRule = MapUtils.getString(titleMap, "effectRule", "");
		String relaAcceNbr = MapUtils.getString(titleMap, "relaAcceNbr", "");
		
		String tmpStr = (tolNbr == SysConstant.INT_1 ? "" : (ChsStringUtil.getSeqNumByInt(orderSeq) + SysConstant.STR_PAU))
			+ (StringUtils.isEmpty(boActionTypeName) ? "" : (SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE))
			+ (StringUtils.isEmpty(prodSpecName) ? "" : prodSpecName)
			+ (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE + SysConstant.STR_SPI))
			+ (StringUtils.isEmpty(prodSpecParam) ? "" : (SysConstant.STR_SPE + prodSpecParam + SysConstant.STR_SPI))
			+ (StringUtils.isEmpty(relaAcceNbr) ? "" : (SysConstant.STR_SPE + "用户号码" + SysConstant.STR_SEP + relaAcceNbr));
		
		strBean.setStrBean(tmpStr);
		attachOfferList.add(strBean);
		
		return attachOfferList;
	}
	/**
	 * 组装－业务信息_附属销售品_内容
	 * @param jsonArrayParam
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_3_Cont(List<Map<String, Object>> contList){
		if (contList == null || contList.size() == 0) {
			return null;
		}
		
		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		int len = contList.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> contMap = contList.get(i);
			StringBeanSet strBean = new StringBeanSet();
			
			String actionType = MapUtils.getString(contMap, "actionName", "");
			String itemName = MapUtils.getString(contMap, "itemName", "");
			String itemParam = MapUtils.getString(contMap, "itemParam", "");
			String itemDesc = MapUtils.getString(contMap, "itemDesc", "");
			String effectRule = MapUtils.getString(contMap, "effectRule", "");
			String relaAcceNbr = MapUtils.getString(contMap, "relaAcceNbr", "");
			
			strBean.setStrBean(buildOE_1_AttachOffer_Serv_Cont(len, i + 1, actionType, itemName, itemParam, itemDesc, effectRule, relaAcceNbr));
			
			attachOfferList.add(strBean);
		}
		
		return attachOfferList;
	}
	
	/**
	 * 组装－业务信息_
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_4(Map<String, Object> event, int orderSeq, int oeSize){
		OrderEventSet orderEvent = new OrderEventSet();
		
		return orderEvent;
	}
	/**
	 * 组装－业务信息_产品变更
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_5(Map<String, Object> event, int orderSeq, int oeSize, int speCustInfoLen, boolean attachFlag){
		if(null == event){
			return null;
		}
		
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if(orderSeq <= oeSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}
		
		List<OEProdChangeSet> prodChangeList = new ArrayList<OEProdChangeSet>();
		OEProdChangeSet prodChangeSet = new OEProdChangeSet();
		// 设置产品变更_标题
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
			//如果是客户新建和账户新建，则跳过，返回null，使得orderEventSeq不变
			String boActionTypeCd = MapUtils.getString(titleMap, "boActionTypeCd", "");
			if ("C1".equals(boActionTypeCd) || "A1".equals(boActionTypeCd)) {
				return null;
			}
			if ("1".equals(boActionTypeCd) && attachFlag) {
				return null;
			}
			List<StringBeanSet> prodChangeTitle = buildOrderEvent_3_Title(oeSize, orderSeq, titleMap);
			prodChangeSet.setProdChangeTitle(prodChangeTitle);
		}
		
		// 设置产品变更_内容
		if(event.containsKey("orderEventCont")){
			List<Map<String, Object>> contList = (List<Map<String, Object>>) event.get("orderEventCont");
			Map<String, Object> itemsMap = dealOneLineItems(contList);
			if(MapUtils.isNotEmpty(itemsMap)){
				List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
				List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
				
				// 变更类的业务，需要对于半行展示内容进行长度超出预处理
				Map<String, Object> itemsNewMap = dealStrLenItems(normList, speCustInfoLen);
				List<Map<String, Object>> normNewList = (List<Map<String, Object>>) itemsNewMap.get("norm");
				List<Map<String, Object>> lineNewList = (List<Map<String, Object>>) itemsNewMap.get("line");
				
				if (lineNewList != null && lineNewList.size() > 0) {
					if (lineList == null) {
						lineList = new ArrayList<Map<String,Object>>();
					}
					lineList.addAll(lineNewList);
				}
				
				normList = normNewList;
				if(normList != null && normList.size() > 0){
					List<StringTwoSet> prodChangeInfos = new ArrayList<StringTwoSet>();
					
					for (int i=0; i < normList.size(); i++) {
						Map<String, Object> normMap = normList.get(i);
						
						StringTwoSet itemTwo = new StringTwoSet();
						String itemName0 = MapUtils.getString(normMap, "itemName0", "");
						String itemValue0 = MapUtils.getString(normMap, "itemValue0", "");
						String itemName1 = MapUtils.getString(normMap, "itemName1", "");
						String itemValue1 = MapUtils.getString(normMap, "itemValue1", "");
						if(StringUtils.isNotEmpty(itemName0)){
							itemTwo.setStrBean0(itemName0 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue0);
						}
						if(StringUtils.isEmpty(itemName0) && StringUtils.isEmpty(itemValue0)){
							itemTwo.setStrBean0(itemName0 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue0);
						}
						if(StringUtils.isNotEmpty(itemName1)){
							itemTwo.setStrBean1(itemName1 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue1);
						}
						
						prodChangeInfos.add(itemTwo);
					}
					
					if(prodChangeInfos.size() > 0){
						prodChangeSet.setProdChangeInfos(prodChangeInfos);
					}
				}
				
				if (lineList != null && lineList.size() > 0) {
					List<StringBeanSet> lineProdChangeInfos = new ArrayList<StringBeanSet>();

					for (int i = 0; i < lineList.size(); i++) {
						Map<String, Object> lineMap = lineList.get(i);
						StringBeanSet item = new StringBeanSet();

						String itemName0 = MapUtils.getString(lineMap, "itemName0", "");
						String itemValue0 = MapUtils.getString(lineMap, "itemValue0", "");
						String itemName1 = MapUtils.getString(lineMap, "itemName1", "");
						String itemValue1 = MapUtils.getString(lineMap, "itemValue1", "");
						if(StringUtils.isEmpty(itemName0) && StringUtils.isEmpty(itemValue0)){
							
						}else{
							item.setStrBean(itemName0 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue0);
							lineProdChangeInfos.add(item);
						}
						item = new StringBeanSet();
						if(StringUtils.isEmpty(itemName1) && StringUtils.isEmpty(itemValue1)){
							
						}else{
							item.setStrBean(itemName1 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue1);
							lineProdChangeInfos.add(item);
						}
					}
					if (lineProdChangeInfos.size() > 0) {
						prodChangeSet.setLineProdChangeInfos(lineProdChangeInfos);
					}
				}
			}
		}
		
		prodChangeList.add(prodChangeSet);
		orderEvent.setProdChangeList(prodChangeList);
		return orderEvent;
	}
	/**
	 * 组装－业务信息_
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_6(Map<String, Object> event, int orderSeq, int oeSize){
		OrderEventSet orderEvent = new OrderEventSet();
		
		return orderEvent;
	}
	
	/**
	 * 属性半行展示长度超出预处理
	 * @param jsonArrayData
	 * @return
	 */
	private Map<String, Object> dealStrLenItems(List<Map<String, Object>> paramList, int speCustInfoLen){
		Map<String, Object> retnMap = new HashMap<String, Object>();
		
		// 属性信息分类暂存
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> lineItemList = new ArrayList<Map<String,Object>>();
		
		for (int i = 0; i < paramList.size(); i++) {
			Map<String, Object> itemInfoMap = paramList.get(i);
			if(validStrLenItem(itemInfoMap, speCustInfoLen)){
				lineItemList.add(itemInfoMap);
			} else {
				normItemList.add(itemInfoMap);
			}
		}
		
		if(normItemList.size() > 0){
			retnMap.put("norm", normItemList);
		}
		if(lineItemList.size() > 0){
			retnMap.put("line", lineItemList);
		}
		
		if(retnMap.size() > 0){
			return retnMap;
		} else {
			return null;
		}
	}
	
	/**
	 * 属性半行展示长度超出判断，字符串的长度通过存储过程中的const_cust_info_spe_len进行设置
	 * 
	 * @param jsonObj
	 * @return
	 */
	private boolean validStrLenItem(Map<String, Object> itemInfoMap, int speCustInfoLen){
		if(MapUtils.isEmpty(itemInfoMap)){
			return false;
		}
		String itemInfo1 = "";
		String itemInfo2 = "";
		if(itemInfoMap.containsKey("itemName0") && itemInfoMap.containsKey("itemValue0")){
			itemInfo1 = MapUtils.getString(itemInfoMap, "itemName0", "") 
					+ MapUtils.getString(itemInfoMap, "itemValue0", "");
			if(itemInfo1.length() > speCustInfoLen){
				return true;
			}
		}
		if(itemInfoMap.containsKey("itemName1") && itemInfoMap.containsKey("itemValue1")){
			itemInfo2 = MapUtils.getString(itemInfoMap, "itemName1", "") 
					+ MapUtils.getString(itemInfoMap, "itemValue1", "");
			if(itemInfo2.length() > speCustInfoLen){
				return true;
			}
		}
		return false;
	}
	
	private List<FeeInfoSet> parseFeeInfos(Map<String, Object> dataMap) {
		List<FeeInfoSet> feeInfos = new ArrayList<FeeInfoSet>();
		if (!dataMap.containsKey("feeInfos")) {
			return feeInfos;
		}
		Map<String, Object> feeInfoMap = MapUtils.getMap(dataMap, "feeInfos");
		List<Map<String, Object>> orderFeeInfos = null;
		List<Map<String, Object>> acctFeeInfos = null;
		int orderSeqInt = 0;
		int totalNbr = 0;
		if (MapUtils.isEmpty(feeInfoMap)) {
			return feeInfos;
		} else {
			if (feeInfoMap.containsKey("orderFeeInfos")) {
				orderFeeInfos = (List<Map<String, Object>>) feeInfoMap.get("orderFeeInfos");
				totalNbr += orderFeeInfos.size();
			}
			if (feeInfoMap.containsKey("acctFeeInfos")) {
				acctFeeInfos = (List<Map<String, Object>>) feeInfoMap.get("acctFeeInfos");
				totalNbr += acctFeeInfos.size();
			}
		}
		// 订单费用
		if (orderFeeInfos != null) {
			Map<String, Object> tmpMap = buildFeeInfoSet(orderFeeInfos, SysConstant.FEE_TYPE_ORDER, totalNbr, orderSeqInt);
			List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
			orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
			if (feeInfoList != null && feeInfoList.size() > 0) {
				feeInfos.addAll(feeInfoList);
			}
		}
		
		// 帐户费用
		if (acctFeeInfos != null) {
			Map<String, Object> sortMap = mergeAcctFeeInfos(acctFeeInfos);
			int feeTypeNbr = MapUtils.getIntValue(sortMap, "feeTypeNbr", 0);
			//处理chargeItems
			//如果dataMap中存在chargeItems，则使用它，它由前台js传入
			if (dataMap.containsKey("chargeItems") && dataMap.get("chargeItems") instanceof List) {
				List<Map<String, Object>> chargeItems = (List<Map<String, Object>>) dataMap.get("chargeItems");
				Map<String, Object> tmpMap = buildFeeInfoSetFromChargeItems(chargeItems, SysConstant.FEE_TYPE_CHARGEITEMS, totalNbr, orderSeqInt, 1);
				List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
				orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
				if (feeInfoList != null && feeInfoList.size() > 0) {
					feeInfos.addAll(feeInfoList);
				}
			} else if (sortMap.containsKey("chargeItems")) {
				List<Map<String, Object>> chargeItems = (List<Map<String, Object>>) sortMap.get("chargeItems");
				Map<String, Object> tmpMap = buildFeeInfoSetFromChargeItems(chargeItems, SysConstant.FEE_TYPE_CHARGEITEMS, totalNbr, orderSeqInt, 2);
				List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
				orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
				if (feeInfoList != null && feeInfoList.size() > 0) {
					feeInfos.addAll(feeInfoList);
				}
			}
			for (int i = 0; i < feeTypeNbr; i++) {
				List<Map<String, Object>> acctFeeList = 
						(List<Map<String, Object>>) sortMap.get("acctFeeAry" + i);
				acctFeeList = mergeAcctFeeInfosByPayMethodId(acctFeeList);
				Map<String, Object> tmpMap = buildFeeInfoSet(acctFeeList, SysConstant.FEE_TYPE_ACCT, totalNbr, orderSeqInt);
				List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
				orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
				if (feeInfoList != null && feeInfoList.size() > 0) {
					feeInfos.addAll(feeInfoList);
				}
			}
			
		}
		// 计算feeType，通过遍历orderEvent，取orderEventType为5的relaAcceNbr和feeTypeValue
		List<Map<String, Object>> orderEventList = (List<Map<String, Object>>) dataMap.get("orderEvent");
		if (orderEventList != null && orderEventList.size() > 0) {
			List<Map<String, Object>> feeTypeList = new ArrayList<Map<String,Object>>();
			for (int i = 0; i < orderEventList.size(); i++) {
				Map<String, Object> orderEventMap = orderEventList.get(i);
				String orderEventType = MapUtils.getString(orderEventMap, "orderEventType", "");
				//取orderEventType为5，产品资料的类型
				if ("5".equals(orderEventType)) {
					List<Map<String, Object>> orderEventContList = (List<Map<String, Object>>) orderEventMap.get("orderEventCont");
					String feeTypeValue = "";
					for (int j = 0; orderEventContList != null && j < orderEventContList.size(); j++) {
						Map<String, Object> orderEventCont = orderEventContList.get(j);
						feeTypeValue = MapUtils.getString(orderEventCont, "feeTypeValue", "");
						if (StringUtils.isNotEmpty(feeTypeValue)) {
							break;
						}
					}
					if (StringUtils.isNotEmpty(feeTypeValue)) {
						Map<String, Object> feeTypeMap = new HashMap<String, Object>();
						feeTypeMap.put("feeTypeValue", feeTypeValue);
						Map<String, Object> orderEventTitleMap = MapUtils.getMap(orderEventMap, "orderEventTitle");
						feeTypeMap.put("relaAcceNbr", MapUtils.getString(orderEventTitleMap, "relaAcceNbr", ""));
						feeTypeList.add(feeTypeMap);
					}
				}
			}
			if (feeTypeList.size() > 0) {
				Map<String, Object> feeTypeMap = feeTypeList.get(0);
				String feeTypeValue = MapUtils.getString(feeTypeMap, "feeTypeValue");
				boolean mutilFeeTypeFlag = false;
				for (int i = 1; i < feeTypeList.size(); i++) {
					feeTypeMap = feeTypeList.get(i);
					String tmpFeeTypeValue = MapUtils.getString(feeTypeMap, "feeTypeValue");
					if (!feeTypeValue.equals(tmpFeeTypeValue)) {
						mutilFeeTypeFlag = true;
						break;
					}
				}
				if (mutilFeeTypeFlag) {
					List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();
					FeeInfoSet feeInfoSet = new FeeInfoSet();
					List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
					FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
					String feeInfoTitle = (++orderSeqInt) + "付费模式：";
					feeInfoTitleSet.setFeeInfoTitle(feeInfoTitle);
					String feeInfoCont = "";
					for (int i = 1; i < feeTypeList.size(); i++) {
						feeTypeMap = feeTypeList.get(i);
						String tmpFeeTypeValue = MapUtils.getString(feeTypeMap, "feeTypeValue");
						String relaAcceNbr = MapUtils.getString(feeTypeMap, "relaAcceNbr");
						feeInfoCont += " " + tmpFeeTypeValue + "-" + relaAcceNbr + ";";
					}
					feeInfoTitleSet.setFeeInfoCont(feeInfoCont);
					feeInfoTitles.add(feeInfoTitleSet);
					feeInfoSet.setFeeInfoTitles(feeInfoTitles);
					feeInfoList.add(feeInfoSet);
					feeInfos.addAll(feeInfoList);
				} else {
					List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();
					FeeInfoSet feeInfoSet = new FeeInfoSet();
					List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
					FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
					String feeInfoTitle = (++orderSeqInt) + "、付费模式：";
					feeInfoTitleSet.setFeeInfoTitle(feeInfoTitle);
					String feeInfoCont = feeTypeValue + "。";
					feeInfoTitleSet.setFeeInfoCont(feeInfoCont);
					feeInfoTitles.add(feeInfoTitleSet);
					feeInfoSet.setFeeInfoTitles(feeInfoTitles);
					feeInfoList.add(feeInfoSet);
					feeInfos.addAll(feeInfoList);
				}
			}
		}
		return feeInfos;
	}
	
	/**
	 * 组装－费用信息
	 * @param feeInfoAry
	 * @return
	 */
	private Map<String, Object> buildFeeInfoSet(List<Map<String, Object>> feeInfos, int feeInfoType, int totalNbr, int orderSeqInt) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();
		
		// 解决付费人、合同号相同只保留一份问题
		List<String> relaAcctInfoBack = new ArrayList<String>();
		
		if (feeInfos == null || feeInfos.size() == 0) {
			retnMap.put("feeInfoList", feeInfoList);
			retnMap.put("orderSeqInt", orderSeqInt);
			return retnMap; 
		}
		
		//关联号码：（若用户的多个产品采用了不同付费方式，在付费方式中列示关联用户号码）
		Map<String, Object> feeInfoMap = feeInfos.get(0);
		String payMethodId = MapUtils.getString(feeInfoMap, "payMethodId", "");
		boolean relaAcceFlag = false;
		for (int i = 1; i < feeInfos.size(); i++) {
			feeInfoMap = feeInfos.get(i);
			String tmpPayMethodId = MapUtils.getString(feeInfoMap, "payMethodId", "");
			if (!payMethodId.equals(tmpPayMethodId)) {
				relaAcceFlag = true;
				break;
			}
		}
		
		for (int i = 0; i < feeInfos.size(); i++) {
			feeInfoMap = feeInfos.get(i);
			
			FeeInfoSet feeInfoSet = new FeeInfoSet();
			List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
			List<FeeInfoAPNSet> acctPayNumbers = new ArrayList<FeeInfoAPNSet>();
			List<FeeInfoBankSet> feeInfoBanks = new ArrayList<FeeInfoBankSet>();
			List<FeeInfoRANSet> relaAcceNbrs = new ArrayList<FeeInfoRANSet>();
			List<StringBeanSet> relaAcctInfos = new ArrayList<StringBeanSet>();
			// 设置元素顺序
			String orderSeq = "";
			if (totalNbr != SysConstant.INT_1) {
				orderSeq = (++orderSeqInt) + "";
			}
			// 费用信息头
			String appChargeFee = "";
			String realChargeFee = "";
			String payMethodName = "";
			if (feeInfoMap.containsKey("appChargeFee")) {
				appChargeFee = MapUtils.getString(feeInfoMap, "appChargeFee", "");
				if(StringUtils.isNotEmpty(appChargeFee)){
					appChargeFee = Double.valueOf(appChargeFee) / SysConstant.INT_100 + "";
				}
			}
			if(feeInfoMap.containsKey("realChargeFee")){
				realChargeFee = MapUtils.getString(feeInfoMap, "realChargeFee", "");
				if(StringUtils.isNotEmpty(realChargeFee)){
					realChargeFee = Double.valueOf(realChargeFee) / SysConstant.INT_100 + "";
				}
			}
			if(feeInfoMap.containsKey("payMethodName")){
				payMethodName = MapUtils.getString(feeInfoMap, "payMethodName", "");
			}
			
			FeeInfoTitleSet feeInfoTitle = buildFeeInfoTitle(orderSeq, feeInfoType, appChargeFee, realChargeFee, payMethodName);
			feeInfoTitles.add(feeInfoTitle);
			
			// 挂账号码信息
			String acctPayNumber = "";
			String firstPayMethodId = MapUtils.getString(feeInfoMap, "payMethodId", "");
			//挂帐号码：（转帐务托收时列示）
			if(feeInfoMap.containsKey("acctPayNumber") && "140000".equals(firstPayMethodId)){
				acctPayNumber = MapUtils.getString(feeInfoMap, "acctPayNumber", "");
			}
			FeeInfoAPNSet feeInfoAPN = buildFeeInfoAPN(acctPayNumber);
			if (feeInfoAPN != null) {
				acctPayNumbers.add(feeInfoAPN);
			}
			// 托收银行信息
			Map<String, Object> bankCollInfo = null;
			if(feeInfoMap.containsKey("bankCollInfo")){
				bankCollInfo = MapUtils.getMap(feeInfoMap, "bankCollInfo");
			}
			FeeInfoBankSet feeInfoBank = buildFeeInfoBank(bankCollInfo);
			if (feeInfoBank != null) {
				feeInfoBanks.add(feeInfoBank);
			}
			// 关联号码信息
			//关联号码：（若用户的多个产品采用了不同付费方式，在付费方式中列示关联用户号码）
			if(relaAcceFlag && feeInfoMap.containsKey("relaAcceNbr")){
				String relaAcceNbrTmp = MapUtils.getString(feeInfoMap, "relaAcceNbr", "");
				
//				if(relaAcceNbrTmp.contains(SysConstant.STR_PAU)){
					FeeInfoRANSet feeInfoRAN = buildFeeInfoRAN(relaAcceNbrTmp);
					if (feeInfoRAN != null) {
						relaAcceNbrs.add(feeInfoRAN);
					}
//				}
			}
			// 北京需求-增加 付费人、合同号 内容
			if(feeInfoMap.containsKey("relaAcctInfo")){
				String relaAcctInfo = MapUtils.getString(feeInfoMap, "relaAcctInfo", "");
				
				boolean existFlag = false;
				if(relaAcctInfoBack.size() > 0){
					for(String backInfo : relaAcctInfoBack){
						if(relaAcctInfo.equals(backInfo)){
							existFlag = true;
							break;
						}
					}
				}
				
				if(!existFlag){
					relaAcctInfoBack.add(relaAcctInfo);
					
					StringBeanSet strBean = new StringBeanSet(relaAcctInfo);
					relaAcctInfos.add(strBean);
				}
			}
			
			if(feeInfoTitles.size() > 0){
				feeInfoSet.setFeeInfoTitles(feeInfoTitles);
			}
			if(acctPayNumbers.size() > 0){
				feeInfoSet.setAcctPayNumbers(acctPayNumbers);
			}
			if(feeInfoBanks.size() > 0){
				feeInfoSet.setFeeInfoBanks(feeInfoBanks);
			}
			if(relaAcceNbrs.size() > 0){
				feeInfoSet.setRelaAcceNbrs(relaAcceNbrs);
			}
			if(relaAcctInfos.size() > 0){
				feeInfoSet.setRelaAcctInfos(relaAcctInfos);
			}
			
			feeInfoList.add(feeInfoSet);
		}
		
		retnMap.put("feeInfoList", feeInfoList);
		retnMap.put("orderSeqInt", orderSeqInt);
		return retnMap;
	}
	
	/**
	 * 组装－费用信息-费用项
	 * @param feeInfoAry
	 * @return
	 */
	private Map<String, Object> buildFeeInfoSetFromChargeItems(List<Map<String, Object>> feeInfos, int feeInfoType, int totalNbr, int orderSeqInt, int fromFlag) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();
		FeeInfoSet feeInfoSet = new FeeInfoSet();
		List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
		int amount = 0;
		int realAmount = 0;
		String payMethodName = "";
		// 需要对chargeItems做处理
		for (int i = 0; i < feeInfos.size(); i++) {
			Map<String, Object> feeInfoMap = feeInfos.get(i);
			if (fromFlag == 1) {
				amount += MapUtils.getIntValue(feeInfoMap, "feeAmount", 0);
			} else if (fromFlag == 2) {
				amount += MapUtils.getIntValue(feeInfoMap, "amount", 0);
			}
			realAmount += MapUtils.getIntValue(feeInfoMap, "realAmount", 0);
			payMethodName = MapUtils.getString(feeInfoMap, "payMethodName", "");
		}
		FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
		String feeInfoTitle = (++orderSeqInt) + "、本次订单费用： ";
		feeInfoTitleSet.setFeeInfoTitle(feeInfoTitle);
		String feeInfoCont = "应收"+ amount/100 +"元，实收"+ realAmount/100 +"元";
		if (StringUtils.isNotEmpty(payMethodName)) {			
			feeInfoCont += " （"+payMethodName+"）";
		}
		feeInfoCont += "。";
		feeInfoTitleSet.setFeeInfoCont(feeInfoCont);
		feeInfoTitles.add(feeInfoTitleSet);
		feeInfoSet.setFeeInfoTitles(feeInfoTitles);
		feeInfoList.add(feeInfoSet);
		
		retnMap.put("feeInfoList", feeInfoList);
		retnMap.put("orderSeqInt", orderSeqInt);
		return retnMap;
	}
	
	/**
	 * 组装－费用信息头
	 * @param seq
	 * @param feeType
	 * @param appChargeFee
	 * @param realChargeFee
	 * @param payMethodName
	 * @return
	 */
	private FeeInfoTitleSet buildFeeInfoTitle(String seq, int feeType, String appChargeFee, String realChargeFee, String payMethodName){
		FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
		String feeInfoTitle = "";
		String feeInfoCont = "";
		String tmpStr = "";
		if (SysConstant.FEE_TYPE_ORDER == feeType) {
			feeInfoTitle = (StringUtils.isEmpty(seq) ? "" : (seq + SysConstant.STR_PAU)) + "本次订单费用" + SysConstant.STR_SEP;
			
			tmpStr += (StringUtils.isEmpty(payMethodName) ? "" : (SysConstant.STR_LL_BRE + payMethodName + SysConstant.STR_RL_BRE))
				+ SysConstant.STR_STO;
		} else if (SysConstant.FEE_TYPE_ACCT == feeType) {
			if (StringUtils.isNotEmpty(payMethodName)) {
				feeInfoTitle = (StringUtils.isEmpty(seq) ? "" : (seq + SysConstant.STR_PAU)) + "月使用费付费方式" + SysConstant.STR_SEP;				
			}
			
			tmpStr += (StringUtils.isEmpty(payMethodName) ? "" : payMethodName);
			if (StringUtils.isNotEmpty(tmpStr)) {
				tmpStr += SysConstant.STR_STO;
			}
		}
		
		feeInfoCont = (StringUtils.isEmpty(appChargeFee) ? "" : ("应收 " + appChargeFee + " 元" + SysConstant.STR_COM )) 
			+ (StringUtils.isEmpty(realChargeFee) ? "" : ("实收 " + appChargeFee + " 元 "))
			+ tmpStr;
		
		feeInfoTitleSet.setFeeInfoTitle(StringUtils.isEmpty(feeInfoTitle)? null : feeInfoTitle);
		feeInfoTitleSet.setFeeInfoCont(StringUtils.isEmpty(feeInfoCont) ? null : feeInfoCont);
		
		return feeInfoTitleSet;
	}
	/**
	 * 组装－挂账号码信息
	 * @param acctPayNumber
	 * @return
	 */
	private FeeInfoAPNSet buildFeeInfoAPN(String acctPayNumber){
		FeeInfoAPNSet feeInfoAPN = null;
		if(StringUtils.isNotEmpty(acctPayNumber)){
			feeInfoAPN = new FeeInfoAPNSet();
			feeInfoAPN.setAccPayNnumber(acctPayNumber);
		}
		return feeInfoAPN;
	}
	/**
	 * 组装－托收银行信息
	 * @param feeInfoBankObj
	 * @return
	 */
	private FeeInfoBankSet buildFeeInfoBank(Map<String, Object> feeInfoBankMap){
		if (MapUtils.isEmpty(feeInfoBankMap)) {
			return null;
		}
		FeeInfoBankSet feeInfoBank = new FeeInfoBankSet();
		
		String bankName = MapUtils.getString(feeInfoBankMap, "bankName", "");
		String bankNumber = MapUtils.getString(feeInfoBankMap, "bankNumber", "");
		String bankCustName = MapUtils.getString(feeInfoBankMap, "bankCustName", "");
		if ("".equals(bankName) && "".equals(bankNumber) && "".equals(bankCustName)) {
			return null;
		}
		feeInfoBank.setBankName(bankName);
		feeInfoBank.setBankNumber(bankNumber);
		feeInfoBank.setBankCustName(bankCustName);
		return feeInfoBank;
	}
	/**
	 * 组装－关联号码信息
	 * @param relaAcceNbr
	 * @return
	 */
	private FeeInfoRANSet buildFeeInfoRAN(String relaAcceNbr){
		FeeInfoRANSet feeInfoRAN = null;
		if(StringUtils.isNotEmpty(relaAcceNbr)){
			feeInfoRAN = new FeeInfoRANSet();
			feeInfoRAN.setRelaAcceNbr(relaAcceNbr);
		}
		return feeInfoRAN;
	}
	
	/**
	 * 帐户付费信息分类合并
	 * @param acctFeeAry
	 * @return
	 */
	private Map<String, Object> mergeAcctFeeInfos(List<Map<String, Object>> acctFeeList){
		Map<String, Object> retnMap = new HashMap<String, Object>();

		if (acctFeeList == null || acctFeeList.size() == 0) {
			retnMap.put("feeTypeNbr", 0);
			return retnMap;
		}
		if (acctFeeList.size() == 1) {
			if (acctFeeList.get(0).containsKey("chargeItems")) {
				retnMap.put("chargeItems", acctFeeList.get(0).get("chargeItems"));
			}
			retnMap.put("feeTypeNbr", 1);
			retnMap.put("acctFeeAry0", acctFeeList);
			return retnMap;
		}

		Map<String, Object> tmpMap = new HashMap<String, Object>();
		List<Map<String, Object>> tmpList = null;
		int feeTypeNbr = 0;
		for (int i = 0; i < acctFeeList.size(); i++) {
			Map<String, Object> acctFeeMap = acctFeeList.get(i);
			if (acctFeeMap == null) {
				continue;
			}
			
			if (acctFeeMap.containsKey("payMethodId")) {
				String payMethodId = MapUtils.getString(acctFeeMap, "payMethodId");
				tmpList = (List<Map<String, Object>>) tmpMap.get(payMethodId);
				if (tmpList == null) {
					tmpList = new ArrayList<Map<String,Object>>();
					feeTypeNbr++;
				}
				tmpList.add(acctFeeMap);
				tmpMap.put(payMethodId, tmpList);
			}
			if (acctFeeMap.containsKey("chargeItems")) {
				retnMap.put("chargeItems", acctFeeMap.get("chargeItems"));
			}
		}

		Set keySet = tmpMap.keySet();
		Iterator iter = keySet.iterator();
		int i = 0;
		while (iter.hasNext()) {
			String key = (String) iter.next();
			retnMap.put("acctFeeAry" + (i++), tmpMap.get(key));
		}

		retnMap.put("feeTypeNbr" , feeTypeNbr);
		return retnMap;
	}
	
	private List<Map<String, Object>> mergeAcctFeeInfosByPayMethodId(List<Map<String, Object>> acctFeeList) {
		if (acctFeeList == null || acctFeeList.size() <= 1) {
			return acctFeeList;
		}
		List<Map<String, Object>> retnList = new ArrayList<Map<String,Object>>();
		Map<String, Object> firstMap = null;
		StringBuffer sb = new StringBuffer();
		StringBuffer sbInfo = new StringBuffer();
		for (int i = 0; i < acctFeeList.size(); i++) {
			Map<String, Object> feeMap = acctFeeList.get(i);
			if (feeMap.containsKey("payMethodName")) {
				String payMethodName = MapUtils.getString(feeMap, "payMethodName", "");
				// 合并现金付费的 关联号码、帐户信息
				if (payMethodName.contains(SysConstant.ACCT_FEE_TYPE_CASH)) {
					if (feeMap.containsKey("relaAcceNbr")) {
						sb.append(MapUtils.getString(feeMap, "relaAcceNbr", ""));
						sb.append(SysConstant.STR_PAU);
					}
					if (feeMap.containsKey("relaAcctInfo")) {
						sbInfo.append(MapUtils.getString(feeMap, "relaAcctInfo", ""));
						sbInfo.append(SysConstant.STR_ENT);
					}
					
					if (i == SysConstant.INT_0) {
						firstMap = feeMap;
					}
				} else {
					return acctFeeList;
				}
			}
		}
		if (firstMap != null) {
			firstMap.put("relaAcceNbr", sb.toString());
			firstMap.put("relaAcctInfo", sbInfo.toString());
		}
		retnList.add(firstMap);
		return retnList;
	}
	
	private List<TerminalInfoSet> parseTerminalInfos(Map<String, Object> dataMap) {
		List<TerminalInfoSet> terminalInfos = new ArrayList<TerminalInfoSet>();
		List<StringTwoSet> norTInfos = new ArrayList<StringTwoSet>();
		List<StringBeanSet> lineTInfos = new ArrayList<StringBeanSet>();
		if (!dataMap.containsKey("terminalInfos")) {
			return terminalInfos;
		}
		List<Map<String, Object>> terminalInfoList = (List<Map<String, Object>>) dataMap.get("terminalInfos");
		Map<String, Object> itemsMap = dealOneLineItems(terminalInfoList);
		if (MapUtils.isEmpty(itemsMap)) {
			return terminalInfos;
		}
		List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
		List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
		Map<String, Object> mergeMap = new HashMap<String, Object>();
		for (int i = 0; normList != null && i < normList.size(); i++) {
			Map<String, Object> normMap = normList.get(i);
			String tiName = MapUtils.getString(normMap, "tiName", "");
			String tiParam = MapUtils.getString(normMap, "tiParam", "");
			String tiRemark = MapUtils.getString(normMap, "tiRemark", "");
			if (mergeMap.containsKey(tiName)) {
				Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
				int count = MapUtils.getIntValue(tmpMap, "count");
				tmpMap.put("count", ++count);
				mergeMap.put(tiName, tmpMap);
			} else {
				Map<String, Object> tmpMap = new HashMap<String, Object>();
				tmpMap.put("tiParam", tiParam);
				tmpMap.put("count", 1);
				tmpMap.put("tiRemark", tiRemark);
				mergeMap.put(tiName, tmpMap);
			}
		}
		int tiSeq = 0;
		if (MapUtils.isNotEmpty(mergeMap)) {
//			1、HTC 619d 手机 32G   1部；         2、天翼UIM卡    2张。
			StringTwoSet strBean = null;
			Set<String> keySet = mergeMap.keySet();
			Iterator<String> it = keySet.iterator();
			while(it.hasNext()) {
				if (tiSeq % 2 == 0) {
					strBean = new StringTwoSet();
				}
				String tiName = it.next();
				Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
				String tiParam = MapUtils.getString(tmpMap, "tiParam", "");
				String tiRemark = MapUtils.getString(tmpMap, "tiRemark", "");
				String count = MapUtils.getString(tmpMap, "count", "");
				String str = (tiSeq + 1) + "、" + tiName + "   " + count + tiParam + "；";
				if (tiSeq % 2 == 0) {
					strBean.setStrBean0(str);
				} else {
					strBean.setStrBean1(str);
				}
				if (tiSeq % 2 != 0) {
					norTInfos.add(strBean);
				}
			}
		}
		mergeMap.clear();
		for (int i = 0; lineList != null && i < lineList.size(); i++) {
			Map<String, Object> lineMap = lineList.get(i);
			String tiName = MapUtils.getString(lineMap, "tiName", "");
			String tiParam = MapUtils.getString(lineMap, "tiParam", "");
			String tiRemark = MapUtils.getString(lineMap, "tiRemark", "");
			String isAloneLine = MapUtils.getString(lineMap, "isAloneLine", "");
			if (mergeMap.containsKey(tiName)) {
				Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
				int count = MapUtils.getIntValue(tmpMap, "count");
				tmpMap.put("count", ++count);
				mergeMap.put(tiName, tmpMap);
			} else {
				Map<String, Object> tmpMap = new HashMap<String, Object>();
				tmpMap.put("tiParam", tiParam);
				tmpMap.put("count", 1);
				tmpMap.put("tiRemark", tiRemark);
				tmpMap.put("isAloneLine", isAloneLine);
				mergeMap.put(tiName, tmpMap);
			}
		}
		if (MapUtils.isNotEmpty(mergeMap)) {
//			1、HTC 619d 手机 32G   1部；         2、天翼UIM卡    2张。
			StringBeanSet strBean = null;
			Set<String> keySet = mergeMap.keySet();
			Iterator<String> it = keySet.iterator();
			while(it.hasNext()) {
				strBean = new StringBeanSet();
				String tiName = it.next();
				Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
				String tiParam = MapUtils.getString(tmpMap, "tiParam", "");
				String tiRemark = MapUtils.getString(tmpMap, "tiRemark", "");
				String count = MapUtils.getString(tmpMap, "count", "");
				String str = (tiSeq + 1) + "、" + tiName + "   " + count + tiParam + "；";
				strBean.setStrBean(str);
				lineTInfos.add(strBean);
			}
		}
		
//		int orderSeqInt = 0;
//		int terminalInfoLen = terminalInfoList.size();
//		if (normList != null && normList.size() > 0) {
//			StringTwoSet strBean = null;
//			for (int i = 0; i < normList.size(); i++) {
//				if (i % 2 == 0) {
//					strBean = new StringTwoSet();
//				}
//				Map<String, Object> itemMap = normList.get(i);
//				// 设置元素顺序
//				String orderSeq = "";
//				if (terminalInfoLen != 1) {
//					orderSeq = (++orderSeqInt) + "";
//				}
//				String tiName = MapUtils.getString(itemMap, "tiName", "");
//				String tiParam = MapUtils.getString(itemMap, "tiParam", "");
//				String tiRemark = MapUtils.getString(itemMap, "tiRemark", "");
//				if (i % 2 == 0) {
//					strBean.setStrBean0(buildTerminalInfoItem(
//							orderSeq, tiName, tiParam, tiRemark));
//				} else {
//					strBean.setStrBean1(buildTerminalInfoItem(
//							orderSeq, tiName, tiParam, tiRemark));
//				}
//				if (i % 2 != 0) {
//					norTInfos.add(strBean);
//				}
//			}
//		}
//		if (lineList != null && lineList.size() > 0) {
//			for (int i = 0; i < lineList.size(); i++) {
//				Map<String, Object> itemMap = lineList.get(i);
//				StringBeanSet strBean = new StringBeanSet();
//				// 设置元素顺序
//				String orderSeq = "";
//				if (terminalInfoLen != 1) {
//					orderSeq = (++orderSeqInt) + "";
//				}
//				String tiName = MapUtils.getString(itemMap, "tiName", "");
//				String tiParam = MapUtils.getString(itemMap, "tiParam", "");
//				String tiRemark = MapUtils.getString(itemMap, "tiRemark", "");
//				strBean.setStrBean(buildTerminalInfoItem(orderSeq, tiName, tiParam, tiRemark));
//				lineTInfos.add(strBean);
//			}
//		}
		TerminalInfoSet termInfoSet = new TerminalInfoSet();
		if (norTInfos.size() > 0) {
			termInfoSet.setNorTInfos(norTInfos);
		}
		if (lineTInfos.size() > 0) {
			termInfoSet.setLineTInfos(lineTInfos);
		} 
		if (norTInfos.size() > 0 || lineTInfos.size() > 0) {
			terminalInfos.add(termInfoSet);
		}
		return terminalInfos;
	}
	
	/**
	 * 组装－终端信息项
	 * @param seq
	 * @param acceType
	 * @param acceNbr
	 * @param remarkTitle
	 * @param remarkInfo
	 * @return
	 */
	private String buildTerminalInfoItem(String seq, String tiName, String tiParam, String tiRemark) {
		String termInfoStr = (StringUtils.isEmpty(seq) ? "" : (seq + SysConstant.STR_PAU)) 
				+ tiName + SysConstant.STR_SEP +tiParam + SysConstant.STR_SPE 
				+ SysConstant.STR_LL_BRE + tiRemark + SysConstant.STR_RL_BRE + SysConstant.STR_SPI;
		return termInfoStr;
	}
	
	
	private List<AuditTicketInfoSet> parseAuditTickets(Map<String, Object> dataMap) {
		List<AuditTicketInfoSet> auditTickets = new ArrayList<AuditTicketInfoSet>();
		List<StringTwoSet> normAInfos = new ArrayList<StringTwoSet>();
		List<StringBeanSet> lineAInfos = new ArrayList<StringBeanSet>();
		if (!dataMap.containsKey("auditInfos")) {
			return auditTickets;
		}
		List auditInfos = (List) dataMap.get("auditInfos");
		if (auditInfos == null || auditInfos.size() == 0) {
			return auditTickets;
		}
		for (int i = 0; i < auditInfos.size(); i++) {
			List<Map<String, Object>> auditInfo = (List<Map<String, Object>>) auditInfos.get(i);
			if (auditInfo == null || auditInfo.size() == 0) {
				continue;
			}
			Map<String, Object> itemsMap = dealOneLineItems(auditInfo);
			if (MapUtils.isEmpty(itemsMap)) {
				continue;
			}
			List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
			List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
			int orderSeqInt = 0;
			int auditInfoLen = auditInfos.size();
			if (normList != null && normList.size() > 0) {
				StringTwoSet strBean = null;
				for (int j = 0; j < normList.size(); j++) {
					if (j % 2 == 0) {
						strBean = new StringTwoSet();
					}
					Map<String, Object> itemMap = normList.get(j);
					// 设置元素顺序
					String orderSeq = "";
					if (auditInfoLen != 1) {
						orderSeq = (++orderSeqInt) + "";
					}
					String itemName = MapUtils.getString(itemMap, "itemName", "");
					String itemValue = MapUtils.getString(itemMap, "itemValue", "");
					String aiItemInfo = itemName + SysConstant.STR_SEP + itemValue;
					if (j % 2 == 0) {
						strBean.setStrBean0(aiItemInfo);
					} else {
						strBean.setStrBean1(aiItemInfo);
					}
					if (j % 2 != 0) {
						normAInfos.add(strBean);
					}
				}
			}
			if (lineList != null && lineList.size() > 0) {
				for (int j = 0; j < lineList.size(); j++) {
					Map<String, Object> itemMap = lineList.get(j);
					StringBeanSet strBean = new StringBeanSet();
					// 设置元素顺序
					String orderSeq = "";
					if (auditInfoLen != 1) {
						orderSeq = (++orderSeqInt) + "";
					}
					String itemName = MapUtils.getString(itemMap, "itemName", "");
					String itemValue = MapUtils.getString(itemMap, "itemValue", "");
					String aiItemInfo = itemName + SysConstant.STR_SEP + itemValue;
					strBean.setStrBean(aiItemInfo);
					lineAInfos.add(strBean);
				}
			}
			AuditTicketInfoSet auditTicketSet = new AuditTicketInfoSet();
			if (normAInfos.size() > 0) {
				auditTicketSet.setNorTInfos(normAInfos);
			}
			if (lineAInfos.size() > 0) {
				auditTicketSet.setLineTInfos(lineAInfos);
			}
			if (normAInfos.size() > 0 || lineAInfos.size() > 0) {
				auditTickets.add(auditTicketSet);
			}
		}
		return auditTickets;
	}
	
	
	private List<StringBeanSet> parseRemarkInfos(Map<String, Object> dataMap) {
		List<StringBeanSet> remarkInfos = new ArrayList<StringBeanSet>();
		int strIndex = 0;
		//20140220 添加固定写死的备注 BEGIN
		//1、为保障对您的及时服务提醒，您会收到以10000、10001、118xx号码发送的中国电信服务信息。
//		String str1 = "1、为保障对您的及时服务提醒，您会收到以10000、10001、118xx号码发送的中国电信服务信息。";
//		List<String> strList = new ArrayList<String>();
//		strList.add(str1);
//		for (strIndex = 0; strIndex < strList.size(); strIndex++) {
//			StringBeanSet remarkInfoBean = new StringBeanSet();
//			remarkInfoBean.setStrBean(strList.get(strIndex));
//			remarkInfos.add(remarkInfoBean);
//		}
		//20140220 添加固定写死的备注 END
		
		if (!dataMap.containsKey("remarkInfos")) {
			return remarkInfos;
		}
		List remarkInfoList = (List) dataMap.get("remarkInfos");
		if (remarkInfoList == null || remarkInfoList.size() == 0) {
			return remarkInfos;
		}
		int remarkInfoLen = remarkInfoList.size();
		for (int i = 0; i < remarkInfoLen; i++) {
			StringBeanSet remarkInfoBean = new StringBeanSet();
			Object obj = remarkInfoList.get(i);
			if (obj instanceof Map) {
				Map<String, Object> remarkInfoMap = (Map<String, Object>) obj; 
				String orderSeq = (strIndex + i + 1) + "";
				String acceType = MapUtils.getString(remarkInfoMap, "acceType", "");
				String acceNbr = MapUtils.getString(remarkInfoMap, "acceNbr", "");
				String remarkTitle = MapUtils.getString(remarkInfoMap, "remarkTitle", "");
				String remarkInfo = MapUtils.getString(remarkInfoMap, "remarkInfo", "");
				remarkInfoBean.setStrBean(buildRemarkInfoItem(orderSeq, acceType, acceNbr, remarkTitle, remarkInfo));
			} else if (obj instanceof String){
				String strBean = (strIndex + i + 1) + SysConstant.STR_PAU + (String)obj;
				remarkInfoBean.setStrBean(strBean);
			}
			
			remarkInfos.add(remarkInfoBean);
		}
		
		return remarkInfos;
	}
	
	/**
	 * 组装－备注信息项
	 * @param seq
	 * @param acceType
	 * @param acceNbr
	 * @param remarkTitle
	 * @param remarkInfo
	 * @return
	 */
	private String buildRemarkInfoItem(String seq, String acceType, String acceNbr, String remarkTitle, String remarkInfo){
		String remarkInfoStr = (StringUtils.isEmpty(seq) == true ? "" : (seq + SysConstant.STR_PAU)) 
				+ acceType + SysConstant.STR_SPE 
				+ SysConstant.STR_LL_BRE + acceNbr + SysConstant.STR_RL_BRE + SysConstant.STR_SPE
				+ remarkTitle + SysConstant.STR_SEP
				+ remarkInfo + SysConstant.STR_STO;
		return remarkInfoStr;
	}
	
	private List<AgreementsSet> parseAgreements(Map<String, Object> dataMap, boolean needAgreement) {
		List<AgreementsSet> agreements = new ArrayList<AgreementsSet>();
		if (!needAgreement || !dataMap.containsKey("agreements")) {
			return agreements;
		}
		Map<String, Object> agreementInfo = MapUtils.getMap(dataMap, "agreements");
		if (MapUtils.isEmpty(agreementInfo)) {
			return null;
		}
		// 解析添加协议数据
		AgreementsSet agreementSet = new AgreementsSet();

		// 解析添加IPHONE协议
		if (agreementInfo.containsKey("iphoneAgreements")) {
			List iphoneInfos = (List) agreementInfo.get("iphoneAgreements");

			List<AgreementIphoneSet> iphoneAgreements = new ArrayList<AgreementIphoneSet>();
			if (iphoneInfos != null && iphoneInfos.size() > 0) {
				iphoneAgreements = parseAgreementsIphone(iphoneInfos);
			}
			
			agreementSet.setIphoneAgreements(iphoneAgreements);
		}
		// 解析添加靓号协议
		if (agreementInfo.containsKey("speNbrAgreements")) {
			List speNbrInfos = (List) agreementInfo.get("speNbrAgreements");

			List<AgreementSpeNbrSet> speNbrAgreements = new ArrayList<AgreementSpeNbrSet>();
			if (speNbrInfos != null && speNbrInfos.size() > 0) {
				speNbrAgreements = parseAgreementsSpeNbr(speNbrInfos);
			}
			
			agreementSet.setSpeNbrAgreements(speNbrAgreements);
		}
		// 解析添加补贴协议
		if (agreementInfo.containsKey("terminalAgreements")) {
			List terminalInfos = (List) agreementInfo.get("terminalAgreements");

			List<AgreementTerminalSet> terminalAgreements = new ArrayList<AgreementTerminalSet>();
			if (terminalInfos != null && terminalInfos.size() > 0) {
				terminalAgreements = parseAgreementsTerminal(terminalInfos);
			}
			
			agreementSet.setTerminalAgreements(terminalAgreements);
		}
		// 解析添加业务协议
		if (agreementInfo.containsKey("businessAgreements")) {
			String businessInfo = (String) agreementInfo.get("businessAgreements");

			List<String> businessAgreements = new ArrayList<String>();
			if (SysConstant.STR_Y.equalsIgnoreCase(businessInfo)) {
				businessAgreements.add(SysConstant.STR_Y);
			}
			agreementSet.setBusinessAgreements(businessAgreements);
		}
		
		agreements.add(agreementSet);
		return agreements;
	}
	
	/**
	 * 解析回执内容-协议信息-iPhone协议
	 * 
	 * @param outParamJson
	 * @param vInfoDatas
	 * @throws Exception
	 */
	private List<AgreementIphoneSet> parseAgreementsIphone(List<Map<String, Object>> iphoneInfos){
		if(null == iphoneInfos || iphoneInfos.size() == 0){
			return null;
		}
		List<AgreementIphoneSet> agreementIphoneInfos = new ArrayList<AgreementIphoneSet>();
		for (int i = 0; i < iphoneInfos.size(); i++) {
			Map<String, Object> iphoneInfo = iphoneInfos.get(i);
			AgreementIphoneSet iphoneSet = new AgreementIphoneSet();
			
			String custName = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "custName", "");
			String identityType = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "identityType", "");
			String identityNbr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "identityNbr", "");
			String identityAddr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "identityAddr", "");
			String currentAddr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "currentAddr", "");
			String postNbr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "postNbr", "");
			String linkNbr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "linkNbr", "");
			String accessNumber = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "accessNumber", "");
			String effectMonth = MapUtils.getString(iphoneInfo, "effectMonth", "");
			String terminalType = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "terminalType", "");
			String offerSpecName = MapUtils.getString(iphoneInfo, "offerSpecName", "");
			String baseFee = MapUtils.getString(iphoneInfo, "baseFee", "");
			String offerSpecDesc = MapUtils.getString(iphoneInfo, "offerSpecDesc", "");
			String preFee = "";
			String preFeeBig = "";
			String limitFee = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "limitFee", "");
			String attachOfferSpecDesc = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "attachOfferSpecDesc", "");
			
			if(iphoneInfo.containsKey("preFee")){
				preFee = MapUtils.getString(iphoneInfo, "preFee", "");
				preFeeBig = SysConstant.STR_SPE + ChsStringUtil.toChineseDigitl(preFee);
				preFee = SysConstant.STR_SPE + preFee;
			}
			
			iphoneSet.setCustName(custName);
			iphoneSet.setIdentityType(identityType);
			iphoneSet.setIdentityNbr(identityNbr);
			iphoneSet.setIdentityAddr(identityAddr);
			iphoneSet.setCurrentAddr(currentAddr);
			iphoneSet.setPostNbr(postNbr);
			iphoneSet.setLinkNbr(linkNbr);
			iphoneSet.setAccessNumber(accessNumber);
			iphoneSet.setEffectMonth(effectMonth);
			iphoneSet.setTerminalType(terminalType);
			iphoneSet.setOfferSpecName(offerSpecName);
			iphoneSet.setBaseFee(baseFee);
			iphoneSet.setOfferSpecDesc(offerSpecDesc);
			iphoneSet.setPreFee(preFee);
			iphoneSet.setPreFeeBig(preFeeBig);
			iphoneSet.setLimitFee(limitFee);
			iphoneSet.setAttachOfferSpecDesc(attachOfferSpecDesc);
			
			agreementIphoneInfos.add(iphoneSet);
		}
		
		return agreementIphoneInfos;
	}
	/**
	 * 解析回执内容-协议信息-靓号协议
	 * 
	 * @param outParamJson
	 * @param vInfoDatas
	 * @throws Exception
	 */
	private List<AgreementSpeNbrSet> parseAgreementsSpeNbr(List<Map<String, Object>> niceNbrInfos){
		if(null == niceNbrInfos || niceNbrInfos.size() == 0){
			return null;
		}
		
		List<AgreementSpeNbrSet> agreementSpeNbrs = new ArrayList<AgreementSpeNbrSet>();
		for(int i=0; i<niceNbrInfos.size(); i++){
			Map<String, Object> speNbrInfo = niceNbrInfos.get(i);
			AgreementSpeNbrSet speNbrSet = new AgreementSpeNbrSet();
			
			String custName = MapUtils.getString(speNbrInfo, "custName", "");
			String accessNumber = MapUtils.getString(speNbrInfo, "accessNumber", "");
			String preFee = MapUtils.getString(speNbrInfo, "preFee", "");
			String limitFee = MapUtils.getString(speNbrInfo, "limitFee", "");
			
			speNbrSet.setCustName(custName);
			speNbrSet.setAccessNumber(accessNumber);
			speNbrSet.setPreFee(preFee);
			speNbrSet.setLimitFee(limitFee);
			
			agreementSpeNbrs.add(speNbrSet);
		}
		
		return agreementSpeNbrs;
	}
	/**
	 * 解析回执内容-协议信息-补贴协议
	 * 
	 * @param outParamJson
	 * @param vInfoDatas
	 * @throws Exception
	 */
	private List<AgreementTerminalSet> parseAgreementsTerminal(List<Map<String, Object>> terminalInfos){
		if(null == terminalInfos || terminalInfos.size() == 0){
			return null;
		}
		
		List<AgreementTerminalSet> agreementTerminals = new ArrayList<AgreementTerminalSet>();
		for(int i=0; i<terminalInfos.size(); i++){
			Map<String, Object> terminalInfo = terminalInfos.get(i);
			AgreementTerminalSet terminalSet = new AgreementTerminalSet();
			
			String custName = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "custName", "");
			String accessNumber = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "accessNumber", "");
			String offerSpecName = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "offerSpecName", "");
			String offerSpecDesc = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "offerSpecDesc", "");
			
			terminalSet.setCustName(custName);
			terminalSet.setAccessNumber(accessNumber);
			terminalSet.setOfferSpecName(offerSpecName);
			terminalSet.setOfferSpecDesc(offerSpecDesc);
			
			agreementTerminals.add(terminalSet);
		}
		
		return agreementTerminals;
	}
	
	
	private Map<String, Object> runVoucherPrint(Map<String, Object> printData,
			HttpServletResponse response, String printType,
			boolean needAgreement,String signflag) throws Exception {
		String printTypeDir = SysConstant.P_MOD_SUB_CTG_PDF;
		if (SysConstant.PRINT_TYPE_HTML.equals(printType)) {
			printTypeDir = SysConstant.PRINT_TYPE_HTML;
		}
		String strJasperFileName = printTypeDir + SysConstant.P_MOD_FILE_CRM_COMMON;
//		String strJasperFileName = printTypeDir + "CtgPrintCustInfo";
//		String strJasperFileName = printTypeDir + "CtgPrintItemInfoBold";
		if (strJasperFileName == null || "".equals(strJasperFileName)) {
			throw new RuntimeException("获取回执打印模板异常，请联系系统人员!");
		}

		strJasperFileName = SysConstant.P_MOD_BASE_DIR + strJasperFileName
				+ SysConstant.P_MOD_FILE_SUBFIX;
		log.info(" 回执模板名称： " + strJasperFileName);

		try {
			Collection<Map<String, Object>> inFields = new ArrayList<Map<String, Object>>();
//			List tmpList = (List) printData.get("custInfos");
//			CustInfoSet custInfoSet = (CustInfoSet) tmpList.get(0);
			if(signflag.equals(SysConstant.PREVIEW_SIGN)){
				printData.put("isShowSign", "false");
				printData.put("isShowReplaceStr", "true");
			}else if(signflag.equals(SysConstant.SAVE_PDF)){
				printData.put("isShowSign", "true");
				printData.put("isShowReplaceStr", "false");
			}else{
				printData.put("isShowSign", "false");
				printData.put("isShowReplaceStr", "false");
			}
			inFields.add(printData);
//			Collection inFields = new ArrayList();
//			ItemInfoSet itemInfoSet = new ItemInfoSet();
//			itemInfoSet.setItemName("testName");
//			itemInfoSet.setItemValue("showValue");
//			Map<String, Object> tmpMap = new HashMap<String, Object>();
//			tmpMap.put("itemName", "tEsTnAmEOne");
//			tmpMap.put("itemValue", "tEsTvAlUeOne");
//			inFields.add(tmpMap);
//			tmpMap = new HashMap<String, Object>();
//			tmpMap.put("itemName", "tEsTnAmETwo");
//			tmpMap.put("itemValue", "tEsTvAlUeTwo");
//			inFields.add(tmpMap);
//			tmpMap.put("itemInfo", itemInfoSet);
////			inFields.add(itemInfoSet);
//			inFields.add(tmpMap);
			Map<String, Object> reportParams = new HashMap<String, Object>();
			reportParams.put("SUBREPORT_DIR", SysConstant.P_MOD_SUB_BASE_DIR
					+ printTypeDir);
			reportParams.put("HAS_AGREEMENT", needAgreement);
			if(signflag.equals(SysConstant.PREVIEW_SIGN)){
				return previewHtml(strJasperFileName, reportParams, inFields, 0, 0);
			}else if(signflag.equals(SysConstant.SAVE_PDF)){
				return savePdf(strJasperFileName, reportParams, inFields,0, 0,printData);
			}else{
			//输出打印内容
				if (SysConstant.PRINT_TYPE_HTML.equals(printType)) {
					commonHtmlPrint(strJasperFileName, reportParams, inFields,
							response, 0, 0);
				} else {
					commonPdfPrint(strJasperFileName, reportParams, inFields,
							response, 0, 0);
				}
			}
		} catch (Exception e) {
			log.error("打印回执异常:", e);
			throw e;
		}
		return null;
	}
	private Map<String,Object> savePdf(String strJasperFileName,Map<String, Object> hasParameters,
			Collection<Map<String, Object>> lstFields, int pageWidth, int pageHeight,Map<String,Object> printData)
			throws Exception {
		Map<String,Object> ret=new HashMap<String,Object>();
        //获取Jasper模板对应的printHelper
        PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, pageWidth, pageHeight);
        //生成pdf文件
        byte[] bytes = vPdfPrintHelper.getPdfStreamWithParametersAndFields(hasParameters, lstFields);
        String orderInfo=Base64.encodeBase64String(bytes).replaceAll("\n|\r", ""); ;
        ret.put("orderInfo", orderInfo);
        return ret;
	}
	private Map<String,Object> previewHtml(String strJasperFileName,
			Map<String, Object> hasParameters,Collection<Map<String, Object>> lstFields,int pageWidth, int pageHeight){
		Map<String,Object> ret=new HashMap<String,Object>();
		try{
			PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, 0, 0);
			String htmlStr=vPdfPrintHelper.getHtmlStrWithParametersAndFields(hasParameters, lstFields);
			if(htmlStr.trim().equals("")){
				ret.put("code", "-1");
				ret.put("msg", "生成回执预览页面失败");
			}else{
				ret.put("htmlStr", htmlStr);
				ret.put("code", "0");
			}
		} catch (Exception e) {
			ret.put("code","-2");
			ret.put("msg", e.getStackTrace());
		}
		return ret;
	}
	private void commonPdfPrint(String strJasperFileName,
			Map<String, Object> hasParameters,
			Collection<Map<String, Object>> lstFields,
			HttpServletResponse response, int pageWidth, int pageHeight)
			throws Exception {
		try {
            //获取Jasper模板对应的printHelper
            PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, pageWidth, pageHeight);
            
            //生成pdf文件
            byte[] bytes = vPdfPrintHelper.getPdfStreamWithParametersAndFields(hasParameters, lstFields);
            
            //输出到response
            if(response != null){
            	writeToResponse(bytes,strJasperFileName,response);
            }
            
        } catch (BusinessException exp) {
        	exp.printStackTrace();
            response.setContentType("text/html; charset=GB18030");
            response.setHeader("Content-Language", "GB18030");
            response.setHeader("encoding", "GB18030");
            response.getWriter().write(exp.getMessage());
        }
	}

	private void commonHtmlPrint(String strJasperFileName,
			Map<String, Object> hasParameters,
			Collection<Map<String, Object>> lstFields,
			HttpServletResponse response, int pageWidth, int pageHeight) throws Exception {
		try {
            //获取Jasper模板对应的printHelper
            PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, pageWidth, pageHeight);
            
            //生成HTML文件
           vPdfPrintHelper.getHtmlStreamWithParametersAndFields(response,hasParameters, lstFields);
            
        } catch (Exception exp) {
            response.setContentType("text/html; charset=GB18030");
            response.setHeader("Content-Language", "GB18030");
            response.setHeader("encoding", "GB18030");
            response.getWriter().write(exp.getMessage());
        }
	}
	
	private static void writeToResponse(byte[] bytes,String strJasperFileName,HttpServletResponse response) throws Exception{
        if (bytes != null && bytes.length > 0) {
            response.reset();
            response.setContentType("application/pdf;charset=GB18030");
            response.setContentLength(bytes.length);
            ServletOutputStream ouputStream = response.getOutputStream();
            ouputStream.write(bytes, 0, bytes.length);
            ouputStream.flush();
            ouputStream.close();
        }else{
            throw new Exception("对不起，根据pdf模板[" + strJasperFileName + "]，没有生成相应的pdf数据流，请检查输出参数是否正确！");
        }
    }

	public Map<String, Object> getInvoiceItems(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap, 
				PortalServiceCode.INTF_GET_INVOICE_ITEMS,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>());
		} else {
			
		}
		resultMap.put("resultCode", db.getResultCode());
		resultMap.put("resultMsg", db.getResultMsg());
		return resultMap;
	}
	
	public Map<String, Object> getInvoiceTemplates(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
					throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(paramMap, 
				PortalServiceCode.INTF_GET_INVOICE_TEMPLATES,
				optFlowNum, sessionStaff);
		try {
			resultMap.put("resultCode", db.getResultCode());
			resultMap.put("resultMsg", db.getResultMsg());
			int length = 0;
			resultMap.put("length", length);
			if (ResultCode.R_SUCCESS.equals(db.getResultCode())) {
				List<Map<String, Object>> tempList = (List<Map<String, Object>>) db.getReturnlmap().get("result");
				if (tempList != null && tempList.size() > 0) {
					length = tempList.size();
				}
			
				resultMap.put("length", length);
				resultMap.put("tempList", tempList);
				//把发票模板组放入缓存中
				DataRepository.getInstence().setTemplateList(tempList,sessionStaff.getPartnerId());
			}
		} catch (Exception e) {
			log.error("门户处理服务层的getInvoiceTemplates服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.GET_INVOICE_TEMPLATES, paramMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}
	
	public Map<String, Object> saveInvoiceInfo(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap, 
				PortalServiceCode.INTF_SAVE_INVOICE_INFO,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>());
		} else {
			
		}
		resultMap.put("resultCode", db.getResultCode());
		resultMap.put("resultMsg", db.getResultMsg());
		return resultMap;
	}
	
	public Map<String, Object> printInvoice(Map<String, Object> paramMap,
			String optFlowNum,
			HttpServletRequest request, HttpServletResponse response,
			Map<String, Object> templateInfoMap) 
			throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		String boActionTypeName = "";
		String prodId = "";
		String acctNumber = "";
		String acctId = "";
		List prodInfoList = (List) paramMap.get("prodInfo");
		if (prodInfoList != null && prodInfoList.size() > 0) {
			Map<String, Object> prodInfoMap = (Map<String, Object>) prodInfoList.get(0);
			if (prodInfoMap != null && prodInfoMap.containsKey("busiOrders")) {
				List busiOrders = (List) prodInfoMap.get("busiOrders");
				if (busiOrders != null && busiOrders.size() > 0) {
					Map busiOrderMap = (Map) busiOrders.get(0);
					boActionTypeName = MapUtils.getString(busiOrderMap, "boActionTypeName", "");
				}
			}
			prodId = MapUtils.getString(prodInfoMap, "prodId", "");
			acctNumber = MapUtils.getString(prodInfoMap, "acctCd", "");
			acctId = MapUtils.getString(prodInfoMap, "acctId", "");
		}
		List invoiceInfos = (List) paramMap.get("invoiceInfos");
		Map<String, Object> invoiceInfo = (Map<String, Object>) invoiceInfos.get(0);
		if(paramMap.get("printflag")!=null){
			boActionTypeName = MapUtils.getString(invoiceInfo, "boActionTypeName", "");
		}
		String billType = MapUtils.getString(invoiceInfo, "billType", "1");// 0-发票，1-票据
		String invoiceTitle = "";
		String acceNumber = MapUtils.getString(invoiceInfo, "acctNbr", "");
		Calendar calendar = Calendar.getInstance();
		String custOrderNbr = MapUtils.getString(invoiceInfo, "custSoNumber", "");
		List chargeItems = (List) paramMap.get("items");
		for (int i = 0; chargeItems != null && i < chargeItems.size(); i++) {
			Map item = (Map) chargeItems.get(i);
			String charge = MapUtils.getString(item, "charge", "0");
			charge = NumUtil.formatNumber(Double.parseDouble(charge), 100, 2);
			item.put("charge", charge);
			String tax = MapUtils.getString(item, "tax", "0");
			if (!"0".equals(tax)) {
				double taxDb = Double.parseDouble(tax) / 100.0;
				item.put("tax", "" + taxDb);
			}
			item.put("acceNumber", MapUtils.getString(item, "acceNumber", ""));
			item.put("custOrderNbr", custOrderNbr);
		}
		String sumCharge = MapUtils.getString(invoiceInfo, "account", "0");
		sumCharge = NumUtil.formatNumber(Double.parseDouble(sumCharge), 100, 2);
		String printType = MapUtils.getString(paramMap, "printType");
		Map<String, Object> printData = new HashMap<String, Object>();
		printData.put("invoiceTitle", invoiceTitle);
		printData.put("invoiceNbr", MapUtils.getString(invoiceInfo, "invoiceNbr", ""));
		printData.put("invoiceNum", MapUtils.getString(invoiceInfo, "invoiceNum", ""));
		printData.put("year", "" + calendar.get(Calendar.YEAR));
		printData.put("month", "" + (calendar.get(Calendar.MONTH) + 1));
		printData.put("day", "" + calendar.get(Calendar.DATE));
		printData.put("invoiceDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("soDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("invoiceTime", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd HH:mm:ss"));
		printData.put("partyName", MapUtils.getString(paramMap, "partyName", ""));
		printData.put("acceNumber", acceNumber);
		printData.put("custOrderId", MapUtils.getString(invoiceInfo, "custOrderId", ""));
		printData.put("custOrderNbr", custOrderNbr);
		printData.put("chargeItems", chargeItems);
		printData.put("payMethod", MapUtils.getString(paramMap, "payMethod", ""));
		printData.put("sumCharge", sumCharge);
		printData.put("sumChargeRMB", MapUtils.getString(invoiceInfo, "accountUpper", ""));
		printData.put("staffName", sessionStaff.getStaffName());
		printData.put("staffNumber", sessionStaff.getStaffCode());
		printData.put("channelNumber", sessionStaff.getCurrentChannelId());
		printData.put("channelName", sessionStaff.getCurrentChannelName());
		printData.put("prodId", prodId);
		printData.put("acctNumber", acctNumber);
		printData.put("boActionTypeName", boActionTypeName);
		printData.put("acctId", acctId);
		
		//如果printData为空，则返回失败
		if (MapUtils.isEmpty(printData)) {
			return printData;
		}

		// 3. 数据驱动模板、展示打印页面
		runInvoicePrint(printData, response, printType, templateInfoMap);

		return printData;
	}
	
	protected Map<String, Object> runInvoicePrint(Map<String, Object> printData,
			HttpServletResponse response, String printType, 
			Map<String, Object> templateInfoMap) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		String printTypeDir = "";
		String strJasperFileName = "";
        if (SysConstant.ON.equals(propertiesUtils.getMessage(SysConstant.ABS_DIRECTORY_FLAG))) {
            String templatePath = MapUtils.getString(templateInfoMap, "templatePath");
            String absDir = propertiesUtils.getMessage(SysConstant.ABS_DIRECTORY_KEY);
            if (absDir.charAt(absDir.length() - 1) != '/') {
                absDir += '/';
            }
            printTypeDir = SysConstant.P_FILE_PROTOCOL + absDir;                
            
            strJasperFileName = printTypeDir + templatePath + SysConstant.P_MOD_FILE_SUBFIX;
            printTypeDir = strJasperFileName.substring(0, strJasperFileName.lastIndexOf("/") + 1);
        } else {
            printTypeDir = SysConstant.P_MOD_SUB_BASE_DIR + SysConstant.P_MOD_SUB_INVOICE;
            strJasperFileName = SysConstant.P_MOD_BASE_DIR + SysConstant.P_MOD_SUB_INVOICE 
                    + SysConstant.P_MOD_FILE_INVOICE + SysConstant.P_MOD_FILE_SUBFIX;
        }
        
		log.debug(" 发票模板名称： " + strJasperFileName);

		Collection<Map<String, Object>> inFields = new ArrayList<Map<String, Object>>();
		inFields.add(printData);

		Map<String, Object> reportParams = new HashMap<String, Object>();
		reportParams.put("SUBREPORT_DIR", printTypeDir);

		//输出打印内容
		if (SysConstant.PRINT_TYPE_HTML.equals(printType)) {
			commonHtmlPrint(strJasperFileName, reportParams, inFields,
					response, 0, 0);
		} else {
			commonPdfPrint(strJasperFileName, reportParams, inFields,
					response, 0, 0);
		}
		
		return resultMap;
	}
	
	
	public Map<String, Object> invalidInvoices(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap, 
				PortalServiceCode.INTF_INVALID_INVOICE,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		resultMap.put("resultCode", db.getResultCode());
		resultMap.put("resultMsg", db.getResultMsg());
		return resultMap;
	}
	
	/**
	 * 充值收据打印
	 */
	public Map<String, Object> printChargeReceipt(Map<String, Object> paramMap, String optFlowNum,
			HttpServletRequest request, HttpServletResponse response,
			Map<String, Object> templateInfoMap)throws Exception{
		
		Map<String ,Object> receiptInfo = MapUtils.getMap(paramMap, "receiptInfo", new HashMap<String, Object>());
		Calendar calendar = Calendar.getInstance();
		receiptInfo.put("year", calendar.get(Calendar.YEAR));
    	receiptInfo.put("month", calendar.get(Calendar.MONTH)+1);
    	receiptInfo.put("day", calendar.get(Calendar.DATE));
		
		runInvoicePrint(receiptInfo, response, MapUtils.getString(paramMap, "printType"), templateInfoMap);
		return receiptInfo;
	}
	/**
	 * 发票打印通知
	 */
	public Map<String, Object> invoiceNotice(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
			Map<String, Object> returnMap = new HashMap<String, Object>();
			DataBus db = ServiceClient.callService(paramMap, 
					PortalServiceCode.INVOICE_NOTICE,    
					optFlowNum, sessionStaff);		
			if(ResultConstant.R_POR_SUCCESS.getCode().equals(db.getResultCode())){
					returnMap.put("resultCode", db.getResultCode());
					returnMap.put("resultMap", db.getReturnlmap());
				}else{
					returnMap.put("resultCode", db.getResultCode());
					returnMap.put("resultMsg", db.getResultMsg());
				}			
			return returnMap;
		}
		
	/**
	 * 新票据回收通知
	 */
	public Map<String, Object> invoiceReverse(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {		
			Map<String, Object> returnMap = new HashMap<String, Object>();
			DataBus db = ServiceClient.callService(paramMap, 
					PortalServiceCode.INVOICE_REVERSE,     
					optFlowNum, sessionStaff);
			if(ResultConstant.R_POR_SUCCESS.getCode().equals(db.getResultCode())){
				returnMap.put("resultCode", db.getResultCode());
				returnMap.put("resultMap", db.getReturnlmap());
			}else{
				returnMap.put("resultCode", db.getResultCode());
				returnMap.put("resultMsg", db.getResultMsg());
			}			
		return returnMap;
		}
	
	
	
	public static void main(String[] args) {
		Calendar calendar = Calendar.getInstance();
		String str = DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd HH:mm:ss");
		System.out.println(str);
	}
}
