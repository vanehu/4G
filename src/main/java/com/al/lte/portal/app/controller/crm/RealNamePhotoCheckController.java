package com.al.lte.portal.app.controller.crm;
import java.io.IOException;
import java.util.Date;
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
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.common.utils.StringUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.LevelLog;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CartBmo;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.OfferBmo;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

 

/**
 * 实名制经办人拍照照片审核
 * 
 * @author yanghm
 * @version V1.0 2017-4-24
 * @createDate 2017-4-24 下午16:03:44 
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.app.controller.crm.RealNamePhotoCheckController")
@RequestMapping("/app/realName/photoCheck/*")
public class RealNamePhotoCheckController extends BaseController{
	/** 人证相符审核短信验证号码 */
	public static final String SESSION_CONFIRMAGREE_SMS_NUMBER = "_confirmAgree_sms_number";
	/** 人证相符审核短信验证地区 */
	public static final String SESSION_CONFIRMAGREE_SMS_AREAID = "_confirmAgree_sms_areaId";
	/** 人证相符审核员工工号 */
	public static final String SESSION_CONFIRMAGREE_SMS_STAFFID = "_confirmAgree_sms_staffId";
	/** 人证相符审核员工姓名*/
	public static final String SESSION_CONFIRMAGREE_SMS_STAFFNAME = "_confirmAgree_sms_staffName";
	/** 人证相符审核类型*/
	public static final String SESSION_CONFIRMAGREE_SMS_CHECKTYPE = "_confirmAgree_sms_checkType";
	/** 人证相符审核实名制传虚拟订单号 */
	public static final String SESSION_CONFIRMAGREE_SMS_OLID = "_confirmAgree_sms_olId";
	
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
	private CustBmo custBmo;

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
	@Qualifier("com.al.lte.portal.bmo.crm.MktResBmo")
	private MktResBmo MktResBmo;
	

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OfferBmo")
	private OfferBmo offerBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CartBmo")
	private CartBmo cartBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	private String NUMBER="number";
	
	private String RANDOM_CODE="randomCode";
	
	private String RESULT_CODE="resultCode";
	
	private String RESULT_MSG="resultMsg";
	
	private String SYS_SG_MSG="系管权限查询接口sys-checkOperatSpec异常：";
	
	
	/**
	 * 手机客户端-实名审核入口
	 * @param params
	 * @param request
	 * @param model
	 * @param session
	 * @return
	 */
	@RequestMapping(value = "/prepare", method = RequestMethod.POST)
    @AuthorityValid(isCheck = false)
    public String repairPrepare(Model model,HttpSession session,@LogOperatorAnn String flowNum) throws BusinessException {		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> defaultAreaInfo = CommonMethods.getDefaultAreaInfo_MinimumC3(sessionStaff);
		model.addAttribute("p_areaId", defaultAreaInfo.get("defaultAreaId"));
		model.addAttribute("p_channelId", sessionStaff.getCurrentChannelId());
		return "/app/order_new/photo-check";
    }
	
	  /**
     * 查询某权限下的员工列表<br/>
     * @param param 若入参中不指定具体的权限编码，则默认根据SysConstant.RXSH权限进行查询
     * @return 员工列表List
     */
    @RequestMapping(value = "/qryOperateSpecStaffList", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse qryOperateSpecStaffList(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> result = null;
        JsonResponse jsonResponse = null;
        String operateSpec = null;
        if(sessionStaff == null){
        	log.debug("sessionStaff为空", sessionStaff);
			Map<String, Object> failData = new HashMap<String, Object>();
			failData.put("msg", "sessionStaff为空");
			jsonResponse = super.failed(failData, ResultConstant.DATA_NOT_VALID_FAILTURE.getCode());
			return jsonResponse;
        }       
        if(param == null || "".equals(MapUtils.getString(param, "operateSpec", ""))){
        	operateSpec = SysConstant.RXSH;
        } else{
        	operateSpec = MapUtils.getString(param, "operateSpec");
        }
        
        String sessionKey = sessionStaff.getStaffId() + operateSpec;
        
        List<Map<String, Object>> staffList = (List<Map<String, Object>>) ServletUtils.getSessionAttribute(super.getRequest(), sessionKey);
        if(staffList != null && staffList.size()>0){
        	jsonResponse = super.successed(staffList, ResultConstant.SUCCESS.getCode());
        } else{
        	try {
            	result = staffBmo.qryOperateSpecStaffList(operateSpec, sessionStaff);
                if (ResultCode.R_SUCC.equals(MapUtils.getString(result, SysConstant.RESULT_CODE, "1"))) {
                	jsonResponse = super.successed(result.get(SysConstant.RESULT), ResultConstant.SUCCESS.getCode());
                	ServletUtils.setSessionAttribute(super.getRequest(), sessionKey, result.get(SysConstant.RESULT));
                } else {
                    jsonResponse = super.failed(MapUtils.getString(result, SysConstant.RESULT_MSG, ""), ResultConstant.FAILD.getCode());
                }
            } catch (BusinessException be) {
            	jsonResponse = super.failed(be);	
            } catch (InterfaceException ie) {
            	jsonResponse = super.failed(ie, param, ErrorCode.QUERY_STAFF_INFO);
    		} catch (IOException ioe) {
    			jsonResponse = super.failed(ErrorCode.QUERY_STAFF_INFO, ioe, param);
    		} catch (Exception e) {
    			jsonResponse = super.failed(ErrorCode.QUERY_STAFF_INFO, e, param);
    		}
        }
        
        return jsonResponse;
    }
    
    /**
     * 实名审核记录接口<br/>
     * @param param 
     * @return 
     */
    @RequestMapping(value = "/savePhotographReviewRecord", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse savePhotographReviewRecord(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> result = null;
        JsonResponse jsonResponse = null;
        
    	try {
        	result = orderBmo.savePhotographReviewRecord(param, sessionStaff);
            if (ResultCode.R_SUCC.equals(MapUtils.getString(result, SysConstant.RESULT_CODE, "1"))) {
            	jsonResponse = super.successed(MapUtils.getString(result, SysConstant.RESULT_MSG, ""), ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(MapUtils.getString(result, SysConstant.RESULT_MSG, ""), ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException be) {
        	jsonResponse = super.failed(be);
        } catch (InterfaceException ie) {
        	jsonResponse = super.failed(ie, param, ErrorCode.SAVE_PHOTOGRAPH_REVIEW_RECORD);
		} catch (IOException ioe) {
			jsonResponse = super.failed(ErrorCode.SAVE_PHOTOGRAPH_REVIEW_RECORD, ioe, param);
		} catch (Exception e) {
			jsonResponse = super.failed(ErrorCode.SAVE_PHOTOGRAPH_REVIEW_RECORD, e, param);
		}
        
        return jsonResponse;
    }
    
    /**
     * 实名制客户身份证件和拍照照片下载
     */
    @RequestMapping(value = "/downloadCustCertificate", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse downloadCustCertificate(@RequestBody Map<String, Object> param, @LogOperatorAnn String flowNum, HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> result = null;
        JsonResponse jsonResponse = null;
        try {
        	result = orderBmo.downloadCustCertificate(param, sessionStaff);
            if (result != null && ResultCode.R_SUCCESS.equals(result.get("code").toString())) {
                jsonResponse = super.successed(result, ResultConstant.SUCCESS.getCode());
            } else {
                jsonResponse = super.failed(result.get("msg").toString(), ResultConstant.FAILD.getCode());
            }
        } catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.DOWNLOAD_CUST_CERTIFICATE);
        } catch (Exception e) {
            return super.failed(ErrorCode.DOWNLOAD_CUST_CERTIFICATE, e, param);
        }
        return jsonResponse;
    }
    

    //经办人拍照人证相符短信校验码验证
    @RequestMapping(value = "/smsSend" ,method = RequestMethod.GET)
	@LogOperatorAnn(desc = "经办人拍照人证相符发送短信校验码", code = "RXSH", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse smsSend(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		try {
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
			String number = (String) paramMap.get(NUMBER);
			String areaId = (String) paramMap.get("areaId");
			String staffId = sessionStaff.getStaffId();
			String staffName = sessionStaff.getStaffName();
			if(paramMap.get("virOlId")!=null){
				String virOlId = (String) paramMap.get("virOlId");
				request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_OLID, virOlId);
			}
			
			String checkType = (String) paramMap.get("checkType");
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER, number);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_AREAID, areaId);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_STAFFID, staffId);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_STAFFNAME, staffName);
			request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_CHECKTYPE, checkType);
			//短信发送时间间隔,10秒内重复发送，会被拦截！
			Long sessionTimeL = (Long) request.getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME);
			if (sessionTimeL != null) {
				long sessionTime = sessionTimeL;
				long nowTime = (new Date()).getTime();
				long inteval = 10 * 1000;//间隔10秒
				if (nowTime - sessionTime > inteval ) {		
					Map<String, Object> msgMap = sendMsg(request, flowNum); 
					if (ResultCode.R_FAILURE.equals(msgMap.get(RESULT_CODE))||msgMap.size()==0||msgMap==null) {
						//如果发送短信异常
						String resultMsg="发送短信异常";
						if(msgMap.get(RESULT_MSG)!=null){
							resultMsg=(String) msgMap.get(RESULT_MSG);
						}						
						return super.failed(resultMsg, 3);
					}
				}else{
					return super.successed("验证码发送中，请稍后再操作进行验证！", 1003);
				}
			}else{
				Map<String, Object> msgMap = sendMsg(request, flowNum); 
				if (ResultCode.R_FAILURE.equals(msgMap.get(RESULT_CODE))|| msgMap.size()==0 || msgMap==null) {
					//如果发送短信异常
					String resultMsg="发送短信异常";
					if(msgMap.get(RESULT_MSG)!=null){
						resultMsg=(String) msgMap.get(RESULT_MSG);
					}	
					return super.failed(resultMsg, 3);
				}
			}
			
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, new HashMap<String, Object>(), ErrorCode.CONFIRMAGREE_MSG_SEND);
		} catch (Exception e) {			
			log.error("app/smsSend方法异常", e);
			return super.failed(ErrorCode.CONFIRMAGREE_MSG_SEND, e, new HashMap<String, Object>());
		}
		Map<String, Object> successedData = new HashMap<String, Object>();
		successedData.put("data", "短信验证码发送成功!");
		successedData.put(RANDOM_CODE, ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE));
		return super.successed(successedData, ResultConstant.SUCCESS.getCode());
	}
    
  
	
	@RequestMapping(value = "/smsResend", method = RequestMethod.GET)
	@LogOperatorAnn(desc = "经办人拍照人证相符审核短信校验码重新发送", code = "RXSH", level = LevelLog.DB)
	@ResponseBody
	public JsonResponse smsResend(@RequestParam Map<String, Object> paramMap,HttpServletRequest request, @LogOperatorAnn String flowNum) {
		try {
			Long sessionTimeL = (Long) request.
					getSession().getAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME);
			if (sessionTimeL == null) {
				request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME, (new Date()).getTime());
				sessionTimeL = 0L;
			}
			long sessionTime = sessionTimeL;
			long nowTime = (new Date()).getTime();
			long inteval = 28 * 1000;//比30秒提前2秒
			int smsErrorCount = MapUtils.getIntValue(paramMap, "smsErrorCount", 0);
			if (nowTime - sessionTime > inteval || smsErrorCount >= 3) {
				sendMsg(request, flowNum);
			} else {
				log.debug("time inteval:{}", nowTime - sessionTime);
				return super.failed("短信验证码发送时间有误!请求太过频烦,请稍后再重发！",
						ResultConstant.ACCESS_LIMIT_FAILTURE.getCode());
			}
		} catch (BusinessException be) {
			this.log.error("错误信息:{}", be);
			return super.failed(be);
		} catch (Exception e) {			
			log.error("app/SmsResend方法异常", e);
			return super.failed(ErrorCode.CONFIRMAGREE_MSG_SEND, e, new HashMap<String, Object>());
		}
		Map<String, Object> successedData = new HashMap<String, Object>();
		successedData.put("data", "短信验证码发送成功!");
		//successedData.put(RANDOM_CODE, ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_SMS));
		successedData.put(RANDOM_CODE, ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE));
		return super.successed(successedData, ResultConstant.SUCCESS.getCode());
	}

	  // 经办人拍照人证相符审核短信发送短信实现方法
		public Map<String, Object> sendMsg(HttpServletRequest request, String flowNum)
				throws Exception {
			String number = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER);
			String areaId = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_AREAID);
			String staffId = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_STAFFID);
			String staffName = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_STAFFNAME);
			String checkType = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_CHECKTYPE);
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
			Map<String, Object> retnMap = new HashMap<String, Object>();
            if(request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER) ==null){
				retnMap.put(RESULT_CODE,ResultCode.R_FAILURE );
				retnMap.put(RESULT_MSG,"短信验证号码获取失败，系统异常！请刷新重试!");
				return retnMap;
			}else if(request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_AREAID) ==null){
				retnMap.put(RESULT_CODE,ResultCode.R_FAILURE );
				retnMap.put(RESULT_MSG,"短信验证号码所属地区获取失败，系统异常！请刷新重试!");
				return retnMap;
			}
			if(StringUtils.isBlank(number)){
				retnMap.put(RESULT_CODE,ResultCode.R_FAILURE );
				retnMap.put(RESULT_MSG,"短信验证号码为空，系统异常！请刷新重试!");
				return retnMap;
			}
			if (sessionStaff != null) {
				String smsPwd = null;
				String randomCode =null;
				//发送4位验证码
				smsPwd = UIDGenerator.generateDigitNonce(4);
				randomCode = UIDGenerator.generateDigitNonce(2);
				for(;randomCode == ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE);)
				{
					randomCode = UIDGenerator.generateDigitNonce(2);
				}
				this.log.debug("业务受理短信验证码：{}", smsPwd);
				Map<String, Object> msgMap = new HashMap<String, Object>();
				msgMap.put("phoneNumber", number);
				msgMap.put("key", smsPwd);
				msgMap.put("MsgNumber", "5487");
				msgMap.put("sendflag", "1");
				
				if(checkType.equals(SysConstant.CHECKTYPE_LOCAL)){//本地审核
					msgMap.put(RANDOM_CODE, randomCode);
					msgMap.put("message", propertiesUtils.getMessage(
							"PHOTOGRAPH_REVIEW_SMS_CONTENT_LOCAL", new Object[] {staffName,staffId,smsPwd}));
				}else{//远程审核
					String virOlId = (String)request.getSession().getAttribute(SESSION_CONFIRMAGREE_SMS_OLID);
					msgMap.put(RANDOM_CODE, randomCode);
					msgMap.put("message", propertiesUtils.getMessage(
							"PHOTOGRAPH_REVIEW_SMS_CONTENT_DIFF", new Object[] {staffName,staffId,virOlId}));
				}
				if(!"00".equals(areaId.substring(5))){
					areaId = areaId.substring(0, 5) + "00";
				}
				msgMap.put("areaId", areaId);
				msgMap.put(InterfaceClient.DATABUS_DBKEYWORD,(String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY));
				retnMap = staffBmo.sendMsgInfo(msgMap, flowNum, sessionStaff);
				request.getSession().removeAttribute(SysConstant.SESSION_KEY_CONFIRMAGREE_SMS);
				request.getSession().setAttribute(SysConstant.SESSION_KEY_CONFIRMAGREE_SMS, smsPwd);
				request.getSession().setAttribute(SESSION_CONFIRMAGREE_SMS_NUMBER, number);
				request.getSession().setAttribute(SysConstant.SESSION_KEY_CONFIRMAGREE_RANDONCODE, randomCode);
				//短信发送时间间隔
				request.getSession().removeAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME);
				request.getSession().setAttribute(SysConstant.SESSION_KEY_TEMP_CONFIRMAGREE_SMS_TIME, (new Date()).getTime());
			} else {
				this.log.error("错误信息:登录会话失效，请重新登录!");
			}
			return retnMap;
		}

	@RequestMapping(value = "/smsValid", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse smsValid(@RequestBody Map<String, Object> param,
			HttpServletRequest request ,HttpServletResponse response) throws Exception {
		String smsPwd="";
		String number="";
		if(param.get("smspwd")!=null){
			smsPwd=param.get("smspwd").toString();	
		}
		if(param.get(NUMBER)!=null){
			number=param.get(NUMBER).toString();	
		}
		this.log.debug("smsValid={}", smsPwd);
		// 验证码内容
		String smsPwdSession = (String) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_CONFIRMAGREE_SMS);
		// 对应的手机号
		String numberSession = (String) ServletUtils.getSessionAttribute(
				request, SESSION_CONFIRMAGREE_SMS_NUMBER);
		//如果不需要发送短信，验证码就为空，不提示短信过期失效
		if(StringUtil.isEmpty(smsPwdSession)){
			return super.failed("短信过期失效，请重新发送!", ResultConstant.FAILD.getCode());
		}
		if (smsPwdSession.equals(smsPwd)&&numberSession.equals(number)) {
			Map<String,Object> resData=new HashMap<String,Object>();
			resData.put("msg", "短信验证成功.");
			return super.successed(resData);
		}else {
			return super.failed("短信验证码错误!", ResultConstant.FAILD.getCode());
		}
	}
    
	/**
	 * 查询是否有跳过人像审核权限
	 */
	@RequestMapping(value = "/queryCheckPhotoOperatSpec", method = {RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody
	String queryCheckPhotoOperatSpec(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response,HttpServletRequest request) {
		    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
		    // 是否需要人像审核
			String isPhotographReviewNeeded = "1";// 默认无权限，不展示审核
			try {
				isPhotographReviewNeeded = staffBmo.checkOperatBySpecCd(SysConstant.RXSHGN, sessionStaff);
			} catch (BusinessException be) {
				log.error(SYS_SG_MSG, be);
			} catch (InterfaceException ie) {
				log.error(SYS_SG_MSG, ie);
			} catch (IOException ioe) {
				log.error(SYS_SG_MSG, ioe);
			} catch (Exception e) {
				log.error(SYS_SG_MSG, e);
			} finally {
				
			}
			return isPhotographReviewNeeded;
	}
	
}
