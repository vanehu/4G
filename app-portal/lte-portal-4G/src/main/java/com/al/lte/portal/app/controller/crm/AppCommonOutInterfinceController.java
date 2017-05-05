package com.al.lte.portal.app.controller.crm;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.xml.XMLSerializer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.SysConstant;

/**
 * app统一对外接口，排除session拦截、拦截器等
 * 
 * @author yanghm
 * 
 */
@Controller("com.al.lte.portal.app.controller.crm.AppCommonOutInterfinceController")
@RequestMapping("/appInterfince/*")
public class AppCommonOutInterfinceController extends BaseController{
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;

	/**
	 * 支付平台成功通知app
	 * 
	 * @param param
	 * @param request
	 * @param response
	 * @return
	 * @throws IOException
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@ResponseBody
	@RequestMapping(value = "pay/chargeNotice", method = RequestMethod.POST)
	public String chargeNotice(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String http=request.getScheme();
		Map<String, Object> resultMsg = new HashMap<String, Object>();
		String rwtMsg = "";
		if("https".equals(http)){//不允许https访问
			resultMsg.put("success", "false"); // true:成功，false:失败
			resultMsg.put("data", "只能http访问！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}
		BufferedReader bufferReader = request.getReader();// 获取头部参数信息
		StringBuffer buffer = new StringBuffer();
		String line = " ";
		while ((line = bufferReader.readLine()) != null) {
			buffer.append(line);
		}
		String postData = buffer.toString();
		XMLSerializer xmlSerializer = new XMLSerializer();
		postData = xmlSerializer.read(postData).toString();
		JSONObject jasonObject = JSONObject.fromObject(postData);
		Map<String, Object> param = new HashMap<String, Object>();
		param = (Map<String, Object>) jasonObject;
		if (param.get("sign") == null || "".equals(param.get("sign"))) {// 参数为空校验
			resultMsg.put("success", "false"); // true:成功，false:失败
			resultMsg.put("data", "签名串为空！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}
		if (param.get("olId") == null || "".equals(param.get("olId").toString())) {// 参数为空校验
			resultMsg.put("success", "false"); // true:成功，false:失败
			resultMsg.put("data", "购物车id为空！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}
		if (param.get("payMethodCd") == null || "".equals(param.get("payMethodCd").toString())) {
			resultMsg.put("success", "false"); // true:成功，false:失败
			resultMsg.put("data", "支付方式为空！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}
		if (param.get("payAmount") == null || "".equals(param.get("payAmount").toString())) {
			resultMsg.put("success", "false"); // true:成功，false:失败
			resultMsg.put("data", "收费金额为空！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}
		//将olId、支付方式和收费金额存入redis，表示支付成功
		RedisUtil.set("app_status_"+param.get("olId").toString(), "0");
		RedisUtil.set("app_payCode_"+param.get("olId").toString(), param.get("payMethodCd").toString());
		RedisUtil.set("app_payAmount_"+param.get("olId").toString(), param.get("payAmount").toString());
		// 签名校验
		String signKey = param.get("olId") + "1000000244";
		String sign = AESUtils.getMD5Str(signKey);
		if (!sign.equals(param.get("sign"))) {
			resultMsg.put("success", "false"); // true:成功，false:失败
			resultMsg.put("data", "签名不一致！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}		
		if (param.get("areaId") == null || "".equals(param.get("areaId").toString())) {
			resultMsg.put("success", "false"); // true:成功，false:失败
			resultMsg.put("data", "地区id为空！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}
		if (param.get("chargeItems") == null || "".equals(param.get("chargeItems").toString())) {
			resultMsg.put("success", "true"); // true:成功，false:失败
			resultMsg.put("data", "费用项为空！");
			rwtMsg = JsonUtil.toString(resultMsg);
			return rwtMsg;
		}
		List<Map> chargeItems=new ArrayList();
		Map<String, Object> rMap = null;
		chargeItems=(List) param.get("chargeItems");
		if(chargeItems.size()>0){
			if(chargeItems.get(0).get("acctItemId")!=null){//用于判断费用项是否为空
				for(Map<String, Object> map:chargeItems){
					map.put("payMethodCd", param.get("payMethodCd").toString());
					String objInstId=map.get("objInstId").toString();//将[]转为""
					String posSeriaNbr=map.get("posSeriaNbr").toString();
					String prodId=map.get("prodId").toString();
					String remark=map.get("remark").toString();
					String terminalNo=map.get("terminalNo").toString();
					if("[]".equals(objInstId)){
						map.put("objInstId", "");
					}
					if("[]".equals(posSeriaNbr)){
						map.put("posSeriaNbr", "");
					}
					if("[]".equals(prodId)){
						map.put("prodId", "");
					}
					if("[]".equals(remark)){
						map.put("remark", "");
					}
					if("[]".equals(terminalNo)){
						map.put("terminalNo", "");
					}
				}
			}else{
				JSONArray jsonarray=new JSONArray();
				param.put("chargeItems", jsonarray);//空费用项
			}
			if(chargeItems.get(0).get("soNbr")!=null){
				String soNbr=chargeItems.get(0).get("soNbr").toString();
				param.put("soNbr", soNbr);
				try {
					//添加app标志
					request.getSession().setAttribute(SysConstant.SESSION_KEY_APP_FLAG,"1");
					rMap = orderBmo.chargeSubmit(param, null, null);
					if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
						resultMsg.put("success", "true"); // true:成功，false:失败
						resultMsg.put("data", "调用收费接口成功，收费完成！"); // 返回信息0成功，1失败
						rwtMsg = JsonUtil.toString(resultMsg);
						return rwtMsg;
					} else {
						resultMsg.put("success", "true"); // true:成功，false:失败
						resultMsg.put("data", "调用收费接口成功，收费失败！");
						rwtMsg = JsonUtil.toString(resultMsg);
						return rwtMsg;
					}
					
				} catch (Exception e) {
					resultMsg.put("success", "true"); // true:成功，false:失败
					resultMsg.put("data", "请求失败，下计费接口出错！"); // 返回信息0成功，1失败
					rwtMsg = JsonUtil.toString(resultMsg);
					return rwtMsg;
				}
			}else{
				resultMsg.put("success", "true"); // true:成功，false:失败
				resultMsg.put("data", "请求参数不完整，soNbr为空！"); // 返回信息0成功，1失败
				rwtMsg = JsonUtil.toString(resultMsg);
				return rwtMsg;
			}
		}
		resultMsg.put("success", "true"); // true:成功，false:失败
		resultMsg.put("data", "请求参数不完整，chargeItems为空！"); 
		rwtMsg = JsonUtil.toString(resultMsg);
		return rwtMsg;
	}

}
