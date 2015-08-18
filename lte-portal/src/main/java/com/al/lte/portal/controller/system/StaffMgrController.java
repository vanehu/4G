package com.al.lte.portal.controller.system;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.entity.PageModel;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MapUtil;
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
import com.al.lte.portal.bmo.staff.StaffBmo;
import com.al.lte.portal.common.AESSecurity;
import com.al.lte.portal.common.EhcacheUtil;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 工号管理控制类
 * @author liusd
 *
 */
@Controller("com.al.ecs.portal.agent.controller.portal.StaffMgrController")
@RequestMapping("/staffMgr/*")
public class StaffMgrController extends BaseController {
	
	/** des加密解密所需要的秘钥*/
	public static final byte[] keyBytes = {64, 100, -32, 117, -3, -39, 22, -63, 79, 76, 52, -3, 7, -116, -53, -65, 64, 100, -32, 117, -3, -39, 22, -63};
	/** des加密后储存的cookie名称*/
	public static final String desKey = "cookieUser";
	
	/** 短信验证前，登陆会话临时ID */
	public static final String SESSION_KEY_TEMP_LOGIN_STAFF = "_session_key_tenm_sms";
	
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
	private StaffBmo staffBmo;
	
	
    
    /**
     * 设置用户当前渠道
     * @param param
     * @param flowNum
     * @return
     */
    @RequestMapping(value = "/setCurrentChannel", method = { RequestMethod.GET, RequestMethod.POST })
    @ResponseBody
    public JsonResponse  setCurrentChannel(@RequestBody Map param,HttpSession session,
            @LogOperatorAnn String flowNum) {
    	JsonResponse jsonResponse = new JsonResponse();
    	jsonResponse.setSuccessed(false);
		jsonResponse.setCode(1);
		jsonResponse.setData("切换渠道失败，请稍后再试");
    	try{
    		String channelId = MapUtil.asStr(param,"channelId");
    		if(channelId!=null&&!channelId.equals("")&&session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL)!=null){
        		List<Map> channelList = (List<Map>)session.getAttribute(SysConstant.SESSION_KEY_STAFF_CHANNEL);
        		for(Map channelRow:channelList){
        			String id = MapUtils.getString(channelRow, "id", "");
        			if(channelId.equals(id)){
        				SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
        		                SysConstant.SESSION_KEY_LOGIN_STAFF);
        				
						String areaAllName = "" ;
						String areaName = channelRow.get("areaName")==null?null:channelRow.get("areaName").toString();
						String areaId = channelRow.get("areaId")==null?"":channelRow.get("areaId").toString();
						if(!areaId.equals("")){
							areaAllName = areaName ;
							if(areaId.substring(3, 7).equals("0000")){//省份
								if(channelRow.get("provinceName")!=null&&!channelRow.get("provinceName").equals("")){
									areaAllName = channelRow.get("provinceName").toString() ;
								}
							}else if(areaId.substring(5, 7).equals("00")){//市
								if(channelRow.get("provinceName")!=null&&!channelRow.get("provinceName").equals("")){
									areaAllName = channelRow.get("provinceName").toString()+ " > " + areaAllName ;
								}
							}else{
								if(channelRow.get("cityName")!=null&&!channelRow.get("cityName").equals("")){
									areaAllName = channelRow.get("cityName").toString()+ " > " + areaAllName ;
								}
								if(channelRow.get("provinceName")!=null&&!channelRow.get("provinceName").equals("")){
									areaAllName = channelRow.get("provinceName").toString()+ " > " + areaAllName ;
								}
							}
						}
						channelRow.put("areaAllName", areaAllName);
        				
        				SessionStaff.setChannelInfoFromMap(sessionStaff, channelRow);
    					
    			    	ServletUtils.setSessionAttribute(super.getRequest(), 
    			    			SysConstant.SESSION_KEY_LOGIN_STAFF, sessionStaff);
    			    	
    			    	jsonResponse.setCode(0);
    			    	jsonResponse.setSuccessed(true);
    			    	jsonResponse.setData(channelRow);
    			    	break;
        			}
        		}
    		}
    	}catch(Exception e) {
    		jsonResponse.setSuccessed(false);
			jsonResponse.setCode(1);
			jsonResponse.setData("切换渠道失败，请稍后再试");
			log.error("",e);
    	}
        return jsonResponse;
    }
    
    
    //员工查询
    @RequestMapping(value = "/getStaffList", method = RequestMethod.POST)
    public String getStaffList(HttpSession session,Model model ,@RequestBody Map<String, Object> param) {
    	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
    	
    	Integer totalSize = 1;
    	List list = new ArrayList();
    	String areaId = sessionStaff.getAreaId();
    	Integer iAreaId = areaId==null?0:Integer.parseInt(areaId);
    	String pageIndex = param.get("pageIndex")==null?"":param.get("pageIndex").toString();
    	String pageSize = param.get("pageSize")==null?"":param.get("pageSize").toString();
    	int iPage = 1;
    	int iPageSize = 10 ;
    	Map staffParm = new HashMap(param);
    	try{
    		iPage = Integer.parseInt(pageIndex);
    		iPageSize = Integer.parseInt(pageSize) ;
    		if(iPage>0){
    			staffParm.remove("dealerId");
        		staffParm.put("areaId", iAreaId);
        		if(staffParm.get("staffName")!=null&&"".equals(staffParm.get("staffName"))){
        			staffParm.remove("staffName");
        		}
        		if(staffParm.get("staffCode")!=null&&"".equals(staffParm.get("staffCode"))){
        			staffParm.remove("staffCode");
        		}
        		Map returnMap = staffBmo.queryStaffList(staffParm, null, sessionStaff);
            	if(returnMap.get("totalNum")!=null){
            		totalSize = Integer.parseInt(returnMap.get("totalNum").toString());
            		if(totalSize>0){
            			list = (List)returnMap.get("result");
            		}
            	}
    		}
    	}catch(BusinessException be){
			super.failed(be);
		}catch(InterfaceException ie){
			super.failed(ie, staffParm, ErrorCode.QUERY_STAFF_INFO);
		}catch(Exception e){
			super.failed(ErrorCode.QUERY_STAFF_INFO, e, staffParm);
		}
    	PageModel<Map<String, Object>> pm = PageUtil.buildPageModel(
    			iPage,
    			iPageSize,
        		totalSize<1?1:totalSize,
				list);
		model.addAttribute("pageModel", pm);
		model.addAttribute("pageParam", param);
        return "/order/order-dialog-staff";
    }
    
    //跳转至重置密码页面
    @RequestMapping(value = "/resetPwd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preResetPwd(Model model) throws AuthorityException {
    	return "/staff/staff-pwd-reset";
    }
    //跳转至修改密码页面
    @RequestMapping(value = "/updatePwd", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public String preUpdatePwd(HttpSession session,Model model) throws AuthorityException {
    	model.addAttribute("current", EhcacheUtil.getCurrentPath(session,"staffMgr/updatePwd"));
    	return "/staff/staff-pwd";
    }
    
    /**
     * 员工修改/重置密码
     * @param param 
     * @return
     */
	@RequestMapping(value = "/staffPwd", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse staffPwd(@RequestBody Map<String, Object> param, HttpServletResponse response, @LogOperatorAnn String flowNum){
		
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		param.put("staffId", Long.parseLong(sessionStaff.getStaffId()));		
		param.put("areaId", Long.parseLong(sessionStaff.getAreaId()));
						
		try{			
			Map<String, Object> resultMap = staffBmo.updateStaffPwd(param, flowNum, sessionStaff);
			int code = (Integer)resultMap.get("code");
			String message = (String)resultMap.get("message");
			return successed(message, code); 
			
		}catch(BusinessException be){
			return super.failed(be);
		}catch(InterfaceException ie){
			return super.failed(ie, param, ErrorCode.UPDATE_STAFF_PWD);
		}catch(Exception e){
			return super.failed(ErrorCode.UPDATE_STAFF_PWD, e, param);
		}
	}        
	
	/**
     * 主数据查询
     * @param param 
     * @return List<Map>
     */
	@RequestMapping(value = "/getCTGMainData", method = RequestMethod.POST)
	@AuthorityValid(isCheck = false)
	@ResponseBody
	public JsonResponse queryCTGMainData(@RequestBody Map<String, Object> param,
			HttpServletRequest request, HttpServletResponse response, @LogOperatorAnn String flowNum){	
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> rMap = null;
		JsonResponse jsonResponse = null;
		try{		
 			rMap = staffBmo.queryCTGMainData(param, flowNum, sessionStaff);
 			log.debug("return={}", JsonUtil.toString(rMap));
 			if (rMap != null&& ResultCode.R_SUCCESS.equals(rMap.get("code").toString())) {
 				jsonResponse = super.successed(rMap.get("result"),
 						ResultConstant.SUCCESS.getCode());
 			} else {
 				jsonResponse = super.failed(rMap.get("msg").toString(),
 						ResultConstant.SERVICE_RESULT_FAILTURE.getCode());
 			}		
 			return jsonResponse;
		}catch(BusinessException be){
			this.log.error("调用主数据接口失败", be);
   			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, param, ErrorCode.ORDER_CTGMAINDATA);
		} catch (Exception e) {
			log.error("门户/staffMgr/getCTGMainData方法异常", e);
			return super.failed(ErrorCode.ORDER_CTGMAINDATA, e, param);
		}
	}
	/**
	 * 跳转到ITMS系统，url上所需参数：
	 * <table border='1'>
	 *     <tr>
	 *         <td>参数名</td>
	 *         <td> 参数说明</td>
	 *         <td>是否必填</td>
	 *     </tr>
	 *     <tr>
     *         <td>ip:port</td>
     *         <td>  ITSM服务器上海端访问地址（待定）</td>
     *         <td>是</td>
     *     </tr>
     *     <tr>
     *         <td>type</td>
     *         <td>SingleITSM(固定值)</td>
     *         <td>是</td>
     *     </tr>
     *     <tr>
     *         <td>sourceid</td>
     *         <td>系统ID，按CRM协议主数据规范传，集团CRM-4G系统编码为1000000200</td>
     *         <td>是</td>
     *     </tr>
     *     <tr>
     *         <td>username</td>
     *         <td> 用户的账号，即用户的唯一标示，可为数字或者英文，单点登录格式：CRM地市唯一编码+CRM登录名，例如北京东城区 张三，username为8110101zhangsan</td>
     *         <td>是</td>
     *     </tr>
     *     <tr>
     *         <td>staffname</td>
     *         <td>用户中文名</td>
     *         <td>是</td>
     *     </tr>
     *     <tr>
     *         <td>telephone</td>
     *         <td>联系电话或手机号码：189********</td>
     *         <td>否</td>
     *     </tr>
     *     <tr>
     *         <td>email</td>
     *         <td>邮箱地址 189********@189.cn</td>
     *         <td>否</td>
     *     </tr>
     *     <tr>
     *         <td>province</td>
     *         <td>所属省份(ID)，传省公司编码表的CRM编码</td>
     *         <td>是</td>
     *     </tr>
     *     <tr>
     *         <td>config</td>
     *         <td> SINGLE_WARN_INFO_OPER（固定值）成功后跳转页面标识</td>
     *         <td>是</td>
     *     </tr>
     *     <tr>
     *         <td>key</td>
     *         <td>时间戳（加密）：使用加密方式</td>
     *         <td>是</td>
     *     </tr>
     *     
     *     <tr>
     *         <td>busiNo</td>
     *         <td>业务号码（可以传入电话号码等）</td>
     *         <td>否</td>
     *     </tr>
     *     <tr>
     *         <td>orderNo</td>
     *         <td>电子单流水号（可以传入订单号等）</td>
     *         <td>否</td>
     *     </tr>
     *     <tr>
     *         <td>problemProvince</td>
     *         <td>问题省份，传省公司编码表的CRM编码</td>
     *         <td>否</td>
     *     </tr>
     *     <tr>
     *         <td>sourceChannel</td>
     *         <td>来源渠道</td>
     *         <td>否</td>
     *     </tr>
	 * </table>
	 *   样例：
	 *   http://ip:port/SingleSignOn?type=SingleITSM&sourceid=1000000200&username=8110106xuhs
    *&staffname=许和私  
    *&telephone=18999999999&email=18999999999@189.cn&province=27
    *&config=SINGLE_WARN_INFO_OPER
    *&key=EAD504D6FDB3647252D52F0920789A2A2E9A5ECDDDD3F74714B43C77E65046F9
    *&busiNo=18950299399&orderNo=1234567&problemProvince=27&sourceChannel=网厅
	 *   
	 * @param response
	 * @throws Exception 
	 */
	@RequestMapping(value = "/toitms", method = RequestMethod.GET)
    @AuthorityValid(isCheck = false)
    public void toITMS(HttpServletRequest request,  HttpServletResponse response) throws Exception{  
	    SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_KEY_LOGIN_STAFF);
	    StringBuilder url=new StringBuilder();
	    url.append(MySimulateData.getInstance().getNeeded("ITSM","url"));
	    String type="SingleITSM";
	    String sourceid="1000000200";
	    String username=sessionStaff.getAreaId()+sessionStaff.getStaffCode();
	    String staffname=sessionStaff.getStaffName();
	    String sourceChannel =sessionStaff.getChannelName();
        try {
            staffname =URLEncoder.encode(staffname, "UTF-8");
            sourceChannel =URLEncoder.encode(sourceChannel, "UTF-8");
        } catch (UnsupportedEncodingException e1) {
            e1.printStackTrace();
        }
	    String province=sessionStaff.getAreaId();
	    if(province!=null&&province.length()>3){
	        province=province.substring(0, 3)+"0000";
	    }else{
	        log.info("员工信息中AreaId有误{0}", province);
	    }
	    String config="SINGLE_WARN_INFO_OPER";
	    SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	    String key=AESSecurity.encode(sf.format(new Date()), "FFCS_ITSM");

	    
	    
	    url.append("?type=").append(type).append("&sourceid=").append(sourceid).append("&username=").append(username)
	    .append("&staffname=").append(staffname).append("&province=").append(province).append("&problemProvince=").append(province)
	    .append("&config=").append(config) .append("&key=").append(key).append("&sourceChannel=").append(sourceChannel);
	    log.debug(url.toString());
	    try {
	        response.setContentType("text/html;charset=UTF-8");
	        response.getWriter().print("<script>window.location.href='"+url+"'</script>");
        } catch (IOException e) {
            e.printStackTrace();
        }
	}
}
