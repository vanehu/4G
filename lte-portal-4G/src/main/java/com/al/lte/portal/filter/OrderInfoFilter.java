package com.al.lte.portal.filter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import com.al.ecs.common.util.MDA;
import com.al.ecs.spring.annotation.log.LogOperatorAnn;
import com.al.lte.portal.bmo.crm.MktResBmo;
import com.al.lte.portal.bmo.crm.MktResBmoImpl;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.filter.OncePerRequestFilter;

import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.model.SessionStaff;

/**
 * 过滤 报文提交 参数中的 地区 渠道 号码 合约 终端，如果有篡改，防止提交
 * 
 * @author wd
 * 
 */
public class OrderInfoFilter extends OncePerRequestFilter {

	private MktResBmo mktResBmo = new MktResBmoImpl();

	private static Log log = Log.getLog(OrderInfoFilter.class);
	 
	private final static String CUR_AREA_ID_EXPR = "#sessionStaff.areaId#";  //使用sessionStaff中的areaId替换  
	private final static String CUR_CHANNEL_ID_EXPR = "#sessionStaff.channelId#"; //使用sessionStaff中的channelId替换 
	
	private static List<RegexAndReplacement> regexAndReplacements = null; //正则表达式和替换后的字符串
	private static List<RegexAndReplacement> regexAndReplacements2 = null; //正则表达式和替换后的字符串
	private static final String DEFAULT_ENCODING = "UTF-8";
	/** JSON格式的content type */
	private static final String JSON_CONTENT_TYPE = "application/json";
	static {
		regexAndReplacements = new ArrayList<RegexAndReplacement>(10);
        //不进行大小写转换
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([aA][rR][eE][aA][iI][dD])\"\\s*:\\s*\"[-\\.\\w]*\""), "\"$1\":\""+CUR_AREA_ID_EXPR+"\"")); // "areaId" : "11"
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([aA][rR][eE][aA][iI][dD])\"\\s*:[-\\.\\w]*,"), "\"$1\":"+CUR_AREA_ID_EXPR+",")); // "areaId" : 11 ,
		regexAndReplacements.add(new RegexAndReplacement(Pattern.compile("\"([aA][rR][eE][aA][iI][dD])\"\\s*:[-\\.\\w]*}"), "\"$1\":"+CUR_AREA_ID_EXPR+"}")); // "areaId" : 11 }
		
		
		regexAndReplacements2 = new ArrayList<RegexAndReplacement>(10);
		
		regexAndReplacements2.add(new RegexAndReplacement(Pattern.compile("\"([cC][hH][aA][nN][nN][eE][lL][iI][dD])\"\\s*:\\s*\"[-\\.\\w]*\""), "\"$1\":\""+CUR_CHANNEL_ID_EXPR+"\"")); // "channelId" : "11"
		regexAndReplacements2.add(new RegexAndReplacement(Pattern.compile("\"([cC][hH][aA][nN][nN][eE][lL][iI][dD])\"\\s*:[-\\.\\w]*,"), "\"$1\":"+CUR_CHANNEL_ID_EXPR+",")); // "channelId" : 11 ,
		regexAndReplacements2.add(new RegexAndReplacement(Pattern.compile("\"([cC][hH][aA][nN][nN][eE][lL][iI][dD])\"\\s*:[-\\.\\w]*}"), "\"$1\":"+CUR_CHANNEL_ID_EXPR+"}")); // "channelId" : 11 }
		
		   
	}
	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		long start = System.currentTimeMillis();
		String filterFlag = MDA.WRITE_FILTER_LOG_FLAG;
		if("ON".equals(filterFlag)){
			request = filterOrderInfo(request,response);
		}
		log.debug("OrderInfoFilter use time:{} ms", System.currentTimeMillis() - start);
		
		filterChain.doFilter(request, response);
	}
	
	//过滤敏感员工信息，返回重新封装后的request
	private HttpServletRequest filterOrderInfo(HttpServletRequest request,HttpServletResponse response) throws IOException, ServletException{
		
		SessionStaff sessionStaff = (SessionStaff) request.getSession()
				.getAttribute(SysConstant.SESSION_KEY_LOGIN_STAFF);
		
		//1、----
		Map<String,Object> newParams = new HashMap<String,Object>();
				
		//2、过滤json中的地区和渠道信息
		String newJsonBody = replaceOrderInfoOfRequestBody(request, response,sessionStaff);

		//3、使用过滤后的信息,重新封装request
		return new ParameterRequestWrapper(request, newParams, newJsonBody.getBytes(DEFAULT_ENCODING));
	}
	
	
	/*
	 * 过滤作为报文体中的地区信息：
	 * 读取报文体信息中的json后，有两种方式过滤敏感信息：
	 * 1、将序列化的json转化为json对象， 然后递归遍历json对象中的属性名，并重新赋值；
	 * 2、使用正则表达式替换敏感信息；
	 * 这里使用第二种方式。
	 */
	private String replaceOrderInfoOfRequestBody(HttpServletRequest request, HttpServletResponse response,SessionStaff sessionStaff) throws ServletException, IOException{
		BufferedReader br = request.getReader();
		StringBuilder sb = new StringBuilder();
		String s = null;
		String soNbr = "";
		while((s = br.readLine()) != null){
			sb.append(s);
		}
		br.close();
//		JSONObject json = JSONObject.fromObject(sb.toString());
		String newJson = sb.toString();
		if(newJson != null && newJson.trim().length() != 0){
			
			String contentType = request.getContentType();
		//	if(contentType != null && contentType.indexOf(JSON_CONTENT_TYPE) >= 0){
				log.debug("before filter, jsondata:{}", newJson);
				
				String areaId_value = sessionStaff == null ? "" : (String) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_AREA+"_"+sessionStaff.getStaffId());;
						//(String) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_AREA+"_"+sessionStaff.getStaffId());
				String channelId_value = sessionStaff == null ? "" : sessionStaff.getCurrentChannelId();
				
				if(StringUtils.isBlank(areaId_value)){
					areaId_value =  sessionStaff == null ? "" : sessionStaff.getCurrentAreaId();
				}
				
				//(String) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_CHANNEL+"_"+sessionStaff.getStaffId());
				if(StringUtils.isNotBlank(areaId_value) && StringUtils.isNotBlank(channelId_value))
				{
                    List<String> list = (List<String>) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_AGREEMENT+"_"+sessionStaff.getStaffId());
					List<String> list2 = (List<String>) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_NUMBER+"_"+sessionStaff.getStaffId());
					List<String> list3 = (List<String>) ServletUtils.getSessionAttribute(request, SysConstant.SESSION_KEY_TERMINAL+"_"+sessionStaff.getStaffId());
					
					
					
					Map<String,Object> map=new HashMap<String,Object>();
					map.put("resultMsg", "您当前提交的数据存在异常，请核对后重新提交!");
					response.setContentType("text/html;charset=utf-8");
					
					JSONObject jsonObject = JSONObject.fromObject(newJson);
					Object jsonParamObj = jsonObject.get("orderList");
					JSONObject jsonParam = JSONObject.fromObject(jsonParamObj);
					Object custOrderObjs = jsonParam.get("custOrderList");
					Object orderListInfo = jsonParam.get("orderListInfo");
					if(orderListInfo != null){
						JSONArray orderListInfoList = JSONArray.fromObject(orderListInfo);
						Object orderListArrs[] = orderListInfoList.toArray();
						for (int i = 0; i < orderListArrs.length; i++) {
							Object orderListArr = orderListArrs[i];
							JSONObject orderListObj = JSONObject.fromObject(orderListArr);
							soNbr = (String)orderListObj.get("soNbr");
						}
					}
					
					String flag = "";
					String flag2 = "";
					
					// 遍历orderList
					if (custOrderObjs != null) {
						JSONArray custOrderList = JSONArray.fromObject(custOrderObjs);
						Object custOrderListArrs[] = custOrderList.toArray();
						for (int i = 0; i < custOrderListArrs.length; i++) {
							Object custOrderListArr = custOrderListArrs[i];
							JSONObject custOrderListObj = JSONObject.fromObject(custOrderListArr);
							Object busiOrderObjs = custOrderListObj.get("busiOrder");
							if (busiOrderObjs != null) {
								JSONArray busiOrder = JSONArray.fromObject(busiOrderObjs);
								Object busiOrderObjArrs[] = busiOrder.toArray();
								for (int j = 0; j < busiOrderObjArrs.length; j++) {
									Object busiOrderObjArr = busiOrderObjArrs[j];
									JSONObject busiOrderObj = JSONObject.fromObject(busiOrderObjArr);
									Object boActionTypeObj = busiOrderObj.get("boActionType");
									if (boActionTypeObj != null) {
										JSONObject boActionType = JSONObject.fromObject(boActionTypeObj);
										//System.out.println(boActionType.toString());
										if (boActionType != null) {
											String actionClassCdStr = boActionType.get("actionClassCd").toString();
											int actionClassCd = Integer.parseInt(actionClassCdStr);
											String boActionTypeCd = (String) boActionType.get("boActionTypeCd");
											Object busiObj = busiOrderObj.get("busiObj");
											if (actionClassCd == 1200) {
												if (busiObj != null) {
													JSONObject bo = JSONObject.fromObject(busiObj);
												    Object objId = bo.get("objId");	
												  //  JSONObject objId = JSONObject.fromObject(ojbIdObj);
												//	System.out.println(ojbId.toString());
													if (objId != null && list != null) {
															for(String tmps: list){
																//isMatch = objId.toString().equals(tmps);
																if(objId.toString().equals(tmps)){
																	flag = "success";
																}
															}
														}
													}
											}
											
											
											if (actionClassCd== 1300) {
												if (busiObj != null) {
													JSONObject bo = JSONObject.fromObject(busiObj);
												    Object accessNumber = bo.get("accessNumber");
												 //   JSONObject accessNumber = JSONObject.fromObject(accessNumberObj);
												//	System.out.println(ojbId.toString());
													if (accessNumber != null && list2 != null) {
														if(!list2.contains(accessNumber)){
															/*response.getWriter().println(JsonUtil.toString(map));
															response.getWriter().close();
															throw new ServletException();*/
															//记录信息
															flag = "error";
														}
													}
												}
												Object dataObj = busiOrderObj.get("data");
												if (dataObj != null) {
													JSONArray data = JSONArray.fromObject(dataObj);
													Object dataArrs[] = data.toArray();
													for (int k = 0; k < dataArrs.length; k++) {
														Object dataArr = dataArrs[k];
														JSONObject dataArrObj = JSONObject.fromObject(dataArr);
														Object bo2CouponsObjs = dataArrObj.get("bo2Coupons");
														if (bo2CouponsObjs != null) {
															JSONArray bo2Coupons = JSONArray.fromObject(bo2CouponsObjs);
															Object bo2CouponsArrs[] = bo2Coupons.toArray();
															if(bo2CouponsArrs.length>0){
																for (int  m= 0; m < dataArrs.length; m++) {
																	Object dataArr2 = bo2CouponsArrs[m];
																	JSONObject dataArrObj2 = JSONObject.fromObject(dataArr2);
																	String couponInstanceNumber = (String) dataArrObj2.get("couponInstanceNumber");
																	if (couponInstanceNumber != null && list3 !=null ) {
																		for(String tmps: list3){
																			if(couponInstanceNumber.toString().equals(tmps)){
																				flag2 = "success";
																			}
																		}
																	}
																	
																}
															}
														}
														Object boProdAnsObjs = dataArrObj.get("boProdAns");
														if (boProdAnsObjs != null) {
															JSONArray boProdAns = JSONArray.fromObject(boProdAnsObjs);
															Object boProdAnsArrs[] = boProdAns.toArray();
															for (int  m= 0; m < dataArrs.length; m++) {
																Object dataArr2 = boProdAnsArrs[m];
																JSONObject dataArrObj2 = JSONObject.fromObject(dataArr2);
																String accessNumber = (String) dataArrObj2.get("accessNumber");
																if (accessNumber != null && list2 !=null ) {
																	if(!list2.contains(accessNumber)){
																		/*response.getWriter().println(JsonUtil.toString(map));
																		response.getWriter().close();
																		throw new ServletException();*/
																		//记录信息
																		flag2 = "error";
																	}
																}
															  }	
														   }
													 }
												}
											}
										}
									}
								}
							}
						}	
				     }
					if(!"".equals(flag) && !"success".equals(flag) || (!"".equals(flag2) && !"success".equals(flag2))){
						/*response.getWriter().println(JsonUtil.toString(map));
						response.getWriter().close();
						throw new ServletException();*/
						//记录信息
						saveFilterInfo(request,soNbr);
					}
                }
				log.debug("after filter, jsondata:{}", newJson);
			}
	//	}
		return newJson;
	}

	/**
	 * 保存订单过滤信息
	 */
	public void saveFilterInfo(HttpServletRequest request, String soNbr){
		Map<String, Object> param = new HashMap<String,Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(request,
				SysConstant.SESSION_KEY_LOGIN_STAFF);
		param.put("filter_type", "orderFilter");
		param.put("order_id", soNbr);
		param.put("area_id", sessionStaff.getAreaId());
		param.put("ip", ServletUtils.getIpAddr(request));
		param.put("method_name", "订单过滤器记录");
		param.put("remark","");
		param.put("IN_PARAM", JsonUtil.toString(param));
		try {
			mktResBmo.writeCardLogInfo("WRITE_FILTER_LOG_W",param, "", sessionStaff);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	class ParameterRequestWrapper extends HttpServletRequestWrapper {
		public static final int DEFAULT_BUFFER_SIZE = 2048;
		//private Map<String, Object> params;
		private final byte[] body;
		private ServletInputStream servletInputStream;
		private BufferedReader bufferedReader;

		public ParameterRequestWrapper(HttpServletRequest request,
				Map<String, Object> newParams,byte[] newBody) throws IOException {
			super(request);

			body = newBody;
			
			final ByteArrayInputStream bais = new ByteArrayInputStream(body);
			servletInputStream = new ServletInputStream() {
				@Override
				public int read() throws IOException {
					return bais.read();
				}
			};
			bufferedReader = new BufferedReader(new InputStreamReader(servletInputStream));
		}
		@Override
		public BufferedReader getReader() throws IOException {
			return bufferedReader;
		}

		@Override
		public ServletInputStream getInputStream() throws IOException {
			return servletInputStream;
		}

	}
	
	static class RegexAndReplacement{
		private Pattern pattern;
		private String replacement;
		public RegexAndReplacement(Pattern pattern, String replacement) {
			this.pattern = pattern;
			this.replacement = replacement;
		}
		public Pattern getPattern() {
			return pattern;
		}
		public void setPattern(Pattern pattern) {
			this.pattern = pattern;
		}
		public String getReplacement() {
			return replacement;
		}
		public void setReplacement(String replacement) {
			this.replacement = replacement;
		}
	}


}
