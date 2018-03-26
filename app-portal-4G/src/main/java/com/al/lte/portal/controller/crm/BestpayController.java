package com.al.lte.portal.controller.crm;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.common.utils.DateUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.BestpayClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.controller.crm.BestpayController")
@RequestMapping("/bestpay/*")
public class BestpayController extends BaseController {
/*	private static final String MERCHANT_ID = "01440109025345000";
	private static final String KEY = "23CB477D755315A3AE8D5E5559A41CAD93D85C807D295351";
	private static final String COMM_PWD = "453383";*/

	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
    private OrderBmo orderBmo;
	
	/**
	 * 
	 * 
	 * @param model
	 * @param session
	 * @param flowNum
	 * @return
	 * @throws AuthorityException
	 */
	@RequestMapping(value = "/test", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(Model model, HttpSession session, @LogOperatorAnn String flowNum) throws AuthorityException {
		Date d = new Date();
		String date = DateFormatUtils.format(d, "yyyyMMdd");
		String dateTime = DateFormatUtils.format(d, "yyyyMMddHHmmss");
		String dateTimeMS = DateFormatUtils.format(d, "yyyyMMddHHmmssSSS");
		String serviceSerial = DateFormatUtils.format(d, "yyyyMMddHHmmssSSS") + RandomStringUtils.randomNumeric(6);
		
		model.addAttribute("date", date);
		model.addAttribute("dateTime", dateTime);
		model.addAttribute("dateTimeMS", dateTimeMS);
		model.addAttribute("serviceSerial", serviceSerial);
		model.addAttribute("pageType", "detail");
		
		return "/bestpay/bestpay-test";
	}
	
	@RequestMapping(value = "/placeOrder", method = RequestMethod.POST)
	@ResponseBody
    public JsonResponse placeOrder(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum) throws Exception {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String dbKeyWord = sessionStaff == null ? null : sessionStaff.getDbKeyWord();
    	String channelId = sessionStaff.getCurrentChannelId();
    	String provinceCode=sessionStaff.getAreaId();
    	String province=provinceCode.substring(0, 3) + "0000";
    	String flags=MDA.EPAY_MERCHANT.get("EPAYMER_"+province);
    	String MERCHANT_ID = flags.split(",")[0];
    	String KEY = flags.split(",")[1];
    	Date d = new Date();
    	String dateTime = DateFormatUtils.format(d, "yyyyMMddHHmmss");
//		String orderReqNo = DateFormatUtils.format(d, "yyyyMMddHHmmssSSS") + RandomStringUtils.randomNumeric(6);
		param.put("dbKeyWord", dbKeyWord);
        param.put("merchantId", MERCHANT_ID);
        param.put("subMerchantId", "");
//        param.put("barcode", "130232698311484609");
//        param.put("orderNo", "1433734609522");
//        param.put("orderReqNo", orderReqNo);
        param.put("channel", "05");
        param.put("busiType", "0001");
        param.put("orderDate", dateTime);
//        param.put("orderAmt", "1");
//        param.put("productAmt", "1");
//        param.put("attachAmt", "0");
        param.put("goodsName", "");
        param.put("storeId", channelId);
        param.put("backUrl", "");
        param.put("ledgerDetail", "");
        param.put("attach", "");
        param.put("key", KEY);
        
        Map<String, Object> resultMap = BestpayClient.placeOrder(param);
        if(resultMap == null) {
        	Date d1 = new Date();
    		String date = DateFormatUtils.format(d1, "yyyyMMdd");
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("orderNo",param.get("orderNo") );
			dataMap.put("orderReqNo",param.get("orderReqNo"));
			dataMap.put("merchantId", MERCHANT_ID);
			dataMap.put("orderDate", date);
			dataMap.put("key", KEY);
			resultMap = BestpayClient.queryOrder(dataMap);
		}
		JsonResponse jsonResponse = super.successed(resultMap, ResultConstant.SUCCESS.getCode());
		return jsonResponse;
    }

	@RequestMapping(value = "/orderHistory", method = RequestMethod.GET)
    public String orderHistory(Model model, @LogOperatorAnn String flowNum) throws AuthorityException {
        String date = DateUtil.getNow("yyyy-MM-dd");
        model.addAttribute("p_date", date);
        return "/bestPay/pay-order-query";
    }

    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/list", method = RequestMethod.POST)
    public String queryOrderList(Model model, @RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum) {
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils
    				.getSessionAttribute(super.getRequest(),
    						SysConstant.SESSION_KEY_LOGIN_STAFF);
        	String provinceCode=sessionStaff.getAreaId();
        	String province=provinceCode.substring(0, 3) + "0000";
        	String flags=MDA.EPAY_MERCHANT.get("EPAYMER_"+province);
        	String MERCHANT_ID = flags.split(",")[0];
        	String KEY = flags.split(",")[1];
            String orderNo = MapUtils.getString(param, "orderNo");
            String orderReqNo = MapUtils.getString(param, "orderReqNo");
            String orderDate = MapUtils.getString(param, "orderDate");
            if (StringUtils.isBlank(orderNo)) {
                orderNo = orderReqNo;
            }
            if (StringUtils.isBlank(orderDate) || !DateUtil.isRightDate(orderDate, "yyyyMMdd")) {
                orderDate = DateUtil.getNow("yyyyMMdd");
            }

            String page = MapUtils.getString(param, "curPage");
            String size = MapUtils.getString(param, "pageSize");
            int curPage = StringUtils.isNumeric(page) ? Integer.parseInt(page) : 1;
            int pageSize = StringUtils.isNumeric(size) ? Integer.parseInt(size) : 10;

            Map<String, Object> params = new HashMap<String, Object>();
            params.put("merchantId", MERCHANT_ID);
            params.put("orderNo", orderNo);
            params.put("orderReqNo", orderReqNo);
            params.put("orderDate", orderDate);
            params.put("key", KEY);
            Map<String, Object> resultMap = BestpayClient.queryOrder(params);
            List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
            if (MapUtils.getBoolean(resultMap, "success", false)) {
                Map<String, Object> result = null;
                Object object = resultMap.get("result");
                if (object instanceof List) {
                    list = (List<Map<String, Object>>) object;
                }
                if (object instanceof Map) {
                    result = (Map<String, Object>) object;
                    list.add(result);
                }
                model.addAttribute("code", 0);
            } else {
                String msg = MapUtils.getString(resultMap, "errorMsg");
                model.addAttribute("code", 1);
                model.addAttribute("msg", msg);
            }
            int totalSize = list.size();
            PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(curPage, pageSize, totalSize < 1 ? 1
                    : totalSize, list);
            model.addAttribute("pageModel", pm);
        } catch (Exception e) {
            model.addAttribute("code", -1);
        }

        return "/bestPay/pay-order-list";
    }
	
	@RequestMapping(value = "/queryOrder", method = RequestMethod.POST)
	@ResponseBody
    public JsonResponse queryOrder(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum) throws Exception {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String provinceCode=sessionStaff.getAreaId();
    	String province=provinceCode.substring(0, 3) + "0000";
    	String flags=MDA.EPAY_MERCHANT.get("EPAYMER_"+province);
    	String MERCHANT_ID = flags.split(",")[0];
    	String KEY = flags.split(",")[1];
		Date date = new Date();
		String orderDate = DateFormatUtils.format(date, "yyyyMMdd");
		
        param.put("merchantId", MERCHANT_ID);
//        param.put("orderNo", "20150713093607");
//        param.put("orderReqNo", "20150713093607000001");
        param.put("orderDate", orderDate);
        param.put("key", KEY);
        
		Map<String, Object> resultMap = BestpayClient.queryOrder(param);
		JsonResponse jsonResponse = super.successed(resultMap, ResultConstant.SUCCESS.getCode());
		return jsonResponse;
    }
	
	@RequestMapping(value = "/commonRefund", method = RequestMethod.POST)
	@ResponseBody
    public JsonResponse commonRefund(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum) throws Exception {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String provinceCode=sessionStaff.getAreaId();
    	String province=provinceCode.substring(0, 3) + "0000";
    	String flags=MDA.EPAY_MERCHANT.get("EPAYMER_"+province);
    	String MERCHANT_ID = flags.split(",")[0];
    	String KEY = flags.split(",")[1];
    	String COMM_PWD = flags.split(",")[2];
		Date date = new Date();
		String refundReqDate = DateFormatUtils.format(date, "yyyyMMdd");
        String refundReqNo = DateFormatUtils.format(date, "yyyyMMddHHmmssSSS") + RandomStringUtils.randomNumeric(6);
        String orderId = MapUtils.getString(param, "orderId");
        String busiPayId = MapUtils.getString(param, "oldOrderNo");
        String amount = MapUtils.getString(param, "transAmt", "0");
        if (amount.startsWith("-")) {
            amount = StringUtils.stripStart(amount, "-");
        }
        if (StringUtils.contains(amount, ".")) {
            amount = "" + new BigDecimal(amount).multiply(new BigDecimal(100)).intValue();
        }

        Map<String, Object> inParam = new HashMap<String, Object>();
        inParam.put("busiOrderId", orderId);
        inParam.put("payOrderId", refundReqNo);
        inParam.put("amount", amount);
        inParam.put("payType", "2");
        inParam.put("bindId", MERCHANT_ID);
        inParam.put("payPlat", "2");
        inParam.put("busiPayId", busiPayId);
        Map<String, Object> map = orderBmo.savePayRecords(inParam, flowNum, sessionStaff);
        log.info("save return={}", JsonUtil.toString(map));

        param.put("transAmt", amount);
        param.put("merchantId", MERCHANT_ID);
        param.put("subMerchantId", "");
        param.put("merchantPwd", COMM_PWD);
//        param.put("oldOrderNo", "1533734609531");
//        param.put("oldOrderReqNo", "15337346095231");
        param.put("refundReqNo", refundReqNo);
        param.put("refundReqDate", refundReqDate);
//        param.put("transAmt", "1");
        param.put("ledgerDetail", "");
        param.put("channel", "05");
        param.put("key", KEY);
		
		Map<String, Object> resultMap = BestpayClient.commonRefund(param);
		String result = resultMap.get("success").toString();
        String resultCode = "true".equals(result) ? "0" : "1";
        String resultMsg = resultMap.get("errorCode") + ":" + resultMap.get("errorMsg");
        inParam.clear();
        inParam.put("busiOrderId", orderId);
        inParam.put("payType", "2");
        inParam.put("payResult", resultCode);
        inParam.put("remark", resultMsg);
        Map<String, Object> rMap = orderBmo.updatePayRecords(inParam, flowNum, sessionStaff);
        log.info("update return={}", JsonUtil.toString(rMap));
		JsonResponse jsonResponse = super.successed(resultMap, ResultConstant.SUCCESS.getCode());
		return jsonResponse;
    }
	
	@RequestMapping(value = "/reverse", method = RequestMethod.POST)
	@ResponseBody
    public JsonResponse reverse(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum) throws Exception {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String provinceCode=sessionStaff.getAreaId();
    	String province=provinceCode.substring(0, 3) + "0000";
    	String flags=MDA.EPAY_MERCHANT.get("EPAYMER_"+province);
    	String MERCHANT_ID = flags.split(",")[0];
    	String KEY = flags.split(",")[1];
    	String COMM_PWD = flags.split(",")[2];
		Date d = new Date();
		String date = DateFormatUtils.format(d, "yyyyMMdd");
        String refundReqNo = DateFormatUtils.format(d, "yyyyMMddHHmmssSSS") + RandomStringUtils.randomNumeric(6);
        
        param.put("merchantId", MERCHANT_ID);
        param.put("subMerchantId", "");
        param.put("merchantPwd", COMM_PWD);
//        param.put("oldOrderNo", "1533734609531");
//        param.put("oldOrderReqNo", "15337346095231");
        param.put("refundReqNo", refundReqNo);
        param.put("refundReqDate", date);
//        param.put("transAmt", "1");
        param.put("channel", "05");
        param.put("key", KEY);
		
		Map<String, Object> resultMap = BestpayClient.reverse(param);
		JsonResponse jsonResponse = super.successed(resultMap, ResultConstant.SUCCESS.getCode());
		return jsonResponse;
    }

}
