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

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.CommonBmo;
import com.al.lte.portal.bmo.crm.CustBmo;
import com.al.lte.portal.bmo.staff.StaffBmo;
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
	
	@Autowired
    @Qualifier("com.al.lte.portal.bmo.staff.StaffBmo")
    private StaffBmo staffBmo;


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
        businessExtMap.put("areaCode", sessionStaff.getAreaId());//原先为sessionStaff.getAreaCode()只有四位数字,但需求单要求六位编码，故修改，modify by yanghm
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
        request.getSession().setAttribute(SysConstant.SESSION_KEY_APP_ID, appId);
        request.getSession().setAttribute(SysConstant.SESSION_KEY_TIME_STAMP, timestamp);
        request.getSession().setAttribute(SysConstant.SESSION_KEY_NONCE, nonce);
        resultMap.put("businessExt", businessExt);
        resultMap.put("signature", signature);
        return super.successed(resultMap);
    }

	@ResponseBody
    @RequestMapping(value="/decodeCert", method = RequestMethod.POST)
    public JsonResponse decodeCert(@RequestBody Map<String, Object> param,
        HttpServletRequest request) throws Exception {
	    String content = MapUtils.getString(param, "data");
        String createFlag = MapUtils.getString(param, "createFlag");
	    if (StringUtils.isBlank(content)) {
	        return super.failed("", ResultConstant.IN_PARAM_FAILTURE.getCode());
	    }
	    String secret = propertiesUtils.getMessage("DES3_SECRET"); //3DES加密密钥
	    Map<?, ?> resultMap = custBmo.decodeCert(content.trim(), secret);
	    /*对下面的字段进行签名，可根据需要增加签名字段*/
	    String expDate = MapUtils.getString(resultMap, "expDate"); 
	    String currentD = DateUtil.getNowII();
	    int result = expDate.compareTo(currentD);
	    try { 
			if(result < 0 ){
				return super.failed("身份证已过期，无法办理业务", ResultConstant.FAILD.getCode());
			}
	    } catch (Exception e) {
	    	
	    }
	    request.getSession().setAttribute(Const.CACHE_CERTINFO_PARAM, resultMap);
	    String partyName = MapUtils.getString(resultMap, "partyName"); //姓名
	    String certAddress = MapUtils.getString(resultMap, "certAddress"); //地址
	    String certNumber = MapUtils.getString(resultMap, "certNumber"); //身份证号码
		request.getSession().setAttribute(Const.CACHE_CERTINFO, certNumber);
	    String identityPic = MapUtils.getString(resultMap, "identityPic"); //照片
	    String nonce = RandomStringUtils.randomAlphanumeric(Const.RANDOM_STRING_LENGTH); //随机字符串
	    String appSecret = propertiesUtils.getMessage("APP_SECRET"); //appId对应的加密密钥
	    String signature = commonBmo.signature(partyName, certNumber, certAddress, identityPic, nonce, appSecret);
        if("1".equals(createFlag)){
            request.getSession().setAttribute(Const.SESSION_SIGNATURE, signature);
        }
	    MapUtils.safeAddToMap(resultMap, "signature", signature);
	    ServletUtils.setSessionAttribute(request, new String(certNumber), true);
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
	
    @RequestMapping(value = "/checkOperate", method = RequestMethod.POST)
    public @ResponseBody
    String checkOperate(@LogOperatorAnn String flowNum, @RequestBody Map<String, Object> param,HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        String operatSpecCd = (String) param.get("operatSpecCd");
        String isAddOperation = (String) ServletUtils.getSessionAttribute(super.getRequest(), operatSpecCd
                + "_" + sessionStaff.getStaffId());
        try {
            if (isAddOperation == null) {
                isAddOperation = staffBmo.checkOperatSpec(operatSpecCd, sessionStaff);
                ServletUtils.setSessionAttribute(super.getRequest(), operatSpecCd + "_"
                        + sessionStaff.getStaffId(), isAddOperation);
            }
        } catch (BusinessException e) {
            isAddOperation = "1";
        } catch (InterfaceException ie) {
            isAddOperation = "1";
        } catch (Exception e) {
            isAddOperation = "1";
        }
        return isAddOperation;
    }
    
    /**
     * 根据权限编码查询工号是否具有该权限，以boolean返回，有权限返回false；无权限或其他情况返回true
     * @param param
     * @return
     */
    @RequestMapping(value = "/checkOperateSpec", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkOperateSpec(@RequestBody Map<String, String> param) {
        JsonResponse jsonResponse;
        String operateSpec = MapUtils.getString(param, "key", "");
        if("".equals(operateSpec)){
        	return super.failed(false, ResultConstant.FAILD.getCode());
        } else{
        	boolean isNeeded = false;
        	SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(), SysConstant.SESSION_KEY_LOGIN_STAFF);
        	String sessionKey = operateSpec + "_" + sessionStaff.getStaffId();
        	Object operateSpecInSession = ServletUtils.getSessionAttribute(super.getRequest(), sessionKey);
        	
        	if(operateSpecInSession == null){
               	try {
               		isNeeded = "0".equals(staffBmo.checkOperatBySpecCd(operateSpec, sessionStaff)) ? false : true;
         			ServletUtils.setSessionAttribute(super.getRequest(), sessionKey, isNeeded);
               	} catch (Exception e) {
                     return super.failed(false, ResultConstant.FAILD.getCode());
                 }
        	} else{
        		isNeeded = (Boolean) operateSpecInSession;
        	}
 			jsonResponse = super.successed(isNeeded, ResultConstant.SUCCESS.getCode());
        }
        
        return jsonResponse;
    }
    
    /**
     * 检查拍照仪驱动版本，如果有版本更新，则返回最新版本号
     * @param param
     * @return
     */
    @RequestMapping(value = "/checkCameraDriverVersion", method = RequestMethod.POST)
    @ResponseBody
    public JsonResponse checkCameraDriverVersion(@RequestBody Map<String, String> param) {
        JsonResponse jsonResponse = null;
        String versionSerial = MapUtils.getString(param, "versionSerial", "");//版本号
        String venderId = MapUtils.getString(param, "venderId", "");//厂商ID
        
        //1.入参检查
        if("".equals(versionSerial) || "".equals(venderId)){
        	return super.failed("拍照仪驱动版本号更新失败：查询参数为空！", ResultConstant.FAILD.getCode());
        } else{
        	Map<String,String> cameraDriverInfo = MDA.VENDER_SIGNATURE.get(venderId);
        	if(cameraDriverInfo != null){
        		Map<String,Object> newCameraDriverVersion = new HashMap<String, Object>();
        		String downloadUrl = null;//装控件下载URL
        		
        		//2.session封装控件下载URL
        		if("ON".equals(MapUtils.getString(MDA.CAMERA_DRIVER_DOWNLAOD, "DOWNLAOD_FLAG", ""))){
        			//支持针对某一个版本的下载
        			//URL实例https://crm.189.cn/portalstatic/assets/camera/DoccameraOcx_1.0.exe
        			downloadUrl = MDA.CAMERA_DRIVER_DOWNLAOD.get("DOWNLAOD_URL") + "DoccameraOcx_" + cameraDriverInfo.get("version") + ".exe";
        		} else{
        			//通用下载，不区分版本号
        			//URL实例https://crm.189.cn/portalstatic/assets/camera/DoccameraOcx.exe
        			downloadUrl = MDA.CAMERA_DRIVER_DOWNLAOD.get("DOWNLAOD_URL_UNITY");
        		}
    			ServletUtils.setSessionAttribute(super.getRequest(), SysConstant.CAMERA_DRIVER_DOWNLOAD_URL, downloadUrl);
        		
    			//3.版本号校验
        		if(versionSerial.equals(cameraDriverInfo.get("version"))){//校验成功，没有版本更新，与客户端版本一致
        			newCameraDriverVersion.put("update", false);
        			jsonResponse = super.successed(newCameraDriverVersion, ResultConstant.SUCCESS.getCode());
            	} else{//校验成功，有控件版本更新
            		newCameraDriverVersion.put("update", true);
        			newCameraDriverVersion.put("versionSerial", cameraDriverInfo.get("version"));
        			newCameraDriverVersion.put("downloadUrl", downloadUrl);
        			jsonResponse = super.successed(newCameraDriverVersion, ResultConstant.SUCCESS.getCode());
            	}
        	} else{
        		return super.failed("拍照仪驱动版本号更新失败：未知拍照仪厂商ID["+venderId+"]。", ResultConstant.FAILD.getCode());
        	}
        }
        
        return jsonResponse;
    }
    
	/**
	 * 新云读卡获取加密身份证信息并解密，客户端调用
	 * @param param
	 * @param request
	 * @return
	 * @throws Exception
	 */
	@ResponseBody
    @RequestMapping(value="/decodeCertNew", method = RequestMethod.POST)
    public JsonResponse decodeCertNew(@RequestBody Map<String, Object> param,
        HttpServletRequest request) throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils
				.getSessionAttribute(super.getRequest(),
						SysConstant.SESSION_KEY_LOGIN_STAFF);
		String content = MapUtils.getString(param, "data");
		String createFlag = MapUtils.getString(param, "createFlag");
		if (StringUtils.isBlank(content)) {
			return super.failed("", ResultConstant.IN_PARAM_FAILTURE.getCode());
		}
		String secret = propertiesUtils.getMessage("DES3_SECRET"); // 3DES加密密钥
		Map<?, ?> resultMap = custBmo.decodeCert(content.trim(), secret);
		/* 获取加密省份证信息所需字段 */
		Map<String, Object> paramsMap = new HashMap<String, Object>();
		String decodeId = MapUtils.getString(resultMap, "decodeId"); // 加密身份证唯一id
		String serverIp = MapUtils.getString(resultMap, "serverIP"); // 获取请求服务器ip
		String appId = (String) ServletUtils.getSessionAttribute(request,
				SysConstant.SESSION_KEY_APP_ID);
		String timestamp = (String) ServletUtils.getSessionAttribute(request,
				SysConstant.SESSION_KEY_TIME_STAMP);
		String qrynonce = (String) ServletUtils.getSessionAttribute(request,
				SysConstant.SESSION_KEY_NONCE);
		paramsMap.put("appId", appId);
		paramsMap.put("timestamp", timestamp);
		paramsMap.put("nonce", qrynonce);
		paramsMap.put("decodeId", decodeId);
		//serverIp="223.255.252.39:4001";//本地测试时打开
		paramsMap.put("serverIp", serverIp);
		try {
			Map<?, ?> returntMap = custBmo.queryCert(paramsMap, null,
					sessionStaff);// 请求云平台获取的加密身份证信息
			String certificate = MapUtils.getString(returntMap, "certificate");
			Map<?, ?> certificateMap = custBmo.decodeCert(certificate.trim(),
					secret);
			request.getSession().setAttribute(Const.CACHE_CERTINFO_PARAM, certificateMap);
			/* 对下面的字段进行签名，可根据需要增加签名字段 */
			String partyName = MapUtils.getString(certificateMap, "partyName"); // 姓名
			String certAddress = MapUtils.getString(certificateMap,
					"certAddress"); // 地址
			String certNumber = MapUtils
					.getString(certificateMap, "certNumber"); // 身份证号码
			request.getSession().setAttribute(Const.CACHE_CERTINFO, certNumber);
			String identityPic = MapUtils.getString(certificateMap,
					"identityPic"); // 照片
			String nonce = RandomStringUtils
					.randomAlphanumeric(Const.RANDOM_STRING_LENGTH); // 随机字符串
			String appSecret = propertiesUtils.getMessage("APP_SECRET"); // appId对应的加密密钥
			String signature = commonBmo.signature(partyName, certNumber,
					certAddress, identityPic, nonce, appSecret);
			if ("1".equals(createFlag)) {
				request.getSession().setAttribute(Const.SESSION_SIGNATURE,
						signature);
			}
			MapUtils.safeAddToMap(certificateMap, "signature", signature);
			ServletUtils.setSessionAttribute(request, new String(certNumber), true);
			return super.successed(certificateMap);
		} catch (BusinessException be) {
			this.log.error("调用主数据接口失败", be);
			return super.failed(be);
		} catch (InterfaceException ie) {
			return super.failed(ie, paramsMap, ErrorCode.QUERY_CLOUD_CERT);
		} catch (Exception e) {
			log.error("云平台/获取身份信息方法异常", e);
			return super.failed(ErrorCode.QUERY_CLOUD_CERT, e, paramsMap);
		}
	}
}
