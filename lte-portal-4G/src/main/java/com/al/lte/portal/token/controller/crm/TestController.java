package com.al.lte.portal.token.controller.crm;


import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.al.ec.toolkit.JacksonUtil;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.common.AESUtils;
import com.al.lte.portal.common.MySimulateData;
import com.al.lte.portal.common.StringUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.httpclient.HttpClientConnectionManager;


@Controller("com.al.lte.portal.token.controller.crm.TestController")
@RequestMapping("/test")
public class TestController extends BaseController {
	private static Logger log = LoggerFactory.getLogger(TestController.class.getName());
	
	private static DefaultHttpClient httpclient;
	static {  
		 httpclient =  new DefaultHttpClient();   
		 httpclient = (DefaultHttpClient) HttpClientConnectionManager.getSSLInstance(httpclient); // 接受任何证书的浏览器客户端 
	} 
	
	@RequestMapping("/index")
	public String index(HttpServletRequest request,HttpServletResponse response,Model model){		
		return "/test/index";		
	}	

 
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/getModelUrl",method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse getModelUrl(HttpServletRequest request,HttpServletResponse response,@RequestBody Map<String, Object> paramMap, Model model) {		
		JsonResponse jr = new JsonResponse();
		try{		
			String staffCode = String.valueOf(paramMap.get("staffCodeFF"));		
			String staffName = String.valueOf(paramMap.get("staffName"));		
			String areaId = String.valueOf(paramMap.get("areaId"));		
			String areaCode = String.valueOf(paramMap.get("areaCode"));
			String areaName = String.valueOf(paramMap.get("areaName"));
			String cityName = String.valueOf(paramMap.get("cityName"));
			String cityCode = String.valueOf(paramMap.get("cityCode"));
			String provinceName = String.valueOf(paramMap.get("provinceName"));
			String provinceCode = String.valueOf(paramMap.get("provinceCode"));
			String channelCode = String.valueOf(paramMap.get("channelCode"));
			String systemId = String.valueOf(paramMap.get("systemId"));	
			String publicKey = String.valueOf(paramMap.get("publicKey"));
			String privateKey = String.valueOf(paramMap.get("privateKey"));
			String mktResInstCode = String.valueOf(paramMap.get("uimCode"));
			String acctNumber=String.valueOf(paramMap.get("acctNumber"));
			String termCode=String.valueOf(paramMap.get("termCode"));
			String salesCode=String.valueOf(paramMap.get("salesCode"));
			String typeCd=String.valueOf(paramMap.get("typeCd"));
			String verifyLevel=String.valueOf(paramMap.get("verifyLevel"));
			String unifyLoginUri=String.valueOf(paramMap.get("unifyLoginUri"));
			String handlecustNumber=String.valueOf(paramMap.get("handlecustNumber"));
			String handleprovCustAreaId=String.valueOf(paramMap.get("handleprovCustAreaId"));
			
			Map<String,Object> map = new HashMap<String,Object>();
			map.put("staffCode", staffCode);
			map.put("staffName", unescape(staffName));
			map.put("areaId", areaId);
			map.put("areaCode", areaCode);
			map.put("areaName", unescape(areaName));
			map.put("cityName", unescape(cityName));
			map.put("cityCode", cityCode);
			map.put("provinceName", unescape(provinceName));
			map.put("provinceCode", provinceCode);
			map.put("channelCode", channelCode);
			map.put("systemId", systemId);
			map.put("mktResInstCode", mktResInstCode);
			map.put("acctNumber", acctNumber);
			map.put("typeCd", typeCd);
			map.put("verifyLevel",verifyLevel);
			map.put("handlecustNumber",handlecustNumber);
			map.put("handleprovCustAreaId",handleprovCustAreaId);
			log.error("生成令牌参数:"+JacksonUtil.objectToJson(map));
			log.error("省份私钥:"+privateKey);

			String dbKeyWord = (String) request.getSession().getAttribute(SysConstant.SESSION_DATASOURCE_KEY);
			if(unifyLoginUri == null || "".equals(unifyLoginUri)){
				unifyLoginUri = MySimulateData.getInstance().getParam("UNIFY_LOGIN_URI", dbKeyWord, "UNIFY_LOGIN_URI");
			}

			String path = request.getContextPath();
			String unifyLoginFlag = MySimulateData.getInstance().getParam("UNIFYLOGIN", dbKeyWord, "UNIFYLOGIN");
			String headPath = null;
			if("ON".equals(unifyLoginFlag)){
				headPath = unifyLoginUri;
			} else{
				headPath = (new StringBuilder(String.valueOf(request.getScheme()))).append("://").append(request.getServerName()).append(":").append(request.getServerPort()).append(path).toString();
			}
			
			String url =  headPath + "/accessToken";
			log.error("测试地址:"+url);
			
			HttpPost httpost = new HttpPost(url);
			//生成加密串
			String jmParams = AESUtils.encryptToString(JacksonUtil.objectToJson(map), privateKey);	
			List<NameValuePair> params = new ArrayList<NameValuePair>();
			params.add(new BasicNameValuePair("provinceCode", AESUtils.encryptToString(provinceCode, publicKey)));
			params.add(new BasicNameValuePair("params", jmParams));
			httpost.setEntity(new UrlEncodedFormEntity(params,  "utf-8"));
			httpclient.getParams().setParameter(CoreConnectionPNames.CONNECTION_TIMEOUT,  15000);//连接时间15s
			httpclient.getParams().setParameter(CoreConnectionPNames.SO_TIMEOUT,  30000);//数据传输时间30s
			HttpResponse res = httpclient.execute(httpost);
			String result = EntityUtils.toString(res.getEntity(), "utf-8");
			log.error("生成令牌结果:"+result);
			if(StringUtil.isEmptyStr(result)){
				jr = failed("令牌生成超时", 1);
				return jr;
			}
			Map<String,Object> resultMap = JsonUtil.toObject(result, HashMap.class);
			if(resultMap == null || resultMap.size() <=0){	
				jr = failed("令牌生成失败", 1);
				return jr;
			}
			if("0".equals(String.valueOf(resultMap.get("resultCode")))){
				String accessToken = String.valueOf(resultMap.get("accessToken"));				
				String provIsale = String.valueOf(paramMap.get("provIsale"));	
				String provCustIdentityCd = String.valueOf(paramMap.get("provCustIdentityCd"));
				String custNumber = String.valueOf(paramMap.get("custNumber"));
				String provCustIdentityNum = String.valueOf(paramMap.get("provCustIdentityNum"));
				String provCustAreaId = String.valueOf(paramMap.get("provCustAreaId"));
				String mainProdOfferId = String.valueOf(paramMap.get("mainProdOfferId"));
				String actionFlag = String.valueOf(paramMap.get("actionFlag"));
				String reloadFlag = String.valueOf(paramMap.get("reloadFlag"));
				String redirectUri = String.valueOf(paramMap.get("redirectUri"));
				String mainPhoneNum = String.valueOf(paramMap.get("mainPhoneNum"));
				String newSubPhoneNum = String.valueOf(paramMap.get("newSubPhoneNum"));
				String oldSubPhoneNum = String.valueOf(paramMap.get("oldSubPhoneNum"));
				String isFee = String.valueOf(paramMap.get("isFee"));
				
				map = new HashMap<String,Object>();
				map.put("provIsale", provIsale);
				map.put("provCustIdentityCd", provCustIdentityCd);
				map.put("custNumber", custNumber);
				map.put("provCustIdentityNum", provCustIdentityNum);
				map.put("provCustAreaId", provCustAreaId);
				map.put("mainProdOfferId", mainProdOfferId);
				map.put("actionFlag", actionFlag);
				map.put("reloadFlag", reloadFlag);
				map.put("redirectUri", redirectUri);						
				map.put("mainPhoneNum", mainPhoneNum);
				map.put("newSubPhoneNum", newSubPhoneNum);
				map.put("oldSubPhoneNum", oldSubPhoneNum);
				map.put("isFee", isFee);
				map.put("mktResInstCode", mktResInstCode);
				map.put("acctNumber", acctNumber);
				map.put("termCode", termCode);
				map.put("salesCode", salesCode);
				map.put("typeCd",typeCd);
				map.put("verifyLevel",verifyLevel);
				
				map.put("attrInfos", paramMap.get("attrInfos"));
				map.put("handlecustNumber",handlecustNumber);
				map.put("handleprovCustAreaId",handleprovCustAreaId);
				
				log.error("模拟单点页面参数:"+JacksonUtil.objectToJson(map));
				
				jmParams = AESUtils.encryptToString(JacksonUtil.objectToJson(map), privateKey);						
				Map<String,Object> reMap = new HashMap<String,Object>();
				reMap.put("params", jmParams);
				reMap.put("accessToken", accessToken);
				reMap.put("code", "0");
				if ("ON".equals(unifyLoginFlag)) {
					reMap.put("toUrl", unifyLoginUri);
				} else {
					reMap.put("toUrl", "1000");
				}	
				log.error("模拟单点页面加密参数:"+JacksonUtil.objectToJson(reMap));
				jr = successed(JacksonUtil.objectToJson(reMap), 0);
			}else{						
				jr = failed(String.valueOf(resultMap.get("resultMsg")), 1);		
			}			
		}catch(Exception ex){
			log.error("模拟测试异常:",ex);	
			jr = failed(ex, 1);				
			return jr;
		}
		return jr;		
	}
	
	
	@SuppressWarnings("unchecked")
	@RequestMapping("/getProvincePage")
	@ResponseBody
	public void getProvincePage(HttpServletRequest request,HttpServletResponse response,@RequestParam Map<String, Object> paramMap, Model model) {		
		Map<String,Object> resultMap = new HashMap<String,Object>();
		try{
			String params = request.getParameter("params");	
			if(StringUtil.isEmptyStr(params)){
				resultMap.put("resultCode", "1");
				resultMap.put("resultMsg", "参数为空");
				return;
			}
			String commonParamKey = MySimulateData.getInstance().getParam((String) ServletUtils.getSessionAttribute(super.getRequest(),SysConstant.SESSION_DATASOURCE_KEY),"common.param.key");//公共参数加密KEY
			if(StringUtil.isEmptyStr(commonParamKey)){
				resultMap.put("resultCode", "1");
				resultMap.put("resultMsg", "公共密钥为空");
				return;
			}
			String jmParams = AESUtils.decryptToString(params, commonParamKey);
			resultMap = JsonUtil.toObject(jmParams, HashMap.class);
			if(resultMap == null || resultMap.size() <= 0){
				resultMap.put("resultCode", "1");
				resultMap.put("resultMsg", "解析参数为空");
				return;
			}
		}catch(Exception ex){		
			log.error("省份回调异常:",ex);	
			resultMap.put("resultCode", "1001");
			resultMap.put("resultMsg", "服务异常。");
		}finally{
			try {
				response.setContentType("text/html");
				response.setCharacterEncoding("utf-8");				
				PrintWriter pt = response.getWriter();
				pt.print(JacksonUtil.objectToJson(resultMap));
				pt.flush();
				pt.close();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				log.error(e.getMessage());
			}
		}
	}
	
	public static String unescape(String src) {
		StringBuffer tmp = new StringBuffer();
		tmp.ensureCapacity(src.length());
		int lastPos = 0, pos = 0;
		char ch;
		while (lastPos < src.length()) {
			pos = src.indexOf("%", lastPos);
			if (pos == lastPos) {
				if (src.charAt(pos + 1) == 'u') {
					ch = (char) Integer.parseInt(src.substring(pos + 2, pos + 6), 16);
					tmp.append(ch);
					lastPos = pos + 6;
				} else {
					ch = (char) Integer.parseInt(src.substring(pos + 1, pos + 3), 16);
					tmp.append(ch);
					lastPos = pos + 3;
				}
			} else {
				if (pos == -1) {
					tmp.append(src.substring(lastPos));
					lastPos = src.length();
				} else {
					tmp.append(src.substring(lastPos, pos));
					lastPos = pos;
				}
			}
		}
		return tmp.toString();
	}
	
	
	@RequestMapping("/decryptEncryption")
	@ResponseBody
	public JsonResponse decryptEncryption(HttpServletRequest request,HttpServletResponse response,@RequestParam Map<String, Object> paramMap, Model model) {		
		JsonResponse jr = new JsonResponse();
		try{		
			String content = String.valueOf(paramMap.get("content"));		
			String pwd = String.valueOf(paramMap.get("pwd"));		
			String type = String.valueOf(paramMap.get("type"));		
			
			Map<String,Object> reMap = new HashMap<String,Object>();
			
			if(content==null || "".equals(content) || pwd==null || "".equals(pwd) || type==null || "".equals(type)){
				jr = failed("缺少必要参数", 1);
				return jr;
			}
			
			if("1".equals(type)){
				//1为加密
				String encryptStr = AESUtils.encryptToString(content, pwd);
				
				reMap.put("outResult", encryptStr);
			}else{
				//2为解密
				String result = AESUtils.decryptToString(content, pwd);
				reMap.put("outResult", result);
			}
			
			jr = successed(reMap, 0);
			
		}catch(Exception ex){
			log.error("参数加解密异常",ex);	
			jr = failed(ex, 1);				
			return jr;
		}
		return jr;		
	}
	
	@RequestMapping(value = "/ctrlSecret", method = RequestMethod.POST)
	@ResponseBody
	public JsonResponse ctrlSecret(@RequestBody Map<String, Object> paramMap){
		JsonResponse jsonResponse = super.successed("你丑o(╯□╰)o", 0);
		
		if(MapUtils.isNotEmpty(paramMap)){
			String mode	 			= MapUtils.getString(paramMap, "mode", "");				//算法模式
			boolean encrypt 		= MapUtils.getBooleanValue(paramMap, "encrypt", true);	//加密或解密标识
			String secretKey 		= MapUtils.getString(paramMap, "secretKey", "");		//密钥
			String secretContent 	= MapUtils.getString(paramMap, "secretContent", "");	//加密或解密内容

			if(mode.toUpperCase().indexOf("AES") >= 0){//AES算法
				String result = null;
				
				if(encrypt){//加密
					result = AESUtils.encryptAesToString(secretContent, secretKey);
				} else{//解密
					result = AESUtils.decryptAesToString(secretContent, secretKey);
				}
				
				result = result == null ? "你输入的有问题" : result;
				jsonResponse = super.successed(result, 0);
			} else if(mode.toUpperCase().indexOf("3DES") >= 0){//3DES算法
				if(encrypt){//加密
					
				} else{//解密
					
				}
			}
		} else{
			jsonResponse = super.failed("入参为空", 1);
		}
		
		return jsonResponse;
	}
}
