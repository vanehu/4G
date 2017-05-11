package com.al.lte.portal.app.controller.crm;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.xml.XMLSerializer;

import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.Des33;
import com.al.lte.portal.common.HTTPUtil;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

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
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;

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
	
	/**
	 * 手机客户端-人证照片比对
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
//	@RequestMapping(value = "/pic/verify", method = RequestMethod.POST)
//	public @ResponseBody JsonResponse verify(@RequestBody Map<String, Object> reqMap, String optFlowNum,
//			HttpServletResponse response,HttpServletRequest request){
//		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
//                SysConstant.SESSION_KEY_LOGIN_STAFF);
//		JsonResponse jsonResponse = null;
//		Map<String, Object> rMap = null;
//		String areaid = sessionStaff.getAreaId();//区
//			try {
////				System.out.println("++++++++++++reqMap="+JsonUtil.toString(reqMap));
//				rMap = custBmo.verify(reqMap, optFlowNum, sessionStaff);
////	 			log.debug("return={}", JsonUtil.toString(rMap));
//	 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
//	 				jsonResponse = super.successed(rMap,
//	 						ResultConstant.SUCCESS.getCode());
//	 			} else {
//	 				jsonResponse = super.failed(rMap,
//	 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
//	 			}
////				DataBus db = InterfaceClient.callService(reqMap, PortalServiceCode.BORAD_BAND_QUERYCHARGECONFIG,optFlowNum, sessionStaff);
//	        }  catch (BusinessException be) {
//				this.log.error("人证比对查询失败", be);
//				return super.failed(be);
//			} catch (InterfaceException ie) {
//				return super.failed(ie, reqMap, ErrorCode.PIC_VERIFY);
//			} catch (Exception e) {
//				log.error("人证比对查询失败", e);
//				return super.failed(ErrorCode.PIC_VERIFY, e, reqMap);
//			}
//			return jsonResponse;
//	}
	
	/**
	 * 工号菜单权限查询
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@AuthorityValid(isCheck = false)
	@RequestMapping(value = "/queryMenu", method = RequestMethod.POST)
	public @ResponseBody JSONObject queryMenu(HttpServletResponse response,HttpServletRequest request){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = sessionStaff.getCurrentAreaId();
		String staffCode = sessionStaff.getStaffCode();
		String sysCode = "111";
		Map<String, Object> rMap = new HashMap<String, Object>();
		rMap.put("resultCode", "0");
		rMap.put("resultMsg", "");
		JSONObject jo = null;
		Map<String, Object> staffList = new HashMap<String, Object>();
		String randomCode = DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(4);
			try {
				String encodeRandom = Des33.encode(randomCode,"6091aab92a16a0808d5243221167ffee6091aab92a16a080");//加密随机数
				System.out.println(encodeRandom);
				encodeRandom = encodeRandom.replaceAll("\\+", "plus");
//				System.out.println(encodeRandom);
//				encodeRandom = encodeRandom.replaceAll("plus", "\\+");
//				System.out.println(encodeRandom);
//				String aa = Des33.decode1(encodeRandom, "6091aab92a16a0808d5243221167ffee6091aab92a16a080");//加密随机数
//				System.out.println(aa);
				RedisUtil.set(randomCode, staffList);
				HTTPUtil httpClient = new HTTPUtil();
				String result = httpClient.doPost("http://10.6.10.86:8080/yxs_service/random?msg="+encodeRandom, encodeRandom);
//				System.out.println(result);
	        }  catch (Exception e) {
				log.error("随机码发送失败", e);
				rMap.put("resultCode", "1");
				rMap.put("resultMsg", "随机码发送失败");
				jo = JSONObject.fromObject(rMap);
				return jo;
			}
			jo = JSONObject.fromObject(rMap);
			return jo;
	}
	
	/**
	 * 跳转到省份页面
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@AuthorityValid(isCheck = false)
	@RequestMapping(value = "/goProvPage", method = RequestMethod.POST)
	public @ResponseBody JSONObject goProvPage(@RequestBody Map<String, Object> reqMap,HttpServletResponse response,HttpServletRequest request){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> menu_cfg = MDA.PROVENCE_MENU.get("PROVENCE_MENU_"+(sessionStaff.getAreaId() + "").substring(0, 3));
		Map<String, Object> custInfo = new HashMap<String, Object>();
		if(reqMap!=null){
			custInfo.put("custName", reqMap.get("partyName"));
			custInfo.put("certAddress", reqMap.get("addressStr"));
			custInfo.put("certNumber", reqMap.get("idCardNumber"));
			custInfo.put("certType", reqMap.get("identityCd"));
			custInfo.put("custId", reqMap.get("custId"));
			custInfo.put("custType", reqMap.get("custFlag"));
			
		}
//		custInfo.put("custName", "张三");
//		custInfo.put("certAddress", "福建省福州市鼓楼区");
//		custInfo.put("certNumber", "350321201704241234");
//		custInfo.put("certType", "1");
//		custInfo.put("custId", "123456789");
//		custInfo.put("custType", "1100");
		
		Map<String, Object> busiDetail = new HashMap<String, Object>();
		busiDetail.put("menuId", reqMap.get("menuId"));
		busiDetail.put("menuName", reqMap.get("menuName"));
		busiDetail.put("stafflId", sessionStaff.getStaffId());
		String msg = "";
		JSONObject jo = new JSONObject();
		jo.put("resultCode", "0");
		jo.put("resultMsg", "");
		JSONObject req = new JSONObject();
		req.put("token", RedisUtil.get(sessionStaff.getStaffId()));
		req.put("busiDetail", busiDetail);
		req.put("custInfo", custInfo);
			try {
				msg = Des33.encode(req.toString(),(String) menu_cfg.get("secretKey"));//加密随机数
				System.out.println("token:"+req+"----msg:"+msg);
				msg = msg.replaceAll("\\+", "plus");
//				HTTPUtil httpClient = new HTTPUtil();
//				String result = httpClient.doPost("http://10.6.10.86:8080/yxs_service/service/gotoPage?msg="+msg, msg);
//				System.out.println(result);
	        }  catch (Exception e) {
				log.error("跳转到省份页面失败", e);
				jo.put("resultCode", "1");
				jo.put("resultMsg", "跳转到省份页面失败");
				return jo;
			}
			jo.put("msg", msg);
			return jo;
	}
	
	/**
	 * 生成随机数关联登录的员工信息
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@AuthorityValid(isCheck = false)
	@RequestMapping(value = "/randomStaffMsg", method = RequestMethod.POST)
	public @ResponseBody JSONObject randomStaffMsg(HttpServletResponse response,HttpServletRequest request){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> menu_cfg = MDA.PROVENCE_MENU.get("PROVENCE_MENU_"+(sessionStaff.getAreaId() + "").substring(0, 3));
		String chnNbr = "";
		HttpSession session = request.getSession();
		List<Map> channelList = (List<Map>)session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
		for(int i=0;i<channelList.size();i++){
			Map cl = channelList.get(i);
			if(sessionStaff.getCurrentChannelId().equals(cl.get("id").toString())){
				chnNbr = cl.get("chnNbr").toString();
			}
		}
		Map<String, Object> rMap = new HashMap<String, Object>();
		rMap.put("resultCode", "0");
		rMap.put("resultMsg", "");
		JSONObject jo = null;
		Map<String, Object> staffList = new HashMap<String, Object>();
		String randomCode = DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(4);
			try {
				staffList.put("stafflId", sessionStaff.getStaffId());//sessionStaff.getStaffId()
				staffList.put("stafflCode", sessionStaff.getStaffCode());//sessionStaff.getStaffCode()
				staffList.put("channelId", sessionStaff.getCurrentChannelId());
				staffList.put("areaId", sessionStaff.getAreaId());
				staffList.put("chnNbr", chnNbr);
				String encodeRandom = Des33.encode(randomCode,(String) menu_cfg.get("secretKey"));//加密随机数
				System.out.println(encodeRandom);
				encodeRandom = encodeRandom.replaceAll("\\+", "plus");
				rMap.put("encodeRandom", encodeRandom);
				rMap.put("serverAddress", (String) menu_cfg.get("serverAddress"));
//				System.out.println(encodeRandom);
//				encodeRandom = encodeRandom.replaceAll("plus", "\\+");
				System.out.println("随机数："+randomCode+"——》"+encodeRandom);
//				String aa = Des33.decode1(encodeRandom, (String) menu_cfg.get("secretKey"));//加密随机数
//				System.out.println(aa);
				RedisUtil.set(randomCode, staffList);
//				HTTPUtil httpClient = new HTTPUtil();
//				String result = httpClient.doPost("http://123.150.141.129:8905/yxs_service/service/random?msg="+encodeRandom, encodeRandom);
//				System.out.println(result);
	        }  catch (Exception e) {
				log.error("随机码发送失败", e);
				rMap.put("resultCode", "1");
				rMap.put("resultMsg", "随机码发送失败");
				jo = JSONObject.fromObject(rMap);
				return jo;
			}
			jo = JSONObject.fromObject(rMap);
			return jo;
	}
	
	/**
	 * 根据随机数获取员工信息与令牌
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@AuthorityValid(isCheck = false)
	@RequestMapping(value = "/getStaffMsg", method = RequestMethod.POST)
	public @ResponseBody JSONObject getStaffMsg(@RequestBody String msgstr,HttpServletResponse response,HttpServletRequest request){
//		response.setHeader("Access-Control-Allow-Origin", "*");
		JSONObject jo = null;
		Map<String, Object> rMap = new HashMap<String, Object>();
		Map<String, Object> param = new HashMap<String, Object>();
		Map<String, Object> staffList = new HashMap<String, Object>();
		String msg = "";
		String areaId = "";
		if(msgstr!=null){
			String msgList[] = msgstr.split("areaId");
			if(msgList.length==2){
				msg = msgList[0];
				areaId = msgList[1];
			}
		}
		Map<String, Object> menu_cfg = MDA.PROVENCE_MENU.get("PROVENCE_MENU_"+(areaId + "").substring(0, 3));
			try {
//				System.out.println("++++++++++++reqMap="+JsonUtil.toString(reqMap));
//				rMap = custBmo.verify(reqMap, optFlowNum, sessionStaff);
//	 			log.debug("return={}", JsonUtil.toString(rMap));
				if(msg==null || msg.length()==0 | menu_cfg==null){
//					msg = "9PRo8gE3P0Flmw3AWE+jJoMXO4sUqRHv";
					rMap.put("resultCode", "1");
					rMap.put("resultMsg", "获取随机码失败");
					jo = JSONObject.fromObject(rMap);
					return jo;
				}
//				System.out.println(msg);
				msg = msg.replaceAll("plus", "\\+");
				String aa = Des33.decode1(msg, (String) menu_cfg.get("secretKey"));//加密随机数
				param = JSONObject.fromObject(aa);
				String randomCode = param.get("randomCode").toString();
				String appId = param.get("appId").toString();
				String appSecret = param.get("appSecret").toString();
//				staffList.put("stafflId", "22334455");//sessionStaff.getStaffId()
//				staffList.put("stafflCode", "100000036");//sessionStaff.getStaffCode()
//				staffList.put("channelId", "111111");//sessionStaff.getChannelId()
//				staffList.put("areaId", "8410000");//sessionStaff.getAreaId()
				staffList = (Map<String, Object>) RedisUtil.get(randomCode);
				if(staffList==null){
					rMap.put("resultCode", "1");
					rMap.put("resultMsg", "获取登陆信息失败");
					jo = JSONObject.fromObject(rMap);
					return jo;
				}
				String token = UIDGenerator.getUIDByTime();
				rMap.put("staffList", staffList);
				rMap.put("token", token);
				rMap.put("resultCode", "0");
				rMap.put("resultMsg", "");
				RedisUtil.set(staffList.get("stafflId").toString(), rMap.get("token"));
				jo = JSONObject.fromObject(rMap);
				System.out.println("随机数："+randomCode+"--------token："+token);
	        }  catch (Exception e) {
				log.error("数获取员工信息与令牌失败", e);
				rMap.put("resultCode", "1");
				rMap.put("resultMsg", "数获取员工信息与令牌失败");
				jo = JSONObject.fromObject(rMap);
				return jo;
						//super.failed(ErrorCode.QUERY_STAFF_INFO, e, reqMap);
			}
			return jo;
	}

}
