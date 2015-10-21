package com.al.lte.portal.token.app.controller.crm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.Switch;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.app.controller.crm.CustController;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

@Controller("com.al.lte.portal.token.app.controller.crm.OfferMainController")
@RequestMapping("/token/app/offermain/*")
@AuthorityValid(isCheck = false)
public class OfferMainController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.app.controller.crm.CustController")
	private CustController custController;
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
    private CustBmo custBmo;
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@SuppressWarnings("unchecked")
	@LogOperatorAnn(switchs = Switch.OFF)
	@RequestMapping(value = "/changePackageAndService", method = RequestMethod.GET)
    public String changePackageAndService(@RequestParam Map<String, Object> params, HttpServletRequest request,HttpServletResponse response,HttpSession httpSession,Model model,HttpSession session) throws AuthorityException {
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
			     
			//Map<String,Object> paramsMap=new HashMap<String,Object>();
			//公共跳转参数(公共-必须)
			Map<String, Object> provinceInfo=new HashMap<String, Object>();
			//外部主套餐id
			String mainProdOfferId=paramsMap.get("mainProdOfferId")!=null?String.valueOf(paramsMap.get("mainProdOfferId")):null;
		//	mainProdOfferId="xxxx";//测试用删除
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
			// 测试参数
			
			//paramsMap.put("mainPhoneNum",request.getParameter("mainPhoneNum"));
			//paramsMap.put("provIsale",request.getParameter("provIsale"));
			
//			paramsMap.put("provIsale","20150527001011");
//			paramsMap.put("provCustIdentityCd","1212");
//			paramsMap.put("custNumber","12");
//			paramsMap.put("provCustIdentityNum","10");
//			paramsMap.put("provCustAreaId","8330100");
//			paramsMap.put("actionFlag","14");
//			paramsMap.put("reloadFlag","Y");
//			paramsMap.put("isFee","1");
			
			//进行非空判断
			
			if(!checkParams(paramsMap)){
				model.addAttribute("errorMsg", "参数丢失，请重试");
				return "/common/error";
			}
			
			String provIsale=String.valueOf(paramsMap.get("provIsale"));//省份流水
			String redirectUri=String.valueOf(paramsMap.get("redirectUri"));  //回调url
			String isFee=String.valueOf(paramsMap.get("isFee"));//是否收费
			String reloadFlag=String.valueOf(paramsMap.get("reloadFlag"));//是否二次加载 
			String provCustAreaId=String.valueOf(paramsMap.get("provCustAreaId")); //客户地区id
			String mainPhoneNum=(String)paramsMap.get("mainPhoneNum");//传入的号码
			//uim卡
			String mktResInstCode =(String)paramsMap.get("mktResInstCode");//uim卡号
			model.addAttribute("mktResInstCode",mktResInstCode);
			model.addAttribute("newSubPhoneNum", paramsMap.get("newSubPhoneNum")==null?"":paramsMap.get("newSubPhoneNum").toString());
			model.addAttribute("oldSubPhoneNum", paramsMap.get("oldSubPhoneNum")==null?"":paramsMap.get("oldSubPhoneNum").toString());
			//进行staff获取
			Map<String, Object> staffMap=APPModelController.getStaffInfo(request);
			
			if(staffMap!=null && staffMap.size()!=0){
				model.addAttribute("staffInfo_", JacksonUtil.objectToJson(staffMap));
			}
			
			//进行custnfo获取
			Map<String, Object> infoMap=new HashMap<String, Object>();
			infoMap.put("acctNbr",paramsMap.get("mainPhoneNum"));
			infoMap.put("areaId",paramsMap.get("provCustAreaId"));
			infoMap.put("identidies_type", "接入号码");
			
			Map<String, Object> custInfo=this.queryCustInfo(infoMap, request, response, "");
			
			if(custInfo!=null && custInfo.size()!=0){
				String custInfo_=JacksonUtil.objectToJson(custInfo);
				
				List<Map<String, Object>> custInfos= (List<Map<String, Object>>) custInfo.get("custInfos");
				
				if(custInfos!=null && custInfos.size()>0){
					infoMap.put("custId", custInfos.get(0).get("custId"));
					infoMap.put("areaId", custInfos.get(0).get("areaId"));
					
					model.addAttribute("custInfo_", custInfo_);
				}
				else{
					model.addAttribute("errorMsg", "无法定位客户!");
					return "/common/error";
				}
			}else{
				model.addAttribute("errorMsg", "无法定位客户!");
				return "/common/error";
			}
			
			//进行prodinfo获取
		    infoMap.put("curPage", 1);
			Map<String, Object> prodInfo=this.prodInfoQuery(infoMap, request, response, "");
			
			if(prodInfo!=null && prodInfo.size()!=0){
				List<Map<String, Object>> prodInfos=(List<Map<String, Object>>) prodInfo.get("prodInstInfos");
				
				if(prodInfos!=null && prodInfos.size()>0){
					model.addAttribute("prodInfo_", JacksonUtil.objectToJson(prodInfos.get(0)));
				}else{
					model.addAttribute("errorMsg", "查询不到客户订购业务数据信息!");
					return "/common/error";
				}
			}else{
				model.addAttribute("errorMsg", "查询不到客户订购业务数据信息!");
				return "/common/error";
			}
			
			String method="";
			//mainProdOfferId="ccc";
			if(reloadFlag.equals("N")){
			    method="/token/app/order/prodoffer/offerchange/prepare";
			}
			else{
				if(mainProdOfferId!=null && mainProdOfferId.length()>0){
					 method="/token/app/order/prodoffer/offerchange/prepare";
				}
				else{
					 method="/token/app/order/prodoffer/offerchangesub/prepare";
				}
			}
			
			Map<String, Object> jumpParams=new HashMap<String, Object>();
			jumpParams.put("method", method);
			jumpParams.put("actionFlag", "2");//按功能填入
			
			model.addAttribute("jumpParams_", JacksonUtil.objectToJson(jumpParams));
			//如果是二次加载，调用接口获取暂存单数据信息
			if("N".equals(reloadFlag)){
				Map<String,Object> paramMap = new HashMap<String,Object>();
				paramMap.put("provTransId", provIsale);
				paramMap.put("backFlag","Y");
				//paramMap.put("areaId",provCustAreaId);
				Map<String, Object> orderMap = offerBmo.queryTemporaryOrder(paramMap, null, sessionStaff);
	
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
			
			
			provinceInfo.put("provIsale", provIsale);
			provinceInfo.put("redirectUri", redirectUri);
			provinceInfo.put("isFee", isFee);
			provinceInfo.put("reloadFlag",reloadFlag);//paramsMap.get("reloadFlag"));
			model.addAttribute("provinceInfo_", JacksonUtil.objectToJson(provinceInfo));
			
			//其他必要参数（非公共）
			model.addAttribute("acrNum", paramsMap.get("mainPhoneNum"));
			model.addAttribute("phoneNum_", paramsMap.get("mainPhoneNum"));
			model.addAttribute("reloadFlag_",paramsMap.get("reloadFlag"));
			
		}catch(Exception e){
			log.error("套餐变更/业务变更服务加载异常：",e);
			return super.failedStr(model, ErrorCode.ORDER_PROD, e, params);
		}
		
		return "/public/app-offer-params";
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
	
    /**
     * 客户信息查询-提供给手机客户端使用
     * @param paramMap
     * @param model
     * @param flowNum
     * @param response
     * @param httpSession
     * @return
     */
    @SuppressWarnings("unchecked")
	public Map<String, Object> queryCustInfo(Map<String, Object> paramMap,HttpServletRequest request,HttpServletResponse response,String flowNum) throws Exception {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
        
        Map<String, Object> resultMap = new HashMap<String, Object>();
        
        HttpSession httpSession=request.getSession();
        httpSession.setAttribute("ValidateAccNbr", null);
        httpSession.setAttribute("ValidateProdPwd", null);
        if (paramMap.get("acctNbr")!=null) {
        	httpSession.setAttribute("queryCustAccNbr", paramMap.get("acctNbr"));
		}      
       
        //客户鉴权跳过 权限查询
        String iseditOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_JUMPAUTH + "_" + sessionStaff.getStaffId());
        
        try {
            if (iseditOperation == null) {
                iseditOperation = this.staffBmo.checkOperatSpec(SysConstant.JUMPAUTH_CODE, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_JUMPAUTH + "_"+ sessionStaff.getStaffId(), iseditOperation);
            }
        } catch (BusinessException e) {
            iseditOperation = "1";
        } catch (InterfaceException ie) {
            iseditOperation = "1";
        } catch (Exception e) {
            iseditOperation = "1";
        }
        
        //是否要脱敏 权限
        String isViewOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId());
		
        try{
 			if(isViewOperation==null){
 				isViewOperation=staffBmo.checkOperatSpec(SysConstant.VIEWSENSI_CODE,sessionStaff);
 				
 				ServletUtils.setSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_VIEWSENSI+"_"+sessionStaff.getStaffId(), isViewOperation);
 			}
		} catch (BusinessException e) {
			isViewOperation="1";
 		} catch (InterfaceException ie) {
 			isViewOperation="1";
		} catch (Exception e) {
			isViewOperation="1";
		}
        
        String areaId = (String) paramMap.get("areaId");
        
        if (("").equals(areaId) || areaId == null) {
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());
        }
        
        paramMap.put("staffId", sessionStaff.getStaffId());
        
        if (StringUtils.isNotBlank(MapUtils.getString(paramMap, "custQueryType"))) {
            httpSession.setAttribute("custQueryType", paramMap.get("custQueryType"));
        } else {
            httpSession.setAttribute("custQueryType", "");
        }
        
//        	{acctNbr=17767071366, identityCd=, identityNum=, partyName=, diffPlace=, areaId=8330101, queryType=, queryTypeValue=, identidies_type=接入号码, staffId=4317072}
        paramMap.put("acctNbr",  String.valueOf(paramMap.get("acctNbr")));
        paramMap.put("areaId", String.valueOf(paramMap.get("areaId")));
        paramMap.put("diffPlace", "local");
        paramMap.put("identidies_type", String.valueOf(paramMap.get("identidies_type")));
        paramMap.put("identityCd", "");
        paramMap.put("identityNum", "");
        paramMap.put("partyName", "");
        paramMap.put("queryType", String.valueOf(paramMap.get("queryType")));
        paramMap.put("queryTypeValue", String.valueOf(paramMap.get("queryTypeValue")));
       
    	//查询客户定位数据
        resultMap = custBmo.queryCustInfo(paramMap,null, sessionStaff);
        
        if (MapUtils.isNotEmpty(resultMap)) {
        	if (paramMap.containsKey("query")) {
        		resultMap.put("query", paramMap.get("query")); //综合查询调用标志
        	}
        	
    		//进行身份证脱敏
			List<Map<String, Object>> custInfos = (List<Map<String, Object>>) resultMap.get("custInfos");
			
			if (custInfos.size() > 0) {
				Map<String, Object> custInfoMap = (Map<String, Object>) custInfos.get(0);
				String idCardNumber = MapUtils.getString(custInfoMap, "idCardNumber");
				Integer length=idCardNumber.length();
				if(!isViewOperation.equals("0")&&length==18){
					 String preStr = idCardNumber.substring(0,6);
			    	 String subStr = idCardNumber.substring(14);
			    	 idCardNumber=preStr+"********"+subStr;
				}else if(!isViewOperation.equals("0")&&length==15){
					String preStr = idCardNumber.substring(0,5);
			    	 String subStr = idCardNumber.substring(13);
			    	 idCardNumber=preStr+"********"+subStr;
				}
				
				custInfoMap.put("idCardNumber", idCardNumber);
				custInfos.remove(custInfoMap);
				custInfos.add(custInfoMap);
				
				resultMap.put("custInfos", custInfos);
			}
			
        	resultMap.put("jumpAuthflag", iseditOperation);
        }
        
        return resultMap;
    }
    
    /**
     * 产品信息查询-提供给手机端调用的接口
     * @param param 
     * @return List<Map>
     */
    @SuppressWarnings("unchecked")
	public Map<String, Object> prodInfoQuery(@RequestBody Map<String, Object> paramMap, HttpServletRequest request,HttpServletResponse response, @LogOperatorAnn String flowNum) throws Exception {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
        
    	Map<String, Object> resultMap=null;
    	
    	Map<String, Object> prodMap=new HashMap<String, Object>();
    	
    	if(paramMap.get("areaId")==null){
    		prodMap.put("areaId", sessionStaff.getCurrentAreaId());
    	}else{
    		prodMap.put("areaId",paramMap.get("areaId"));
    	}
    	
    	prodMap.put("custId",paramMap.get("custId"));
    	prodMap.put("curPage","1");
    	prodMap.put("pageSize", "5");
    	prodMap.put("acctNbr",paramMap.get("acctNbr"));
    	//prodMap.put("prodClass","12");
        
        //输出参数
        this.log.debug("调用客户订购业务入参:", JsonUtil.toString(prodMap));
        
        Map<String, Object> datamap = this.custBmo.queryCustProd(prodMap, flowNum, sessionStaff);
        
        //输出返回值
        this.log.debug("调用客户订购业务返回结果:", JsonUtil.toString(datamap));
        
        String code = MapUtils.getString(datamap, "resultCode", "");
        
        if (ResultCode.R_SUCC.equals(code)) {
        	resultMap= (Map<String, Object>) datamap.get("result");
        } 
        
        return resultMap;
    }
    /**
     * 新装功能
     * @param params
     * @param request
     * @param response
     * @param httpSession
     * @param model
     * @param session
     * @return
     * @throws AuthorityException
     */
    @SuppressWarnings("unchecked")
	@LogOperatorAnn(switchs = Switch.OFF)
	@RequestMapping(value = "/prodoffer/prepare", method = RequestMethod.GET)
    public String prodOfferPrepare(@RequestParam Map<String, Object> params, HttpServletRequest request,HttpServletResponse response,HttpSession httpSession,Model model,HttpSession session) throws AuthorityException {
		try{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			
			String commonParamKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY		
			String paramsJson=request.getParameter("params");			
			if(paramsJson==null){
				//参数为空，扔公共提示页面
				model.addAttribute("errorMsg", "入参为空，请重试。");
				return "/common/error";
			}		
			String jmParamsJson = AESUtils.decryptToString(paramsJson, commonParamKey);			
			Map<String,Object> paramsMap = JsonUtil.toObject(jmParamsJson, HashMap.class);			
			Map<String, Object> checkResult = checkCommonParams(paramsMap, null);
			if("false".equals(checkResult.get("flag"))){	
				model.addAttribute("errorMsg", checkResult.get("message"));
				return "/common/error";
			}
			
//			paramsMap.put("provIsale","20150527001011");
//			paramsMap.put("provCustIdentityCd","1212");
//			paramsMap.put("custNumber","12");
//			paramsMap.put("provCustIdentityNum","10");
//			paramsMap.put("provCustAreaId","8330100");
//			paramsMap.put("actionFlag","14");
//			paramsMap.put("reloadFlag","Y");
//			paramsMap.put("isFee","1");
			
			
			String provIsale=String.valueOf(paramsMap.get("provIsale"));
			String redirectUri=String.valueOf(paramsMap.get("redirectUri"));
			String isFee=String.valueOf(paramsMap.get("isFee"));
			String reloadFlag=String.valueOf(paramsMap.get("reloadFlag"));
			String custNumber=String.valueOf(paramsMap.get("custNumber"));//客户编码
			String provCustAreaId=String.valueOf(paramsMap.get("provCustAreaId"));
			String mainProdOfferId = String.valueOf(paramsMap.get("mainProdOfferId"));//主套餐ID
			String prodOfferId= "";
			String prodOfferName = "";
			String offerNbr = "";
			
			//公共跳转参数(公共-必须) provinceInfo_参数
			Map<String, Object> provinceInfo=new HashMap<String, Object>();
			provinceInfo.put("provIsale", provIsale);
			provinceInfo.put("redirectUri", redirectUri);
			provinceInfo.put("isFee", isFee);
			provinceInfo.put("prodOfferId","81009");  //内部主套餐id
			model.addAttribute("provinceInfo_", JacksonUtil.objectToJson(provinceInfo));
			
			//进行staff获取   staffInfo_ 参数
			Map<String, Object> staffMap=APPModelController.getStaffInfo(request);			
			if(staffMap!=null && staffMap.size()!=0){
				model.addAttribute("staffInfo_", JacksonUtil.objectToJson(staffMap));
			}
			
			//进行custinfo获取,客户信息查询   custInfo_ 参数
			Map<String, Object> infoMap=new HashMap<String, Object>();
			infoMap.put("queryType", "custNumber");
			infoMap.put("queryTypeValue", custNumber);
			infoMap.put("areaId",provCustAreaId);
			infoMap.put("identidies_type", "客户编码");			
			Map<String, Object> custInfo=this.queryCustInfo(infoMap, request, response, "");		
			if(custInfo!=null && custInfo.size()!=0){
				String custInfo_=JacksonUtil.objectToJson(custInfo);				
				List<Map<String, Object>> custInfos= (List<Map<String, Object>>) custInfo.get("custInfos");				
				if(custInfos!=null && custInfos.size()>0){
					infoMap.put("custId", custInfos.get(0).get("custId"));
					infoMap.put("areaId", custInfos.get(0).get("areaId"));					
					model.addAttribute("custInfo_", custInfo_);
				}
			}else{
				model.addAttribute("errorMsg", "定位客户异常!");
				return "/common/error";
			}
			
			//进行prodinfo获取   prodInfo_ 参数
		    infoMap.put("curPage", 1);
			Map<String, Object> prodInfo=this.prodInfoQuery(infoMap, request, response, "");
			
			if(prodInfo!=null && prodInfo.size()!=0){
				List<Map<String, Object>> prodInfos=(List<Map<String, Object>>) prodInfo.get("prodInstInfos");			
				if(prodInfos!=null && prodInfos.size()>0){
					model.addAttribute("prodInfo_", JacksonUtil.objectToJson(prodInfos.get(0)));
				}else{
					model.addAttribute("errorMsg", "查询不到客户订购业务数据信息!");
					return "/common/error";
				}
			}else{
				model.addAttribute("errorMsg", "查询不到客户订购业务数据信息!");
				return "/common/error";
			}
			Map<String, Object> jumpParams=new HashMap<String, Object>();
			//reloadFlag="N";  //写死参数测试
			//传值跳转地址
			String method="/token/app/order/prodoffer/offerchange/prepare";//套餐变更 
			jumpParams.put("method", method);

			jumpParams.put("actionFlag", "2");//按功能填入
			jumpParams.put("mainProdOfferId",mainProdOfferId);  //主套餐外部id
			jumpParams.put("reloadFlag",reloadFlag);   //是否二次加载
			model.addAttribute("jumpParams_", JacksonUtil.objectToJson(jumpParams));
			
			//其他必要参数（非公共）
			model.addAttribute("reloadFlag_",reloadFlag);
			//若传进来的主套餐不为空，则取转换后的套餐id
			if(mainProdOfferId!=null&&!mainProdOfferId.equals("")&&!mainProdOfferId.equals("null")){
				if (paramsMap.get("prodOfferId")==null||paramsMap.get("prodOfferName")==null||paramsMap.get("offerNbr")==null) {
					model.addAttribute("errorMsg", "主套餐id转换参数丢失，请重试。");
					return "/common/error";
				}
				prodOfferId = String.valueOf(paramsMap.get("prodOfferId"));//集团销售品ID
				prodOfferName = String.valueOf(paramsMap.get("prodOfferName"));//集团销售品
				offerNbr = String.valueOf(paramsMap.get("offerNbr"));//集团销售品编码
				model.addAttribute("prodOfferId",prodOfferId);
				model.addAttribute("prodOfferName",prodOfferName);
				model.addAttribute("price","80");
				model.addAttribute("custId","123");
				if (!"N".equals(reloadFlag)) {
					return "/apptoken/order-search-old";
				}
			}
			//判断是否是二次加载业务
			if("N".equals(reloadFlag)){
				//暂存单接口调用
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("provTransId", provIsale);
				Map<String, Object> resultMap = new HashMap<String, Object>();
				try {
					resultMap = offerBmo.queryTemporaryOrder(paramMap,null,sessionStaff);
				} catch (Exception e) {
					model.addAttribute("errorMsg", e);
					return "/common/error";
				}
				Map<String, Object> result = new HashMap<String, Object>();
				if ("0".equals(String.valueOf(resultMap.get("resultCode")))) {
					result = (Map<String, Object>) resultMap.get("result");
					String jsonStr = JsonUtil.toString(result);
					model.addAttribute("result", jsonStr);
				}else {
					model.addAttribute("errorMsg", String.valueOf(result.get("resultMsg")));
					return "/common/error";
				}				
				return "/apptoken/order-search-reload";
			}
		}catch(Exception e){
			log.error("套餐变更/业务变更服务加载异常：",e);
			model.addAttribute("errorMsg", "套餐变更/业务变更服务加载错误!");
			return "/common/error";
		}
		
		return "/public/app-params";
    }

    /**
     * 公共参数校验
     * @param paramMap
     * @param checkList
     * @return
     */
	public Map<String, Object> checkCommonParams(Map<String,Object> paramMap,List<String> checkList){
		
		checkList.add(ConstantValues.ACTION_FLAG);
		checkList.add(ConstantValues.CUSTNUMBER);
		checkList.add(ConstantValues.ISFEE);
		checkList.add(ConstantValues.PROVCUST_AREAID);
		checkList.add(ConstantValues.PROVCUSTIDENTITYCD);
		checkList.add(ConstantValues.PROVCUSTIDENTITYNUM);
		checkList.add(ConstantValues.PROVISALE);
		checkList.add(ConstantValues.RELOAD_FLAG);
		
		Map<String, Object> resultMap = new HashMap<String, Object>();
		if (paramMap==null||paramMap.isEmpty()) {
			resultMap.put("flag", "false");
			resultMap.put("message", "入参为空，无法进行受理");
		}
		for (int i = 0; i < checkList.size(); i++) {
			String param = (String) paramMap.get(checkList.get(i));
			if (param==null||"".equals(param)||"null".equals(param)) {
				resultMap.put("flag", "false");
				resultMap.put("message", ConstantValues.warningMsgMap.get(checkList.get(i)));
			}
		}
		return resultMap;
	}
}
