package com.al.lte.portal.token.pad.controller.crm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.al.ecs.common.util.JsonUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * <b>类名称：</b>com.al.lte.portal.token.pad.controller.crm.MainController<br>
 * <b>创建人：</b>WJZ<br>
 * <b>类描述：</b>4G-PAD功能<br>
 * <b>创建时间：</b>2015年6月8日-上午10:00:00<br>
 */

@Controller("com.al.lte.portal.token.pad.controller.crm.OfferMainController")
@RequestMapping("/token/pad/offermain/*")
@AuthorityValid(isCheck = false)
public class OfferMainController extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	
	/**套餐变更*/
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/offerService", method = RequestMethod.GET)
    public String offerService(@RequestParam Map<String, Object> params, HttpServletRequest request,HttpSession httpSession,Model model,HttpSession session) throws AuthorityException {
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			
			String commonParamKey = MySimulateData.getInstance().getParam("COMMON_PARAM_KEY",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY
			
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
		
			
                //进行非空判断
			
			if(!checkParams(paramsMap)){
				model.addAttribute("errorMsg", "参数丢失，请重试");
				return "/common/error";
			}
			//公共跳转参数(公共-必须)
			Map<String, Object> provinceInfo=new HashMap<String, Object>();
			
			String mktResInstCode =(String)paramsMap.get("mktResInstCode");//uim卡号
			model.addAttribute("mktResInstCode",mktResInstCode);
			//外部主套餐id
			String mainProdOfferId=paramsMap.get("mainProdOfferId")!=null?String.valueOf(paramsMap.get("mainProdOfferId")):null;
			if(mainProdOfferId!=null && mainProdOfferId.length()>0){
				//集团销售品ID
				String prodOfferId=paramsMap.get("prodOfferId")!=null?String.valueOf(paramsMap.get("prodOfferId")):null;
				//String prodOfferId="81009";
				
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
				//内部主套餐id
				
				model.addAttribute("offerNbr", offerNbr);
				model.addAttribute("prodOfferName", prodOfferName);
				
				//model.addAttribute("prodOfferId",prodOfferId);
				provinceInfo.put("prodOfferId",prodOfferId);  //先写死主套餐id
			}
			String provIsale=String.valueOf(paramsMap.get("provIsale"));
			String redirectUri=paramsMap.get("redirectUri")!=null? String.valueOf(paramsMap.get("redirectUri")):"";
			String isFee=String.valueOf(paramsMap.get("isFee"));
			String reloadFlag=String.valueOf(paramsMap.get("reloadFlag"));
			String provCustAreaId=String.valueOf(paramsMap.get("provCustAreaId"));
			
			//判断是否二次加载，二次加载获取二次加载数据
			Map<String, Object> orderMap=null;//new HashMap<String, Object>();
			
			//如果是二次加载，调用接口获取暂存单数据信息
			if("N".equals(reloadFlag)){
				Map<String,Object> paramMap = new HashMap<String,Object>();
				paramMap.put("provTransId", provIsale);
				paramMap.put("backFlag","Y");
				orderMap=this.orderInfoReload(provIsale, provCustAreaId, sessionStaff);
				if(orderMap!=null){
					String resultCode=String.valueOf(orderMap.get("resultCode"));
					
					if(resultCode.equals("0")){
						Map<String,Object>map=(Map<String,Object>)orderMap.get("result");
						String orderJson=JacksonUtil.objectToJson(map);
						model.addAttribute("reloadOrderInfo_", orderJson);
					}
					else{
						model.addAttribute("errorMsg", "获取暂存单信息失败!");
						return "/common/error";
					}
				}
			}

			//老用户成员号码：多个成员使用分隔符‘,’
			String oldSubPhoneNum =paramsMap.get("oldSubPhoneNum")!=null?String.valueOf(paramsMap.get("oldSubPhoneNum")):null;
		    String newSubPhoneNum=paramsMap.get("newSubPhoneNum")!=null?String.valueOf(paramsMap.get("newSubPhoneNum")):null;
		   
		    model.addAttribute("oldSubPhoneNum",oldSubPhoneNum);
		    model.addAttribute("newSubPhoneNum", newSubPhoneNum);
		    model.addAttribute("reloadFlag", reloadFlag);
			provinceInfo.put("provIsale", provIsale);
			provinceInfo.put("redirectUri", redirectUri);
			provinceInfo.put("isFee", isFee);
			provinceInfo.put("reloadFlag", reloadFlag);
			provinceInfo.put("mainPhoneNum", paramsMap.get("mainPhoneNum"));
			
			model.addAttribute("provinceInfo_", JacksonUtil.objectToJson(provinceInfo));
			String verifyLevel=paramsMap.get("verifyLevel")!=null?String.valueOf(paramsMap.get("verifyLevel")):null;
			model.addAttribute("verifyLevel",verifyLevel);
			String typeCd=paramsMap.get("typeCd")!=null?String.valueOf(paramsMap.get("typeCd")):null;
			model.addAttribute("typeCd",typeCd);
			//其他必须参数数据
			model.addAttribute("DiffPlaceFlag", "local");
			//终端串码
			model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
			//发展人工号
			model.addAttribute("salesCode",paramsMap.get("salesCode")==null?"":paramsMap.get("salesCode").toString());
			//个人参数（非必须）
			//传入手机号
			model.addAttribute("mainPhoneNum", paramsMap.get("mainPhoneNum"));
			model.addAttribute("custAreaId_", provCustAreaId);
			String mergeFlag = "0";
			String interface_merge = MySimulateData.getInstance().getParam("INTERFACE_MERGE",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"INTERFACE_MERGE");
			String provareaId = paramsMap.get("provCustAreaId").toString().subSequence(0, 3)+"0000";
			if(interface_merge != null && interface_merge.indexOf(provareaId)!=-1){
				mergeFlag = "1";
			}
			model.addAttribute("mergeFlag", mergeFlag);
		}catch(Exception e){
			log.error("套餐变更/业务变更服务加载异常：",e);
			model.addAttribute("errorMsg", "套餐变更/业务变更服务加载错误!");
			return "/common/error";
		}
		
		return "/padtoken/main/offer-index";
    }
	
	 public Map<String, Object> orderInfoReload(String provIsale,String provCustAreaId,SessionStaff sessionStaff) throws Exception{
    	if(provIsale!=null && !"".equals(provIsale) && provCustAreaId!=null && !"".equals(provCustAreaId)){
    		Map<String, Object> orderMap =new HashMap<String, Object>();
    		
    		Map<String,Object> paramMap = new HashMap<String,Object>();
    		paramMap.put("provTransId", provIsale);
    		paramMap.put("areaId",provCustAreaId);
    		paramMap.put("backFlag","Y");
    		orderMap = offerBmo.queryTemporaryOrder(paramMap, null, sessionStaff);
    		
    		return orderMap;
    	}
    	
    	return null;
    }
	
	 public Boolean checkParams(Map<String,Object> infoMap){
			boolean result=false;
			
			if(infoMap!=null && infoMap.size()!=0){
				Object provIsale=infoMap.get("provIsale");//省份订单流水
				//Object provCustIdentityCd=infoMap.get("provCustIdentityCd");
				//Object custNumber=infoMap.get("custNumber");
				//Object provCustIdentityNum=infoMap.get("provCustIdentityNum");
				Object provCustAreaId=infoMap.get("provCustAreaId");  //地区id
				Object actionFlag=infoMap.get("actionFlag");//2：套餐变更标识
				Object reloadFlag=infoMap.get("reloadFlag");//是否二次加载
				Object mainPhoneNum=infoMap.get("mainPhoneNum");  //手机号码
				Object isFee=infoMap.get("isFee");  //是否收费
				
				if(provIsale==null  || provCustAreaId==null
						|| actionFlag==null || reloadFlag==null || mainPhoneNum==null || isFee==null
				){
					return result;
				}else{
					result=true;
				}
			}
			
			return result;
		}
	
	//主副卡入口
		@SuppressWarnings("unchecked")
		@RequestMapping(value = "/memberChange/prepare", method = RequestMethod.GET)
		@AuthorityValid(isCheck = false)
	    public String showOfferCfgDialog(@RequestParam Map<String, Object> params,@LogOperatorAnn String flowNum,HttpServletRequest request,Model model,HttpSession session) throws AuthorityException {
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			String areaId = "";
			String custId = "";
			String provIsale="";
			String redirectUri="";
			String isFee="";
			boolean querycustflag = false;
			Map<String,Object> paramsMap = new HashMap<String,Object>();
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

				//客户定位
				Map<String,Object> custparamMap = new HashMap<String,Object>();
				custparamMap.put("acctNbr", paramsMap.get("mainPhoneNum").toString());
				custparamMap.put("areaId",sessionStaff.getCurrentAreaId());
				custparamMap.put("diffPlace","local");
				custparamMap.put("identityCd","");
				custparamMap.put("identityNum","");
				custparamMap.put("partyName","");
				custparamMap.put("queryType","");
				custparamMap.put("queryTypeValue","");
				custparamMap.put("staffId",sessionStaff.getStaffId());
				Map<String,Object> resultMap = custBmo.queryCustInfo(custparamMap,flowNum,sessionStaff);
				List<Map<String,Object>> custInfos = new ArrayList<Map<String,Object>>();
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
						Map<String,Object> custInfo = custInfos.get(0);
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
			} catch (Exception e) {
				model.addAttribute("querycustflag", "-1");
			}
			//查询已订购
			if(querycustflag){
				try {
					Map<String,Object> orderparamMap = new HashMap<String,Object>();
					orderparamMap.put("acctNbr", paramsMap.get("mainPhoneNum").toString());
					orderparamMap.put("areaId", areaId);
					orderparamMap.put("curPage", "1");
					orderparamMap.put("custId", custId);
					orderparamMap.put("pageSize", "5");
					Map<String, Object> datamap = this.custBmo.queryCustProd(orderparamMap,flowNum, sessionStaff);
					String code = (String) datamap.get("resultCode");
					if (ResultCode.R_SUCC.equals(code)) {
						Map<String, Object> temMap= (Map<String, Object>) datamap.get("result");
						List<Map<String, Object>> list = (List<Map<String, Object>>) temMap.get("prodInstInfos");
							if (list == null) {
								model.addAttribute("queryorderflag", "1");
							} else {
								model.addAttribute("queryorderflag", "0");
								Map<String,Object> ordermap = list.get(0);
								Map<String,Object> feeType = (Map<String,Object>) ordermap.get("feeType");
								List<Map<String,Object>> prodStopRecords = (List<Map<String,Object>>)ordermap.get("prodStopRecords");
								Map<String,Object> prodStopRecordsmap = (Map<String,Object>) prodStopRecords.get(0);
								List<Map<String,Object>> mainProdOfferInstInfos = (List<Map<String,Object>>)ordermap.get("mainProdOfferInstInfos");
								Map<String,Object> mainProdOfferInstInfosmap = (Map<String,Object>)mainProdOfferInstInfos.get(0);
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
				} catch (Exception e) {
					model.addAttribute("queryorderflag", "-1");
				}
			}
			model.addAttribute("provIsale", provIsale);
			model.addAttribute("reloadFlag", paramsMap.get("reloadFlag").toString());
			model.addAttribute("redirectUri", redirectUri);
			model.addAttribute("mainPhoneNum", paramsMap.get("mainPhoneNum").toString());
			model.addAttribute("newSubPhoneNum", paramsMap.get("newSubPhoneNum").toString());
			model.addAttribute("oldSubPhoneNum", paramsMap.get("oldSubPhoneNum").toString());
			model.addAttribute("isFee", isFee);
			return "/padtoken/main/member";	
	    }
}
