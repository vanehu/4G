package com.al.lte.portal.controller.crm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.crm.RuleBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 订单终端控制层 .
 * <P>
 * @author zhengyx
 * @version V1.0 2013-8-20
 * @createDate 2013-8-20 上午10:03:44
 * @modifyDate  <BR>
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.controller.crm.OrderProdModifyController")
@RequestMapping("/order/prodModify/*")
public class OrderProdModifyController extends BaseController {

    /** 业务操作类 */
    @Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.RuleBmo")
    private RuleBmo ruleBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	@Autowired
    private PropertiesUtils propertiesUtils;
	@RequestMapping(value = "/lossRepProd", method = {RequestMethod.POST})
	public String lossRepProd(@RequestBody Map<String, Object> param, Model model, HttpServletResponse response) {
		//TODO call general order rule
		if (!MapUtils.isEmpty(param)) {
			//添加一些属性
			param.put("offerNum", 1);
			model.addAttribute("orderProdInfo", param);
		}
		return "/order/order-prodmodiy-lossreg-prepare";
	}
	@RequestMapping(value = "/custInfoModify", method = {RequestMethod.POST})
	public String custInfoModify(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String optFlowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		if (!MapUtils.isEmpty(param)) {
			model.addAttribute("modifyCustInfo", param);
		}
    	Map paramMap=new HashMap();
    	paramMap.put("partyId", param.get("custId"));
    	paramMap.put("areaId", param.get("areaId"));
    	String sussFlag="";
		Map<String, Object> datamap = null;
		Map<String, Object> resultMap = null;
		Map<String, Object> partyListMap = null;
		Map<String, Object> profilesMap = null;
		try{
		datamap = this.custBmo.queryCustDetail(paramMap, optFlowNum, sessionStaff);
		log.debug("return={}", JsonUtil.toString(datamap));
		String code = (String) datamap.get("resultCode");
		List<Map<String, Object>> identitiesList = null;
		List<Map<String, Object>> profilesList = null;
		List<Map<String, Object>> partyContactInfoList = null;
		List<Map<String, Object>> tabTempList= null;
		List<Map<String, Object>> tabTempAddList= null;
		
		if (ResultCode.R_SUCC.equals(code)) {
			resultMap =MapUtils.getMap(datamap, "result");
			partyListMap=MapUtils.getMap(resultMap, "partyList");
			if (resultMap != null&&(partyListMap.size()>0)) {
				
				profilesMap=MapUtils.getMap(resultMap, "profiles");
				identitiesList = (List<Map<String, Object>>)partyListMap.get("identities");
				profilesList = (List<Map<String, Object>>)partyListMap.get("profiles");
				partyContactInfoList = (List<Map<String, Object>>)partyListMap.get("partyContactInfo");
        		//纳税 人权限查询
        		String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(),
    					SysConstant.SESSION_KEY_EDITTAXPAYER+"_"+sessionStaff.getStaffId());
        		try{
    	 			if(iseditOperation==null){
    	 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.EDITTAXPAYER_CODE,sessionStaff);
    	 				ServletUtils.setSessionAttribute(super.getRequest(),
    	 						SysConstant.SESSION_KEY_EDITTAXPAYER+"_"+sessionStaff.getStaffId(), iseditOperation);
    	 			}
     			} catch (BusinessException e) {
     				iseditOperation="1";
     	 		} catch (InterfaceException ie) {
     	 			iseditOperation="1";
     			} catch (Exception e) {
     				iseditOperation="1";
     			}
				//tabTempList客户属性tab页
				tabTempList =new ArrayList();
				for (int i=0;i<profilesList.size();i++){
					Map tabtempMap=new HashMap();
					String partyProfileCatgTypeCdStr=  String.valueOf(profilesList.get(i).get("partyProfileCatgTypeCd"));
					if(partyProfileCatgTypeCdStr!=null&&!"".equals(partyProfileCatgTypeCdStr)){
						Integer partyProfileCatgTypeCd=Integer.valueOf(partyProfileCatgTypeCdStr);
	        			if((iseditOperation!="0"&&partyProfileCatgTypeCd!=2)||iseditOperation=="0"){
	        				tabtempMap.put("partyProfileCatgTypeCd", profilesList.get(i).get("partyProfileCatgTypeCd"));
	    					tabtempMap.put("partyProfileCatgTypeName", profilesList.get(i).get("partyProfileCatgTypeName"));
	    					tabtempMap.put("tabProfileNum", "modTabProfile"+profilesList.get(i).get("partyProfileCatgTypeCd"));
	    					tabTempList.add(tabtempMap);
	                     };  
						
					}
					
					
				}
				removeDuplicate(tabTempList);
				this.log.debug("sort before={}", JsonUtil.toString(tabTempList));
				Collections.sort(tabTempList, new Comparator<Map<String, Object>>() {
					public int compare(Map<String, Object> e1, Map<String, Object> e2) {
						if (NumberUtils.isNumber(String.valueOf(e1
								.get("partyProfileCatgTypeCd")))) {
							long prodOfferInstId1 = Long.parseLong(String.valueOf(e1
									.get("partyProfileCatgTypeCd")));
							long prodOfferInstId2 = Long.parseLong(String.valueOf(e2
									.get("partyProfileCatgTypeCd")));
							if (prodOfferInstId1 - prodOfferInstId2 > 0)
								return 1;
							else
								return -1;
						} else {
							return 1;
						}

					}
				});
				// 排序后
				this.log.debug("sort after={}", JsonUtil.toString(tabTempList));
				
				for (int i=0;i<tabTempList.size();i++){
   				 tabTempAddList=new ArrayList();
   				 for (int j=0;j<profilesList.size();j++){
   					 Integer partyProfileCatgTypeCd=(Integer) profilesList.get(j).get("partyProfileCatgTypeCd");
   					 if(partyProfileCatgTypeCd!=null){
   					 if(partyProfileCatgTypeCd!=3||partyProfileCatgTypeCd!=2||(partyProfileCatgTypeCd==2&&iseditOperation=="0")){
   						 
   						 if(partyProfileCatgTypeCd==tabTempList.get(i).get("partyProfileCatgTypeCd")){
   							tabTempAddList.add(profilesList.get(j));
                       		 
                       	 }
   						 
   					 }
   					 }
   					 
   				 }
   				tabTempList.get(i).put("tabProfile", tabTempAddList);
               	 
                }
        		model.addAttribute("identities", identitiesList);
        		model.addAttribute("profiles", profilesList);
        		model.addAttribute("partyContactInfos", partyContactInfoList);
        		model.addAttribute("modProfileTabList", tabTempList);
        		model.addAttribute("profilesJson", JsonUtil.buildNormal().objectToJson(profilesList));
        		model.addAttribute("modProfileTabListJson", JsonUtil.buildNormal().objectToJson(tabTempList));
        		model.addAttribute("boActionTypeName", param.get("boActionTypeName"));
        		model.addAttribute("modPartyTypeCd", partyListMap);
				
							}/*else{
								return super.failedStr(model, ErrorCode.QUERY_CUST_EXINFO, datamap, paramMap);
							}*/
			}
		} catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST_EXINFO);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.QUERY_CUST_EXINFO, datamap, paramMap);
		}
		
		return "/order/order-custinfo-modify";
	}
    /**
     * 过户订单准备
     * @param param
     * @param model
     * @return
     * @throws BusinessException 
     */
	@RequestMapping(value = "/custTransfer", method = {RequestMethod.POST})
	public String custTransfer(@RequestBody Map<String, Object> param, @LogOperatorAnn String optFlowNum,Model model, HttpServletResponse response) {
		//TODO call general order rule
		if (!MapUtils.isEmpty(param)) {
			//添加一些属性
			param.put("offerNum", 1);
			model.addAttribute("orderProdInfo", param);
		}
		if(param.get("actionFlag")!=null && "43".equals(param.get("actionFlag").toString())){
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
			Map<String, Object> paramMap=new HashMap<String, Object>();
	    	paramMap.put("partyId", param.get("custId"));
	    	paramMap.put("areaId", param.get("areaId"));
			Map<String, Object> datamap = new HashMap<String, Object>();
			Map<String, Object> resultMap = new HashMap<String, Object>();
			Map<String, Object> partyListMap = new HashMap<String, Object>();
			List<Map<String, Object>> identitiesList = null;
			try {
				datamap = this.custBmo.queryCustDetail(paramMap, optFlowNum, sessionStaff);
				log.debug("return={}", JsonUtil.toString(datamap));
				String code = (String) datamap.get("resultCode");
				if (ResultCode.R_SUCC.equals(code)) {
					resultMap =MapUtils.getMap(datamap, "result");
					partyListMap=MapUtils.getMap(resultMap, "partyList");
					if (resultMap != null&&(partyListMap.size()>0)) {
						identitiesList = (List<Map<String, Object>>)partyListMap.get("identities");
					}
				}
			}catch (BusinessException be) {
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
				return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_CUST_EXINFO);
			} catch (Exception e) {
				
				return super.failedStr(model, ErrorCode.QUERY_CUST_EXINFO, datamap, paramMap);
			}
			model.addAttribute("modPartyTypeCd", partyListMap);
			model.addAttribute("identities", identitiesList);
			return "/order/order-return-file";
		}
		return "/order/order-cust-transfer";
	}
    /**
     * 物联网过户订单准备
     * @param model
     * @param request
     * @param response
     * @return
     * @throws BusinessException
     */
	@RequestMapping(value = "/custTransfe4iot", method = {RequestMethod.GET})
	public String custTransfer4iot(Model model,HttpServletRequest request, HttpServletResponse response) {
		return "/order/order-cust-transfer-iot";
	}

    /**
     * 帐户信息修改：产品下帐户信息查询
     * @param param
     * @param model
     * @return
     * @throws BusinessException 
     */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/acctInfoModify", method = {RequestMethod.POST})
	public String acctInfoModify(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String optFlowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> paramMap=new HashMap<String, Object>();
		paramMap.put("prodId", param.get("prodId").toString());
		paramMap.put("acctNbr", param.get("acctNbr").toString());
		paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		try {
			Map<String, Object> datamap =  orderBmo.queryProdAcctInfo(paramMap, optFlowNum, sessionStaff);
			if(datamap.get("resultCode").equals(ResultCode.R_SUCC)){
			Map<String, Object> result = (Map<String, Object>) datamap.get("result");
			ArrayList<Map<String, Object>> prodAcctInfos = (ArrayList<Map<String, Object>>)result.get("prodAcctInfos");
			model.addAttribute("prodAcctInfos", prodAcctInfos);
		}}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model, ie, param, ErrorCode.QUERY_PROD_ACCT);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.QUERY_PROD_ACCT, e, param);
		}
		return "/order/order-acctinfo-modify";
	}
	   /**
     * 帐户信息修改：帐户详情查询
     * @param param
     * @param model
     * @return
     * @throws BusinessException 
     */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryAcctDetailInfo", method = {RequestMethod.POST})
	public String queryAcctDetailInfo(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String optFlowNum, HttpServletResponse response) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);

		Map<String, Object> empty = new HashMap<String, Object>();
		String serviceName = "后台服务service/intf.acctService/queryAcctDetailInfo的回参缺少";
		
		try {
			param.put("areaId", sessionStaff.getCurrentAreaId());
			Map<String, Object> resultMap = orderBmo.queryAcctDetailInfo(param, optFlowNum, sessionStaff);
			if(resultMap.get("resultCode").equals(ResultCode.R_SUCC)){
				if(!MapUtils.getMap(resultMap, "result", empty).isEmpty()){
					Map<String, Object> result = (Map<String, Object>)resultMap.get("result");
					if(!MapUtils.getMap(result, "acctInfo", empty).isEmpty()){
						Map<String, Object> acctInfo = (Map<String, Object>)result.get("acctInfo");
						model.addAttribute("acctName", acctInfo.get("acctName")); //帐户名称
						model.addAttribute("partyId", acctInfo.get("partyId")); //客户ID
						//开始获取帐户支付信息
						if(acctInfo.get("acct2PaymentAcct")!=null){
							ArrayList<Map<String, Object>> acct2PaymentAcct = (ArrayList<Map<String, Object>>)acctInfo.get("acct2PaymentAcct");
							if(acct2PaymentAcct.size()>0){
								Map<String, Object> paymentInfo = acct2PaymentAcct.get(0);
								if(!MapUtils.getMap(paymentInfo, "paymentAccount", empty).isEmpty()){
									Map<String, Object> paymentAccount = (Map<String, Object>)paymentInfo.get("paymentAccount");
									String paymentType = MapUtils.getString(paymentAccount, "paymentAccountTypeCd", "x");
									if(paymentType.equals("100000") || paymentType.equals("110000")){
										model.addAttribute("paymentType", paymentType); //支付类型 100000:现金 110000:银行
										model.addAttribute("bankName", paymentAccount.get("bankName")); //银行名称
										model.addAttribute("bankId", paymentAccount.get("bankId")); //银行ID
										model.addAttribute("bankAcct", paymentAccount.get("bankAcctCd")); //银行账号
										model.addAttribute("paymentMan", paymentAccount.get("paymentMan")); //支付人
										model.addAttribute("paymentAccountId", paymentInfo.get("paymentAccountId")); //支付帐户ID
									}
									else{
										model.addAttribute("paymentType", "x");
									}
								}
								else{
									model.addAttribute("flag", 1);
									model.addAttribute("failInfo", serviceName + "【paymentAccount】节点或该节点为空，请与省内确认！");
									return "/order/order-acctinfo-detail";
								}
							}
							else{
								model.addAttribute("flag", 1);
								model.addAttribute("failInfo", serviceName + "【acct2PaymentAcct】节点或该节点为空，请与省内确认！");
								return "/order/order-acctinfo-detail";
							}
						}
						else{
							model.addAttribute("flag", 1);
							model.addAttribute("failInfo", serviceName + "【acct2PaymentAcct】节点或该节点为空，请与省内确认！");
							return "/order/order-acctinfo-detail";
						}
						//开始获取账单投递信息
						if(acctInfo.get("accountMailing")!=null){
							ArrayList<Map<String, Object>> accountMailing = (ArrayList<Map<String, Object>>)acctInfo.get("accountMailing");
							if(accountMailing.size()>0){
								Map<String, Object> billPostInfo = accountMailing.get(0);
								String postType = MapUtils.getString(billPostInfo, "mailingType", "-1");
								if(postType.equals("11") || postType.equals("12")  || postType.equals("13")  || postType.equals("14")  || postType.equals("15")){
									model.addAttribute("postType", postType); //投递方式 11:邮寄 12:传真 13:Email 14:短信 15:快递
									String postAddress = MapUtils.getString(billPostInfo, "param1", ""); //投递地址（若投递方式是11/15，格式为：地址，邮编，收件人）
									if(postAddress.contains(",")){
										model.addAttribute("postAddress", postAddress.split(",")[0]); //地址
										model.addAttribute("zipCode", postAddress.split(",")[1]); //邮编
										model.addAttribute("consignee", postAddress.split(",")[2]); //收件人
									}
									else{
										model.addAttribute("postAddress", postAddress);
									}
									String postCycle = MapUtils.getString(billPostInfo, "param3", "x");
									if(postCycle.equals("3") || postCycle.equals("4") || postCycle.equals("5") || postCycle.equals("6")){
										model.addAttribute("postCycle", postCycle); //投递周期 3:月 4:季度 5:半年 6:年
									}
									else{
										model.addAttribute("postCycle", "x");
									}
									String billContent = MapUtils.getString(billPostInfo, "param7", "x");
									if(billContent.equals("11") || billContent.equals("12") || billContent.equals("13") || billContent.equals("14")){
										model.addAttribute("billContent", billContent); //账单内容 11:账单 12:账单和详单 13:详单 14:发票
									}
									else{
										model.addAttribute("billContent", "x");
									}
								}
								else{
									model.addAttribute("postType", "-1"); //-1标识不投递账单
								}
							}
							else{
								model.addAttribute("postType", "-1"); //-1标识不投递账单
							}
						}
						else{
							model.addAttribute("postType", "-1"); //-1标识不投递账单
						}
						model.addAttribute("flag", 0);
					}
					else{
						model.addAttribute("flag", 1);
						model.addAttribute("failInfo", serviceName + "【acctInfo】节点或该节点为空，请与省内确认！");
					}
				}
				else{
					model.addAttribute("flag", 1);
					model.addAttribute("failInfo", serviceName + "【result】节点或该节点为空，请与省内确认！");
				}
			}
			else{
				model.addAttribute("flag", 1);
				model.addAttribute("failInfo", resultMap.get("resultMsg"));
			}
		}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){	
			return super.failedStr(model, ie, param, ErrorCode.QUERY_ACCT_DETAIL);
		}catch (Exception e){
			return super.failedStr(model, ErrorCode.QUERY_ACCT_DETAIL, e, param);
		}
		return "/order/order-acctinfo-detail";
	}
	
    /**
     * 过户定位查询
     * @param param
     * @param model
     * @return
     * @throws BusinessException 
     */
	@RequestMapping(value = "/transferQueryCust", method = { RequestMethod.POST })
    public String transferQueryCust(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum,
            HttpServletResponse response,HttpSession httpSession) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String identityCd = MapUtils.getString(param, "identityCd","");
		String identityNum = MapUtils.getString(param, "identityNum","");
		String busiFlag = MapUtils.getString(param, "busiFlag","");
		if(identityCd.equals("1") && null !=sessionStaff.getIdType() && "ON".equals(sessionStaff.getIdType())){
			if("FD".equals(busiFlag)){
				if(null != httpSession.getAttribute(Const.CACHE_CERTINFO)){
					String certNum = (String)httpSession.getAttribute(Const.CACHE_CERTINFO);
					if(!certNum.equals(identityNum)){
						model.addAttribute("busiFlag", busiFlag);
						model.addAttribute("message", "证件信息与读卡信息不吻合,请重新读卡.");
						return "/cust/cust-transfer-list";
					}
				}else{
					model.addAttribute("busiFlag", busiFlag);
					model.addAttribute("message", "证件为身份证,请用读卡进行证件扫描.");
					return "/cust/cust-transfer-list";
				}
			}
		}
		Map resultMap =new HashMap();
		httpSession.setAttribute("transferCustAccNbr", param.get("acctNbr"));
		param.put("areaId", sessionStaff.getCurrentAreaId());
		param.put("staffId", sessionStaff.getStaffId());
		try {
		resultMap = custBmo.queryCustInfo(param,
					flowNum, sessionStaff);
		if (MapUtils.isNotEmpty(resultMap)) {
			model.addAttribute("transfercust", resultMap);
		}
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, param, ErrorCode.QUERY_CUST);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.QUERY_CUST, e, param);
		}
		return "/cust/cust-transfer-list";
	}
    /**
     * 物联网过户定位查询
     * @param param
     * @param model
     * @return
     * @throws BusinessException
     */
	@RequestMapping(value = "/transferQueryCust4iot", method = { RequestMethod.POST })
    public String transferQueryCust4iot(@RequestBody Map<String, Object> param, Model model, @LogOperatorAnn String flowNum) {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map resMap = null;
		String identityCd = MapUtils.getString(param, "identityCd", "");
		String identityNum = MapUtils.getString(param, "identityNum", "");
		try {
			Map<String, Object> phoneNumParam = new HashMap<String, Object>();
			if("100".equals(identityCd)) {
				Map<String, Object> inParam = new HashMap<String, Object>();
				inParam.put("mktResourceCode", identityNum);
				resMap = custBmo.queryCustInfoByMktResCode4iot(inParam, flowNum, sessionStaff);
				String code=MapUtils.getString(resMap,"resultCode","");
				if(ResultCode.R_SUCC.equals(code)) {
					Map<String, Object> resultMap = MapUtils.getMap(resMap, "result");
					phoneNumParam.put("phoneNum", MapUtils.getString(resultMap, "phoneNum", ""));
					phoneNumParam.put("prodInstId", MapUtils.getString(resultMap, "prodInstId", ""));
				}else {
					String msg = MapUtils.getString(resMap, "resultMsg");
					return super.failedStr(model, ErrorCode.IOT_MKTRESCODE, msg, param);
				}
			}else{
				phoneNumParam.put("phoneNum",identityNum);
			}
			resMap = custBmo.queryCustInfoByPhone4iot(phoneNumParam, flowNum, sessionStaff);
			String code=MapUtils.getString(resMap,"resultCode","");

			if(ResultCode.R_SUCC.equals(code)) {
				Map<String,Object> resultMap=MapUtils.getMap(resMap, "result");
				Map<String, Object> prodInfos = MapUtils.getMap(resultMap, "prodInfos");
				if (null != prodInfos) {
					model.addAttribute("iotCustInfo", prodInfos);
				} else {
					return super.failedStr(model, ErrorCode.IOT_PRODINFO, "未查询到客户信息", param);
				}
			}else {
				String msg=MapUtils.getString(resMap, "resultMsg", "");
				return super.failedStr(model, ErrorCode.IOT_PRODINFO, msg, param);
			}
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			return super.failedStr(model,ie, param, ErrorCode.IOT_PRODINFO);
		} catch (Exception e) {
			return super.failedStr(model, ErrorCode.IOT_PRODINFO, e, param);
		}
		return "/cust/cust-transfer-info-iot";
	}
    /**
     * 过户客户鉴权
     * @param param
     * @param model
     * @return
     * @throws BusinessException 
     */
	@RequestMapping(value = "/transCustAuth", method = { RequestMethod.POST })
	public String custAuth(@RequestBody Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, HttpServletResponse response,HttpSession httpSession) throws BusinessException {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map map = new HashMap();
		Map paramMap = new HashMap();
		Map resultMap = new HashMap();
		String areaName="";
		/*{accessNumber:'11969577',areaId:21,prodPwd:'000000'}*/
		paramMap.put("accessNumber", httpSession.getAttribute("transferCustAccNbr"));
		paramMap.put("areaId", sessionStaff.getCurrentAreaId());
		paramMap.put("prodPwd", param.get("prodPwd"));
		String authFlag=(String) param.get("authFlag");
		areaName = (String) param.get("areaName");
		if(areaName==null){
			areaName=sessionStaff.getCurrentAreaAllName();	
		}
		param.put("areaName", areaName);
		try {
			
		if("0".equals(authFlag)){
		map = custBmo.custAuth(paramMap,
					flowNum, sessionStaff);
		}else{
			map.put("isValidate", "true");
		}
		map.put("custInfo", param);
		model.addAttribute("transCustAuth", map);
		}catch (BusinessException be) {
			return super.failedStr(model, be);
		} catch (InterfaceException ie) {
			
			return super.failedStr(model, ie, param, ErrorCode.CUST_AUTH);
		} catch (Exception e) {
			
			return super.failedStr(model, ErrorCode.CUST_AUTH, e, param);
		}
		return "/cust/cust-transfer-info";
	}
    /**
     * 预校验单接口
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/updateCheckByChange", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse updateCheckByChange(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	Map<String, Object> resMap = orderBmo.updateCheckByChange(paramMap, flowNum, sessionStaff);
        	if(ResultCode.R_SUCC.equals(resMap.get("resultCode"))){
        		jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        	}else{
        		jsonResponse = super.failed(resMap,ResultConstant.FAILD.getCode());
        	}
        } catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_CHECKBYCHANGE);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_CHECKBYCHANGE, e, paramMap);
		}
		return jsonResponse;
    }
    /**
     * 二次业务需产品密码鉴权配置
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/queryProdPwdConfig", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse queryProdPwdConfig(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
	    List <Map<String, Object>> rList=null;
	    List <Map<String, Object>> nextList=null;
	    String queryConfig="";
	   /* Map<String, Object> pMap = new HashMap<String, Object>();
        pMap.put("tableName", "SYSTEM");
        pMap.put("columnName", "AREA_CODE");*/
        try {
        	rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(paramMap, flowNum, sessionStaff).get("result");
        	if(rList!=null&&rList.size()>0){
        		nextList=(List<Map<String, Object>>)rList.get(0).get("REMARK_PRODPASS");
        		queryConfig=(String) nextList.get(0).get("COLUMN_VALUE");
        		jsonResponse = super.successed(queryConfig,ResultConstant.SUCCESS.getCode());
        	}else{
        		jsonResponse = super.failed(queryConfig,ResultConstant.FAILD.getCode());
        	}
        }catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
		return jsonResponse;
    }
    /**
     * 产品密码鉴权
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/prodAuth", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse prodAuth(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
	    Map<String, Object>  map=null;
	    List <Map<String, Object>> nextList=null;
	    String queryConfig="";
	   /* Map<String, Object> pMap = new HashMap<String, Object>();
        pMap.put("tableName", "SYSTEM");
        pMap.put("columnName", "AREA_CODE");*/
        try {
        	map = custBmo.custAuth(paramMap,
					flowNum, sessionStaff);
			String resultCode = MapUtils.getString(map, "resultCode");
			String isValidateStr = MapUtils.getString(map, "isValidate");
			if ("true".equals(isValidateStr)){
				jsonResponse = super.successed(isValidateStr,ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(isValidateStr,ResultConstant.FAILD.getCode());
			}
        }catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
		return jsonResponse;
    }
    /**
     * 账户查询
     * @param param
     * @param model
     * @param optFlowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/queryAccountInfo", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse queryAccountInfo(@RequestBody Map<String, Object> param, Model model,
			@LogOperatorAnn String optFlowNum, HttpServletResponse response) {

    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
	    Map<String, Object>  map=null;
	    // 拼接入参
	 		Map<String, Object> paramMap = new HashMap<String, Object>();
	 		paramMap.put("prodId", param.get("prodId"));
	 		paramMap.put("acctNbr", param.get("acctNbr"));
	 		paramMap.put("areaId", param.get("areaId"));
        try {
        	map = this.orderBmo.queryProdAcctInfo(paramMap, optFlowNum, sessionStaff);
			String resultCode = MapUtils.getString(map, "resultCode");
			if (ResultCode.R_SUCC.equals(resultCode)){
				jsonResponse = super.successed(map,ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(map,ResultConstant.FAILD.getCode());
			}
        }catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.QUERY_ACCT);
		} catch (Exception e) {
			return super.failed(ErrorCode.QUERY_ACCT, e, paramMap);
		}
		return jsonResponse;

	}
    
    /**
     * 前置校验接口
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/preCheckBeforeOrde", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse preCheckBeforeOrde(@RequestBody Map<String, Object> paramMap,
			@LogOperatorAnn String flowNum,HttpServletResponse response,HttpServletRequest request){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
		Map<String, Object>  map=null;
		//参数拼接
		paramMap.put("channelId", sessionStaff.getCurrentChannelId());
		paramMap.put("channelNbr", sessionStaff.getCurrentChannelCode());
		paramMap.put("salesCode", sessionStaff.getSalesCode());
		paramMap.put("staffCode", sessionStaff.getStaffCode());
		paramMap.put("custId", sessionStaff.getCustId());
		 HttpSession session = request.getSession();
		String areaId = (String) session.getAttribute("pointareaId");
		if(!"".equals(areaId) && areaId !=null){
			paramMap.put("areaId", areaId.substring(0, 5) + "00");
		}else{
			 areaId = sessionStaff.getAreaId();
			 paramMap.put("areaId",areaId.substring(0, 5) + "00");
		}
		String comPreFlag = propertiesUtils.getMessage("COMANDFXPRECHECK_"+areaId.substring(0, 3));
		try {
        	map = this.orderBmo.preCheckBeforeOrde(paramMap, flowNum, sessionStaff);
        	Map<String, Object>  retMap = new HashMap<String, Object>();
			String resultCode = MapUtils.getString(map, "resultCode");
			String transactionID = "";
			if(SysConstant.ON.equals(comPreFlag)){
				transactionID = MapUtils.getString(map, "transactionID");
			}
			if (ResultCode.R_SUCC.equals(resultCode)){
				Map<String, Object> datamap = (Map<String, Object>) map.get("result");
				if(datamap !=null){
					boolean flag = false;
					String type = "0";
					StringBuffer sbcheck = new StringBuffer("");
					StringBuffer sbXZ = new StringBuffer("");
					List<Map<String, Object>> checkResultList = null;
                     if (datamap.get("checkResult") != null) {
                         Object obj = datamap.get("checkResult");
                         if (obj instanceof List) {
                        	 checkResultList = (List<Map<String, Object>>) obj;
                         } else {
                        	 checkResultList = new ArrayList<Map<String, Object>>();
                        	 checkResultList.add((Map<String, Object>) obj);
                         }
                         for(Map<String, Object> checkResult : checkResultList){
     						String checkLevel = (String) checkResult.get("checkLevel");
     						String checkInfo = (String) checkResult.get("checkInfo");
     						if("10".equals(checkLevel)){
     							sbcheck.append(checkInfo).append(",");
     							type = "10";
     						}else if("20".equals(checkLevel)){
     							sbXZ.append(checkInfo).append(",");
     							flag = true;
     						}
     					}
                    }
					if(flag){
						retMap.put("transactionID", transactionID);
						retMap.put("checkLevel", "20");
						retMap.put("checkInfo", sbXZ);
					}else if(type.equals("10")){
						retMap.put("transactionID", transactionID);
						retMap.put("checkLevel", "10");
						retMap.put("checkInfo", sbcheck);
					}else{
						retMap.put("checkLevel", "0");
						retMap.put("transactionID", transactionID);
					}
				}else{
					retMap.put("transactionID", transactionID);
					retMap.put("checkLevel", "0");
				}
				jsonResponse = super.successed(retMap,ResultConstant.SUCCESS.getCode());
			}else{
				jsonResponse = super.failed(map,ResultConstant.FAILD.getCode());
			}
        }catch (BusinessException be) {
        	return super.failed(be);
        } catch (InterfaceException ie) {
        	return super.failed(ie, paramMap, ErrorCode.PRE_CHECK_ORDER);
		} catch (Exception e) {
			return super.failed(ErrorCode.PRE_CHECK_ORDER, e, paramMap);
		}
		return jsonResponse;
    }
    
	//list去重
	public static void removeDuplicate(List list) {
		   for ( int i = 0 ; i < list.size() - 1 ; i ++ ) {
		     for ( int j = list.size() - 1 ; j > i; j -- ) {
		       if (list.get(j).equals(list.get(i))) {
		         list.remove(j);
		       }
		      }
		    }
		    //System.out.println(list);
		}
	
	 @RequestMapping(value = "/queryIfLteNewInstall", method = RequestMethod.GET)
		@ResponseBody
		public JsonResponse queryIfLteNewInstall(@RequestParam Map<String, Object> param, Model model,
				@LogOperatorAnn String optFlowNum, HttpServletResponse response) {
	    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
							SysConstant.SESSION_KEY_LOGIN_STAFF);
			JsonResponse jsonResponse = null;
		    Map<String, Object> map = null;
		    // 拼接入参
	 		Map<String, Object> paramMap = new HashMap<String, Object>();
	 		paramMap.put("prodInstId", param.get("prodInstId"));
	 		paramMap.put("areaId", param.get("areaId"));
	        try {
	        	map = this.orderBmo.queryIfLteNewInstall(paramMap, optFlowNum, sessionStaff);
				String resultCode = MapUtils.getString(map, "resultCode");
				if (ResultCode.R_SUCC.equals(resultCode)){
					jsonResponse = super.successed(map, ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(map, ResultConstant.FAILD.getCode());
				}
	        }catch (BusinessException be) {
	        	return super.failed(be);
	        } catch (InterfaceException ie) {
	        	return super.failed(ie, paramMap, ErrorCode.QUERY_LTE_NEW_INSTALL);
			} catch (Exception e) {
				return super.failed(ErrorCode.QUERY_LTE_NEW_INSTALL, e, paramMap);
			}
			return jsonResponse;
		}
	 /**
	  * 订单id日志生产接口
	  */
	 @RequestMapping(value = "/portalOrderLog", method = RequestMethod.POST)
	 @ResponseBody
	 public  JsonResponse portalOrderLog(@RequestBody Map<String, Object> paramMap, Model model,
				@LogOperatorAnn String optFlowNum, HttpServletResponse response,HttpServletRequest request) throws BusinessException, InterfaceException{
		 SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
					SysConstant.SESSION_KEY_LOGIN_STAFF);
		 JsonResponse jsonResponse = null;
		Map<String, Object> resMap = new HashMap<String, Object>();
		 try{
			 String portalId=CommonMethods.getUUID();
			 String sessionId=request.getSession().getId();
			 paramMap.put("portalId", portalId);
			 paramMap.put("sessionId",sessionId);
			 System.out.println("-订单日志开始生成---:"+paramMap.toString());
			 resMap    = orderBmo.orderLog(paramMap, null, sessionStaff);
			 String resultCode = MapUtils.getString(resMap, "resultCode");
			 if (ResultCode.R_SUCC.equals(resultCode)){
				    //将portalId传与前台
				    resMap.put("portalId", portalId);
					jsonResponse = super.successed(resMap, ResultConstant.SUCCESS.getCode());
				}else{
					jsonResponse = super.failed(resMap, ResultConstant.FAILD.getCode());
				}
		 }catch (Exception e) {
				return super.failed(ErrorCode.POTAL_ORDER_LOG, e, paramMap);
			}
		 return jsonResponse;
	 }
}
