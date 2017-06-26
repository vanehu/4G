package com.al.lte.portal.app.controller.crm;
 
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.ArrayUtils;
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
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PageUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.AuthorityException;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.AcctBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;
  

/**
 * 帐户管理控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.pad.portal.app.controller.crm.AcctController")
@RequestMapping("/app/acct/*")
public class AcctController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.AcctBmo")
	private AcctBmo acctBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	private String acctDetailUrl="/app/acct/acct-detail";
	
	private String acctListUrl="/app/acct/acct-list";
	
	private String ACCT_ITEMS="acctItems";
	
	private String ACCT_TYPE="acctType";
	
	private String BANK_LIST="bankList";
	
	private String FAIL_INFO="failInfo";
	
	private String PAYMENT_TYPE ="paymentType";
	
	private String RESULT="result";
	
	private String RESULT_CODE="resultCode";
	
	private String STATUS="status";
	
	@RequestMapping(value = "/queryBankInfo", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String main(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws AuthorityException {
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"acct/bankinfomain"));
		return "/app/acct/bankinfo-main";
    }
	@SuppressWarnings("unchecked")
		@RequestMapping(value = "/bankList", method = RequestMethod.GET)
	    public String list(@RequestParam("strParam") String param,Model model,HttpServletResponse response){
	        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
	                SysConstant.SESSION_KEY_LOGIN_STAFF);
	        Map<String, Object> paramMap =  JsonUtil.toObject(param, Map.class);
	        //Map getParam = new HashMap();
	        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
	        Integer nowPage = 1 ;
	        Integer pageSize = 10 ;
	        Integer totalSize = 0 ;
			try {
				if (sessionStaff != null) {
						Map<String, Object> map = acctBmo.queryBankInfo(paramMap,
								null, sessionStaff);
						if (map != null && map.get(BANK_LIST) != null) {
							list = (List<Map<String, Object>>) map.get(BANK_LIST);
							totalSize = 1;
						}
					PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
							nowPage, pageSize, totalSize < 1 ? 1 : totalSize, list);
					model.addAttribute("pageModel", pm);
				}
			} catch (BusinessException be) {
				return super.failedStr(model, be);
			} catch (InterfaceException ie) {
	
				return super.failedStr(model, ie, paramMap, ErrorCode.QUERY_BANKINFO);
			} catch (Exception e) {
	
				return super.failedStr(model, ErrorCode.QUERY_BANKINFO, e, paramMap);
			}
			return "/app/acct/bank-list";
	        }
    @RequestMapping(value = "/bankSave", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse bankSave(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
    	 SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                 SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = acctBmo.saveBank(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCC.equals(rMap.get(RESULT_CODE).toString())) {
				jsonResponse = super.successed("银行详情保存成功",
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException be) {
			
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, param, ErrorCode.SAVE_BANK);
		} catch (Exception e) {
			log.error("银行详情保存/app/acct/bankSave方法异常", e);
			return super.failed(ErrorCode.SAVE_BANK, e, param);
		}
		return jsonResponse;
    }
    @RequestMapping(value = "/updateBank", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse updateBank(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum,HttpServletResponse response){
    	 SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                 SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try {
			rMap = acctBmo.updateBank(param, null, sessionStaff);
			if (rMap != null&& ResultCode.R_SUCC.equals(rMap.get(RESULT_CODE).toString())) {
				jsonResponse = super.successed("银行详情保存成功",
						ResultConstant.SUCCESS.getCode());
			} else {
				jsonResponse = super.failed(rMap,
						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
			}
		} catch (BusinessException be) {
			
			return super.failed(be);
		} catch (InterfaceException ie) {

			return super.failed(ie, param, ErrorCode.UPDATE_BANK);
		} catch (Exception e) {
			log.error("银行详情保存/app/acct/bankSave方法异常", e);
			return super.failed(ErrorCode.UPDATE_BANK, e, param);
		}
		return jsonResponse;
    }
    /**
     * 转至账户详情查询
     * @param session
     * @param model
     * @return
     */
    @RequestMapping(value = "/preQueryAccount", method = RequestMethod.GET)
    public String preQueryAccount(HttpSession session, Model model){
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.
		getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    			
		model.addAttribute("defaultAreaName", sessionStaff.getCurrentAreaAllName());
		model.addAttribute("defaultAreaId", sessionStaff.getCurrentAreaId());
		
		model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"acct/preQueryAccount"));		
		return "/app/acct/acct-info-query";
    }
    
    /**
     * 帐户资料查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     * @throws BusinessException
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryAccount", method = RequestMethod.GET)
	public String queryAccount(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, 
			HttpServletResponse response)throws BusinessException{
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	Map<String, Object> empty = new HashMap<>();
		String serviceName = "后台服务service/intf.acctService/queryExistAcctByCond的回参缺少";
		
		Map<String, Object> resultMap = new HashMap<>();
    	
    	try{
    		resultMap = acctBmo.queryAccount(param, flowNum, sessionStaff);    		    	    			
    		if(("0").equals(MapUtils.getString(resultMap, RESULT_CODE, ""))){
    			if(!MapUtils.getMap(resultMap, RESULT, empty).isEmpty()){
    				Map<String, Object> result = (Map<String, Object>)resultMap.get(RESULT);
    				if(result.get(ACCT_ITEMS)!=null){
    					ArrayList<Map<String, Object>> acctItems = (ArrayList<Map<String, Object>>)result.get(ACCT_ITEMS);
            			model.addAttribute(ACCT_ITEMS, acctItems);
            			model.addAttribute("flag", 0);
    				}
    				else{
    					model.addAttribute("flag", 1);
    					model.addAttribute(FAIL_INFO, serviceName + "【acctItems】节点或该节点为空，请与省内确认！");
    					return acctListUrl;
    				}
    			}
    			else{
    				model.addAttribute("flag", 1);
    				model.addAttribute(FAIL_INFO, serviceName + "【result】节点或该节点为空，请与省内确认！");
    				return acctListUrl;
    			}
    		}
    		else{
    			model.addAttribute("flag", 1);
    			model.addAttribute(FAIL_INFO, MapUtils.getString(resultMap, "resultMsg"));
    			return acctListUrl;
    		}
    	}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.QUERY_ACCT);
		}catch(Exception e){
			Map<String, Object> interfaceIO = new HashMap<String, Object>();
			interfaceIO.put("门户入参", param);
			interfaceIO.put("后台回参", resultMap);
			return super.failedStr(model, ErrorCode.QUERY_ACCT, e, interfaceIO);
		}
    	return acctListUrl;
    }
    
    /**
     * 帐户详情查询
     * @param param
     * @param model
     * @param flowNum
     * @param response
     * @return
     * @throws BusinessException
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/queryAcctDetail", method = RequestMethod.GET)
	public String queryAcctDetail(@RequestParam Map<String, Object> param, Model model,@LogOperatorAnn String flowNum, 
			HttpServletResponse response)throws BusinessException{
    	
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	Map<String, Object> empty = new HashMap<>();
		String serviceName = "后台服务service/intf.acctService/queryAcctDetailInfo的回参缺少";
		
		Map<String, Object> resultMap = new HashMap<>();
    	
    	try{
    		resultMap = acctBmo.queryAcctDetail(param, flowNum, sessionStaff);    		    	    			
    		if(("0").equals(MapUtils.getString(resultMap, RESULT_CODE, ""))){
    			if(!MapUtils.getMap(resultMap, RESULT, empty).isEmpty()){
    				Map<String, Object> result = (Map<String, Object>)resultMap.get(RESULT);
    				if(!MapUtils.getMap(result, "acctInfo", empty).isEmpty()){
    					Map<String, Object> acctInfo = (Map<String, Object>)result.get("acctInfo");    					    						
            			model.addAttribute("name", acctInfo.get("acctName"));//帐户名称
            			model.addAttribute("acctCd", acctInfo.get("acctCd"));//帐户合同号
            			model.addAttribute("acctId", acctInfo.get("acctId"));//帐户ID
            			model.addAttribute("owner", acctInfo.get("partyName"));//所属客户
            			if(!MapUtils.getMap(acctInfo, "area", empty).isEmpty()){
            				Map<String, Object> area = (Map<String, Object>)acctInfo.get("area");    						    							
                			model.addAttribute("area", area.get("name"));//帐户地区
            			}
            			if(!MapUtils.getMap(acctInfo, ACCT_TYPE, empty).isEmpty()){
            				Map<String, Object> acctType = (Map<String, Object>)acctInfo.get(ACCT_TYPE);
                			model.addAttribute(ACCT_TYPE, acctType.get("name"));//帐户类型
            			}
            			String status = MapUtils.getString(acctInfo, "acctStatusCd", "");//帐户状态编码
            			if("1000".equals(status)){
            				model.addAttribute(STATUS, "有效");
            			}
            			else if("1100".equals(status)){
            				model.addAttribute(STATUS, "无效");
            			}
            			else if("1200".equals(status)){
            				model.addAttribute(STATUS, "未生效");
            			}
            			else if("1300".equals(status)){
            				model.addAttribute(STATUS, "已归档");
            			}else{
            				model.addAttribute(STATUS, "");
            			}
            			/* 
            			  *客户信息暂不展示
            			Map<String, Object> party = (Map<String, Object>)acctInfo.get("party");    			    							
           			    model.addAttribute("ownerType", party.get("partyTypeName"));//客户类型    						    						    							
            			model.addAttribute("contact", party.get("linkPhone"));//联系电话    						    						    							
            			model.addAttribute("address", party.get("addressStr"));//所在地    						    						    							
            			model.addAttribute("mailAddress", party.get("mailAddressStr"));//通信地址 
            			*/
            			String startDt = MapUtils.getString(acctInfo, "startDt", "");
            			if(startDt.length()>=10){
        					model.addAttribute("startDate", startDt.substring(0, 10));//生效日期			
        				}
            			//帐户支付信息
            			if(acctInfo.get("acct2PaymentAcct")!=null){
            				ArrayList<Map<String, Object>> acct2PaymentAcct = (ArrayList<Map<String, Object>>)acctInfo.get("acct2PaymentAcct");
            				if(acct2PaymentAcct.size()>0){    					
                				Map<String, Object> acctPayment = acct2PaymentAcct.get(0);    					
                				if(!MapUtils.getMap(acctPayment, "paymentAccount", empty).isEmpty()){    						
                					Map<String, Object> paymentAccount = (Map<String, Object>)acctPayment.get("paymentAccount");
                					String paymentAccountTypeCd = MapUtils.getString(paymentAccount, "paymentAccountTypeCd", "");
                					if("100000".equals(paymentAccountTypeCd)){
                						model.addAttribute(PAYMENT_TYPE, "1");//现金支付    						
                					}    						
                					else if("110000".equals(paymentAccountTypeCd)){
                						model.addAttribute(PAYMENT_TYPE, "2");//银行托收    							
                						model.addAttribute("bankName", paymentAccount.get("bankName"));//银行名称    							
                						model.addAttribute("bankAcct", paymentAccount.get("bankAcctCd"));//银行帐号    							
                						model.addAttribute("paymentMan", paymentAccount.get("paymentMan"));//支付人      													
                					}
                					else{
                						model.addAttribute(PAYMENT_TYPE, "x");//支付类型编码异常
                					}
                				}
                				else{
                					model.addAttribute("flag", 1);
                					model.addAttribute(FAIL_INFO, serviceName + "【paymentAccount】节点或该节点为空，请与省内确认！");
                					return acctDetailUrl;
                				}
                			}
            				else{
            					model.addAttribute("flag", 1);
            					model.addAttribute(FAIL_INFO, serviceName + "【acct2PaymentAcct】节点或该节点为空，请与省内确认！");
            					return acctDetailUrl;
            				}
            			}
            			else{
            				model.addAttribute("flag", 1);
            				model.addAttribute(FAIL_INFO, serviceName + "【acct2PaymentAcct】节点或该节点为空，请与省内确认！");
            				return acctDetailUrl;            				
            			}           			
            			//账单投递信息
            			if(acctInfo.get("accountMailing")!=null){
            				ArrayList<Map<String, Object>> accountMailing = (ArrayList<Map<String, Object>>)acctInfo.get("accountMailing");
            				if(accountMailing.size()>0){
                				Map<String, Object> billPost = accountMailing.get(0);
                				String postType = MapUtils.getString(billPost, "mailingType", "");
                				String []typeStr={"11","12","13","14","15"};
                				if(ArrayUtils.contains(typeStr,postType)){
                					model.addAttribute("postType", postType);//投递方式
                    				model.addAttribute("receiveInfo", billPost.get("param1"));//收件信息
                    				model.addAttribute("postCycle", MapUtils.getString(billPost, "param3", ""));//投递周期
                    				model.addAttribute("postContent", MapUtils.getString(billPost, "param7", ""));//投递内容
                    				//当投递方式是邮寄或快递时将分三个字段展示收件信息
                    				if("11".equals(postType) || "15".equals(postType)){
                    					String receiveInfo = MapUtils.getString(billPost, "param1", "无");
                    					receiveInfo = receiveInfo + ",无,无";
                    					model.addAttribute("mailAddress", receiveInfo.split(",")[0]);//邮寄（快递）地址
                    					model.addAttribute("zipCode", receiveInfo.split(",")[1]);//邮编
                    					model.addAttribute("consignee", receiveInfo.split(",")[2]);//收件人
                    				}
                				}
                			}
            			}
            			
            			model.addAttribute("flag", 0);
    				}
    				else{
    					model.addAttribute("flag", 1);
    					model.addAttribute(FAIL_INFO, serviceName + "【acctInfo】节点或该节点为空，请与省内确认");
    					return acctDetailUrl;
    				}
    			}
    			else{
    				model.addAttribute("flag", 1);
    				model.addAttribute(FAIL_INFO, serviceName + "【result】节点或该节点为空，请与省内确认！");
    				return acctDetailUrl; 
    			}
    		}
    		else{
    			model.addAttribute("flag", 1);
    			model.addAttribute(FAIL_INFO, MapUtils.getString(resultMap, "resultMsg"));
    			return acctDetailUrl;
    		}
    	}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch(InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.QUERY_ACCT_DETAIL);
		}catch(Exception e){
			Map<String, Object> interfaceIO = new HashMap<String, Object>();
			interfaceIO.put("门户入参", param);
			interfaceIO.put("后台回参", resultMap);
			return super.failedStr(model, ErrorCode.QUERY_ACCT_DETAIL, e, interfaceIO);
		}
    	return acctDetailUrl;
    }
    
    /**
     * 银行查询
     * @param session
     * @param model
     * @param param
     * @return
     */
    @SuppressWarnings("unchecked")
	@RequestMapping(value = "/getBankList", method = RequestMethod.POST)
    public String getStaffList(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, Model model, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff)ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
 
    	try{					
    		Map<String, Object> resultMap = acctBmo.queryBankInfo(param, flowNum, sessionStaff);
    		Map<String, Object> page = (Map<String, Object>)resultMap.get("page");
    		int pageNo = (Integer)param.get("curPage");
    		int pageSize = (Integer)param.get("pageSize");
    		int totalRecords = (Integer)page.get("totalCount");
			ArrayList<Map<String, Object>> bankList = (ArrayList<Map<String, Object>>)resultMap.get(BANK_LIST);							
			PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(pageNo, pageSize, totalRecords<1 ? 1:totalRecords, bankList);
				
			model.addAttribute("pageModel", pm);			
    	}catch(BusinessException be){
			return super.failedStr(model, be);
		}catch (InterfaceException ie){
			return super.failedStr(model, ie, param, ErrorCode.QUERY_BANKINFO);
		}catch (Exception e){
			return super.failedStr(model, ErrorCode.QUERY_BANKINFO, e, param);
		}
        return "/app/acct/acct-dialog-bank";
    }
    
    /**
     * 查询工号权限：是否可以设置银行托收信息
     * @param param
     * @param flowNum
     * @param response
     * @return
     */
    @RequestMapping(value = "/ifCanAdjustBankPayment", method = RequestMethod.POST)
    public @ResponseBody JsonResponse ifCanAdjustBankPayment(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, HttpServletResponse response){
    	
    	SessionStaff sessionStaff = (SessionStaff)ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
    	String iseditOperation= (String)ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_BANKPAYMENT+"_"+sessionStaff.getStaffId());
    	try{
 			if(iseditOperation==null){
 				iseditOperation=staffBmo.checkOperatSpec(SysConstant.ADJUSTBANKPAYMENT_CODE, sessionStaff);
 				ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_BANKPAYMENT+"_"+sessionStaff.getStaffId(), iseditOperation);
 			}
    	} catch (BusinessException e) {
    		log.error("checkOperatSpec异常", e);
    		iseditOperation="1";
    	} catch (InterfaceException ie) {
    		log.error("checkOperatSpec", ie);
    		iseditOperation="1";
    	} catch (Exception e) {
    		log.error("权限查询方法异常", e);
    		iseditOperation="1";
    	}
    	return successed(iseditOperation);
    }
 	
}
