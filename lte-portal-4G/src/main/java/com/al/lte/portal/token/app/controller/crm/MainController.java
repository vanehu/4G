package com.al.lte.portal.token.app.controller.crm;

import java.util.ArrayList;
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


@Controller("com.al.lte.portal.token.app.controller.crm")
@RequestMapping("/token/app/main/*")
@AuthorityValid(isCheck = false)
public class MainController extends BaseController {
	
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
			String accessToken=(String) params.get("accessToken");
			
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

//			paramsMap.put("provIsale","20150527001011");
//			paramsMap.put("provCustIdentityCd","1212");
//			paramsMap.put("custNumber","12");
//			paramsMap.put("provCustIdentityNum","10");
//			paramsMap.put("provCustAreaId","8330100");
//			paramsMap.put("actionFlag","14");
//			paramsMap.put("reloadFlag","Y");
//			paramsMap.put("isFee","2");
//			paramsMap.put("redirectUri", "");
			
			//进行非空判断
			if(!checkParams(paramsMap)){
				model.addAttribute("errorMsg", "参数丢失，请重试");
				return "/common/error";
			}
			
			String provIsale=String.valueOf(paramsMap.get("provIsale"));
			String redirectUri=String.valueOf(paramsMap.get("redirectUri"));
			String isFee=String.valueOf(paramsMap.get("isFee"));
			String reloadFlag=String.valueOf(paramsMap.get("reloadFlag"));
			String provCustAreaId=String.valueOf(paramsMap.get("provCustAreaId"));
			String termCode=String.valueOf(paramsMap.get("termCode"));//终端串码
			String salesCode=String.valueOf(paramsMap.get("salesCode"));//发展人工号
			
			//进行staff获取
			Map<String, Object> staffMap=APPModelController.getStaffInfo(request);
			
			if(staffMap!=null && staffMap.size()!=0){
				staffMap.put("soAreaAllName", "");
				staffMap.put("areaAllName", "");
				model.addAttribute("staffInfo_", JacksonUtil.objectToJson(staffMap));
			}
			String mergeFlag = "0";
			String interface_merge = MySimulateData.getInstance().getParam("INTERFACE_MERGE",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"INTERFACE_MERGE");
			String provareaId = paramsMap.get("provCustAreaId").toString().subSequence(0, 3)+"0000";
			if(interface_merge != null && interface_merge.indexOf(provareaId)!=-1){
				mergeFlag = "1";
			}
			model.addAttribute("mergeFlag", mergeFlag);
			model.addAttribute("provCustAreaId", provCustAreaId);
			String cust_Info = "{}";
			String prod_Info = "{}";
			if("0".equals(mergeFlag)){
				//进行custnfo获取
				Map<String, Object> infoMap=new HashMap<String, Object>();
				infoMap.put("acctNbr", paramsMap.get("mainPhoneNum"));
				infoMap.put("areaId",paramsMap.get("provCustAreaId"));
				infoMap.put("identidies_type", "接入号码");
				
				Map<String, Object> custInfo=this.queryCustInfo(infoMap, request, response, "");
				
				if(custInfo!=null && custInfo.size()!=0){
					if(custInfo.get("code").equals("0")){
						cust_Info=JacksonUtil.objectToJson(custInfo);
						
						if(custInfo.get("custInfos")!=null){
							List<Map<String, Object>> custInfos= (List<Map<String, Object>>) custInfo.get("custInfos");
	
							if(custInfos!=null && custInfos.size()>0){
								infoMap.put("custId", custInfos.get(0).get("custId"));
								infoMap.put("areaId", custInfos.get(0).get("areaId"));
								
								
							}
						}else{
							model.addAttribute("errorMsg", "客户无可用的产品信息!");
							return "/common/error";
						}
					}else{
						model.addAttribute("errorMsg", custInfo.get("message"));
						return "/common/error";
					}
	
					
				}else{
					model.addAttribute("errorMsg", "无法定位客户!");
					return "/common/error";
				}
				
				//进行prodinfo获取
			    infoMap.put("curPage", 1);
				Map<String, Object> prodInfo=new HashMap<String, Object>();
						
				prodInfo=this.prodInfoQuery(infoMap, request, response, "");
				
				if(prodInfo!=null && prodInfo.size()!=0){
					
					if(prodInfo.get("prodInstInfos")!=null){
						List<Map<String, Object>> prodInfos=(List<Map<String, Object>>) prodInfo.get("prodInstInfos");
						
						prodInfo=prodInfos.get(0);
						prod_Info = JacksonUtil.objectToJson(prodInfo);
					}else{
						model.addAttribute("errorMsg", "查询不到客户订购业务数据信息!");
						return "/common/error";
					}
				}else{
					model.addAttribute("errorMsg", "查询不到客户订购业务数据信息!");
					return "/common/error";
				}
			    
			}
			model.addAttribute("custInfo_", cust_Info);
			model.addAttribute("prodInfo_", prod_Info);
			//传值跳转地址
			String method="/token/app/order/attachoffer/prepare?accessToken="+accessToken;//按各自功能填入
			
			Map<String, Object> jumpParams=new HashMap<String, Object>();
			jumpParams.put("method", method);
			jumpParams.put("actionFlag", "14");//按功能填入
			
			model.addAttribute("jumpParams_", JacksonUtil.objectToJson(jumpParams));
			
			//公共跳转参数(公共-必须)
			Map<String, Object> provinceInfo=new HashMap<String, Object>();
			provinceInfo.put("provIsale", provIsale);
			provinceInfo.put("redirectUri", redirectUri);
			provinceInfo.put("isFee", isFee);
			provinceInfo.put("reloadFlag", reloadFlag);
			provinceInfo.put("termCode", termCode);
			provinceInfo.put("salesCode", salesCode);
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
			 //终端串码
			model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
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
			
			//其他必要参数（非公共）
			model.addAttribute("acrNum", paramsMap.get("mainPhoneNum"));
			model.addAttribute("phoneNum_", paramsMap.get("mainPhoneNum"));
			model.addAttribute("reloadFlag_",paramsMap.get("reloadFlag"));
			
		}catch(Exception e){
			log.error("可选包/业务变更服务加载异常：",e);
			model.addAttribute("errorMsg", "可选包/业务变更服务加载错误!");
			return "/common/error";
		}
		
		return "/public/app-params";
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
			
			if(provIsale==null || provCustIdentityCd==null || custNumber==null || provCustIdentityNum==null || provCustAreaId==null
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
            log.error("客户权限验证:",e);
        } catch (InterfaceException ie) {
            iseditOperation = "1";
            log.error("客户权限验证:",ie);
        } catch (Exception e) {
            iseditOperation = "1";
            log.error("客户权限验证:",e);
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
			log.error("是否信息脱敏:",e);
 		} catch (InterfaceException ie) {
 			isViewOperation="1";
 			log.error("是否信息脱敏:",ie);
		} catch (Exception e) {
			isViewOperation="1";
			log.error("是否信息脱敏:",e);
		}
        
        String areaId = (String) paramMap.get("areaId");     
        if (("").equals(areaId) || areaId == null) {
            paramMap.put("areaId", sessionStaff.getCurrentAreaId());
        }
        //paramMap.put("staffId", sessionStaff.getStaffId());
        
        if (StringUtils.isNotBlank(MapUtils.getString(paramMap, "custQueryType"))) {
            httpSession.setAttribute("custQueryType", paramMap.get("custQueryType"));
        } else {
            httpSession.setAttribute("custQueryType", "");
        }       
//      {acctNbr=17767071366, identityCd=, identityNum=, partyName=, diffPlace=, areaId=8330101, queryType=, queryTypeValue=, identidies_type=接入号码, staffId=4317072}
        if(paramMap.get("acctNbr")!=null){
        	paramMap.put("acctNbr",String.valueOf(paramMap.get("acctNbr")));
        }else{
        	paramMap.put("acctNbr","");
        }
        paramMap.put("areaId", String.valueOf(paramMap.get("areaId")));
        paramMap.put("diffPlace", "local");
        paramMap.put("identidies_type", String.valueOf(paramMap.get("identidies_type")));
        paramMap.put("identityCd", "");
        paramMap.put("identityNum", "");
        paramMap.put("partyName", "");
        paramMap.put("queryType", String.valueOf(paramMap.get("queryType")));
        paramMap.put("queryTypeValue", String.valueOf(paramMap.get("queryTypeValue")));
    	
    	//查询客户定位数据
        try {
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
            	resultMap.put("code","0");
            }  
		}catch (BusinessException be) {
			resultMap.put("code","-1000");
			resultMap.put("message", super.failed(be));
		} catch (InterfaceException ie) {
			resultMap.put("code","-1000");
			resultMap.put("message", super.failed(ie, null, ErrorCode.QUERY_CUST));
		} catch (Exception e) {
			resultMap.put("code","-1000");
			resultMap.put("message", super.failed(ErrorCode.QUERY_CUST, e, null));
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
    	
    	if(paramMap.get("custId")!=null && !"".equals(String.valueOf(paramMap.get("custId"))) && !"null".equals(String.valueOf(paramMap.get("custId")))){
    		prodMap.put("custId",paramMap.get("custId"));
    	}else{
    		prodMap.put("custId","");
    	}
    	
    	prodMap.put("curPage","1");
    	prodMap.put("pageSize", "5");
    	prodMap.put("acctNbr",paramMap.get("acctNbr"));
        
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
     * 
     * @param provIsale 流水号
     * @param provCustAreaId 地市
     * @param sessionStaff 用户信息
     * @return Map<String, Object> 
     * @throws Exception
     */
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
			String accessToken=(String) params.get("accessToken");
			
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
			
			String commonParamKey = MySimulateData.getInstance().getParam("COMMON_PARAM_KEY",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY		
			String paramsJson=request.getParameter("params");			
			if(paramsJson==null){
				//参数为空，扔公共提示页面
				model.addAttribute("errorMsg", "入参为空，请重试。");
				return "/common/error";
			}		
			String jmParamsJson = AESUtils.decryptToString(paramsJson, commonParamKey);			
			Map<String,Object> paramsMap = JsonUtil.toObject(jmParamsJson, HashMap.class);
			List<String> checkList = new ArrayList<String>();
			Map<String, Object> checkResult = checkCommonParams(paramsMap, checkList);
			if("false".equals(checkResult.get("flag"))){	
				model.addAttribute("errorMsg", checkResult.get("message"));
				return "/common/error";
			}
			/*Map<String, Object> paramsMap = new HashMap<String, Object>();
			paramsMap.put("provIsale","20150527001011");
			paramsMap.put("provCustIdentityCd","1212");
			paramsMap.put("custNumber","171100052872830");
			paramsMap.put("provCustIdentityNum","10");
			paramsMap.put("provCustAreaId","8330100");
			paramsMap.put("actionFlag","1");
			paramsMap.put("reloadFlag","N");
			paramsMap.put("isFee","1");*/
			
			
			String provIsale=String.valueOf(paramsMap.get("provIsale"));
			String redirectUri=String.valueOf(paramsMap.get("redirectUri"));
			String isFee=String.valueOf(paramsMap.get("isFee"));
			String reloadFlag=String.valueOf(paramsMap.get("reloadFlag"));
			String custNumber=String.valueOf(paramsMap.get("custNumber"));//客户编码
			String provCustAreaId=String.valueOf(paramsMap.get("provCustAreaId"));
			String mainProdOfferId = String.valueOf(paramsMap.get("mainProdOfferId"));//主套餐ID
			String mktResInstCode = String.valueOf(paramsMap.get("mktResInstCode"));//uim卡号
			String acctCd = (String) paramsMap.get("acctNumber");//帐户合同号
			if(acctCd==null||acctCd.equals("")||acctCd.equals("null")){
				acctCd="";
			}
			String termCode=String.valueOf(paramsMap.get("termCode"));//终端串码
			String salesCode=String.valueOf(paramsMap.get("salesCode"));//发展人工号
			
			//主号码: 目前变更业务送
			String mainPhoneNum = (String) paramsMap.get("mainPhoneNum");
			//新装成员号码： 多个成员使用分隔符‘,’
			String newSubPhoneNum = (String) paramsMap.get("newSubPhoneNum");
			String prodOfferId= "";
			String prodOfferName = "";
			String offerNbr = "";
			
			//公共跳转参数(公共-必须) provinceInfo_参数
			Map<String, Object> provinceInfo=new HashMap<String, Object>();
			provinceInfo.put("provIsale", provIsale);
			provinceInfo.put("redirectUri", redirectUri);
			provinceInfo.put("isFee", isFee);
			provinceInfo.put("reloadFlag", reloadFlag);
			provinceInfo.put("termCode", termCode);
			provinceInfo.put("salesCode", salesCode);
			//provinceInfo.put("mktResInstCode", mktResInstCode);
			//provinceInfo.put("prodOfferId", "81013");
			//provinceInfo.put("prodOfferName", "乐享4G201407 99元-主套餐");		
			
			//UIM卡传参改造
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
			
			provinceInfo.put("mktResInstCode", mktResInstCodes);
			provinceInfo.put("codeMsg", codeMsg);
			
			
			//进行staff获取   staffInfo_ 参数
			Map<String, Object> staffMap=APPModelController.getStaffInfo(request);			
			if(staffMap!=null && staffMap.size()!=0){
				staffMap.put("soAreaAllName", "");
				staffMap.put("areaAllName", "");
				model.addAttribute("staffInfo_", JacksonUtil.objectToJson(staffMap));
			}	
			
			//传入帐户合同号
			model.addAttribute("acctCd", acctCd);
			model.addAttribute("custNumber", custNumber);
			//传值跳转地址
			String method="/token/app/order/prodoffer/prepare?accessToken="+accessToken;//新装地址			
			//String method="/token/app/order/reload/prodoffer/prepare";//新装二次加载地址			
		
			//其他必要参数（非公共）
			model.addAttribute("reloadFlag",reloadFlag);
			//若传进来的主套餐不为空，则取转换后的套餐id
			if(mainProdOfferId!=null&&!mainProdOfferId.equals("")&&!mainProdOfferId.equals("null")){
				if (paramsMap.get("prodOfferId")==null||paramsMap.get("prodOfferName")==null||paramsMap.get("offerNbr")==null) {
					model.addAttribute("errorMsg", "主套餐id转换参数丢失，请重试。");
					return "/common/error";
				}
				prodOfferId = String.valueOf(paramsMap.get("prodOfferId"));//集团销售品ID
				prodOfferName = String.valueOf(paramsMap.get("prodOfferName"));//集团销售品
				offerNbr = String.valueOf(paramsMap.get("offerNbr"));//集团销售品编码
				//判断是否有传主副卡号码  
				if(mainPhoneNum!=null&&!"".equals(mainPhoneNum)&&!"null".equals(mainPhoneNum)){
					model.addAttribute("mainPhoneNum",mainPhoneNum);
				}
				if (newSubPhoneNum!=null&&!"".equals(newSubPhoneNum)&&!"null".equals(newSubPhoneNum)) {
					model.addAttribute("newSubPhoneNum",newSubPhoneNum);
				}
				model.addAttribute("prodOfferId",prodOfferId);
				provinceInfo.put("prodOfferId", prodOfferId);
				model.addAttribute("prodOfferName",prodOfferName);
			}
			
			model.addAttribute("provinceInfo_", JacksonUtil.objectToJson(provinceInfo));
			String mergeFlag = "0";
			String interface_merge = MySimulateData.getInstance().getParam("INTERFACE_MERGE",(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"INTERFACE_MERGE");
			String provareaId = paramsMap.get("provCustAreaId").toString().subSequence(0, 3)+"0000";
			if(interface_merge != null && interface_merge.indexOf(provareaId)!=-1){
				mergeFlag = "1";
			}
			String cust_Info = "{}";
			if("0".equals(mergeFlag)){
				//进行custinfo获取,客户信息查询   custInfo_ 参数
				Map<String, Object> custInfoMap=new HashMap<String, Object>();
				custInfoMap.put("queryType", "custNumber");
				custInfoMap.put("queryTypeValue", custNumber);
				custInfoMap.put("areaId",provCustAreaId);
				custInfoMap.put("identidies_type", "客户编码");		
				/*custInfoMap.put("queryType", "");
				custInfoMap.put("queryTypeValue", "15301587004");
				custInfoMap.put("areaId",provCustAreaId);
				custInfoMap.put("identidies_type", "接入号码");
				custInfoMap.put("acctNbr", "15301587004");*/
				Map<String, Object> custInfo=this.queryCustInfo(custInfoMap, request, response, "");
				if(custInfo!=null && custInfo.size()!=0){
					if(custInfo.get("code").equals("0")){
						cust_Info=JacksonUtil.objectToJson(custInfo);			
						List<Map<String, Object>> custInfos= (List<Map<String, Object>>) custInfo.get("custInfos");			
						if(custInfos!=null && custInfos.size()>0){
							custInfoMap.put("custId", custInfos.get(0).get("custId"));
							custInfoMap.put("areaId", custInfos.get(0).get("areaId"));					
						}else{
							model.addAttribute("errorMsg", "定位客户信息返回为空!");
							return "/common/error";
						}
					}else{
						model.addAttribute("errorMsg", custInfo.get("message"));
						return "/common/error";
					}
					
				}else{
					model.addAttribute("errorMsg", "无法定位客户!");
					return "/common/error";
				}
			}
			model.addAttribute("custInfo_", cust_Info);
			//判断是否是二次加载业务
			Map<String, Object> result = new HashMap<String, Object>();
			if("N".equals(reloadFlag)){
				//暂存单接口调用
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("provTransId", provIsale);
				paramMap.put("backFlag", "Y");
				Map<String, Object> resultMap = new HashMap<String, Object>();
				try {
					resultMap = offerBmo.queryTemporaryOrder(paramMap,null,sessionStaff);
				} catch (Exception e) {
					model.addAttribute("errorMsg", e);
					return "/common/error";
				}
				if ("0".equals(String.valueOf(resultMap.get("resultCode")))) {
					result = (Map<String, Object>) resultMap.get("result");
				}else {
					model.addAttribute("errorMsg", String.valueOf(resultMap.get("resultMsg")));
					return "/common/error";
				}				
				method = "/token/app/order/reload/prodoffer/prepare?accessToken="+accessToken;
			}
			model.addAttribute("reloadOrderInfo_", JsonUtil.toString(result));
			model.addAttribute("oldSubPhoneNum", (String) paramsMap.get("oldSubPhoneNum"));
			model.addAttribute("provCustAreaId", provCustAreaId);
			//终端串码
			model.addAttribute("terminalCode",paramsMap.get("termCode")==null?"":paramsMap.get("termCode").toString());
			Map<String, Object> jumpParams=new HashMap<String, Object>();
			jumpParams.put("method", method);
			jumpParams.put("actionFlag", "1");//新装功能填入
			model.addAttribute("jumpParams_", JacksonUtil.objectToJson(jumpParams));
			Map<String, Object> prodInfo=new HashMap<String, Object>();
			model.addAttribute("prodInfo_", JacksonUtil.objectToJson(prodInfo));
			model.addAttribute("mergeFlag", mergeFlag);
		}catch(Exception e){
			log.error("新装功能服务加载异常：",e);
			model.addAttribute("errorMsg", e);
			return "/common/error";
		}	
		return "/public/app-params";
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
			String param = String.valueOf(paramMap.get(checkList.get(i)));
			if (param==null||"".equals(param)||"null".equals(param)) {
				resultMap.put("flag", "false");
				resultMap.put("message", ConstantValues.warningMsgMap.get(checkList.get(i)));
			}
		}
		return resultMap;
	}	
}
