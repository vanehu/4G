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
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.AESUtil;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.Des33;
import com.al.lte.portal.common.HTTPUtil;
import com.al.lte.portal.common.ImgReSIze;
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
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	private String  PROV_MENU_CONST="PROVENCE_MENU_";
	
	private String AREA_ID="areaId";
	
	private String CHARGE_ITEMS="chargeItems";
	
	private String FALSE="false";
	
	private String PAY_MOUNT="payAmount";
	
	private String PAY_METHODCD="payMethodCd";
	
	private String RESULT_CODE="resultCode";
	
	private String RESULT_MSG="resultMsg";
	
	private String SECRET_KEY="secretKey";
	
	private String SO_NBR="soNbr";
	
	private String STAFF_ID="stafflId";
	
	private String SUCCESS="success";
	
	private String TOKEN="token";
	
	private String FAIL_MSG="随机码发送失败";

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
			resultMsg.put(SUCCESS, FALSE); // true:成功，false:失败
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
		resultMsg=checkChargeParam(param,resultMsg);
		if(!"0".equals(resultMsg.get("data"))){//校验不通过
			return JsonUtil.toString(resultMsg);
		}
		List<Map> chargeItems;
		chargeItems=(List) param.get(CHARGE_ITEMS);
		if(!chargeItems.isEmpty()){
			if (chargeItems.get(0).get("acctItemId") != null) {// 用于判断费用项是否为空
				chargeItems=transChargeItems(chargeItems, param);
				param.put(CHARGE_ITEMS, chargeItems);// 重设费用项
			}else {
				JSONArray jsonarray = new JSONArray();
				param.put(CHARGE_ITEMS, jsonarray);// 空费用项
			}
			resultMsg=chargeSubmit(request,chargeItems,param,resultMsg);
			return JsonUtil.toString(resultMsg);
		}
		resultMsg.put(SUCCESS, "true"); // true:成功，false:失败
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
	@RequestMapping(value = "/pic/verify", method = RequestMethod.POST)
	public @ResponseBody JsonResponse verify(@RequestBody Map<String, Object> param, String optFlowNum,
			HttpServletResponse response,HttpServletRequest request){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object> rMap = new HashMap<String, Object>();
		Map<String, Object> reqMap = new HashMap<String, Object>();
		String imageBest = (String) param.get("image_best");
		System.out.println("++++++人证比对壳子入参"+JsonUtil.toString(param));
		param.remove("image_best");
		param.put("channel_type", sessionStaff.getCurrentChannelType());
		param.put("channel_nbr", sessionStaff.getCurrentChannelId());
		param.put("staff_code", sessionStaff.getStaffCode());
		param.put("busi_type", "1");
		param.put("area_id", sessionStaff.getCurrentAreaId());
		param.put("province_code", sessionStaff.getCurrentAreaId().substring(0, 3)+"0000");
		System.out.println("++++++人证比对入参params"+JsonUtil.toString(param));
//		String areaid = sessionStaff.getAreaId();//区
			try {
//				String imgsrc = request.getRealPath("/resources/soFile/")+"orgimageBest.jpg";
//				String imgdist = request.getRealPath("/resources/soFile/")+"newimageBest.jpg";
//				imageBest = ImgReSIze.reSizeImg(imgsrc, imageBest, imgdist, 1000, 1000, 1f);
				Map<String, Object> SvcCont = new HashMap<String, Object>();
				SvcCont.put("app_id",AESUtil.encryptToString(SysConstant.CSB_SRC_SYS_ID_APP, MDA.FACE_VERIFY_APP_ID_SECRET));
				System.out.println("++++++params对应的加密密钥"+MDA.FACE_VERIFY_PARAMS_SECRET);
				SvcCont.put("params", AESUtil.encryptToString(JsonUtil.toString(param),MDA.FACE_VERIFY_PARAMS_SECRET));
				SvcCont.put("image_best", imageBest.replaceAll("\n|\r", ""));
				Map<String, Object> TcpCont = new HashMap<String, Object>();
				TcpCont.put("Method", "auth.face.faceVerify");
				TcpCont.put("Sign", "123");
				TcpCont.put("Version", "V1.0");
				Map<String, Object> ContractRoot = new HashMap<String, Object>();
				ContractRoot.put("SvcCont", SvcCont);
				ContractRoot.put("TcpCont", TcpCont);
				reqMap.put("ContractRoot", ContractRoot);
				System.out.println("++++++人证比对入参ContractRoot="+JsonUtil.toString(reqMap));
				rMap = custBmo.verify(reqMap, optFlowNum, sessionStaff);
	 			log.debug("return={}", JsonUtil.toString(rMap));
	 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
	 				Map<String, Object> verify_cfg = MDA.PROV_AUTH_SWITH.get((sessionStaff.getAreaId() + "").substring(0, 3));
	 				Float FZ = Float.parseFloat((String) verify_cfg.get("FZ"));//相似度最低要求（阀值）
	 				Float XSD = Float.parseFloat(String.valueOf(rMap.get("confidence")));//相似度
					if(FZ>XSD){
						String QZSHQX = "1";// 是否有强制审核权限
						QZSHQX = staffBmo.checkOperatBySpecCd("QZSHQX", sessionStaff);
						rMap.put("fz", FZ);
						//相似度不足，且没有权限，返回失败
						if("0".equals(QZSHQX)){
							rMap.put("checkType", "4");
							jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
						}else{
							rMap.remove("result");
							rMap.put("code", "POR-2004");
							rMap.put("msg", "人证不符，人证相似度为"+XSD+"%，请重新拍照");
							jsonResponse = super.failed(rMap,ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
						}
					}else{
						rMap.put("checkType", "3");
						jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
					}
	 			} else {
	 				jsonResponse = super.failed(rMap,ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
	 			}
	        }  catch (BusinessException be) {
				this.log.error("人证比对查询失败", be);
				return super.failed(be);
			} catch (InterfaceException ie) {
				return super.failed(ie, param, ErrorCode.PIC_VERIFY);
			} catch (Exception e) {
				log.error("人证比对查询失败", e);
				return super.failed(ErrorCode.PIC_VERIFY, e, param);
			}
			return jsonResponse;
	}
	
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
		rMap.put(RESULT_CODE, "0");
		rMap.put(RESULT_MSG, "");
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
				log.error(FAIL_MSG, e);
				rMap.put(RESULT_CODE, "1");
				rMap.put(RESULT_MSG, FAIL_MSG);
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
		JSONObject jo = new JSONObject();
		String msg = "";
		try {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		System.out.println("++++++++sessionStaff.getAreaId():"+sessionStaff.getAreaId());
		Map<String, Object> menu_cfg = MDA.PROVENCE_MENU.get(PROV_MENU_CONST+(sessionStaff.getAreaId() + "").substring(0, 3));
		Map<String, Object> custInfo = new HashMap<String, Object>();
		if(reqMap!=null){
			custInfo.put("custName", reqMap.get("partyName"));
			custInfo.put("certAddress", reqMap.get("addressStr"));
			custInfo.put("certNumber", reqMap.get("idCardNumber"));
			custInfo.put("certType", reqMap.get("identityCd"));
			custInfo.put("custId", reqMap.get("custId"));
			custInfo.put("extCustId", reqMap.get("extCustId"));
			custInfo.put("custType", reqMap.get("custFlag"));
			
		}
		System.out.println("++++++++custInfo:"+JsonUtil.toString(custInfo));
//		custInfo.put("custName", "卢**");
//		custInfo.put("certAddress", "天津市南开区******");
//		custInfo.put("certNumber", "320882********3235");
//		custInfo.put("certType", "1");
//		custInfo.put("custId", "290000577732");
//		custInfo.put("custType", "1100");
//		custInfo.put("extCustId", "225004643985");
		
		Map<String, Object> busiDetail = new HashMap<String, Object>();
		busiDetail.put("menuId", reqMap.get("menuId"));
		busiDetail.put("menuName", reqMap.get("menuName"));
		busiDetail.put(STAFF_ID, sessionStaff.getStaffId());
		jo.put(RESULT_CODE, "0");
		jo.put(RESULT_MSG, "");
		JSONObject req = new JSONObject();
		req.put(TOKEN, RedisUtil.get(sessionStaff.getStaffId()));
		req.put("busiDetail", busiDetail);
		req.put("custInfo", custInfo);
		System.out.println("token:"+req+"----msg:"+msg);
		System.out.println("++++++++busiDetail:"+JsonUtil.toString(busiDetail));
		System.out.println("++++++++SECRET_KEY:"+(String) menu_cfg.get(SECRET_KEY));
				msg = Des33.encode(req.toString(),(String) menu_cfg.get(SECRET_KEY));//加密随机数
				msg = msg.replaceAll("\\+", "plus");
//				HTTPUtil httpClient = new HTTPUtil();
//				String result = httpClient.doPost("http://10.6.10.86:8080/yxs_service/service/gotoPage?msg="+msg, msg);
//				System.out.println(result);
	        }  catch (Exception e) {
	        	System.out.println("+++++++跳转到省份页面失败"+e.toString());
				log.error("跳转到省份页面失败", e);
				jo.put("Exception", e);
				jo.put(RESULT_CODE, "1");
				jo.put(RESULT_MSG, "跳转到省份页面失败");
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
		Map<String, Object> menu_cfg = MDA.PROVENCE_MENU.get(PROV_MENU_CONST+(sessionStaff.getAreaId() + "").substring(0, 3));
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
		rMap.put(RESULT_CODE, "0");
		rMap.put(RESULT_MSG, "");
		JSONObject jo = null;
		Map<String, Object> staffList = new HashMap<String, Object>();
		String randomCode = DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(4);
			try {
				staffList.put(STAFF_ID, sessionStaff.getStaffId());//sessionStaff.getStaffId()
				staffList.put("stafflCode", sessionStaff.getStaffCode());//sessionStaff.getStaffCode()
				staffList.put("channelId", sessionStaff.getCurrentChannelId());
				staffList.put(AREA_ID, sessionStaff.getAreaId());
				staffList.put("chnNbr", chnNbr);
				String encodeRandom = Des33.encode(randomCode,(String) menu_cfg.get(SECRET_KEY));//加密随机数
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
				log.error(FAIL_MSG, e);
				rMap.put(RESULT_CODE, "1");
				rMap.put(RESULT_MSG, FAIL_MSG);
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
			String msgList[] = msgstr.split(AREA_ID);
			if(msgList.length==2){
				msg = msgList[0];
				areaId = msgList[1];
			}
		}
		Map<String, Object> menu_cfg = MDA.PROVENCE_MENU.get(PROV_MENU_CONST+(areaId + "").substring(0, 3));
			try {
//				System.out.println("++++++++++++reqMap="+JsonUtil.toString(reqMap));
//				rMap = custBmo.verify(reqMap, optFlowNum, sessionStaff);
//	 			log.debug("return={}", JsonUtil.toString(rMap));
				if(msg==null || msg.length()==0 || menu_cfg==null){
//					msg = "9PRo8gE3P0Flmw3AWE+jJoMXO4sUqRHv";
					rMap.put(RESULT_CODE, "1");
					rMap.put(RESULT_MSG, "获取随机码失败");
					jo = JSONObject.fromObject(rMap);
					return jo;
				}
//				System.out.println(msg);
				msg = msg.replaceAll("plus", "\\+");
				String aa = Des33.decode1(msg, (String) menu_cfg.get(SECRET_KEY));//加密随机数
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
					rMap.put(RESULT_CODE, "1");
					rMap.put(RESULT_MSG, "获取登陆信息失败");
					jo = JSONObject.fromObject(rMap);
					return jo;
				}
				String token = UIDGenerator.getUIDByTime();
				rMap.put("staffList", staffList);
				rMap.put(TOKEN, token);
				rMap.put(RESULT_CODE, "0");
				rMap.put(RESULT_MSG, "");
				RedisUtil.set(staffList.get(STAFF_ID).toString(), rMap.get(TOKEN));
				jo = JSONObject.fromObject(rMap);
				System.out.println("随机数："+randomCode+"--------token："+token);
	        }  catch (Exception e) {
				log.error("获取员工信息与令牌失败", e);
				rMap.put(RESULT_CODE, "1");
				rMap.put(RESULT_MSG, "获取员工信息与令牌失败");
				jo = JSONObject.fromObject(rMap);
				return jo;
						//super.failed(ErrorCode.QUERY_STAFF_INFO, e, reqMap);
			}
			return jo;
	}
	
	 /**
	 * 支付回调参数校验
	 * @return
	 */
	private Map<String, Object> checkChargeParam(Map<String, Object> param,Map<String, Object> resultMsg) {
		if (param.get("sign") == null || "".equals(param.get("sign"))) {// 参数为空校验
			resultMsg.put(SUCCESS, FALSE); // true:成功，false:失败
			resultMsg.put("data", "签名串为空！");
			return resultMsg;
		}
		if (param.get("olId") == null || "".equals(param.get("olId").toString())) {// 参数为空校验
			resultMsg.put(SUCCESS, FALSE); // true:成功，false:失败
			resultMsg.put("data", "购物车id为空！");
			return resultMsg;
		}
		if (param.get(PAY_METHODCD) == null || "".equals(param.get(PAY_METHODCD).toString())) {
			resultMsg.put(SUCCESS, FALSE); // true:成功，false:失败
			resultMsg.put("data", "支付方式为空！");
			return resultMsg;
		}
		if (param.get(PAY_MOUNT) == null || "".equals(param.get(PAY_MOUNT).toString())) {
			resultMsg.put(SUCCESS, FALSE); // true:成功，false:失败
			resultMsg.put("data", "收费金额为空！");
			return resultMsg;
		}
		// 将olId、支付方式和收费金额存入redis，表示支付成功
		RedisUtil.set("app_status_" + param.get("olId").toString(), "0");
		RedisUtil.set("app_payCode_" + param.get("olId").toString(), param.get(PAY_METHODCD).toString());
		RedisUtil.set("app_payAmount_" + param.get("olId").toString(), param.get(PAY_MOUNT).toString());
		// 签名校验
		String signKey = param.get("olId") + "1000000244";
		String sign = AESUtils.getMD5Str(signKey);
		if (!sign.equals(param.get("sign"))) {
			resultMsg.put(SUCCESS, FALSE); // true:成功，false:失败
			resultMsg.put("data", "签名不一致！");
			return resultMsg;
		}
		if (param.get(AREA_ID) == null || "".equals(param.get(AREA_ID).toString())) {
			resultMsg.put(SUCCESS, FALSE); // true:成功，false:失败
			resultMsg.put("data", "地区id为空！");
			return resultMsg;
		}
		if (param.get(CHARGE_ITEMS) == null || "".equals(param.get(CHARGE_ITEMS).toString())) {
			resultMsg.put(SUCCESS, "true"); // true:成功，false:失败
			resultMsg.put("data", "费用项为空！");
			return resultMsg;
		}
		resultMsg.put(SUCCESS, "true"); // true:成功，false:失败
		resultMsg.put("data", "0");//表示允许下计费接口
		return resultMsg;
	}
	
	/**
	 * 转化费用项[]为""
	 * 
	 */
	private List<Map> transChargeItems(List<Map> chargeItems,Map<String, Object> param) {
			for (Map<String, Object> map : chargeItems) { 
				map.put(PAY_METHODCD, param.get(PAY_METHODCD).toString());
				String objInstId = map.get("objInstId").toString();// 将[]转为""
				String posSeriaNbr = map.get("posSeriaNbr").toString();
				String prodId = map.get("prodId").toString();
				String remark = map.get("remark").toString();
				String terminalNo = map.get("terminalNo").toString();
				if ("[]".equals(objInstId)) map.put("objInstId", "");
				if ("[]".equals(posSeriaNbr)) map.put("posSeriaNbr", "");
				if ("[]".equals(prodId)) map.put("prodId", "");
				if ("[]".equals(remark)) map.put("remark", "");
				if ("[]".equals(terminalNo)) map.put("terminalNo", "");
			}
		return chargeItems;
	}
	
	
	/**
	 * web端下收费建档接口
	 * 
	 * @return
	 */
	private Map<String, Object> chargeSubmit(HttpServletRequest request,List<Map> chargeItems,Map<String, Object> param,Map<String, Object> resultMsg) {
		Map<String, Object> rMap = null;
		if (chargeItems.get(0).get(SO_NBR) != null) {
			String soNbr = chargeItems.get(0).get(SO_NBR).toString();
			param.put(SO_NBR, soNbr);
			try {
				// 添加app标志
				request.getSession().setAttribute(SysConstant.SESSION_KEY_APP_FLAG, "1");
				rMap = orderBmo.chargeSubmit(param, null, null);
				if (rMap != null && ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					resultMsg.put(SUCCESS, "true"); // true:成功，false:失败
					resultMsg.put("data", "调用收费接口成功，收费完成！"); // 返回信息0成功，1失败
					return resultMsg;
				} else {
					resultMsg.put(SUCCESS, "true"); // true:成功，false:失败
					resultMsg.put("data", "调用收费接口成功，收费失败！");
					return resultMsg;
				}

			} catch (Exception e) {
				log.error(e);
				resultMsg.put(SUCCESS, "true"); // true:成功，false:失败
				resultMsg.put("data", "请求失败，下计费接口出错！"); // 返回信息0成功，1失败
				return resultMsg;
			}
		} else {
			resultMsg.put(SUCCESS, "true"); // true:成功，false:失败
			resultMsg.put("data", "请求参数不完整，soNbr为空！"); // 返回信息0成功，1失败
			return resultMsg;
		}
	}

}
