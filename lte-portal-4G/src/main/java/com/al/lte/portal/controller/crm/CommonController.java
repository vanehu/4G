package com.al.lte.portal.controller.crm;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
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

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.common.CommonMethods;
import com.al.lte.portal.common.Const;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 公用模块控制层
 * 
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 上午10:03:44
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.token.pc.controller.crm.CommonController")
@RequestMapping("/common/*")
public class CommonController extends BaseController {

	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.CommonBmo")
	private CommonBmo commonBmo;

	@Autowired
    @Qualifier("com.al.lte.portal.bmo.crm.CustBmo")
    private CustBmo custBmo;

	@Autowired
    private PropertiesUtils propertiesUtils;

	/**
	 * 获取随机码
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/getToken", method = RequestMethod.GET)
	@ResponseBody
    public String getToken(HttpServletRequest request){
		String random = UIDGenerator.getUIDByTime();
		ServletUtils.getSession(request).setAttribute(SysConstant.ORDER_SUBMIT_TOKEN, random);
		return random;
    }
	
	/**
	 * 修改号码UIM状态
	 * @param param
	 * @param model
	 * @param response
	 * @param optFlowNum
	 * @return
	 */
	@RequestMapping(value = "/updateResState", method = RequestMethod.GET)
	@ResponseBody
	public JsonResponse updateResState(@RequestParam("strParam") String param,
			Model model, HttpServletResponse response,
			@LogOperatorAnn String optFlowNum){
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		JsonResponse jsonResponse = null;
        try {
        	ArrayList paramList =  JsonUtil.toObject(param, ArrayList.class);
        	Map<String, Object> resMap = commonBmo.updateResState(paramList,optFlowNum, sessionStaff);
        	jsonResponse = super.successed(resMap,ResultConstant.SUCCESS.getCode());
        } catch (BusinessException e) {
        	log.error("修改号码UIM状态失败", e);
        } catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
		return jsonResponse;
	}
	
    /*离散值配置查询*/
	@RequestMapping(value="/querySpecListByAttrID", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> querySpecListByAttrID(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) throws Exception{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.put("areaId", sessionStaff.getCurrentAreaId());
		Map<String, Object> result = commonBmo.querySpecListByAttrID(param, null, sessionStaff);
		return result;
	}
	
	/**
	 * 配置
	 */
	@RequestMapping(value = "/queryPortalProperties", method ={ RequestMethod.POST, RequestMethod.GET})
    public @ResponseBody String queryPortalProperties(@RequestBody Map<String, Object> param,@LogOperatorAnn String flowNum,
  			HttpServletResponse response,HttpServletRequest request) {
		String propertiesKey = param.get("propertiesKey").toString();
		//身份证类型开发
		return propertiesUtils.getMessage(propertiesKey);
    }
	
    /*2级菜单信息查询*/
	@RequestMapping(value="/queryMenuInfo", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> queryMenuInfo(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) throws Exception{
		String menuName = (String) param.get("menuName");
		Object menuList = ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_MENU_LIST);
		String resourceId ="";
		String menuPath ="";
	    if (menuList != null && menuList instanceof List) {
	        Set<String> authUrls = new HashSet<String>();
	        List<Map> list1 = (List<Map>) menuList;
	        for (Map rowTemp1 : list1) {
	            List<Map> list2 = (List<Map>) rowTemp1.get("childMenuResources");
	            for (Map rowTemp2 : list2) {
                    String resourceName = (String) rowTemp2.get("resourceName");
                    if (menuName.equals(resourceName)) {
                        if (rowTemp2.get("resourceId") != null)
                        	resourceId = rowTemp2.get("resourceId") + "";
                        if ((String) rowTemp2.get("menuPath") != null)
                        	menuPath = (String) rowTemp2.get("menuPath");
                        break;
                    }
                }
	        }
	    }
	    Map<String, Object> returnMap = new HashMap<String, Object>();
	    returnMap.put("resourceId", resourceId);
	    returnMap.put("menuPath", menuPath);
		return returnMap;
	}
	
	/**
	 * 记录页面操作的动作和页面内容等，根据具体需要添加到入参字段
	 * @param param
	 * @param model
	 * @param response
	 * @param optFlowNum
	 * @return
	 */
	@RequestMapping(value="/portalActonLog", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> portalActonLog(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum, HttpServletResponse response) throws Exception{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		Map<String, Object> result = commonBmo.portalActonLog(param, null, sessionStaff);
		return result;
	}

	/**
	 * 生成云读卡入参.
	 * @param param
	 * @return
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(value="/getCloudParam", method = RequestMethod.POST)
    public JsonResponse getCloudParam(@RequestBody Map<String, Object> param,
        HttpServletRequest request) throws Exception {
        String teminalType = MapUtils.getString(param, "teminalType");
        if (StringUtils.isBlank(teminalType)) {
            return super.failed("", ResultConstant.IN_PARAM_FAILTURE.getCode());
        }
        String osType = MapUtils.getString(param, "osType", "");
        String browserModel = "";
        String deviceModel = MapUtils.getString(param, "deviceModel", "");
        String deviceSerial = MapUtils.getString(param, "deviceSerial", "");
        if ("PC".equalsIgnoreCase(teminalType.trim())) {
            browserModel = request.getHeader("User-Agent");
        }
        String busiSerial = RandomStringUtils.randomNumeric(20);
        String ipAdd = ServletUtils.getIpAddr(request);
        String appId = propertiesUtils.getMessage("APP_ID"); //应用ID
        String appSecret = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
        String srcSystem = propertiesUtils.getMessage("SRC_SYSTEM"); //发起方系统编码
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String timestamp = String.valueOf(DateUtil.dateToLong(new Date()));
        String nonce = RandomStringUtils.randomAlphanumeric(32);
        Map<String, String> businessExtMap = new HashMap<String, String>();
        businessExtMap.put("busiSerial", busiSerial);
        businessExtMap.put("staffCode", sessionStaff.getStaffCode());
        businessExtMap.put("channelCode", sessionStaff.getCurrentChannelCode());
        businessExtMap.put("areaCode", sessionStaff.getAreaCode());
        businessExtMap.put("teminalType", teminalType.trim());
        businessExtMap.put("srcSystem", srcSystem);
        businessExtMap.put("osType", osType.trim());
        businessExtMap.put("browserModel", browserModel.trim());
        businessExtMap.put("clientIP", ipAdd);
        businessExtMap.put("deviceModel", deviceModel.trim());
        businessExtMap.put("deviceSerial", deviceSerial.trim());
        String businessExt = JsonUtil.toString(businessExtMap);
        StringBuffer sbData = new StringBuffer();
        sbData.append(appId).append(appSecret).append(businessExt).append(nonce).append(timestamp);
        String signature = DigestUtils.shaHex(sbData.toString());
        Map<String, String> resultMap = new HashMap<String, String>();
        resultMap.put("appId", appId);
        resultMap.put("timestamp", timestamp);
        resultMap.put("nonce", nonce);
        resultMap.put("businessExt", businessExt);
        resultMap.put("signature", signature);
        return super.successed(resultMap);
    }

	@ResponseBody
    @RequestMapping(value="/decodeCert", method = RequestMethod.POST)
    public JsonResponse decodeCert(@RequestBody Map<String, Object> param,
        HttpServletRequest request) throws Exception {
	    String content = MapUtils.getString(param, "data");
	    if (StringUtils.isBlank(content)) {
	        return super.failed("", ResultConstant.IN_PARAM_FAILTURE.getCode());
	    }
	    String secret = propertiesUtils.getMessage("DES3_SECRET"); //3DES加密密钥
	    Map<?, ?> resultMap = custBmo.decodeCert(content.trim(), secret);
	    /*对下面的字段进行签名，可根据需要增加签名字段*/
	    String partyName = MapUtils.getString(resultMap, "partyName"); //姓名
	    String certAddress = MapUtils.getString(resultMap, "certAddress"); //地址
	    String certNumber = MapUtils.getString(resultMap, "certNumber"); //身份证号码
	    String identityPic = MapUtils.getString(resultMap, "identityPic"); //照片
	    String nonce = RandomStringUtils.randomAlphanumeric(Const.RANDOM_STRING_LENGTH); //随机字符串
	    String appSecret = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
	    String signature = commonBmo.signature(partyName, certNumber, certAddress, identityPic, nonce, appSecret);
	    MapUtils.safeAddToMap(resultMap, "signature", signature);
	    return super.successed(resultMap);
	}

	@ResponseBody
    @RequestMapping(value="/saveCloudLog", method = RequestMethod.POST)
    public JsonResponse saveCloudLog(@RequestBody Map<String, Object> param,
        HttpServletRequest request) throws Exception {
	    String empty = null;
        String flag = MapUtils.getString(param, "flag");
        if (StringUtils.isBlank(flag)) {
            return super.failed(empty, ResultConstant.IN_PARAM_FAILTURE.getCode());
        }
        String startTime = MapUtils.getString(param, "startTime");
        if (StringUtils.isBlank(startTime)) {
            return super.failed(empty, ResultConstant.IN_PARAM_FAILTURE.getCode());
        }
        String endTime = MapUtils.getString(param, "endTime");
        if (StringUtils.isBlank(endTime)) {
            return super.failed(empty, ResultConstant.IN_PARAM_FAILTURE.getCode());
        }
        String inParams = MapUtils.getString(param, "inParams");
        if (StringUtils.isBlank(inParams)) {
            return super.failed(empty, ResultConstant.IN_PARAM_FAILTURE.getCode());
        }
        String outParams = MapUtils.getString(param, "outParams");
        if (StringUtils.isBlank(outParams)) {
            return super.failed(empty, ResultConstant.IN_PARAM_FAILTURE.getCode());
        }

        String logFlag = propertiesUtils.getMessage("CLOUD_LOG_FLAG"); //日志开关
        if (SysConstant.ON.equalsIgnoreCase(logFlag)) {
            commonBmo.sendLog(param, request);
        }

        return super.successed(null);
    }

	/**
	 * 根据areaId查询区域类型
	 * @param param
	 * @param model
	 * @param response
	 * @param optFlowNum
	 * @return
	 */
	@RequestMapping(value="/queryRegionType", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> queryRegionType(@RequestBody Map<String, Object> param,
			@LogOperatorAnn String flowNum) throws Exception{
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
		String areaId = sessionStaff.getAreaId();
		Map<String,Object> result = new HashMap<String,Object>();
		Map<String, Object> areaInfo = CommonMethods.getAreaInfo(areaId);
		String areaLevel = MapUtils.getString(areaInfo, "areaLevel");
		
		//1-集团,2-省,3-本地网,4-区县,5-乡镇
		result.put("areaLevel",areaLevel);
		result.put("areaId",areaId);
		return result;
	}
}
