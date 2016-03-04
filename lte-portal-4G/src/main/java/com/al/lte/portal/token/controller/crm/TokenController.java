package com.al.lte.portal.token.controller.crm;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.TokenBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.StringUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.token.controller.crm.TokenController")
@RequestMapping("/accessToken")
public class TokenController extends BaseController {
	private static Logger log = LoggerFactory.getLogger(TokenController.class.getName());
	
	@Resource(name = "com.al.lte.portal.bmo.crm.TokenBmoImpl")
	private TokenBmo tokenBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@RequestMapping(method = {RequestMethod.GET }, produces = "text/html;charset=UTF-8")
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request,response);
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(method = {RequestMethod.POST }, produces = "text/html;charset=UTF-8") 
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		Map<String,Object> resultMap = new HashMap<String,Object>();
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			String provinceCode = request.getParameter("provinceCode");//省份编码
			String params = request.getParameter("params");//json参数集合
			log.error("获取的省份编码:"+provinceCode);
			log.error("获取的参数集合:"+params);
			if(StringUtil.isEmptyStr(provinceCode)){
				resultMap.put("resultCode", "1");
				resultMap.put("resultMsg", "省份编码为空");
				return;
			}
			if(StringUtil.isEmptyStr(params)){
				resultMap.put("resultCode", "1");
				resultMap.put("resultMsg", "参数集合为空");
				return;
			}
			String publicKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"token.province.key");//公钥						
			log.error("公钥:"+publicKey);
			if(StringUtil.isEmptyStr(publicKey)){
				resultMap.put("resultCode", "2");
				resultMap.put("resultMsg", "公钥为空");
				return;
			}
			String jmProvinceCode = AESUtils.decryptToString(provinceCode, publicKey);
			log.error("解密后的省份编码:"+jmProvinceCode);
			if(StringUtil.isEmptyStr(jmProvinceCode)){
				resultMap.put("resultCode", "2");
				resultMap.put("resultMsg", "省份编码解密异常");
				return;
			}
			String privateKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"token."+jmProvinceCode+".key");//私钥TOKEN_8110000_KEY
			log.error("省份私钥:"+privateKey);
			if(StringUtil.isEmptyStr(privateKey)){
				resultMap.put("resultCode", "2");
				resultMap.put("resultMsg", "私钥为空");
				return;
			}
			String jmParams = AESUtils.decryptToString(params, privateKey);
			log.error("解密后的参数集:"+jmParams);
			if(StringUtil.isEmptyStr(jmParams)){
				resultMap.put("resultCode", "3");
				resultMap.put("resultMsg", "参数解密异常");
				return;
			}
			Map<String,Object> paramMap = JsonUtil.toObject(jmParams, HashMap.class);
			if(paramMap == null || paramMap.size() <= 0){
				resultMap.put("resultCode", "3");
				resultMap.put("resultMsg", "参数为空");
				return;
			}
			String staffCode = MapUtils.getString(paramMap, "staffCode");
			String commonRegionId = MapUtils.getString(paramMap, "areaId");
			if(!StringUtil.isEmptyStr(staffCode) && !StringUtil.isEmptyStr(commonRegionId)) {
				try{
					Map<String,Object> staffInfo = staffBmo .queryStaffByStaffCode4Login(staffCode, commonRegionId);
					log.error("获取的员工信息:"+staffInfo.toString());
					if(staffInfo.get("resultCode") != null){
						resultMap.put("resultCode", "4");
						resultMap.put("resultMsg", String.valueOf(staffInfo.get("resultMsg")));
						return;					
					}
				}catch (BusinessException be) {
					log.error("员工信息查询异常：",be);
					resultMap.put("resultCode", "-1");
					resultMap.put("resultMsg", super.failed(be));
					return;
				} catch (InterfaceException ie) {
					log.error("员工信息查询异常：",ie);
					resultMap.put("resultCode", "-1");
					resultMap.put("resultMsg", super.failed(ie, null, ErrorCode.QUERY_STAFF_INFO));
					return;
				} catch (Exception e) {			
					log.error("员工信息查询异常：",e);
					resultMap.put("resultCode", "-1");
					resultMap.put("resultMsg", super.failed(ErrorCode.QUERY_STAFF_INFO, e, null));
					return;
				}
			}else{
				resultMap.put("resultCode", "4");
				resultMap.put("resultMsg", "工号或者地市为空，无法生成令牌");
				return;
			}
			String tokenTimes = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"token.times");//令牌失效时间
			log.error("令牌失效时间:"+tokenTimes);
			String tokenKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"token.key");//令牌key
			log.error("令牌key:"+tokenKey);
			paramMap.put("tokenTimes",tokenTimes);
			paramMap.put("tokenKey",tokenKey);		
			log.warn("-----------GET TOKEN PARAMS:"+paramMap);
			resultMap = tokenBmo.getAppToken(paramMap, null, sessionStaff);	
			log.warn("-----------GET TOKEN RESULT:"+resultMap);
		}catch(Exception ex){
			log.error("令牌获取接口异常:",ex);	
			resultMap.put("resultCode", "-1");
			resultMap.put("resultMsg", "令牌获取接口异常");
		}finally{
			try {
				response.setContentType("text/html");
				response.setCharacterEncoding("utf-8");				
				PrintWriter pt = response.getWriter();
				pt.print(JacksonUtil.objectToJson(resultMap));
				pt.flush();
				pt.close();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				log.error(e.getMessage());
			}
		}		
	}
	
	/**
	 * 暂存单查询，“处理”按钮触发该操作请求
	 * @param paramMap
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/queryOrderInfos", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse index(@RequestParam Map<String, Object> paramMap,HttpServletRequest request,HttpServletResponse response){
		JsonResponse jsonResponse = null;
		try{
			//从会话中获取缓存的订单数据(购物车ID和订单类型),对于能力开放和界面集成的单子限制其在集团CRM进行受理
            Map<String, Object> orderListsInfo = (Map<String, Object>) ServletUtils.getSessionAttribute(super.getRequest(), "orderListsInfo");
            Map<String, Object> saveOrderLists = (Map<String, Object>) orderListsInfo.get("saveOrderLists");
            String olId = paramMap.get("customerOrderId").toString();
            if(saveOrderLists.containsKey(olId)){//客户端请求中的olId在会话中存在
            	String olTypeCd = saveOrderLists.get(olId).toString();//订单类型
            	if("8".equals(olTypeCd)){//界面集成订单(前台UI暂存订单)
        			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, paramMap, null, new Throwable("订单号["+olId+"]为界面集成订单(UI暂存订单)，不可以在集团CRM进行受理，请不要非法操作."));
            	} else if("9".equals(olTypeCd)){//能力开放订单(API接口暂存订单)
        			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, paramMap, null, new Throwable("订单号["+olId+"]为能力开放订单(API接口暂存订单)，不可以在集团CRM进行受理，请不要非法操作."));
            	}
            } else{//会话中不存在客户端请求中的olId，可能有非正常请求，例如前端js的限制被篡改
    			throw new BusinessException(ErrorCode.PORTAL_INPARAM_ERROR, paramMap, null, new Throwable("订单号["+olId+"]数据异常，当前会话中不存在该订单号，请刷新页面再尝试."));
            }
            
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			paramMap.put("areaId", sessionStaff.getCurrentAreaId());
			Map<String, Object> resultMap = offerBmo.queryTemporaryOrder(paramMap, null, sessionStaff);
			if(resultMap.get("resultCode").equals(ResultCode.R_SUCC)){
				jsonResponse = super.successed(resultMap.get("result"),ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.successed(resultMap.get("resultMsg"),ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		}catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_ORDERINFOS);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ORDERINFOS, e, paramMap);
		}
		return jsonResponse;			
	}

	@RequestMapping("/test")
	public void index(HttpServletRequest request,HttpServletResponse response,Model model){
		Map<String,Object> resultMap = new HashMap<String,Object>();
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			String provTransId = request.getParameter("provTransId");
			String areaId = request.getParameter("areaId");
			Map<String,Object> paramMap = new HashMap<String,Object>();
			/*paramMap.put("provTransId", "201501125230041");
			paramMap.put("areaId", "8330100");*/
			paramMap.put("provTransId", provTransId);
			paramMap.put("areaId", areaId);
			resultMap = offerBmo.queryTemporaryOrder(paramMap, null, sessionStaff);
			log.warn("resultMap===>>>"+resultMap);
		}catch(Exception ex){
			log.error("销售品编码转换接口异常:",ex);			
			resultMap.put("resultCode", "1001");
			resultMap.put("resultMsg", "服务异常。");
		}finally{
			try {
				response.setContentType("text/html");
				response.setCharacterEncoding("utf-8");				
				PrintWriter pt = response.getWriter();
				pt.print(JacksonUtil.objectToJson(resultMap));
				pt.flush();
				pt.close();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				log.error(e.getMessage());
			}
		}	
	}
	
	@RequestMapping("/test2")
	public void index2(HttpServletRequest request,HttpServletResponse response,Model model){
		Map<String,Object> resultMap = new HashMap<String,Object>();
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			String extProdOfferId = request.getParameter("extProdOfferId");
			String areaId = request.getParameter("areaId");
			Map<String,Object> paramMap = new HashMap<String,Object>();
			/*paramMap.put("extProdOfferId", "135010051");
			paramMap.put("areaId", "8320100");*/
			paramMap.put("extProdOfferId", extProdOfferId);
			paramMap.put("areaId", areaId);
			resultMap = offerBmo.prodOfferChange(paramMap, null, sessionStaff);
			log.warn("resultMap===>>>"+resultMap);
		}catch(Exception ex){
			log.error("销售品编码转换接口异常:",ex);			
			resultMap.put("resultCode", "1001");
			resultMap.put("resultMsg", "服务异常。");
		}finally{
			try {
				response.setContentType("text/html");
				response.setCharacterEncoding("utf-8");				
				PrintWriter pt = response.getWriter();
				pt.print(JacksonUtil.objectToJson(resultMap));
				pt.flush();
				pt.close();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				log.error(e.getMessage());
			}
		}	
	}
	
	@RequestMapping(value="/error")
	public @ResponseBody ModelAndView index(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String flag = request.getParameter("flag");
		ModelAndView view = new ModelAndView("/common/error");	
		view.addObject("errorMsg", getErrorMsg(flag));
		return view;
	}
	
	public static String getErrorMsg(String code){
		int errorCode = Integer.parseInt(code);
		String errorMsg = "";
		switch (errorCode) {
		case 1:
			errorMsg = "会话失效,请重试获取。";
			break;
		case 2:
			errorMsg = "工号信息不一致。";
			break;
		case 3:
			errorMsg = "令牌失效。";
			break;
		case 4:
			errorMsg = "令牌丢失。";
			break;
		default:
			errorMsg = "无权限访问该模块。";
		}
		return errorMsg;		
	}
}
