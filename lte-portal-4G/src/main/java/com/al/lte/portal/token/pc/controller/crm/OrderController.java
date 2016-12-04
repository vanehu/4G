package com.al.lte.portal.token.pc.controller.crm;

import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;

import org.apache.commons.collections.CollectionUtils;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.EncodeUtils;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.StringUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 订单受理控制层 主要受理，新装，变更，附属变更
 */
@Controller("com.al.lte.portal.token.pc.token.pc.controller.crm.OrderController")
@RequestMapping("/token/pc/order/*")
public class OrderController extends BaseController {
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.print.PrintBmo")
	private PrintBmo printBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	
	//产品
	private  final String NORMAL_PROD="100000";
	/** 短信验证前，登陆会话临时ID */
	public static final String SESSION_KEY_TEMP_LOGIN_STAFF = "_session_key_tenm_sms";
	
	@RequestMapping(value = "/orderSubmitComplete", method = RequestMethod.POST)
	public @ResponseBody JsonResponse orderSubmitComplete(@RequestBody Map<String, Object> reqMap,
			HttpServletResponse response,HttpServletRequest request){
		
		JsonResponse jsonResponse = null;
		if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
			try {
				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                    SysConstant.SESSION_KEY_LOGIN_STAFF);
				
				Map<String, Object> resMap = orderBmo.orderSubmitComplete(reqMap,null,sessionStaff);
				if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
		        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
				}else{
					throw new InterfaceException(ErrType.CATCH, PortalServiceCode.ORDER_SUBMIT, String.valueOf(resMap.get("resultMsg")), JsonUtil.toString(reqMap));
				}
	        }  catch (BusinessException be) {
				this.log.error("订单一点提交失败", be);
				return super.failed(be);
			} catch (InterfaceException ie) {
				return super.failed(ie, reqMap, ErrorCode.ORDER_SUBMIT);
			} catch (Exception e) {
				log.error("订单一点提交失败方法异常", e);
				return super.failed(ErrorCode.ORDER_SUBMIT, e, reqMap);
			}
			return jsonResponse;
		}else {
			log.error("订单提交失败");
            return jsonResponse;
		}
	}
	
	@RequestMapping(value = "/delOrder", method = {RequestMethod.GET})
	public @ResponseBody JsonResponse delOrder(@RequestParam Map<String, Object> reqMap,Model model){
		JsonResponse jsonResponse = null;
        try {
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                    SysConstant.SESSION_KEY_LOGIN_STAFF);
        	Map<String, Object> resMap = orderBmo.delOrder(reqMap,null,sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());	
		} catch (BusinessException be) {
			this.log.error("作废购物车失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, reqMap, ErrorCode.DEL_ORDER);
		} catch (Exception e) {
			log.error("作废购物车/order/delOrder方法异常", e);
			return super.failed(ErrorCode.DEL_ORDER, e, reqMap);
		}
		return jsonResponse;
	}
	/**
	 * 新装入口
	 * @param params
	 * @param request
	 * @param httpSession
	 * @param model
	 * @param session
	 * @return
	 * @throws AuthorityException
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/prodoffer/prepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(@RequestParam Map<String, Object> params, HttpServletRequest request,HttpSession httpSession,Model model,HttpSession session) throws AuthorityException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> custMap = new HashMap<String, Object>();
		try {
			//公共参数加密KEY
			String commonParamKey = MySimulateData.getInstance().getParam("COMMON_PARAM_KEY",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");
			String paramsJson=request.getParameter("params");
			
			if(paramsJson==null){
				//参数为空，扔公共提示页面
				model.addAttribute("errorMsg", "paramsJson 参数丢失，请重试。");
				return "/common/error";
			}
			
			String jmParamsJson = AESUtils.decryptToString(paramsJson, commonParamKey);
			
			Map<String,Object> paramsMap = JsonUtil.toObject(jmParamsJson, HashMap.class);
			
			if(paramsMap == null || paramsMap.size() <= 0){		
				model.addAttribute("errorMsg", "paramsMap参数丢失，请重试。");
				return "/common/error";
			}
			//判断是否是二次加载
			String provIsale = (String) paramsMap.get("provIsale");
			if(provIsale==null||provIsale.equals("")||provIsale.equals("null")){
				model.addAttribute("errorMsg", "省份编码参数丢失，请重试。");
				return "/common/error";
			}
			//客户定位证件类型
			String provCustIdentityCd = (String) paramsMap.get("provCustIdentityCd");
			if(provCustIdentityCd==null||provCustIdentityCd.equals("")||provCustIdentityCd.equals("null")){
				model.addAttribute("errorMsg", "客户定位证件类型参数丢失，请重试。");
				return "/common/error";
			}
			//客户编码
			String custNumber = (String) paramsMap.get("custNumber");
			if(custNumber==null||custNumber.equals("")||custNumber.equals("null")){
				model.addAttribute("errorMsg", "客户编码参数丢失，请重试。");
				return "/common/error";
			}
			//客户定位对应证件类型的编码值
			String provCustIdentityNum = (String) paramsMap.get("provCustIdentityNum");
			if(provCustIdentityNum==null||provCustIdentityNum.equals("")||provCustIdentityNum.equals("null")){
				model.addAttribute("errorMsg", "客户定位对应证件类型的编码值参数丢失，请重试。");
				return "/common/error";
			}
			//客户所属区域编码
			String provCustAreaId = (String) paramsMap.get("provCustAreaId");
			if(provCustAreaId==null||provCustAreaId.equals("")||provCustAreaId.equals("null")){
				model.addAttribute("errorMsg", "客户所属区域编码参数丢失，请重试。");
				return "/common/error";
			}
			//主套餐内部ID 对应Ext_Prod_Offer_Id
			String mainProdOfferId = (String) paramsMap.get("mainProdOfferId");
			//业务类型：如：新装、套餐变更、成员变更
			String actionFlag = (String) paramsMap.get("actionFlag");
			if(actionFlag==null||actionFlag.equals("")||actionFlag.equals("null")){
				model.addAttribute("errorMsg", "主套餐内部ID参数丢失，请重试。");
				return "/common/error";
			}
			//Y=新加载；N=二次加载
			String reloadFlag = (String) paramsMap.get("reloadFlag");
			if(reloadFlag==null||reloadFlag.equals("")||reloadFlag.equals("null")){
				model.addAttribute("errorMsg", "二次加载标识参数丢失，请重试。");
				return "/common/error";
			}
			 //终端串码
			model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
			//回调URL地址
			String redirectUri = (String) paramsMap.get("redirectUri");
			//主号码: 目前变更业务送
			String mainPhoneNum = (String) paramsMap.get("mainPhoneNum");
			//新装成员号码： 多个成员使用分隔符‘,’
			String newSubPhoneNum = (String) paramsMap.get("newSubPhoneNum");
			//成员变更时，老用户成员号码：多个成员使用分隔符‘,’
			String oldSubPhoneNum = (String) paramsMap.get("oldSubPhoneNum");
			//是否集团收费
			String isFee = (String) paramsMap.get("isFee");
			//获取uim卡信息
			String mktResInstCode = (String) paramsMap.get("mktResInstCode");
			//帐户合同号
			String acctCd = (String) paramsMap.get("acctNumber");
			if(acctCd==null||acctCd.equals("")||acctCd.equals("null")){
				acctCd="";
			}
			
			if(isFee==null||isFee.equals("")||isFee.equals("null")){
				model.addAttribute("errorMsg", "是否集团收费参数丢失，请重试。");
				return "/common/error";
			}
			String mergeFlag = "0";
			String interface_merge = MySimulateData.getInstance().getParam("INTERFACE_MERGE",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"INTERFACE_MERGE");
			String provareaId = paramsMap.get("provCustAreaId").toString().subSequence(0, 3)+"0000";
			if(interface_merge != null && interface_merge.indexOf(provareaId)!=-1){
				mergeFlag = "1";
			}
			model.addAttribute("mergeFlag", mergeFlag);
			String cust_Info = "{}";
			if("0".equals(mergeFlag)){
				//定位客户接口 queryCust
				custMap.put("acctNbr", "");
				custMap.put("areaId", provCustAreaId);
				custMap.put("diffPlace", "local");
				custMap.put("identidies_type", "客户编码");
				custMap.put("identityCd", "");
				custMap.put("identityNum", "");
				custMap.put("partyName", "");
				custMap.put("queryType", "custNumber");
				custMap.put("queryTypeValue", custNumber);
				/*custMap.put("acctNbr", "17705160619");
				custMap.put("areaId", provCustAreaId);
				custMap.put("diffPlace", "local");
				custMap.put("identidies_type", "接入号码");
				custMap.put("identityCd", "");
				custMap.put("identityNum", "");
				custMap.put("partyName", "");
				custMap.put("queryType", "");
				custMap.put("queryTypeValue", "");*/
				Map<String,Object> resultMap = custBmo.queryCustInfo(custMap,null,sessionStaff);
				List custInfos = new ArrayList();
				if (resultMap!=null&&resultMap.size()>0) {
					custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
					if(custInfos==null||custInfos.size()<=0){
						model.addAttribute("errorMsg", "未定位到客户信息");
						return "/common/error";
					}
					if(!custMap.get("queryTypeValue").equals("") && !custMap.get("queryType").equals("")){
						sessionStaff.setCardNumber(String.valueOf(custMap.get("queryTypeValue")));
						sessionStaff.setCardType(String.valueOf(custMap.get("queryType")));
					}else if(!custMap.get("identityNum").equals("") && !custMap.get("identityCd").equals("")){
						sessionStaff.setCardNumber(String.valueOf(custMap.get("identityNum")));
						sessionStaff.setCardType(String.valueOf(custMap.get("identityCd")));
					}
					
					sessionStaff.setInPhoneNum(String.valueOf(custMap.get("acctNbr")));
					if(custInfos.size()>0){
						Map custInfo =(Map)custInfos.get(0);
						String idCardNumber = (String) custInfo.get("idCardNumber");
						
						sessionStaff.setCustId(String.valueOf(custInfo.get("custId")));
						sessionStaff.setCardNumber(idCardNumber);
						sessionStaff.setCardType(String.valueOf(custInfo.get("identityCd")));
						sessionStaff.setPartyName(String.valueOf(custInfo.get("partyName")));
						
						if(idCardNumber != null && idCardNumber.length()==18){
							 String preStr = idCardNumber.substring(0,6);
					    	 String subStr = idCardNumber.substring(14);
					    	 idCardNumber=preStr+"********"+subStr;
						}else if(idCardNumber != null && idCardNumber.length()==15){
							String preStr = idCardNumber.substring(0,5);
					    	 String subStr = idCardNumber.substring(13);
					    	 idCardNumber=preStr+"********"+subStr;
						}
					}
				}
				if(resultMap!=null&&resultMap.size()>0){
					cust_Info = JsonUtil.toString(resultMap);
				}else {
					model.addAttribute("errorMsg", "未定位到客户信息");
					return "/common/error";
				}
			}
			//公共返回的结果集
			model.addAttribute("staffId", sessionStaff.getStaffId());
			model.addAttribute("channelId", sessionStaff.getChannelId());
			model.addAttribute("channelName", sessionStaff.getChannelName());
			model.addAttribute("provCustAreaId", provCustAreaId);	
			model.addAttribute("custNumber", custNumber);
			model.addAttribute("redirectUri", redirectUri);
			model.addAttribute("actionFlag", actionFlag);
			model.addAttribute("isFee", isFee);
			model.addAttribute("provIsale", provIsale);
			model.addAttribute("oldSubPhoneNum", oldSubPhoneNum);
			model.addAttribute("custInfo", cust_Info);
			//对UIM卡的传参进行改造
			//model.addAttribute("mktResInstCode", mktResInstCode);
			
			//判断是否传参UIM卡
			String mktResInstCodes="";
			String codeMsg="";
			
			if(checkParam(mainPhoneNum) || checkParam(newSubPhoneNum)){
				if(checkParam(mktResInstCode)){
					//解析传入的参数
					String[] uims=String.valueOf(mktResInstCode).split(",");
					
					if(uims!=null && uims.length>0){
						String checkCode="0";
						
						if(uims.length>1){
							String checkPhone="";
							String checkUim="";
							
							for(String uimCode:uims){
								String[] uimCodes=uimCode.split("_");
								
								if(uimCodes!=null && uimCodes.length==2){
									String thisPhone=uimCodes[0];
									String thisUim=uimCodes[1];
									
									if(checkPhone!=null && !"".equals(checkPhone)){
										if(checkPhone.equals(thisPhone) || checkUim.equals(thisUim)){
											checkCode="1";
											break;
										}
									}else{
										checkPhone=thisPhone;
										checkUim=thisUim;
									}
								}
							}
						}
						
						if("1".equals(checkCode)){
							codeMsg="传入的UIM参数中存在重复数据,传入的UIM参数["+mktResInstCode+"]";
						}else{
							//如果主号码不为空
							if(checkParam(mainPhoneNum)){
								for(String uimCode:uims){
									String[] uimCodes=uimCode.split("_");
									
									if(uimCodes!=null && uimCodes.length==2){
										if(mainPhoneNum.equals(uimCodes[0])){
											mktResInstCodes+="-1_"+uimCodes[1]+",";
											break;
										}
									}
								}
							}
							
							//如果副号码不为空
							if(checkParam(newSubPhoneNum)){
								String[] subPhoneNumbs=newSubPhoneNum.split(",");
								
								if(subPhoneNumbs!=null && subPhoneNumbs.length>0){
									int i=-2;
									for(String subNum:subPhoneNumbs){
										for(String uimCode:uims){
											String[] uimCodes=uimCode.split("_");
											
											if(uimCodes!=null && uimCodes.length==2){
												if(subNum.equals(uimCodes[0])){
													mktResInstCodes+=i+"_"+uimCodes[1]+",";
													break;
												}
											}
										}
										i--;
									}
								}
							}
							
							if(!checkParam(mktResInstCodes)){
								codeMsg="未匹配到适应的UIM卡";
								if(checkParam(mainPhoneNum)){
									codeMsg+="，主号码["+mainPhoneNum+"]";
								}
								
								if(checkParam(newSubPhoneNum)){
									codeMsg+="，副号码["+newSubPhoneNum+"]";
								}
								
								codeMsg+=",传入的UIM参数["+mktResInstCode+"]";
							}
						}
					}
				}
			}
			//判断是否有传主副卡号码  
			if(mainPhoneNum!=null&&!"".equals(mainPhoneNum)&&!"null".equals(mainPhoneNum)){
				model.addAttribute("mainPhoneNum",mainPhoneNum);
			}
			model.addAttribute("mktResInstCode", mktResInstCodes);
			model.addAttribute("codeMsg", codeMsg);
			model.addAttribute("salesCode", paramsMap.get("salesCode")==null?"":paramsMap.get("salesCode").toString());
			model.addAttribute("acctCd", acctCd);
			//主套餐内部ID转换接口入参
			String prodOfferId = "";
			String prodOfferName = "";
			String offerNbr = "";
			String verifyLevel=paramsMap.get("verifyLevel")!=null?String.valueOf(paramsMap.get("verifyLevel")):null;
			model.addAttribute("verifyLevel",verifyLevel);
			String typeCd=paramsMap.get("typeCd")!=null?String.valueOf(paramsMap.get("typeCd")):null;
			model.addAttribute("typeCd",typeCd);
			//若mainProdOfferId不为空，则直接定位到指定套餐上
			if(mainProdOfferId!=null&&!mainProdOfferId.equals("")&&!mainProdOfferId.equals("null")){
				if (paramsMap.get("prodOfferId")==null||paramsMap.get("prodOfferName")==null||paramsMap.get("offerNbr")==null) {
					model.addAttribute("errorMsg", "主套餐id转换参数丢失，请重试。");
					return "/common/error";
				}
				prodOfferId = String.valueOf(paramsMap.get("prodOfferId"));//集团销售品ID
				prodOfferName = String.valueOf(paramsMap.get("prodOfferName"));//集团销售品
				offerNbr = String.valueOf(paramsMap.get("offerNbr"));//集团销售品编码
				if (newSubPhoneNum!=null&&!"".equals(newSubPhoneNum)&&!"null".equals(newSubPhoneNum)) {
					model.addAttribute("newSubPhoneNum",newSubPhoneNum);
				}
				model.addAttribute("prodOfferId",prodOfferId);
				model.addAttribute("prodOfferName",prodOfferName);	
				if (!"N".equals(reloadFlag)) {
					return "/pctoken/order/order-search-old";
				}
			}
			//判断是否是二次加载业务
			if("N".equals(reloadFlag)){
				//暂存单接口调用
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("provTransId", provIsale);
				paramMap.put("backFlag", "Y");
				Map<String, Object> orderMap = new HashMap<String, Object>();
				try {
					orderMap = offerBmo.queryTemporaryOrder(paramMap,null,sessionStaff);
				} catch (Exception e) {
					model.addAttribute("errorMsg", e);
					return "/common/error";
				}
				Map<String, Object> result = new HashMap<String, Object>();
				if ("0".equals(String.valueOf(orderMap.get("resultCode")))) {
					result = (Map<String, Object>) orderMap.get("result");
					String jsonStr = JsonUtil.toString(result);
					model.addAttribute("result", jsonStr);
				}else {
					model.addAttribute("errorMsg", String.valueOf(orderMap.get("resultMsg")));
					return "/common/error";
				}		
				return "/pctoken/order/order-search-reload";
			}
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, custMap, ErrorCode.QUERY_CUST);
		}catch(Exception e){
			return super.failedStr(model, ErrorCode.QUERY_CUST, e, custMap);
		}

		return "/pctoken/order/order-search";
    }
	
	public boolean checkParam(Object info){
		boolean result=false;
		
		if(info!=null){
			String infos=String.valueOf(info);
			
			if(infos!=null && !"".equals(infos) && !"null".equals(infos)){
				result=true;
			}
		}
		
		return result;
	} 
	
	/**
	 * 查询客户详细信息（用客户编码定位）
	 * @param param
	 * @param flowNum
	 * @param sessionStaff
	 * @param httpSession
	 * @return
	 */
	public Map<String, Object> queryCustInfo(Map<String, Object> param,String flowNum ,SessionStaff sessionStaff,HttpSession httpSession){
		
		Map<String, Object> custMap = new HashMap<String, Object>();
		custMap.put("acctNbr", "");
		custMap.put("areaId", (String)param.get("provCustAreaId"));
		custMap.put("diffPlace", "local");
		custMap.put("identidies_type", "客户编码");
		custMap.put("identityCd", "");
		custMap.put("identityNum", "");
		custMap.put("partyName", "");
		custMap.put("queryType", "custNumber");
		custMap.put("queryTypeValue", (String)param.get("custNumber"));
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
				resultMap = custBmo.queryCustInfo(custMap,flowNum,
						sessionStaff);
			List custInfos = new ArrayList();
			if (resultMap!=null) {
				custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
				if(!custMap.get("queryTypeValue").equals("") && !custMap.get("queryType").equals("")){
					sessionStaff.setCardNumber(String.valueOf(param.get("queryTypeValue")));
					sessionStaff.setCardType(String.valueOf(param.get("queryType")));
				}else if(!custMap.get("identityNum").equals("") && !custMap.get("identityCd").equals("")){
					sessionStaff.setCardNumber(String.valueOf(param.get("identityNum")));
					sessionStaff.setCardType(String.valueOf(param.get("identityCd")));
				}
				
				sessionStaff.setInPhoneNum(String.valueOf(custMap.get("acctNbr")));
				if(custInfos.size()>0){
					Map custInfo =(Map)custInfos.get(0);
					String idCardNumber = (String) custInfo.get("idCardNumber");
					
					sessionStaff.setCustId(String.valueOf(custInfo.get("custId")));
					sessionStaff.setCardNumber(idCardNumber);
					sessionStaff.setCardType(String.valueOf(custInfo.get("identityCd")));
					sessionStaff.setPartyName(String.valueOf(custInfo.get("partyName")));
					
					if(idCardNumber != null && idCardNumber.length()==18){
						 String preStr = idCardNumber.substring(0,6);
				    	 String subStr = idCardNumber.substring(14);
				    	 idCardNumber=preStr+"********"+subStr;
					}else if(idCardNumber != null && idCardNumber.length()==15){
						String preStr = idCardNumber.substring(0,5);
				    	 String subStr = idCardNumber.substring(13);
				    	 idCardNumber=preStr+"********"+subStr;
					}
				}else{
					int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
					httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
				}
			}else{
				int count = (Integer) httpSession.getAttribute(sessionStaff.getStaffCode()+"custcount")+10;
				httpSession.setAttribute(sessionStaff.getStaffCode()+"custcount", count);
			}
		} catch (InterfaceException e) {
			e.printStackTrace();
			log.error("查询客户信息异常", e);
			resultMap.put("ExceptionMessage", e);
			resultMap.put("code", "-1");
		}catch (Exception e) {
			e.printStackTrace();
		}
		return resultMap;
	}
	@RequestMapping(value = "/preparep", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
	public String preparep(@RequestParam Map<String, Object> mktRes, HttpServletRequest request,Model model,HttpSession session) {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
		//mktRes.put("mktResName", MapUtil.asStr(param, "mktName"));
		//mktRes.put("salePrice", MapUtil.asStr(param, "mktPrice"));
		//mktRes.put("mktPicA", MapUtil.asStr(param, "mktPicA"));
		//mktRes.put("channelId", sessionStaff.getCurrentChannelId());
		model.addAttribute("mktRes", mktRes);
		model.addAttribute("DiffPlaceFlag", "local");
		return "/pctoken/order/order-prepare";
	}
	@RequestMapping(value = "/preparedp", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String preparedp(@RequestParam Map<String, Object> mktRes, HttpServletRequest request,Model model,HttpSession session) {
		//model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/prepare"));
		//mktRes.put("mktResName", MapUtil.asStr(param, "mktName"));
		//mktRes.put("salePrice", MapUtil.asStr(param, "mktPrice"));
		//mktRes.put("mktPicA", MapUtil.asStr(param, "mktPicA"));
		//mktRes.put("channelId", sessionStaff.getCurrentChannelId());
		model.addAttribute("DiffPlaceFlag", "diff");
		return "/order/order-prepare";
	}
	/**
	 * ?flowStep=order_tab_panel_offer-10011,5000000901100003#step1 第一个参数是入口TAB
	 * 
	 * @param param
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/prepare", method = RequestMethod.GET)
	@AuthorityValid(isCheck = true)
	public String prepare(@RequestParam Map<String, Object> param, HttpSession session,Model model) {
		//model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"order/prepare"));
		model.addAttribute("canOrder", EhcacheUtil.pathIsInSession(session,"order/prepare"));
		log.debug("prepare.param={}", param);
		model.addAttribute("mktRes", param);
		model.addAttribute("DiffPlaceFlag", "local");
//		String[] params = param.split("-");
//		if (params.length > 0) {
//			model.addAttribute("flowStep", params[0]);
//		} else {
//			model.addAttribute("flowStep", "order_tab_panel_terminal");
//		}
//		if (params.length > 1) {
//			model.addAttribute("flowStepParam", params[1]);
//		} else {
//			model.addAttribute("flowStepParam", "");
//		}
		return "/pctoken/order/order-prepare";
	}
	
	
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryApConf", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse queryAgentPortalConfig(
			@RequestParam Map<String, Object> param, Model model,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
//		Map<String, Object> map = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String configParamType = String.valueOf(param.get("CONFIG_PARAM_TYPE"));
		String tableName = null;
		String columnItems = "";
		if ("TERMINAL_AND_PHONENUMBER".equals(configParamType)) {
			columnItems = "PHONE_NUMBER_PRESTORE,PHONE_NUMBER_SEGMENT,PHONE_NUMBER_FEATURE,PHONE_BRAND,PHONE_PRICE_AREA,PHONE_TYPE";
			tableName = "SYSTEM";
		}else if("PROD_AND_OFFER".equals(configParamType)) {
			columnItems = "OFFER_PRICE,OFFER_INFLUX,OFFER_INVOICE";
			tableName = "SYSTEM";
		}else if("BILL_POST".equals(configParamType)){
			columnItems = "BILL_POST_TYPE,BILL_POST_CONTENT,BILL_POST_CYCLE";
			tableName = "SYSTEM";
		}
		try {
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItems);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItems);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItems, rList);
			}
			jsonResponse = super.successed(rList,
					ResultConstant.SUCCESS.getCode());
		} catch (BusinessException e) {
			this.log.error("查询配置信息服务出错", e);
			jsonResponse = super.failed("查询配置信息服务出错",
					ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/prodModifyCommon", method = {RequestMethod.POST})
	public String removeProd(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		if (!MapUtils.isEmpty(param)) {
			//添加一些属性
			param.put("offerNum", 1);
			model.addAttribute("main", param);
		}
		return "/order/order-modify-common";
	}
	
	@RequestMapping(value = "/remove/submit", method = {RequestMethod.POST})
	public String removeSubmit(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		//TODO call bmo
		return "";//return general order submit url
	}
	
	@RequestMapping(value = "/remove/cancel", method = {RequestMethod.POST})
	public String callRemove(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		//TODO call bmo
		return "";//return general order cancel url
	}
	
    @RequestMapping(value = "/entrance", method = RequestMethod.GET)
	@AuthorityValid(isCheck = false)
	public String entrance(Model model){
    	model.addAttribute("code","0");
	    return "/order/order-entrance";
	}
    
    /*bxw产品规格属性*/
    @RequestMapping(value = "/orderSpecParam", method = RequestMethod.GET)
    public String orderSpecParam(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	String ul_id = request.getParameter("ul_id");
    	String prodId = request.getParameter("prodId");
    	String offerSpecId = request.getParameter("offerSpecId");
    	String prodSpecId = request.getParameter("prodSpecId");
    	String compProdSpecId = request.getParameter("compProdSpecId");
    	String partyId = request.getParameter("partyId");
    	String offerRoleId = request.getParameter("offerRoleId");
    	String roleCd = request.getParameter("roleCd");
    	
        dataBusMap.put("offerSpecId", offerSpecId);
        dataBusMap.put("prodSpecId", prodSpecId);//379
        if(compProdSpecId!=null&&!compProdSpecId.equals("")&&!compProdSpecId.equals("null")){
        	dataBusMap.put("compProdSpecId", compProdSpecId);//80000101
        }
        dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());//20
        dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
        dataBusMap.put("staffId", sessionStaff.getStaffId());
        dataBusMap.put("partyId", partyId);
        dataBusMap.put("offerRoleId", offerRoleId);
        dataBusMap.put("roleCd", roleCd);//2
        
        Map result = null ;
        List<Map<String, Object>> list = null;
		try {
			result = orderBmo.orderSpecParam(dataBusMap, null, sessionStaff);
			if ("0".equals(result.get("code").toString())) {
				list = (List<Map<String, Object>>) result.get("prodSpecParams");
				model.addAttribute("prodSpecParams", list);
				model.addAttribute("ul_id", ul_id);
				model.addAttribute("prodId", prodId);
				model.addAttribute("offerSpecId", offerSpecId);
				model.addAttribute("prodSpecId", offerSpecId);
				model.addAttribute("compProdSpecId", compProdSpecId);
				model.addAttribute("partyId", partyId);
				model.addAttribute("offerRoleId", offerRoleId);
				model.addAttribute("roleCd", roleCd);
				model.addAttribute("code", 0);
			} else {
				model.addAttribute("code", 1);
			}
		} catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, dataBusMap, ErrorCode.ORDER_PROD_ITEM);
		} catch (Exception e) {
			log.error("加载产品规格属性/order/orderSpecParam方法异常", e);
			return super.failedStr(model, ErrorCode.ORDER_PROD_ITEM, e, dataBusMap);
		}
    	return "/order/order-spec-param";
    }

    /*bxw产品实例属性*/
    @RequestMapping(value = "/orderSpecParamChange", method = RequestMethod.GET)
    public String orderSpecParamChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	String prodId = request.getParameter("prodInstId");
    	String offerSpecId = request.getParameter("offerSpecId");
    	String prodSpecId = request.getParameter("prodSpecId");
    	String partyId = request.getParameter("partyId");
    	String acctNbr = request.getParameter("acctNbr");
    	String areaId = request.getParameter("areaId");
    	Map<String, Object> dataBusMap1 = new HashMap<String, Object>();//规格
    	Map<String, Object> dataBusMap2 = new HashMap<String, Object>();//实例
    	
    	dataBusMap1.put("offerSpecId", offerSpecId);
    	dataBusMap1.put("prodSpecId", prodSpecId);
    	dataBusMap1.put("areaId", areaId);//20
    	dataBusMap1.put("channelId", sessionStaff.getCurrentChannelId());
        dataBusMap1.put("staffId", sessionStaff.getStaffId());
        dataBusMap1.put("partyId", partyId);
    	
        dataBusMap2.put("prodId", prodId);
        dataBusMap2.put("acctNbr", acctNbr);
        dataBusMap2.put("prodSpecId", prodSpecId);
        dataBusMap2.put("areaId", areaId);//20
        
        Map result = null ;
        List<Map<String, Object>> list = null;
        try {
        	result = orderBmo.orderSpecParamChange(dataBusMap1 ,dataBusMap2, null, sessionStaff);
        	model.addAttribute("orderSpec", result);
        	//String payMethodCode = MySimulateData.getInstance().getParam(SysConstant.PAY_METHOD_CODE) ;
			//model.addAttribute("payMethodCode", payMethodCode==null?"error":payMethodCode);
			String slimitParams = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.ORDER_PARAMS_LIMIT_IDS) ;
			List<String> limitParams = new ArrayList<String>();
			if(slimitParams!=null&&!slimitParams.equals("null")){
				String[] strLimitS = slimitParams.split(",");
				for(String str:strLimitS){
					limitParams.add(str);
				}
			}
			model.addAttribute("limitParams", limitParams);
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, dataBusMap2, ErrorCode.ORDER_PROD_INST);
		} catch (Exception e) {
			log.error("加载产品规格属性/order/orderSpecParamChange方法异常", e);
			return super.failedStr(model, ErrorCode.ORDER_PROD_INST, e, dataBusMap2);
		}
    	return "/order/order-spec-param-change";
    }
    
    /**
     * 产品实例属性查询，修改使用人
	 * @param resquestMap : {
	 * prodId : "", //产品实例id
	 * acctNbr : "", //接入号
	 * prodSpecId : "", //产品规格id
	 * areaId : "" //地区id
	 * }
	 */
    @RequestMapping(value = "/orderSpecParamUserChange", method = RequestMethod.GET)
    public String orderSpecParamUserChange(Model model, HttpServletRequest request) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map<String, Object> resquestMap = new HashMap<String, Object>(); 
    	resquestMap.put("prodId", request.getParameter("prodInstId"));
    	resquestMap.put("acctNbr", request.getParameter("acctNbr"));
    	resquestMap.put("prodSpecId", request.getParameter("prodSpecId"));
    	resquestMap.put("areaId", request.getParameter("areaId"));
        try {
            
        	Map responseMap = orderBmo.prodInstParam(resquestMap, null, sessionStaff);
        	if(responseMap != null && ResultCode.R_SUCC.equals(responseMap.get("resultCode"))){
        		List<Map<String, Object>> prodInstParams = (List<Map<String, Object>>)responseMap.get("prodSpecParams");
				if(prodInstParams != null){
					List<Map<String, Object>> filteredProdInstParams = new ArrayList<Map<String,Object>>();
					String custId = null;
					if(prodInstParams != null && prodInstParams.size() > 0){
						for(Map<String, Object> prodInstParam : prodInstParams){
							if(prodInstParam != null && SysConstant.PROD_ITEM_SPEC_ID_USER.equals(prodInstParam.get("itemSpecId")+"")){
								filteredProdInstParams.add(prodInstParam);
								custId = (String) prodInstParam.get("value");
								break;
							}
						}
					}
					responseMap.put("prodSpecParams", filteredProdInstParams);
					
					if(custId != null){
						Map paramMap=new HashMap();
				    	paramMap.put("partyId", custId);
//				    	paramMap.put("areaId", param.get("areaId"));
				    	Map datamap = custBmo.queryCustDetail(paramMap, null, sessionStaff);
						if (ResultCode.R_SUCC.equals(datamap.get("resultCode"))) {
							Map<String, Object> userInfoDetail = MapUtils.getMap(datamap, "result");
							model.addAttribute("userInfo", userInfoDetail);
						}
					}
				}
				model.addAttribute("orderSpec", responseMap);
        	}
        } catch (Exception e) {
			log.error("查询产品实例属性", e);
			return super.failedStr(model, ErrorCode.ORDER_PROD_INST, e, resquestMap);
		}
        return "/order/order-spec-param-user-change";
    }
    
    /*bxw产品密码修改*/
    @RequestMapping(value = "/orderPasswordChange", method = RequestMethod.GET)
    public String orderPasswordChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	String flag = "false";
    	String accNbr = request.getParameter("accNbr");
    	if(accNbr!=null&&session.getAttribute("ValidateAccNbr")!=null&&accNbr.equals(session.getAttribute("ValidateAccNbr"))){
    		Object password_session = session.getAttribute("ValidateProdPwd");
    		if(password_session!=null&&!password_session.equals("")&&!password_session.equals("null")){
    			model.addAttribute("password_session", password_session);
    			flag = "true" ;
    		}
    	}
    	model.addAttribute("ValidateAccNbrFlag", flag);
    	return "/order/order-password-change";
    }
    /*bxw产品密码重置*/
    @RequestMapping(value = "/orderPasswordReset", method = RequestMethod.GET)
    public String orderPasswordReset(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	return "/order/order-password-reset";
    }
    /*bxw产品密码校验*/
    @RequestMapping(value = "/orderPasswordCheck", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse orderPasswordCheck(HttpSession session, @RequestBody Map<String, Object> param 
    		,@LogOperatorAnn String flowNum//,Model model,HttpServletResponse response
    		) throws BusinessException{
    	JsonResponse jsonResponse = null;
    	
    	String password_old = param.get("password_old")==null?"":param.get("password_old").toString() ;
    	String accessNumber = param.get("accessNumber")==null?"":param.get("accessNumber").toString() ;
    	String areaId = param.get("areaId")==null?"":param.get("areaId").toString() ;
    	if(session.getAttribute("ValidateAccNbr")!=null&&accessNumber.equals(session.getAttribute("ValidateAccNbr"))){
    		Object password_session = session.getAttribute("ValidateProdPwd");
    		if(password_session!=null&&password_session.equals(password_old)){
    			jsonResponse = super.successed("产品密码鉴权成功",
    					ResultConstant.SUCCESS.getCode());
        		return jsonResponse;
    		}
    	}
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	Map map = null;
		Map paramMap = new HashMap();
		/*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
		paramMap.put("accessNumber", accessNumber);
		paramMap.put("areaId", areaId);
		paramMap.put("prodPwd", password_old);
		try {
			map = custBmo.custAuth(paramMap,
					"", sessionStaff);
			String isValidateStr = null ;
			if(map.get("isValidate")!=null){
				isValidateStr = map.get("isValidate").toString() ;
			}else if(map.get("result")!=null){
				Map<String, Object> tmpMap = MapUtils.getMap(map, "result");
				isValidateStr = MapUtils.getString(tmpMap, "isValidate");
			}
			if ("true".equals(isValidateStr)){
				session.setAttribute("ValidateAccNbr", accessNumber);
				session.setAttribute("ValidateProdPwd", password_old);
				jsonResponse = super.successed("产品密码鉴权成功",
    					ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed("产品密码鉴权失败",
    					ResultConstant.FAILD.getCode());
			}
			return jsonResponse;
			
		} catch (BusinessException be) {
			
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, paramMap, ErrorCode.CUST_AUTH);
		} catch (Exception e) {
			log.error("产品密码鉴权/order/orderPasswordCheck方法异常", e);
			return super.failed(ErrorCode.CUST_AUTH, e, paramMap);
		}
    	
    }
    /*bxw修改短号*/
    @RequestMapping(value = "/orderShortnumChange", method = RequestMethod.GET)
    public String orderShortnumChange(HttpSession session, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF
                );
    	String areaId = sessionStaff.getCurrentAreaId();
    	String prodId = request.getParameter("prodId");
    	String acctNbr = request.getParameter("acctNbr");
    	Map qry = new HashMap();
    	qry.put("areaId", areaId);
    	qry.put("prodId", prodId);//123015734675
    	qry.put("acctNbr", acctNbr);
    	Map shortnum_data = null ;
		try {
			shortnum_data = orderBmo.shortnum_query(qry,null, sessionStaff);
        	model.addAttribute("shortnum_data", shortnum_data);
		} catch (BusinessException be) {
			
			return super.failedStr(model,be);
		} catch (InterfaceException ie) {

			return super.failedStr(model,ie, qry, ErrorCode.ORDER_COMP_PROD_INST);
		} catch (Exception e) {
			log.error("加载短号/order/orderShortnumChange方法异常", e);
			return super.failedStr(model,ErrorCode.ORDER_COMP_PROD_INST, e, qry);
		}
    	return "/order/order-shortnum-change";
    }

    @RequestMapping(value = "/offerSpecList", method = RequestMethod.GET, produces = "text/html;charset=UTF-8")
    public String getOfferSpecList(@RequestParam Map<String, Object> prams,Model model,HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);	
		prams.put("channelId", sessionStaff.getCurrentChannelId());
		prams.put("areaId", sessionStaff.getCurrentAreaId());
		prams.put("staffId", sessionStaff.getStaffId());
		prams.put("operatorsId", sessionStaff.getOperatorsId()!=""?sessionStaff.getOperatorsId():"99999");
		prams.put("pageSize",SysConstant.PAGE_SIZE);
		if (sessionStaff != null) {
            Map<String, Object> map = null;
            try {
            	map = orderBmo.queryMainOfferSpecList(prams,null, sessionStaff);
            	if(ResultCode.R_SUCCESS.equals(map.get("code"))){
            		//拼装前台显示的套餐详情
            		if(!map.isEmpty()){
            			List prodOfferInfosList = (List) map.get("prodOfferInfos");
            			for(int i=0;i<prodOfferInfosList.size();i++){
            				Map exitParam = new HashMap();
            				exitParam = (Map) prodOfferInfosList.get(i);
            				List<Map<String,Object>> inhtmllist = new ArrayList<Map<String,Object>>();//组装套餐属性
            				if(exitParam.containsKey("price")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "价格");
            					inhtmlmap.put("value", exitParam.get("price"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inFlux")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					float influx = 0 ;
            					String influx_str ="";
            					/*
            					 判断返回的流量是否大于1024M，如果大于1024M，显示的单位是G，否则显示的单位是M
            					 */
            					if(exitParam.get("inFlux")!=null){
            						try{
            							influx = Float.parseFloat(exitParam.get("inFlux").toString());
            							if(influx<1024){
            								influx_str = influx+"";
            								if(influx_str.indexOf(".") > 0){  
                        						influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
                        						influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
                        			        } 
            								influx_str = influx_str+"M";
            							}else{
            								influx_str = influx/1024+"";
            								if(influx_str.indexOf(".") > 0){  
                        						influx_str = influx_str.replaceAll("0+?$", "");//去掉多余的0  
                        						influx_str = influx_str.replaceAll("[.]$", "");//如最后一位是.则去掉  
                        			        } 
            								influx_str = influx_str +"G";
            							}
            						}catch(Exception e){
            							this.log.error("WIFI", e);
            						}
            					}
            					inhtmlmap.put("name", "流量");
            					inhtmlmap.put("value", influx_str);
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inVoice")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "语音分钟数");
            					inhtmlmap.put("value", exitParam.get("inVoice"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inWIFI")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "WIFI时长");
            					inhtmlmap.put("value", exitParam.get("inWIFI"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inSMS")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "点对点短信");
            					inhtmlmap.put("value", exitParam.get("inSMS"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("inMMS")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "点对点彩信");
            					inhtmlmap.put("value", exitParam.get("inMMS"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("outFlux")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "套餐外流量");
            					inhtmlmap.put("value", exitParam.get("outFlux"));
            					inhtmllist.add(inhtmlmap);
            				}
            				if(exitParam.containsKey("outVoice")){
            					Map<String,Object> inhtmlmap = new HashMap<String,Object>();
            					inhtmlmap.put("name", "套餐外通话分钟数");
            					inhtmlmap.put("value", exitParam.get("outVoice"));
            					inhtmllist.add(inhtmlmap);
            				}
            				inhtmllist.clear();
            				if(exitParam.containsKey("summary")){
        						Map<String,Object> inhtmlmap = new HashMap<String,Object>();
        						Object summary=exitParam.get("summary");
        						inhtmlmap.put("name", "套餐信息");
        						inhtmlmap.put("value", summary);
        						if(summary!=null&&!"".equals(summary)){
        							inhtmlmap.put("value", summary.toString().length()>60?summary.toString().substring(0, 60)+"...":summary);
        						}
        						inhtmllist.add(inhtmlmap);
        					}
            				exitParam.put("htmlvallist", inhtmllist);
            			}
            		}
            		model.addAttribute("resultlst", map.get("prodOfferInfos"));
            	}
            	model.addAttribute("pnLevelId", prams.get("pnLevelId"));
            	if(!"".equals(prams.get("subPage"))){
            		model.addAttribute("subPage", prams.get("subPage"));
            	}
            	if(null!=(prams.get("orderflag"))){
            		model.addAttribute("orderflag", prams.get("orderflag"));
            	 }
            } catch (BusinessException be) {
    			this.log.error("查询号码信息失败", be);
    			return super.failedStr(model, be);
    		} catch (InterfaceException ie) {
    			return super.failedStr(model, ie, prams, ErrorCode.QUERY_MAIN_OFFER);
    		} catch (Exception e) {
    			return super.failedStr(model, ErrorCode.QUERY_MAIN_OFFER, e, prams);
    		}
        } else {
            this.log.error("登录会话不存在，套餐加载失败{}");
        }
		
		return "/pctoken/order/order-services";
    }

	@RequestMapping(value = "/queryPackForTerm", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryPackForTerm(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) throws BusinessException {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> retnMap = new HashMap<String, Object>();
		String aoId = (String) param.get("aoId");
		String pnLevelId = (String) param.get("numLevel");
		//20140219 新增agreementType，合约类型(1-机补，2-话补)，用于后台过滤合约对应的销售品
		String agreementType = MapUtils.getString(param, "agreementType");
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		if (sessionStaff != null) {
			dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
			dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
			dataBusMap.put("staffId", sessionStaff.getStaffId());
			dataBusMap.put("agreementOfferSpecId", aoId);
			dataBusMap.put("agreementType", agreementType);
			dataBusMap.put("pnLevelId", pnLevelId);
			dataBusMap.put("pageSize", 10);
			try {
				retnMap = orderBmo.queryMainOfferSpecList(dataBusMap, flowNum, sessionStaff);
			} catch (BusinessException e) {
				this.log.error("查询主套餐服务接口失败", e);
				return super.failed("查询主套餐服务接口失败", ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			} catch (InterfaceException ie) {
				return super.failed(ie, dataBusMap, ErrorCode.QUERY_MAIN_OFFER);
			} catch (Exception e) {
				log.error("门户/order/queryPackForTerm方法异常", e);
				return super.failed(ErrorCode.QUERY_MAIN_OFFER, e, dataBusMap);
			}
		} else {
			this.log.error("登录会话不存在，套餐加载失败{}");
			return super.failed("登录会话不存在，套餐加载失败",
					ResultConstant.FAILD.getCode());
		}

		return super.successed(retnMap);
	}
	
	@RequestMapping(value = "/queryOfferSpec", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryOfferSpec(
			@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) throws BusinessException {
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> retnMap = new HashMap<String, Object>();
		String offerSpecId = param.get("offerSpecId").toString();
		Map<String, Object> dataBusMap = new HashMap<String, Object>();
		if (sessionStaff != null) {
			dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
			dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
			dataBusMap.put("staffId", sessionStaff.getStaffId());
			dataBusMap.put("offerTypeCd", 1);
			dataBusMap.put("offerSpecId", offerSpecId);
			dataBusMap.put("partyId", -1);

			try {
				retnMap = orderBmo.queryOfferSpecParamsBySpec(dataBusMap,null, sessionStaff);
				
			} catch (BusinessException be) {
				return super.failed(be);
			} catch (InterfaceException ie) {
				return super.failed(ie, dataBusMap, ErrorCode.QUERY_OFFER_SPEC);
			} catch (Exception e) {
				log.error("门户查询销售品构成/order/serviceDetial方法异常", e);
    			return super.failed(ErrorCode.QUERY_OFFER_SPEC, e, dataBusMap);
			}
		} else {
			this.log.error("登录会话不存在，套餐加载失败{}");
			return super.failed("登录会话不存在，套餐加载失败",
					ResultConstant.FAILD.getCode());
		}

		return super.successed(retnMap);
	}
	
	@RequestMapping(value = "/serviceDetial", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse getServiceDetial(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
   	 	String offerSpecId = param.get("specId").toString();
   	 	Map<String, Object> dataBusMap = new HashMap<String, Object>();
		JsonResponse jsonResponse = null;
		if (sessionStaff != null) {
			dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
			dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
			dataBusMap.put("staffId", sessionStaff.getStaffId());
			dataBusMap.put("offerTypeCd", 1);
			dataBusMap.put("offerSpecId", offerSpecId);
			dataBusMap.put("partyId", param.get("custId").toString());
            Map<String, Object> map = null;
            try {
            	map = orderBmo.queryOfferSpecParamsBySpec(dataBusMap,flowNum, sessionStaff);
            	if (map != null&& ResultCode.R_SUCCESS.equals(map.get("code").toString())) {
    				jsonResponse = super.successed(map.get("offerSpec"),
    						ResultConstant.SUCCESS.getCode());
    			} else {
    				jsonResponse = super.failed(map.get("msg").toString(),
    						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
    			}
            } catch (BusinessException be) {
            	return super.failed(be);
            } catch (InterfaceException ie) {
            	return super.failed(ie, dataBusMap, ErrorCode.QUERY_OFFER_SPEC);
    		} catch (Exception e) {
    			log.error("门户查询销售品构成/order/serviceDetial方法异常", e);
    			return super.failed(ErrorCode.QUERY_OFFER_SPEC, e, dataBusMap);
    		}
        } else {
            this.log.error("登录会话不存在，套餐加载失败{}");
        }
		return jsonResponse;
    }
    
    @RequestMapping(value = "/main", method = RequestMethod.POST)
    public String main(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response,HttpSession session) {
    	String forward = "" ;
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	//经办人信息
		String isPhotoGraph = (String) session.getAttribute(SysConstant.SESSION_ISPHOTOGRAPH+"_PC");
		String handlecustNumber = (String) session.getAttribute(SysConstant.SESSION_HANDLECUSTNUMBER+"_PC");
		String handleprovCustAreaId = (String) session.getAttribute(SysConstant.SESSION_HANDLEPROVCUSTAREAID+"_PC");
		String orderAttrFlag = "Y";//经办人必填
		if("Y".equals(isPhotoGraph)){//Y已拍照，如果不传默认为N：未拍照
			if(!StringUtil.isEmptyStr(handlecustNumber) && !StringUtil.isEmptyStr(handleprovCustAreaId)){//传经办人信息
				//定位客户接口 queryCust
				Map<String, Object> custMap = new HashMap<String, Object>();
				custMap.put("acctNbr", "");
				custMap.put("areaId", handleprovCustAreaId);
				custMap.put("diffPlace", "local");
				custMap.put("identidies_type", "客户编码");
				custMap.put("identityCd", "");
				custMap.put("identityNum", "");
				custMap.put("partyName", "");
				custMap.put("queryType", "custNumber");
				custMap.put("queryTypeValue", handlecustNumber);
				try {
					Map<String, Object> resultMap = custBmo.queryCustInfo(custMap,null,sessionStaff);
					List custInfos = new ArrayList();
					if (resultMap!=null&&resultMap.size()>0) {
						custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
						if(custInfos==null||custInfos.size()<=0){//未定位到客户
							model.addAttribute("orderAttrFlag","Y");//Y必填
						}else{
							model.addAttribute("orderAttrFlag","N");//N不允许填，需要把经办人信息下省
							orderAttrFlag = "N";
							Map<String, Object> custInfo = (Map<String, Object>) custInfos.get(0);
							model.addAttribute("orderAttrCustId",custInfo.get("custId"));
						}
					}else{//未定位到客户
						model.addAttribute("orderAttrFlag","Y");//Y必填
					}
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					model.addAttribute("orderAttrFlag","Y");//Y必填
				}
			}else{//未传经办人信息
				model.addAttribute("orderAttrFlag","Y");//Y必填
			}
		}else{//未拍照
			model.addAttribute("orderAttrFlag","Y");//Y必填
		}
		//判断经办人是否必填开关
		String propertiesKey =  "REAL_NAME_PHOTO_"+sessionStaff.getCurrentAreaId().substring(0,3);
		String  userFlag = propertiesUtils.getMessage(propertiesKey);
		if(userFlag!=null && userFlag.equals("OFF") && orderAttrFlag.equals("Y")){
			model.addAttribute("orderAttrFlag","C");//C非必填
		}
		//跳过拍照权限
		String isSkipPhoto = "-1";
		try {
			isSkipPhoto = staffBmo.checkOperatSpec(SysConstant.TGJBRBTQX, sessionStaff);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(isSkipPhoto.equals(SysConstant.STRING_0)&& orderAttrFlag.equals("Y")){
			model.addAttribute("orderAttrFlag","C");//C非必填
		}
    	if("2".equals(String.valueOf(param.get("actionFlag")))){  //套餐变更
    		if (MapUtils.isNotEmpty(param)) {
        		model.addAttribute("main", param);
        	}
    		forward = "/pctoken/offer/offer-change";
    	}else if("21".equals(String.valueOf(param.get("actionFlag")))){
    		if (MapUtils.isNotEmpty(param)) {
        		model.addAttribute("main", param);
        	}
    		forward = "/pctoken/order/member-change";
    	}else if("3".equals(String.valueOf(param.get("actionFlag")))){
    		if (MapUtils.isNotEmpty(param)) {
        		//重新拼接参数
        		if (param.containsKey("offerRoles")) {
        			List<Map> offerRoles = (List<Map>)param.get("offerRoles");
        			if (CollectionUtils.isNotEmpty(offerRoles)) {
        				for (Map map : offerRoles) {
        					String offerRoleId = map.get("offerRoleId").toString();
        					String offerRoleName = map.get("offerRoleName").toString();
        					String typeCd = map.get("memberRoleCd").toString();
        					if (SysConstant.MAIN_OFFER_ROLE_TYPE.equals(typeCd)) {
        						param.put("mainOfferRoleId", offerRoleId);
        						param.put("mainOfferRoleName", offerRoleName);
        					} else if (SysConstant.VICE_OFFER_ROLE_TYPE.equals(typeCd)) {
        						param.put("viceOfferRoleId", offerRoleId);
        						param.put("viceOfferRoleName", offerRoleName);
        					} else {
        						param.put("mainOfferRoleId", offerRoleId);
        					}
        				}
        			}
        		}
        		if (!param.containsKey("offerNum")||param.get("offerNum")==null) {
        			param.put("offerNum", 1);
        		}
        		model.addAttribute("main", param);
        	}
    		forward = "/pctoken/offer/offer-change";
    	}else if("6".equals(String.valueOf(param.get("actionFlag")))){
    		if (MapUtils.isNotEmpty(param)) {
        		if (!param.containsKey("offerNum")||param.get("offerNum")==null) {
        			param.put("offerNum", 1);
        		}
        		model.addAttribute("main", param);
        	}
    		forward = "/pctoken/order/order-member-template";
    	}else {
    		if (MapUtils.isNotEmpty(param)) {
        		if (!param.containsKey("offerNum")||param.get("offerNum")==null) {
        			param.put("offerNum", 1);
        		}
        		model.addAttribute("main", param);
        	}
    		forward = "/pctoken/order/order-main-template";
    	}
    	return forward;
    }
    @RequestMapping(value = "/checkOperate", method = RequestMethod.GET)
    public @ResponseBody String checkOperate(@LogOperatorAnn String flowNum,
  			HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String isAddOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
			SysConstant.EFF_TIME+"_"+sessionStaff.getStaffId());
		try{
			if(isAddOperation==null){
				isAddOperation=staffBmo.checkOperatSpec(SysConstant.EFF_TIME,sessionStaff);
				ServletUtils.setSessionAttribute(super.getRequest(),
						SysConstant.EFF_TIME+"_"+sessionStaff.getStaffId(), isAddOperation);
			}
		} catch (BusinessException e) {
			isAddOperation="1";
		} catch (InterfaceException ie) {
			isAddOperation="1";
		} catch (Exception e) {
			isAddOperation="1";
		}
		return isAddOperation;
    }
    
    @SuppressWarnings("unchecked")
 	@RequestMapping(value = "/getChargeList", method = RequestMethod.GET)
     public String getChargeList(@RequestParam Map<String, Object> param, Model model,
 			@LogOperatorAnn String flowNum,HttpServletResponse response, HttpServletRequest request){
     	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_LOGIN_STAFF);
     	try {
     		if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
     		if(param.get("actionFlag")!=null){
         		String actionFlag=(String)param.get("actionFlag");
         		model.addAttribute("actionFlag", actionFlag);
         		param.remove("actionFlag");
     		}
     		if(param.get("refundType")!=null){
         		String refundType=(String)param.get("refundType");
         		model.addAttribute("refundType", Integer.parseInt(refundType));
         		param.remove("refundType");
     		}
     		if(param.containsKey("businessName")){
     			String businessName = MapUtils.getString(param, "businessName", "");
     			businessName = EncodeUtils.urlDecode(businessName);
         		model.addAttribute("businessName", businessName);
         		param.remove("businessName");
     		}
     		if(param.containsKey("actionTypeName")){
     			String actionTypeName = MapUtils.getString(param, "actionTypeName", "");
     			actionTypeName = EncodeUtils.urlDecode(actionTypeName);
     			model.addAttribute("actionTypeName", actionTypeName);
     			param.remove("actionTypeName");
     		}
     		if(param.get("olNbr")!=null){
         		String olNbr=(String)param.get("olNbr");
         		model.addAttribute("olNbr", olNbr);
         		param.remove("olNbr");
     		}
     		param.put("areaId", sessionStaff.getCurrentAreaId());
     		String checkResultlist = (String)param.get("checkResult");
     		if(!"[]".equals(checkResultlist)&& StringUtils.isNotEmpty(checkResultlist)){
//         		String checkResult = (String)param.get("checkResult");
         		List list = JsonUtil.toObject(checkResultlist, List.class);
//         		param.remove("checkResult");
         		param.put("checkResult", list);
     		}else {
         		param.remove("checkResult");
         		List list = new ArrayList();
         		param.put("checkResult", list);
			}
     		Map<String, Object> datamap = this.orderBmo.queryChargeList(param,flowNum, sessionStaff);
 			if (datamap != null) {
 	    		String code = (String) datamap.get("code");
 				if (ResultCode.R_SUCCESS.equals(code)) {
 	    			List<Map<String,Object>> templist=null; 
 	    			if(datamap.get("chargeItems")!=null){
 	    				Object obj=datamap.get("chargeItems");
 	    				if (obj instanceof List) {
 	    					templist=(List<Map<String,Object>>)obj;
 	    				}else{
 	    					templist=new ArrayList<Map<String,Object>>();
 	    					templist.add((Map<String,Object>)obj);
 	    				}
 	    				model.addAttribute("chargeItems", templist);
 	    			}
 	    			templist=null;
 	    			if(datamap.get("prodInfo")!=null){
 	    				Object obj1=datamap.get("prodInfo");
 	    				if (obj1 instanceof List) {
 	    					templist=(List<Map<String,Object>>)obj1;
 	    				}else{
 	    					templist=new ArrayList<Map<String,Object>>();
 	    					templist.add((Map<String,Object>)obj1);
 	    				}
 	    				model.addAttribute("prodInfo", templist);
 	    			}
 				}
     		}
 			String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_EDITCHARGE+"_"+sessionStaff.getStaffId());
 			try{
	 			if(iseditOperation==null){
	 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.EDITCHARGE_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_EDITCHARGE+"_"+sessionStaff.getStaffId(), iseditOperation);
	 			}
 			} catch (BusinessException e) {
 				iseditOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			iseditOperation="1";
 			} catch (Exception e) {
 				iseditOperation="1";
 			}
 			String isAddOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_ADDCHARGE+"_"+sessionStaff.getStaffId());
 			try{
	 			if(isAddOperation==null){
	 				isAddOperation=staffBmo.checkOperatSpec(SysConstant.ADDCHARGE_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_ADDCHARGE+"_"+sessionStaff.getStaffId(), isAddOperation);
	 			}
 			} catch (BusinessException e) {
 				isAddOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			isAddOperation="1";
 			} catch (Exception e) {
 				isAddOperation="1";
 			}
 			

 			String isEditAdjustOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_EDITADJUSTCHARGE+"_"+sessionStaff.getStaffId());
 			//String isEditAdjustOperation= "0";
 			try{
	 			if(isEditAdjustOperation==null){
	 				isEditAdjustOperation=staffBmo.checkOperatSpec(SysConstant.EDITADJUST_CODE,sessionStaff);
	 				ServletUtils.setSessionAttribute(super.getRequest(),
	 						SysConstant.SESSION_KEY_EDITADJUSTCHARGE+"_"+sessionStaff.getStaffId(), isEditAdjustOperation);
	 			}
 			} catch (BusinessException e) {
 				isEditAdjustOperation="1";
 	 		} catch (InterfaceException ie) {
 	 			isEditAdjustOperation="1";
 			} catch (Exception e) {
 				isEditAdjustOperation="1";
 			}
 			//String iseditOperation="0";
 			model.addAttribute("iseditOperation", iseditOperation);
 			model.addAttribute("isEditAdjustOperation", isEditAdjustOperation);
 			//String iseditOperation="0";
 			model.addAttribute("isAddOperation", isAddOperation);
 			model.addAttribute("olId", param.get("olId"));
 			model.addAttribute("showCancelBtn",ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.STEP_ORDER_CANCEL_OPER_FLAG));
 			getApConfigMap(model, flowNum, sessionStaff);
     	}else{
     		super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
     	}
     	} catch (BusinessException e) {
     		return super.failedStr(model,e);
 		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.CHARGE_LIST);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.CHARGE_LIST, e, param);
		}
     	return "/pctoken/order/order-cal-charge";
     }
    
    /**
     * 取得租金费用项
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	private void getApConfigMap(Model model, String flowNum,
			SessionStaff sessionStaff) {
		String tableName = "SYSTEM";
		String columnItem = "PENALTY_FREE_ITEM";
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		try {
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItem);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItem);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItem, rList);
			}
			ArrayList<Map<String, Object>> al = (ArrayList)rList.get(0).get("PENALTY_FREE_ITEM"); 
			model.addAttribute("acctItemTypeId", al.get(0).get("COLUMN_VALUE"));
		} catch (BusinessException e) {
		    this.log.error("查询配置信息服务出错", e);
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
	}
	
     @RequestMapping(value = "/getChargeAddByObjId", method = RequestMethod.POST)
     public String getChargeAddByObjId(@RequestBody Map<String, Object> param, Model model,
 			@LogOperatorAnn String flowNum,HttpServletResponse response){
     	try {
     		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 					SysConstant.SESSION_KEY_LOGIN_STAFF);
     		Map<String,Object> interMap=new HashMap<String,Object>();
     		interMap.put("areaId", sessionStaff.getCurrentAreaId());
     		interMap.put("boActionTypeCd", param.get("boActionTypeCd"));
     		interMap.put("objId", param.get("objId"));
     		interMap.put("objType", param.get("objType"));
     		Map<String, Object> datamap = this.orderBmo.queryAddChargeItems(interMap,flowNum, sessionStaff);
     		if (datamap != null) {
 	    		String code = (String) datamap.get("code");
 				if (ResultCode.R_SUCCESS.equals(code)) {
 					model.addAttribute("items", datamap.get("list"));
 					model.addAttribute("param", param);
 				}
     		}
     	} catch (BusinessException e) {
     		return super.failedStr(model,e);
 		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.CHARGE_ADDITEM);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.CHARGE_ADDITEM, e, param);
		}
     	return "/order/order-cal-additem";
     }
     @RequestMapping(value = "/queryPayMethodByItem", method = RequestMethod.POST)
     @ResponseBody
     public JsonResponse queryPayMethodByItem(@RequestBody Map<String, Object> param,
 			@LogOperatorAnn String flowNum,HttpServletResponse response){
    	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
 				.getSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_LOGIN_STAFF);
 		Map<String, Object> rMap = null;
 		JsonResponse jsonResponse = null;
 		try {
 			param.put("areaId", sessionStaff.getCurrentAreaId());
 			rMap = orderBmo.queryPayMethodByItem(param, flowNum, sessionStaff);
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
 				jsonResponse = super.successed(rMap.get("list"),
 						ResultConstant.SUCCESS.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("msg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}
 		} catch (BusinessException e) {
 			return super.failed(e);
 		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CHARGE_PAYMETHOD);
		} catch (Exception e) {
			return super.failed(ErrorCode.CHARGE_PAYMETHOD, e, param);
		}
 		return jsonResponse;
     }
     @RequestMapping(value = "/chargeSubmit", method = RequestMethod.POST)
     @ResponseBody
     public JsonResponse chargeSubmit(@RequestBody Map<String, Object> param,
 			@LogOperatorAnn String flowNum,HttpServletResponse response,HttpServletRequest request){
    	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
 				.getSessionAttribute(super.getRequest(),
 						SysConstant.SESSION_KEY_LOGIN_STAFF);
 		Map<String, Object> rMap = null;
 		JsonResponse jsonResponse = null;
 		try {
 			if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
// 				if(param.get("FLAG")!=null && "pos".equals(param.get("FLAG"))){//在线pos回调收费
// 					Map<String,Object> posmap=new HashMap<String,Object>();
// 					posmap.put("olId", param.get("olId"));
// 					posmap.put("FLAG", "select");
// 					rMap = orderBmo.GetOLpos(posmap, flowNum, sessionStaff);
// 					List list = (List) rMap.get("result");
// 					Map aa = (Map)list.get(0);
// 					Object obj = (Object) aa.get("PARAM");
// 					param = JsonUtil.toObject((String)obj, Map.class);
// 				}
	 			log.debug("param={}", JsonUtil.toString(param));
	 			param.put("areaId", sessionStaff.getCurrentAreaId());
	 			
	 			//去除chargeItems中的重复项，根据acctItemId判断
	 			List<Map<String, String>> chargeItems = (List<Map<String, String>>) param.get("chargeItems");
	 			if(chargeItems != null && chargeItems.size() != 0){
	 				List<Map<String, String>> checkedChargeItems = new ArrayList<Map<String,String>>();
	 				for(Map<String, String> item : chargeItems){
	 					if(item != null){
	 						String acctItemId = item.get("acctItemId");
	 						if(acctItemId != null){
	 							boolean exist = false;
	 							for(Map<String, String> checkedItem : checkedChargeItems){
	 								if(acctItemId.equals(checkedItem.get("acctItemId"))){
	 									exist = true;
	 									break;
	 								}
	 							}
	 							if(!exist){
	 								checkedChargeItems.add(item);
	 							}
	 						}
	 					}
	 				}
	 				param.put("chargeItems", checkedChargeItems);
	 			}
	 			
	 			rMap = orderBmo.chargeSubmit(param, flowNum, sessionStaff);
	 			log.debug("return={}", JsonUtil.toString(rMap));
	 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
	 				jsonResponse = super.successed("收费成功",
	 						ResultConstant.SUCCESS.getCode());
	 			} else {
	 				jsonResponse = super.failed(rMap.get("msg"),
	 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
	 			}
 			}else{
 				jsonResponse = super.failed("订单已经建档成功,不能重复操作!",
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}
 		} catch (BusinessException e) {
 			return super.failed(e);
 		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CHARGE_SUBMIT);
		} catch (Exception e) {
			return super.failed(ErrorCode.CHARGE_SUBMIT, e, param);
		}
 		return jsonResponse;
     }
     
     /**
      * 帐户资料查询（新装与改帐务定制关系时查询已有帐户）
      * @param param
      * @param model
      * @param flowNum
      * @param response
      * @return
      */
    @RequestMapping(value = "/account", method = RequestMethod.POST)
  	@ResponseBody
    public JsonResponse queryAccountInfo(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
  			HttpServletResponse response) {
  		
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
  		
    	JsonResponse jr = null;
  		
    	try {
    		if (param.get("areaId")==null) {
    			param.put("areaId", sessionStaff.getCurrentAreaId());
    		}
    		
  			Map<String, Object> resultMap = orderBmo.queryAccountInfo(param, flowNum, sessionStaff);
  			
  			if(MapUtils.isNotEmpty(resultMap)){
  				jr = successed(resultMap, 0);
  			}else{
  				jr = failed("返回数据异常，请联系管理员", 1);
  			}
  		}catch(BusinessException be){
  			return super.failed(be);
  		}catch(InterfaceException ie){
			return super.failed(ie, param, ErrorCode.QUERY_ACCT);
		}catch(Exception e){
			return super.failed(ErrorCode.QUERY_ACCT, e, param);
		}
  		return jr;
  	}
    
    /**
     * 产品鉴权
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/prodAuth", method = RequestMethod.POST)
 	@ResponseBody
 	public JsonResponse prodAuth(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum,
 			HttpServletResponse response) {
    	
 		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
  		
 		JsonResponse jr = null;
 		try {
 			Map<String, Object> returnMap = custBmo.custAuth(param, flowNum, sessionStaff);
 			String isValidateStr = null ;
 			if(returnMap.get("isValidate")!=null){
				isValidateStr = returnMap.get("isValidate").toString() ;
			}else if(returnMap.get("result")!=null){
				Map<String, Object> tmpMap = MapUtils.getMap(returnMap, "result");
				isValidateStr = MapUtils.getString(tmpMap, "isValidate");
			}
			if ("true".equals(isValidateStr)){
				jr = successed("", 0);
			}else{
				jr = failed("鉴权未通过，请确认接入号与产品密码的正确性", 1);
			}
 		} catch (BusinessException be) {
 			this.log.error("产品鉴权失败", be);
 			return super.failed(be);
 		} catch (InterfaceException ie) {
 			return super.failed(ie, param, ErrorCode.CUST_AUTH);
		} catch (Exception e) {
			return super.failed(ErrorCode.CUST_AUTH, e, param);
		}
 		return jr;
 	}
    
    
    /**
     * 查询群组成员
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/queryCompmenber", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse addComp(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
    		HttpServletResponse response) { 
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("compProdId", param.get("compProdId").toString());
    	dataBusMap.put("accessNumber", param.get("accessNumber").toString());
    	dataBusMap.put("areaId", sessionStaff.getCurrentAreaId().toString());
    	Map<String, Object> datamap = null;
    	JsonResponse jr = null;
    	try {
			datamap = orderBmo.queryCompProdMemberByAn(dataBusMap, flowNum, sessionStaff);
			if (datamap != null&& ResultCode.R_SUCCESS.equals(datamap.get("code").toString())) {
				jr = super.successed(datamap.get("compProdMemberInfos"),
						ResultConstant.SUCCESS.getCode());
			} else {
				jr = super.failed(datamap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
			return jr;
		} catch (BusinessException be) {
			this.log.error("群组产品实例成员信息查询失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, dataBusMap, ErrorCode.QUERY_COMPPRODMEMBER);
		} catch (Exception e) {
			log.error("门户/order/queryCompmenber方法异常", e);
			return super.failed(ErrorCode.QUERY_COMPPRODMEMBER, e, dataBusMap);
		}
    }
    
    /**
     * 加入群组
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/addComp", method = { RequestMethod.POST })
    public String addComp(@RequestBody Map<String, Object> param, Model model,HttpServletResponse response) { 
    	return "/order/order-addcomp";
    }
    
    /**
     * 退出群组
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/removeComp", method = { RequestMethod.POST })
    public String removeComp(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
    		HttpServletResponse response) {
    	return "/order/order-removecomp";
    }
    
    /**
     * 产品构成查询
     * @param param
     * @param model
     * @return
     */
    @RequestMapping(value = "/compPspecGrps", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse queryCompPspecGrpsBySpecId(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
    		HttpServletResponse response) { 
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
 		Map<String, Object> dataBusMap = new HashMap<String, Object>();
 		dataBusMap.put("prodSpecId", param.get("productId").toString());
 		dataBusMap.put("channelId", sessionStaff.getCurrentChannelId());
 		dataBusMap.put("areaId", sessionStaff.getCurrentAreaId());
 		Map<String, Object> returnMap = null;
    	List<Map<String, Object>> list = null;
    	JsonResponse jr = null;
    	try {
    		returnMap = orderBmo.queryCompPspecGrpsBySpecId(dataBusMap, flowNum, sessionStaff);
			if (MapUtils.isNotEmpty(returnMap)) {
 				if(returnMap.get("code").equals(ResultCode.R_SUCCESS)){
 					Map<String, Object> prodSpec = (Map<String, Object>) returnMap.get("prodSpec");
 					jr = super.successed(prodSpec.get("compPspecCompGrps"),
    						ResultConstant.SUCCESS.getCode());
 				}
 				else{
 					jr = failed(returnMap.get("msg"), 1);
 				}
 			}
 			else{
 				jr = failed("数据返回异常，请联系管理员", 1);
 			}
			return jr;
		} catch (BusinessException be) {
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_COMPSPEC);
		} catch (Exception e) {
			log.error("门户/order/compPspecGrps方法异常", e);
			return super.failed(ErrorCode.QUERY_COMPSPEC, e, param);
		}
		
    }
    
    /**
     * 产品下终端实例数据查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryTerminalInfo", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryTerminalInfo(@RequestBody Map<String, Object> param, String flowNum, HttpServletResponse response){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("prodId", MapUtils.getString(param, "prodId", ""));
    	dataBusMap.put("acctNbr", MapUtils.getString(param, "acctNbr", ""));
    	dataBusMap.put("areaId", MapUtils.getString(param, "areaId", ""));
    	dataBusMap.put("isServiceOpen", MapUtils.getString(param, "isServiceOpen", ""));
    	JsonResponse jr = new JsonResponse();
    	try{
    		Map<String, Object> resultMap = orderBmo.queryOfferCouponById(dataBusMap, flowNum, sessionStaff);
    		String couponTypeCd = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"couponTypeCd");
        	if (resultMap != null&& ResultCode.R_SUCCESS.equals(resultMap.get("code").toString())) {
        		Map<String, Object> result = (Map<String, Object>) resultMap.get("result");
        		List<Map<String, Object>> offerCoupon = (List<Map<String, Object>>)result.get("offerCoupon");
        		Map returnMap = new HashMap();
        		if(offerCoupon.isEmpty()){
					jr = super.failed("未查询到旧卡物品信息",ResultConstant.FAILD.getCode());
				}else{
					for (int i=0;i<offerCoupon.size();i++){
						String currentCouponTypeCd = offerCoupon.get(i).get("couponTypeCd").toString();
						if(null != couponTypeCd && couponTypeCd.equals(currentCouponTypeCd)){
							returnMap = (Map) offerCoupon.get(i);
						}
					}
					if(returnMap.isEmpty()){
						jr = super.failed("旧卡物品信息未找到匹配的UIM类型数据",ResultConstant.FAILD.getCode());
					}else{
						jr = super.successed(returnMap,ResultConstant.SUCCESS.getCode());
					}
				}
			} else {
				jr = super.failed(resultMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
        	return jr;
   		}catch (BusinessException be) {
   			this.log.error("获取产品帐户信息失败", be);
   			return super.failed(be);
   		} catch (InterfaceException ie) {
   			return super.failed(ie, dataBusMap, ErrorCode.ORDER_OFFERCOUPON);		
		} catch (Exception e) {
			log.error("门户/order/queryTerminalInfo方法异常", e);
			return super.failed(ErrorCode.ORDER_OFFERCOUPON, e, dataBusMap);
		}
    }
    /**
     * 产品下帐户信息查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryProdAcctInfo", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryProdAcctInfo(@RequestBody Map<String, Object> param, String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
      	
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("prodId", MapUtils.getString(param, "prodId"));
    	dataBusMap.put("acctNbr", MapUtils.getString(param, "acctNbr"));
   	    dataBusMap.put("areaId", MapUtils.getString(param, "areaId"));
    	    	
    	JsonResponse jr = new JsonResponse();
    	
    	try{
    		Map<String, Object> resultMap = orderBmo.queryProdAcctInfo(dataBusMap, flowNum, sessionStaff);
    		    		
    		if(resultMap!=null){
    			Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
    			ArrayList<Map<String, Object>> prodAcctInfos = (ArrayList<Map<String, Object>>)result.get("prodAcctInfos");
    			jr = successed(prodAcctInfos, 0);
    		}
    		else{
    			jr = failed("", 1);
    		}
   		}catch (BusinessException be) {
   			return super.failed(be);
   		} catch (InterfaceException ie) {
			return super.failed(ie, dataBusMap, ErrorCode.QUERY_PROD_ACCT);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_PROD_ACCT, e, dataBusMap);
		}
   		return jr;
    }
    
    /**
     * 转至改付费帐户页面
     * @param prodAcctInfos
     * @param model
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/preChangeAccount", method = RequestMethod.POST)
    public String preChangeAccount(@RequestBody ArrayList<Map<String, Object>> prodAcctInfos, Model model, @LogOperatorAnn String flowNum){
    	   	
    	model.addAttribute("prodAcctInfos", prodAcctInfos);
    	
    	return "/order/order-change-account";
    }
    
    /* bxw作废发票*/
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/invaideInvoice", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse invaideInvoice(WebRequest request, String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
 				SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jr = new JsonResponse();
    	
    	Map<String, Object> dataBusMap = new HashMap<String, Object>();
    	dataBusMap.put("olId", request.getParameter("olId"));
    	dataBusMap.put("soNbr", request.getParameter("soNbr"));
    	dataBusMap.put("areaId", sessionStaff.getCurrentAreaId().toString());
    	
    	try{
    		List<Object> listId = new ArrayList<Object>();
    		int bInvoice = -1 ;
    		Map<String, Object> resultMap = printBmo.getInvoiceItems(dataBusMap, flowNum, sessionStaff);	
    		if(resultMap!=null){
    			if(resultMap.get("invoiceInfos")!=null){
    				Object invoiceInfos = resultMap.get("invoiceInfos");
    				if(invoiceInfos instanceof List){
    					List<Object> list = (List<Object>)invoiceInfos;
    					if(list!=null&&list.size()>0){
    						for(Object obj:list){
    							if(obj!=null&&!obj.equals("null")&&obj instanceof Map){
    								Map invoiceInfo = (Map)obj ;
    								listId.add(invoiceInfo.get("invoiceId"));
    								bInvoice = 1 ;
    							}
        					}
    						if(bInvoice==-1){
    							bInvoice = 0 ;
    						}
    					}else{
    						bInvoice = 0 ;
    					}
    				}
    			}
    		}
    		if(bInvoice>0){//bInvoice费用接口调用成功，如果有list数据，调用作废接口，否则？？？？	
    			Map<String, Object> parms = new HashMap<String, Object>();
				parms.put("invoiceIds", listId);
				parms.put("areaId", sessionStaff.getCurrentAreaId().toString());
				Map<String, Object> resultInvalid = orderBmo.updateInvoiceInvalid(parms, flowNum, sessionStaff);	
				if(resultInvalid.get("code")!=null&&resultInvalid.get("code").equals("0")){
					jr = successed("发票作废成功！", 0);
				}else{
					jr = failed("发票作废失败！", 1);
				}
    		}else if(bInvoice==0){
    			jr = failed("未获取到发票信息！", 2);
    		}else{
    			jr = failed("获取发票信息失败！", 3);
    		}
		} catch (BusinessException be) {
			this.log.error("发票作废失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, dataBusMap, ErrorCode.INVOICE_INVALID);
		} catch (Exception e) {
			log.error("发票作废/order/invaideInvoice方法异常", e);
			return super.failed(ErrorCode.INVOICE_INVALID, e, dataBusMap);
		}
   		return jr;
    }
    
    @RequestMapping(value = "/checkGroupShortNum", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse groupShortNbrQuery(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		Map<String, Object> releaseMap = null;
		JsonResponse jsonResponse = null;
		String groupShortNbr = param.get("shortNbr").toString();
		param.remove("shortNbr");
		try {
			param.put("lanId", sessionStaff.getCurrentAreaId());
			boolean isBothExecute = param.containsKey("oldnum");
			if(isBothExecute){
				String oldnum = param.get("oldnum").toString();
				param.remove("oldnum");
				param.put("groupShortNbr", oldnum);
				param.put("statusCd", "1000");
				releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				param.remove("groupShortNbr");
				param.put("groupShortNbr", groupShortNbr);
				param.put("statusCd", "1102");
				rMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					jsonResponse=super.successed("校验成功！", ResultConstant.SUCCESS.getCode());
				}else {
					jsonResponse = super.failed(rMap.get("msg"),ResultConstant.FAILD.getCode());
				}
			}else{
				param.put("groupShortNbr", groupShortNbr);
				rMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
					jsonResponse=super.successed(rMap.get("msg"), ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(rMap.get("msg"),ResultConstant.FAILD.getCode());
				}
			}
			return jsonResponse;
		} catch (BusinessException be) {
			this.log.error("短号校验服务出错", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.SHORT_NUM_CHECK);
		} catch (Exception e) {
			log.error("门户/order/checkGroupShortNum方法异常", e);
			return super.failed(ErrorCode.SHORT_NUM_CHECK, e, param);
		}
		
	}
    
    /*bxw短号修改：校验*/
    @RequestMapping(value = "/checkReleaseShortNum", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse checkReleaseShortNum(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		
		String checkNbr = param.get("checkNbr")==null?"":param.get("checkNbr").toString();
		String groupShortNbr = param.get("groupShortNbr")==null?"":param.get("groupShortNbr").toString();
		if(groupShortNbr==null||groupShortNbr.equals("")||groupShortNbr.equals("null")){
			jsonResponse = super.failed("请输入新的短号再检查！",
					ResultConstant.FAILD.getCode());
		}else if(groupShortNbr.equals(checkNbr)){
			jsonResponse = super.failed("新旧短号相同，请修改再提交！",
					ResultConstant.FAILD.getCode());
		}
		try{
			param.remove("checkNbr");
			if(checkNbr!=null&&!checkNbr.equals("")&&!checkNbr.equals("null")){
				param.put("groupShortNbr", checkNbr);
				param.put("statusCd", "1000");
				Map releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
				//releaseMap.get("code");
			}
			param.put("groupShortNbr", groupShortNbr);
			param.put("statusCd", "1102");
			Map releaseMap = orderBmo.groupShortNbrQuery(param, flowNum, sessionStaff);
			if (releaseMap != null&& ResultCode.R_SUCCESS.equals(releaseMap.get("code").toString())) {
				jsonResponse = super.successed(releaseMap.get("msg"), ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(releaseMap.get("msg"),ResultConstant.FAILD.getCode());
			}
			
		} catch (BusinessException be) {
			
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, param, ErrorCode.SHORT_NUM_CHECK);
		} catch (Exception e) {
			log.error("短号校验/order/checkReleaseShortNum方法异常", e);
			return super.failed(ErrorCode.SHORT_NUM_CHECK, e, param);
		}
		return jsonResponse;
	}
    /*bxw发展人类型*/
	@RequestMapping(value="/queryPartyProfileSpecList", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> queryPartyProfileSpecList(HttpSession session,WebRequest request) throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = sessionStaff.getCurrentAreaId() ;
		Map<String,Object> param = new HashMap<String,Object>();
		param.put("areaId", areaId);
		Map<String, Object> result = orderBmo.assistantTypeQuery(param, null, sessionStaff);
		return result;
	}
	/**
	 * 跳转手动归档页面
	 * @return
	 */
	@RequestMapping(value="/autoArchivedMain", method ={ RequestMethod.POST, RequestMethod.GET})
	public String autoArchivedMain(){
	    return "/order/order-update-archived";
	}
	/**
	 * {olNbr:"", olId :"" ,distributorId : ""}
	 * olNbr购物车流水号
	 * olId订单id
	 * distributorId转售商id
	 * 执行手动归档
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/updateArchivedAuto", method ={ RequestMethod.POST, RequestMethod.GET})
	@ResponseBody
    public  JsonResponse  updateArchivedAuto(@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum,WebRequest request){
	    SessionStaff sessionStaff = (SessionStaff) ServletUtils
                .getSessionAttribute(super.getRequest(),
                        SysConstant.SESSION_KEY_LOGIN_STAFF);
	    Map<String, Object> res=new HashMap<String, Object>();
	    try {
	        res=orderBmo.updateArchivedAuto( param,flowNum,sessionStaff);
	        return super.successed(res);
        }  catch (BusinessException be) {
            
            return super.failed(be);
        } catch (InterfaceException ie) {

            return super.failed(ie, param, ErrorCode.UPDATE_ARCHIVED_AUTO);
        } catch (Exception e) {
            log.error("执行手动归档方法异常/order/updateArchivedAuto", e);
            return super.failed(ErrorCode.STAFF_LOGIN, res, param);
        }
    }
	
	@RequestMapping(value = "/checkRuleToProv", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkRuleToProv(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
	   	 
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
			JsonResponse jsonResponse = null;
			try {
				param.put("areaId", sessionStaff.getCurrentAreaId());
				param.put("portalFlag", "Y");
				Map<String, Object> resultMap = orderBmo.checkRuleToProv(param, flowNum, sessionStaff);
				Map<String, Object> returnMap = new HashMap<String, Object>();
				
				String provCheckCode = MapUtils.getString(resultMap, "returnCode", "0000");//下省校验结果编码
				String provCheckMsg = MapUtils.getString(resultMap, "resultMsg", "未返回校验结果信息");//下省校验结果信息
				
				//下省校验成功
				if("0000".equals(provCheckCode)){
					if (resultMap.get("checkResult")!=null){
						List<Map<String,String>> checkResult = new ArrayList<Map<String,String>>();
						List<Map<String,String>> list = (List<Map<String,String>>) resultMap.get("checkResult");
						for(Map<String,String> map : list){
							if (SysConstant.REDUCE_PRESTORE_STATE.equals(map.get("code"))){
								checkResult.add(map);
							}
						}
						returnMap.put("returnCode", "0000");
						returnMap.put("checkResult", checkResult);
					}
					jsonResponse = super.successed(returnMap, ResultConstant.SUCCESS.getCode());
				}
				//下省校验有错误
				else {
					//省内校验欠费的错误编码，判断当前工号有否带欠费受理的权限酌情处理
					if(SysConstant.PROV_CHECK_OVERDUE_1.equals(provCheckCode) || SysConstant.PROV_CHECK_OVERDUE_2.equals(provCheckCode)){
						String canDoOverdueBusi = staffBmo.checkOperatSpec(SysConstant.OVERDUE_BUSI_CODE, sessionStaff);
						//当前工号有继续受理的权限
						if("0".equals(canDoOverdueBusi)){
							if (resultMap.get("checkResult")!=null){
								List<Map<String,String>> checkResult = new ArrayList<Map<String,String>>();
								List<Map<String,String>> list = (List<Map<String,String>>) resultMap.get("checkResult");
								for(Map<String,String> map : list){
									if (SysConstant.REDUCE_PRESTORE_STATE.equals(map.get("code"))){
										checkResult.add(map);
									}
								}
								returnMap.put("returnCode", provCheckCode);
								returnMap.put("checkResult", checkResult);
							}
							jsonResponse = super.successed(returnMap, ResultConstant.SUCCESS.getCode());
						}
						//当前工号没有继续受理的权限，返回错误信息
						else{
							returnMap.put("errCode", provCheckCode);
							returnMap.put("errMsg", provCheckMsg);
							jsonResponse = super.failed(returnMap, ResultConstant.FAILD.getCode());
						}
					}
					//其他错误编码，直接返回错误信息
					else{
						returnMap.put("errCode", provCheckCode);
						returnMap.put("errMsg", provCheckMsg);
						jsonResponse = super.failed(returnMap, ResultConstant.FAILD.getCode());
					}
				}
			} catch (BusinessException e) {
				return super.failed(e);
			} catch (InterfaceException ie) {
				return super.failed(ie, param, ErrorCode.CHECK_RULETOPRO);
			} catch (Exception e) {
				return super.failed(ErrorCode.CHECK_RULETOPRO, e, param);
			}
			return jsonResponse;
	    }
	
	@RequestMapping(value="/inOrderYsl", method ={ RequestMethod.POST, RequestMethod.GET})
	public String inOrderYsl(){
	    return "/order/order-ysl";
	}
	
	@RequestMapping(value="/queryOrderYsl", method ={ RequestMethod.POST, RequestMethod.GET})
    @AuthorityValid(isCheck = true)
	public String queryOrderYsl(Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_endDt", endTime);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
	    return "/orderQuery/query-order-ysl";
	}
	/**
	 * 终端预约
	 * @param model
	 * @return
	 */
	@RequestMapping(value="/queryOrderZdyy", method ={ RequestMethod.POST, RequestMethod.GET})
	public String queryOrderZdyy(Model model){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		Calendar c = Calendar.getInstance();
		SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");
		String endTime = f.format(c.getTime());
		c.add(Calendar.DATE, -7);
		String startTime = f.format(c.getTime());
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		
		model.addAttribute("p_startDt", startTime);
		model.addAttribute("p_endDt", endTime);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
	    return "/orderQuery/query-order-zdyy";
	}
	
	/*预受理业务类型*/
	@RequestMapping(value = "/querybusitype", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse querybusitype(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String resultList= null;
		try{		
 			rMap = this.orderBmo.querybusitype(param, null, sessionStaff);
 			resultList =rMap.get("result").toString();
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())&&!"[]".equals(resultList)) {
 				jsonResponse = super.successed(rMap.get("result"),
 						ResultConstant.SUCCESS.getCode());
 			}else if("[]".equals(resultList)) {
 				jsonResponse = super.failed("查询业务类型无数据",
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("查询业务类型失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QRY_BUSITYPE);
		} catch (Exception e) {
			log.error("门户/order/querybusitype方法异常", e);
			return super.failed(ErrorCode.QRY_BUSITYPE, e, param);
		}
	}
	
	/*预受理业务动作*/
	@RequestMapping(value = "/querybusiactiontype", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse querybusiactiontype(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String resultList= null;
		try{		
 			rMap = this.orderBmo.querybusiactiontype(param, null, sessionStaff);
// 			resultList =rMap.get("result").toString();
// 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())&&!"[]".equals(resultList)) {
 				jsonResponse = super.successed(rMap.get("result"),
 						ResultConstant.SUCCESS.getCode());
// 			}else if("[]".equals(resultList)) {
// 				jsonResponse = super.failed("查询业务动作无数据",
// 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
// 			} else {
// 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
// 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
// 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("查询业务动作失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QRY_BUSIACTIONTYPE);
		} catch (Exception e) {
			log.error("门户/order/querybusiactiontype方法异常", e);
			return super.failed(ErrorCode.QRY_BUSIACTIONTYPE, e, param);
		}
	}
	
	/*预受理订单提交*/
	@RequestMapping(value = "/suborderysl", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse suborderysl(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response,@LogOperatorAnn String flowNum){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		String STAFF_ID = sessionStaff.getStaffId();
		String staff_nbr = sessionStaff.getStaffCode();
		String STAFF_NAME = sessionStaff.getStaffName();
		String CHANNEL_ID = sessionStaff.getCurrentChannelId();
		String channel_name = sessionStaff.getCurrentChannelName();
		String areaid = sessionStaff.getCurrentAreaId();
		String areaname = sessionStaff.getCurrentAreaName();
		String org_id = sessionStaff.getOrgId();
		String org_name = sessionStaff.getOrgName();
		String CUST_SO_NUMBER = "YSL"+DateFormatUtils.format(new Date(), "yyyyMMddHHmmssSSS")+RandomStringUtils.randomNumeric(3);
		
		param.put("STAFF_ID", STAFF_ID);
		param.put("staff_nbr", staff_nbr);
		param.put("STAFF_NAME", STAFF_NAME);
		param.put("CHANNEL_ID", CHANNEL_ID);
		param.put("channel_name", channel_name);
		param.put("areaid", areaid);
		param.put("areaname", areaname);
		param.put("CUST_SO_NUMBER", CUST_SO_NUMBER);
		param.put("org_id", org_id);
		param.put("org_name", org_name);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{		
 			rMap = this.orderBmo.suborderysl(param, null, sessionStaff);
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())) {
 				if("9".equals(param.get("BUSI_TYPE_CD"))){
 					String sendterminal = (String)param.get("sendterminal");
 					String phoneNumber = (String)param.get("CONTACT_NO");
 					String cust_so_number = (String)rMap.get("CUST_SO_NUMBER");
 					Map<String, Object> msgMap = sendMsg(request, flowNum,sendterminal,phoneNumber,cust_so_number);
 				}
// 				rMap.put("CUST_SO_NUMBER", CUST_SO_NUMBER);
 				jsonResponse = super.successed(rMap,
 						ResultConstant.SUCCESS.getCode());
 			} else {
 				throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_INSERT_ORDERYSLINFO, String.valueOf(rMap.get("resultMsg")), JsonUtil.toString(param));
// 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
// 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("预受理订单提交失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.INSERT_ORDERYSL);
		} catch (Exception e) {
			log.error("门户/order/suborderysl方法异常", e);
			return super.failed(ErrorCode.INSERT_ORDERYSL, e, param);
		}
	}
	
	/*终端预约状态更新*/
	@RequestMapping(value = "/updateorderzdyy", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse updateorderzdyy(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		String staff_id = sessionStaff.getStaffId();
		String staff_nbr = sessionStaff.getStaffCode();
		String staff_name = sessionStaff.getStaffName();
		String channel_id = sessionStaff.getCurrentChannelId();
		String channel_name = sessionStaff.getCurrentChannelName();
		String areaid = sessionStaff.getCurrentAreaId();
		String areaname = sessionStaff.getCurrentAreaName();
		String org_id = sessionStaff.getOrgId();
		String org_name = sessionStaff.getOrgName();
		
		param.put("staff_id", staff_id);
		param.put("staff_nbr", staff_nbr);
		param.put("staff_name", staff_name);
		param.put("channel_id", channel_id);
		param.put("channel_name", channel_name);
		param.put("areaid", areaid);
		param.put("areaname", areaname);
		param.put("org_id", org_id);
		param.put("org_name", org_name);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{		
 			rMap = this.orderBmo.updateorderzdyy(param, null, sessionStaff);
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("resultCode").toString())) {
 				rMap.put("cust_so_number", param.get("cust_so_number"));
 				jsonResponse = super.successed(rMap,
 						ResultConstant.SUCCESS.getCode());
 			} else {
 				throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_UPDATE_ORDERZDYYINFO, String.valueOf(rMap.get("resultMsg")), JsonUtil.toString(param));
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("终端预约状态更新失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.INSERT_ORDERYSL);
		} catch (Exception e) {
			log.error("门户/order/updateorderzdyy方法异常", e);
			return super.failed(ErrorCode.UPDATE_ORDERZDYY, e, param);
		}
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryyslList", method = RequestMethod.GET)
    public String queryyslList(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer upPage = 1 ;
        Integer downPage = 10 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
        param.put("startDt", request.getParameter("startDt"));
		param.put("endDt", request.getParameter("endDt"));
		param.put("areaId", request.getParameter("areaId"));
		param.put("busitype", request.getParameter("busitype"));
		param.put("channelId", request.getParameter("channelId"));
		param.put("accnum", request.getParameter("accnum"));
		param.put("custname", request.getParameter("custname"));
		param.put("CustIdCard", request.getParameter("CustIdCard"));
		param.put("olNbr", request.getParameter("olNbr"));
        try{
    		nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
    		if(nowPage!=1){
    			upPage = (nowPage-1)*pageSize+1;
    			downPage = pageSize*nowPage;
    		}
    		param.put("nowPage", upPage);
    		param.put("pageSize", downPage);
    		
    		Map<String, Object> map = orderBmo.queryyslList(param, null, sessionStaff);
        	if(map!=null&&map.get("orderLists")!=null){
        		list =(List<Map<String, Object>>)map.get("orderLists");
        		totalSize = (Integer)map.get("totalCnt");
         	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            		nowPage,
            		pageSize,
            		totalSize<1?1:totalSize,
    				list);
    		model.addAttribute("pageModel", pm);
    		model.addAttribute("code", map.get("code"));
			model.addAttribute("mess", map.get("message"));
			
        	return "/orderQuery/order-ysl-list";
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.QUERY_ORDERYSL);
		} catch (Exception e) {
			log.error("预受理订单查询/queryyslList方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_ORDERYSL, e, param);
		}
    }
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryzdyyList", method = RequestMethod.GET)
    public String queryzdyyList(HttpSession session,Model model,WebRequest request) throws BusinessException{
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> param = new HashMap<String, Object>();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        Integer nowPage = 1 ;
        Integer upPage = 1 ;
        Integer downPage = 10 ;
        Integer pageSize = 10 ;
        Integer totalSize = 0 ;
        
        param.put("startDt", request.getParameter("startDt"));
		param.put("endDt", request.getParameter("endDt"));
		param.put("areaId", request.getParameter("areaId"));
		param.put("busitype", request.getParameter("busitype"));
		param.put("channelId", request.getParameter("channelId"));
		param.put("accnum", request.getParameter("accnum"));
		param.put("custname", request.getParameter("custname"));
		param.put("CustIdCard", request.getParameter("CustIdCard"));
		param.put("olNbr", request.getParameter("olNbr"));
		param.put("olType", request.getParameter("olType"));
        try{
    		nowPage = Integer.parseInt(request.getParameter("nowPage").toString());
    		pageSize = Integer.parseInt(request.getParameter("pageSize").toString());
    		if(nowPage!=1){
    			upPage = (nowPage-1)*pageSize+1;
    			downPage = pageSize*nowPage;
    		}
    		param.put("nowPage", upPage);
    		param.put("pageSize", downPage);
    		
    		Map<String, Object> map = orderBmo.queryzdyyList(param, null, sessionStaff);
        	if(map!=null&&map.get("orderLists")!=null){
        		list =(List<Map<String, Object>>)map.get("orderLists");
        		totalSize = (Integer)map.get("totalCnt");
         	}
        	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
            		nowPage,
            		pageSize,
            		totalSize<1?1:totalSize,
    				list);
    		model.addAttribute("pageModel", pm);
    		model.addAttribute("code", map.get("code"));
			model.addAttribute("mess", map.get("message"));
			model.addAttribute("countInfo",map.get("countInfo"));
			
        	return "/orderQuery/order-zdyy-list";
        } catch (BusinessException be) {

			return super.failedStr(model, be);
		} catch (InterfaceException ie) {

			return super.failedStr(model, ie, param, ErrorCode.QUERY_ORDERYSL);
		} catch (Exception e) {
			log.error("预受理订单查询/queryyslList方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_ORDERYSL, e, param);
		}
    }
	
	@RequestMapping(value = "/queryYslDetail", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryYslDetail(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String status_cd = (String) param.get("status_cd");
		try{		
 			rMap = orderBmo.queryyslList(param, null, sessionStaff);
 			rMap.put("status_cd", status_cd);
			jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("查询业务类型失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QRY_BUSITYPE);
		} catch (Exception e) {
			log.error("预受理订单详情/queryYslDetail方法异常", e);
			return super.failed(ErrorCode.QUERY_ORDERYSL, e, param);
		}
	}
	
	@RequestMapping(value = "/queryZdyyDetail", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryZdyyDetail(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		String status_cd = (String) param.get("status_cd");
		try{		
			rMap = orderBmo.queryzdyyList(param, null, sessionStaff);
			rMap.put("status_cd", status_cd);
			jsonResponse = super.successed(rMap,ResultConstant.SUCCESS.getCode());
			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("查询业务类型失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QRY_BUSITYPE);
		} catch (Exception e) {
			log.error("预受理订单详情/queryYslDetail方法异常", e);
			return super.failed(ErrorCode.QUERY_ORDERZDYY, e, param);
		}
	}
	
	@RequestMapping(value = "/updateChargeInfoForCheck", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse updateChargeInfoForCheck(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletRequest request,HttpServletResponse response,HttpSession session){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
   	 
	   	String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_DEPOSIT+"_"+sessionStaff.getStaffId());
		try{
				if(iseditOperation==null){
					iseditOperation=staffBmo.checkOperatSpec(SysConstant.DEPOSIT_CODE,sessionStaff);
					ServletUtils.setSessionAttribute(super.getRequest(),
							SysConstant.SESSION_KEY_DEPOSIT+"_"+sessionStaff.getStaffId(), iseditOperation);
				}
			} catch (BusinessException e) {
				iseditOperation="1";
	 		} catch (InterfaceException ie) {
	 			iseditOperation="1";
			} catch (Exception e) {
				iseditOperation="1";
			}
			
			Map<String, Object> rMap = null;
			JsonResponse jsonResponse = null;
			if("0".equals(iseditOperation)){
				try {
					param.put("areaId", sessionStaff.getCurrentAreaId());
					rMap = orderBmo.updateChargeInfoForCheck(param, flowNum, sessionStaff);
					if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
						String olposurl="";
						if(!"".equals(sessionStaff.getAreaId())){
							String pos="pos";
							if(!CommonMethods.isOINet(request)){
								pos+="O";
								log.debug("在线pos==============", pos);
							}
							olposurl=MySimulateData.getInstance().getNeeded((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),InterfaceClient.CHECK_LOGIN+"-"+ sessionStaff.getAreaId().substring(0, 3)+"0000", pos);
							log.debug("在线olposurl==============", olposurl);
							Map<String,Object> map=new HashMap<String,Object>();
							map.put("olId", param.get("olId"));
							map.put("olNbr", param.get("soNbr"));
							map.put("typeclass", "");
							map.put("result", "");
							map.put("message", "");
							JSONObject jsonObj = JSONObject.fromObject(param); 
							map.put("param", jsonObj.toString());
							map.put("FLAG", "insert");
							Map posmap = orderBmo.GetOLpos(map, flowNum, sessionStaff);
//							session.setAttribute(sessionStaff.getStaffId(), param);
						}
						jsonResponse = super.successed(olposurl,
								ResultConstant.SUCCESS.getCode());
					} else {
						jsonResponse = super.failed(rMap.get("msg"),
								ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
					}
				} catch (BusinessException e) {
					return super.failed(e);
				} catch (InterfaceException ie) {
					return super.failed(ie, param, ErrorCode.CHARGEINFO_CHECK);
				} catch (Exception e) {
					return super.failed(ErrorCode.CHARGEINFO_CHECK, e, param);
				}
			}else if("1".equals(iseditOperation)){
				jsonResponse = super.failed("签权接口异常",
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}else{
				try{
					String olposurl="";
					if(!"".equals(sessionStaff.getAreaId())){
						String pos="pos";
						if(!CommonMethods.isOINet(request)){
							pos+="O";
							this.log.debug("在线pos================", pos);
						}
						olposurl=MySimulateData.getInstance().getNeeded((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),InterfaceClient.CHECK_LOGIN+"-"+ sessionStaff.getAreaId().substring(0, 3)+"0000", pos);
						this.log.debug("在线olposurl================", olposurl);
//						session.setAttribute(sessionStaff.getStaffId(), param);
						Map<String,Object> map=new HashMap<String,Object>();
						map.put("olId", param.get("olId"));
						map.put("olNbr", param.get("soNbr"));
						map.put("typeclass", "");
						map.put("result", "");
						map.put("message", "");
						JSONObject jsonObj = JSONObject.fromObject(param); 
						map.put("param", jsonObj.toString());
						map.put("FLAG", "insert");
						Map posmap = orderBmo.GetOLpos(map, flowNum, sessionStaff);
					}
					jsonResponse = super.successed(olposurl,
							ResultConstant.SUCCESS.getCode());
				}catch (Exception e) {
					// TODO: handle exception
				}
			}
		return jsonResponse;
    }
	
	/*订单时长*/
	@RequestMapping(value = "/createorderlonger", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse createorderlonger(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{		
 			rMap = this.orderBmo.createorderlonger(param, null, sessionStaff);
			jsonResponse = super.successed(rMap.get("time"),ResultConstant.SUCCESS.getCode());
 			return jsonResponse;
		}catch(BusinessException be){
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.CREATE_ORDERLONGER);
		} catch (Exception e) {
			return super.failed(ErrorCode.CREATE_ORDERLONGER, e, param);
		}
	}
	
	@RequestMapping(value = "/gotosubmitOrder", method = RequestMethod.POST)
	public String gotosubmitOrder(@RequestBody Map<String, Object> param,Model model
			,HttpServletResponse response,HttpServletRequest request){
		model.addAttribute("resMap",param);
		model.addAttribute("resMapJson", JsonUtil.buildNormal().objectToJson(param));	
		return "/pctoken/order/order-confirm";
	}
	
	@RequestMapping(value = "/orderSubmit", method = RequestMethod.POST)
    @ResponseBody
	public JsonResponse orderSubmit(@RequestBody Map<String, Object> param,HttpServletResponse response,HttpServletRequest request) {
		JsonResponse jsonResponse = null;
		if(commonBmo.checkToken(request, SysConstant.ORDER_SUBMIT_TOKEN)){
			try {
				if(commonBmo.orderSubmitFilter(param)){
					SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
					Map<String, Object> orderList = (Map<String, Object>)param.get("orderList");
					Map<String, Object> orderListInfo = (Map<String, Object>)orderList.get("orderListInfo");
					orderListInfo.put("staffId", sessionStaff.getStaffId()); //防止前台修改
					
					//过滤订单属性
					List<Map<String, Object>> custOrderAttrs = (List<Map<String, Object>>)orderListInfo.get("custOrderAttrs");
					//添加客户端IP地址到订单属性
	                Map<String, Object> IPMap = new HashMap<String, Object>();
	                IPMap.put("itemSpecId", SysConstant.ORDER_ATTRS_IP);
	                IPMap.put("value", ServletUtils.getIpAddr(request));
	                if (custOrderAttrs == null){
	                	custOrderAttrs = new ArrayList<Map<String, Object>>();
	                }
	                custOrderAttrs.add(IPMap);
	                orderListInfo.put("custOrderAttrs", custOrderAttrs);               
	                
					String isAddOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.FDSL+"_"+sessionStaff.getStaffId());
					//没有暂存单权限的员工不能添加暂存单订单属性
					if(!"0".equals(isAddOperation)){
						if(custOrderAttrs != null && custOrderAttrs.size() != 0){
							List<Map> filterCustOrderAttrs = new ArrayList<Map>();
							for(Map custOrderAttr : custOrderAttrs){
								if(custOrderAttr != null && !SysConstant.FDSL_ORDER_ATTR_SPECID.equals(custOrderAttr.get("itemSpecId"))){
									filterCustOrderAttrs.add(custOrderAttr);
								}
							}
							orderListInfo.put("custOrderAttrs", filterCustOrderAttrs);
						}
					}
					//获取客户端编码redmine979958,添加客户端编码属性
					HttpSession session = request.getSession();
					if((String) session.getAttribute(SysConstant.SESSION_CLIENTCODE+"_PC") !=null){
						custOrderAttrs = (List<Map<String, Object>>)orderListInfo.get("custOrderAttrs");
						Map<String, Object> attrMap = new HashMap<String, Object>();
						attrMap.put("itemSpecId", SysConstant.CLIENTCODE);
						attrMap.put("value", (String) session.getAttribute(SysConstant.SESSION_CLIENTCODE+"_PC"));
						custOrderAttrs.add(attrMap);
						orderListInfo.put("custOrderAttrs", custOrderAttrs);
					}

					Map<String, Object> resMap = orderBmo.orderSubmit(param,null,sessionStaff);
					if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
						Map<String, Object> result = (Map<String, Object>)resMap.get("result");
						String olId = (String)result.get("olId");
						String soNbr = (String)orderListInfo.get("soNbr");
						if(result.get("ruleInfos") == null){
							resMap.put("rolId", olId);
							resMap.put("rsoNbr", soNbr);
							resMap.put("checkRule", "checkRule");
						}else{
							boolean ruleflag = false;
							List<Map<String, Object>> rulelist = (List<Map<String, Object>>)result.get("ruleInfos");
							for(int i=0;i<rulelist.size();i++){
								Map<String, Object> rulemap = (Map<String, Object>)rulelist.get(i);
								String ruleLevel = rulemap.get("ruleLevel").toString();
								if("4".equals(ruleLevel)){
									ruleflag = true;
									break;
								}
							}
							if(!ruleflag){
								resMap.put("rolId", olId);
								resMap.put("rsoNbr", soNbr);
								resMap.put("checkRule", "checkRule");
							}
						}
						jsonResponse = super.successed(resMap,
								ResultConstant.SUCCESS.getCode());
					}else{
						jsonResponse = super.failed(resMap.get("resultMsg"),
								ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
					}
				} else{
                	return super.failed(ErrorCode.PORTAL_INPARAM_ERROR, "订单提交入参重复节点过滤发生异常，可能存在异常数据，请清空浏览器缓存后重新尝试，请不要进行非法提交、多窗口同时提交受理业务。", param);
				}
			} catch (BusinessException e) {
				return super.failed(e);
			} catch (InterfaceException ie) {
				return super.failed(ie, param, ErrorCode.ORDER_SUBMIT);
			} catch (Exception e) {
				return super.failed(ErrorCode.ORDER_SUBMIT, e, param);
			}
		}else {
            super.addHeadCode(response, ResultConstant.SERVICE_RESULT_FAILTURE);
		}
		return jsonResponse;
	}
	
	@RequestMapping(value = "/queryAuthenticDataRange", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryAuthenticDataRange(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			param.put("operatSpecCd", "OPSCD_FYJM");
			param.put("dataDimensionCd", "DIM_CD_JMFYX");
			param.put("staffId", sessionStaff.getStaffId());
			param.put("areaId", sessionStaff.getCurrentAreaId());
			rMap = orderBmo.queryAuthenticDataRange(param, flowNum, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				List result = (List)rMap.get("result");
				Map remap = (Map)result.get(0);
				List dataRanges = (List)remap.get("dataRanges");
				jsonResponse = super.successed(dataRanges,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_AUTHENTICDATARANGE);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_AUTHENTICDATARANGE, e, param);
		}
		return jsonResponse;
    }
	
	@RequestMapping(value = "/GetOLpos", method = {RequestMethod.POST,RequestMethod.GET})
	public String GetOLpos(@LogOperatorAnn String flowNum, HttpServletRequest request,HttpServletResponse response,Model model,HttpSession session) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
		.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		String olId=request.getParameter("olId");
		String olNbr=request.getParameter("olNbr");
		String typeclass = request.getParameter("typeclass");
		String result = request.getParameter("result");
		String message = request.getParameter("message");//成功-0，失败-1，取消-2
		if("0".equals(message)){
			message = "调用POS机缴费成功!";
		}else if("1".equals(message)){
			message = "调用POS机缴费失败!";
		}else if("2".equals(message)){
			message = "取消POS缴费!";
		}
//		try {
//			message = new String(request.getParameter("message").toString().getBytes("ISO-8859-1"),"UTF-8");
//		} catch (UnsupportedEncodingException e1) {
//			// TODO Auto-generated catch block
//			e1.printStackTrace();
//		}
		Map rMap = new HashMap();
		Map<String,Object> map=new HashMap<String,Object>();
		map.put("olId", olId);
		map.put("olNbr", olNbr);
		map.put("typeclass", typeclass);
		map.put("result", result);
		map.put("message", message);
		map.put("FLAG", "update");
		try {
			rMap = orderBmo.GetOLpos(map, flowNum, sessionStaff);
		} catch (BusinessException e) {
			return super.failedStr(model, e);
        } catch (InterfaceException ie) {
			return super.failedStr(model, ie, map, ErrorCode.CHARGE_SUBMIT);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.CHARGE_SUBMIT, e, map);
		}
		if("0".equals(result)){
//			Map param = (Map)session.getAttribute(sessionStaff.getStaffId());
			List list = (List) rMap.get("result");
			Map aa = (Map)list.get(0);
			Object obj = (Object) aa.get("PARAM");
			Map<String, Object> param = JsonUtil.toObject((String)obj, Map.class);
			try {
				Map charMap = orderBmo.chargeSubmit(param, flowNum, sessionStaff);
				if (charMap != null&& ResultCode.R_SUCCESS.equals(charMap.get("code").toString())) {
//					session.removeAttribute(sessionStaff.getStaffId());
					model.addAttribute("code", "0");
					model.addAttribute("param", param);
	 			} else {
	 				model.addAttribute("code", charMap.get("code"));
	 				model.addAttribute("msg", charMap.get("msg"));
	 				Map ma = new HashMap();
	 				ma.put("custId", "");
	 				ma.put("olId", "");
	 				ma.put("soNbr", "");
	 				model.addAttribute("param", ma);
	 			}
			} catch (BusinessException e) {
				return super.failedStr(model, e);
	        } catch (InterfaceException ie) {
				return super.failedStr(model, ie, map, ErrorCode.CHARGE_SUBMIT);
			} catch (Exception e) {
				return super.failedStr(model, ErrorCode.CHARGE_SUBMIT, e, map);
			}
		}else{
			model.addAttribute("code", result);
			model.addAttribute("msg", message);
			Map ma = new HashMap();
			ma.put("custId", "null");
			ma.put("olId", "null");
			ma.put("soNbr", "null");
			model.addAttribute("param", ma);
		}
		return "/order/order-charge-back";
	}

	@RequestMapping(value = "/queryFeeType", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse queryFeeType(@RequestParam Map<String, Object> paramMap,Model model){
		JsonResponse jsonResponse = null;
		String feeTypeFag="1";//1表示不用判断，0表示要判断
		try {
			feeTypeFag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"query_fee_type");
			if(StringUtils.isBlank(feeTypeFag)){
				feeTypeFag="1";
			}
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (InterfaceException e) {
			e.printStackTrace();
		}
		jsonResponse = super.successed(feeTypeFag,
				ResultConstant.SUCCESS.getCode());
		return jsonResponse;
    }

	
	/**
	 * 查询配置，是否显示省内订单属性
	 * @param paramMap
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/provOrderAttrFlag", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse provOrderAttrFlag(@RequestParam Map<String, Object> paramMap,Model model){
		JsonResponse jsonResponse = null;
		String provOrderAttrFlag = "1";//0-打开，1-关闭
		try {
			//根据所属渠道ID查询
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                SysConstant.SESSION_KEY_LOGIN_STAFF);
			String areaId = sessionStaff.getCurrentAreaId();
			if(areaId != null && areaId.length() > 3){
				areaId = areaId.substring(0, 3) + "0000";
			}
			provOrderAttrFlag = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),SysConstant.PROV_ORDER_ATTR_FLAG + areaId);
			if(StringUtils.isBlank(provOrderAttrFlag)){
				provOrderAttrFlag="1";
			}
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (InterfaceException e) {
			e.printStackTrace();
		}
		jsonResponse = super.successed(provOrderAttrFlag,
				ResultConstant.SUCCESS.getCode());
		return jsonResponse;
    }	
	// 短信发送
	@SuppressWarnings("unchecked")
	public Map<String, Object> sendMsg(HttpServletRequest request, String flowNum,String sendterminal,String phoneNumber,String cust_so_number)
			throws Exception {
		Map<String, Object> retnMap = new HashMap<String, Object>();
//		Map<String, Object> mapSession = (Map<String, Object>) ServletUtils.getSessionAttribute(request, SESSION_KEY_TEMP_LOGIN_STAFF);
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		if (sessionStaff != null) {
			String msg = "尊敬的客户，您好！您已成功预约"+sendterminal+"，预约号为"+cust_so_number+"。"+sendterminal+"终端到货后我们将及时通知您，届时您可携带预约短信或预约单及本人有效证件前往指定营业厅办理，感谢您对中国电信的支持。";
			this.log.debug("短信验证码：{}", msg);
//			String smsPassFlag = MapUtils.getString(mapSession, "smsPassFlag", "Y");
			// 系统参数表中的是否发送校验短信标识，1不发送不验证， 其他发送并验证
//			String msgCodeFlag = MySimulateData.getInstance().getParam(SysConstant.MSG_CODE_FLAG);
//			if (!"1".equals(msgCodeFlag) && !"N".equals(smsPassFlag)) {
//				SessionStaff sessionStaff = SessionStaff.setStaffInfoFromMap(mapSession);
				Map<String, Object> msgMap = new HashMap<String, Object>();
				msgMap.put("phoneNumber", phoneNumber);
				msgMap.put("key", msg);
				msgMap.put("message", msg);
				msgMap.put("sendflag", "terminal");
				
				String areaId = sessionStaff.getAreaId();
				if(!"00".equals(areaId.substring(5))){
					areaId = areaId.substring(0, 5) + "00";
				}
				msgMap.put("areaId", areaId);
				
				retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);
//			}
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_LOGIN_SMS);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_LOGIN_SMS, msg);
			//短信发送时间间隔
			request.getSession().removeAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME);
			request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_SMS_TIME, (new Date()).getTime());
		} else {
			this.log.error("错误信息:登录会话失效，请重新登录!");
		}
		return retnMap;
	}
	
	@RequestMapping(value="/reserveTerminal", method ={ RequestMethod.POST, RequestMethod.GET})
	public String reserveTerminal(Model model){
		model.addAttribute("terflag", "9");
	    return "/order/order-ysl";
	}
	
	/*终端预约证件号码限制*/
	@RequestMapping(value = "/checkIdentityCard", method ={ RequestMethod.POST, RequestMethod.GET})
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse checkIdentityCard(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{		
			rMap = orderBmo.queryyslList(param, null, sessionStaff);
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
 				jsonResponse = super.successed(rMap.get("sqlcount"),
 						ResultConstant.SUCCESS.getCode());
 			}else {
 				jsonResponse = super.failed(rMap.get("resultMsg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("证件号码查询失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_ORDERYSL);
		} catch (Exception e) {
			log.error("门户/order/checkIdentityCard方法异常", e);
			return super.failed(ErrorCode.QUERY_ORDERYSL, e, param);
		}
	}
	
	@RequestMapping(value = "/queryOrderItemDetailForResale", method = RequestMethod.GET)
    @ResponseBody
    public JsonResponse queryOrderItemDetailForResale(@RequestParam Map<String, Object> param,Model model){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
//		param.put("areaId", "8320200");
//		param.put("objInstId", "700019382849");
		try {
			rMap = orderBmo.queryOrderItemDetailForResale(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				Map orderListInfo = (Map) rMap.get("result");

				List orderList = (List)orderListInfo.get("list");
				jsonResponse = super.successed(orderList,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.INTF_QUERY_ORDER_RESALE);
		} catch (Exception e) {
			return super.failed(ErrorCode.INTF_QUERY_ORDER_RESALE, e, param);
		}
		return jsonResponse;
    }
	
	/*
	 * 数据抽取，根据订单ID查询订单提交的报文
	 */
	@RequestMapping(value = "/queryOrderListInfoByCustomerOrderId", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryOrderListInfoByCustomerOrderId(@RequestBody Map<String, Object> param,Model model){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = orderBmo.queryOrderListInfoByCustomerOrderId(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				//分段受理,如果受理工号和收费工号不是同一个,不展示"订单取消"按钮
				String oriStaffId = ((Map)((Map)((Map)rMap.get("result")).get("orderList")).get("orderListInfo")).get("staffId") + "";
				int showCancelBtn = 0;
				if(sessionStaff.getStaffId().equals(oriStaffId)){
					showCancelBtn = 1;
				}
				ServletUtils.setSessionAttribute(super.getRequest(),
 						SysConstant.STEP_ORDER_CANCEL_OPER_FLAG,showCancelBtn);
				
				jsonResponse = super.successed(rMap,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.QUERY_ORDER_LIST_INFO_BY_ORDER_ID);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ORDER_LIST_INFO_BY_ORDER_ID, e, param);
		}
		return jsonResponse;
    }
	
	/*
	 * 资源补录，补充在订单提交时未填写的资源信息（分段受理）
	 */
	@RequestMapping(value = "/saveResourceData", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse saveResourceData(@RequestBody Map<String, Object> param,Model model){
   	 SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
//		param.put("areaId", "8320200");
//		param.put("objInstId", "700019382849");
		try {
			rMap = orderBmo.saveResourceData(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
				jsonResponse = super.successed(rMap,
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap.get("msg").toString(),
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException e) {
			return super.failed(e);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.SAVE_RESOURCE_DATA);
		} catch (Exception e) {
			return super.failed(ErrorCode.SAVE_RESOURCE_DATA, e, param);
		}
		return jsonResponse;
    }
	
	@RequestMapping(value = "/gotosubmitStepOrder", method = RequestMethod.POST)
	public String gotosubmitStepOrder(@RequestBody Map<String, Object> param,Model model
			,HttpServletResponse response,HttpServletRequest request){
		model.addAttribute("resMap",param);
		model.addAttribute("resMapJson", JsonUtil.buildNormal().objectToJson(param));	
		return "/cashier/step-order-confirm";
	}
	
	/**
	 * 分段受理--订单还原入口
	 * @param param orderParam = {areaId:"",accNbr:"",custId:"",soNbr:"",prodInstId:"",olId:""}
	 * @param model
	 * @param response
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/orderReduction", method = RequestMethod.GET)
	public String orderReduction(@RequestParam Map<String, Object> param,Model model
			,HttpServletResponse response,HttpServletRequest request){
		model.addAttribute("orderParam", JsonUtil.buildNormal().objectToJson(param));
		log.debug("orderReduction.param={}", param);
		return "/cashier/step-order-main";
	}
	
	/**
	 * 获取暂存权限
	 * @param flowNum
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/getCheckOperatSpec", method ={ RequestMethod.POST, RequestMethod.GET})
    public @ResponseBody String checkOperatSpec(@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum,
  			HttpServletResponse response,HttpServletRequest request) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String isAddOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
			SysConstant.FDSL+"_"+sessionStaff.getStaffId());
		try{
			if(isAddOperation==null){
				isAddOperation=staffBmo.checkOperatSpec(SysConstant.FDSL,sessionStaff);
				ServletUtils.setSessionAttribute(super.getRequest(),
						SysConstant.FDSL+"_"+sessionStaff.getStaffId(), isAddOperation);
			}
		} catch (BusinessException e) {
			isAddOperation="1";
		} catch (InterfaceException ie) {
			isAddOperation="1";
		} catch (Exception e) {
			isAddOperation="1";
		}
		return isAddOperation;
    }
	
	/**
	 * 一卡双号展示
	 */
	@RequestMapping(value = "/cardNumberOrder", method = {RequestMethod.POST})
	public String cardNumberOrder(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		if (!MapUtils.isEmpty(param)) {
			//添加一些属性
			param.put("offerNum", 1);
			Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
			model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
			model.addAttribute("p_areaId_val", defaultAreaInfo.get("defaultAreaName"));
			param.put("boActionTypeName", "一卡双号订购");
			model.addAttribute("main", param);
		}
		return "/order/order-card-number";
	}
	
	/**
	 * 一卡双号校验单接口
	 */
	@RequestMapping(value = "/queryAccNbrList", method = {RequestMethod.POST})
	public String queryAccNbrList(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String extCustOrderId = UIDGenerator.getRand();
    	param.put("extCustOrderId", extCustOrderId);
    	param.put("soChannelId",sessionStaff.getCurrentChannelId());
    	param.put("staffId",sessionStaff.getStaffId());
		try {
			Map<String, Object> resMap = orderBmo.queryAccNbrList(param,null,sessionStaff);
			ArrayList accNbrList = new ArrayList();
			if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
				ArrayList dataList = (ArrayList) resMap.get("data");
				Map<String, Object> accNbrMap = (Map<String, Object>) dataList.get(0);
				accNbrList = (ArrayList) accNbrMap.get("accNbrList");
			}
			model.addAttribute("resMap",resMap);
			model.addAttribute("param",param);
			model.addAttribute("accNbrList",accNbrList);
			return "/order/order-cardnbr-list";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_CARDNBLIST);
		} catch (Exception e) {
			log.error("一卡双号校验单接口/order/queryAccNbrList方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_CARDNBLIST, e, param);
		}
	}
	
	/**
	 * 一卡双号订购退订正式单接口
	 */
	@RequestMapping(value = "/exchangeAccNbr", method = {RequestMethod.POST})
	public String exchangeAccNbr(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	param.put("soChannelId",sessionStaff.getCurrentChannelId());
    	param.put("staffId",sessionStaff.getStaffId());
		try {
			Map<String, Object> resMap = orderBmo.exchangeAccNbr(param,null,sessionStaff);
			model.addAttribute("param",param);
			model.addAttribute("resMap",resMap);
			return "/order/order-cardnbr-confirm";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.EXCHANGE_ACCNBR);
		} catch (Exception e) {
			log.error("一卡双号正式单接口方法异常", e);
			return super.failedStr(model, ErrorCode.EXCHANGE_ACCNBR, e, param);
		}
	}
	
	/**
	 * 一卡双号退订查询虚号接口
	 */
	@RequestMapping(value = "/queryVirtualInfo", method = {RequestMethod.POST})
	public String queryVirtualInfo(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String extCustOrderId = UIDGenerator.getRand();
    	param.put("extCustOrderId", extCustOrderId);
		try {
			Map<String, Object> resMap = orderBmo.queryVirtualInfo(param,null,sessionStaff);
			if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
				ArrayList dataList = (ArrayList) resMap.get("data");
				Map<String, Object> accNbrMap = (Map<String, Object>) dataList.get(0);
				model.addAttribute("accNbrMap",accNbrMap);
			}
			model.addAttribute("resMap",resMap);
			model.addAttribute("param",param);
			return "/orderUndo/order-undo-cardnbr";
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_VIRTUALINFO);
		} catch (Exception e) {
			log.error("一卡双号退订查虚号方法异常", e);
			return super.failedStr(model, ErrorCode.QUERY_VIRTUALINFO, e, param);
		}
	}
	
	/**
	 * 查询产品实例属性
	 * @param resquestMap : {
	 * prodId : "", //产品实例id
	 * acctNbr : "", //接入号
	 * prodSpecId : "", //产品规格id
	 * areaId : "" //地区id
	 * }
	 */
    @RequestMapping(value = "/prodInstParam", method = {RequestMethod.POST})
    public @ResponseBody JsonResponse prodInstParam(@RequestBody Map<String, Object> resquestMap, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jsonResponse = null;
        Map responseMap = null ;
        try {
        	responseMap = orderBmo.prodInstParam(resquestMap, null, sessionStaff);
        	if(responseMap != null && ResultCode.R_SUCC.equals(responseMap.get("resultCode"))){
        		jsonResponse = super.successed(responseMap,ResultConstant.SUCCESS.getCode());
        	}else{
				throw new InterfaceException(ErrType.CATCH, PortalServiceCode.PRODUCT_PARAM_QUERY, String.valueOf(responseMap.get("resultMsg")), JsonUtil.toString(resquestMap));
			}
        } catch (BusinessException be) {
			this.log.error("查询产品实例属性", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, resquestMap, ErrorCode.ORDER_PROD_INST);
		} catch (Exception e) {
			log.error("查询产品实例属性", e);
			return super.failed(ErrorCode.ORDER_PROD_INST, e, resquestMap);
		}
        return jsonResponse;
    }
    
	/**
	 * 从缓存里面获取标识
	 */
    @RequestMapping(value = "/getSimulateData", method = {RequestMethod.GET})
    @ResponseBody
    public  JsonResponse getSimulateData(@RequestParam Map<String, Object> resquestMap, Model model, HttpServletRequest request,
            HttpServletResponse response) {
    	String code=(String)resquestMap.get("code");
       	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	JsonResponse jsonResponse = null;
		try {
			String param = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),code);
			jsonResponse = super.successed(param,ResultConstant.SUCCESS.getCode());
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (InterfaceException e) {
			e.printStackTrace();
		}
        return jsonResponse;
    }    
    
    public Boolean checkParams(Map<String,Object> infoMap){
		boolean result=false;
		if(infoMap!=null && infoMap.size()!=0){
			Object provIsale=infoMap.get("provIsale");
			Object provCustIdentityCd=infoMap.get("provCustIdentityCd");
			Object custNumber=infoMap.get("custNumber");
			Object provCustIdentityNum=infoMap.get("provCustIdentityNum");
			Object provCustAreaId=infoMap.get("provCustAreaId");
			Object actionFlag=infoMap.get("actionFlag");
			Object reloadFlag=infoMap.get("reloadFlag");
			Object mainPhoneNum=infoMap.get("mainPhoneNum");
			Object isFee=infoMap.get("isFee");
			if(provIsale==null || custNumber==null || actionFlag==null || reloadFlag==null || mainPhoneNum==null || isFee==null){
				return result;
			}else{
				result=true;
			}
		}
		return result;
	};
    
    //主副卡入口
	@RequestMapping(value = "/memberChange/prepare", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String showOfferCfgDialog(@RequestParam Map<String, Object> params,@LogOperatorAnn String flowNum,HttpServletRequest request,Model model,HttpSession session) throws AuthorityException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = "";
		String custId = "";
		String provIsale="";
		String redirectUri="";
		String isFee="";
		String mergeFlag = "0";
		boolean querycustflag = false;
		Map<String,Object> paramsMap = new HashMap();
		try {
			String commonParamKey = MySimulateData.getInstance().getParam("COMMON_PARAM_KEY",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY
			String paramsJson=request.getParameter("params");
			if(paramsJson==null){
				//参数为空，扔公共提示页面
				model.addAttribute("errorMsg", "参数丢失，请重试。");
				return "/common/error";
			}
			String jmParamsJson = AESUtils.decryptToString(paramsJson, commonParamKey);
			paramsMap = JsonUtil.toObject(jmParamsJson, HashMap.class);
			if(paramsMap == null || paramsMap.size() <= 0){		
				model.addAttribute("errorMsg", "参数丢失，请重试。");
				return "/common/error";
			}
			//TODO 这里需要调用接口，接口暂时不可用，信息自建
			//String jsonString=JacksonUtil.objectToJson(jsonMap);
			//TODO 这里需要进行非空判断
			if(!checkParams(paramsMap)){
				model.addAttribute("errorMsg", "参数丢失，请重试");
				return "/common/error";
			}
			provIsale=paramsMap.get("provIsale")!=null?String.valueOf(paramsMap.get("provIsale")):null;
			redirectUri=paramsMap.get("redirectUri")!=null?String.valueOf(paramsMap.get("redirectUri")):null;
			isFee=paramsMap.get("isFee")!=null?String.valueOf(paramsMap.get("isFee")):null;
			String interface_merge = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"INTERFACE_MERGE");
			String provareaId = paramsMap.get("provCustAreaId").toString().subSequence(0, 3)+"0000";
			if(interface_merge != null && interface_merge.indexOf(provareaId)!=-1){
				mergeFlag = "1";
			}
			if("0".equals(mergeFlag)){
				try {
					//客户定位
					Map custparamMap = new HashMap();
					custparamMap.put("acctNbr", paramsMap.get("mainPhoneNum").toString());
					custparamMap.put("areaId",paramsMap.get("provCustAreaId").toString());
					custparamMap.put("diffPlace","local");
					custparamMap.put("identityCd","");
					custparamMap.put("identityNum","");
					custparamMap.put("partyName","");
					custparamMap.put("queryType","");
					custparamMap.put("queryTypeValue","");
					custparamMap.put("staffId",sessionStaff.getStaffId());
					Map resultMap = custBmo.queryCustInfo(custparamMap,flowNum,sessionStaff);
					List custInfos = new ArrayList();
					if (MapUtils.isNotEmpty(resultMap)) {
						custInfos=(List<Map<String, Object>>) resultMap.get("custInfos");
						if(!custparamMap.get("queryTypeValue").equals("") && !custparamMap.get("queryType").equals("")){
							sessionStaff.setCardNumber(String.valueOf(custparamMap.get("queryTypeValue")));
							sessionStaff.setCardType(String.valueOf(custparamMap.get("queryType")));
						}else if(!custparamMap.get("identityNum").equals("") && !custparamMap.get("identityCd").equals("")){
							sessionStaff.setCardNumber(String.valueOf(custparamMap.get("identityNum")));
							sessionStaff.setCardType(String.valueOf(custparamMap.get("identityCd")));
						}
						sessionStaff.setInPhoneNum(String.valueOf(custparamMap.get("acctNbr")));
						if(custInfos.size()>0){
							Map custInfo =(Map)custInfos.get(0);
							String idCardNumber = (String) custInfo.get("idCardNumber");
							sessionStaff.setCustId(String.valueOf(custInfo.get("custId")));
							sessionStaff.setCardNumber(idCardNumber);
							sessionStaff.setCardType(String.valueOf(custInfo.get("identityCd")));
							sessionStaff.setPartyName(String.valueOf(custInfo.get("partyName")));
							if(idCardNumber != null && idCardNumber.length()==18){
								 String preStr = idCardNumber.substring(0,6);
						    	 String subStr = idCardNumber.substring(14);
						    	 idCardNumber=preStr+"********"+subStr;
							}else if(idCardNumber != null && idCardNumber.length()==15){
								String preStr = idCardNumber.substring(0,5);
						    	 String subStr = idCardNumber.substring(13);
						    	 idCardNumber=preStr+"********"+subStr;
							}
							areaId = (String) custInfo.get("areaId");
							custId = String.valueOf(custInfo.get("custId"));
							querycustflag = true;
							model.addAttribute("addressStr", (String) custInfo.get("idCardNumber"));
							model.addAttribute("areaId", (String) custInfo.get("areaId"));
							model.addAttribute("areaName", (String) custInfo.get("areaName"));
							model.addAttribute("custFlag", (String) custInfo.get("custFlag"));
							model.addAttribute("custId", String.valueOf(custInfo.get("custId")));
							model.addAttribute("idCardNumber", idCardNumber);
							model.addAttribute("identityCd", (String) custInfo.get("identityCd"));
							model.addAttribute("identityName", (String) custInfo.get("identityName"));
							model.addAttribute("norTaxPayer", (String) custInfo.get("norTaxPayer"));
							model.addAttribute("partyName", (String) custInfo.get("partyName"));
							model.addAttribute("segmentId", (String) custInfo.get("segmentId"));
							model.addAttribute("segmentName", (String) custInfo.get("segmentName"));
							model.addAttribute("vipLevel", (String) custInfo.get("vipLevel"));
							model.addAttribute("vipLevelName", (String) custInfo.get("vipLevelName"));
							model.addAttribute("querycustflag", "0");
						}else{
							model.addAttribute("querycustflag", "1");
						}
					}else{
						model.addAttribute("querycustflag", "1");
					}
				} catch (BusinessException be) {
					model.addAttribute("querycustflag", "-1");
					model.addAttribute("errMsg", be.getError().getErrMsg());
				} catch (InterfaceException ie) {
					model.addAttribute("querycustflag", "-1");
					model.addAttribute("errMsg", ie.getMsg());
				} catch (Exception e) {
					model.addAttribute("querycustflag", "-1");
					model.addAttribute("errMsg", ErrorCode.QUERY_CUST.getErrMsg());
				}
				//查询已订购
				if(querycustflag){
					try {
						Map orderparamMap = new HashMap();
						orderparamMap.put("acctNbr", paramsMap.get("mainPhoneNum").toString());
						orderparamMap.put("areaId", areaId);
						orderparamMap.put("curPage", "1");
						orderparamMap.put("custId", custId);
						orderparamMap.put("pageSize", "5");
		//				orderparamMap.put("prodClass", "12");
						Map<String, Object> datamap = this.custBmo.queryCustProd(orderparamMap,flowNum, sessionStaff);
						String code = (String) datamap.get("resultCode");
						if (ResultCode.R_SUCC.equals(code)) {
							Map<String, Object> temMap=(Map) datamap.get("result");
							List<Map<String, Object>> list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
								if (list == null) {
									model.addAttribute("queryorderflag", "1");
								} else {
									model.addAttribute("queryorderflag", "0");
									Map ordermap = list.get(0);
									Map feeType = (Map) ordermap.get("feeType");
									List prodStopRecords = (List)ordermap.get("prodStopRecords");
									Map prodStopRecordsmap = (Map) prodStopRecords.get(0);
									List mainProdOfferInstInfos = (List)ordermap.get("mainProdOfferInstInfos");
									Map mainProdOfferInstInfosmap = (Map)mainProdOfferInstInfos.get(0);
									model.addAttribute("accNbr", ordermap.get("accNbr").toString());
									model.addAttribute("productName", ordermap.get("productName").toString());
									model.addAttribute("prodStateName", ordermap.get("prodStateName").toString());
									model.addAttribute("feeTypeName", feeType.get("feeTypeName"));
									model.addAttribute("prodInstId", ordermap.get("prodInstId").toString());
									model.addAttribute("extProdInstId", ordermap.get("extProdInstId").toString());
									model.addAttribute("corProdInstId", ordermap.get("corProdInstId").toString());
									model.addAttribute("prodStateCd", ordermap.get("prodStateCd").toString());
									model.addAttribute("productId", ordermap.get("productId").toString());
									model.addAttribute("feeType", feeType.get("feeType").toString());
									model.addAttribute("prodClass", ordermap.get("prodClass").toString());
									model.addAttribute("stopRecordCd", prodStopRecordsmap.get("stopRecordCd").toString());
									model.addAttribute("stopRecordName", prodStopRecordsmap.get("stopRecordName").toString());
									model.addAttribute("prodOfferName", mainProdOfferInstInfosmap.get("prodOfferName").toString());
									model.addAttribute("custName", mainProdOfferInstInfosmap.get("custName").toString());
									model.addAttribute("startDt", mainProdOfferInstInfosmap.get("startDt").toString());
									model.addAttribute("endDt", mainProdOfferInstInfosmap.get("endDt").toString());
									model.addAttribute("prodOfferId", mainProdOfferInstInfosmap.get("prodOfferId").toString());
									model.addAttribute("prodOfferInstId", mainProdOfferInstInfosmap.get("prodOfferInstId").toString());
									model.addAttribute("custId", mainProdOfferInstInfosmap.get("custId").toString());
									model.addAttribute("is3G", mainProdOfferInstInfosmap.get("is3G").toString());
									model.addAttribute("zoneNumber", ordermap.get("zoneNumber").toString());
									model.addAttribute("areaId", ordermap.get("areaId").toString());
								}
							}else{
								model.addAttribute("queryorderflag", "1");
							}
					} catch (BusinessException be) {
						model.addAttribute("queryorderflag", "-1");
						model.addAttribute("errMsg", be.getError().getErrMsg());
					} catch (InterfaceException ie) {
						model.addAttribute("queryorderflag", "-1");
						model.addAttribute("errMsg", ie.getMsg());
					} catch (Exception e) {
						model.addAttribute("queryorderflag", "-1");
						model.addAttribute("errMsg", ErrorCode.ORDER_PROD.getErrMsg());
					}
				}
			}
			String typeCd=paramsMap.get("typeCd")!=null?String.valueOf(paramsMap.get("typeCd")):null;
			String verifyLevel=paramsMap.get("verifyLevel")!=null?String.valueOf(paramsMap.get("verifyLevel")):null;
			model.addAttribute("verifyLevel",verifyLevel);
			model.addAttribute("typeCd",typeCd);
			model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
			model.addAttribute("provCustAreaId", paramsMap.get("provCustAreaId").toString());
			model.addAttribute("provIsale", provIsale);
			model.addAttribute("reloadFlag", paramsMap.get("reloadFlag").toString());
			model.addAttribute("redirectUri", redirectUri);
			model.addAttribute("mainPhoneNum", paramsMap.get("mainPhoneNum").toString());
			model.addAttribute("newSubPhoneNum", paramsMap.get("newSubPhoneNum")==null?"":paramsMap.get("newSubPhoneNum").toString());
			model.addAttribute("oldSubPhoneNum", paramsMap.get("oldSubPhoneNum")==null?"":paramsMap.get("oldSubPhoneNum").toString());
			model.addAttribute("mktResInstCode", paramsMap.get("mktResInstCode")==null?"":paramsMap.get("mktResInstCode").toString());
			model.addAttribute("salesCode", paramsMap.get("salesCode")==null?"":paramsMap.get("salesCode").toString());
			model.addAttribute("isFee", isFee);
			model.addAttribute("mergeFlag", mergeFlag);
		}catch(Exception e){
    		
    	}
		return "/pcpublic/main";
    }

	//跳转到套餐变更
		@RequestMapping(value = "/changeoffer", method = RequestMethod.GET)
	    @AuthorityValid(isCheck = false)
	    public String goPackages(@RequestParam Map<String, Object> params, HttpServletRequest request,Model model,HttpSession httpSession,@LogOperatorAnn String flowNum) throws AuthorityException {
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			try{
				String commonParamKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY
				String paramsJson=request.getParameter("params");
				if(paramsJson==null){
					//参数为空，扔公共提示页面
					model.addAttribute("errorMsg", "参数丢失，请重试。");
					return "/common/error";
				}
				String jmParamsJson = AESUtils.decryptToString(paramsJson, commonParamKey);
				Map<String,Object> paramsMap = JsonUtil.toObject(jmParamsJson, HashMap.class);
				if(paramsMap == null || paramsMap.size() <= 0){		
					model.addAttribute("errorMsg", "参数丢失，请重试。");
					return "/common/error";
				}
				
				
				//TODO 这里需要调用接口，接口暂时不可用，信息自建
				//String jsonString=JacksonUtil.objectToJson(jsonMap);
				//手机号码
				String mainPhoneNum=paramsMap.get("mainPhoneNum")!=null?String.valueOf(paramsMap.get("mainPhoneNum")):null;
				//是否收费
				String isFee=paramsMap.get("isFee")!=null?String.valueOf(paramsMap.get("isFee")):null;
				//省内订单流水   用于二次加载
				String provIsale=paramsMap.get("provIsale")!=null?String.valueOf(paramsMap.get("provIsale")):null;
				//
				String provCustAreaId=paramsMap.get("provCustAreaId")!=null?String.valueOf(paramsMap.get("provCustAreaId")):null;
				if(provIsale==null || isFee==null|| mainPhoneNum==null){
					model.addAttribute("errorMsg", "参数丢失，请重试。");
					return "/common/error";
				}
				model.addAttribute("mainPhoneNum", mainPhoneNum);
				model.addAttribute("isFee",isFee);
				model.addAttribute("provIsale",provIsale);
				String interface_merge = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"INTERFACE_MERGE");
				String provareaId = paramsMap.get("provCustAreaId").toString().subSequence(0, 3)+"0000";
				String mergeFlag = "0";
				if(interface_merge != null && interface_merge.indexOf(provareaId)!=-1){
					mergeFlag = "1";
				}
				model.addAttribute("mergeFlag",mergeFlag);
				//回调url地址
				String redirectUri=paramsMap.get("redirectUri")!=null?String.valueOf(paramsMap.get("redirectUri")):null;
				model.addAttribute("redirectUri",redirectUri);
				//Y新加载    N2次加载
				String reloadFlag=paramsMap.get("reloadFlag")!=null?String.valueOf(paramsMap.get("reloadFlag")):null;
				model.addAttribute("reloadFlag",reloadFlag);
				String mainProdOfferId=(String)paramsMap.get("mainProdOfferId");
				log.info("转换前主套餐Id:"+mainProdOfferId);
				//获取uim卡号
				String mktResInstCode =(String)paramsMap.get("mktResInstCode");//uim卡号
				model.addAttribute("mktResInstCode",mktResInstCode);
				model.addAttribute("newSubPhoneNum", paramsMap.get("newSubPhoneNum")==null?"":paramsMap.get("newSubPhoneNum").toString());
				model.addAttribute("oldSubPhoneNum", paramsMap.get("oldSubPhoneNum")==null?"":paramsMap.get("oldSubPhoneNum").toString());
				model.addAttribute("salesCode", paramsMap.get("salesCode")==null?"":paramsMap.get("salesCode").toString());
				 //终端串码
				model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
				if(mainProdOfferId!=null && mainProdOfferId.length()>0){
					//集团销售品ID
					String prodOfferId=paramsMap.get("prodOfferId")!=null?String.valueOf(paramsMap.get("prodOfferId")):null;
					log.info("转换后主套餐Id:"+prodOfferId);
					//集团销售品编码
					String offerNbr=paramsMap.get("offerNbr")!=null?String.valueOf(paramsMap.get("offerNbr")):null;
					//集团销售品名称
					String prodOfferName=paramsMap.get("prodOfferName")!=null?String.valueOf(paramsMap.get("prodOfferName")):null;
					//主销售品id不为空取3个参数
					if(prodOfferId==null || offerNbr==null || prodOfferName==null){
						//参数为空，扔公共提示页面
						model.addAttribute("errorMsg", "参数丢失，请重试。");
						return "/common/error";
					}
					model.addAttribute("offid",prodOfferId);
					model.addAttribute("offerNbr", offerNbr);
					model.addAttribute("prodOfferName", prodOfferName);
				}
				//如果是二次加载，调用接口获取暂存单数据信息
				if("N".equals(reloadFlag)){
					Map<String,Object> paramMap = new HashMap<String,Object>();
					paramMap.put("provTransId", provIsale);
					//paramMap.put("areaId",provCustAreaId);
					paramMap.put("backFlag","Y");
					Map<String, Object> orderMap = offerBmo.queryTemporaryOrder(paramMap, null, sessionStaff);
					if(orderMap!=null){
						String resultCode=String.valueOf(orderMap.get("resultCode"));
						
						if(resultCode.equals("0")){
							Map<String,Object>map=(Map<String,Object>)orderMap.get("result");
							String orderJson=JacksonUtil.objectToJson(map);
							model.addAttribute("orderJson", orderJson);
						}
						else{
							model.addAttribute("errorMsg", "获取暂存单信息失败!");
							return "/common/error";
						}
					}
				}
				String verifyLevel=paramsMap.get("verifyLevel")!=null?String.valueOf(paramsMap.get("verifyLevel")):null;
				model.addAttribute("verifyLevel",verifyLevel);
				String typeCd=paramsMap.get("typeCd")!=null?String.valueOf(paramsMap.get("typeCd")):null;
				model.addAttribute("typeCd",typeCd);
				
				//供前台查询定位客户
				model.addAttribute("custAreaId_", provCustAreaId);
				//放入流水作为唯一标识码
				httpSession.setAttribute("provIsale_"+provIsale, provIsale);
				httpSession.setAttribute("isFee_"+provIsale,isFee);
			}catch(Exception e){
				log.error("套餐变更/业务变更服务加载异常：",e);
				model.addAttribute("errorMsg", "套餐变更/业务变更服务加载错误!");
				return "/common/error";
			}
			//model.addAttribute("mainPhoneNum", "17767068178");
		//	model.addAttribute("mainProdOfferId","17767068178");
		//	model.addAttribute("offid","81009");  //新套餐主销售品id
			return "/pctoken/order/order-offer-main";
		}	
		
		@RequestMapping(value = "/prodoffer/prepares", method = RequestMethod.GET)
	    @AuthorityValid(isCheck = false)
	    public String main(@RequestParam(value = "current", required = false,defaultValue = "home") String current,
	            Model model ,HttpServletRequest request) throws AuthorityException {
			
			String prodOfferId = request.getParameter("prodOfferId") ;
			String subPage= request.getParameter("subPage") ;
			String numsubflag= request.getParameter("numsubflag") ;
			if(prodOfferId!=null&&!prodOfferId.equals("")&&!prodOfferId.equals("null")){
				model.addAttribute("prodOfferId",prodOfferId);
			}
			if(subPage!=null&&!subPage.equals("")&&!subPage.equals("null")){
				model.addAttribute("subPage",subPage);
			}
			if(numsubflag!=null&&!numsubflag.equals("")&&!numsubflag.equals("null")){
				model.addAttribute("numsubflag",numsubflag);
			}
	       return "pctoken/order/order-offer-search";
	    }
		
}
