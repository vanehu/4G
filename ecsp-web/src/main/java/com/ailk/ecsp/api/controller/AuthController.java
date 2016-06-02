package com.ailk.ecsp.api.controller;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.ailk.ecsp.api.commom.XmlUtils;
import com.ailk.ecsp.core.DataSourceRouter;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ailk.ecsp.api.bmo.WechatTokenBmo;
import com.ailk.ecsp.api.commom.AESUtils;
import com.ailk.ecsp.api.commom.RandomUtil;
import com.ailk.ecsp.mybatis.model.WechatToken;
import com.al.ecs.spring.controller.BaseController;

/**
 * 认证控制层
 * @author  EC研发部
 * @version V1.0 2016-05-14
 * @createDate 2016-05-16 
 * @modifyDate
 * @copyRight 亚信联创EC研发部
 */
@Controller("com.al.lte.portal.wechat.controller.AuthController")
@RequestMapping("/auth/*")
public class AuthController extends BaseController {
	@Autowired
	private WechatTokenBmo wechatTokenBmo;
	private static Logger log = LoggerFactory.getLogger(AuthController.class);
	
	
	/**
	 * 获取访问令牌
	 * @param reqMap
	 * @param model
	 * @return
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/getToken", method = RequestMethod.POST)
    public void queryToken(HttpServletRequest request,Model model,HttpServletResponse response,HttpSession httpSession) throws Exception{
		String body =  this.getBodyString(request);
	
		
		Map<String, Object> rootMap = XmlUtils.xmlBody2mapFor4g(body);
		String url = request.getRequestURL().toString();
		Map<String, Object> svcMap = (Map<String, Object>) rootMap.get("request");
		Map<String, Object> tcpContMap = (Map<String, Object>) rootMap.get("TcpCont");
		String transactionID = "";
		if(tcpContMap !=null ) {
			 transactionID = tcpContMap.get("TransactionID")+"";
		}
		if(svcMap == null ) {
			svcMap = rootMap;
		}
		
		String userNbr = svcMap.get("userNbr")+"";
		String openId = svcMap.get("openId")+"";
		String channelId = svcMap.get("channelId")+"";
		String areaId = svcMap.get("areaId")+"";
		log.debug("#param:"+url);
		Date date = new Date();
		long dateTime = date.getTime();
		String content = RandomUtil.getRandomString(3);
		String password = "TOKEN_8110000_KEY";
		String accessToken = AESUtils.encryptToString(content, password);
		Map<String, Object> resultMap = new HashMap<String, Object>();
		Map<String, Object> responseMap = new HashMap<String, Object>();
		Map<String, Object> tcpcontMap = new HashMap<String, Object>();
		Map<String, Object> tcpResponseMap = new HashMap<String, Object>();
		Map<String, Object> srootMap = new HashMap<String, Object>();
		//Map<String, Object> resultEntity = new HashMap<String, Object>();
		if(StringUtils.isNotBlank(areaId)) {
			areaId = areaId.substring(0,3)+"0000";
			content = areaId+content;
		}
		DataSourceRouter.setRouteFactor(areaId);
		WechatToken wechatToken = new WechatToken();
		wechatToken.setAccessToken(accessToken);
		wechatToken.setChannelId(channelId);
		wechatToken.setOpenId(openId);
		wechatToken.setReqUrl(url);
		wechatToken.setTimestamp(dateTime+"");
		wechatToken.setUserNbr(userNbr);
		int result = wechatTokenBmo.insertWechatToken(wechatToken);
		/*if(resultMapObj.get(ResultMap.RESULT_CODE_KEY).equals(ResultMap.CODE_SUCCESS)) {
			resultMap.put("createTime", dateTime);
			resultMap.put("accessToken", accessToken);
			return resultMap;
		}else 
		{
			resultMap.put("err", "数据保存失败！");
			return resultMap;
		}*/
		String returnTime = DateFormatUtils.format(new Date(), "yyyyMMddHHmmss");
		if(result>0){
			tcpResponseMap.put("RspType", 0);
			tcpResponseMap.put("RspCode", "0000");
			tcpResponseMap.put("RspDesc", "");
			tcpcontMap.put("Response", tcpResponseMap);
			tcpcontMap.put("ActionCode", 1);
			tcpcontMap.put("RspTime", returnTime);
			tcpcontMap.put("TransactionID", transactionID);
			
			
			resultMap.put("createTime", dateTime);
			resultMap.put("timeout", 600);
			resultMap.put("accessToken", accessToken);
			responseMap.put("result", resultMap);
			responseMap.put("resultCode", 0);
			responseMap.put("resultMsg", "成功");
			responseMap.put("errCode", "");
			
			srootMap.put("TcpCont", tcpcontMap);
			srootMap.put("SvcCont", responseMap);
			//return resultMap;
		}else 
		{
			tcpResponseMap.put("RspType", 1);
			tcpResponseMap.put("RspCode", "0001");
			tcpResponseMap.put("RspDesc", "数据库报存失败");
			tcpcontMap.put("Response", tcpResponseMap);
			tcpcontMap.put("ActionCode", 1);
			tcpcontMap.put("RspTime", returnTime);
			tcpcontMap.put("TransactionID", transactionID);
			
		
			resultMap.put("createTime", "");
			resultMap.put("timeout", 600);
			resultMap.put("accessToken", "");;
			responseMap.put("result", resultMap);
			responseMap.put("resultCode", 1);
			responseMap.put("resultMsg", "失败");
			responseMap.put("errCode", "500");
			
			srootMap.put("TcpCont", tcpcontMap);
			srootMap.put("SvcCont", responseMap);
		}
		String paramString = XmlUtils.map2xmlBody(srootMap, "ContractRoot");
		paramString = paramString.replace("<SvcCont>", "<SvcCont><response>").replace("</SvcCont>", "</response></SvcCont>");
		response.setCharacterEncoding("UTF-8");
		PrintWriter printWriter = response.getWriter();
		response.getWriter().write(paramString);
    }	
	
	private String getBodyString (HttpServletRequest request) throws Exception {
		BufferedReader br = request.getReader();
	    	  String inputLine;
	    	       String str = "";
	    	       while ((inputLine = br.readLine()) != null) {
	    	        str += inputLine;
	    	       }
	    	       br.close();
	    	     return str.replace("<SvcCont>", "").replace("</SvcCont>", "");
	}
	
	private static String inputStream2String(HttpServletRequest request) throws IOException{
		BufferedReader in = new BufferedReader(new InputStreamReader(request
				.getInputStream(), "UTF-8"));
	    StringBuffer buffer = new StringBuffer();
	    String line = "";
	    while ((line = in.readLine()) != null){
	      buffer.append(line);
	    }
/*		BufferedReader br = new BufferedReader(new InputStreamReader(request
				.getInputStream(), "UTF-8"));
		InputStream is = request.getInputStream();

		DataInputStream input = new DataInputStream(is);
		String str =input.readUTF(); */
	    return buffer.toString();
	}
}
