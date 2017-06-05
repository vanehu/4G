package com.ailk.ecsp.intf.webservice;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.intf.httpclient.HttpclientContainer;
import com.ailk.ecsp.mybatis.model.ServiceModel;
import com.ailk.ecsp.util.DateUtil;
import com.ailk.ecsp.util.IConstant;
import com.ailk.ecsp.util.Log4jUtil;
import com.ailk.ecsp.util.MapUtil;
import com.ailk.ecsp.util.SoapUtil;
import com.ailk.ecsp.util.XmlUtil;
import com.al.ecs.exception.ResultConstant;
import com.eviware.soapui.impl.wsdl.WsdlInterface;
import com.eviware.soapui.impl.wsdl.WsdlOperation;
import com.eviware.soapui.impl.wsdl.WsdlProject;
import com.eviware.soapui.impl.wsdl.WsdlRequest;
import com.eviware.soapui.impl.wsdl.WsdlSubmit;
import com.eviware.soapui.impl.wsdl.WsdlSubmitContext;
import com.eviware.soapui.model.iface.Operation;
import com.eviware.soapui.model.iface.Response;

/**
 * 
 * @author chenyl
 */
public class WSClient {
	private static WSClient wsClient;
	private static Object pLock = new Object();
	private static Logger log = LoggerFactory.getLogger(WSClient.class);
	private HashMap<String, WsdlInterface[]> wsdlInterfaceMap;
	private WsdlProject project;
	private static long  oldTime = 0;;
	private static long  nowTime = 0;
	private static long intervalTime = 2;
	public static WSClient getInstance(){
		synchronized(pLock){
            if(wsClient == null){
            	wsClient = new WSClient();
             }
         }
		return wsClient;
	}
	
	private WSClient(){
		try {
			if(project==null){
				project = new WsdlProject();
			}
		} catch (Exception e) {
			log.error("","创建WsdlProject异常");
		}
		//Log4jUtil.initLog4j();
		wsdlInterfaceMap = new HashMap<String, WsdlInterface[]>();
	}
	
	public void removeIntf(String intfCode){
		wsdlInterfaceMap.remove(intfCode);
	}
	
	public void clearAllIntf(){
		wsdlInterfaceMap.clear();
	}
	
	protected WsdlInterface[] importWsdl(String wsdlUrl){
		WsdlInterface[] iface = null;
		try {
			
			if(project != null){
				iface = project.importWsdl(wsdlUrl, true, new HttpclientWsdlLoader(wsdlUrl));
				//iface = WsdlInterfaceFactory.importWsdl(project,wsdlUrl, true );
			} 
		}catch (Exception e) {
			log.error("","WSDL打开失败，请确认该WSDL地址是否可用！");
			log.error("",e);
		}
		return iface;
	}
	
	public WsdlInterface[] getWsdlInterface(final String wsdlUrl) {
		WsdlInterface[] wsdlInterfaces = wsdlInterfaceMap.get(wsdlUrl);
		if (null == wsdlInterfaces || wsdlInterfaces.length == 0) {
			wsdlInterfaces = importWsdl(wsdlUrl);
			wsdlInterfaceMap.put(wsdlUrl, wsdlInterfaces);
		}
		//超过间隔时间intervalTime 异步重新加载接口地址
		nowTime = DateUtil.getMinutes();
		log.debug("nowTime{},oldTime{}",nowTime,oldTime);
		if(Math.abs(nowTime - oldTime)>= intervalTime){
			oldTime = nowTime;
			new Thread(new ReloadWsdl(wsdlUrl)).start();
		}
		
		return wsdlInterfaces;
	}
	
	protected WsdlOperation getWsdlOperation(WsdlInterface[] wsdlInterfaces,String operationName){
        for (WsdlInterface wsdlInterface : wsdlInterfaces) {
        	WsdlOperation operation = (WsdlOperation) wsdlInterface.getOperationByName(operationName);
            if (operation != null) {
            	return operation;
            }
        }
        log.error("","无法获取Operation，请确认该接口名称是否存在！");
        return null;
	}
	
	public List getWsdlOperationNameList(String url){
		List list = new ArrayList();
		WsdlInterface[]  wsdlInterfaces = WSClient.getInstance().getWsdlInterface(url);
		for(int i = 0;wsdlInterfaces!=null && i < wsdlInterfaces.length; i++ ){
			WsdlInterface wsdlInterface = wsdlInterfaces[i];
			List<Operation> optArray = wsdlInterface.getOperationList();
			for(int j = 0; optArray!=null && j < optArray.size(); j++){
				Operation opt = optArray.get(j);
				list.add(opt.getName());
			}
		}
		return list;
	}
	
	public String getOperationRequestContent(String url,String operationName){
		WsdlInterface wsdlInterfaces[] = getWsdlInterface(url);
		if(wsdlInterfaces == null || wsdlInterfaces.length == 0){
			return null;
		}
		WsdlOperation  operation = getWsdlOperation(wsdlInterfaces, operationName);
		if(operation == null){
			return null;
		}
		return operation.getRequestAt(0).getRequestContent();
	}

	protected String buildRequestContent(String requestContent,Map params){
		if(params == null || params.size() == 0){
			return requestContent;
		}
		try {
			DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
            docBuilderFactory.setNamespaceAware(true);
            Document document = docBuilderFactory.newDocumentBuilder().parse(new InputSource(new StringReader(requestContent)));
			Element root = document.getDocumentElement();
			//参数注入，支持复杂入参
			SoapUtil.injectParam(root, params);
			return XmlUtil.serialize(document.getChildNodes());
		} catch (Exception e) {
			log.error("","请求入参数注入失败！");
			log.error("",e);
		}
		return null;
	}
	
	protected Map<String, Object> buildWsdlRequest(WSConfig config){
		Map<String, Object> returnMap = new HashMap<String, Object>();
		WsdlInterface wsdlInterfaces[] = getWsdlInterface(config.getUrl());
		if(wsdlInterfaces == null || wsdlInterfaces.length == 0){
			returnMap.put("resultCode", ResultConstant.R_INTF_STOP.getCode());
			returnMap.put("resultMsg", ResultConstant.R_INTF_STOP.getMsg()+config.getUrl());
			return returnMap;
		}
		WsdlOperation  operation = getWsdlOperation(wsdlInterfaces, config.getMethodName());
		if(operation == null){
			returnMap.put("resultCode", ResultConstant.R_SERV_INTF_ERROR.getCode());
			returnMap.put("resultMsg", ResultConstant.R_SERV_INTF_ERROR.getMsg());
			return returnMap;
		}
		String requestContent = operation.getRequestAt(0).getRequestContent();
		//log.debug("#############################RequestContent\n{}",requestContent);
		if(StringUtils.isBlank(requestContent)){
			returnMap.put("resultCode", "WS-1001");
			returnMap.put("resultMsg", "无法获取接口请求内容");
			return returnMap;
		}
		requestContent = buildRequestContent(requestContent, config.getInParams());
		if(StringUtils.isBlank(requestContent)){
			returnMap.put("resultCode", "WS-1002");
			returnMap.put("resultMsg", "参数注入失败！");
			return returnMap;
		}
		if (config.isSiebel()) {
			requestContent = SoapUtil.addSiebelHeader(requestContent,config.getSessionToken());
			requestContent = SoapUtil.addSiebelHeader(requestContent,config.getUserName(), 
							config.getPassWord(),config.getSessionType());
		}
		WsdlRequest request = operation.addNewRequest("myRequest" ); 
		request.setRequestContent(requestContent);
		returnMap.put("request", request);
		returnMap.put("resultCode", "POR-0000");
		returnMap.put("resultMsg", "OK!");
		return returnMap;
	}
	
	protected Map parseResponseContent(String content,WSConfig config){
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map  responseMap = null;
		try {
			content = StringEscapeUtils.unescapeXml(content);
			if (StringUtils.isNotBlank(content)) {
				// 清除xml头
				content = content.replaceAll("(<\\?xml.+?>)", "");
				content = content.replaceAll("\t","");//制表符
				content = content.replaceAll("\r","");//回车符
				content = content.replaceAll("\n","");//换行符
			}
			log.debug(":return:"+content);
			if(IConstant.CON_OUT_PARAM_TYPE_TO_XML.equals(config.getOutParamType())){
				returnMap.put("result", content);
			}else{
				responseMap = SoapUtil.xmlToMap(content, config.getOutParamType());
				returnMap.put("result", responseMap);
				returnMap.put("resultParam", content);
				//returnMap.put("resIntfMsg", content);
				if(MapUtils.isEmpty(responseMap)){
					returnMap.put("resultCode", "WS-2002");
					returnMap.put("resultMsg", "回参转换失败,回参："+content);
					return returnMap;
				}
			}
			if (config.isSiebel()) {
				String sessionToken = SoapUtil.parseSessionToken(content);
				if (StringUtils.isNotBlank(sessionToken)){
					returnMap.put("SessionToken",SoapUtil.parseSessionToken(content));
				}
			}
		} catch (Exception e) {
			responseMap = null;
			log.error("","回参转换失败,回参："+content);
			log.error("",e);
		}
		returnMap.put("resultCode", "POR-0000");
		returnMap.put("resultMsg", "OK!");
		return returnMap;
	}
	
	public Map<String, Object> callWS(WSConfig config) {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map reqMap = buildWsdlRequest(config);
		String code  = MapUtil.asStr(reqMap, "resultCode");
		if(!"POR-0000".equals(code)){
			return reqMap;
		}
		WsdlRequest request = (WsdlRequest)reqMap.get("request");
		//WsdlSubmit submit = null;
		String content = "";
		try {
			content = sendRequest(config.getUrl(), request.getRequestContent(),
					request.getAction());
			//submit = (WsdlSubmit) request.submit( new WsdlSubmitContext(request), false);
		} catch (Exception e) {
			log.error("","接口请求失败");
			log.error("",e);
		} 
		if(StringUtils.isBlank(content)){
			returnMap.put("resultCode", "WS-2001");
			returnMap.put("resultMsg", "提交接口请求失败！");
			return returnMap;
		}
		//Response response = submit.getResponse(); 
		//String content = response.getContentAsString();
		//log.debug("#############################ResponseContent:{}",content);
		returnMap = parseResponseContent(content, config);
		return returnMap;
	}
	
	public Map<String, Object> callWS(String serviceCode,Map inParams){
		ServiceModel attr = DataRepository.getInstence().getServiceAttr(serviceCode);
		WSConfig cfg = new WSConfig();
		cfg.setInParams(inParams);
		cfg.setIsSiebel(false);
		cfg.setMethodName(attr.getMethodName());
		cfg.setUrl(attr.getIntfUrl());
		cfg.setOutParamType(attr.getOutParamType());
		return callWS(cfg);
	}
	
	private class ReloadWsdl implements Runnable{
		private String wsdlUrl;
		public ReloadWsdl(String wsdlUrl){
			this.wsdlUrl = wsdlUrl;
		}
		public void run() {
			log.debug("异步重新加载接口地址{}",wsdlUrl);
			WsdlInterface[] wsdlInterfaces2 = importWsdl(wsdlUrl);
			if(wsdlInterfaces2!=null && wsdlInterfaces2.length>0){
				log.debug("异步重新加载接口地址完成！！！！");
				wsdlInterfaceMap.put(wsdlUrl, wsdlInterfaces2);
			}
		}
		
	}
	protected String sendRequest(String url, String message, String action) {

		// System.out.println(message);
		String responseMsg = "";
		int index = url.indexOf("?wsdl");
		if (index > 0) {
			url = url.substring(0, index);
		}

		HttpPost post = new HttpPost(url);
		HttpEntity entity = null;
		try {

			post.addHeader("Content-Type", "text/xml; charset=UTF-8");
			post.setHeader("SOAPAction", action);
			entity = new StringEntity(message, "UTF-8");
			post.setEntity(entity);
			HttpResponse response = HttpclientContainer.getInstance()
					.getHttpClient().execute(post);

			entity = response.getEntity();

			responseMsg = EntityUtils.toString(entity, "UTF-8");


		} catch (UnsupportedEncodingException e) {
			log.error("调用接口 HttpEntity 初始化异常：", e);
		} catch (ClientProtocolException e) {
			log.error("调用接口异常：", e);
		} catch (IOException e) {
			log.error("调用接口异常：", e);
		} finally {
			post.abort();
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
			} catch (IOException e) {
				log.error("接口调用完成释放HttpEntity异常：", e);
			}
		}

		return responseMsg;
	}
}

