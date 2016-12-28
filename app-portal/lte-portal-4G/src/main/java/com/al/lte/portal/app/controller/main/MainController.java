package com.al.lte.portal.app.controller.main;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONArray;

import org.apache.commons.net.ftp.FTPClient;
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
import com.al.ecs.common.entity.Switch;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.ecs.spring.annotation.session.AuthorityValid;
import com.al.ecs.spring.annotation.session.SessionValid;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.OrderBmo;
import com.al.lte.portal.bmo.portal.NoticeBmo;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 登录后,首页控制器 .
 * <BR>
 *  TODO 要点概述.
 * <P>
 * @author tang zheng yu
 * @version V1.0 2012-3-30
 * @createDate 2012-3-30 下午3:29:40
 * @modifyDate	 tang 2012-3-30 <BR>
 * @copyRight 亚信联创电信CRM研发部
 */
@Controller("com.al.lte.portal.app.controller.main")
@RequestMapping("/app/main/*")
@AuthorityValid(isCheck = false)
public class MainController extends BaseController {
	
	@LogOperatorAnn(switchs = Switch.OFF)
	@RequestMapping(value = "/common", method = RequestMethod.GET)
	public String padlogin(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		model.addAttribute("menu", request.getParameter("menu"));
		model.addAttribute("app_flag", session.getAttribute(SysConstant.SESSION_KEY_APP_FLAG));
		String actionFlag=request.getParameter("actionFlag");
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		String propertiesKey = "NEWUIFLAG_"+ (sessionStaff.getCurrentAreaId() + "").substring(0, 3);//新ui开关
		// 新UI开关
		String newUIFlag = propertiesUtils.getMessage(propertiesKey);
		if("ON".equals(newUIFlag) && actionFlag!=null){
			return "/public/app-resource";
		}
		if("201".equals(actionFlag)){//橙分期无论开关是否开启都走新入口
			return "/public/app-resource";
		}
		return "/public/app-unify-entrance";
	}
	
	@RequestMapping(value = "/test", method = RequestMethod.GET)
	@SessionValid(false)
	public String test(HttpSession session, Model model,
			HttpServletRequest request, HttpServletResponse response) {
		return "/public/app-unify";
	}
	
	@Autowired
    @Qualifier("com.al.ecs.portal.agent.bmo.portal.NoticeBmo")
    private NoticeBmo noticeBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.OrderBmo")
	private OrderBmo orderBmo;
	
	@Autowired
	PropertiesUtils propertiesUtils;
	
	@RequestMapping(value = "/notice", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse notice(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response,@LogOperatorAnn String flowNum) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        String   bulletinId = (String) param.get("bulletinId"); 
        if(bulletinId != null && !bulletinId.equals("") && !bulletinId.equals("null")){
        	dataBusMap.put("bulletinId", param.get("bulletinId"));
        }
        dataBusMap.put("areaId", sessionStaff.getAreaId());
        dataBusMap.put("pageIndex", 1);
        dataBusMap.put("pageSize", 10);
        List<Map<String, Object>> list = null;
        JsonResponse jsonResponse = null;
        Map<String, Object> mapList=new HashMap<String, Object>();
        try {
            list = noticeBmo.getNoticeList(dataBusMap, null, sessionStaff);
            if (list != null && list.size() > 0) {
            	if(bulletinId != null && bulletinId !=""){
            		 Map<String, Object> mapdetail=new HashMap<String, Object>();
            		 mapdetail.put("bulletinName", list.get(0).get("bulletinName"));
            		 mapdetail.put("createDate", list.get(0).get("createDate"));
            		 mapdetail.put("bulletinText", list.get(0).get("bulletinText"));
	        		 if(list.get(0).get("attachs")!=null){
	        			 List<Map<String, Object>> attachslist =  (List<Map<String, Object>>) list.get(0).get("attachs");
	        			 List<Map<String, Object>> attchsList2=new ArrayList<Map<String, Object>>();
	        			 List<Map<String, Object>> urlList=new ArrayList<Map<String, Object>>();
	        			 Map<String, Object> nameMap=new HashMap<String, Object>();
     				    Map<String, Object> urlMap=new HashMap<String, Object>();
	        			 for(Map<String, Object> map2:attachslist){
	        				    Map<String, Object> myMap=new HashMap<String, Object>();
	        				    myMap.put("name", map2.get("name"));
	        					 String id="";
	        					 if(map2.get("id")!=null){
	        					   id=(String) map2.get("id");
	        					 }
	        					 String notice_url = (String) attachslist.get(0).get("noticeurl");
	        					 notice_url = notice_url +","+ attachslist.get(0).get("name");
	    	            		 myMap.put("noticeurl", AESUtils.encryptToString(notice_url, SysConstant.BLACK_USER_URL_PWD));
	    	            		 attchsList2.add(myMap);
	        			 }
	        			 JSONArray attachsArray= JSONArray.fromObject(attchsList2);
	        			 mapdetail.put("attachs", attachsArray);
	        		 }
//	        		 if(list.get(0).get("attachs")!=null){
//	        			 List<Map<String, Object>> attachslist =  (List<Map<String, Object>>) list.get(0).get("attachs");
//	        			 mapdetail.put("name", attachslist.get(0).get("name"));
//	            		 String notice_url = propertiesUtils.getMessage(SysConstant.NOTICE_URL);
//	            		 notice_url = notice_url+attachslist.get(0).get("id");
//	            		 mapdetail.put("noticeurl", notice_url);
//	        		 }
	        		 jsonResponse=super.successed(mapdetail, ResultConstant.SUCCESS.getCode());
            		 return jsonResponse;
            	}
            	mapList.put("infoList", list);
            }
            getApConfigMap(mapList,null,sessionStaff);
            jsonResponse=super.successed(mapList, ResultConstant.SUCCESS.getCode());
		}catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.BULLET_IN_INFO);
        } catch (Exception e) {
            return super.failed(ErrorCode.BULLET_IN_INFO, e, param);
        }
        return jsonResponse;
    }
	
	   /**
     * 公告附件下载
     * @param response
     * @param model
     * @param params
     * @return
     */
	@RequestMapping(value = "/downloadNoticeAttach", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse downloadFile(Model model,@RequestParam("fileUrl") String fileUrl,
			HttpServletResponse response) throws IOException {
		try {
			FtpUtils ftpUtils = new FtpUtils();
			// 解密url
			fileUrl = AESUtils.decryptToString(fileUrl, SysConstant.BLACK_USER_URL_PWD);
			String[] fileUrls = fileUrl.split(",");
			String filePath = fileUrls[0];
			String fileName =  filePath.substring(filePath.lastIndexOf("/") + 1);
			filePath = filePath.substring(0,filePath.lastIndexOf("/") + 1);
			
			String downName = fileUrls[1];
			
			//2.获取FTP服务器的具体登录信息
			//3.根据服务器映射获取对应的FTP服务器配置信息
			String ftpServiceConfig = MDA.NOTICE_FTP_SERVICE_CONFIGS;
			String[] ftpServiceConfigs = ftpServiceConfig.split(",");
			String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
			String remotePort = ftpServiceConfigs[1];//FTP服务器端口
			String userName = ftpServiceConfigs[2];//FTP服务器用户名
			String password = ftpServiceConfigs[3];//FTP服务器密码
			
			ftpUtils.connectFTPServer(remoteAddress,remotePort,userName,password);
			String path = filePath + new String(fileName.getBytes(), FTPClient.DEFAULT_CONTROL_ENCODING);
			boolean isFileExist = ftpUtils.isFileExist(path);
			if(isFileExist){
				ServletOutputStream  outputStream = response.getOutputStream();
				response.addHeader("Content-Disposition", "attachment;filename="+new String(downName.getBytes("gb2312"), "ISO8859-1"));
				response.setContentType("application/octet-stream;charset=utf-8");
				ftpUtils.getFileInputStreamByPath(outputStream ,filePath+fileName);
				return super.successed("下载成功！");
			}else{
				return super.failed("下载文件不存在，请联系管理员。", ResultConstant.FAILD.getCode());
			}
		} catch (Exception e) {
			return super.failed("下载文件异常：<br/>" + e, ResultConstant.FAILD.getCode());
		}		
	}
	
	/**
     * 取得滚动时间
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	private void getApConfigMap(Map<String, Object> mapList, String flowNum,
			SessionStaff sessionStaff) {
		String tableName = "SYSTEM";
		String columnItem = "NOITIC_INTERVAL_TIME";   
		List<Map<String, Object>> rList = new ArrayList<Map<String, Object>>();
		try {
			Object obj = DataRepository.getInstence().getApConfigMap().get(tableName+"-"+columnItem);
			if (obj != null && obj instanceof List) {
				rList = (List<Map<String, Object>>) obj;
			} else {
				Map<String, Object> pMap = new HashMap<String, Object>();
				pMap.put("tableName", tableName);
				pMap.put("columnName", columnItem);
				rList = (List<Map<String, Object>>)orderBmo.queryAgentPortalConfig(pMap, flowNum, sessionStaff).get("result");
				DataRepository.getInstence().getApConfigMap().put(tableName+"-"+columnItem, rList);
			}
			ArrayList<Map<String, Object>> al = (ArrayList)rList.get(0).get("NOITIC_INTERVAL_TIME"); 
			mapList.put("intervalTime", al.get(0).get("COLUMN_VALUE"));
		} catch (BusinessException e) {
		  this.log.error("查询配置信息服务出错", e);
		} catch (InterfaceException ie) {
			
		} catch (Exception e) {
			
		}
	}
	
	/**
     * 获取APP自动更新标识（0：不提示更新   1：强制更新   2：提示更新）
     * @param model
     * @param flowNum
     * @param sessionStaff
     */
	@RequestMapping(value = "/appUpdateFlag", method = { RequestMethod.POST })
    @ResponseBody
    @SessionValid(false)
    public JsonResponse appUpdateFlag(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response) {
        JsonResponse jsonResponse = null;
        String appUpdateFlag = "0";
        if(MDA.APP_UPDATE_FLAG.toString()!=null && MDA.APP_UPDATE_FLAG.toString().length()>0){
        	appUpdateFlag = MDA.APP_UPDATE_FLAG.toString();
        }
        Map<String, Object> mapList=new HashMap<String, Object>();
        mapList.put("appUpdateFlag", appUpdateFlag);
        jsonResponse=super.successed(mapList, ResultConstant.SUCCESS.getCode());
        return jsonResponse;
    }
	
	 /**
     * 根据id获取公告下载地址
     * @param session
     * @param model
     * @param params
     * @return
     */
	@SuppressWarnings({ "unchecked" })
	@RequestMapping(value = "/getNoticeUrl", method = { RequestMethod.POST })
    @ResponseBody
    public JsonResponse getNoticeUrl(@RequestBody Map<String, Object> param,HttpServletRequest request,
            HttpServletResponse response) {
        SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(super.getRequest(),
                SysConstant.SESSION_KEY_LOGIN_STAFF);
        Map<String, Object> dataBusMap = new HashMap<String, Object>();
        String   id = (String) param.get("id"); //公告id
        dataBusMap.put("areaId", sessionStaff.getAreaId());
        dataBusMap.put("pageIndex", 1);
        dataBusMap.put("pageSize", 10);
        List<Map<String, Object>> list = null;
        JsonResponse jsonResponse = null;
        try {
            list = noticeBmo.getNoticeList(dataBusMap, null, sessionStaff);
            if (list != null && list.size() > 0) {
            	for(Map<String,Object> map:list){
            		 Map<String, Object> mapdetail=new HashMap<String, Object>();
	        		 if(map.get("attachs")!=null){
	        			 List<Map<String, Object>> attachslist =  (List<Map<String, Object>>) map.get("attachs");
	        			 for(Map<String, Object> map2:attachslist){
	        				if(id.equals(map2.get("id"))){
	        					 mapdetail.put("name", map2.get("name"));
	    	            		 String notice_url = propertiesUtils.getMessage(SysConstant.NOTICE_URL);
	    	            		 notice_url = notice_url+id;
	    	            		 mapdetail.put("noticeurl", notice_url);
	    	            		 break;
	        				}
	        			 }
	        		 }
	        		 jsonResponse=super.successed(mapdetail, ResultConstant.SUCCESS.getCode());
            	}
            	return jsonResponse;
            }
		}catch (BusinessException be) {
            return super.failed(be);
        } catch (InterfaceException ie) {
            return super.failed(ie, param, ErrorCode.BULLET_IN_INFO);
        } catch (Exception e) {
            return super.failed(ErrorCode.BULLET_IN_INFO, e, param);
        }
        return jsonResponse;
    }
}
