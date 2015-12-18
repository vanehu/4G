package com.al.lte.portal.token.pad.controller.crm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

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

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
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

@Controller("com.al.lte.portal.token.pad.controller.crm.MainController")
@RequestMapping("/token/pad/main/*")
@AuthorityValid(isCheck = false)
public class MainController extends BaseController {
	
	private static Logger log = LoggerFactory.getLogger(MainController.class.getName());
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	
	/**可选包变更*/
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/changePackageAndService", method = RequestMethod.GET)
    public String changePackageAndService(@RequestParam Map<String, Object> params, HttpServletRequest request,HttpSession httpSession,Model model,HttpSession session) throws AuthorityException {
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			
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
			/*Map<String,Object> paramsMap = new HashMap<String,Object>();
			paramsMap.put("provIsale","20150527001011");
			paramsMap.put("provCustIdentityCd","1212");
			paramsMap.put("custNumber","12");
			paramsMap.put("provCustIdentityNum","10");
			paramsMap.put("provCustAreaId","8330100");
			paramsMap.put("actionFlag","14");
			paramsMap.put("reloadFlag","Y");
			paramsMap.put("isFee","1");*/
			
			//进行非空判断
			if(!checkParams(paramsMap)){
				model.addAttribute("errorMsg", "缺少必要参数");
				return "/common/error";
			}
			
			String provIsale=String.valueOf(paramsMap.get("provIsale"));
			String redirectUri=paramsMap.get("redirectUri")!=null? String.valueOf(paramsMap.get("redirectUri")):"";
			String isFee=String.valueOf(paramsMap.get("isFee"));
			String reloadFlag=String.valueOf(paramsMap.get("reloadFlag"));
			String provCustAreaId=String.valueOf(paramsMap.get("provCustAreaId"));
			
			//判断是否二次加载，二次加载获取二次加载数据
			Map<String, Object> orderMap=new HashMap<String, Object>();
			
			if("N".equals(reloadFlag)){
				orderMap=this.orderInfoReload(provIsale, provCustAreaId, sessionStaff);
				
				if(orderMap!=null && orderMap.size()!=0){
					String resultCode=String.valueOf(orderMap.get("resultCode"));
					
					if("2".equals(resultCode) || "-1".equals(resultCode)){
						model.addAttribute("errorMsg",orderMap.get("resultMsg"));
						return "/common/error";
					}
				}else{
					model.addAttribute("errorMsg", "获取暂存单信息失败!");
					return "/common/error";
				}
			}
			
			model.addAttribute("reloadOrderInfo_", JacksonUtil.objectToJson(orderMap));
			
			//公共跳转参数(公共-必须)
			Map<String, Object> provinceInfo=new HashMap<String, Object>();
			provinceInfo.put("provIsale", provIsale);
			provinceInfo.put("redirectUri", redirectUri);
			provinceInfo.put("isFee", isFee);
			provinceInfo.put("reloadFlag", reloadFlag);
			provinceInfo.put("mainPhoneNum", paramsMap.get("mainPhoneNum"));
			//provinceInfo.put("mktResInstCode", paramsMap.get("mktResInstCode"));
			
			//判断是否传参UIM卡
			Object mktResInstCode=paramsMap.get("mktResInstCode");
			String mktResInstCodes="";
			String codeMsg="";
			
			if(mktResInstCode!=null && !"".equals(String.valueOf(mktResInstCode).trim()) && !"null".equals(String.valueOf(mktResInstCode))){
				//解析传入的参数
				String[] uims=String.valueOf(mktResInstCode).split(",");
				String mainPhoneNum=String.valueOf(paramsMap.get("mainPhoneNum"));
				
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
					if(uims!=null && uims.length>0){
						for(String uimCode:uims){
							String[] uimCodes=uimCode.split("_");
							
							if(uimCodes!=null && uimCodes.length==2){
								if(mainPhoneNum.equals(uimCodes[0])){
									mktResInstCodes=uimCodes[1];
									break;
								}
							}
						}
						
						if(mktResInstCodes==null || "".equals(mktResInstCodes) || "null".equals(mktResInstCodes)){
							codeMsg="未匹配到适应的UIM卡，主号码["+mainPhoneNum+"],传入的UIM参数["+mktResInstCode+"]";
						}
					}
				}
			}
			
			provinceInfo.put("mktResInstCode",mktResInstCodes);
			provinceInfo.put("codeMsg", codeMsg);
			
			model.addAttribute("provinceInfo_", JacksonUtil.objectToJson(provinceInfo));
			
			//其他必须参数数据
			model.addAttribute("DiffPlaceFlag", "local");
			
			//个人参数（非必须）
			model.addAttribute("mainPhoneNum_", paramsMap.get("mainPhoneNum"));
			
			model.addAttribute("custAreaId_", provCustAreaId);
			String mergeFlag = "0";
			String interface_merge = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"INTERFACE_MERGE");
			String provareaId = paramsMap.get("provCustAreaId").toString().subSequence(0, 3)+"0000";
			if(interface_merge != null && interface_merge.indexOf(provareaId)!=-1){
				mergeFlag = "1";
			}
			model.addAttribute("mergeFlag", mergeFlag);
			//发展人工号
			model.addAttribute("salesCode",paramsMap.get("salesCode")==null?"":paramsMap.get("salesCode").toString());
			//终端串码
			model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
		}catch(Exception e){
			log.error("可选包/业务变更服务加载异常：",e);
			model.addAttribute("errorMsg", "可选包/业务变更服务加载错误!");
			return "/common/error";
		}
		
		return "/padtoken/main/index";
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
			Object provIsale=infoMap.get("provIsale");//流水号
			Object provCustAreaId=infoMap.get("provCustAreaId");
			Object actionFlag=infoMap.get("actionFlag");
			Object reloadFlag=infoMap.get("reloadFlag");
			Object mainPhoneNum=infoMap.get("mainPhoneNum");
			Object isFee=infoMap.get("isFee");
			
			if(provIsale==null || "".equals(String.valueOf(provIsale).trim()) || provCustAreaId==null || "".equals(String.valueOf(provCustAreaId))
					|| actionFlag==null || "".equals(String.valueOf(actionFlag)) || reloadFlag==null || "".equals(String.valueOf(reloadFlag)) 
					|| mainPhoneNum==null || "".equals(String.valueOf(mainPhoneNum)) || isFee==null || "".equals(String.valueOf(isFee))
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
		String mergeFlag = "0";
		boolean querycustflag = false;
		Map<String,Object> paramsMap = new HashMap<String,Object>();
		try {
			String commonParamKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY
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
				try{
					//客户定位
					Map<String,Object> custparamMap = new HashMap<String,Object>();
					custparamMap.put("acctNbr", paramsMap.get("mainPhoneNum").toString());
					custparamMap.put("areaId",paramsMap.get("provCustAreaId").toString());
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
							Map<String,Object> custInfo =(Map<String,Object>)custInfos.get(0);
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
						Map<String,Object> orderparamMap = new HashMap<String,Object>();
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
			model.addAttribute("provIsale", provIsale);
			model.addAttribute("reloadFlag", paramsMap.get("reloadFlag").toString());
			model.addAttribute("redirectUri", redirectUri);
			model.addAttribute("mainPhoneNum", paramsMap.get("mainPhoneNum").toString());
			model.addAttribute("newSubPhoneNum", paramsMap.get("newSubPhoneNum")==null?"":paramsMap.get("newSubPhoneNum").toString());
			model.addAttribute("oldSubPhoneNum", paramsMap.get("oldSubPhoneNum")==null?"":paramsMap.get("oldSubPhoneNum").toString());
			model.addAttribute("mktResInstCode", paramsMap.get("mktResInstCode")==null?"":paramsMap.get("mktResInstCode").toString());
			model.addAttribute("isFee", isFee);
			model.addAttribute("mergeFlag", mergeFlag);
			model.addAttribute("provCustAreaId", paramsMap.get("provCustAreaId").toString());
			//发展人工号
			model.addAttribute("salesCode",paramsMap.get("salesCode")==null?"":paramsMap.get("salesCode").toString());
			//终端串码
			model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
		}catch(Exception e){
    		
    	}
		return "/padtoken/member/main";
    }
}
