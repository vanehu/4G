package com.al.lte.portal.bmo.print;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.NumUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 销账 发票打印
 * @author wd
 *
 */
@Service("com.al.lte.portal.bmo.print.WriteOffPrintBmoImpl")
public class WriteOffPrintBmoImpl extends PrintBmoImpl {

	private final Log log = Log.getLog(getClass());
	
	@Autowired
	PropertiesUtils propertiesUtils;
	public Map<String, Object> printInvoice(Map<String, Object> paramMap,
			String optFlowNum,
			HttpServletRequest request, HttpServletResponse response,
			Map<String, Object> templateInfoMap) 
			throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		List<Map<String, Object>> invoiceInfos = (List) paramMap.get("invoiceInfos");
		Map<String, Object> invoiceInfo = (Map<String, Object>) invoiceInfos.get(0);
		String invoiceTitle = "";
		String acceNumber = MapUtils.getString(invoiceInfo, "acctNbr", "");
		Calendar calendar = Calendar.getInstance();
		
//		List<Map<String, Object>> chargeItems = (List) invoiceInfo.get("itemsGroups");
//		for (int k = 0; chargeItems != null && k < chargeItems.size(); k++) {
//			Map itemsMap = (Map) chargeItems.get(k);
//			List items = (List) itemsMap.get("items");
//			for (int i = 0; items != null && i < items.size(); i++) {
//				Map item = (Map) items.get(i);
//				String charge = MapUtils.getString(item, "charge", "0");
//				charge = NumUtil.formatNumber(Double.parseDouble(charge), 100, 2);
//				item.put("charge", charge);
//				item.put("partyName", MapUtils.getString(paramMap, "partyName", ""));
//				item.put("acceNumber",acceNumber);
//				item.put("itemName", MapUtils.getString(item, "itemName", ""));
//			}
//		}
		
		List chargeItems = (List) paramMap.get("items");
		for (int i = 0; chargeItems != null && i < chargeItems.size(); i++) {
			Map item = (Map) chargeItems.get(i);
			String charge = MapUtils.getString(item, "charge", "0");
			charge = NumUtil.formatNumber(Double.parseDouble(charge), 100, 2);
			item.put("charge", charge);
			item.put("partyName",MapUtils.getString(paramMap, "partyName", ""));
			item.put("acceNumber",acceNumber);
			String str = MapUtils.getString(item, "billingCycleId", "");
			if(str.length()>=6){
				str = str.substring(0,6);
			}
			item.put("billingCycleId",str);
			item.put("itemName",MapUtils.getString(item, "itemName", ""));
		}
		
		
		String sumCharge = MapUtils.getString(invoiceInfo, "account", "0");
		sumCharge = NumUtil.formatNumber(Double.parseDouble(sumCharge), 100, 2);
		String printType = MapUtils.getString(paramMap, "printType");
		Map<String, Object> printData = new HashMap<String, Object>();

		printData.put("invoiceTitle", invoiceTitle);
		printData.put("invoiceNbr", MapUtils.getString(invoiceInfo, "invoiceNbr", ""));
		printData.put("invoiceNum", MapUtils.getString(invoiceInfo, "invoiceNum", ""));
		printData.put("year", calendar.get(Calendar.YEAR));
		printData.put("month", calendar.get(Calendar.MONTH) + 1);
		printData.put("day", calendar.get(Calendar.DATE));
		printData.put("invoiceDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("soDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("invoiceTime", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd HH:mm:ss"));
		printData.put("partyName", MapUtils.getString(paramMap, "partyName", ""));
		printData.put("acceNumber", acceNumber);
		printData.put("billSerialNbr", MapUtils.getString(paramMap, "billSerialNbr", ""));
		printData.put("acctId", MapUtils.getString(invoiceInfo, "acctId", ""));
		printData.put("acctName", MapUtils.getString(invoiceInfo, "acctName", ""));
		printData.put("acctNbr", MapUtils.getString(invoiceInfo, "acctNbr", ""));
		String str = MapUtils.getString(invoiceInfo, "billingCycleId", "");
		if(str.length()>=6){
			str = str.substring(0,6);
		}
		printData.put("billingCycleId",str);
//		Previous_Change	3	Integer32	Y	上次零头（单位：分）
//		Current_Change	3	Integer32	Y	本次零头（单位：分）
//		Balance	3	Integer32	Y	本次余额（单位：分）
//		Payment_Amount	3	Integer32	Y	缴费金额（单位：分）
//		Should_Charge	3	Integer32	Y	应收金额（单位：分）

		String previousChange = MapUtils.getString(invoiceInfo, "previousChange", "0");
		
		if(StringUtils.isNotEmpty(previousChange)){
			previousChange = NumUtil.formatNumber(Double.parseDouble(previousChange), 100, 2);
		}
		
		printData.put("previousChange", previousChange);
		
		
		printData.put("paymentSerialNbr", MapUtils.getString(invoiceInfo, "paymentSerialNbr", ""));
		
		
		String currentChange = MapUtils.getString(invoiceInfo, "currentChange", "0");
		if(StringUtils.isNotEmpty(currentChange)){
			currentChange = NumUtil.formatNumber(Double.parseDouble(currentChange), 100, 2);
		}
		printData.put("currentChange",currentChange);
		
		
		
		String balance = MapUtils.getString(invoiceInfo, "balance", "0");
		if(StringUtils.isNotEmpty(balance)){
			balance = NumUtil.formatNumber(Double.parseDouble(balance), 100, 2);
		}
		printData.put("balance",balance);
		
		
		
		String paymentAmount = MapUtils.getString(invoiceInfo, "paymentAmount", "0");
		if(StringUtils.isNotEmpty(paymentAmount)){
			paymentAmount = NumUtil.formatNumber(Double.parseDouble(paymentAmount), 100, 2);
		}
		printData.put("paymentAmount",paymentAmount);
		
		
		String shouldCharge = MapUtils.getString(invoiceInfo, "shouldCharge", "0");
		if(StringUtils.isNotEmpty(shouldCharge)){
			shouldCharge = NumUtil.formatNumber(Double.parseDouble(shouldCharge), 100, 2);
		}
		printData.put("shouldCharge",shouldCharge);
		
		
		//printData.put("shouldCharge", MapUtils.getString(invoiceInfo, "shouldCharge", ""));
		printData.put("chargeItems",  chargeItems);
		printData.put("payMethod", MapUtils.getString(paramMap, "payMethod", ""));
		printData.put("sumCharge", sumCharge);
		printData.put("sumChargeRMB", MapUtils.getString(invoiceInfo, "accountUpper", ""));
		printData.put("staffName", sessionStaff.getStaffName());
		printData.put("staffNumber", sessionStaff.getStaffCode());
		printData.put("channelNumber", sessionStaff.getCurrentChannelId());
		printData.put("channelName", sessionStaff.getCurrentChannelName());
		
		
		//如果printData为空，则返回失败
		if (MapUtils.isEmpty(printData)) {
			return printData;
		}

		// 3. 数据驱动模板、展示打印页面
		runInvoicePrint(printData, response, printType, templateInfoMap);

		return printData;
	}
	
}
