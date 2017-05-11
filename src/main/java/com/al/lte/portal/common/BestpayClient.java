package com.al.lte.portal.common;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.SocketTimeoutException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Component;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.InterfaceException.ErrType;
import com.al.ecs.log.Log;
import com.al.lte.portal.core.DataRepository;

@Component
public class BestpayClient {

	protected static Log log = Log.getLog(BestpayClient.class);
	
	private static final String ENCODING = "UTF-8";
	
	private static final String TEXT_CONTENT_TYPE = "application/x-www-form-urlencoded";
	
	private static final String URL_PLACE_ORDER = "https://webpaywg.bestpay.com.cn/barcode/placeOrder"; // 下单支付
	private static final String URL_QUERY_ORDER = "https://webpaywg.bestpay.com.cn/query/queryOrder"; // 订单查询
	private static final String URL_COMMON_REFUND = "https://webpaywg.bestpay.com.cn/refund/commonRefund"; // 普通退款
	private static final String URL_REVERSE = "https://webpaywg.bestpay.com.cn/reverse/reverse"; // 冲正

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
			entity = new StringEntity(paramString, ENCODING);
			post.setEntity(entity);
			HttpResponse httpresponse = MyHttpsClient.getInstance()
					.getHttpclient().execute(post);
			entity = httpresponse.getEntity();
			retnJson = EntityUtils.toString(entity, ENCODING);
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
	
	private static String toParamString(Map<String, Object> dataBusMap, String[] excludedKeys) {
		//格式化请求参数
		StringBuilder sb=new StringBuilder();
		Iterator<Map.Entry<String, Object>> iterator = dataBusMap.entrySet().iterator();
		Map.Entry<String, Object> item;
		while(iterator.hasNext()){
			item=iterator.next();
			if (ArrayUtils.indexOf(excludedKeys, item.getKey()) < 0) {
				if(sb.length()>0){
					sb.append("&");
				}
				sb.append(item.getKey()).append("=").append(item.getValue());
			}
		}
		return sb.toString();
	}
	
	private static String genMac(Map<String, Object> dataBusMap, String[] keys) {
		StringBuilder sb = new StringBuilder();
		for (int i = 0, n = keys.length; i < n; i++) {
			String key = keys[i];
			String val = MapUtils.getString(dataBusMap, key);
			
			if(sb.length()>0){
				sb.append("&");
			}
			sb.append(key.toUpperCase()).append("=").append(val);
		}
		
		String md5Text = null;
		try {
			log.debug("macString:{}", sb);
			md5Text = DigestUtils.md5Hex(sb.toString().getBytes("UTF-8")).toUpperCase();
			log.debug("mac:{}", md5Text);
		} catch (UnsupportedEncodingException e) {
		}
		return md5Text;
	}

	/**
	 * 下单支付
	 * 
	 * @param dataBusMap
	 * merchantId/subMerchantId/barcode/orderNo/orderReqNo/channel/busiType/orderDate/orderAmt/productAmt/attachAmt/
	 * goodsName/storeId/backUrl/ledgerDetail/attach/key
	 * @return
	 * {"success":true,"result":{"merchantId":"01440109025345000","orderNo":"20150918224530","orderReqNo":"20150918224611047659587","orderDate":null,"transStatus":"B","transAmt":"1","ourTransNo":"2015091800000260482593","encodeType":"1","sign":"71D9058C14D238B379E39B989400719B","respCode":null,"respDesc":null},"errorCode":null,"errorMsg":null}
	 * bad:
	 * {"success":true,"result":{"merchantId":"01440109025345000","orderNo":"20150917202637","orderReqNo":"20150917202730120331240","orderDate":null,"transStatus":"C","transAmt":"1","ourTransNo":"2015091700000259394386","encodeType":"1","sign":"02ACBDA2E5629DFA23B8F7C03635B7BA","respCode":"200020","respDesc":"亲，账户可用余额不足"},"errorCode":null,"errorMsg":null}
	 * {"success":false,"result":null,"errorCode":"BARCODE_VALIDATE_ERROR","errorMsg":"条形码验证异常"}
	 * @throws Exception
	 */
	public static Map<String, Object> placeOrder(Map<String, Object> dataBusMap) throws Exception {
		String mac = genMac(dataBusMap, new String[]{"merchantId", "orderNo", "orderReqNo", "orderDate", "barcode", "orderAmt", "key"});
		dataBusMap.put("mac", mac);
		Map<String, Object> csbMap = new HashMap<String, Object>();
		csbMap.put("BusCode", "BUS47001");
		csbMap.put("ServiceCode", "SVC47002");
		csbMap.put("ServiceContractVer", "SVC4700220160307");
		csbMap.put("DstSysID", "1000000050");
		Object serviceCodeObj = null;
		if(false&&StringUtils.isNotBlank((String) dataBusMap.get("dbKeyWord"))) {
			serviceCodeObj = DataRepository.getInstence().getCommonParam(dataBusMap.get("dbKeyWord")+"","placeOrder");	
			Map<String, Object> map = JsonUtil.toObject((String)serviceCodeObj, Map.class);
		}
		dataBusMap.remove("dbKeyWord");
		Map<String, Object> rootMap =  XmlSendClient.callService(dataBusMap,csbMap);
	/*	String paramString = toParamString(dataBusMap, new String[]{"key"});
		String url = URL_PLACE_ORDER;
		
		DataBus db = httpCall(paramString, url, TEXT_CONTENT_TYPE);
		String retnJson = db.getResultMsg();*/
		//Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);
		return (Map<String, Object>) rootMap.get("SvcCont");
	}
	
	/**
	 * 订单查询
	 * 
	 * @param dataBusMap
	 * merchantId/orderNo/orderReqNo/orderDate/key
	 * @return
	 * {"success":true,"result":{"merchantId":"01440109025345000","orderNo":"20150918224530","orderReqNo":"20150918224611047659587","orderDate":"20150918224530","transStatus":"B","transAmt":"1","ourTransNo":"2015091800000260482593","encodeType":"1","sign":"47F174C6964BAD2C14E0D8D3785BC40C"},"errorCode":null,"errorMsg":null}
	 * {"success":true,"result":{"merchantId":"01440109025345000","orderNo":"20150917202637","orderReqNo":"20150917202730120331240","orderDate":"20150917202637","transStatus":"C","transAmt":"1","ourTransNo":"2015091700000259394386","encodeType":"1","sign":"C312F90C223C7AB4FE9DC7EA16910190"},"errorCode":null,"errorMsg":null}
	 * bad:
	 * {"success":false,"result":null,"errorCode":"BE300001","errorMsg":"订单MAC域验证失败"}
	 * {"success":false,"result":null,"errorCode":"BE110062","errorMsg":"没有找到符合条件的记录。"}
	 * @throws Exception
	 */
	public static Map<String, Object> queryOrder(Map<String, Object> dataBusMap) throws Exception {
		String mac = genMac(dataBusMap, new String[]{"merchantId", "orderNo", "orderReqNo", "orderDate", "key"});
		dataBusMap.put("mac", mac);
		Map<String, Object> csbMap = new HashMap<String, Object>();
		csbMap.put("BusCode", "BUS47001");
		csbMap.put("ServiceCode", "SVC47003");
		csbMap.put("ServiceContractVer", "SVC4700320160307");
		csbMap.put("DstSysID", "1000000050");
		Map<String, Object> rootMap =  XmlSendClient.callService(dataBusMap,csbMap);
		/*String paramString = toParamString(dataBusMap, new String[]{"key"});
		String url = URL_QUERY_ORDER;
		
		DataBus db = httpCall(paramString, url, TEXT_CONTENT_TYPE);
		String retnJson = db.getResultMsg();
		@SuppressWarnings("unchecked")
		Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);*/
		return  (Map<String, Object>) rootMap.get("SvcCont");
	}
	
	/**
	 * 普通退款
	 * 
	 * @param dataBusMap
	 * merchantId/subMerchantId/merchantPwd/oldOrderNo/oldOrderReqNo/refundReqNo/refundReqDate/transAmt/ledgerDetail/channel/key
	 * @return
	 * {"success":true,"result":null,"errorCode":null,"errorMsg":null}
	 * bad:
	 * {"success":false,"result":null,"errorCode":"BE300007","errorMsg":"商户未配置此交易权限"}
	 * {"success":false,"result":null,"errorCode":"BE110062","errorMsg":"没有找到符合条件的记录。"}
	 * {"success":false,"result":null,"errorCode":"BE301009","errorMsg":"订单状态不为成功，退款失败"}
	 * {"success":false,"result":null,"errorCode":"BE301010","errorMsg":"退款订单受理中，退款失败"}
	 * @throws Exception
	 */
	public static Map<String, Object> commonRefund(Map<String, Object> dataBusMap) throws Exception {
		String mac = genMac(dataBusMap, new String[]{"merchantId", "merchantPwd", "oldOrderNo", "oldOrderReqNo", "refundReqNo", 
				"refundReqDate", "transAmt", "ledgerDetail", "key"});
		dataBusMap.put("mac", mac);
		Map<String, Object> csbMap = new HashMap<String, Object>();
		csbMap.put("BusCode", "BUS47001");
		csbMap.put("ServiceCode", "SVC47004");
		csbMap.put("ServiceContractVer", "SVC4700420160307");
		csbMap.put("DstSysID", "1000000050");
		Map<String, Object> rootMap =  XmlSendClient.callService(dataBusMap,csbMap);
		/*String paramString = toParamString(dataBusMap, new String[]{"key"});
		String url = URL_COMMON_REFUND;
		
		DataBus db = httpCall(paramString, url, TEXT_CONTENT_TYPE);
		String retnJson = db.getResultMsg();
		@SuppressWarnings("unchecked")
		Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);*/
		return  (Map<String, Object>) rootMap.get("SvcCont");
	}
	
	/**
	 * 冲正
	 * 
	 * @param dataBusMap
	 * merchantId/subMerchantId/merchantPwd/oldOrderNo/oldOrderReqNo/refundReqNo/refundReqDate/transAmt/channel/key
	 * @return
	 * bad:
	 * {"success":false,"result":null,"errorCode":"BE300007","errorMsg":"商户未配置此交易权限"}
	 * {"success":false,"result":null,"errorCode":"BE110062","errorMsg":"没有找到符合条件的记录。"}
	 * {"success":false,"result":null,"errorCode":"BE301010","errorMsg":"退款订单受理中，退款失败"}
	 * {"success":false,"result":null,"errorCode":"BE301014","errorMsg":"原订单不为当天订单，冲正失败"}
	 * {"success":false,"result":null,"errorCode":"BE301012","errorMsg":"订单不为未退款，冲正失败"}
	 * @throws Exception
	 */
	public static Map<String, Object> reverse(Map<String, Object> dataBusMap) throws Exception {
		String mac = genMac(dataBusMap, new String[]{"merchantId", "merchantPwd", "oldOrderNo", "oldOrderReqNo", "refundReqNo", 
				"refundReqDate", "transAmt", "key"});
		dataBusMap.put("mac", mac);
		Map<String, Object> csbMap = new HashMap<String, Object>();
		csbMap.put("BusCode", "BUS47001");
		csbMap.put("ServiceCode", "SVC47005");
		csbMap.put("ServiceContractVer", "SVC4700420160307");
		csbMap.put("DstSysID", "1000000050");
		Map<String, Object> rootMap =  XmlSendClient.callService(dataBusMap,csbMap);
	/*	String paramString = toParamString(dataBusMap, new String[]{"key"});
		String url = URL_REVERSE;
		
		DataBus db = httpCall(paramString, url, TEXT_CONTENT_TYPE);
		String retnJson = db.getResultMsg();
		@SuppressWarnings("unchecked")
		Map<String, Object> rootMap = JsonUtil.toObject(retnJson, Map.class);*/
		return  (Map<String, Object>) rootMap.get("SvcCont");
	}
	
	public static void main(String[] args) {
		String merchantId = "043101180050000";
		String barcode = "515665002854886972";
		String orderNo = "1433734609560";
		String orderReqNo = "14337346095601";
		String orderDate = "20150608113649";
		String orderAmt = "1";
		
		Map<String, Object> param = new HashMap<String, Object>();
        param.put("merchantId", merchantId);
        param.put("subMerchantId", merchantId);
        param.put("barcode", barcode);
        param.put("orderNo", orderNo);
        param.put("orderReqNo", orderReqNo);
        param.put("orderDate", orderDate);
        param.put("channel", "05");
        param.put("busiType", "0001");
        param.put("TransType", "B");
        param.put("orderAmt", orderAmt);
        param.put("productAmt", "1");
        param.put("attachAmt", "0");
        param.put("goodsName", "条码支付");
        param.put("storeId", "201231");
        param.put("backUrl", "http://127.0.0.1:8030/webBgNotice.action");
        param.put("ledgerDetail", "");
        param.put("attach", "");
        param.put("attach", "");
        param.put("key", "111");
//        param.put("mac", mac);		
        
		String mac = genMac(param, new String[]{"merchantId", "orderNo", "orderReqNo", "orderDate", "barcode", "orderAmt", "key"});
		System.out.println(mac);
	}

}
