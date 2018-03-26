package com.al.lte.portal.common;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Properties;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.jfree.util.Log;




/**
 * PP工具类。
 */
public class HTTPUtil {
	
	 private static final Logger logger = Logger.getLogger(HTTPUtil.class);
	
	 /**
	 * connect time out
	 * 
	 * @var int
	 */
	 private static int connectTimeOut = 30 * 1000;

	 /**
	 * time out second
	 * 
	 * @var int
	 */
	 private static int timeOut = 30 * 1000;

	 /**
	 * user agent
	 * 
	 * @var string
	 */
	 private static final String userAgent = "px v1.0";
	
	 private static ObjectMapper objectMapper = new ObjectMapper();
	    static{
//	    	objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd"));
//	      	objectMapper.setDeserializationConfig(objectMapper.getDeserializationConfig().without(                  
//	    		       DeserializationConfig.Feature.FAIL_ON_UNKNOWN_PROPERTIES));
	    }
	
		/**
		 * 使用对象进行json反序列化。
		 * @param json json串
		 * @param pojoClass 类类型
		 * @return
		 * @throws Exception
		 */
		@SuppressWarnings("unchecked")
		public static Object decodeJson(String json, Class pojoClass) throws Exception{		
			try{
				return objectMapper.readValue(json, pojoClass);
			}catch(Exception e){
				throw e;
			}
		}
		
		/**
		 * 将对象序列化。
		 * @param o 实体对象
		 * @return 序列化后json
		 * @throws Exception
		 */
		public static String encodeJson(Object o) throws Exception{
			try{
				return objectMapper.writeValueAsString(o);
			}catch(Exception e){
				throw e;
			}
		}
	  /** 
     * 执行一个HTTP POST请求，返回请求响应的内容
     * @param url        请求的URL地址 
     * @param params 请求的查询参数,可以为null 
     * @return 返回请求响应的内容 
     */ 
     public static String doPost(String url, String body) { 
    	 StringBuffer stringBuffer = new StringBuffer();
			HttpEntity entity = null;
			BufferedReader in = null;
			HttpResponse response = null;
			try {
				DefaultHttpClient httpclient = new DefaultHttpClient();
				HttpParams params = httpclient.getParams();
				HttpConnectionParams.setConnectionTimeout(params, 200000);
				HttpConnectionParams.setSoTimeout(params, 200000);
				HttpPost httppost = new HttpPost(url);
				httppost.setHeader("Content-Type", "application/x-www-form-urlencoded");
				httppost.setEntity(new ByteArrayEntity(body.getBytes("UTF-8")));
				response = httpclient.execute(httppost);
				int code=response.getStatusLine().getStatusCode();
				if(code==405){
					logger.error("the server is not exsit,returnCode:4404!");
					return null;
				}
				entity = response.getEntity();
				in = new BufferedReader(new InputStreamReader(entity.getContent(),"UTF-8"));
				String ln;
				while ((ln=in.readLine())!= null) {
					stringBuffer.append(ln);
					stringBuffer.append("\r\n");
				}
				httpclient.getConnectionManager().shutdown();
			} catch (ClientProtocolException e) {
				Log.error(e);
			} catch (IOException e1) {
				Log.error(e1);
			} catch (IllegalStateException e2) {
				Log.error(e2);
			} catch (Exception e) {
				Log.error(e);
			} finally {
				if (null != in) {
					try {
						in.close();
						in = null;
					} catch (IOException e3) {
						Log.error(e3);
					}
				}
			}
			return stringBuffer.toString();
    } 
     


	/** 
     * MD5 加密 
     */  
    public static String getMD5Str(String str) {  
        MessageDigest messageDigest = null;  
  
        try {  
            messageDigest = MessageDigest.getInstance("MD5");  
  
            messageDigest.reset();  
  
            messageDigest.update(str.getBytes("UTF-8"));  
        } catch (NoSuchAlgorithmException e) {  
        	Log.error("NoSuchAlgorithmException caught!");
        } catch (UnsupportedEncodingException e) {  
        	Log.error(e);  
        }  
  
        byte[] byteArray = messageDigest.digest();  
  
        StringBuffer md5StrBuff = new StringBuffer();  
  
        for (int i = 0; i < byteArray.length; i++) {              
            if (Integer.toHexString(0xFF & byteArray[i]).length() == 1)  
                md5StrBuff.append("0").append(Integer.toHexString(0xFF & byteArray[i]));  
            else  
                md5StrBuff.append(Integer.toHexString(0xFF & byteArray[i]));  
        }  
  
        return md5StrBuff.toString();  
    }  
    /**
     * 读取配置信息。
     * @param key Key值
     * @return
     * @throws Exception
     */
    public static String getConfig(String key) throws Exception{
    	try{
	    	InputStream in = HTTPUtil.class.getResourceAsStream("/conf.Properties");
	        Properties p = new Properties();
	        p.load(in);
	        return p.get(key).toString().trim();
    	}catch(Exception e){
    		System.out.println("配置文件不存在"+e.toString());
    	}
    	return "";
    }
    
    /**
	 * 获取流中的字符串
	 * @param is
	 * @return
	 */
	private static String stream2String( InputStream is ) {
		BufferedReader br = null;
		try{
			br = new BufferedReader( new java.io.InputStreamReader( is ));	
			String line = "";
			StringBuilder sb = new StringBuilder();
			while( ( line = br.readLine() ) != null ) {
				sb.append( line );
			}
			return sb.toString();
		} catch( Exception e ) {
			Log.error(e);
		} finally {
			tryClose( br );
		}
		return "";
	}

	/**
	 * 关闭输出流
	 * @param os
	 */
	private static void tryClose( OutputStream os ) {
		try{
			if( null != os ) {
				os.close();
				os = null;
			}
		} catch( Exception e ) {
			Log.error(e);
		}
	}
	
	/**
	 * 关闭writer
	 * @param writer
	 */
	private static void tryClose( java.io.Writer writer ) {
		try{
			if( null != writer ) {
				writer.close();
				writer = null;
			}
		} catch( Exception e ) {
			Log.error(e);
		}
	}
	
	/**
	 * 关闭Reader
	 * @param reader
	 */
	private static void tryClose( java.io.Reader reader ) {
		try{
			if( null != reader ) {
				reader.close();
				reader = null;
			}
		} catch( Exception e ) {
			Log.error(e);
		}
	}
	
	public static String doPost1(String loginCheckUrl, String body) {
		String result=null;
		try {
			URL url = new URL( loginCheckUrl );
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
	        conn.setRequestProperty( "User-Agent", userAgent );
	        conn.setReadTimeout(timeOut);
	        conn.setConnectTimeout(connectTimeOut);
	        conn.setRequestMethod("POST");
	        conn.setDoInput(true);
	        conn.setDoOutput(true);
	        OutputStream os = conn.getOutputStream();
	        BufferedWriter writer = new BufferedWriter( new OutputStreamWriter(os, "UTF-8") );
	        writer.write( body );
	        writer.flush();
	        tryClose( writer );
	        tryClose( os );
	        conn.connect();
	        InputStream is = conn.getInputStream();
	        result = stream2String( is );
		} catch (MalformedURLException e) {
			Log.error(e);
			logger.error("result:"+result,e);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			logger.error("result:"+result,e);
			Log.error(e);
		}
		return result;
        
	}
	
	public static String doPost2(String loginCheckUrl, String body) throws IOException {
		String result=null;
		URL url = new URL( loginCheckUrl );
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestProperty( "User-Agent", userAgent );
        conn.setReadTimeout(timeOut);
        conn.setConnectTimeout(connectTimeOut);
        conn.setRequestMethod("POST");
        conn.setDoInput(true);
        conn.setDoOutput(true);
        OutputStream os = conn.getOutputStream();
        BufferedWriter writer = new BufferedWriter( new OutputStreamWriter(os, "UTF-8") );
        writer.write( body );
        writer.flush();
        tryClose( writer );
        tryClose( os );
        conn.connect();
        InputStream is = conn.getInputStream();
        result = stream2String( is );

		return result;
        
	}
	
	/**
	 * 获取查询字符串
	 * @param request
	 * @return
	 */
	public static String getQueryString( Map<String, Object> params )  {
		String queryString = "";
		for (String key : params.keySet()) {
			Object value = params.get(key);
			if(value==null){
				value="-1";
			}
			queryString += key + "=" + value.toString() + "&";
		}
		queryString = queryString.substring(0, queryString.length() - 1);
		return queryString;
	}
	
	 /** 
     * 执行一个HTTP POST请求，返回请求响应的内容
     * @param url        请求的URL地址 
     * @param params 请求的查询参数,可以为null 
     * @return 返回请求响应的内容 
     */ 
     public static String doPost2(String url, String body,int timeout) { 
    	 StringBuffer stringBuffer = new StringBuffer();
			HttpEntity entity = null;
			BufferedReader in = null;
			HttpResponse response = null;
			int responseStatus=0;
			try {
				DefaultHttpClient httpclient = new DefaultHttpClient();
				HttpParams params = httpclient.getParams();
				HttpConnectionParams.setConnectionTimeout(params, 20000);
				HttpConnectionParams.setSoTimeout(params, 20000);
				HttpPost httppost = new HttpPost(url);
				httppost.setHeader("Content-Type", "application/x-www-form-urlencoded");
				httppost.setEntity(new ByteArrayEntity(body.getBytes("UTF-8")));
				response = httpclient.execute(httppost);
				responseStatus=response.getStatusLine().getStatusCode();				
				entity = response.getEntity();
				in = new BufferedReader(new InputStreamReader(entity.getContent(),"UTF-8"));
				String ln;
				while ((ln=in.readLine())!= null) {
					stringBuffer.append(ln);
					stringBuffer.append("\r\n");
				}
				httpclient.getConnectionManager().shutdown();
			} catch (ClientProtocolException e) {
				Log.error(e);
			} catch (IOException e1) {
				Log.error(e1);
			} catch (IllegalStateException e2) {
				Log.error(e2);
			} catch (Exception e) {
				Log.error(e);
			} finally {
				if (null != in) {
					try {
						in.close();
						in = null;
					} catch (IOException e3) {
						Log.error(e3);
					}
				}
			}
			if(responseStatus!=200){
				return responseStatus+"";
			}
			return stringBuffer.toString();
    } 
    
}
