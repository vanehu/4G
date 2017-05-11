package com.al.lte.portal.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;

import com.al.ec.serviceplatform.client.CsbDataMap;
import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ec.serviceplatform.client.httpclient.MyHttpclient;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.log.Log;
public class XmlSendClient {
	
	protected static Log log = Log.getLog(XmlSendClient.class);
	private static final String TEXT_CONTENT_TYPE = "application/xml";
	private static final String URL_PLACE_ORDER = "http://10.128.90.2:8201/LTE-CSB/HttpDEPService"; // 下单支付
	public static final String CDATA_BEGIN = "<![CDATA[";
	public static final String CDATA_END = "]]>";
	public static final String CDATA_END_REPLACEMENT = "]]&gt;";
	private static PropertiesUtils propertiesUtils = null;
	static {
		getPropertiesUtils();
	}
	
	public static void main(String[] args) throws IOException, Exception {
		Map<String, Object> dataMap = new HashMap<String, Object>();
		Map<String, Object> csbMap = new HashMap<String, Object>();
		csbMap.put("BusCode", "BUS47001");
		csbMap.put("ServiceCode", "SVC47002");
		csbMap.put("ServiceContractVer", "SVC4700220160307");
		csbMap.put("DstSysID", "1000000050");
		dataMap.put("merchantId", "043101180050000");
		dataMap.put("subMerchantId", "043101180050000");
		dataMap.put("barcode", "513095013297936908");
		dataMap.put("orderNo", "1111111");
		dataMap.put("orderReqNo", "1656655");
		dataMap.put("orderDate", "20160608113649");
		dataMap.put("channel", "05");
		dataMap.put("busiType", "0001");
		dataMap.put("orderAmt", "1");
		dataMap.put("productAmt", "1");
		dataMap.put("attachAmt", "0");
		dataMap.put("goodsName", "%E6%9D%A1%E7%A0%81%E6%94%AF%E4%BB%98");
		dataMap.put("storeId", "201231");
		dataMap.put("backUrl", "http%3A%2F%2F127.0.0.1%3A8030%2FwebBgNotice.action");
		dataMap.put("ledgerDetail", "");
		dataMap.put("attach", "");
		dataMap.put("mac", "3B5E200FD1EF8988693F242438A32475");
		callService(dataMap,csbMap);
	}
	
	public static Map callService(Map<String, Object> dataMap,Map<String,Object> csbMap) throws IOException, Exception {
		String csbUrl = propertiesUtils.getMessage("url.csbHttp");
		String paramString = XmlUtils.map2xmlBody(dataMap, "SvcCont");
		paramString = paramString.substring(9, paramString.length()-10);
		paramString = addCsbInfo(csbMap,paramString);
		//String retnJson = sendPost(URL_PLACE_ORDER,paramString);
		DataBus db = httpCall(paramString,csbUrl,TEXT_CONTENT_TYPE);
		String retnJson = db.getResultMsg();
		
		Map<String, Object> rootMap = XmlUtils.xmlBody2mapFor4g(retnJson);
		return rootMap;
	}
	
	private static String addCsbInfo(Map<String, Object> csbMap,
			String paramString) throws IOException,Exception {
		String tranid = "";
		Map tranMap = new HashMap();
		Map dataBusMap = new HashMap();
		String srcSysID = "1000000200";
		CsbDataMap cdm = new CsbDataMap();
		String str = "";
		str +=(int)(Math.random()*9+1);
		for(int i = 0; i < 9; i++){
			str += (int)(Math.random()*10);
		}

		DataBus db = null;
		try{
			db = ServiceClient.callService(dataBusMap, PortalServiceCode.SERVICE_GET_TRANID, null, null);
			if("POR-0000".equals(db.getResultCode().toString())){
				tranMap = db.getReturnlmap();
				tranid = (String.valueOf(tranMap.get("TranId")));
			}else{
				throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
			}
		}catch (Exception e) {
			throw new InterfaceException(ErrType.ECSP, PortalServiceCode.SERVICE_GET_TRANID, String.valueOf(db.getResultMsg()), JsonUtil.toString(dataBusMap));
        }
		if(StringUtils.isNotBlank(tranid)) {
			str = tranid;
		}
		cdm.setTranIdSeq(str);
		cdm.setBusCode(MapUtils.getString(csbMap, "BusCode"));
		cdm.setServiceCode(MapUtils.getString(csbMap, "ServiceCode"));
		cdm.setServiceContractVer(MapUtils.getString(csbMap, "ServiceContractVer"));
		cdm.setDstSysID(MapUtils.getString(csbMap, "DstSysID"));
		cdm.setActionCode(SysConstant.CSB_ACTION_CODE);
		cdm.setServiceLevel(SysConstant.CSB_SERVICE_LEVEL);
		cdm.setSrcSysSign(SysConstant.CSB_SRC_SYS_SIGN);
		cdm.setDstOrgID(SysConstant.CSB_ORG_ID_GROUP);
		cdm.setSrcOrgID(SysConstant.CSB_ORG_ID_GROUP);
		cdm.setSrcSysID(srcSysID);
		srcSysID = SysConstant.CSB_SRC_SYS_ID_APP;
		
		//使用CDATA封装svc
		if(false){
			//将报文中的]]>转义
			if(paramString != null && paramString.indexOf(CDATA_END) != -1){
				paramString = paramString.replaceAll(CDATA_END, CDATA_END_REPLACEMENT);
			}
			paramString = CDATA_BEGIN + paramString + CDATA_END;
		}
		cdm.setSvcCont(paramString);
		
		return cdm.getXml();
	}
	
	
	private static DataBus httpCall(String paramString, String reqUrl, String contentType) throws InterfaceException {
		long startTime = System.currentTimeMillis();
		
		DataBus db = new DataBus();
		String retnJson = "";
		HttpPost post = null;
		HttpEntity entity = null;
		try {
			// 调用http服务
			log.debug("reqUrl:{}", reqUrl);
			log.debug("paramString:{}", paramString);
			post = new HttpPost(reqUrl);
			post.addHeader("Content-Type", contentType);
			entity = new StringEntity(paramString, "UTF-8");
			post.setEntity(entity);
			HttpResponse httpresponse =  MyHttpclient.getInstance()
					.getHttpclient().execute(post);
			entity = httpresponse.getEntity();
			retnJson = EntityUtils.toString(entity, "UTF-8");
			log.debug("retnJson:{}", retnJson);
			// 返回成功
			if (httpresponse.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				db.setResultCode(ResultCode.R_SUCC);
				db.setResultMsg(retnJson);
			} else {
				String msg = "HTTP调用失败(http code:"
						+ httpresponse.getStatusLine().getStatusCode()
						+ ")";
				log.error(msg + retnJson);
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("paramString", paramString);
				db.setParammap(paramMap);
				msg = reqUrl + "\n" + msg + "\n" + retnJson;
				throw new InterfaceException(ErrType.OPPOSITE, "serviceCode", msg, paramString);
			}
		} catch (IOException ioe) {
			log.error("HTTP调用异常", ioe);
			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("paramString", paramString);
			db.setParammap(paramMap);
			if (ioe instanceof SocketTimeoutException) {
				String msg = ioe.getMessage();
				if ("Read timed out".equals(msg)) {
					msg = reqUrl + "\n" + msg;
					throw new InterfaceException(ErrType.OPPOSITE, "serviceCode", msg, paramString);
				}
			} else if (ioe.getCause() != null) {
				String msg = ioe.getCause().getMessage();
				if ("Connection timed out: connect".equals(msg)) {
					msg = reqUrl + "\n" + msg + "\n" + ioe.getMessage();
					throw new InterfaceException(ErrType.OPPOSITE, "serviceCode", msg, paramString);
				}
			}
			
			throw new InterfaceException(ErrType.PORTAL, "serviceCode", paramString, ioe);
		} catch (InterfaceException ie) {
			throw ie;
		} finally {
			post.abort();// 连接停止，释放资源
			try {
				if (null != entity) {
					EntityUtils.consume(entity);
				}
			} catch (IOException e) {
				log.error("HTTP调用释放资源异常", e);
			}
		}
		
		long useTime = System.currentTimeMillis() - startTime;
		log.debug("http call use time {} ms", useTime);
		return db;
	}
	 /**
     * 向指定 URL 发送POST方法的请求
     * 
     * @param url
     *            发送请求的 URL
     * @param param
     *            请求参数，请求参数应该是 name1=value1&name2=value2 的形式。
     * @return 所代表远程资源的响应结果
     */
    public static String sendPost(String url, String param) {
        PrintWriter out = null;
        BufferedReader in = null;
        String result = "";
        try {
            URL realUrl = new URL(url);
            // 打开和URL之间的连接
            URLConnection conn = realUrl.openConnection();
            // 设置通用的请求属性
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("connection", "Keep-Alive");
            conn.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 发送POST请求必须设置如下两行
            conn.setDoOutput(true);
            conn.setDoInput(true);
            // 获取URLConnection对象对应的输出流
            out = new PrintWriter(conn.getOutputStream());
            // 发送请求参数
            out.print(param);
            // flush输出流的缓冲
            out.flush();
            // 定义BufferedReader输入流来读取URL的响应
            in = new BufferedReader(
                    new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
        } catch (Exception e) {
            System.out.println("发送 POST 请求出现异常！"+e);
            e.printStackTrace();
        }
        //使用finally块来关闭输出流、输入流
        finally{
            try{
                if(out!=null){
                    out.close();
                }
                if(in!=null){
                    in.close();
                }
            }
            catch(IOException ex){
                ex.printStackTrace();
            }
        }
        return result;
    }    

	
	private static PropertiesUtils getPropertiesUtils() {
		if (propertiesUtils == null) {
			propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		}
		return propertiesUtils;
	}
}
