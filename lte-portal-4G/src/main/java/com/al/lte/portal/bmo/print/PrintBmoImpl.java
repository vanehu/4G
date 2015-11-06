package com.al.lte.portal.bmo.print;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.imageio.stream.FileImageOutputStream;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextFontResolver;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.NumUtil;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.DataSignTool;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.ServiceClient;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.ChsStringUtil;
import com.al.lte.portal.common.print.PdfPrintHelper;
import com.al.lte.portal.common.print.PrintHelperMgnt;
import com.al.lte.portal.common.print.dto.AcceNbrBaseSet;
import com.al.lte.portal.common.print.dto.AcceNbrNewSet;
import com.al.lte.portal.common.print.dto.AgreementIphoneSet;
import com.al.lte.portal.common.print.dto.AgreementSpeNbrSet;
import com.al.lte.portal.common.print.dto.AgreementTerminalSet;
import com.al.lte.portal.common.print.dto.AgreementsSet;
import com.al.lte.portal.common.print.dto.AuditTicketInfoSet;
import com.al.lte.portal.common.print.dto.BaseAttachOfferInfosSet;
import com.al.lte.portal.common.print.dto.CustInfoSet;
import com.al.lte.portal.common.print.dto.FeeInfoAPNSet;
import com.al.lte.portal.common.print.dto.FeeInfoBankSet;
import com.al.lte.portal.common.print.dto.FeeInfoRANSet;
import com.al.lte.portal.common.print.dto.FeeInfoSet;
import com.al.lte.portal.common.print.dto.FeeInfoTitleSet;
import com.al.lte.portal.common.print.dto.ItemInfoSet;
import com.al.lte.portal.common.print.dto.ItemInfoTwoNewSet;
import com.al.lte.portal.common.print.dto.ItemInfoTwoSet;
import com.al.lte.portal.common.print.dto.OEAttachOfferSet;
import com.al.lte.portal.common.print.dto.OEMainOfferSet;
import com.al.lte.portal.common.print.dto.OEPackageTitleTitleContent;
import com.al.lte.portal.common.print.dto.OEProdChangeSet;
import com.al.lte.portal.common.print.dto.OETermOfferSet;
import com.al.lte.portal.common.print.dto.OETitleContent;
import com.al.lte.portal.common.print.dto.OSAttachOfferSet;
import com.al.lte.portal.common.print.dto.OSBaseInfoSet;
import com.al.lte.portal.common.print.dto.OSNormOfferSet;
import com.al.lte.portal.common.print.dto.OSOrderInfoSet;
import com.al.lte.portal.common.print.dto.OSOtherInfoSet;
import com.al.lte.portal.common.print.dto.OSPrompInfoSet;
import com.al.lte.portal.common.print.dto.OSServOfferSet;
import com.al.lte.portal.common.print.dto.OfferProdAttrsSet;
import com.al.lte.portal.common.print.dto.OrderEventSet;
import com.al.lte.portal.common.print.dto.ProvNameSet;
import com.al.lte.portal.common.print.dto.StringBeanSet;
import com.al.lte.portal.common.print.dto.StringTwoSet;
import com.al.lte.portal.common.print.dto.TerminalInfoSet;
import com.al.lte.portal.core.DataRepository;
import com.al.lte.portal.model.SessionStaff;

/**
 * 业务接口 .
 * <P>
 *
 * @author wukf
 * @version V1.0 2013-08-07
 * @createDate 2013-08-07 下午2:14:11
 * @modifyDate
 * @copyRight 亚信联创电信CRM研发部
 */
@Service("com.al.lte.portal.bmo.print.PrintBmo")
public class PrintBmoImpl implements PrintBmo {

	private final Log log = Log.getLog(getClass());

	@Autowired
	PropertiesUtils propertiesUtils;

	String comment = "";
	int count = 0;
	private static List<String> filterList = new ArrayList<String>();
	private static Map<String,String> payMethodMap = new HashMap<String, String>();
	static {
		filterList.add("280000010");//不可及转移
		filterList.add("280000014");//呼叫等待
		filterList.add("280000011");//无条件转移
		filterList.add("280000008");//无应答转移
		filterList.add("280000009");//遇忙转移
		//支付方式
		payMethodMap.put("100000", "现金");
		payMethodMap.put("110000", "银行");
		payMethodMap.put("110400", "支票");
		payMethodMap.put("110101", "在线POS");
		payMethodMap.put("110102", "在线POS");
		payMethodMap.put("120000", "第三方支付平台");
		payMethodMap.put("130000", "渠道代收");
		payMethodMap.put("140000", "帐务代收类");
		payMethodMap.put("150000", "抵扣类");
		payMethodMap.put("160000", "货到付款");
	}

	/**
	 * 1. 业务类型判断 2. 获取打印参数、设置打印模板 3. 数据驱动模板、展示打印页面
	 */
	public Map<String, Object> printVoucher(Map<String, Object> paramMap,
			String optFlowNum,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		String busiType = MapUtils.getString(paramMap, "busiType");
		String printType = MapUtils.getString(paramMap, "printType");
		String agreement = MapUtils.getString(paramMap, "needAgreement");
		String signFlag = MapUtils.getString(paramMap, "signFlag");//0:打印 1:数字签名预览 2:生成pdf保存 3:生成未签名的pdf文件保存 4:手机端数字签名预览 5:保存客手机端的pdf文件
		if(signFlag==null){
			signFlag="0";
		}
		boolean needAgreement = SysConstant.STR_Y.equals(agreement);
		Map<String,Object> params=new HashMap<String,Object>();
		params.putAll(paramMap);
		if(params.get("signStr")!=null){
			params.remove("signStr");
		}
		if(params.get("signFlag")!=null){
			params.remove("signFlag");
		}
		Map<String, Object> printData = new HashMap<String, Object>();

		if (SysConstant.BUSI_TYPE_CRM_COMMON.equals(busiType)) {
			printData = getVoucherData(params, needAgreement, optFlowNum, request);

		} else if (SysConstant.BUSI_TYPE_FRESH_DATA.equals(busiType)) {

		} else if (SysConstant.BUSI_TYPE_WITH_PARAM.equals(busiType)) {

		} else if (SysConstant.BUSI_TYPE_TERMINAL_ORDER.equals(busiType)) {
			printData = paramMap;
		} else {

		}

		//如果printData为空，则返回失败
		if (MapUtils.isEmpty(printData)) {
			return printData;
		}
		if(signFlag.equals(SysConstant.PREVIEW_SIGN)){
			return runVoucherPrint(printData, response, printType, needAgreement,signFlag);
		}else if(signFlag.equals(SysConstant.PREVIEW_SIGN_HTML)){
			return getVoucherDataForApp(params, needAgreement, optFlowNum, request);
		}else if(signFlag.equals(SysConstant.SAVE_PDF)){
	    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
					.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
	    	String login_area_id = "";
	    	Object area=request.getSession().getAttribute("padLogin_area");
	    	if(area!=null&&!area.equals("")){
	    		login_area_id=area.toString();
	    	}else{
	    		login_area_id=sessionStaff.getAreaId();
	    	}
			byte[] signBytes = DataSignTool.hexStr2Bytes(paramMap.get("signStr").toString());
			InputStream is = new ByteArrayInputStream(signBytes);
			InputStream is2 =request.getSession().getServletContext().getResourceAsStream("/resources/image/gongz/"+login_area_id+".png");
			if(is2==null){
				byte[] sealBytes = DataSignTool.creatImageToByte(paramMap.get("sealInfo").toString());
				is2 = new ByteArrayInputStream(sealBytes);
			}
			printData.put("signPic",is);
			printData.put("companyseal", is2);
			is.close();
			is2.close();
			Map<String, Object> ret=runVoucherPrint(printData, response, printType, needAgreement,signFlag);
			ret.put("olId", params.get("olId"));
			ret.put("areaId", sessionStaff.getAreaId());
			ret.put("action", "ADD");
			if(ret!=null&&ret.get("orderInfo")!=null){
				Map<String,Object> obj= postPdfData(ret,optFlowNum,request);
				return obj;
			}else{
				return null;
			}
		}else if(signFlag.equals(SysConstant.SAVE_SIGN_PDF_APP)){
	    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
					.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
	    	String login_area_id = "";
	    	Object area=request.getSession().getAttribute("appLogin_area");
	    	if(area!=null&&!area.equals("")){
	    		login_area_id=area.toString();
	    	}else{
	    		login_area_id=sessionStaff.getAreaId();
	    	}
//			InputStream is2 =request.getSession().getServletContext().getResourceAsStream("/resources/image/gongz/"+login_area_id+".png");
//			if(is2==null){
//				byte[] sealBytes = DataSignTool.creatImageToByte(paramMap.get("sealInfo").toString());
//				is2 = new ByteArrayInputStream(sealBytes);
//			}
//			printData.put("companyseal", is2);
//			is2.close();
	    	byte[] data=savePdfApp(Base64.decodeBase64(params.get("sign").toString()),params.get("orderInfo").toString(),request);
	    	String orderInfo=Base64.encodeBase64String(data).replaceAll("\n|\r", "");
//	    	int height =Integer.valueOf(params.get("height").toString());
//	    	int imgHeigh =Integer.valueOf(params.get("imgHeigh").toString());

//	    	Map<String, Object> retPdf=getGZPdf(orderInfo,sessionStaff.getOrgId(),"1",300,540,400,640,optFlowNum,sessionStaff);
//	    	if(ResultCode.R_SUCCESS.equals(retPdf.get("code"))){
//	    		orderInfo=retPdf.get("resultParam").toString();
//	    	}else{
//	    		return null;
//	    	}
	    	Map<String, Object> ret=new HashMap<String, Object>();
//			Map<String, Object> ret=runVoucherPrint(printData, response, printType, needAgreement,signFlag);
			ret.put("olId", params.get("olId"));
			ret.put("areaId", sessionStaff.getAreaId());
			ret.put("action", "ADD");
			ret.put("orderInfo", orderInfo);
			if(ret!=null&&ret.get("orderInfo")!=null){
				Map<String,Object> obj= postPdfData(ret,optFlowNum,request);
				return obj;
			}else{
				return null;
			}
		}else if(signFlag.equals(SysConstant.SAVE_NO_SIGN_PDF)){
	    	SessionStaff sessionStaff = (SessionStaff) ServletUtils
					.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
			Map<String, Object> ret=runVoucherPrint(printData, response, printType, needAgreement,signFlag);
			ret.put("olId", params.get("olId"));
			ret.put("areaId", sessionStaff.getAreaId());
			ret.put("action", "ADD");
			if(ret!=null&&ret.get("orderInfo")!=null){
				Map<String,Object> obj= postPdfData(ret,optFlowNum,request);
				return obj;
			}else{
				return null;
			}
		}else{
			// 3. 数据驱动模板、展示打印页面
			runVoucherPrint(printData, response, printType, needAgreement,signFlag);
			return printData;
		}
	}
	private Map<String, Object> postPdfData(Map<String, Object> paramMap, String optFlowNum, HttpServletRequest request)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.INTF_SAVE_PRINTFILE,
				optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				returnMap.put("code", ResultCode.R_SUCCESS);
			}else{
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg()==null?"pdf提交接口失败，集团营业后台未返回resultMsg【resultMsg=null】":db.getResultMsg());
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.fileOperateService/upLoadPrintFileToFtp服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.FTP_UPLOAD_ERROR, paramMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
	private Map<String, Object> getVoucherData(Map<String, Object> paramMap, boolean needAgreement, String optFlowNum, HttpServletRequest request)
			throws Exception {
		Map<String, Object> resultMap = null;
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);

		if(paramMap.get("result")!=null){
			resultMap = (Map)paramMap.get("result");
			resultMap = parseVoucherData(resultMap, needAgreement);
		}else{
			DataBus db = InterfaceClient.callService(paramMap,
					PortalServiceCode.INTF_GET_VOUCHER_DATA,
					optFlowNum, sessionStaff);
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
				if (resultMap != null) {
					resultMap.put("chargeItems", paramMap.get("chargeItems"));
				}
				resultMap = parseVoucherData(resultMap, needAgreement);
			}
		}
		return resultMap;
	}

	private Map<String, Object> getVoucherDataForApp(Map<String, Object> paramMap, boolean needAgreement, String optFlowNum, HttpServletRequest request)
			throws Exception {
		Map<String, Object> resultMap = null;
		Map<String, Object> resultParseMap = new HashMap<String, Object>();
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);

		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.INTF_GET_VOUCHER_DATA,
				optFlowNum, sessionStaff);
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
			if (resultMap != null) {
				resultMap.put("chargeItems", paramMap.get("chargeItems"));
			}
			resultParseMap.put("htmlStr", getSignHtml(resultMap,sessionStaff));
		}
		return resultParseMap;
	}

	private Map<String, Object> getData(Map<String, Object> resultMap){
		Map<String, Object> maps=new HashMap<String, Object>();
		if(!resultMap.isEmpty()){
			//客户资料
			Map<String, Object> custInfoMap = MapUtils.getMap(resultMap, "custInfo");
			if(MapUtils.isNotEmpty(custInfoMap)){
				Object obj = MapUtils.getObject(custInfoMap, "norCustInfo");
				if (obj != null && obj instanceof List) {
					List<Map<String, Object>> tmpList = (List<Map<String, Object>>) obj;
					for (Map<String, Object> map : tmpList) {
						if(("客户名称").equals(map.get("itemName"))){
							maps.put("custName", map.get("itemValue"));
							break;
						}
					}
				}
			}

			Map<String, Object> orderListInfoMap = MapUtils.getMap(resultMap, "orderListInfo");
			if(MapUtils.isNotEmpty(orderListInfoMap)){
				maps.put("soDate", orderListInfoMap.get("soDate"));
				maps.put("olNbr", orderListInfoMap.get("olNbr"));
			}
			//办理的业务和号码
			Object orderEventMap = MapUtils.getObject(resultMap, "orderEvent");
			List empty = new ArrayList();//空的List 用来比较orderEventMap是否为空
			if (orderEventMap != null && orderEventMap instanceof List && !empty.equals(orderEventMap)) {
				List<Map<String, Object>> tmpList = (List<Map<String, Object>>) orderEventMap;
				StringBuffer sb=new StringBuffer();
				StringBuffer sbNub=new StringBuffer();
				for (Map<String, Object> map : tmpList) {
					Map<String, Object> orderEventTitle=(Map<String, Object>)map.get("orderEventTitle");
					if(("1").equals(String.valueOf(map.get("orderEventType")))){
						sb.append("【"+orderEventTitle.get("boActionTypeName")+"】");
						sb.append(orderEventTitle.get("prodSpecName"));
						Map<String, Object> orderEventCont=(Map<String, Object>)map.get("orderEventCont");
						if(orderEventCont.get("osAttachInfos")!=null){
							Map<String, Object> osAttachInfos=(Map<String, Object>)orderEventCont.get("osAttachInfos");
							Object offerInfosObj=osAttachInfos.get("offerInfos");
							if(offerInfosObj!=null && offerInfosObj instanceof List){
								List<Map<String, Object>> offerInfos = (List<Map<String, Object>>) offerInfosObj;
								if(offerInfos!=null && offerInfos.size()>0){
									for(int i=0; i<offerInfos.size(); i++){
										Map<String, Object> offerInfo = offerInfos.get(i);
										if (null != offerInfo.get("prodSpecName")) {
											if(i != 0){
												sb.append(",</br>");
											}else sb.append("：</br>");
											sb.append("&nbsp;&nbsp;[订购]");
											sb.append(offerInfo.get("prodSpecName"));
											if (null != offerInfo.get("effectRule")){
												sb.append("("+offerInfo.get("effectRule")+")");
											}
											if (null != offerInfo.get("relaAcceNbr")){
												sb.append("["+offerInfo.get("relaAcceNbr")+"]");
											}
										}
									}
								}
							}

						}
					}else if(("5").equals(String.valueOf(map.get("orderEventType")))&& ("1").equals(orderEventTitle.get("boActionTypeCd"))){
						if(sbNub.length()>0){
							//业务动作大于1时避免出现重复的主副卡号码
						   if (null != orderEventTitle.get("relaAcceNbr") && sbNub.indexOf(orderEventTitle.get("relaAcceNbr").toString())==-1) {
							   sbNub.append(","+orderEventTitle.get("relaAcceNbr"));
						   }
						}else{
						   if (null != orderEventTitle.get("relaAcceNbr")){
							   sbNub.append(orderEventTitle.get("relaAcceNbr"));
						   }
						}
					}else if(("3").equals(String.valueOf(map.get("orderEventType")))){
						if(sb.length()>0){
							sb.append(",</br>");
						}
						if (null != orderEventTitle.get("prodSpecName")) {
							sb.append("【"+orderEventTitle.get("boActionTypeName")+"】");
							sb.append(orderEventTitle.get("prodSpecName"));
							if (null != orderEventTitle.get("effectRule")){
								sb.append("("+orderEventTitle.get("effectRule")+")");
							}
							if (null != orderEventTitle.get("relaAcceNbr")){
								sb.append("["+orderEventTitle.get("relaAcceNbr")+"]");
							}
						}
						//功能产品展示
						Object orderEventContObj = map.get("orderEventCont");
						if(orderEventContObj!=null && orderEventContObj instanceof List){
							List<Map<String, Object>> orderEventCont = (List<Map<String, Object>>) orderEventContObj;
							if(orderEventCont!=null && orderEventCont.size()>0){
								for(int i=0; i<orderEventCont.size(); i++){
									Map<String, Object> item = orderEventCont.get(i);
									if (null != item.get("itemName")) {
										sb.append(",</br>");
										sb.append("&nbsp;&nbsp;["+item.get("actionName")+"]");
										sb.append(item.get("itemName"));
										if (null != item.get("effectRule")){
											sb.append("("+item.get("effectRule")+")");
										}
										if (null != item.get("relaAcceNbr")){
											sb.append("["+item.get("relaAcceNbr")+"]");
										}
									}
									if(sbNub.length()>0){
										//业务动作大于1时避免出现重复的主副卡号码
									   if (null != item.get("relaAcceNbr") && sbNub.indexOf(item.get("relaAcceNbr").toString())==-1) {
										   sbNub.append(","+item.get("relaAcceNbr"));
									   }
									}else{
									   if (null != item.get("relaAcceNbr")){
										   sbNub.append(item.get("relaAcceNbr"));
									   }
									}
								}
							}
						}
						if(sbNub.length()>0){
							//业务动作大于1时避免出现重复的主副卡号码
						   if (null != orderEventTitle.get("relaAcceNbr") && sbNub.indexOf(orderEventTitle.get("relaAcceNbr").toString())==-1) {
							   sbNub.append(","+orderEventTitle.get("relaAcceNbr"));
						   }
						}else{
						   if (null != orderEventTitle.get("relaAcceNbr")){
							   sbNub.append(orderEventTitle.get("relaAcceNbr"));
						   }
						}
				    }
				}

				maps.put("receiptInfo", sb.toString());
				maps.put("annumber", sbNub.toString());
			}
			//购手机
			else{
				//终端信息
				Object terminalInfosMap = MapUtils.getObject(resultMap, "terminalInfos");
				List<Map<String, Object>> terminalList = (List<Map<String, Object>>) terminalInfosMap;
				StringBuffer sb=new StringBuffer();
				StringBuffer sbNub=new StringBuffer();
				for (Map<String, Object> map : terminalList) {
					sb.append("【物品清单】:</br>");
					sb.append("&nbsp;&nbsp;"+map.get("tiName")+"&nbsp;&nbsp;"+"1"+map.get("tiParam"));
				}

				maps.put("receiptInfo", sb.toString());
				maps.put("annumber", sbNub.toString());
			}
		}
		return maps;
	}

	private String getSignHtml(Map<String, Object> resultMap,SessionStaff sessionStaff){
		Map<String, Object> result=getData(resultMap);
		StringBuffer html = new StringBuffer();
		html.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
		html.append("<html xmlns=\"http://www.w3.org/1999/xhtml\">");
		html.append("<head>");
		html.append("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"/>");
		html.append("<title>业务回执客户联</title>");
		html.append("</head>");
		html.append("<body style=\"margin:0;padding:0;\">");
		html.append("<div style=\"padding:10px;\">");
		html.append("<table style=\"border-collapse:collapse;border-spacing:0;margin:auto;width:100%;\">");
		html.append("<tr>")
			.append("<th colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:center;font-size:13px;line-height:20px;color:#4abde3;\"><font size=\"4\">业务回执客户联.</font></th>")
			.append("</tr>");
		html.append("<tr>");
		html.append("<th style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;width:50%;\">");
		html.append("客户名称.");
		html.append("</th>");
		html.append("<td style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\">");
		html.append(result.get("custName")+".");
		html.append("</td>");
		html.append("</tr>");
		html.append("<tr>")
			.append("<th style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;\">受理时间.</th>")
			.append("<td style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\">")
			.append(result.get("soDate")+".")
			.append("</td>")
			.append("</tr>");
		html.append("<tr>")
			.append("<th style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;\">购物车流水.</th>")
			.append("<td style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\">")
			.append(result.get("olNbr")+".")
			.append("</td></tr>");
		html.append("<tr>")
			.append("<th colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;\">您所办理的业务.</th>")
			.append("</tr>")
			.append("<tr>")
			.append("<td colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\">"+result.get("receiptInfo")+".</td>")
			.append("</tr>");
		html.append("<tr>")
			.append("<th colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;\">您所办理的号码.</th>")
			.append("</tr>")
			.append("<tr>")
			.append("<td colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\">"+result.get("annumber")+".</td>")
			.append("</tr>");
		html.append("<tr>")
			.append("<th style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;\">业务受理人（章戳）.</th>")
			.append("<td style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\">")
			.append(sessionStaff.getStaffName()+".")
			.append("</td></tr>");
		html.append("<tr>")
			.append("<th colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;\">申请人/办理人签字<span></span></th>")
			.append("</tr>")
			.append("<tr>")
			.append("<td colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\"><img id=\"datasign\" width=\"100%\" src=\"XXXXXSIGN\"></img></td>")
			.append("</tr>");
//		html.append("<tr>")
//			.append("<th colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#4abde3;\">业务受理人（章戳）.<span></span></th>")
//			.append("</tr>")
//			.append("<tr>")
//			.append("<td colspan=\"2\" style=\"border:1px solid #45daef;padding:5px;font-weight:normal;text-align:left;font-size:13px;line-height:20px;color:#444444;\"></td>")
//			.append("</tr>");
		html.append("</table></div>");
//		html.append("<ul style=\"width:100%;list-style:none;margin:0;padding:0;position: fixed !important;bottom: 0px;_position: absolute;_top: expression(eval(document.documentElement.scrollTop+document.documentElement.clientHeight-this.offsetHeight));\">")
//			.append("<li style=\"float:left;width:50%;\"><a href=\"#\" id=\"datasign\" style=\"display:block;width:100%;color:#fff;text-decoration:none;text-align:center;line-height:50px;font-size:16px;font-weight:bold;background:#07a5da\">手写签名</a></li>")
//			.append("<li style=\"float:left;width:50%;\"><a href=\"#\" id=\"print_ok\" style=\"display:block;width:100%;color:#fff;text-decoration:none;text-align:center;line-height:50px;font-size:16px;font-weight:bold;background:#46c2f1\">确认订单</a></li>")
//			.append("</ul></body></html>");
		return html.toString();
	}

	private Map<String, Object> parseVoucherData(Map<String, Object> dataMap, boolean needAgreement) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		int speCustInfoLen = SysConstant.INT_0;
		if (SysConstant.ON.equals(propertiesUtils.getMessage(SysConstant.PRINTNEW))) {
			//通用信息
			retnMap.putAll(parseCommonInfos_V2(dataMap));
			speCustInfoLen = MapUtils.getIntValue(retnMap, "speCustInfoLen", 0);
			//业务数据
			retnMap.put("orderEvents", parseOrderEvents_V2(dataMap, speCustInfoLen));
		} else {
			//通用信息
			retnMap.putAll(parseCommonInfos(dataMap));
			speCustInfoLen = MapUtils.getIntValue(retnMap, "speCustInfoLen", 0);
			//业务数据
			retnMap.put("orderEvents", parseOrderEvents(dataMap, speCustInfoLen));
		}
		//客户信息
		retnMap.put("custInfos", parseCustInfos(dataMap, speCustInfoLen));
		//费用信息
		retnMap.put("feeInfos", parseFeeInfos(dataMap));
		//终端信息
		retnMap.put("terminalInfos", parseTerminalInfos(dataMap));
		//终端抵用券
		retnMap.put("auditTickets", parseAuditTickets(dataMap));
		//提货方式
		retnMap.put("deliveryMethod", parseDeliveryMethod(dataMap));
		//备注信息
		retnMap.put("remarkInfos", parseRemarkInfos(dataMap));
		//协议信息
		retnMap.put("agreements", parseAgreements(dataMap, needAgreement));
		if(null!=retnMap.get("deliveryMethod")&&SysConstant.OFF.equals(propertiesUtils.getMessage(SysConstant.PRINTNEW))) {
			List<StringBeanSet> list= (List<StringBeanSet>) MapUtils.getObject(retnMap,"deliveryMethod");
			if (null!=list&&list.size()>0) {
				retnMap.put("feeInfos", new ArrayList<FeeInfoSet>());
				retnMap.put("advtInfos", new ArrayList<StringBeanSet>());
				retnMap.put("terminalInfos", new ArrayList<TerminalInfoSet>());
				retnMap.put("remarkInfos",parseRemarkInfosTemp());
			}
		}

		return retnMap;
	}

	private List<StringBeanSet> parseRemarkInfosTemp() {
		List<StringBeanSet> remarkInfos = new ArrayList<StringBeanSet>();
		remarkInfos.add(new StringBeanSet("1. 本预约单仅供客户在授权门店预约中国电信终端使用。"));
		remarkInfos.add(new StringBeanSet("2. 成功预约的客户有机会优先购买中国电信终端，接受预约订单的门店将按预约顺序发货。但受货源影响，可能存在终端到货延迟。"));
		remarkInfos.add(new StringBeanSet("3. 请您保持电话畅通，到货后我们将电话通知您到预约门店办理业务。如接到通知3日内未办理，本预约单将自动失效。"));
		remarkInfos.add(new StringBeanSet("4. 本预约单为后续业务办理凭证，请您妥善保管。"));
		remarkInfos.add(new StringBeanSet("5. 其他未尽事宜详询门店工作人员或致电门店联系电话。"));
		remarkInfos.add(new StringBeanSet("6. 本预约仅对拟办理中国电信iPhone 6s/ 6s Plus合约的客户有效，客户可凭此预约单在终端到货时办理中国电信iPhone 6s/ 6s Plus合约。"));
		return remarkInfos;
	}

	private List<StringBeanSet> parseDeliveryMethod(Map<String, Object> dataMap) {
		List<StringBeanSet> deliveryMethodSet = new ArrayList<StringBeanSet>();
		Map<String, Object> deliveryMethod = MapUtils.getMap(dataMap, "takeMethod");
		int index=1;
		if(null==deliveryMethod){
			return deliveryMethodSet;
		}
		Map<String,Object> takeMethod = MapUtils.getMap(deliveryMethod, "takeMethod");
		if(null!=takeMethod) {
			StringBeanSet sbs = new StringBeanSet(index++ + SysConstant.STR_POINT + getItemNameValueByMap(takeMethod));
			deliveryMethodSet.add(sbs);
		}
		Map<String,Object> takeTime = MapUtils.getMap(deliveryMethod, "takeTime");
		if(null!=takeTime) {
			StringBeanSet sbs = new StringBeanSet(index++ + SysConstant.STR_POINT + getItemNameValueByMap(takeTime));
			deliveryMethodSet.add(sbs);
		}
		Map<String,Object> takePlace = MapUtils.getMap(deliveryMethod, "takePlace");
		if(null!=takePlace) {
			StringBeanSet sbs = new StringBeanSet(index++ + SysConstant.STR_POINT + getItemNameValueByMap(takePlace));
			deliveryMethodSet.add(sbs);
		}
		Map<String,Object> payMethod = MapUtils.getMap(deliveryMethod, "payMethod");
		if(null!=payMethod) {
			StringBeanSet sbs = new StringBeanSet(index++ + SysConstant.STR_POINT + getItemNameValueByMap(payMethod));
			deliveryMethodSet.add(sbs);
		}else {
			StringBeanSet sbs = new StringBeanSet(getPayMethod(dataMap,index++));
			deliveryMethodSet.add(sbs);
		}
		return deliveryMethodSet;
	}

	private String getPayMethod(Map<String, Object> dataMap, int i) {
		String retStr = "";
		if (MapUtils.getObject(dataMap, "chargeItems") instanceof List) {
			List<Map<String, Object>> list = (List<Map<String, Object>>) MapUtils.getObject(dataMap, "chargeItems");
			if (null != list && list.size() > 0) {
				String payMethodCd = MapUtils.getString(list.get(0), "payMethodCd", "");
				String payMethod = payMethodMap.get(payMethodCd);
				if (StringUtils.isNotBlank(payMethod)) {
					retStr = i++ + SysConstant.STR_POINT + "支付方式" + SysConstant.STR_SEP + payMethod;
				}
			}
		}
		return retStr;
	}

	private Map<String, Object> parseCommonInfos(Map<String, Object> dataMap) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		// 公共信息－订单数据
		String olNbr = null;
		String staffName = null;
		String staffNumber = null;
		String channelName = null;
		String provName = null;
		String soDate = null;
		int speCustInfoLen = 0;
		Map<String, Object> orderListInfo = MapUtils.getMap(dataMap, "orderListInfo");
		if (MapUtils.isNotEmpty(orderListInfo)) {
			olNbr = MapUtils.getString(orderListInfo, "olNbr");
			staffName = MapUtils.getString(orderListInfo, "staffName");
			staffNumber = MapUtils.getString(orderListInfo, "staffNumber");
			channelName = MapUtils.getString(orderListInfo, "channelName");
			provName = MapUtils.getString(orderListInfo, "provName");
			soDate = MapUtils.getString(orderListInfo, "soDate");
			//设置半行长度，默认预设经验值14
			speCustInfoLen = MapUtils.getIntValue(orderListInfo, "speCustInfoLen", 14);
			//渠道名称超长时换行显示
//			String tmpSource = channelName;
//			String tmpResult = "";
//			int splitLen = 12;
//			int len = tmpSource.length();
//			int start = 0;
//			int end = 0;
//			for (int i = 0; i < len / splitLen + 1; i++) {
//				start = i * splitLen;
//				end = start + splitLen;
//				if (end > len) {
//					end = len;
//				}
//				tmpResult += tmpSource.substring(start, end) + "\n";
//			}
//			channelName = tmpResult;
		}
		retnMap.put("olNbr", olNbr);
		retnMap.put("staffName", staffName);
		retnMap.put("staffNumber", staffNumber);
		retnMap.put("channelName", channelName);
		retnMap.put("speCustInfoLen", speCustInfoLen);

		// 公共信息－设置标题
		if (StringUtils.isNotEmpty(provName)) {
			List<ProvNameSet> provNameSets = new ArrayList<ProvNameSet>();
			ProvNameSet nameSet = new ProvNameSet();
			nameSet.setProvName(provName);
			provNameSets.add(nameSet);
			retnMap.put("provNames", provNameSets);
		}
		// 公共信息－受理日期
		if (StringUtils.isNotEmpty(soDate)) {
			soDate = soDate.split(SysConstant.STR_SPE)[0];
			String[] dates = soDate.split(SysConstant.STR_MINUS);
			if (null != dates && dates.length == SysConstant.INT_3) {
				retnMap.put("acceYear", dates[0]);
				retnMap.put("acceMonth", dates[1]);
				retnMap.put("acceDay", dates[2]);
			}
		}
		// 公共信息－温馨提示
		List<StringBeanSet> advtInfos = new ArrayList<StringBeanSet>();
		Object advObj = dataMap.get("advInfos");
		if (advObj != null && advObj instanceof List) {
			List advtInfoList = (List) advObj;
			for (int i = 0; advtInfoList != null && i < advtInfoList.size(); i++) {
				StringBeanSet beanSet = new StringBeanSet((String)advtInfoList.get(i));
				advtInfos.add(beanSet);
			}
		}
		retnMap.put("advtInfos", advtInfos);

		return retnMap;
	}

	private List<CustInfoSet> parseCustInfos(Map<String, Object> dataMap, int speCustInfoLen) {
		List<CustInfoSet> custInfos = new ArrayList<CustInfoSet>();
		Map<String, Object> custInfoMap = MapUtils.getMap(dataMap, "custInfo");
		if (MapUtils.isNotEmpty(custInfoMap)) {
			CustInfoSet custInfoSet = new CustInfoSet();
			Object obj = MapUtils.getObject(custInfoMap, "norCustInfo");
			if (obj != null && obj instanceof List) {
				List<Map<String, Object>> tmpList = (List<Map<String, Object>>) obj;
				Map<String, Object> norCustInfo = buildCustInfoList(tmpList, speCustInfoLen);
				if(null != norCustInfo && null != norCustInfo.get("specInfoList")){
					custInfoSet.setSpeLineCInfoList((List<ItemInfoSet>) norCustInfo.get("specInfoList"));
				}
				if(null != norCustInfo && null != norCustInfo.get("cInfoList")){
					custInfoSet.setNorCInfoList((List<ItemInfoTwoSet>) norCustInfo.get("cInfoList"));
				}
				if(null != norCustInfo && null != norCustInfo.get("lineCInfoList")){
					custInfoSet.setNorLineCInfoList((List<ItemInfoSet>) norCustInfo.get("lineCInfoList"));
				}
			}
			obj = MapUtils.getObject(custInfoMap, "orgCustInfo");
			if (obj != null && obj instanceof List) {
				List<Map<String, Object>> tmpList = (List<Map<String, Object>>) obj;
				Map<String, Object> orgCustInfo = buildCustInfoList(tmpList, speCustInfoLen);
				if(null != orgCustInfo && null != orgCustInfo.get("cInfoList")){
					custInfoSet.setOrgCInfoList((List<ItemInfoTwoSet>) orgCustInfo.get("cInfoList"));
				}
				if(null != orgCustInfo && null != orgCustInfo.get("lineCInfoList")){
					custInfoSet.setOrgLineCInfoList((List<ItemInfoSet>) orgCustInfo.get("lineCInfoList"));
				}
			}
			custInfos.add(custInfoSet);
		}
		return custInfos;
	}

	private Map<String, Object> buildCustInfoList(List<Map<String, Object>> custInfoList, int speCustInfoLen) {
		Map<String, Object> retnMap = new HashMap<String, Object>();

		Map<String, Object> itemsMap = dealOneLineItems(custInfoList);
		List<Map<String, Object>> specList = null;
		List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
		List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");

		Map<String, Object> itemsNewMap = splitSpeCustInfoList(normList, speCustInfoLen);
		specList = (List<Map<String, Object>>) itemsNewMap.get("spec");
		normList = (List<Map<String, Object>>) itemsNewMap.get("norm");

		List<ItemInfoSet> specCInfoList = buildSpecCInfoList(specList);
		List<ItemInfoTwoSet> cInfoList = buildCInfoList(normList);
		List<ItemInfoSet> lineCInfoList = buildLineCInfoList(lineList);

		retnMap.put("specInfoList", specCInfoList);
		retnMap.put("cInfoList", cInfoList);
		retnMap.put("lineCInfoList", lineCInfoList);

		return retnMap;
	}

	private List<ItemInfoSet> buildSpecCInfoList(List<Map<String, Object>> specList) {
		List<ItemInfoSet> retnList = new ArrayList<ItemInfoSet>();
		for (int i = 0; specList != null && i < specList.size(); i++) {
			Map<String, Object> itemMap = specList.get(i);
			ItemInfoSet itemInfoSet = new ItemInfoSet();
			String itemName = MapUtils.getString(itemMap, "itemName");
			if (itemName != null) {
				itemName += SysConstant.STR_SEP;
			}
			itemInfoSet.setItemName(itemName);
			itemInfoSet.setItemValue(MapUtils.getString(itemMap, "itemValue"));
			retnList.add(itemInfoSet);
		}
		if (retnList.size() == 0) {
			retnList = null;
		}
		return retnList;
	}

	private List<ItemInfoTwoSet> buildCInfoList(List<Map<String, Object>> normList) {
		List<ItemInfoTwoSet> retnList = new ArrayList<ItemInfoTwoSet>();
		ItemInfoTwoSet infoTwoSet = null;
		for (int i = 0; normList != null && i < normList.size(); i++) {
			if (i % 2 == 0) {
				infoTwoSet = new ItemInfoTwoSet();
			}
			Map<String, Object> itemMap = normList.get(i);
			String itemName = MapUtils.getString(itemMap, "itemName");
			if (itemName != null) {
				itemName += SysConstant.STR_SEP;
			}
			if (i % 2 == 0) {
				infoTwoSet.setItemName0(itemName);
				infoTwoSet.setItemValue0(MapUtils.getString(itemMap, "itemValue"));
			} else {
				infoTwoSet.setItemName1(itemName);
				infoTwoSet.setItemValue1(MapUtils.getString(itemMap, "itemValue"));
			}
			if (i % 2 == 0) {
				retnList.add(infoTwoSet);
			}
		}

		if (retnList.size() == 0) {
			retnList = null;
		}
		return retnList;
	}

	private List<ItemInfoSet> buildLineCInfoList(List<Map<String, Object>> lineList) {
		List<ItemInfoSet> retnList = new ArrayList<ItemInfoSet>();
		for (int i = 0; lineList != null && i < lineList.size(); i++) {
			Map<String, Object> itemMap = lineList.get(i);
			ItemInfoSet itemInfoSet = new ItemInfoSet();
			String itemName = MapUtils.getString(itemMap, "itemName");
			if (itemName != null) {
				itemName += SysConstant.STR_SEP;
			}
			itemInfoSet.setItemName(itemName);
			itemInfoSet.setItemValue(MapUtils.getString(itemMap, "itemValue"));
			retnList.add(itemInfoSet);
		}
		if (retnList.size() == 0) {
			retnList = null;
		}
		return retnList;
	}

	private Map<String, Object> dealOneLineItems(List<Map<String, Object>> dataList) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> lineItemList = new ArrayList<Map<String,Object>>();
		for (int i = 0; i < dataList.size(); i++) {
			Map<String, Object> itemMap = dataList.get(i);
			if (validOneLineAttr(itemMap)) {
				lineItemList.add(itemMap);
			} else {
				normItemList.add(itemMap);
			}
		}
		if (normItemList.size() > 0) {
			retnMap.put("norm", normItemList);
		}
		if (lineItemList.size() > 0) {
			retnMap.put("line", lineItemList);
		}
		return retnMap;
	}

	private Map<String, Object> splitSpeCustInfoList(List<Map<String, Object>> dataList, int speCustInfoLen) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<Map<String, Object>> specItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		for (int i = 0;dataList != null && i < dataList.size(); i++) {
			Map<String, Object> itemMap = dataList.get(i);
			String itemValue = MapUtils.getString(itemMap, "itemValue");
			if (itemValue != null && getLength(itemValue) > speCustInfoLen) {
				specItemList.add(itemMap);
			} else {
				normItemList.add(itemMap);
			}
		}
		retnMap.put("spec", specItemList);
		retnMap.put("norm", normItemList);
		return retnMap;
	}

	/**
	 * 获取字符显示长度，中文记一个长度，非中文记半个长度
	 * @param itemValue 要计算的字符串
	 * @return 显示长度
	 */
	private double getLength(String itemValue) {
		String chinese = "[^\\x00-\\xff]";
		double retValue=0;
		if(StringUtils.isBlank(itemValue)) {
			return 0;
		}
		for (int i = 0; i < itemValue.length(); i++) {
			String s = itemValue.substring(i, i + 1);
			if (s.matches(chinese)){
				retValue+=1;
			}else{
				retValue+=0.5;
			}
		}
		return Math.ceil(retValue);
	}


	private boolean validOneLineAttr(Map<String, Object> itemMap) {
		String isAloneLine = MapUtils.getString(itemMap, "isAloneLine");
		if (SysConstant.STR_Y.equals(isAloneLine)) {
			return true;
		}
		return false;
	}

	private List<Map<String, Object>> mergeAcceNbrToServ(List<Map<String, Object>> orderEventList) {
		List<Map<String, Object>> servEventList = new ArrayList<Map<String, Object>>();
		//找出orderEventType为3，boActionTypeCd为7的节点，它们是服务变更节点，再进行合并
		for (int i = 0; i < orderEventList.size(); ) {
			Map<String, Object> event = orderEventList.get(i);
			String orderEventType = MapUtils.getString(event, "orderEventType", "");
			Map<String, Object> orderEventTitle = (Map<String, Object>) event.get("orderEventTitle");
			String boActionTypeCd = MapUtils.getString(orderEventTitle, "boActionTypeCd", "");
			if ("3".equals(orderEventType) && "7".equals(boActionTypeCd)) {
				servEventList.add(event);
				orderEventList.remove(i);
			} else {
				i++;
			}
		}
		//合并号码
		for (int i = 0; i < servEventList.size() - 1; i++) {
			Map<String, Object> eventA = servEventList.get(i);
			List<Map<String, Object>> eventContListA = (List<Map<String, Object>>) eventA.get("orderEventCont");
			for (int j = 0; j < eventContListA.size(); j++) {
				Map<String, Object> eventContA = eventContListA.get(j);
				String objIdA = MapUtils.getString(eventContA, "objId", "");
				String relaAcceNbrA = MapUtils.getString(eventContA, "relaAcceNbr", "");

				for (int k = 1; k < servEventList.size(); ) {
					Map<String, Object> eventB = servEventList.get(k);
					List<Map<String, Object>> eventContListB = (List<Map<String, Object>>) eventB.get("orderEventCont");
					for (int m = 0; m < eventContListB.size(); m++) {
						Map<String, Object> eventContB = eventContListB.get(m);
						String objIdB = MapUtils.getString(eventContB, "objId", "");
						String relaAcceNbrB = MapUtils.getString(eventContB, "relaAcceNbr", "");
						//如果objId相同，则把relaAcceNbr拼接
						if (objIdA.equals(objIdB)) {
							relaAcceNbrA = relaAcceNbrA + "、" + relaAcceNbrB;
							eventContA.put("relaAcceNbr", relaAcceNbrA);
							eventContListB.remove(m);
							break;
						}
					}
					if (eventContListB.size() == 0) {
						servEventList.remove(k);
					} else {
						k++;
					}
				}
				//如果relaAcceNbrA有经过拼接
				if (!relaAcceNbrA.equals(MapUtils.getString(eventContA, "relaAcceNbr", ""))) {
					eventContListA.set(j, eventContA);
				}
			}
			eventA.put("orderEventCont", eventContListA);
		}
		//加入到原来列表
		if (servEventList.size() > 0) {
			orderEventList.addAll(servEventList);
		}

		return orderEventList;
	}


	private List<Map<String, Object>> mergeAcceNbrToServ_V2(List<Map<String, Object>> orderEventList) {
		List<Map<String, Object>> servEventList = new ArrayList<Map<String, Object>>();
		//找出orderEventType为3，boActionTypeCd为7的节点，它们是服务变更节点，再进行合并
		for (int i = orderEventList.size()-1; i >0 ; i--) {
			Map<String, Object> event = orderEventList.get(i);
			String orderEventType = MapUtils.getString(event, "orderEventType", "");
			Map<String, Object> orderEventTitle = (Map<String, Object>) event.get("orderEventTitle");
			String boActionTypeCd = MapUtils.getString(orderEventTitle, "boActionTypeCd", "");
			if ("3".equals(orderEventType) && "7".equals(boActionTypeCd)) {
				servEventList.add(event);
				orderEventList.remove(i);
			}
		}
		//合并号码
		Map<String, Map<String, Object>> mergeMap = new HashMap<String, Map<String, Object>>();

		for (int i = 0; i < servEventList.size(); i++) {
			Map<String, Object> event = servEventList.get(i);
			List<Map<String, Object>> eventContList = (List<Map<String, Object>>) event.get("orderEventCont");

			for (int j = 0; j < eventContList.size(); j++) {
				Map<String, Object> eventCont = eventContList.get(j);
				String objId = MapUtils.getString(eventCont, "objId", "");
				String currentRelaAcceNbr = MapUtils.getString(eventCont, "relaAcceNbr", "");
				if(mergeMap.containsKey(objId)) {
					Map<String, Object> map = mergeMap.get(objId);
					String relaAcceNbr = MapUtils.getString(map, "relaAcceNbr", "");
					relaAcceNbr = relaAcceNbr + SysConstant.STR_PAU + currentRelaAcceNbr;
					map.put("relaAcceNbr",relaAcceNbr);
				}else{
					mergeMap.put(objId,eventCont);
				}
			}
		}

		Map<String, Object> newMap = null;
		if (null != servEventList && servEventList.size() > 0) {
			newMap = servEventList.get(0);
			List<Map<String, Object>> newEventContList = new ArrayList<Map<String, Object>>();
			newEventContList.addAll(mergeMap.values());
			newMap.put("orderEventCont", newEventContList);
			//加入到原来列表
			orderEventList.add(newMap);
		}


		return orderEventList;
	}

	private List<OrderEventSet> parseOrderEvents(Map<String, Object> dataMap, int speCustInfoLen) {
		List<OrderEventSet> orderEventSets = new ArrayList<OrderEventSet>();
		if (dataMap.containsKey("orderEvent")) {

			List<Map<String, Object>> orderEventList = (List<Map<String, Object>>) dataMap.get("orderEvent");
			orderEventList = dealOrderEventSeq(orderEventList);
			orderEventList = dealOrderEvent6Seq(orderEventList);

			//20140715 处理多个产品时合并展示接入号码的需求
			//1）[开通]xxxx功能(号码：xxxxxxxxxxx ，xxxxxxxxxxx)；（xx小时内生效）；xx元/月 ；  （多号码可并列）
			orderEventList = mergeAcceNbrToServ(orderEventList);

			int eventSize = orderEventList.size();
			boolean attachFlag = false;
			Map<String, Object> finalAttachMap = new HashMap<String, Object>();
			for (int i = 0; i < eventSize; i++) {
				Map<String, Object> event = orderEventList.get(i);
				OrderEventSet set = null;
				String orderEventType = MapUtils.getString(event, "orderEventType", "0");
				if ("1".equals(orderEventType)) {
					finalAttachMap = getAttachForMain(event, 1, orderEventList);
					List<Map<String, Object>> list = (List<Map<String, Object>>) finalAttachMap.get("attachOneList");
					if (list != null && list.size() > 0) {
						attachFlag = true;
					}
				}
			}


			int orderEventSeq = 1;
			for (int i = 0; i < eventSize; i++) {
				Map<String, Object> event = orderEventList.get(i);
				OrderEventSet set = null;
				String orderEventType = MapUtils.getString(event, "orderEventType", "0");
				if ("1".equals(orderEventType)) {
					set = buildOrderEvent_1(event, orderEventSeq, eventSize, orderEventList);
				} else if ("2".equals(orderEventType)) {
					set = buildOrderEvent_2(event, orderEventSeq, eventSize);
				} else if ("3".equals(orderEventType)) {
					set = buildOrderEvent_3(event, orderEventSeq, eventSize, attachFlag,(List<Map<String, Object>>)finalAttachMap.get("attachThreeList"));
				} else if ("4".equals(orderEventType)) {
					set = buildOrderEvent_4(event, orderEventSeq, eventSize);
				} else if ("5".equals(orderEventType)) {
					if (count == 1 && orderEventSeq != 1) {
						orderEventSeq--;
					}
					set = buildOrderEvent_5(event, orderEventSeq, eventSize, speCustInfoLen, attachFlag);
				} else if ("6".equals(orderEventType)) {
					set = buildOrderEvent_6(event, orderEventSeq, eventSize);
				}else if("8".equals(orderEventType)){
					set = buildOrderEvent_8(event, orderEventSeq, eventSize);
				}

				if (set != null) {
					orderEventSets.add(set);
					orderEventSeq++;
				}
			}
		}
		List temp = new ArrayList();
		if(count > 1){
			for(OrderEventSet orderEventSet :  orderEventSets){
				if(orderEventSet != null &&  orderEventSet.getProdChangeList() != null &&  orderEventSet.getProdChangeList().size() > 0){
					for(OEProdChangeSet change :  orderEventSet.getProdChangeList()){
						if(change != null &&  change.getProdChangeTitle() != null &&  change.getProdChangeTitle().size() > 0){
							for(StringBeanSet set : change.getProdChangeTitle()){
								if(set.getStrBean() != null && set.getStrBean().indexOf("加装手机") !=-1 && count > 1){
									temp.add(orderEventSet);
									count -- ;
								}
							}
						}
					}
				}
			}
		}
		if(temp.size() > 0){
			orderEventSets.removeAll(temp);
		}
		//重置全局变量（原因：spring只实例化一个实例，并非每次都生成新实例）
		count = 0;
		comment = "";
		return orderEventSets;
	}

	/**
	 * 调整OrderEvent中数据的顺序，把合约计划放在第一个
	 * @param eventList
	 * @return
	 */
	private List<Map<String, Object>> dealOrderEventSeq(List<Map<String, Object>> eventList) {
		if (eventList == null) {
			return new ArrayList<Map<String,Object>>();
		}
		if (eventList.size() <= 1) {
			return eventList;
		}
		for (int i = 0; i < eventList.size(); i++) {
			Map<String, Object> event = eventList.get(i);
			String orderEventType = MapUtils.getString(event, "orderEventType");
			if ("2".equals(orderEventType)) {
				eventList.remove(i);
				eventList.add(0, event);
			}
		}
		return eventList;
	}

	/**
	 * orderEventType 6 顺序处理
	 * @param eventList
	 * @return
	 */
	private List<Map<String, Object>> dealOrderEvent6Seq(List<Map<String, Object>> eventList) {
		if (eventList == null) {
			return new ArrayList<Map<String,Object>>();
		}
		if (eventList.size() <= 1) {
			return eventList;
		}
		List<Map<String, Object>> listTmp=new ArrayList<Map<String,Object>>();
		for (int i = 0; i < eventList.size(); i++) {
			Map<String, Object> event = eventList.get(i);
			String orderEventType = MapUtils.getString(event, "orderEventType");
			if ("6".equals(orderEventType)) {
				listTmp.add(event);
			}
		}
		for (int i = 0; i < listTmp.size(); i++) {
			Map<String, Object> event = listTmp.get(i);
			eventList.remove(event);
		}
		eventList.addAll(listTmp);
		return eventList;
	}

	private Map<String, Object> getAttachForMain(Map<String, Object> event, int orderSeq, List<Map<String, Object>> orderEventList) {
		//判断是否存在叠加包  BEGIN
//		有叠加包的情况：
//		1、订购了套餐外的可选包
//			规则：orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> offerInfos存在
//			并且offerInfo中的attachOfferInfos中的itemType为1。如果为2是积木套餐流量模块，为3是积木套餐语音模块
//		2、存在加装手机或加装
//			规则：
//		3、订购了套餐外的功能产品
//			规则： orderEventType为3的附属销售品[订购、续订、变更、退订]，主销售品[退订、注销] 中，
//				    找orderEventTitle -> boActionTypeCd为7的功能产品，从中过滤掉
//				  orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> servInfos的功能产品，
//				    再过滤掉orderEventCont -> userAcceNbrs -> [x] -> donateItems中的赠送类
//				    剩下的如果存在，就是有订购套餐外功能产品
		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
		boolean attachFlag = false;
		Map<String, Object> finalAttachMap = new HashMap<String, Object>();
		List<Map<String, Object>> attachOneList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> attachTwoList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> attachThreeList = new ArrayList<Map<String,Object>>();
		// seq 1
		Map<String, Object> osAttachInfos = MapUtils.getMap(contMap, "osAttachInfos");
		if (MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> offerInfos = (List<Map<String, Object>>) osAttachInfos.get("offerInfos");
			List<Map<String, Object>> tmpOffers = new ArrayList<Map<String,Object>>();
			List<Map<String, Object>> blockOffers = new ArrayList<Map<String,Object>>();
			if (offerInfos != null && offerInfos.size() > 0) {
				//20140703 offerInfo中的attachOfferInfos中的itemType为1。如果为2是积木套餐流量模块，为3是积木套餐语音模块
				for (int i = 0; i < offerInfos.size(); i++) {
					Map<String, Object> tmpOffer = offerInfos.get(i);
					boolean flag = true;
					if (tmpOffer.containsKey("attachOfferInfos")) {
						List<Map<String, Object>> attachOfferInfos = (List<Map<String, Object>>) tmpOffer.get("attachOfferInfos");
						for (int j = 0; j < attachOfferInfos.size(); j++) {
							Map<String, Object> aoInfo = attachOfferInfos.get(j);
							String itemTypeId = MapUtils.getString(aoInfo, "itemTypeId", "");
							if (StringUtils.isNotEmpty(itemTypeId) && !"1".equals(itemTypeId)) {
								tmpOffer.put("itemTypeId", itemTypeId);
								flag = false;
								break;
							}
						}
					}
					if (flag) {
						tmpOffers.add(tmpOffer);
					} else {
						blockOffers.add(tmpOffer);
					}
				}
				attachOneList.addAll(tmpOffers);
				//如果有blockOffers，说明存在流量模块或语音模块
				if (blockOffers.size() > 0) {
					//排序，先语音模块，后流量模块
					for (int i = 0; i < blockOffers.size(); i++) {
						Map<String, Object> blockOfferMap = blockOffers.get(i);
						String itemTypeId = MapUtils.getString(blockOfferMap, "itemTypeId", "");
						//语音模块不在第一位，则和第一位交换
						if ("2".equals(itemTypeId) && i >= 1) {
							Map<String, Object> flowMap = blockOffers.get(0);
							blockOffers.set(0, blockOfferMap);
							blockOffers.set(i, flowMap);
							break;
						}
					}
					finalAttachMap.put("blockOffers", blockOffers);
				}
			}
		}
		// seq 2
		List<Map<String, Object>> userAcceNbrs = (List<Map<String, Object>>) contMap.get("userAcceNbrs");
		if (userAcceNbrs != null && userAcceNbrs.size() > 0) {
			for (int i = 0; i < userAcceNbrs.size(); i++) {
				Map<String, Object> userAcceNbrMap = userAcceNbrs.get(i);
				String memberRoleCd = MapUtils.getString(userAcceNbrMap, "memberRoleCd", "");
				//如果是401加装移动电话（天翼副卡）或501加装无线宽带
				if ("401".equals(memberRoleCd) || "501".equals(memberRoleCd)) {
					attachTwoList.add(userAcceNbrMap);
				}
			}
		}
		// seq 3
		List<String> servObjIdList = new ArrayList<String>();
		if (MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> servInfos = (List<Map<String, Object>>) osAttachInfos.get("servInfos");
			for (int i = 0; servInfos != null && i < servInfos.size(); i++) {
				Map<String, Object> tmpServInfoMap = servInfos.get(i);
				servObjIdList.add(MapUtils.getString(tmpServInfoMap, "objId", "-1"));
			}
		}
		List<String> donateList = new ArrayList<String>();
		if (userAcceNbrs != null && userAcceNbrs.size() > 0) {
			for (int i = 0; i < userAcceNbrs.size(); i++) {
				Map<String, Object> userAcceNbrMap = userAcceNbrs.get(i);
				String acceNbr = (String) userAcceNbrMap.get("acceNbr");
				List<Map<String, Object>> donateItems = (List<Map<String, Object>>) userAcceNbrMap.get("donateItems");
				for (int j = 0; donateItems != null && j < donateItems.size(); j++) {
					String objId = MapUtils.getString(donateItems.get(j), "objId", "");
					donateList.add(objId + "-" + acceNbr);
				}
			}
		}
		for (int i = 0; i < orderEventList.size(); i++) {
			Map<String, Object> tmpOrderEventMap = orderEventList.get(i);
			String orderEventType = MapUtils.getString(tmpOrderEventMap, "orderEventType", "");
			if ("3".equals(orderEventType)) {
				Map<String, Object> tmpTitleMap = MapUtils.getMap(tmpOrderEventMap, "orderEventTitle");
				String boActionTypeCd = MapUtils.getString(tmpTitleMap, "boActionTypeCd", "");
				if ("7".equals(boActionTypeCd)) {
					List<Map<String, Object>> tmpContList = (List<Map<String, Object>>) tmpOrderEventMap.get("orderEventCont");
					for (int j = 0; tmpContList != null && j < tmpContList.size(); j++) {
						Map<String, Object> tmpContMap = tmpContList.get(j);
						String tmpObjId = MapUtils.getString(tmpContMap, "objId", "");
						String relaAcceNbr = MapUtils.getString(tmpContMap, "relaAcceNbr", "");
						if (!servObjIdList.contains(tmpObjId) && !filterProd(tmpObjId) && !donateList.contains(tmpObjId + "-" + relaAcceNbr)) {
							attachThreeList.add(tmpContMap);
						}
					}
				}
			}
		}

		if (attachOneList.size() > 0 || attachTwoList.size() > 0 || attachThreeList.size() > 0) {
			attachFlag = true;
			// 设置业务信息_主销售品_叠加包
			finalAttachMap.put("attachOneList", attachOneList);
			finalAttachMap.put("attachTwoList", attachTwoList);
			finalAttachMap.put("attachThreeList", attachThreeList);
		}
		//判断是否存在叠加包  END
		return finalAttachMap;
	}


	/**
	 * 组装－业务信息_主销售品订购
	 * @param event
	 * @param orderSeq
	 * @param eventSize
	 * @return
	 */
	private OrderEventSet buildOrderEvent_1(Map<String, Object> event, int orderSeq, int eventSize, List<Map<String, Object>> orderEventList) {
		if (event == null) {
			return null;
		}
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置业务信息_分隔线
		if(orderSeq <= eventSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}

		// 设置业务信息_主销售品
		List<OEMainOfferSet> mainOfferList = new ArrayList<OEMainOfferSet>();
		OEMainOfferSet oeMainOfferSet = new OEMainOfferSet();

		//判断是否存在叠加包  BEGIN
//		有叠加包的情况：
//		1、订购了套餐外的可选包
//			规则：orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> offerInfos存在
//		2、存在加装手机或加装
//			规则：
//		3、订购了套餐外的功能产品
//			规则： orderEventType为3的附属销售品[订购、续订、变更、退订]，主销售品[退订、注销] 中，
//				    找orderEventTitle -> boActionTypeCd为7的功能产品，从中过滤掉
//				  orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> servInfos的功能产品，
//				    剩下的如果存在，就是有订购套餐外功能产品
		boolean attachFlag = false;
		boolean blockFlag = false;
		Map<String, Object> finalAttachMap = getAttachForMain(event, orderSeq, orderEventList);
		if (MapUtils.isNotEmpty(finalAttachMap)) {
			attachFlag = true;
			// 设置业务信息_主销售品_叠加包
			List<OSAttachOfferSet> osAttachOfferList = new ArrayList<OSAttachOfferSet>();

			List<Map<String, Object>> list = (List<Map<String, Object>>) finalAttachMap.get("attachOneList");
			OSAttachOfferSet attachOfferSet = null;
			if (list != null && list.size() > 0) {
				attachOfferSet = buildOE_1_AttachOffer_New(1, finalAttachMap);
			}


			if (attachOfferSet != null) {
				osAttachOfferList.add(attachOfferSet);
				oeMainOfferSet.setOsAttachOfferList(osAttachOfferList);
			}
			if (finalAttachMap.containsKey("blockOffers")) {
				blockFlag = true;
			}
		}
		//判断是否存在叠加包  END

		//判断是否存在合约 BEGIN
		Map<String, Object> tmpEvent = orderEventList.get(0);
		//如果第一个是合约的
		boolean agreementFlag = false;
		if ("2".equals(MapUtils.getString(tmpEvent, "orderEventType", ""))) {
			agreementFlag = true;
		}
		//判断是否存在合约 END


		// 设置业务信息_主销售品_标题
		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
		if (event.containsKey("orderEventTitle")) {
			List<StringBeanSet> strList = new ArrayList<StringBeanSet>();
			String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
			String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
			String effectRule = MapUtils.getString(titleMap, "effectRule", "");
			String attachOfferPkg = MapUtils.getString(titleMap, "attachOfferPkg", "");
			String attachOfferSpecName = MapUtils.getString(titleMap, "attachOfferSpecName", "");

			StringBeanSet strBean = buildOE_1_Title_New(eventSize, orderSeq, boActionTypeName, prodSpecName, effectRule, attachOfferPkg, attachOfferSpecName, attachFlag, agreementFlag);
//			StringBeanSet strBean = buildOE_1_Title(eventSize, orderSeq, boActionTypeName, prodSpecName, effectRule, attachOfferPkg, attachOfferSpecName);
			strList.add(strBean);
			oeMainOfferSet.setMainOfferTitle(strList);
		}
		// 设置业务信息_主销售品_内容
		if (event.containsKey("orderEventCont")) {
			int busiOrderSeq = 1;

			String mainDonateStr = "";
			// 设置业务信息_主销售品_接入号码
			List<AcceNbrNewSet> acceNbrNewList = new ArrayList<AcceNbrNewSet>();
			if (contMap != null && contMap.containsKey("userAcceNbrs")) {
				List<Map<String, Object>> userAcceNbrs = (List<Map<String, Object>>) contMap.get("userAcceNbrs");
				AcceNbrNewSet acceNbrNewSet = buildOE_1_AcceNbrNew(busiOrderSeq, userAcceNbrs);
				if(null != acceNbrNewSet){
					busiOrderSeq ++;

					acceNbrNewList.add(acceNbrNewSet);

					oeMainOfferSet.setAcceNbrNewList(acceNbrNewList);
				}

				//判断主卡是否有赠送类提示
				for (int i = 0; i < userAcceNbrs.size(); i++) {
					Map<String, Object> userAcceNbrMap = userAcceNbrs.get(i);
					String memberRoleCd = MapUtils.getString(userAcceNbrMap, "memberRoleCd", "");
					String donateValue = MapUtils.getString(userAcceNbrMap, "donateValue", "");
					if ("400".equals(memberRoleCd)) {
						mainDonateStr = donateValue;
					} else if ("401".equals(memberRoleCd) || "501".equals(memberRoleCd)) {

					} else {
						mainDonateStr = donateValue;
					}
				}
			}
			//如果是积木套餐，则显示语音模块和流量模块
			if (blockFlag) {
				List<Map<String, Object>> blockOffers = (List<Map<String, Object>>) finalAttachMap.get("blockOffers");

				for (int i = 0; i < blockOffers.size(); i++) {
					Map<String, Object> offerMap = blockOffers.get(i);
					String itemTypeId = MapUtils.getString(offerMap, "itemTypeId", "");
					if ("2".equals(itemTypeId)) {
						// 设置业务信息_主销售品_积木套餐语音模块
						List<OSBaseInfoSet> osBaseInfoSets = new ArrayList<OSBaseInfoSet>();
						OSBaseInfoSet osBaseInfoSet =
								buildOE_1_OSInfo_block(busiOrderSeq, offerMap);
						if (osBaseInfoSet != null) {
							busiOrderSeq++;
							osBaseInfoSets.add(osBaseInfoSet);
							oeMainOfferSet.setOsBaseInfoList(osBaseInfoSets);
						}
					} else if ("3".equals(itemTypeId)) {
						// 设置业务信息_主销售品_积木套餐流量模块
						List<OSBaseInfoSet> osOutInfoList = new ArrayList<OSBaseInfoSet>();
						OSBaseInfoSet outInfoSet =
								buildOE_1_OSInfo_block(busiOrderSeq, offerMap);
						if (outInfoSet != null) {
							busiOrderSeq++;
							osOutInfoList.add(outInfoSet);
							oeMainOfferSet.setOsOutInfoList(osOutInfoList);
						}
					}
				}

			} else {
				// 设置业务信息_主销售品_套餐月基本费
				List<OSBaseInfoSet> osBaseInfoSets = new ArrayList<OSBaseInfoSet>();
				if (contMap != null && contMap.containsKey("osBaseInfo")) {
					OSBaseInfoSet osBaseInfoSet =
							buildOE_1_OSInfo(busiOrderSeq, SysConstant.OS_INFO_IN,
									(List<Map<String, Object>>) contMap.get("osBaseInfo"));
					if (osBaseInfoSet != null) {
						busiOrderSeq++;
						osBaseInfoSets.add(osBaseInfoSet);
						oeMainOfferSet.setOsBaseInfoList(osBaseInfoSets);
					}
				}
				// 设置业务信息_主销售品_套餐超出资费
				List<OSBaseInfoSet> osOutInfoList = new ArrayList<OSBaseInfoSet>();
				if (contMap != null && contMap.containsKey("osOutInfos")) {
					OSBaseInfoSet outInfoSet =
							buildOE_1_OSInfo(busiOrderSeq, SysConstant.OS_INFO_OUT,
									(List<Map<String, Object>>) contMap.get("osOutInfos"));
					if (outInfoSet != null) {
						busiOrderSeq++;
						osOutInfoList.add(outInfoSet);
						oeMainOfferSet.setOsOutInfoList(osOutInfoList);
					}
				}
			}
			//判断是否有赠送类，有的话设置到套餐月基本费的赠送中
			if (StringUtils.isNotEmpty(mainDonateStr) && !blockFlag) {
				 List<OSBaseInfoSet> osBaseInfoList = oeMainOfferSet.getOsBaseInfoList();
				 OSBaseInfoSet osBaseInfo = osBaseInfoList.get(0);
				 List<StringBeanSet> donateList = new ArrayList<StringBeanSet>();
				 StringBeanSet donateBean = new StringBeanSet(mainDonateStr);
				 donateList.add(donateBean);
				 osBaseInfo.setDonateOSBaseInfos(donateList);
				 osBaseInfoList.set(0, osBaseInfo);
				 oeMainOfferSet.setOsBaseInfoList(osBaseInfoList);
			}


			// 设置业务信息_主销售品_订购当月资费
			List<OSOrderInfoSet> osOrderInfoList = new ArrayList<OSOrderInfoSet>();
			String currMouthPrice = null;
			if (contMap != null && contMap.containsKey("activateOrderDesc")) {
				currMouthPrice = MapUtils.getString(contMap, "activateOrderDesc");
			} else if (contMap != null && contMap.containsKey("osOrderInfo")) {
				currMouthPrice = MapUtils.getString(contMap, "osOrderInfo");
			}
			if (StringUtils.isNotBlank(currMouthPrice)) {
				OSOrderInfoSet orderInfoSet = buildOE_1_OrderInfo(busiOrderSeq, currMouthPrice);
				if (orderInfoSet != null) {
					busiOrderSeq++;
					osOrderInfoList.add(orderInfoSet);
					oeMainOfferSet.setOsOrderInfoList(osOrderInfoList);
				}
			}
			// 设置业务信息_主销售品_其它说明
			List<OSOtherInfoSet> osOtherInfoList = new ArrayList<OSOtherInfoSet>();
			if (contMap != null && contMap.containsKey("osOtherInfo")) {
				OSOtherInfoSet otherInfoSet = buildOE_1_OtherInfo(busiOrderSeq,
						(List<Map<String, Object>>) contMap.get("osOtherInfo"));
				if(otherInfoSet != null){
					busiOrderSeq ++;
					osOtherInfoList.add(otherInfoSet);
					oeMainOfferSet.setOsOtherInfoList(osOtherInfoList);
				}
			}
			// 设置业务信息_主销售品_套餐优惠
			List<OSPrompInfoSet> osPrompInfoList = new ArrayList<OSPrompInfoSet>();
			if (contMap != null) {
				OSPrompInfoSet prompInfoSet = buildOE_1_PrompInfo_New(busiOrderSeq, contMap);
				if(null != prompInfoSet){
					busiOrderSeq ++;
					osPrompInfoList.add(prompInfoSet);
					oeMainOfferSet.setOsPrompInfoList(osPrompInfoList);
				}
			}
			// 设置业务信息_主销售品_叠加包
//			List<OSAttachOfferSet> osAttachOfferList = new ArrayList<OSAttachOfferSet>();
//			if(contMap != null && contMap.containsKey("osAttachInfos")){
//				OSAttachOfferSet attachOfferSet = buildOE_1_AttachOffer(busiOrderSeq,
//						(Map<String, Object>) contMap.get("osAttachInfos"));
//
//				if (attachOfferSet != null) {
//					osAttachOfferList.add(attachOfferSet);
//					oeMainOfferSet.setOsAttachOfferList(osAttachOfferList);
//				}
//			}
		}

		mainOfferList.add(oeMainOfferSet);
		orderEvent.setMainOfferList(mainOfferList);
		return orderEvent;
	}

	private StringBeanSet buildOE_1_Title_New(int tolNbr, int seq, String boActionTypeName,
			String offerSpecName, String effectRule, String attachOfferPkg,
			String attachOfferSpecName, boolean attachFlag, boolean agreementFlag) {
		StringBeanSet strBean = new StringBeanSet();
		String titleStr = "";
		//20140408 注释以下判断，使得订购主销售品前面不加上序号
//		if(tolNbr != SysConstant.INT_1){
//			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
//		}
		titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
//		if (agreementFlag) {
//			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
//		}

		titleStr += StringUtils.isEmpty(boActionTypeName) ? "" :
			(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
		titleStr += StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName;

		if (attachFlag) {
			titleStr += SysConstant.STR_ENT + SysConstant.STR_SPE + "套餐" + SysConstant.STR_SPE + SysConstant.STR_SPE;
//			titleStr += SysConstant.STR_ENT + SysConstant.STR_SPE + SysConstant.STR_SPE + "套餐" + SysConstant.STR_SPE + SysConstant.STR_SPE;
		}

		titleStr += StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
//		titleStr += StringUtils.isEmpty(attachOfferSpecName) ? "" :
//			(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + attachOfferSpecName + SysConstant.STR_RL_BRE);

		strBean.setStrBean(titleStr);

		return strBean;
	}

	private StringBeanSet buildOE_1_Title(int tolNbr, int seq, String boActionTypeName,
			String offerSpecName, String effectRule, String attachOfferPkg,
			String attachOfferSpecName) {
		StringBeanSet strBean = new StringBeanSet();
		String titleStr = "";
		//20140408 注释以下判断，使得订购主销售品前面不加上序号
//		if(tolNbr != SysConstant.INT_1){
//			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
//		}

		titleStr += StringUtils.isEmpty(boActionTypeName) ? "" :
			(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
		titleStr += StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName;

		if (SysConstant.STR_Y.equals(attachOfferPkg)) {
			titleStr += SysConstant.STR_ENT + SysConstant.STR_SPE + SysConstant.STR_SPE + "套餐" + SysConstant.STR_SPE + SysConstant.STR_SPE;
		}

		titleStr += StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
		titleStr += StringUtils.isEmpty(attachOfferSpecName) ? "" :
			(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + attachOfferSpecName + SysConstant.STR_RL_BRE);

		strBean.setStrBean(titleStr);

		return strBean;
	}

	private AcceNbrNewSet buildOE_1_AcceNbrNew(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null) {
			return null;
		}
		AcceNbrNewSet newSet = new AcceNbrNewSet();
		// 设置接入号码头
		List<StringBeanSet> strBeanList = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet(orderSeq + SysConstant.STR_PAU + "用户号码" + SysConstant.STR_SEP);
		strBeanList.add(strBean);
		newSet.setAcceNbrTitle(strBeanList);

		// 设置产品属性内容
		List<OfferProdAttrsSet> offerProdInfos = new ArrayList<OfferProdAttrsSet>();
		for (int i = 0; i < paramList.size(); i++) {
			Map<String, Object> offerProdAttrMap = paramList.get(i);
			OfferProdAttrsSet offerProdAttrsSet = new OfferProdAttrsSet();

			// 展示产品接入号
			List<StringBeanSet> acceList = new ArrayList<StringBeanSet>();
			String acceType = "";
			String acceNbr = "";
			String userType = "";
			String userParam = "";
			if (offerProdAttrMap.containsKey("acceType")) {
				acceType = MapUtils.getString(offerProdAttrMap, "acceType");
			}
			if (offerProdAttrMap.containsKey("acceNbr")) {
				acceNbr = MapUtils.getString(offerProdAttrMap, "acceNbr");
			}
			if (offerProdAttrMap.containsKey("userType")) {
				userType = MapUtils.getString(offerProdAttrMap, "userType");
			}
			if (offerProdAttrMap.containsKey("userParam")) {
				userParam = MapUtils.getString(offerProdAttrMap, "userParam");
			}
			String memberRoleCd = MapUtils.getString(offerProdAttrMap, "memberRoleCd", "");
			StringBeanSet acceBean = new StringBeanSet();
			String str = "";
			if ("400".equals(memberRoleCd)) {
				str = "手机号码" + SysConstant.STR_SEP + buildOE_1_AcceNbr_Value(acceNbr, userType, userParam) + "（主卡标识）";
			} else if ("401".equals(memberRoleCd) || "501".equals(memberRoleCd)) {

			} else {
				str = buildOE_1_AcceNbr_Name(acceType) + buildOE_1_AcceNbr_Value(acceNbr, userType, userParam);
			}
			acceBean.setStrBean(str);
			acceList.add(acceBean);
			offerProdAttrsSet.setAcceNbrInfo(acceList);

			// 展示产品属性
			if (offerProdAttrMap.containsKey("offerProdAttrs")) {
				List<Map<String, Object>> offerProdAttrs = (List<Map<String, Object>>) offerProdAttrMap.get("offerProdAttrs");
				Map<String, Object> itemsMap = dealOneLineItems(offerProdAttrs);
				if (MapUtils.isNotEmpty(itemsMap)) {
					List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
					List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
					if (normList != null && normList.size() > 0) {
						List<ItemInfoTwoNewSet> norOfferProdInfos = new ArrayList<ItemInfoTwoNewSet>();
						ItemInfoTwoNewSet itemTwo = null;
						for (int j = 0; j < normList.size(); j++) {
							if (j % 2 == 0) {
								itemTwo = new ItemInfoTwoNewSet();
							}
							Map<String, Object> normMap = normList.get(j);
							String itemName = MapUtils.getString(normMap, "itemName", "");
							String itemValue = MapUtils.getString(normMap, "itemValue", "");
							// 设置类属性
							if (j % 2 == 0) {
								itemTwo.setItemInfo1(itemName + SysConstant.STR_SEP + itemValue);
							} else {
								itemTwo.setItemInfo2(itemName + SysConstant.STR_SEP + itemValue);
							}
							if (j % 2 != 0) {
								norOfferProdInfos.add(itemTwo);
							}
						}
						if (norOfferProdInfos.size() > 0) {
							offerProdAttrsSet.setNorOfferProdInfos(norOfferProdInfos);
						}
					}
					if (lineList != null && lineList.size() > 0) {
						List<StringBeanSet> lineOfferProdInfos = new ArrayList<StringBeanSet>();
						for (int j = 0; j < lineList.size(); j++) {
							Map<String, Object> lineMap = lineList.get(j);
							String itemName = MapUtils.getString(lineMap, "itemName", "");
							String itemValue = MapUtils.getString(lineMap, "itemValue", "");
							StringBeanSet lineBean = new StringBeanSet();
							lineBean.setStrBean(itemName + SysConstant.STR_SEP + itemValue);
							lineOfferProdInfos.add(lineBean);
						}
						if (lineOfferProdInfos.size() > 0) {
							offerProdAttrsSet.setLineOfferProdInfos(lineOfferProdInfos);
						}
					}
				}
			}
			offerProdInfos.add(offerProdAttrsSet);
		}
		newSet.setOfferProdInfos(offerProdInfos);
		return newSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_接入号－名称
	 * @param acceNbr
	 * @param userType
	 * @param userParam
	 * @return
	 */
	private String buildOE_1_AcceNbr_Name(String acceType){
		return (StringUtils.isEmpty(acceType) ? "" : acceType + SysConstant.STR_SEP);
	}
	/**
	 * 组装－业务信息_主销售品_内容_接入号－参数
	 * @param acceNbr
	 * @param userType
	 * @param userParam
	 * @return
	 */
	private String buildOE_1_AcceNbr_Value(String acceNbr, String userType, String userParam){
		return (StringUtils.isEmpty(acceNbr) ? "" : acceNbr)
			+ (StringUtils.isEmpty(userType) ? "" : SysConstant.STR_LL_BRE + userType + SysConstant.STR_RL_BRE)
			+ (StringUtils.isEmpty(userParam) ? "" : userParam);
	}

	private OSBaseInfoSet buildOE_1_OSInfo(int orderSeq, int osInfoType, List<Map<String, Object>> paramList) {
		if (paramList == null || paramList.size() == 0) {
			return null;
		}
		OSBaseInfoSet osBaseInfoSet = new OSBaseInfoSet();

		// 设置套餐月基本费头
		List<StringBeanSet> baseInfoTitles = new ArrayList<StringBeanSet>();
		StringBeanSet baseInfoTitleSet = new StringBeanSet();
		String titleStr = "";
		//遍历paramList，找出其中itemName为套餐月租费的项，取其中的金额
		if (SysConstant.OS_INFO_IN == osInfoType) {
			for (int i = 0; i < paramList.size(); i++) {
				Map<String, Object> tmpMap = paramList.get(i);
				String itemName = MapUtils.getString(tmpMap, "itemName", "");
				if ("套餐月租费".equals(itemName)) {
					String itemParam = MapUtils.getString(tmpMap, "itemParam", "");
					String itemUnit = MapUtils.getString(tmpMap, "itemUnit", "");
					String itemMark = MapUtils.getString(tmpMap, "itemMark", "");
					//把套餐月租费改为套餐月基本费
					titleStr = buildOE_1_OSInfo_Title(orderSeq, "套餐月基本费", itemParam, itemUnit, itemMark);
					paramList.remove(i);
					break;
				}
			}
		} else {
			titleStr = orderSeq + SysConstant.STR_PAU + "套餐超出资费" + SysConstant.STR_SEP;
		}
//		if (MapUtils.isNotEmpty(firstMap)) {
//			String itemName = MapUtils.getString(firstMap, "itemName", "");
//			String itemParam = MapUtils.getString(firstMap, "itemParam", "");
//			String itemUnit = MapUtils.getString(firstMap, "itemUnit", "");
//			String itemMark = MapUtils.getString(firstMap, "itemMark", "");
//
//			if ("套餐月基本费".equals(itemName)) {
//				titleStr = buildOE_1_OSInfo_Title(orderSeq, itemName, itemParam, itemUnit, itemMark);
//				paramList.remove(0);
//			} else {
//				if (SysConstant.OS_INFO_IN == osInfoType) {
//					titleStr = buildOE_1_OSInfo_Title(orderSeq, "套餐月基本费", "", "", "");
//				} else if (SysConstant.OS_INFO_OUT == osInfoType) {
//					titleStr = buildOE_1_OSInfo_Title(orderSeq, "套餐超出资费", "", "", "");
//				}
//			}
//		}
		baseInfoTitleSet.setStrBean(titleStr);
		baseInfoTitles.add(baseInfoTitleSet);
		osBaseInfoSet.setBaseInfoTitle(baseInfoTitles);
		// 设置套餐月基本费内容
		Map<String, Object> preMap = dealDonateItems(paramList);
		if (MapUtils.isNotEmpty(preMap)) {
			List<Map<String, Object>> preNormList = (List<Map<String, Object>>) preMap.get("norm");
			List<Map<String, Object>> donateList = (List<Map<String, Object>>) preMap.get("donate");

			Map<String, Object> itemsMap = dealOneLineItems(preNormList);
			if (MapUtils.isNotEmpty(itemsMap)) {
				List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
				List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
				if (normList != null && normList.size() > 0) {
					List<StringTwoSet> norOSBaseInfos = new ArrayList<StringTwoSet>();
					StringTwoSet itemTwo = null;
					for (int i = 0; i < normList.size(); i++) {
						if (i % 2 == 0) {
							itemTwo = new StringTwoSet();
						}
						Map<String, Object> tmpMap = normList.get(i);
						String itemName = MapUtils.getString(tmpMap, "itemName", "");
						String itemParam = MapUtils.getString(tmpMap, "itemParam", "");
						String itemUnit = MapUtils.getString(tmpMap, "itemUnit", "");
						String itemMark = MapUtils.getString(tmpMap, "itemMark", "");
						// 设置类属性
						String tmpStr = "";
						if (StringUtils.isEmpty(itemName) && StringUtils.isNotEmpty(itemMark)) {
							tmpStr = itemMark + SysConstant.STR_SPI;
						} else {
							tmpStr = itemName + SysConstant.STR_SEP + buildOE_1_OSInfo_Cont(itemParam, itemUnit, itemMark);
							if(tmpStr.endsWith(SysConstant.STR_SEP + SysConstant.STR_SPI)){
								tmpStr = itemName + SysConstant.STR_SPI;
							}
						}

						if (i % 2 == 0) {
							itemTwo.setStrBean0(tmpStr);
						} else {
							itemTwo.setStrBean1(tmpStr);
						}
						if (i % 2 != 0) {
							norOSBaseInfos.add(itemTwo);
						}
					}
					if (norOSBaseInfos.size() > 0) {
						osBaseInfoSet.setNorOSBaseInfos(norOSBaseInfos);
					}
				}
				if (lineList != null && lineList.size() > 0) {
					List<StringBeanSet> lineOSBaseInfos = new ArrayList<StringBeanSet>();
					for (int i = 0; i < lineList.size(); i++) {
						Map<String, Object> tmpMap = lineList.get(i);
						StringBeanSet lineBean = new StringBeanSet();
						String itemName = MapUtils.getString(tmpMap, "itemName", "");
						String itemParam = MapUtils.getString(tmpMap, "itemParam", "");
						String itemUnit = MapUtils.getString(tmpMap, "itemUnit", "");
						String itemMark = MapUtils.getString(tmpMap, "itemMark", "");
						// 设置类属性
						String tmpStr = "";
						if (StringUtils.isEmpty(itemName) && StringUtils.isNotEmpty(itemMark)) {
							tmpStr = itemMark + SysConstant.STR_SPI;
						} else {
							tmpStr = itemName + SysConstant.STR_SEP + buildOE_1_OSInfo_Cont(itemParam, itemUnit, itemMark);
							if(tmpStr.endsWith(SysConstant.STR_SEP + SysConstant.STR_SPI)){
								tmpStr = itemName + SysConstant.STR_SPI;
							}
						}
						lineBean.setStrBean(tmpStr);
						lineOSBaseInfos.add(lineBean);
					}
					if (lineOSBaseInfos.size() > 0) {
						osBaseInfoSet.setLineOSBaseInfos(lineOSBaseInfos);
					}
				}
			}
			// 设置赠送资费项内容
			if (donateList != null && donateList.size() > 0) {
				List<StringBeanSet> donateOSBaseInfos = new ArrayList<StringBeanSet>();
				StringBuffer donateSb = new StringBuffer();
//				for (int i = 0; i < donateList.size(); i++) {
//					Map<String, Object> tmpMap = donateList.get(i);
//					if (tmpMap.containsKey("itemName")) {
//						donateSb.append(MapUtils.getString(tmpMap, "itemName", ""));
//						donateSb.append(SysConstant.STR_SPI);
//					}
//				}
//				if (donateSb.length() > 0) {
//					donateSb.deleteCharAt(donateSb.length() - 1);
//					String tmpStr = "赠送" + SysConstant.STR_SEP + SysConstant.STR_SPE + donateSb.toString();
//					StringBeanSet donateBean = new StringBeanSet(tmpStr);
//					donateOSBaseInfos.add(donateBean);
//				}
				//20140710 目前赠送类是配置了一整行在itemParam
				Map<String, Object> tmpMap = donateList.get(0);
				String donateStr = "赠送" + SysConstant.STR_SEP + SysConstant.STR_SPE + MapUtils.getString(tmpMap, "itemParam", "");
				StringBeanSet donateBean = new StringBeanSet(donateStr);
				donateOSBaseInfos.add(donateBean);
				if (donateOSBaseInfos.size() > 0) {
					osBaseInfoSet.setDonateOSBaseInfos(donateOSBaseInfos);
				}
			}
		}

		return osBaseInfoSet;
	}

	private OSBaseInfoSet buildOE_1_OSInfo_block(int orderSeq, Map<String, Object> offerMap) {

		OSBaseInfoSet osBaseInfoSet = new OSBaseInfoSet();


		// 设置套餐月基本费头
		List<StringBeanSet> baseInfoTitles = new ArrayList<StringBeanSet>();
		List<StringBeanSet> contOSBaseInfos = new ArrayList<StringBeanSet>();
		List<StringBeanSet> donateOSBaseInfos = new ArrayList<StringBeanSet>();
		StringBeanSet baseInfoTitleSet = new StringBeanSet();
		StringBeanSet contBean = new StringBeanSet();
		StringBeanSet donateBean = new StringBeanSet();
		String titleStr = "";
		String contStr = "";
		String donateStr = "";
		if (offerMap.containsKey("attachOfferInfos")) {
			List<Map<String, Object>> attachOfferInfos = (List<Map<String, Object>>) offerMap.get("attachOfferInfos");
			for (int j = 0; j < attachOfferInfos.size(); j++) {
				Map<String, Object> aoInfo = attachOfferInfos.get(j);
				String itemTypeId = MapUtils.getString(aoInfo, "itemTypeId", "");
				String itemName = MapUtils.getString(aoInfo, "itemName", "");
				String itemParam = MapUtils.getString(aoInfo, "itemParam", "");
				String itemUnit = MapUtils.getString(aoInfo, "itemUnit", "");
				String itemMark = MapUtils.getString(aoInfo, "itemMark", "");
				String isDonate = MapUtils.getString(aoInfo, "isDonate", "");
				//流量模块
				if ("2".equals(itemTypeId)) {
					//语音模块
					titleStr = orderSeq + SysConstant.STR_PAU + "语音模块月基本费：" + itemParam + itemUnit + "，包含：";
				} else if ("3".equals(itemTypeId)) {
					titleStr = orderSeq + SysConstant.STR_PAU + "流量模块月基本费：" + itemParam + itemUnit + "，包含：";
				} else if ("Y".equals(isDonate)) {
					//赠送类
//					donateStr = donateStr + itemName + "；";
//					donateStr = donateStr + itemMark;
				} else {
					//默认内容
					if (StringUtils.isEmpty(itemName) && StringUtils.isNotEmpty(itemMark)) {
						contStr = contStr + itemMark + "；";
					} else {
						contStr = contStr + itemName + SysConstant.STR_SEP + itemParam + itemUnit;
					}
				}
			}
		}
		donateStr = (String) offerMap.get("donateValue");
		baseInfoTitleSet.setStrBean(titleStr);
		baseInfoTitles.add(baseInfoTitleSet);
		osBaseInfoSet.setBaseInfoTitle(baseInfoTitles);
		if (StringUtils.isNotEmpty(contStr)) {
			contBean.setStrBean(contStr);
			contOSBaseInfos.add(contBean);
			osBaseInfoSet.setLineOSBaseInfos(contOSBaseInfos);
		}
		if (!"".equals(donateStr)) {
			donateBean.setStrBean(donateStr);
			donateOSBaseInfos.add(donateBean);
			osBaseInfoSet.setDonateOSBaseInfos(donateOSBaseInfos);
		}

		return osBaseInfoSet;
	}

	private OSBaseInfoSet buildOE_1_OSInfo_block_V2(int orderSeq, Map<String, Object> offerMap) {

		OSBaseInfoSet osBaseInfoSet = new OSBaseInfoSet();


		// 设置套餐月基本费头
		List<StringBeanSet> baseInfoTitles = new ArrayList<StringBeanSet>();
		List<StringBeanSet> contOSBaseInfos = new ArrayList<StringBeanSet>();
		StringBeanSet baseInfoTitleSet = new StringBeanSet();
		StringBeanSet contBean = new StringBeanSet();
		String titleStr = "";
		String contStr = "";
		if (offerMap.containsKey("orderEventCont")) {
			Map<String, Object> orderEventCont = MapUtils.getMap(offerMap,"orderEventCont");
			List<Map<String,Object>> osBaseInfoList= (List<Map<String, Object>>) MapUtils.getObject(orderEventCont,"osBaseInfo");
			if(null!=osBaseInfoList&&osBaseInfoList.size()==1) {
				contStr = buildBizReportDetailItemAndDescDto(osBaseInfoList,false);
			//流量模块/语音模块-标题
			titleStr = getTitleName4Index(orderSeq, osBaseInfoList);
			}
		}
		baseInfoTitleSet.setStrBean(titleStr);
		baseInfoTitles.add(baseInfoTitleSet);
		osBaseInfoSet.setBaseInfoTitle(baseInfoTitles);

		if (StringUtils.isNotEmpty(contStr)) {
			contBean.setStrBean(contStr);
			contOSBaseInfos.add(contBean);
			osBaseInfoSet.setLineOSBaseInfos(contOSBaseInfos);
		}

		return osBaseInfoSet;
	}


	/**
	 * 组装－业务信息_主销售品_内容_套餐月基本费_标题
	 * @param orderSeq
	 * @param itemName
	 * @param itemParam
	 * @param itemUnit
	 * @param itemMark
	 * @return
	 */
	private String buildOE_1_OSInfo_Title(int orderSeq, String itemName, String itemParam, String itemUnit, String itemMark){
		return orderSeq + SysConstant.STR_PAU + itemName + SysConstant.STR_SEP + itemParam
				+ itemUnit + itemMark + SysConstant.STR_COM + "包含" + SysConstant.STR_SEP;
	}


	/**
	 * 组装－业务信息_主销售品_内容_套餐月基本费_内容信息
	 * @param itemParam
	 * @param itemUnit
	 * @param itemMark
	 * @return
	 */
	private String buildOE_1_OSInfo_Cont(String itemParam, String itemUnit, String itemMark){
		String tmpStr = itemParam;
		if (StringUtils.isNotEmpty(itemUnit)) {
//			tmpStr += SysConstant.STR_SPE + itemUnit;
			tmpStr += itemUnit;
		}
		if (StringUtils.isNotEmpty(itemMark)) {
			tmpStr += SysConstant.STR_SPE + SysConstant.STR_LL_BRE + itemMark + SysConstant.STR_RL_BRE;
		}
		//20140711 去掉最后的分号，改为配置在表中
		//tmpStr += SysConstant.STR_SPI;
		return tmpStr;
	}

	/**
	 * 组装－业务信息_主销售品_内容_订购当月资费
	 * @param orderSeq
	 * @param jsonObjParam
	 * @return
	 */
	private OSOrderInfoSet buildOE_1_OrderInfo(int orderSeq, String strParam){
		if(null == strParam){
			return null;
		}

		OSOrderInfoSet orderInfoSet = new OSOrderInfoSet();

		List<StringBeanSet> orderInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, "订购当月资费"));
		orderInfoTitle.add(strBeanTitle);
		orderInfoSet.setOrderInfoTitle(orderInfoTitle);

		List<StringBeanSet> osOrderInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCont = new StringBeanSet(strParam);
		osOrderInfos.add(strBeanCont);
		orderInfoSet.setOsOrderInfos(osOrderInfos);

		return orderInfoSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_其它说明
	 * @param orderSeq
	 * @param jsonArrayParam
	 * @return
	 */
	private OSOtherInfoSet buildOE_1_OtherInfo(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null || paramList.size() == 0) {
			return null;
		}
		OSOtherInfoSet otherInfoSet = new OSOtherInfoSet();
		List<StringBeanSet> otherInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, "其它说明"));
		otherInfoTitle.add(strBeanTitle);
		otherInfoSet.setOtherInfoTitle(otherInfoTitle);
		List<StringBeanSet> osOtherInfos = new ArrayList<StringBeanSet>();
		int len = paramList.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> paramMap = paramList.get(i);
			if (paramMap != null && paramMap.containsKey("item")) {
				StringBeanSet strBean = new StringBeanSet(buildOE_1_OtherInfo_Cont(len, i+1, MapUtils.getString(paramMap, "item")));
				osOtherInfos.add(strBean);
			}
		}
		otherInfoSet.setOsOtherInfos(osOtherInfos);
		return otherInfoSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_其它说明_带序号
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private String buildOE_1_OtherInfo_Cont(int tolNbr, int orderSeq, String strParam){
		if(StringUtils.isEmpty(strParam)){
			return null;
		}

		if(tolNbr == SysConstant.INT_1){
			return strParam;
		} else {
			return orderSeq + SysConstant.STR_RL_BRE + SysConstant.STR_SPE + strParam;
		}
	}

	/**
	 * 组装－业务信息_主销售品_内容_套餐优惠
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private OSPrompInfoSet buildOE_1_PrompInfo_New(int orderSeq, Map<String, Object> contMap){
		String strParam = MapUtils.getString(contMap, "osPrompInfo", "");
		Map<String, Object> osAttachInfos = MapUtils.getMap(contMap, "osAttachInfos");
		if (MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> offerInfos = (List<Map<String, Object>>) osAttachInfos.get("offerInfos");
			for (int i = 0; offerInfos != null && i < offerInfos.size(); i++) {
				Map<String, Object> offerMap = offerInfos.get(i);
				strParam += MapUtils.getString(offerMap, "osPrompInfo", "");
			}
		}
		if (StringUtils.isBlank(strParam)) {
			return null;
		}

		OSPrompInfoSet promInfoSet = new OSPrompInfoSet();

		List<StringBeanSet> prompInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, "套餐优惠"));
		prompInfoTitle.add(strBeanTitle);
		promInfoSet.setPrompInfoTitle(prompInfoTitle);

		List<StringBeanSet> osPrompInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCont = new StringBeanSet(strParam);
		osPrompInfos.add(strBeanCont);
		promInfoSet.setOsPrompInfos(osPrompInfos);

		return promInfoSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_套餐优惠
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private OSPrompInfoSet buildOE_1_PrompInfo(int orderSeq, String strParam){
		if(StringUtils.isEmpty(strParam)){
			return null;
		}

		OSPrompInfoSet promInfoSet = new OSPrompInfoSet();

		List<StringBeanSet> prompInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, "套餐优惠"));
		prompInfoTitle.add(strBeanTitle);
		promInfoSet.setPrompInfoTitle(prompInfoTitle);

		List<StringBeanSet> osPrompInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCont = new StringBeanSet(strParam);
		osPrompInfos.add(strBeanCont);
		promInfoSet.setOsPrompInfos(osPrompInfos);

		return promInfoSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_叠加包
	 * 新版，20140409
	 * @param orderSeq
	 * @param jsonArrayParam
	 * @return
	 */
	private OSAttachOfferSet buildOE_1_AttachOffer_New(int orderSeq, Map<String, Object> paramMap){
		if(MapUtils.isEmpty(paramMap)){
			return null;
		}

		OSAttachOfferSet attachOfferSet = new OSAttachOfferSet();

		// 设置叠加包-标题
		List<StringBeanSet> attachOfferTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, SysConstant.STR_SPE +  "叠加包"));
//		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, SysConstant.STR_SPE + SysConstant.STR_SPE +  "叠加包"));
		attachOfferTitle.add(strBeanTitle);
		attachOfferSet.setAttachOfferTitle(attachOfferTitle);

		int busiOrderSeq = SysConstant.INT_1;
		// 设置叠加包-附属
		List<Map<String, Object>> attachOneList = (List<Map<String, Object>>) paramMap.get("attachOneList");
		List<Map<String, Object>> attachTwoList = (List<Map<String, Object>>) paramMap.get("attachTwoList");
		List<Map<String, Object>> attachThreeList = (List<Map<String, Object>>) paramMap.get("attachThreeList");
		List<OSNormOfferSet> normOfferList = new ArrayList<OSNormOfferSet>();
		for (int i = 0; attachOneList != null && i < attachOneList.size(); i++) {
//			2.天翼4G手机短信包（订购次月生效，当月执行过渡期资费）
//			1）订购号码：18912345090 ；
//			2）功能费3元/月，包含国内点对点短信100条；超出资费：国内点对点短信0.1元/条。
//			3）过渡期资费：入网当月套餐月基本费按日计扣（入网当日到月底），费用四舍五入到分；套餐内容（短信）按天折算，向上取整。

			Map<String, Object> offerMap = attachOneList.get(i);
			String itemName = MapUtils.getString(offerMap, "itemName", "");
			String effectRule = MapUtils.getString(offerMap, "effectRule", "");
			String itemParam = MapUtils.getString(offerMap, "itemParam", "");
			String relaAcceNbr = MapUtils.getString(offerMap, "relaAcceNbr", "");
			String osOrderInfo = MapUtils.getString(offerMap, "osOrderInfo", "");

			OSNormOfferSet normOfferSet = new OSNormOfferSet();
			List<StringBeanSet> normOfferTitles = new ArrayList<StringBeanSet>();
			List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();

			StringBeanSet titleBean = new StringBeanSet();
			//20140716 可能需要加上月租费，待后台确定内容的节点, TODO
			String title = busiOrderSeq + "." + itemName + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE;
			titleBean.setStrBean(title);
			normOfferTitles.add(titleBean);
			normOfferSet.setNormOfferTitle(normOfferTitles);

			StringBeanSet commentBean = new StringBeanSet();
			int ind = 1;
			String comment = "";
			comment += ind++ + "）订购号码：" + relaAcceNbr + " ；";
			List<Map<String, Object>> attachOfferInfos = (List<Map<String, Object>>) offerMap.get("attachOfferInfos");
			if (attachOfferInfos != null && attachOfferInfos.size() > 0) {
				String headStr = "";
				String bodyStr = "";
				String tailStr = "";
				for (int j = 0; j < attachOfferInfos.size(); j++) {
					Map<String, Object> attachOfferInfoMap = attachOfferInfos.get(j);
					String tmpItemName = MapUtils.getString(attachOfferInfoMap, "itemName", "");
					String tmpItemParam = MapUtils.getString(attachOfferInfoMap, "itemParam", "");
					String tmpItemUnit = MapUtils.getString(attachOfferInfoMap, "itemUnit", "");
					String tmpItemMark = MapUtils.getString(attachOfferInfoMap, "itemMark", "");
					if ("功能费".equals(tmpItemName)) {
						headStr = "功能费" + tmpItemParam + tmpItemUnit + "，包含";
					} else {
						bodyStr += tmpItemName + tmpItemParam + tmpItemUnit;
						if (!bodyStr.endsWith(SysConstant.STR_ENT)) {
							bodyStr += SysConstant.STR_SPI + SysConstant.STR_ENT;
						}
					}
				}
//				if (bodyStr.length() > 0) {
//					bodyStr = bodyStr.substring(0, bodyStr.length() - 1) + "；";
//				}
				List<Map<String, Object>> outAttachOfferInfos = (List<Map<String, Object>>) offerMap.get("outAttachOfferInfos");
				if (outAttachOfferInfos != null && outAttachOfferInfos.size() > 0) {
					tailStr = "超出资费：";
					for (int k = 0; k < outAttachOfferInfos.size(); k++) {
						Map<String, Object> outMap = outAttachOfferInfos.get(k);
						String tmpItemName = MapUtils.getString(outMap, "itemName", "");
						String tmpItemParam = MapUtils.getString(outMap, "itemParam", "");
						String tmpItemUnit = MapUtils.getString(outMap, "itemUnit", "");
						String tmpItemMark = MapUtils.getString(outMap, "itemMark", "");
						tailStr += tmpItemName + tmpItemParam + tmpItemUnit + "，";
					}
					tailStr = tailStr.substring(0, tailStr.length() - 1) + "；";
					bodyStr += tailStr;
				}
				comment += "\n" + ind++ + "）" + headStr + bodyStr;
			}
			//当月资费说明
			if (StringUtils.isNotEmpty(osOrderInfo)) {
				comment += "\n" + ind++ + "）" + osOrderInfo;
			}

			List<Map<String, Object>> otherAttachOfferInfos = (List<Map<String, Object>>) offerMap.get("otherAttachOfferInfos");
			if (otherAttachOfferInfos != null && otherAttachOfferInfos.size() > 0) {
				String otherStr = "\n" + ind++ + "）其他说明：";
				for (int m = 0; m < otherAttachOfferInfos.size(); m++) {
					Map<String, Object> otherMap = otherAttachOfferInfos.get(m);
					String item = MapUtils.getString(otherMap, "item", "");
					otherStr += item + "；";
				}
				comment += otherStr;
			}
			commentBean.setStrBean(comment);
			normOfferComments.add(commentBean);
			normOfferSet.setNormOfferComments(normOfferComments);

			normOfferList.add(normOfferSet);
			busiOrderSeq++;
		}
		String comment1 = "";
		String donateStr = "";
		List<StringBeanSet> normOfferTitles1 = new ArrayList<StringBeanSet>();
		List<StringBeanSet> normOfferComments1 = new ArrayList<StringBeanSet>();
		OSNormOfferSet normOfferSet1 = new OSNormOfferSet();
		for (int i = 0; attachTwoList != null && i < attachTwoList.size(); i++) {
//			1.加装手机（生效规则同主套餐一致）
//			用户号码：18912340003 （副卡标识） ；功能费10元/月，可共享主套餐语音和流量。
//			赠送：来电显示和189免费邮箱。
//			2.加装无线上网卡（生效规则同主套餐一致）
//			用户号码：189xxxxxxxx （副卡标识）； 功能费5元/月，可共享主套餐的流量。
			Map<String, Object> acceNbrMap = attachTwoList.get(i);
			String acceNbr = MapUtils.getString(acceNbrMap, "acceNbr", "");
			String memberRoleCd = MapUtils.getString(acceNbrMap, "memberRoleCd", "");

			String title = "";
			if ("401".equals(memberRoleCd)) {
				if(i == 0){
					StringBeanSet titleBean = new StringBeanSet();
					title = busiOrderSeq + ".加装手机副卡（生效规则同主套餐一致）";
					titleBean.setStrBean(title);
					normOfferTitles1.add(titleBean);
					normOfferSet1.setNormOfferTitle(normOfferTitles1);
				}
			} else if ("501".equals(memberRoleCd)) {
				title = busiOrderSeq + ".加装无线上网卡（生效规则同主套餐一致）";
			}


			StringBeanSet commentBean = new StringBeanSet();
			comment1 = comment1 + "用户号码：" + acceNbr + " （新开户）（副卡） ；";
			if (i == attachTwoList.size() -1){
				comment1 = comment1.substring(0,comment1.length()-1) + ".";
			}
			Map<String, Object> itemParamMap = MapUtils.getMap(acceNbrMap, "itemParam");
			if (MapUtils.isNotEmpty(itemParamMap)) {
				String tmpItemName = MapUtils.getString(itemParamMap, "itemName", "");
				String tmpItemValue = MapUtils.getString(itemParamMap, "itemValue", "");
				String tmpItemUnit = MapUtils.getString(itemParamMap, "itemUnit", "");
				comment1 += tmpItemName + tmpItemValue + tmpItemUnit;
				if ("401".equals(memberRoleCd)) {
					comment1 += "，可共享主套餐语音和流量。";
				} else if ("501".equals(memberRoleCd)) {
					comment1 += "，可共享主套餐的流量。";
				}
			}
			donateStr = MapUtils.getString(acceNbrMap, "donateValue", "");
//			if (StringUtils.isNotEmpty(donateStr)) {
//				donateStr += "\n" + donateStr;
//			}
			if (i == attachTwoList.size() -1){
				comment1 += "\n" + donateStr;
			}
//			List<Map<String, Object>> donateItems = (List<Map<String, Object>>) acceNbrMap.get("donateItems");
//			if (donateItems != null && donateItems.size() > 0) {
//				String donateStr = "";
//				for (int j = 0; j < donateItems.size(); j++) {
//					Map<String, Object> donateItem = donateItems.get(j);
//					String tmpItemName = MapUtils.getString(donateItem, "itemName", "");
//					donateStr += tmpItemName + "和";
//				}
//				if (donateStr.length() > 0) {
//					donateStr = donateStr.substring(0, donateStr.length() - 1);
//				}
//				comment += "\n赠送：" + donateStr + "。";
//			}
			if (i == attachTwoList.size() -1){
				commentBean.setStrBean(comment1);
				normOfferComments1.add(commentBean);
				normOfferSet1.setNormOfferComments(normOfferComments1);
				normOfferList.add(normOfferSet1);
			}
			busiOrderSeq++;
		}

		if (attachThreeList != null) {
			OSNormOfferSet normOfferSet = new OSNormOfferSet();
			List<StringBeanSet> normOfferTitles = new ArrayList<StringBeanSet>();
			List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();

			StringBeanSet titleBean = new StringBeanSet();
			String title = busiOrderSeq + ".产品功能 ";
			titleBean.setStrBean(title);
			normOfferTitles.add(titleBean);
			normOfferSet.setNormOfferTitle(normOfferTitles);
			StringBeanSet commentBean = new StringBeanSet();
			String comment = "";

			//（移动用户开通了4G功能的，4G、3G、1X上网功能一并列示，不允许单独分开列示，如下）
			//3）[开通]手机上网（4G/LTE、3G/EVDO、1x）功能（号码：xxxxxxxxxxx ，xxxxxxxxxxx）(立即生效）
			//		（移动用户未开通4G功能的，3G、1x上网功能一并列为“手机上网（3G/EVDO、1x）”，不允许分开列示，如下）
			//		4）[开通]手机上网（3G/EVDO、1x）功能（号码：xxxxxxxxxxx ，xxxxxxxxxxx）(立即生效）
			Map<String, Object> fourGMap = new HashMap<String, Object>();
			Map<String, Object> threeGMap = new HashMap<String, Object>();
			Map<String, Object> twoGMap = new HashMap<String, Object>();
			int fourInd = 0;
			int threeInd = 0;
			int twoInd = 0;
			for (int i = 0; i < attachThreeList.size(); i++) {
				Map<String, Object> servMap = attachThreeList.get(i);
				String actionName = MapUtils.getString(servMap, "actionName", "");
				String itemName = MapUtils.getString(servMap, "itemName", "");
				String itemParam = MapUtils.getString(servMap, "itemParam", "");
				String effectRule = MapUtils.getString(servMap, "effectRule", "");
				String relaAcceNbr = MapUtils.getString(servMap, "relaAcceNbr", "");
				String objId = MapUtils.getString(servMap, "objId", "");
				if ("280000020".equals(objId)) {
					//4G（LTE）上网
					fourGMap = servMap;
					fourInd = i;
				} else if ("235010003".equals(objId)) {
					//3G（EVDO）上网
					threeGMap = servMap;
					threeInd = i;
				} else if ("235010008".equals(objId)) {
					//2G（1X）上网
					twoGMap = servMap;
					twoInd = i;
				}
			}
			int ind = 1;
			if (MapUtils.isNotEmpty(fourGMap) || MapUtils.isNotEmpty(threeGMap) || MapUtils.isNotEmpty(twoGMap)) {
				String actionName4 = MapUtils.getString(fourGMap, "actionName", "4");
				String actionName3 = MapUtils.getString(threeGMap, "actionName", "3");
				String actionName2 = MapUtils.getString(twoGMap, "actionName", "2");
				String effectRule4 = MapUtils.getString(fourGMap, "effectRule", "");
				String relaAcceNbr4 = MapUtils.getString(fourGMap, "relaAcceNbr", "");
				String effectRule3 = MapUtils.getString(threeGMap, "effectRule", "");
				String relaAcceNbr3 = MapUtils.getString(threeGMap, "relaAcceNbr", "");
				String effectRule2 = MapUtils.getString(twoGMap, "effectRule", "");
				String relaAcceNbr2 = MapUtils.getString(twoGMap, "relaAcceNbr", "");
				if (actionName4.equals(actionName3) && actionName4.equals(actionName2)) {
					comment += ind++ + "）[" + actionName4 + "]手机上网（4G/LTE、3G/EVDO、1x）功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
				} else {
					if (actionName4.equals(actionName3)) {
						comment += ind++ + "）[" + actionName4 + "]手机上网（4G/LTE、3G/EVDO）功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						if (!"2".equals(actionName2)) {
							comment += ind++ + "）[" + actionName2 + "]手机上网1x功能(号码：" + relaAcceNbr2 + ")；（" + effectRule2 + "）；\n";
						}
					} else if (actionName4.equals(actionName2)) {
						comment += ind++ + "）[" + actionName4 + "]手机上网（4G/LTE、1x）功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						if (!"3".equals(actionName3)) {
							comment += ind++ + "）[" + actionName3 + "]手机上网3G/EVDO功能(号码：" + relaAcceNbr3 + ")；（" + effectRule3 + "）；\n";
						}
					} else if (actionName3.equals(actionName2)) {
						comment += ind++ + "）[" + actionName3 + "]手机上网（3G/EVDO、1x）功能(号码：" + relaAcceNbr3 + ")；（" + effectRule3 + "）；\n";
						if (!"4".equals(actionName4)) {
							comment += ind++ + "）[" + actionName2 + "]手机上网4G/LTE功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						}
					} else {
						if (!"4".equals(actionName4)) {
							comment += ind++ + "）[" + actionName2 + "]手机上网4G/LTE功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						}
						if (!"3".equals(actionName3)) {
							comment += ind++ + "）[" + actionName3 + "]手机上网3G/EVDO功能(号码：" + relaAcceNbr3 + ")；（" + effectRule3 + "）；\n";
						}
						if (!"2".equals(actionName2)) {
							comment += ind++ + "）[" + actionName2 + "]手机上网1x功能(号码：" + relaAcceNbr2 + ")；（" + effectRule2 + "）；\n";
						}
					}
				}

			}

			for (int i = 0; i < attachThreeList.size(); i++) {
				if (i == fourInd || i == threeInd || i == twoInd) {
					continue;
				}
//				5、产品功能 （当客户在订购某套餐的同时，另外开通了套餐未包含的产品功能，如来电显示，则在此列示）
//				1）[开通]xxxx功能(号码：xxxxxxxxxxx)；xx元/月 ； （xx小时内生效）；
//				2）[开通]xxxx功能(号码：xxxxxxxxxxx)；（xx小时内生效）；（对于不收费的产品功能，不列示资费）如[开通]国际长途）
				Map<String, Object> servMap = attachThreeList.get(i);

				String actionName = MapUtils.getString(servMap, "actionName", "");
				String itemName = MapUtils.getString(servMap, "itemName", "");
				String itemParam = MapUtils.getString(servMap, "itemParam", "");
				String effectRule = MapUtils.getString(servMap, "effectRule", "");
				String relaAcceNbr = MapUtils.getString(servMap, "relaAcceNbr", "");

				comment += ind++ + "）[" + actionName + "]" + itemName + "功能(号码：" + relaAcceNbr + ")；（" + effectRule + "）；\n";
			}
			if (StringUtils.isNotEmpty(comment)) {
				commentBean.setStrBean(comment);
				normOfferComments.add(commentBean);
				normOfferSet.setNormOfferComments(normOfferComments);

				normOfferList.add(normOfferSet);
				busiOrderSeq++;
			}
		}
		if(null != normOfferList && normOfferList.size() > 0){
			attachOfferSet.setNormOfferList(normOfferList);
		}


		// 设置叠加包-服务
//		List<Map<String, Object>> servInfos = null;
//		if(paramMap.containsKey("servInfos")){
//			servInfos = (List<Map<String, Object>>) paramMap.get("servInfos");
//		}
//		List<OSServOfferSet> servOfferList = (List<OSServOfferSet>) buildOE_1_AttachOffer_Serv(busiOrderSeq, servInfos);
//		if(null != servOfferList && servOfferList.size() > 0){
//			attachOfferSet.setServOfferList(servOfferList);
//		}

		return attachOfferSet;
	}

	private boolean filterProd(String objId) {
		if (filterList.contains(objId)) {
			return true;
		}
		return false;
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包
	 * @param orderSeq
	 * @param jsonArrayParam
	 * @return
	 */
	private OSAttachOfferSet buildOE_1_AttachOffer(int orderSeq, Map<String, Object> paramMap){
		if(MapUtils.isEmpty(paramMap)){
			return null;
		}

		OSAttachOfferSet attachOfferSet = new OSAttachOfferSet();

		// 设置叠加包-标题
		List<StringBeanSet> attachOfferTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, "叠加包"));
		attachOfferTitle.add(strBeanTitle);
		attachOfferSet.setAttachOfferTitle(attachOfferTitle);

		int busiOrderSeq = SysConstant.INT_1;
		// 设置叠加包-附属
		List<Map<String, Object>> offerInfos = null;
		if(paramMap.containsKey("offerInfos")){
			offerInfos = (List<Map<String, Object>>) paramMap.get("offerInfos");
		}
		Map<String, Object> rstMap = buildOE_1_AttachOffer_Norm(busiOrderSeq, offerInfos);
		List<OSNormOfferSet> normOfferList = (List<OSNormOfferSet>) rstMap.get("normOfferList");
		if(null != normOfferList && normOfferList.size() > 0){
			attachOfferSet.setNormOfferList(normOfferList);
			busiOrderSeq = (Integer) rstMap.get("busiOrderSeq");
		}

		// 设置叠加包-服务
		List<Map<String, Object>> servInfos = null;
		if(paramMap.containsKey("servInfos")){
			servInfos = (List<Map<String, Object>>) paramMap.get("servInfos");
		}
		List<OSServOfferSet> servOfferList = (List<OSServOfferSet>) buildOE_1_AttachOffer_Serv(busiOrderSeq, servInfos);
		if(null != servOfferList && servOfferList.size() > 0){
			attachOfferSet.setServOfferList(servOfferList);
		}

		return attachOfferSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_叠加包_附属销售品
	 * @param jsonArrayParam
	 * @return
	 */
	private Map<String, Object> buildOE_1_AttachOffer_Norm(int busiOrderSeq, List<Map<String, Object>> offerInfos){
		Map<String, Object> rstMap = new HashMap<String, Object>();
		if (offerInfos == null || offerInfos.size() == 0) {
			rstMap.put("busiOrderSeq", busiOrderSeq);
			return rstMap;
		}

		List<OSNormOfferSet> normOfferList = new ArrayList<OSNormOfferSet>();
		for (int i = 0; i < offerInfos.size(); i++){
			Map<String, Object> offerInfoMap = offerInfos.get(i);

			if (MapUtils.isNotEmpty(offerInfoMap)) {
				OSNormOfferSet normOfferSet = new OSNormOfferSet();
				List<StringBeanSet> normOfferTitle = new ArrayList<StringBeanSet>();

				String itemName = MapUtils.getString(offerInfoMap, "itemName", "");
				String itemParam = MapUtils.getString(offerInfoMap, "itemParam", "");
				String effectRule = MapUtils.getString(offerInfoMap, "effectRule", "");
				StringBeanSet strBeanTitle = new StringBeanSet(buildOE_1_AttachOffer_Norm_Title(busiOrderSeq, itemName, itemParam, effectRule));
				normOfferTitle.add(strBeanTitle);

				List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();
				String itemDesc = MapUtils.getString(offerInfoMap, "itemDesc", "");
				String relaAcceNbr = MapUtils.getString(offerInfoMap, "relaAcceNbr", "");
				if (relaAcceNbr.matches("\\d+")) {
					relaAcceNbr = null;
				}
				StringBeanSet strBeanCont = new StringBeanSet(buildOE_1_AttachOffer_Norm_Cont(itemDesc, relaAcceNbr));
				normOfferComments.add(strBeanCont);

				normOfferSet.setNormOfferTitle(normOfferTitle);
				normOfferSet.setNormOfferComments(normOfferComments);

				normOfferList.add(normOfferSet);
				busiOrderSeq ++;
			}
		}

		rstMap.put("busiOrderSeq", busiOrderSeq);
		rstMap.put("normOfferList", normOfferList);
		return rstMap;
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_附属销售品_标题行
	 * @param orderSeq
	 * @param itemName
	 * @param itemParam
	 * @param effectRule
	 * @return
	 */
	private String buildOE_1_AttachOffer_Norm_Title(int orderSeq, String itemName, String itemParam, String effectRule){
		return orderSeq + SysConstant.STR_PAU
			+ (StringUtils.isEmpty(itemName) ? "" : itemName)
			+ (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE))
			+ (StringUtils.isEmpty(itemParam) ? "" : (SysConstant.STR_SEP + itemParam));
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_附属销售品_描述
	 * @param itemDesc
	 * @param relaAcceNbr
	 * @return
	 */
	private String buildOE_1_AttachOffer_Norm_Cont(String itemDesc, String relaAcceNbr){
		return (StringUtils.isEmpty(itemDesc) ? "" : itemDesc)
				+ ((!StringUtils.isEmpty(itemDesc) && !StringUtils.isEmpty(relaAcceNbr)) ? SysConstant.STR_COM : "")
				+ (StringUtils.isEmpty(relaAcceNbr) ? "" : ("订购号码" + SysConstant.STR_SEP + relaAcceNbr + SysConstant.STR_STO));
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_服务销售品
	 * @param jsonArrayParam
	 * @return
	 */
	private List<OSServOfferSet> buildOE_1_AttachOffer_Serv(int orderSeq, List<Map<String, Object>> servInfos){
		if(servInfos == null || servInfos.size() == 0){
			return null;
		}

		List<OSServOfferSet> servOfferList = new ArrayList<OSServOfferSet>();
		OSServOfferSet servOfferSet = new OSServOfferSet();

		// 设置标题
		List<StringBeanSet> servOfferTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, "产品功能"));
		servOfferTitle.add(strBeanTitle);
		servOfferSet.setServOfferTitle(servOfferTitle);

		// 设置内容
		List<StringBeanSet> servOfferInfos = new ArrayList<StringBeanSet>();
		int len = servInfos.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> servInfoMap = servInfos.get(i);

			if(MapUtils.isNotEmpty(servInfoMap)){
				StringBeanSet strBeanCont = new StringBeanSet();

				String actionType = MapUtils.getString(servInfoMap, "actionName", "");
				String itemName = MapUtils.getString(servInfoMap, "itemName", "");
				String itemParam = MapUtils.getString(servInfoMap, "itemParam", "");
				String itemDesc = MapUtils.getString(servInfoMap, "itemDesc", "");
				String effectRule = MapUtils.getString(servInfoMap, "effectRule", "");
				String relaAcceNbr = MapUtils.getString(servInfoMap, "relaAcceNbr", "");
				if (!relaAcceNbr.matches("\\d+")) {
					relaAcceNbr = "";
				}
				strBeanCont.setStrBean(buildOE_1_AttachOffer_Serv_Cont(len, i + 1, actionType, itemName, itemParam, itemDesc, effectRule, relaAcceNbr));
				servOfferInfos.add(strBeanCont);
			}
		}
		servOfferSet.setServOfferInfos(servOfferInfos);

		servOfferList.add(servOfferSet);
		return servOfferList;
	}
	/**
	 * 组装－业务信息_主销售品_内容_叠加包_服务销售品_内容(公用)
	 * @param orderSeq
	 * @param actionType
	 * @param itemName
	 * @param itemParam
	 * @param itemDesc
	 * @param effectRule
	 * @param relaAcceNbr
	 * @return
	 */
	private String buildOE_1_AttachOffer_Serv_Cont(int tolNbr, int orderSeq, String actionType, String itemName, String itemParam, String itemDesc, String effectRule, String relaAcceNbr){
		StringBuffer rstStr = new StringBuffer();
		if(tolNbr != SysConstant.INT_1){
			rstStr.append(orderSeq + SysConstant.STR_RL_BRE + SysConstant.STR_SPE);
		}
		rstStr.append(SysConstant.STR_LM_BRE + actionType + SysConstant.STR_RM_BRE);
		rstStr.append(itemName);
		rstStr.append(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + relaAcceNbr + SysConstant.STR_RL_BRE + SysConstant.STR_SPE);
		rstStr.append(SysConstant.STR_SPI);
		if (StringUtils.isNotBlank(itemParam)) {
			rstStr.append(itemParam + SysConstant.STR_SPI);
		}
		rstStr.append(SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE + SysConstant.STR_SPE + SysConstant.STR_SPI);

		if(SysConstant.STR_SPI.equals(rstStr.toString())){
			return null;
		} else {
			return rstStr.toString();
		}
	}

	/**
	 * 组装－业务信息_主销售品_内容_订购当月资费_标题(公用)
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private String buildBusiInfoTitle(int orderSeq, String titleName) {
		if(StringUtils.isEmpty(titleName)){
			return null;
		}

		if(orderSeq == SysConstant.INT_0){
			return titleName + SysConstant.STR_SEP;
		} else {
			return orderSeq + SysConstant.STR_PAU + titleName + SysConstant.STR_SEP;
		}
	}
	/**
	 * 组装－业务信息_主销售品_内容_订购当月资费_标题(公用)
	 * @param orderSeq
	 * @param separator
	 * @param titleName
	 * @return
	 */
	private String buildBusiInfoTitle_V2(int orderSeq,String separator, String titleName) {
		if(StringUtils.isEmpty(titleName)){
			return null;
		}

		if(orderSeq == SysConstant.INT_0){
			return titleName + SysConstant.STR_SEP;
		} else {
			return orderSeq + separator + titleName + SysConstant.STR_SEP;
		}
	}

	private Map<String, Object> dealDonateItems(List<Map<String, Object>> paramList) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> donateItemList = new ArrayList<Map<String,Object>>();
		for (int i = 0; i < paramList.size(); i++) {
			Map<String, Object> paramMap = paramList.get(i);
			if (validDonateAttr(paramMap)) {
				donateItemList.add(paramMap);
			} else {
				normItemList.add(paramMap);
			}
		}
		if (normItemList.size() > 0) {
			retnMap.put("norm", normItemList);
		}
		if (donateItemList.size() > 0) {
			retnMap.put("donate", donateItemList);
		}
		return retnMap;
	}

	/**
	 * 赠送属性判断
	 *
	 * @param jsonObj
	 * @return
	 */
	private boolean validDonateAttr(Map<String, Object> paramMap){
		String isDonate = MapUtils.getString(paramMap, "isDonate", "");
		if(SysConstant.STR_Y.equals(isDonate)){
			return true;
		}else {
			return false;
		}
	}

	/**
	 * 组装－客户信息_头部(公用)
	 * @param itemName
	 * @return
	 */
	private String buildInfoItemName(String itemName){
		return (StringUtils.isEmpty(itemName) ? "" : (itemName + SysConstant.STR_SEP));
	}

	/**
	 * 组装－业务信息_合约计划订购
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_2(Map<String, Object> event, int orderSeq, int oeSize){
		if(MapUtils.isEmpty(event)){
			return null;
		}

		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if(orderSeq <= oeSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}

		List<OETermOfferSet> termOfferList = new ArrayList<OETermOfferSet>();
		OETermOfferSet termOfferSet = new OETermOfferSet();
		// 设置合约计划_标题
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
			String termOfferTitle = buildOrderEvent_2_Title(oeSize, orderSeq, titleMap);
			termOfferSet.setTermOfferTitle(termOfferTitle);
		}

		// 设置合约计划_内容
		if(event.containsKey("orderEventCont")){
			Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
			List<StringBeanSet> termOfferInfos = buildOrderEvent_2_Cont(contMap);
			if(null != termOfferInfos && termOfferInfos.size() > 0){
				termOfferSet.setTermOfferInfos(termOfferInfos);
			}
		}

		termOfferList.add(termOfferSet);
		orderEvent.setTermOfferList(termOfferList);
		return orderEvent;
	}
	/**
	 * 组装－业务信息_合约计划订购_标题
	 * @param orderSeq
	 * @param jsonObj
	 * @return
	 */
	private String buildOrderEvent_2_Title(int tolNbr, int orderSeq, Map<String, Object> titleMap) {
		if (MapUtils.isEmpty(titleMap)) {
			return null;
		}

		String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
		String offerSpecName = MapUtils.getString(titleMap, "offerSpecName", "");
		String effectRule = MapUtils.getString(titleMap, "effectRule", "");

		return (tolNbr == SysConstant.INT_1 ? "" : (ChsStringUtil.getSeqNumByInt(orderSeq)) + SysConstant.STR_PAU)
				+ (StringUtils.isEmpty(boActionTypeName) ? "" : (SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE))
				+ (StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName)
				+ (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE));
	}
	/**
	 * 组装－业务信息_合约计划订购_内容
	 * @param jsonObj
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_2_Cont(Map<String, Object> contMap){
		if (MapUtils.isEmpty(contMap)) {
			return null;
		}

		List<StringBeanSet> strBeanList = new ArrayList<StringBeanSet>();
		if (contMap.containsKey("agrPlanMods")) {
			List<Map<String, Object>> agrPlanMods = (List<Map<String, Object>>) contMap.get("agrPlanMods");
			if (agrPlanMods == null || agrPlanMods.size() == 0){
				return null;
			}

			for (int i = 0; i < agrPlanMods.size(); i++) {
				Map<String, Object> modMap = agrPlanMods.get(i);
				if(modMap == null || !modMap.containsKey("mod")){
					continue;
				}
				StringBeanSet strBean = new StringBeanSet();
				String strMod = MapUtils.getString(modMap, "mod", "");
				strBean.setStrBean(strMod);
				strBeanList.add(strBean);
			}
		}

		return strBeanList;
	}

	/**
	 * 组装－业务信息_附属销售品[订购、续订、变更、退订]，主销售品[退订、注销]
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_3(Map<String, Object> event, int orderSeq, int oeSize, boolean attachFlag,List<Map<String, Object>> finalAttachMap){
		if(MapUtils.isEmpty(event)){
			return null;
		}

		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if (orderSeq <= oeSize && orderSeq != SysConstant.INT_1) {
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}

		List<OEAttachOfferSet> attachOfferList = new ArrayList<OEAttachOfferSet>();
		OEAttachOfferSet attachOfferSet = new OEAttachOfferSet();
		// 设置附属销售品业务_标题
		String boActionTypeCd = "";
		String relaAcceNbr="";
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = (Map<String, Object>) event.get("orderEventTitle");
			boActionTypeCd = MapUtils.getString(titleMap, "boActionTypeCd", "");
			relaAcceNbr= MapUtils.getString(titleMap,"relaAcceNbr","");
			if ("7".equals(boActionTypeCd) && attachFlag) {
				return null;
			}
			List<StringBeanSet> attachOfferTitle = new ArrayList<StringBeanSet>();
			if (null != event.get("orderEventCont")) {
				if (event.get("orderEventCont") instanceof Map) {
					attachOfferTitle = buildOrderEvent_3_Title_normal(oeSize, orderSeq, titleMap, event);
				} else if (event.get("orderEventCont") instanceof List) {
					attachOfferTitle = buildOrderEvent_3_Title(oeSize, orderSeq, titleMap);
				}
			} else {
				attachOfferTitle = buildOrderEvent_3_Title(oeSize, orderSeq, titleMap);
			}
			if(null != attachOfferTitle && attachOfferTitle.size() > 0){
				attachOfferSet.setAttachOfferTitle(attachOfferTitle);
			}
		}
		List<StringBeanSet> attachOfferCont = new ArrayList<StringBeanSet>();
		// 设置附属销售品业务_内容
		if(event.containsKey("orderEventCont")){
			if("7".equals(boActionTypeCd) && finalAttachMap != null && finalAttachMap.size() > 0){
				attachOfferCont = buildOrderEvent_3_Cont(finalAttachMap);
			}
			else{
                boolean useOld=false;
				if (useOld&&event.get("orderEventCont") instanceof Map) {
					List<Map<String, Object>> list=new ArrayList<Map<String, Object>>();
					list.add((Map<String, Object>) event.get("orderEventCont"));
					if(null!=event.get("orderEventCont")&&list.size()==1) {
						int baseCount = 0;
						Map<String, Object> orderEventContMap = list.get(0);
						if (orderEventContMap.size() > 1) baseCount = 1;
						//手机号码
						List<AcceNbrBaseSet> acceNbrBaseSetList = new ArrayList<AcceNbrBaseSet>();
						AcceNbrBaseSet acceNbrBaseSet = buildOE_3_PhoneNumber(baseCount, relaAcceNbr);
						if (acceNbrBaseSet != null) {
							baseCount++;
							acceNbrBaseSetList.add(acceNbrBaseSet);
							attachOfferSet.setAcceNbrBaseList(acceNbrBaseSetList);
						}
						//叠加包超出资费
						if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "baseAttachOfferInfos"))) {
							List<BaseAttachOfferInfosSet> baseAttachOfferInfosSetList = new ArrayList<BaseAttachOfferInfosSet>();
							BaseAttachOfferInfosSet baseAttachOfferInfosSet = buildOE_3_OsBaseInfo_V2(baseCount, (List<Map<String, Object>>) orderEventContMap.get("baseAttachOfferInfos"));
							if (baseAttachOfferInfosSet != null) {
								baseCount++;
								baseAttachOfferInfosSetList.add(baseAttachOfferInfosSet);
								attachOfferSet.setBaseAttachOfferInfosList(baseAttachOfferInfosSetList);
							}
						}
						//叠加包超出资费
						if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "outAttachOfferInfos"))) {
							List<OSOrderInfoSet> osOrderInfoSetList = new ArrayList<OSOrderInfoSet>();
							OSOrderInfoSet osOrderInfoSet = buildOE_3_OrderInfo(baseCount, (List<Map<String, Object>>) orderEventContMap.get("outAttachOfferInfos"));
							if (osOrderInfoSet != null) {
								baseCount++;
								osOrderInfoSetList.add(osOrderInfoSet);
								attachOfferSet.setOsOrderInfoList(osOrderInfoSetList);
							}
						}
						//其它说明
						if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "otherAttachOfferInfos"))) {
							List<OSOtherInfoSet> osOtherInfoSetList = new ArrayList<OSOtherInfoSet>();
							OSOtherInfoSet osOtherInfoSet = buildOE_3_OtherInfo(baseCount, (List<Map<String, Object>>) orderEventContMap.get("otherAttachOfferInfos"));
							if (osOtherInfoSet != null) {
								baseCount++;
								osOtherInfoSetList.add(osOtherInfoSet);
								attachOfferSet.setOsOtherInfoList(osOtherInfoSetList);
							}
						}
						//套餐优惠
						if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "osPrompInfo"))) {
							List<OSPrompInfoSet> osPrompInfoSetList = new ArrayList<OSPrompInfoSet>();
							OSPrompInfoSet osPrompInfoSet = buildOE_3_PrompInfo(baseCount, orderEventContMap);
							if (osPrompInfoSet != null) {
								baseCount++;
								osPrompInfoSetList.add(osPrompInfoSet);
								attachOfferSet.setOsPrompInfoList(osPrompInfoSetList);
							}
						}
					}else{
						attachOfferCont=buildOrderEvent_3_Cont(list);
					}
				} else if (event.get("orderEventCont") instanceof Map) {
                    attachOfferCont = buildOrderEvent_3_Cont_normal((Map<String, Object>) event.get("orderEventCont"), relaAcceNbr);
                } else {
					attachOfferCont = buildOrderEvent_3_Cont((List<Map<String, Object>>) event.get("orderEventCont"));
				}
			}

			if(null != attachOfferCont && attachOfferCont.size() > 0){
				attachOfferSet.setAttachOfferCont(attachOfferCont);
			}
		}

		attachOfferList.add(attachOfferSet);
		orderEvent.setAttachOfferList(attachOfferList);

		return orderEvent;
	}


    /**
     * 组装－业务信息_附属销售品_标题(临时用两个月)
     * @param jsonObj
     * @param tolNbr
     * @param orderSeq
     * @param event
     * @return
     */
    @Deprecated
    private List<StringBeanSet> buildOrderEvent_3_Title_normal(int tolNbr, int orderSeq, Map<String, Object> titleMap, Map<String, Object> event) {
        if (MapUtils.isEmpty(titleMap)) {
            return null;
        }
        List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
        StringBeanSet strBean = new StringBeanSet();

        String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
        String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
        String prodSpecParam = MapUtils.getString(titleMap, "prodSpecParam", "");
        String effectRule = MapUtils.getString(titleMap, "effectRule", "");
        String monthPrice = "";

        Map<String, Object> oeContMap = (Map<String, Object>) event.get("orderEventCont");
        if (MapUtils.isNotEmpty(oeContMap)) {
            ArrayList<Map<String, Object>> baseList = (ArrayList<Map<String, Object>>) oeContMap.get("baseAttachOfferInfos");
            if (baseList != null && baseList.size() > 1) {
                monthPrice=MapUtils.getString(baseList.get(0), "itemParam");
                baseList.remove(0);
            }
        }
        String tmpStr = (tolNbr == SysConstant.INT_1 ? "" : (ChsStringUtil.getSeqNumByInt(orderSeq) + SysConstant.STR_PAU))
                + (StringUtils.isEmpty(boActionTypeName) ? "" : (SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE))
                + (StringUtils.isEmpty(prodSpecName) ? "" : prodSpecName)
                + (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE))
                + (StringUtils.isEmpty(prodSpecParam) ? "" : (SysConstant.STR_SPE + prodSpecParam + SysConstant.STR_SPI))
                + (StringUtils.isEmpty(monthPrice)?"":(SysConstant.STR_SEP+monthPrice+"元/月")+SysConstant.STR_SPI);
        strBean.setStrBean(tmpStr);
        attachOfferList.add(strBean);
        return attachOfferList;
    }

    /**
	 * 组装－业务信息_附属销售品_标题(公用)
	 * @param tolNbr
	 * @param orderSeq
	 * @param jsonObj
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_3_Title(int tolNbr, int orderSeq, Map<String, Object> titleMap){
		if(MapUtils.isEmpty(titleMap)){
			return null;
		}

		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet();

		String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
		String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
		String prodSpecParam = MapUtils.getString(titleMap, "prodSpecParam", "");
		String effectRule = MapUtils.getString(titleMap, "effectRule", "");
		String relaAcceNbr = MapUtils.getString(titleMap, "relaAcceNbr", "");

		String tmpStr = (tolNbr == SysConstant.INT_1 ? "" : (ChsStringUtil.getSeqNumByInt(orderSeq) + SysConstant.STR_PAU))
			+ (StringUtils.isEmpty(boActionTypeName) ? "" : (SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE))
			+ (StringUtils.isEmpty(prodSpecName) ? "" : prodSpecName)
			+ (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE + SysConstant.STR_SPI))
			+ (StringUtils.isEmpty(prodSpecParam) ? "" : (SysConstant.STR_SPE + prodSpecParam + SysConstant.STR_SPI))
			+ (StringUtils.isEmpty(relaAcceNbr) ? "" : (SysConstant.STR_SPE + "用户号码" + SysConstant.STR_SEP + relaAcceNbr));
//		if(prodSpecName.equals("加装手机")){
//			tmpStr += "\n" + relaAcceNbr + "（新开户）（副卡）；";
//			String mainProdOffer = MapUtils.getString(titleMap, "mainProdOffer", "");
//			String mainAccessNumber = MapUtils.getString(titleMap, "mainAccessNumber", "");
//			tmpStr = tmpStr + "\n关联主套餐：" + (StringUtils.isEmpty(mainProdOffer) ? "" : mainProdOffer) + ";用户号码：" + mainAccessNumber+ "（已有）（主卡）";
//		}

		strBean.setStrBean(tmpStr);
		attachOfferList.add(strBean);

		return attachOfferList;
	}

    /**
	 * 组装－业务信息_附属销售品_标题(公用)
	 * @param jsonObj
	 * @param tolNbr
	 * @param orderSeq
	 * @param hasAcceNbr
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_3_Title_V2(int tolNbr, int orderSeq, boolean hasAcceNbr, Map<String, Object> titleMap){
		if(MapUtils.isEmpty(titleMap)){
			return null;
		}

		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet();

		String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
		String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
		String prodSpecParam = MapUtils.getString(titleMap, "prodSpecParam", "");
		String effectRule = MapUtils.getString(titleMap, "effectRule", "");
		String relaAcceNbr = MapUtils.getString(titleMap, "relaAcceNbr", "");
		String offerTypeName = MapUtils.getString(titleMap, "offerTypeName", "");
		String price = MapUtils.getString(titleMap, "price", "");

		String tmpStr = (tolNbr == SysConstant.INT_1 ? "" : (ChsStringUtil.getSeqNumByInt(orderSeq) + SysConstant.STR_PAU))
			+ (StringUtils.isEmpty(boActionTypeName) ? "" : (SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE))
			+ (StringUtils.isEmpty(prodSpecName) ? "" : prodSpecName)
			+ (StringUtils.isEmpty(effectRule) ? "" : (SysConstant.STR_SPE + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE + SysConstant.STR_SPI))
			+ (StringUtils.isEmpty(prodSpecParam) ? "" : (SysConstant.STR_SPE + prodSpecParam + SysConstant.STR_SPI))
			+ (StringUtils.isEmpty(offerTypeName) ? "" : offerTypeName);
		if (!hasAcceNbr) {
			tmpStr += (StringUtils.isEmpty(relaAcceNbr) ? "" : (SysConstant.STR_SPE + "用户号码" + SysConstant.STR_SEP + relaAcceNbr));
		}
		tmpStr+=price;

		strBean.setStrBean(tmpStr);
		attachOfferList.add(strBean);

		return attachOfferList;
	}
	/**
	 * 组装－业务信息_附属销售品_内容
	 * @param jsonArrayParam
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_3_Cont(List<Map<String, Object>> contList){
		if (contList == null || contList.size() == 0) {
			return null;
		}

		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		int len = contList.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> contMap = contList.get(i);
			StringBeanSet strBean = new StringBeanSet();

			String actionType = MapUtils.getString(contMap, "actionName", "");
			String itemName = MapUtils.getString(contMap, "itemName", "");
			String itemParam = MapUtils.getString(contMap, "itemParam", "");
			String itemDesc = MapUtils.getString(contMap, "itemDesc", "");
			String effectRule = MapUtils.getString(contMap, "effectRule", "");
			String relaAcceNbr = MapUtils.getString(contMap, "relaAcceNbr", "");

			strBean.setStrBean(buildOE_1_AttachOffer_Serv_Cont(len, i + 1, actionType, itemName, itemParam, itemDesc, effectRule, relaAcceNbr));

			attachOfferList.add(strBean);
		}

		return attachOfferList;
	}
	/**
	 * 组装－业务信息_附属销售品_内容
	 * @param jsonArrayParam
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_3_Cont_normal(Map<String, Object> contMap,String relaAcceNbr){
		if(MapUtils.isEmpty(contMap))
            return null;
        int tmpCount=1;
		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
        StringBeanSet strBean = new StringBeanSet();
        strBean.setStrBean(addNumber4String(tmpCount++,"订购号码"+SysConstant.STR_SEP+relaAcceNbr)+SysConstant.STR_SPI);
        attachOfferList.add(strBean);
        ArrayList<Map<String, Object>> baseList = (ArrayList<Map<String, Object>>) contMap.get("baseAttachOfferInfos");
        if (baseList!=null&&baseList.size()>0){
            for (Map<String, Object> map : baseList) {
                StringBeanSet stringBeanSet = new StringBeanSet();
                stringBeanSet.setStrBean(addNumber4String(tmpCount++,"包含"+SysConstant.STR_SEP+MapUtils.getString(map,"itemName","")+SysConstant.STR_SPE+MapUtils.getString(map,"itemParam","")+MapUtils.getString(map,"itemUnit","")));
                attachOfferList.add(stringBeanSet);
            }
        }
		if (StringUtils.isNotBlank(MapUtils.getString(contMap, "osOrderInfo"))) {
			StringBeanSet strOrderInfo = new StringBeanSet();
			strOrderInfo.setStrBean(addNumber4String(tmpCount++, "订购当月资费" + SysConstant.STR_SEP + MapUtils.getString(contMap, "osOrderInfo")));
			attachOfferList.add(strOrderInfo);
		}
		ArrayList<Map<String, Object>> otherList = (ArrayList<Map<String, Object>>) contMap.get("otherAttachOfferInfos");
        if(otherList!=null&&otherList.size()>0){
            for (Map<String, Object> map : otherList) {
                StringBeanSet stringBeanSet = new StringBeanSet();
                stringBeanSet.setStrBean(addNumber4String(tmpCount++,MapUtils.getString(map,"item")));
                attachOfferList.add(stringBeanSet);
            }
        }
		return attachOfferList;
	}

    /**
     * 拼接数字与字符串
     * @param count
     * @param s
     * @return
     */
    private String addNumber4String(int count, String s) {
        return count + SysConstant.STR_PAU + s;
    }

	/**
	 * 组装－业务信息_附属销售品_内容_其它说明
	 * @param orderSeq
	 * @param paramList
	 * @return
	 */
	private OSOtherInfoSet buildOE_3_OtherInfo(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null || paramList.size() == 0) {
			return null;
		}
		OSOtherInfoSet otherInfoSet = new OSOtherInfoSet();
		List<StringBeanSet> otherInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, "其它说明"));
		otherInfoTitle.add(strBeanTitle);
		otherInfoSet.setOtherInfoTitle(otherInfoTitle);
		List<StringBeanSet> osOtherInfos = new ArrayList<StringBeanSet>();
		int len = paramList.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> paramMap = paramList.get(i);
			if (paramMap != null && paramMap.containsKey("item")) {
				StringBeanSet strBean = new StringBeanSet(buildOE_3_OtherInfo_Cont(len, i+1, MapUtils.getString(paramMap, "item")));
				osOtherInfos.add(strBean);
			}
		}
		otherInfoSet.setOsOtherInfos(osOtherInfos);
		return otherInfoSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_其它说明_带序号
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private String buildOE_3_OtherInfo_Cont(int tolNbr, int orderSeq, String strParam){
		if(StringUtils.isEmpty(strParam)){
			return null;
		}

		if(tolNbr == SysConstant.INT_1){
			return strParam;
		} else {
			return orderSeq + SysConstant.STR_RL_BRE + SysConstant.STR_SPE + strParam;
		}
	}
	/**
	 * 组装－业务信息_附属销售品_内容_套餐优惠
	 * @param baseCount
	 * @param orderEventContMap
	 * @return
	 */
	private OSPrompInfoSet buildOE_3_PrompInfo(int baseCount, Map<String, Object> orderEventContMap) {
		OSPrompInfoSet osPrompInfoSet=new OSPrompInfoSet();
		List<StringBeanSet> oTitle = new ArrayList<StringBeanSet>();
		List<StringBeanSet> oInfo = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, "套餐优惠"));
		StringBeanSet strBeanCont = new StringBeanSet(MapUtils.getString(orderEventContMap, "osPrompInfo"));
		oTitle.add(strBeanTitle);
		oInfo.add(strBeanCont);
		osPrompInfoSet.setPrompInfoTitle(oTitle);
		osPrompInfoSet.setOsPrompInfos(oInfo);
		return osPrompInfoSet;
	}
	/**
	 * 组装－业务信息_附属销售品_内容_套餐优惠
	 * @param baseCount
	 * @param orderEventContMap
	 * @return
	 */
	private OSPrompInfoSet buildOE_3_PrompInfo_V2(int baseCount, Map<String, Object> orderEventContMap) {
		List<Map<String, Object>> osPrompInfoMap = (List<Map<String, Object>>) MapUtils.getObject(orderEventContMap, "osPrompInfo");
		OSPrompInfoSet osPrompInfoSet = new OSPrompInfoSet();
		if (null != osPrompInfoMap && osPrompInfoMap.size() > 0) {
			List<StringBeanSet> oTitle = new ArrayList<StringBeanSet>();
			StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, getDetailName(osPrompInfoMap.get(0))));
			oTitle.add(strBeanTitle);
			osPrompInfoSet.setPrompInfoTitle(oTitle);

			List<StringBeanSet> oInfo = new ArrayList<StringBeanSet>();
			StringBeanSet strBeanCont = new StringBeanSet(buildBizReportDetailItemAndDescDto(osPrompInfoMap, true));
			oInfo.add(strBeanCont);
			osPrompInfoSet.setOsPrompInfos(oInfo);
		}
		return osPrompInfoSet;
	}

	/**
	 * 组装－业务信息_附属销售品_内容_叠加包基本信息
	 * @param baseCount
	 * @param baseAttachOfferInfos
	 * @return
	 */

	private BaseAttachOfferInfosSet buildOE_3_BaseAttachOfferInfos(int baseCount, List<Map<String, Object>> baseAttachOfferInfos) {
		if (baseAttachOfferInfos == null || baseAttachOfferInfos.size() == 0) {
			return null;
		}
		BaseAttachOfferInfosSet baseAttachOfferInfosSet = new BaseAttachOfferInfosSet();
		List<StringBeanSet> oTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCostTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, "基本信息"));
		oTitle.add(strBeanCostTitle);
		baseAttachOfferInfosSet.setBaseAttachOfferTitle(oTitle);
		int len = baseAttachOfferInfos.size();
		String bodyStr = "";
		for (int j = 0; j < len; j++) {
			Map<String, Object> attachOfferInfoMap = baseAttachOfferInfos.get(j);
			String tmpItemName = MapUtils.getString(attachOfferInfoMap, "itemName", "");
			String tmpItemParam = MapUtils.getString(attachOfferInfoMap, "itemParam", "");
			String tmpItemUnit = MapUtils.getString(attachOfferInfoMap, "itemUnit", "");
			bodyStr += tmpItemName + tmpItemParam + tmpItemUnit+ SysConstant.STR_SPI + SysConstant.STR_ENT;
		}
		if(bodyStr.endsWith(SysConstant.STR_ENT)) {
			bodyStr = bodyStr.substring(0, bodyStr.length() - SysConstant.STR_ENT.length());
		}
		List<StringBeanSet> oInfo = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanInfos = new StringBeanSet(bodyStr);
		oInfo.add(strBeanInfos);
		baseAttachOfferInfosSet.setBaseAttachOfferInfos(oInfo);
		return baseAttachOfferInfosSet;
	}

	/**
	 * 组装－业务信息_附属销售品_内容_叠加包超出资费
	 * @param baseCount
	 * @param outAttachOfferInfos
	 * @return
	 */

	private OSOrderInfoSet buildOE_3_OrderInfo(int baseCount, List<Map<String, Object>> outAttachOfferInfos) {
		if (outAttachOfferInfos == null || outAttachOfferInfos.size() == 0) {
			return null;
		}
		OSOrderInfoSet osOrderInfoSet = new OSOrderInfoSet();
		List<StringBeanSet> oTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCostTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, "叠加包超出资费"));
		oTitle.add(strBeanCostTitle);
		osOrderInfoSet.setOrderInfoTitle(oTitle);
		List<StringBeanSet> oInfo = new ArrayList<StringBeanSet>();
		int len = outAttachOfferInfos.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> outMap = outAttachOfferInfos.get(i);
			if (outMap != null && outMap.containsKey("itemName")) {
				StringBeanSet strBean = new StringBeanSet(buildOE_3_OrderInfo_Cont(len, i + 1, MapUtils.getString(outMap, "itemName")));
				oInfo.add(strBean);
			}
		}
		osOrderInfoSet.setOsOrderInfos(oInfo);
		return osOrderInfoSet;
	}

	/**
	 * 组装－业务信息_附属销售品_内容_超出资费_带序号
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private String buildOE_3_OrderInfo_Cont(int tolNbr, int orderSeq, String strParam){
		if(StringUtils.isEmpty(strParam)){
			return null;
		}

		if(tolNbr == SysConstant.INT_1){
			return strParam;
		} else {
			return orderSeq + SysConstant.STR_RL_BRE + SysConstant.STR_SPE + strParam;
		}
	}

	/**
	 * 组装－业务信息_附属销售品_内容_手机号码
	 * @param orderSeq
	 * @param strParam
	 * @return
	 */
	private AcceNbrBaseSet buildOE_3_PhoneNumber(int baseCount, String relaAcceNbr) {
		StringBeanSet strBeanPhoneNumberTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, "手机号码"));
		AcceNbrBaseSet acceNbrBaseSet = new AcceNbrBaseSet();
		StringBeanSet strBeanPhoneNumberCont = new StringBeanSet(relaAcceNbr);
		List<StringBeanSet> pTitle = new ArrayList<StringBeanSet>();
		List<StringBeanSet> pInfo = new ArrayList<StringBeanSet>();
		pTitle.add(strBeanPhoneNumberTitle);
		pInfo.add(strBeanPhoneNumberCont);
		acceNbrBaseSet.setAcceNbrBaseTitle(pTitle);
		acceNbrBaseSet.setAcceNbrBaseInfo(pInfo);
		return acceNbrBaseSet;
	}
	/**
	 * 组装－业务信息_附属销售品_内容_手机号码
	 * @param userAcceNbrsList
	 * @param baseCount
	 * @return
	 */
	private AcceNbrBaseSet buildOE_3_UserAcceNbrs_V2(int baseCount, List<Map<String, Object>> userAcceNbrsList) {

		StringBeanSet strBeanPhoneNumberTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, getDetailName(userAcceNbrsList.get(0))));

		AcceNbrBaseSet acceNbrBaseSet = new AcceNbrBaseSet();
		List<StringBeanSet> pTitle = new ArrayList<StringBeanSet>();
		pTitle.add(strBeanPhoneNumberTitle);

		List<StringBeanSet> pInfo = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanPhoneNumberCont = new StringBeanSet(buildBizReportDetailItemAndDescDto(userAcceNbrsList,false));
		pInfo.add(strBeanPhoneNumberCont);

		acceNbrBaseSet.setAcceNbrBaseTitle(pTitle);
		acceNbrBaseSet.setAcceNbrBaseInfo(pInfo);
		return acceNbrBaseSet;
	}


	/**
	 * 组装－业务信息_
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_4(Map<String, Object> event, int orderSeq, int oeSize){
		OrderEventSet orderEvent = new OrderEventSet();

		return orderEvent;
	}
	/**
	 * 组装－业务信息_产品变更
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_5(Map<String, Object> event, int orderSeq, int oeSize, int speCustInfoLen, boolean attachFlag){
		if(null == event){
			return null;
		}

		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if(orderSeq <= oeSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}

		List<OEProdChangeSet> prodChangeList = new ArrayList<OEProdChangeSet>();
		OEProdChangeSet prodChangeSet = new OEProdChangeSet();
		// 设置产品变更_标题
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
			//如果是客户新建和账户新建，则跳过，返回null，使得orderEventSeq不变
			String boActionTypeCd = MapUtils.getString(titleMap, "boActionTypeCd", "");
			if ("C1".equals(boActionTypeCd) || "A1".equals(boActionTypeCd)) {
				return null;
			}
			if ("1".equals(boActionTypeCd) && attachFlag) {
				return null;
			}
			String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
			List<StringBeanSet> prodChangeTitle = buildOrderEvent_3_Title(oeSize, orderSeq, titleMap);
			prodChangeSet.setProdChangeTitle(prodChangeTitle);
			String relaAcceNbr = MapUtils.getString(titleMap, "relaAcceNbr", "");
			List<StringBeanSet> lineProdChangeInfos = new ArrayList<StringBeanSet>();
			if("加装手机".equals(prodSpecName)){
			    count ++ ;
			    StringBeanSet item = new StringBeanSet();
				comment += relaAcceNbr + "（新开户）（副卡）；" ;
				item.setStrBean(comment);
				lineProdChangeInfos.add(item);
				String mainProdOffer = MapUtils.getString(titleMap, "mainProdOffer", "");
				String mainAccessNumber = MapUtils.getString(titleMap, "mainAccessNumber", "");
				item = new StringBeanSet();
				item.setStrBean("关联主套餐：" + (StringUtils.isEmpty(mainProdOffer) ? "" : mainProdOffer) + ";" + "用户号码：" + mainAccessNumber+ "（已有）（主卡）");
				//item.setStrBean1("用户号码：" + mainAccessNumber+ "（已有）（主卡）");
				lineProdChangeInfos.add(item);
				item = new StringBeanSet();
				String donateValue = MapUtils.getString(titleMap, "donateValue", "");
				item.setStrBean((StringUtils.isEmpty(donateValue) ? "" : donateValue) + ";");
				lineProdChangeInfos.add(item);
			}
			if (lineProdChangeInfos.size() > 0) {
				prodChangeSet.setLineProdChangeInfos(lineProdChangeInfos);
			}
		}

		// 设置产品变更_内容
		if(event.containsKey("orderEventCont")){
			List<Map<String, Object>> contList = (List<Map<String, Object>>) event.get("orderEventCont");
			Map<String, Object> itemsMap = dealOneLineItems(contList);
			if(MapUtils.isNotEmpty(itemsMap)){
				List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
				List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");

				// 变更类的业务，需要对于半行展示内容进行长度超出预处理
				Map<String, Object> itemsNewMap = dealStrLenItems(normList, speCustInfoLen);
				List<Map<String, Object>> normNewList = (List<Map<String, Object>>) itemsNewMap.get("norm");
				List<Map<String, Object>> lineNewList = (List<Map<String, Object>>) itemsNewMap.get("line");

				if (lineNewList != null && lineNewList.size() > 0) {
					if (lineList == null) {
						lineList = new ArrayList<Map<String,Object>>();
					}
					lineList.addAll(lineNewList);
				}

				normList = normNewList;
				if(normList != null && normList.size() > 0){
					List<StringTwoSet> prodChangeInfos = new ArrayList<StringTwoSet>();

					for (int i=0; i < normList.size(); i++) {
						Map<String, Object> normMap = normList.get(i);

						StringTwoSet itemTwo = new StringTwoSet();
						String itemName0 = MapUtils.getString(normMap, "itemName0", "");
						String itemValue0 = MapUtils.getString(normMap, "itemValue0", "");
						String itemName1 = MapUtils.getString(normMap, "itemName1", "");
						String itemValue1 = MapUtils.getString(normMap, "itemValue1", "");
						if(StringUtils.isNotEmpty(itemName0)){
							itemTwo.setStrBean0(itemName0 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue0);
						}
//						if(StringUtils.isEmpty(itemName0) && StringUtils.isEmpty(itemValue0)){
//							itemTwo.setStrBean0(itemName0 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue0);
//						}
						if(StringUtils.isNotEmpty(itemName1)){
							itemTwo.setStrBean1(itemName1 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue1);
						}

						prodChangeInfos.add(itemTwo);
					}

					if(prodChangeInfos.size() > 0){
						prodChangeSet.setProdChangeInfos(prodChangeInfos);
					}
				}

				if (lineList != null && lineList.size() > 0) {
					List<StringBeanSet> lineProdChangeInfos = new ArrayList<StringBeanSet>();

					for (int i = 0; i < lineList.size(); i++) {
						Map<String, Object> lineMap = lineList.get(i);
						StringBeanSet item = new StringBeanSet();

						String itemName0 = MapUtils.getString(lineMap, "itemName0", "");
						String itemValue0 = MapUtils.getString(lineMap, "itemValue0", "");
						String itemName1 = MapUtils.getString(lineMap, "itemName1", "");
						String itemValue1 = MapUtils.getString(lineMap, "itemValue1", "");
						if(StringUtils.isEmpty(itemName0) && StringUtils.isEmpty(itemValue0)){

						}else{
							item.setStrBean(itemName0 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue0);
							lineProdChangeInfos.add(item);
						}
						item = new StringBeanSet();
						if(StringUtils.isEmpty(itemName1) && StringUtils.isEmpty(itemValue1)){

						}else{
							item.setStrBean(itemName1 + SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue1);
							lineProdChangeInfos.add(item);
						}
					}
					if (lineProdChangeInfos.size() > 0) {
						prodChangeSet.setLineProdChangeInfos(lineProdChangeInfos);
					}
				}
			}
		}

		prodChangeList.add(prodChangeSet);
		orderEvent.setProdChangeList(prodChangeList);
		return orderEvent;
	}
	/**
	 * 组装－业务信息_产品变更
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_5_V2(Map<String, Object> event, int orderSeq, int oeSize, int speCustInfoLen, boolean attachFlag){
		if(null == event){
			return null;
		}

		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if(orderSeq <= oeSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}

		List<OEProdChangeSet> prodChangeList = new ArrayList<OEProdChangeSet>();
		OEProdChangeSet prodChangeSet = new OEProdChangeSet();
		// 设置产品变更_标题
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
			//如果是客户新建和账户新建，则跳过，返回null，使得orderEventSeq不变
			String boActionTypeCd = MapUtils.getString(titleMap, "boActionTypeCd", "");
			if ("C1".equals(boActionTypeCd) || "A1".equals(boActionTypeCd)) {
				return null;
			}
			if ("1".equals(boActionTypeCd) && attachFlag) {
				return null;
			}
			String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
			List<StringBeanSet> prodChangeTitle = buildOrderEvent_3_Title(oeSize, orderSeq, titleMap);
			prodChangeSet.setProdChangeTitle(prodChangeTitle);
			String relaAcceNbr = MapUtils.getString(titleMap, "relaAcceNbr", "");
			List<StringBeanSet> lineProdChangeInfos = new ArrayList<StringBeanSet>();
			if("加装手机".equals(prodSpecName)){
			    count ++ ;
			    StringBeanSet item = new StringBeanSet();
				comment += relaAcceNbr + "（新开户）（副卡）；" ;
				item.setStrBean(comment);
				lineProdChangeInfos.add(item);
				String mainProdOffer = MapUtils.getString(titleMap, "mainProdOffer", "");
				String mainAccessNumber = MapUtils.getString(titleMap, "mainAccessNumber", "");
				item = new StringBeanSet();
				item.setStrBean("关联主套餐：" + (StringUtils.isEmpty(mainProdOffer) ? "" : mainProdOffer) + ";" + "用户号码：" + mainAccessNumber+ "（已有）（主卡）");
				//item.setStrBean1("用户号码：" + mainAccessNumber+ "（已有）（主卡）");
				lineProdChangeInfos.add(item);
				item = new StringBeanSet();
				String donateValue = MapUtils.getString(titleMap, "donateValue", "");
				item.setStrBean((StringUtils.isEmpty(donateValue) ? "" : donateValue) + ";");
				lineProdChangeInfos.add(item);
			}
			if (lineProdChangeInfos.size() > 0) {
				prodChangeSet.setLineProdChangeInfos(lineProdChangeInfos);
			}
		}

		// 设置产品变更_内容
		if(event.containsKey("orderEventCont")){
			List<Map<String, Object>> contList = (List<Map<String, Object>>) event.get("orderEventCont");
			Map<String, Object> itemsMap = dealOneLineItems(contList);
			if(MapUtils.isNotEmpty(itemsMap)){
				List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
				List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");

				// 变更类的业务，需要对于半行展示内容进行长度超出预处理
				Map<String, Object> itemsNewMap = dealStrLenItems(normList, speCustInfoLen);
				List<Map<String, Object>> normNewList = (List<Map<String, Object>>) itemsNewMap.get("norm");
				List<Map<String, Object>> lineNewList = (List<Map<String, Object>>) itemsNewMap.get("line");
				if (null != lineNewList) {
					if (null != normNewList) {
						lineNewList.addAll(0, normNewList);
					}
				} else {
					lineNewList = new ArrayList<Map<String, Object>>();
					if (null != normNewList) {
						lineNewList.addAll(0, normNewList);
					}
				}
				if (lineNewList != null && lineNewList.size() > 0) {
					if (lineList == null) {
						lineList = new ArrayList<Map<String,Object>>();
					}
					lineList.addAll(lineNewList);
				}

				if (lineList != null && lineList.size() > 0) {
					List<StringBeanSet> lineProdChangeInfos = new ArrayList<StringBeanSet>();

					for (int i = 0; i < lineList.size(); i++) {
						Map<String, Object> lineMap = lineList.get(i);
						StringBeanSet item = new StringBeanSet();

						String itemName0 = MapUtils.getString(lineMap, "itemName0", "");
						String itemValue0 = MapUtils.getString(lineMap, "itemValue0", "");
						String itemName1 = MapUtils.getString(lineMap, "itemName1", "");
						String itemValue1 = MapUtils.getString(lineMap, "itemValue1", "");
						if(StringUtils.isEmpty(itemName0) && StringUtils.isEmpty(itemValue0)){

						}else{
							item.setStrBean(itemName0 + (StringUtils.isNotBlank(itemValue0)?( SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue0):""));
							lineProdChangeInfos.add(item);
						}
						item = new StringBeanSet();
						if(StringUtils.isEmpty(itemName1) && StringUtils.isEmpty(itemValue1)){

						}else{
							item.setStrBean(itemName1 +(StringUtils.isNotBlank(itemValue0)?(  SysConstant.STR_SEP + SysConstant.STR_SPE + itemValue1):""));
							lineProdChangeInfos.add(item);
						}
					}
					if (lineProdChangeInfos.size() > 0) {
						prodChangeSet.setLineProdChangeInfos(lineProdChangeInfos);
					}
				}
			}
		}

		prodChangeList.add(prodChangeSet);
		orderEvent.setProdChangeList(prodChangeList);
		return orderEvent;
	}
	/**
	 * 组装－业务信息_
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_6(Map<String, Object> event, int orderSeq, int eventSize){
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置业务信息_分隔线
		if(orderSeq <= eventSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}
		List<OEAttachOfferSet> attachOfferList = new ArrayList<OEAttachOfferSet>();
		OEAttachOfferSet set = new OEAttachOfferSet();
		List<StringBeanSet> aotList = new ArrayList<StringBeanSet>();

		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
		String relaAcceNbr = "";
		if(event.containsKey("orderEventTitle")){
			String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
			relaAcceNbr = MapUtils.getString(titleMap, "relaAcceNbr", "");
			String offerSpecName = MapUtils.getString(titleMap, "offerSpecName", "");
			StringBeanSet sbs = buildOrderEvent_6_Title(eventSize,orderSeq,boActionTypeName,offerSpecName);
			aotList.add(sbs);
		}

		if(event.containsKey("orderEventCont")){
			Map<String, Object> map = (Map<String, Object>) event.get("orderEventCont");
			List<Map<String, Object>> contList = (List<Map<String, Object>>) map.get("preFeeMods");
		    set.setAttachOfferCont(buildOrderEvent_6_Cont(contList,relaAcceNbr));
		}
		set.setAttachOfferTitle(aotList);
		attachOfferList.add(set);
		orderEvent.setAttachOfferList(attachOfferList);
		return orderEvent;
	}

	/**
	 * 组装－业务信息_
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_8(Map<String, Object> event, int orderSeq, int eventSize){
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置业务信息_分隔线
		if(orderSeq <= eventSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}
		List<OEAttachOfferSet> attachOfferList = new ArrayList<OEAttachOfferSet>();
		OEAttachOfferSet set = new OEAttachOfferSet();
		List<StringBeanSet> aotList = new ArrayList<StringBeanSet>();

		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		if(event.containsKey("orderEventTitle")){
			String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
			StringBeanSet sbs = buildOrderEvent_8_Title(eventSize, orderSeq, prodSpecName);
			aotList.add(sbs);
		}

		if(event.containsKey("orderEventCont")){
			Map<String, Object> map = MapUtils.getMap(event,"orderEventCont");
		    set.setAttachOfferCont(buildOrderEvent_8_Cont(map,orderSeq));
		}
		set.setAttachOfferTitle(aotList);
		attachOfferList.add(set);
		orderEvent.setAttachOfferList(attachOfferList);
		return orderEvent;
	}

	/**
	 * 组装－业务信息_存费送费_内容
	 * @param jsonArrayParam
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_6_Cont(List<Map<String, Object>> contList,String relaAcceNbr){
		if (contList == null || contList.size() == 0) {
			return null;
		}
		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		int len = contList.size();
		StringBuffer rstStr = new StringBuffer();
		rstStr.append("1" + SysConstant.STR_PAU + SysConstant.STR_SPE + SysConstant.STR_SPE + "预存号码 " + " " + SysConstant.STR_SEP + SysConstant.STR_SPE + relaAcceNbr + SysConstant.STR_SPE);
		StringBeanSet strBean1 = new StringBeanSet();
		strBean1.setStrBean(rstStr.toString());
		attachOfferList.add(strBean1);

		for (int i = 0; i < len; i++) {
			Map<String, Object> contMap = contList.get(i);
			StringBeanSet strBean = new StringBeanSet();
			String itemName = MapUtils.getString(contMap, "itemName", "");
			String itemRemark = MapUtils.getString(contMap, "itemRemark", "");
			strBean.setStrBean(buildOE_6_AttachOffer_Serv_Cont(len, i + 2,itemName, itemRemark,relaAcceNbr));
			attachOfferList.add(strBean);
		}
		return attachOfferList;
	}
	/**
	 * 组装－终端预约_内容
	 * @param contList
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_8_Cont(Map<String, Object> map,int seq){
		if (map == null) {
			return null;
		}
		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		StringBuffer rstStr = new StringBuffer();

			StringBeanSet strBean = new StringBeanSet();
			strBean.setStrBean(buildOE_8_AttachOffer_Serv_Cont(map,seq));
			attachOfferList.add(strBean);
		return attachOfferList;
	}

	private String buildOE_6_AttachOffer_Serv_Cont(int tolNbr, int orderSeq, String itemName,String itemRemark,String relaAcceNbr){
		StringBuffer rstStr = new StringBuffer();

	//	if(tolNbr != SysConstant.INT_1 && tolNbr != 1){
		rstStr.append(orderSeq + SysConstant.STR_PAU + SysConstant.STR_SPE);
	//	}
		rstStr.append(SysConstant.STR_SPE + itemName + SysConstant.STR_SPE + SysConstant.STR_SEP);
		rstStr.append(SysConstant.STR_SPE + itemRemark + SysConstant.STR_SPE);
		return rstStr.toString();
	}

	private String buildOE_8_AttachOffer_Serv_Cont(Map<String, Object> contMap,int num) {
		String retStr = "";
		int index = 0;
		String resCode = getItemNameValue(contMap, "resCode", ++index);
		String resType = getItemNameValue(contMap, "resType", (StringUtils.isNotBlank(resCode))?++index:index);
		String resCfg = getItemNameValue(contMap, "resCfg", (StringUtils.isNotBlank(resType))?++index:index);
		String resFee = getItemNameValue(contMap, "resFee", (StringUtils.isNotBlank(resCfg))?++index:index);
		String couponName = getItemNameValue(contMap, "couponName", (StringUtils.isNotBlank(resFee))?++index:index);
		String couponNum = getItemNameValue(contMap, "couponNum", (StringUtils.isNotBlank(couponName))?++index:index);
		if (StringUtils.isNotBlank(resCode)) {
			retStr += (StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + resCode) : resCode;
		}
		if(StringUtils.isNotBlank(resType)){
			retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + resType) : resType;
		}
		if(StringUtils.isNotBlank(resCfg)){
			retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + resCfg) : resCfg;
		}
		if(StringUtils.isNotBlank(resFee)){
			retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + resFee) : resFee;
		}
		if(StringUtils.isNotBlank(couponName)){
			retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + couponName) : couponName;
		}
		if(StringUtils.isNotBlank(couponNum)){
			retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + couponNum) : couponNum;
		}
		Map<String, Object> agrInfo = MapUtils.getMap(contMap, "agrInfo");
		if(null!=agrInfo) {
			String agrInfoName = MapUtils.getString(agrInfo, "itemName","");
			if(StringUtils.isNotBlank(agrInfoName)){
				agrInfoName = index++ + SysConstant.STR_POINT + agrInfoName;
				retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + agrInfoName) : agrInfoName;
			}
			Map<String, Object> valueMap = MapUtils.getMap(agrInfo, "itemValue");
			if (null != valueMap) {
				int tempSeq = 1;
				List<Map<String, Object>> agrPeriod = (List<Map<String, Object>>) MapUtils.getObject(valueMap, "agrPeriod");
				List<Map<String, Object>> offerLevel = (List<Map<String, Object>>) MapUtils.getObject(valueMap, "offerLevel");
				if (null != agrPeriod && agrPeriod.size() == 1) {
					String agrPeriodStr = SysConstant.STR_SPE + (tempSeq++) + ")" + getItemNameValueByMap(agrPeriod.get(0));
					retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + agrPeriodStr) : agrPeriodStr;
				}
				if (null != offerLevel && offerLevel.size() == 1) {
					String offerLevelStr = SysConstant.STR_SPE + (tempSeq++) + ")" + getItemNameValueByMap(offerLevel.get(0));
					retStr+=(StringUtils.isNotBlank(retStr)) ? (SysConstant.STR_ENT + offerLevelStr) : offerLevelStr;
				}
			}
		}
		if (StringUtils.isNotBlank(retStr)) {
			retStr = "预约终端" + num + SysConstant.STR_SEP + SysConstant.STR_ENT + retStr;
		}
		return retStr;
	}

	private String getItemNameValue(Map<String, Object> contMap, String key,int seq) {
		String retStr = "";
		String nameValue = getItemNameValueByMap(MapUtils.getMap(contMap,key));
		if (StringUtils.isNotBlank(nameValue)) {
			retStr += seq + SysConstant.STR_POINT + nameValue;
		}
		return retStr;
	}

	private  String getItemNameValueByMap(Map<String, Object> map) {
		String retStr = "";
		String itemName = MapUtils.getString(map, "itemName", "");
		String itemValue = MapUtils.getString(map, "itemValue", "");
		if (StringUtils.isNotBlank(itemName) && StringUtils.isNotBlank(itemValue)) {
			retStr = itemName + SysConstant.STR_SEP + itemValue;
		}else {
			retStr = itemName + itemValue;
		}
		return retStr;
	}


	private StringBeanSet buildOrderEvent_6_Title(int eventSize,int seq,String boActionTypeName,String offerSpecName) {
			StringBeanSet strBean = new StringBeanSet();
			String titleStr = "";
			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
            titleStr += StringUtils.isEmpty(boActionTypeName) ? "" :
				(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
			titleStr += StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName;
            strBean.setStrBean(titleStr);
			return strBean;
	}

	private StringBeanSet buildOrderEvent_8_Title(int eventSize,int seq,String boActionTypeName) {
			StringBeanSet strBean = new StringBeanSet();
			String titleStr = "";
			titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
            titleStr += StringUtils.isEmpty(boActionTypeName) ? "" :
				(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
            strBean.setStrBean(titleStr);
			return strBean;
	}


	/**
	 * 属性半行展示长度超出预处理
	 * @param jsonArrayData
	 * @return
	 */
	private Map<String, Object> dealStrLenItems(List<Map<String, Object>> paramList, int speCustInfoLen){
		Map<String, Object> retnMap = new HashMap<String, Object>();

		// 属性信息分类暂存
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> lineItemList = new ArrayList<Map<String,Object>>();

		for (int i = 0; i < paramList.size(); i++) {
			Map<String, Object> itemInfoMap = paramList.get(i);
			if(validStrLenItem(itemInfoMap, speCustInfoLen)){
				lineItemList.add(itemInfoMap);
			} else {
				normItemList.add(itemInfoMap);
			}
		}

		if(normItemList.size() > 0){
			retnMap.put("norm", normItemList);
		}
		if(lineItemList.size() > 0){
			retnMap.put("line", lineItemList);
		}

		if(retnMap.size() > 0){
			return retnMap;
		} else {
			return null;
		}
	}

	/**
	 * 属性半行展示长度超出判断，字符串的长度通过存储过程中的const_cust_info_spe_len进行设置
	 *
	 * @param jsonObj
	 * @return
	 */
	private boolean validStrLenItem(Map<String, Object> itemInfoMap, int speCustInfoLen){
		if(MapUtils.isEmpty(itemInfoMap)){
			return false;
		}
		String itemInfo1 = "";
		String itemInfo2 = "";
		if(itemInfoMap.containsKey("itemName0") && itemInfoMap.containsKey("itemValue0")){
			itemInfo1 = MapUtils.getString(itemInfoMap, "itemName0", "")
					+ MapUtils.getString(itemInfoMap, "itemValue0", "");
			if(itemInfo1.length() > speCustInfoLen){
				return true;
			}
		}
		if(itemInfoMap.containsKey("itemName1") && itemInfoMap.containsKey("itemValue1")){
			itemInfo2 = MapUtils.getString(itemInfoMap, "itemName1", "")
					+ MapUtils.getString(itemInfoMap, "itemValue1", "");
			if(itemInfo2.length() > speCustInfoLen){
				return true;
			}
		}
		return false;
	}

	private List<FeeInfoSet> parseFeeInfos(Map<String, Object> dataMap) {
		List<FeeInfoSet> feeInfos = new ArrayList<FeeInfoSet>();
		if (!dataMap.containsKey("feeInfos")) {
			return feeInfos;
		}
		Map<String, Object> feeInfoMap = MapUtils.getMap(dataMap, "feeInfos");
		List<Map<String, Object>> orderFeeInfos = null;
		List<Map<String, Object>> acctFeeInfos = null;
		int orderSeqInt = 0;
		int totalNbr = 0;
		if (MapUtils.isEmpty(feeInfoMap)) {
			return feeInfos;
		} else {
			if (feeInfoMap.containsKey("orderFeeInfos")) {
				orderFeeInfos = (List<Map<String, Object>>) feeInfoMap.get("orderFeeInfos");
				totalNbr += orderFeeInfos.size();
			}
			if (feeInfoMap.containsKey("acctFeeInfos")) {
				acctFeeInfos = (List<Map<String, Object>>) feeInfoMap.get("acctFeeInfos");
				totalNbr += acctFeeInfos.size();
			}
		}
		// 订单费用
		if (orderFeeInfos != null) {
			Map<String, Object> tmpMap = buildFeeInfoSet(orderFeeInfos, SysConstant.FEE_TYPE_ORDER, totalNbr, orderSeqInt);
			List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
			orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
			if (feeInfoList != null && feeInfoList.size() > 0) {
				feeInfos.addAll(feeInfoList);
			}
		}

		// 帐户费用
		if (acctFeeInfos != null) {
			Map<String, Object> sortMap = mergeAcctFeeInfos(acctFeeInfos);
			int feeTypeNbr = MapUtils.getIntValue(sortMap, "feeTypeNbr", 0);
			//处理chargeItems
			//如果dataMap中存在chargeItems，则使用它，它由前台js传入
			if (dataMap.containsKey("chargeItems") && dataMap.get("chargeItems") instanceof List) {
				List<Map<String, Object>> chargeItems = (List<Map<String, Object>>) dataMap.get("chargeItems");
				Map<String, Object> tmpMap = buildFeeInfoSetFromChargeItems(chargeItems, SysConstant.FEE_TYPE_CHARGEITEMS, totalNbr, orderSeqInt, 1);
				List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
				orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
				if (feeInfoList != null && feeInfoList.size() > 0) {
					feeInfos.addAll(feeInfoList);
				}
			} else if (sortMap.containsKey("chargeItems")) {
				List<Map<String, Object>> chargeItems = (List<Map<String, Object>>) sortMap.get("chargeItems");
				Map<String, Object> tmpMap = buildFeeInfoSetFromChargeItems(chargeItems, SysConstant.FEE_TYPE_CHARGEITEMS, totalNbr, orderSeqInt, 2);
				List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
				orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
				if (feeInfoList != null && feeInfoList.size() > 0) {
					feeInfos.addAll(feeInfoList);
				}
			}
			for (int i = 0; i < feeTypeNbr; i++) {
				List<Map<String, Object>> acctFeeList =
						(List<Map<String, Object>>) sortMap.get("acctFeeAry" + i);
				acctFeeList = mergeAcctFeeInfosByPayMethodId(acctFeeList);
				Map<String, Object> tmpMap = buildFeeInfoSet(acctFeeList, SysConstant.FEE_TYPE_ACCT, totalNbr, orderSeqInt);
				List<FeeInfoSet> feeInfoList = (List<FeeInfoSet>) tmpMap.get("feeInfoList");
				orderSeqInt = (Integer) tmpMap.get("orderSeqInt");
				if (feeInfoList != null && feeInfoList.size() > 0) {
					feeInfos.addAll(feeInfoList);
				}
			}

		}
		// 计算feeType，通过遍历orderEvent，取orderEventType为5的relaAcceNbr和feeTypeValue
		List<Map<String, Object>> orderEventList = (List<Map<String, Object>>) dataMap.get("orderEvent");
		if (orderEventList != null && orderEventList.size() > 0) {
			List<Map<String, Object>> feeTypeList = new ArrayList<Map<String,Object>>();
			for (int i = 0; i < orderEventList.size(); i++) {
				Map<String, Object> orderEventMap = orderEventList.get(i);
				String orderEventType = MapUtils.getString(orderEventMap, "orderEventType", "");
				//取orderEventType为5，产品资料的类型
				if ("5".equals(orderEventType)) {
					List<Map<String, Object>> orderEventContList = (List<Map<String, Object>>) orderEventMap.get("orderEventCont");
					String feeTypeValue = "";
					for (int j = 0; orderEventContList != null && j < orderEventContList.size(); j++) {
						Map<String, Object> orderEventCont = orderEventContList.get(j);
						feeTypeValue = MapUtils.getString(orderEventCont, "feeTypeValue", "");
						if (StringUtils.isNotEmpty(feeTypeValue)) {
							break;
						}
					}
					if (StringUtils.isNotEmpty(feeTypeValue)) {
						Map<String, Object> feeTypeMap = new HashMap<String, Object>();
						feeTypeMap.put("feeTypeValue", feeTypeValue);
						Map<String, Object> orderEventTitleMap = MapUtils.getMap(orderEventMap, "orderEventTitle");
						feeTypeMap.put("relaAcceNbr", MapUtils.getString(orderEventTitleMap, "relaAcceNbr", ""));
						feeTypeList.add(feeTypeMap);
					}
				}
			}
			if (feeTypeList.size() > 0) {
				Map<String, Object> feeTypeMap = feeTypeList.get(0);
				String feeTypeValue = MapUtils.getString(feeTypeMap, "feeTypeValue");
				boolean mutilFeeTypeFlag = false;
				for (int i = 1; i < feeTypeList.size(); i++) {
					feeTypeMap = feeTypeList.get(i);
					String tmpFeeTypeValue = MapUtils.getString(feeTypeMap, "feeTypeValue");
					if (!feeTypeValue.equals(tmpFeeTypeValue)) {
						mutilFeeTypeFlag = true;
						break;
					}
				}
				if (mutilFeeTypeFlag) {
					List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();
					FeeInfoSet feeInfoSet = new FeeInfoSet();
					List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
					FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
					String feeInfoTitle = (++orderSeqInt) + "付费模式：";
					feeInfoTitleSet.setFeeInfoTitle(feeInfoTitle);
					String feeInfoCont = "";
					for (int i = 1; i < feeTypeList.size(); i++) {
						feeTypeMap = feeTypeList.get(i);
						String tmpFeeTypeValue = MapUtils.getString(feeTypeMap, "feeTypeValue");
						String relaAcceNbr = MapUtils.getString(feeTypeMap, "relaAcceNbr");
						feeInfoCont += " " + tmpFeeTypeValue + "-" + relaAcceNbr + ";";
					}
					feeInfoTitleSet.setFeeInfoCont(feeInfoCont);
					feeInfoTitles.add(feeInfoTitleSet);
					feeInfoSet.setFeeInfoTitles(feeInfoTitles);
					feeInfoList.add(feeInfoSet);
					feeInfos.addAll(feeInfoList);
				} else {
					List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();
					FeeInfoSet feeInfoSet = new FeeInfoSet();
					List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
					FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
					String feeInfoTitle = (++orderSeqInt) + "、付费模式：";
					feeInfoTitleSet.setFeeInfoTitle(feeInfoTitle);
					String feeInfoCont = feeTypeValue + "。";
					feeInfoTitleSet.setFeeInfoCont(feeInfoCont);
					feeInfoTitles.add(feeInfoTitleSet);
					feeInfoSet.setFeeInfoTitles(feeInfoTitles);
					feeInfoList.add(feeInfoSet);
					feeInfos.addAll(feeInfoList);
				}
			}
		}
		return feeInfos;
	}

	/**
	 * 组装－费用信息
	 * @param feeInfoAry
	 * @return
	 */
	private Map<String, Object> buildFeeInfoSet(List<Map<String, Object>> feeInfos, int feeInfoType, int totalNbr, int orderSeqInt) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();

		// 解决付费人、合同号相同只保留一份问题
		List<String> relaAcctInfoBack = new ArrayList<String>();

		if (feeInfos == null || feeInfos.size() == 0) {
			retnMap.put("feeInfoList", feeInfoList);
			retnMap.put("orderSeqInt", orderSeqInt);
			return retnMap;
		}

		//关联号码：（若用户的多个产品采用了不同付费方式，在付费方式中列示关联用户号码）
		Map<String, Object> feeInfoMap = feeInfos.get(0);
		String payMethodId = MapUtils.getString(feeInfoMap, "payMethodId", "");
		boolean relaAcceFlag = false;
		for (int i = 1; i < feeInfos.size(); i++) {
			feeInfoMap = feeInfos.get(i);
			String tmpPayMethodId = MapUtils.getString(feeInfoMap, "payMethodId", "");
			if (!payMethodId.equals(tmpPayMethodId)) {
				relaAcceFlag = true;
				break;
			}
		}

		for (int i = 0; i < feeInfos.size(); i++) {
			feeInfoMap = feeInfos.get(i);

			FeeInfoSet feeInfoSet = new FeeInfoSet();
			List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
			List<FeeInfoAPNSet> acctPayNumbers = new ArrayList<FeeInfoAPNSet>();
			List<FeeInfoBankSet> feeInfoBanks = new ArrayList<FeeInfoBankSet>();
			List<FeeInfoRANSet> relaAcceNbrs = new ArrayList<FeeInfoRANSet>();
			List<StringBeanSet> relaAcctInfos = new ArrayList<StringBeanSet>();
			// 设置元素顺序
			String orderSeq = "";
//			if (totalNbr != SysConstant.INT_1) {
				orderSeq = (++orderSeqInt) + "";
//			}
			// 费用信息头
			String appChargeFee = "";
			String realChargeFee = "";
			String payMethodName = "";
			if (feeInfoMap.containsKey("appChargeFee")) {
				appChargeFee = MapUtils.getString(feeInfoMap, "appChargeFee", "");
				if(StringUtils.isNotEmpty(appChargeFee)){
					appChargeFee = Double.valueOf(appChargeFee) / SysConstant.INT_100 + "";
				}
			}
			if(feeInfoMap.containsKey("realChargeFee")){
				realChargeFee = MapUtils.getString(feeInfoMap, "realChargeFee", "");
				if(StringUtils.isNotEmpty(realChargeFee)){
					realChargeFee = Double.valueOf(realChargeFee) / SysConstant.INT_100 + "";
				}
			}
			if(feeInfoMap.containsKey("payMethodName")){
				payMethodName = MapUtils.getString(feeInfoMap, "payMethodName", "");
			}

			FeeInfoTitleSet feeInfoTitle = buildFeeInfoTitle(orderSeq, feeInfoType, appChargeFee, realChargeFee, payMethodName);
			feeInfoTitles.add(feeInfoTitle);

			// 挂账号码信息
			String acctPayNumber = "";
			String firstPayMethodId = MapUtils.getString(feeInfoMap, "payMethodId", "");
			//挂帐号码：（转帐务托收时列示）
			if(feeInfoMap.containsKey("acctPayNumber") && "140000".equals(firstPayMethodId)){
				acctPayNumber = MapUtils.getString(feeInfoMap, "acctPayNumber", "");
			}
			FeeInfoAPNSet feeInfoAPN = buildFeeInfoAPN(acctPayNumber);
			if (feeInfoAPN != null) {
				acctPayNumbers.add(feeInfoAPN);
			}
			// 托收银行信息
			Map<String, Object> bankCollInfo = null;
			if(feeInfoMap.containsKey("bankCollInfo")){
				bankCollInfo = MapUtils.getMap(feeInfoMap, "bankCollInfo");
			}
			FeeInfoBankSet feeInfoBank = buildFeeInfoBank(bankCollInfo);
			if (feeInfoBank != null) {
				feeInfoBanks.add(feeInfoBank);
			}
			// 关联号码信息
			//关联号码：（若用户的多个产品采用了不同付费方式，在付费方式中列示关联用户号码）
			if(relaAcceFlag && feeInfoMap.containsKey("relaAcceNbr")){
				String relaAcceNbrTmp = MapUtils.getString(feeInfoMap, "relaAcceNbr", "");

//				if(relaAcceNbrTmp.contains(SysConstant.STR_PAU)){
					FeeInfoRANSet feeInfoRAN = buildFeeInfoRAN(relaAcceNbrTmp);
					if (feeInfoRAN != null) {
						relaAcceNbrs.add(feeInfoRAN);
					}
//				}
			}
			// 北京需求-增加 付费人、合同号 内容
			if(feeInfoMap.containsKey("relaAcctInfo")){
				String relaAcctInfo = MapUtils.getString(feeInfoMap, "relaAcctInfo", "");

				boolean existFlag = false;
				if(relaAcctInfoBack.size() > 0){
					for(String backInfo : relaAcctInfoBack){
						if(relaAcctInfo.equals(backInfo)){
							existFlag = true;
							break;
						}
					}
				}

				if(!existFlag){
					relaAcctInfoBack.add(relaAcctInfo);

					StringBeanSet strBean = new StringBeanSet(relaAcctInfo);
					relaAcctInfos.add(strBean);
				}
			}

			if(feeInfoTitles.size() > 0){
				feeInfoSet.setFeeInfoTitles(feeInfoTitles);
			}
			if(acctPayNumbers.size() > 0){
				feeInfoSet.setAcctPayNumbers(acctPayNumbers);
			}
			if(feeInfoBanks.size() > 0){
				feeInfoSet.setFeeInfoBanks(feeInfoBanks);
			}
			if(relaAcceNbrs.size() > 0){
				feeInfoSet.setRelaAcceNbrs(relaAcceNbrs);
			}
			if(relaAcctInfos.size() > 0){
				feeInfoSet.setRelaAcctInfos(relaAcctInfos);
			}

			feeInfoList.add(feeInfoSet);
		}

		retnMap.put("feeInfoList", feeInfoList);
		retnMap.put("orderSeqInt", orderSeqInt);
		return retnMap;
	}

	/**
	 * 组装－费用信息-费用项
	 * @param feeInfoAry
	 * @return
	 */
	private Map<String, Object> buildFeeInfoSetFromChargeItems(List<Map<String, Object>> feeInfos, int feeInfoType, int totalNbr, int orderSeqInt, int fromFlag) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<FeeInfoSet> feeInfoList = new ArrayList<FeeInfoSet>();
		FeeInfoSet feeInfoSet = new FeeInfoSet();
		List<FeeInfoTitleSet> feeInfoTitles = new ArrayList<FeeInfoTitleSet>();
		int amount = 0;
		int realAmount = 0;
		String payMethodName = "";
		// 需要对chargeItems做处理
		for (int i = 0; i < feeInfos.size(); i++) {
			Map<String, Object> feeInfoMap = feeInfos.get(i);
			int paymentAmount = MapUtils.getIntValue(feeInfoMap, "paymentAmount", 0);
			//pass when paymentAmount == 0
			if (paymentAmount == 0) {
				continue;
			}
			if (fromFlag == 1) {
				amount += MapUtils.getIntValue(feeInfoMap, "feeAmount", 0);
			} else if (fromFlag == 2) {
				amount += MapUtils.getIntValue(feeInfoMap, "amount", 0);
			}
			realAmount += MapUtils.getIntValue(feeInfoMap, "realAmount", 0);
			payMethodName = MapUtils.getString(feeInfoMap, "payMethodName", "");
		}
		FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
		String feeInfoTitle = (++orderSeqInt) + "、本次订单费用： ";
		feeInfoTitleSet.setFeeInfoTitle(feeInfoTitle);
		String feeInfoCont = "应收"+ amount/100 +"元"+SysConstant.STR_SPI+"实收"+realAmount/100+"元";
		if (StringUtils.isNotEmpty(payMethodName)) {
			feeInfoCont += " （"+payMethodName+"）";
		}
		feeInfoCont += "。";
		feeInfoTitleSet.setFeeInfoCont(feeInfoCont);
		feeInfoTitles.add(feeInfoTitleSet);
		feeInfoSet.setFeeInfoTitles(feeInfoTitles);
		feeInfoList.add(feeInfoSet);

		retnMap.put("feeInfoList", feeInfoList);
		retnMap.put("orderSeqInt", orderSeqInt);
		return retnMap;
	}

	/**
	 * 组装－费用信息头
	 * @param seq
	 * @param feeType
	 * @param appChargeFee
	 * @param realChargeFee
	 * @param payMethodName
	 * @return
	 */
	private FeeInfoTitleSet buildFeeInfoTitle(String seq, int feeType, String appChargeFee, String realChargeFee, String payMethodName){
		FeeInfoTitleSet feeInfoTitleSet = new FeeInfoTitleSet();
		String feeInfoTitle = "";
		String feeInfoCont = "";
		String tmpStr = "";
		if (SysConstant.FEE_TYPE_ORDER == feeType) {
			feeInfoTitle = (StringUtils.isEmpty(seq) ? "" : (seq + SysConstant.STR_PAU)) + "本次订单费用" + SysConstant.STR_SEP;

			tmpStr += (StringUtils.isEmpty(payMethodName) ? "" : (SysConstant.STR_LL_BRE + payMethodName + SysConstant.STR_RL_BRE))
				+ SysConstant.STR_STO;
		} else if (SysConstant.FEE_TYPE_ACCT == feeType) {
			if (StringUtils.isNotEmpty(payMethodName)) {
				feeInfoTitle = (StringUtils.isEmpty(seq) ? "" : (seq + SysConstant.STR_PAU)) + "月使用费付费方式" + SysConstant.STR_SEP;
			}

			tmpStr += (StringUtils.isEmpty(payMethodName) ? "" : payMethodName);
			if (StringUtils.isNotEmpty(tmpStr)) {
				tmpStr += SysConstant.STR_STO;
			}
		}

		feeInfoCont = (StringUtils.isEmpty(appChargeFee) ? "" : ("应收 " + appChargeFee + " 元" + SysConstant.STR_COM ))
			+ (StringUtils.isEmpty(realChargeFee) ? "" : ("实收 " + appChargeFee + " 元 "))
			+ tmpStr;

		feeInfoTitleSet.setFeeInfoTitle(StringUtils.isEmpty(feeInfoTitle)? null : feeInfoTitle);
		feeInfoTitleSet.setFeeInfoCont(StringUtils.isEmpty(feeInfoCont) ? null : feeInfoCont);

		return feeInfoTitleSet;
	}
	/**
	 * 组装－挂账号码信息
	 * @param acctPayNumber
	 * @return
	 */
	private FeeInfoAPNSet buildFeeInfoAPN(String acctPayNumber){
		FeeInfoAPNSet feeInfoAPN = null;
		if(StringUtils.isNotEmpty(acctPayNumber)){
			feeInfoAPN = new FeeInfoAPNSet();
			feeInfoAPN.setAccPayNnumber(acctPayNumber);
		}
		return feeInfoAPN;
	}
	/**
	 * 组装－托收银行信息
	 * @param feeInfoBankObj
	 * @return
	 */
	private FeeInfoBankSet buildFeeInfoBank(Map<String, Object> feeInfoBankMap){
		if (MapUtils.isEmpty(feeInfoBankMap)) {
			return null;
		}
		FeeInfoBankSet feeInfoBank = new FeeInfoBankSet();

		String bankName = MapUtils.getString(feeInfoBankMap, "bankName", "");
		String bankNumber = MapUtils.getString(feeInfoBankMap, "bankNumber", "");
		String bankCustName = MapUtils.getString(feeInfoBankMap, "bankCustName", "");
		if ("".equals(bankName) && "".equals(bankNumber) && "".equals(bankCustName)) {
			return null;
		}
		feeInfoBank.setBankName(bankName);
		feeInfoBank.setBankNumber(bankNumber);
		feeInfoBank.setBankCustName(bankCustName);
		return feeInfoBank;
	}
	/**
	 * 组装－关联号码信息
	 * @param relaAcceNbr
	 * @return
	 */
	private FeeInfoRANSet buildFeeInfoRAN(String relaAcceNbr){
		FeeInfoRANSet feeInfoRAN = null;
		if(StringUtils.isNotEmpty(relaAcceNbr)){
			feeInfoRAN = new FeeInfoRANSet();
			feeInfoRAN.setRelaAcceNbr(relaAcceNbr);
		}
		return feeInfoRAN;
	}

	/**
	 * 帐户付费信息分类合并
	 * @param acctFeeAry
	 * @return
	 */
	private Map<String, Object> mergeAcctFeeInfos(List<Map<String, Object>> acctFeeList){
		Map<String, Object> retnMap = new HashMap<String, Object>();

		if (acctFeeList == null || acctFeeList.size() == 0) {
			retnMap.put("feeTypeNbr", 0);
			return retnMap;
		}
		if (acctFeeList.size() == 1) {
			if (acctFeeList.get(0).containsKey("chargeItems")) {
				retnMap.put("chargeItems", acctFeeList.get(0).get("chargeItems"));
			}
			retnMap.put("feeTypeNbr", 1);
			retnMap.put("acctFeeAry0", acctFeeList.get(0).get("chargeItems"));
			return retnMap;
		}

		Map<String, Object> tmpMap = new HashMap<String, Object>();
		List<Map<String, Object>> tmpList = null;
		int feeTypeNbr = 0;
		for (int i = 0; i < acctFeeList.size(); i++) {
			Map<String, Object> acctFeeMap = acctFeeList.get(i);
			if (acctFeeMap == null) {
				continue;
			}

			if (acctFeeMap.containsKey("payMethodId")) {
				String payMethodId = MapUtils.getString(acctFeeMap, "payMethodId");
				tmpList = (List<Map<String, Object>>) tmpMap.get(payMethodId);
				if (tmpList == null) {
					tmpList = new ArrayList<Map<String,Object>>();
					feeTypeNbr++;
				}
				tmpList.add(acctFeeMap);
				tmpMap.put(payMethodId, tmpList);
			}
			if (acctFeeMap.containsKey("chargeItems")) {
				retnMap.put("chargeItems", acctFeeMap.get("chargeItems"));
			}
		}

		Set keySet = tmpMap.keySet();
		Iterator iter = keySet.iterator();
		int i = 0;
		while (iter.hasNext()) {
			String key = (String) iter.next();
			retnMap.put("acctFeeAry" + (i++), tmpMap.get(key));
		}

		retnMap.put("feeTypeNbr", feeTypeNbr);
		return retnMap;
	}

	private List<Map<String, Object>> mergeAcctFeeInfosByPayMethodId(List<Map<String, Object>> acctFeeList) {
		if (acctFeeList == null || acctFeeList.size() <= 1) {
			return acctFeeList;
		}
		List<Map<String, Object>> retnList = new ArrayList<Map<String,Object>>();
		Map<String, Object> firstMap = null;
		StringBuffer sb = new StringBuffer();
		StringBuffer sbInfo = new StringBuffer();
		for (int i = 0; i < acctFeeList.size(); i++) {
			Map<String, Object> feeMap = acctFeeList.get(i);
			if (feeMap.containsKey("payMethodName")) {
				String payMethodName = MapUtils.getString(feeMap, "payMethodName", "");
				// 合并现金付费的 关联号码、帐户信息
				if (payMethodName.contains(SysConstant.ACCT_FEE_TYPE_CASH)) {
					if (feeMap.containsKey("relaAcceNbr")) {
						sb.append(MapUtils.getString(feeMap, "relaAcceNbr", ""));
						sb.append(SysConstant.STR_PAU);
					}
					if (feeMap.containsKey("relaAcctInfo")) {
						sbInfo.append(MapUtils.getString(feeMap, "relaAcctInfo", ""));
						sbInfo.append(SysConstant.STR_ENT);
					}

					if (i == SysConstant.INT_0) {
						firstMap = feeMap;
					}
				} else {
					return acctFeeList;
				}
			}
		}
		if (firstMap != null) {
			firstMap.put("relaAcceNbr", sb.toString());
			firstMap.put("relaAcctInfo", sbInfo.toString());
		}
		retnList.add(firstMap);
		return retnList;
	}

	private List<TerminalInfoSet> parseTerminalInfos(Map<String, Object> dataMap) {
		List<TerminalInfoSet> terminalInfos = new ArrayList<TerminalInfoSet>();
		List<StringTwoSet> norTInfos = new ArrayList<StringTwoSet>();
		List<StringBeanSet> lineTInfos = new ArrayList<StringBeanSet>();
		if (!dataMap.containsKey("terminalInfos")) {
			return terminalInfos;
		}
		List<Map<String, Object>> terminalInfoList = (List<Map<String, Object>>) dataMap.get("terminalInfos");
		Map<String, Object> itemsMap = dealOneLineItems(terminalInfoList);
		if (MapUtils.isEmpty(itemsMap)) {
			return terminalInfos;
		}
		List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
		List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
		Map<String, Object> mergeMap = new HashMap<String, Object>();
		for (int i = 0; normList != null && i < normList.size(); i++) {
			Map<String, Object> normMap = normList.get(i);
			String tiName = MapUtils.getString(normMap, "tiName", "");
			String tiParam = MapUtils.getString(normMap, "tiParam", "");
			String tiRemark = MapUtils.getString(normMap, "tiRemark", "");
			String isNew = MapUtils.getString(normMap, "isNew", "");
			if (SysConstant.STR_Y.equals(isNew)) {
				if (mergeMap.containsKey(tiName)) {
					Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
					int count = MapUtils.getIntValue(tmpMap, "count");
					tmpMap.put("count", ++count);
					List<Map<String, Object>> list = (List<Map<String, Object>>) tmpMap.get("data");
					list.add(normMap);
					mergeMap.put(tiName, tmpMap);
				} else {
					Map<String, Object> tmpMap = new HashMap<String, Object>();
					List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
					tmpMap.put("tiParam", tiParam);
					tmpMap.put("count", 1);
					tmpMap.put("tiRemark", tiRemark);
					tmpMap.put("isNew", isNew);
					list.add(normMap);
					tmpMap.put("data", list);
					mergeMap.put(tiName, tmpMap);
				}
			}
		}
		int tiSeq = 1;
		if (MapUtils.isNotEmpty(mergeMap)) {
//			1、HTC 619d 手机 32G   1部；         2、天翼UIM卡    2张。
			StringTwoSet strBean = null;
			Set<String> keySet = mergeMap.keySet();
			Iterator<String> it = keySet.iterator();
			while(it.hasNext()) {
				if (tiSeq % 2 == 0) {
					strBean = new StringTwoSet();
				}
				String tiName = it.next();
				Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
				String str = buildUIMInfos(tiSeq++,tiName,tmpMap);
				if (tiSeq % 2 == 0) {
					strBean.setStrBean0(str);
				} else {
					strBean.setStrBean1(str);
				}
				if (tiSeq % 2 != 0) {
					norTInfos.add(strBean);
				}
			}
		}
		mergeMap.clear();
		for (int i = 0; lineList != null && i < lineList.size(); i++) {
			Map<String, Object> lineMap = lineList.get(i);
			String tiName = MapUtils.getString(lineMap, "tiName", "");
			String tiParam = MapUtils.getString(lineMap, "tiParam", "");
			String tiRemark = MapUtils.getString(lineMap, "tiRemark", "");
			String isAloneLine = MapUtils.getString(lineMap, "isAloneLine", "");
			String isNew = MapUtils.getString(lineMap, "isNew", "");
			if (SysConstant.STR_Y.equals(isNew)) {
				if (mergeMap.containsKey(tiName)) {
					Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
					int count = MapUtils.getIntValue(tmpMap, "count");
					tmpMap.put("count", ++count);
					List<Map<String, Object>> list = (List<Map<String, Object>>) tmpMap.get("data");
					list.add(lineMap);
					mergeMap.put(tiName, tmpMap);
				} else {
					Map<String, Object> tmpMap = new HashMap<String, Object>();
					List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
					tmpMap.put("tiParam", tiParam);
					tmpMap.put("count", 1);
					tmpMap.put("tiRemark", tiRemark);
					tmpMap.put("isAloneLine", isAloneLine);
					tmpMap.put("isNew", isNew);
					list.add(lineMap);
					tmpMap.put("data", list);
					mergeMap.put(tiName, tmpMap);
				}
			}
		}
		if (MapUtils.isNotEmpty(mergeMap)) {
//			1、HTC 619d 手机 32G   1部；         2、天翼UIM卡    2张。
			StringBeanSet strBean = null;
			Set<String> keySet = mergeMap.keySet();
			Iterator<String> it = keySet.iterator();
			while(it.hasNext()) {
				strBean = new StringBeanSet();
				String tiName = it.next();
				Map<String, Object> tmpMap = (Map<String, Object>) mergeMap.get(tiName);
				String str = buildUIMInfos(tiSeq++,tiName,tmpMap);
				strBean.setStrBean(str);
				lineTInfos.add(strBean);
			}
		}

//		int orderSeqInt = 0;
//		int terminalInfoLen = terminalInfoList.size();
//		if (normList != null && normList.size() > 0) {
//			StringTwoSet strBean = null;
//			for (int i = 0; i < normList.size(); i++) {
//				if (i % 2 == 0) {
//					strBean = new StringTwoSet();
//				}
//				Map<String, Object> itemMap = normList.get(i);
//				// 设置元素顺序
//				String orderSeq = "";
//				if (terminalInfoLen != 1) {
//					orderSeq = (++orderSeqInt) + "";
//				}
//				String tiName = MapUtils.getString(itemMap, "tiName", "");
//				String tiParam = MapUtils.getString(itemMap, "tiParam", "");
//				String tiRemark = MapUtils.getString(itemMap, "tiRemark", "");
//				if (i % 2 == 0) {
//					strBean.setStrBean0(buildTerminalInfoItem(
//							orderSeq, tiName, tiParam, tiRemark));
//				} else {
//					strBean.setStrBean1(buildTerminalInfoItem(
//							orderSeq, tiName, tiParam, tiRemark));
//				}
//				if (i % 2 != 0) {
//					norTInfos.add(strBean);
//				}
//			}
//		}
//		if (lineList != null && lineList.size() > 0) {
//			for (int i = 0; i < lineList.size(); i++) {
//				Map<String, Object> itemMap = lineList.get(i);
//				StringBeanSet strBean = new StringBeanSet();
//				// 设置元素顺序
//				String orderSeq = "";
//				if (terminalInfoLen != 1) {
//					orderSeq = (++orderSeqInt) + "";
//				}
//				String tiName = MapUtils.getString(itemMap, "tiName", "");
//				String tiParam = MapUtils.getString(itemMap, "tiParam", "");
//				String tiRemark = MapUtils.getString(itemMap, "tiRemark", "");
//				strBean.setStrBean(buildTerminalInfoItem(orderSeq, tiName, tiParam, tiRemark));
//				lineTInfos.add(strBean);
//			}
//		}
		TerminalInfoSet termInfoSet = new TerminalInfoSet();
		if (norTInfos.size() > 0) {
			termInfoSet.setNorTInfos(norTInfos);
		}
		if (lineTInfos.size() > 0) {
			termInfoSet.setLineTInfos(lineTInfos);
		}
		if (norTInfos.size() > 0 || lineTInfos.size() > 0) {
			terminalInfos.add(termInfoSet);
		}
		return terminalInfos;
	}

	/**
	 * 构建多张uim信息
	 * @param tiSeq 序号
	 * @param tiName 名称
	 * @param tmpMap 合并过的map信息，内含多张uim卡的list数据
	 * @return 供打印的字符串
	 */
	private String buildUIMInfos(int tiSeq,String tiName, Map<String, Object> tmpMap) {
		if (null == tmpMap) {
			return "";
		}
		String tiParam = MapUtils.getString(tmpMap, "tiParam", "");	//单位
		String count = MapUtils.getString(tmpMap, "count", "");		//个数
		List<Map<String, Object>> list = (List<Map<String, Object>>) MapUtils.getObject(tmpMap, "data");
		String detailStr = "";
		for (Map<String, Object> map : list) {
			String couponTypeCd = MapUtils.getString(map, "couponTypeCd", "");
			if(StringUtils.isNotBlank(couponTypeCd)&&!SysConstant.UIMTYPECD.equals(couponTypeCd)){
				continue;
			}
			String accessNbr = MapUtils.getString(map, "accessNbr", "");
			String tiRemark = MapUtils.getString(map, "tiRemark", "");
			detailStr += "手机号码" + SysConstant.STR_SEP + accessNbr + SysConstant.STR_COM + "ICCID" + SysConstant.STR_SEP + tiRemark + SysConstant.STR_SPI;
		}
		String str = tiSeq + SysConstant.STR_PAU + tiName + SysConstant.STR_SPE + count + tiParam;
		if(StringUtils.isNotBlank(detailStr)){
			str+=SysConstant.STR_LL_BRE+detailStr+SysConstant.STR_RL_BRE;
		}
		str+=SysConstant.STR_SPI;
		return str;
	}

	/**
	 * 组装－终端信息项
	 * @param seq
	 * @param acceType
	 * @param acceNbr
	 * @param remarkTitle
	 * @param remarkInfo
	 * @return
	 */
	private String buildTerminalInfoItem(String seq, String tiName, String tiParam, String tiRemark) {
		String termInfoStr = (StringUtils.isEmpty(seq) ? "" : (seq + SysConstant.STR_PAU))
				+ tiName + SysConstant.STR_SEP +tiParam + SysConstant.STR_SPE
				+ SysConstant.STR_LL_BRE + tiRemark + SysConstant.STR_RL_BRE + SysConstant.STR_SPI;
		return termInfoStr;
	}


	private List<AuditTicketInfoSet> parseAuditTickets(Map<String, Object> dataMap) {
		List<AuditTicketInfoSet> auditTickets = new ArrayList<AuditTicketInfoSet>();
		List<StringTwoSet> normAInfos = new ArrayList<StringTwoSet>();
		List<StringBeanSet> lineAInfos = new ArrayList<StringBeanSet>();
		if (!dataMap.containsKey("auditInfos")) {
			return auditTickets;
		}
		List auditInfos = (List) dataMap.get("auditInfos");
		if (auditInfos == null || auditInfos.size() == 0) {
			return auditTickets;
		}
		for (int i = 0; i < auditInfos.size(); i++) {
			List<Map<String, Object>> auditInfo = (List<Map<String, Object>>) auditInfos.get(i);
			if (auditInfo == null || auditInfo.size() == 0) {
				continue;
			}
			Map<String, Object> itemsMap = dealOneLineItems(auditInfo);
			if (MapUtils.isEmpty(itemsMap)) {
				continue;
			}
			List<Map<String, Object>> normList = (List<Map<String, Object>>) itemsMap.get("norm");
			List<Map<String, Object>> lineList = (List<Map<String, Object>>) itemsMap.get("line");
			int orderSeqInt = 0;
			int auditInfoLen = auditInfos.size();
			if (normList != null && normList.size() > 0) {
				StringTwoSet strBean = null;
				for (int j = 0; j < normList.size(); j++) {
					if (j % 2 == 0) {
						strBean = new StringTwoSet();
					}
					Map<String, Object> itemMap = normList.get(j);
					// 设置元素顺序
					String orderSeq = "";
					if (auditInfoLen != 1) {
						orderSeq = (++orderSeqInt) + "";
					}
					String itemName = MapUtils.getString(itemMap, "itemName", "");
					String itemValue = MapUtils.getString(itemMap, "itemValue", "");
					String aiItemInfo = itemName + SysConstant.STR_SEP + itemValue;
					if (j % 2 == 0) {
						strBean.setStrBean0(aiItemInfo);
					} else {
						strBean.setStrBean1(aiItemInfo);
					}
					if (j % 2 != 0) {
						normAInfos.add(strBean);
					}
				}
			}
			if (lineList != null && lineList.size() > 0) {
				for (int j = 0; j < lineList.size(); j++) {
					Map<String, Object> itemMap = lineList.get(j);
					StringBeanSet strBean = new StringBeanSet();
					// 设置元素顺序
					String orderSeq = "";
					if (auditInfoLen != 1) {
						orderSeq = (++orderSeqInt) + "";
					}
					String itemName = MapUtils.getString(itemMap, "itemName", "");
					String itemValue = MapUtils.getString(itemMap, "itemValue", "");
					String aiItemInfo = itemName + SysConstant.STR_SEP + itemValue;
					strBean.setStrBean(aiItemInfo);
					lineAInfos.add(strBean);
				}
			}
			AuditTicketInfoSet auditTicketSet = new AuditTicketInfoSet();
			if (normAInfos.size() > 0) {
				auditTicketSet.setNorTInfos(normAInfos);
			}
			if (lineAInfos.size() > 0) {
				auditTicketSet.setLineTInfos(lineAInfos);
			}
			if (normAInfos.size() > 0 || lineAInfos.size() > 0) {
				auditTickets.add(auditTicketSet);
			}
		}
		return auditTickets;
	}


	private List<StringBeanSet> parseRemarkInfos(Map<String, Object> dataMap) {
		List<StringBeanSet> remarkInfos = new ArrayList<StringBeanSet>();
		int strIndex = 0;
		//20140220 添加固定写死的备注 BEGIN
		//1、为保障对您的及时服务提醒，您会收到以10000、10001、118xx号码发送的中国电信服务信息。
//		String str1 = "1、为保障对您的及时服务提醒，您会收到以10000、10001、118xx号码发送的中国电信服务信息。";
//		List<String> strList = new ArrayList<String>();
//		strList.add(str1);
//		for (strIndex = 0; strIndex < strList.size(); strIndex++) {
//			StringBeanSet remarkInfoBean = new StringBeanSet();
//			remarkInfoBean.setStrBean(strList.get(strIndex));
//			remarkInfos.add(remarkInfoBean);
//		}
		//20140220 添加固定写死的备注 END

		if (!dataMap.containsKey("remarkInfos")) {
			return remarkInfos;
		}
		List remarkInfoList = (List) dataMap.get("remarkInfos");
		if (remarkInfoList == null || remarkInfoList.size() == 0) {
			return remarkInfos;
		}
		int remarkInfoLen = remarkInfoList.size();
		for (int i = 0; i < remarkInfoLen; i++) {
			StringBeanSet remarkInfoBean = new StringBeanSet();
			Object obj = remarkInfoList.get(i);
			if (obj instanceof Map) {
				Map<String, Object> remarkInfoMap = (Map<String, Object>) obj;
				String orderSeq = (strIndex + i + 1) + "";
				String acceType = MapUtils.getString(remarkInfoMap, "acceType", "");
				String acceNbr = MapUtils.getString(remarkInfoMap, "acceNbr", "");
				String remarkTitle = MapUtils.getString(remarkInfoMap, "remarkTitle", "");
				String remarkInfo = MapUtils.getString(remarkInfoMap, "remarkInfo", "");
				remarkInfoBean.setStrBean(buildRemarkInfoItem(orderSeq, acceType, acceNbr, remarkTitle, remarkInfo));
			} else if (obj instanceof String){
				String strBean = (strIndex + i + 1) + SysConstant.STR_PAU + (String)obj;
				remarkInfoBean.setStrBean(strBean);
			}

			remarkInfos.add(remarkInfoBean);
		}

		return remarkInfos;
	}

	/**
	 * 组装－备注信息项
	 * @param seq
	 * @param acceType
	 * @param acceNbr
	 * @param remarkTitle
	 * @param remarkInfo
	 * @return
	 */
	private String buildRemarkInfoItem(String seq, String acceType, String acceNbr, String remarkTitle, String remarkInfo){
		String remarkInfoStr = (StringUtils.isEmpty(seq) == true ? "" : (seq + SysConstant.STR_PAU))
				+ acceType + SysConstant.STR_SPE
				+ SysConstant.STR_LL_BRE + acceNbr + SysConstant.STR_RL_BRE + SysConstant.STR_SPE
				+ remarkTitle + SysConstant.STR_SEP
				+ remarkInfo + SysConstant.STR_STO;
		return remarkInfoStr;
	}

	private List<AgreementsSet> parseAgreements(Map<String, Object> dataMap, boolean needAgreement) {
		List<AgreementsSet> agreements = new ArrayList<AgreementsSet>();
		if (!needAgreement || !dataMap.containsKey("agreements")) {
			return agreements;
		}
		Map<String, Object> agreementInfo = MapUtils.getMap(dataMap, "agreements");
		if (MapUtils.isEmpty(agreementInfo)) {
			return null;
		}
		// 解析添加协议数据
		AgreementsSet agreementSet = new AgreementsSet();

		// 解析添加IPHONE协议
		if (agreementInfo.containsKey("iphoneAgreements")) {
			List iphoneInfos = (List) agreementInfo.get("iphoneAgreements");

			List<AgreementIphoneSet> iphoneAgreements = new ArrayList<AgreementIphoneSet>();
			if (iphoneInfos != null && iphoneInfos.size() > 0) {
				iphoneAgreements = parseAgreementsIphone(iphoneInfos);
			}

			agreementSet.setIphoneAgreements(iphoneAgreements);
		}
		// 解析添加靓号协议
		if (agreementInfo.containsKey("speNbrAgreements")) {
			List speNbrInfos = (List) agreementInfo.get("speNbrAgreements");

			List<AgreementSpeNbrSet> speNbrAgreements = new ArrayList<AgreementSpeNbrSet>();
			if (speNbrInfos != null && speNbrInfos.size() > 0) {
				speNbrAgreements = parseAgreementsSpeNbr(speNbrInfos);
			}

			agreementSet.setSpeNbrAgreements(speNbrAgreements);
		}
		// 解析添加补贴协议
		if (agreementInfo.containsKey("terminalAgreements")) {
			List terminalInfos = (List) agreementInfo.get("terminalAgreements");

			List<AgreementTerminalSet> terminalAgreements = new ArrayList<AgreementTerminalSet>();
			if (terminalInfos != null && terminalInfos.size() > 0) {
				terminalAgreements = parseAgreementsTerminal(terminalInfos);
			}

			agreementSet.setTerminalAgreements(terminalAgreements);
		}
		// 解析添加业务协议
		if (agreementInfo.containsKey("businessAgreements")) {
			String businessInfo = (String) agreementInfo.get("businessAgreements");

			List<String> businessAgreements = new ArrayList<String>();
			if (SysConstant.STR_Y.equalsIgnoreCase(businessInfo)) {
				businessAgreements.add(SysConstant.STR_Y);
			}
			agreementSet.setBusinessAgreements(businessAgreements);
		}

		agreements.add(agreementSet);
		return agreements;
	}

	/**
	 * 解析回执内容-协议信息-iPhone协议
	 *
	 * @param outParamJson
	 * @param vInfoDatas
	 * @throws Exception
	 */
	private List<AgreementIphoneSet> parseAgreementsIphone(List<Map<String, Object>> iphoneInfos){
		if(null == iphoneInfos || iphoneInfos.size() == 0){
			return null;
		}
		List<AgreementIphoneSet> agreementIphoneInfos = new ArrayList<AgreementIphoneSet>();
		for (int i = 0; i < iphoneInfos.size(); i++) {
			Map<String, Object> iphoneInfo = iphoneInfos.get(i);
			AgreementIphoneSet iphoneSet = new AgreementIphoneSet();

			String custName = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "custName", "");
			String identityType = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "identityType", "");
			String identityNbr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "identityNbr", "");
			String identityAddr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "identityAddr", "");
			String currentAddr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "currentAddr", "");
			String postNbr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "postNbr", "");
			String linkNbr = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "linkNbr", "");
			String accessNumber = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "accessNumber", "");
			String effectMonth = MapUtils.getString(iphoneInfo, "effectMonth", "");
			String terminalType = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "terminalType", "");
			String offerSpecName = MapUtils.getString(iphoneInfo, "offerSpecName", "");
			String baseFee = MapUtils.getString(iphoneInfo, "baseFee", "");
			String offerSpecDesc = MapUtils.getString(iphoneInfo, "offerSpecDesc", "");
			String preFee = "";
			String preFeeBig = "";
			String limitFee = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "limitFee", "");
			String attachOfferSpecDesc = SysConstant.STR_SPE + MapUtils.getString(iphoneInfo, "attachOfferSpecDesc", "");

			if(iphoneInfo.containsKey("preFee")){
				preFee = MapUtils.getString(iphoneInfo, "preFee", "");
				preFeeBig = SysConstant.STR_SPE + ChsStringUtil.toChineseDigitl(preFee);
				preFee = SysConstant.STR_SPE + preFee;
			}

			iphoneSet.setCustName(custName);
			iphoneSet.setIdentityType(identityType);
			iphoneSet.setIdentityNbr(identityNbr);
			iphoneSet.setIdentityAddr(identityAddr);
			iphoneSet.setCurrentAddr(currentAddr);
			iphoneSet.setPostNbr(postNbr);
			iphoneSet.setLinkNbr(linkNbr);
			iphoneSet.setAccessNumber(accessNumber);
			iphoneSet.setEffectMonth(effectMonth);
			iphoneSet.setTerminalType(terminalType);
			iphoneSet.setOfferSpecName(offerSpecName);
			iphoneSet.setBaseFee(baseFee);
			iphoneSet.setOfferSpecDesc(offerSpecDesc);
			iphoneSet.setPreFee(preFee);
			iphoneSet.setPreFeeBig(preFeeBig);
			iphoneSet.setLimitFee(limitFee);
			iphoneSet.setAttachOfferSpecDesc(attachOfferSpecDesc);

			agreementIphoneInfos.add(iphoneSet);
		}

		return agreementIphoneInfos;
	}
	/**
	 * 解析回执内容-协议信息-靓号协议
	 *
	 * @param outParamJson
	 * @param vInfoDatas
	 * @throws Exception
	 */
	private List<AgreementSpeNbrSet> parseAgreementsSpeNbr(List<Map<String, Object>> niceNbrInfos){
		if(null == niceNbrInfos || niceNbrInfos.size() == 0){
			return null;
		}

		List<AgreementSpeNbrSet> agreementSpeNbrs = new ArrayList<AgreementSpeNbrSet>();
		for(int i=0; i<niceNbrInfos.size(); i++){
			Map<String, Object> speNbrInfo = niceNbrInfos.get(i);
			AgreementSpeNbrSet speNbrSet = new AgreementSpeNbrSet();

			String custName = MapUtils.getString(speNbrInfo, "custName", "");
			String accessNumber = MapUtils.getString(speNbrInfo, "accessNumber", "");
			String preFee = MapUtils.getString(speNbrInfo, "preFee", "");
			String limitFee = MapUtils.getString(speNbrInfo, "limitFee", "");

			speNbrSet.setCustName(custName);
			speNbrSet.setAccessNumber(accessNumber);
			speNbrSet.setPreFee(preFee);
			speNbrSet.setLimitFee(limitFee);

			agreementSpeNbrs.add(speNbrSet);
		}

		return agreementSpeNbrs;
	}
	/**
	 * 解析回执内容-协议信息-补贴协议
	 *
	 * @param outParamJson
	 * @param vInfoDatas
	 * @throws Exception
	 */
	private List<AgreementTerminalSet> parseAgreementsTerminal(List<Map<String, Object>> terminalInfos){
		if(null == terminalInfos || terminalInfos.size() == 0){
			return null;
		}

		List<AgreementTerminalSet> agreementTerminals = new ArrayList<AgreementTerminalSet>();
		for(int i=0; i<terminalInfos.size(); i++){
			Map<String, Object> terminalInfo = terminalInfos.get(i);
			AgreementTerminalSet terminalSet = new AgreementTerminalSet();

			String custName = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "custName", "");
			String accessNumber = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "accessNumber", "");
			String offerSpecName = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "offerSpecName", "");
			String offerSpecDesc = SysConstant.STR_SPE + MapUtils.getString(terminalInfo, "offerSpecDesc", "");

			terminalSet.setCustName(custName);
			terminalSet.setAccessNumber(accessNumber);
			terminalSet.setOfferSpecName(offerSpecName);
			terminalSet.setOfferSpecDesc(offerSpecDesc);

			agreementTerminals.add(terminalSet);
		}

		return agreementTerminals;
	}


	private Map<String, Object> runVoucherPrint(Map<String, Object> printData,
			HttpServletResponse response, String printType,
			boolean needAgreement,String signflag) throws Exception {
		String printTypeDir = SysConstant.P_MOD_SUB_CTG_PDF;
		if (SysConstant.PRINT_TYPE_HTML.equals(printType)) {
			printTypeDir = SysConstant.PRINT_TYPE_HTML;
		}
		String strJasperFileName = printTypeDir + SysConstant.P_MOD_FILE_CRM_COMMON;
//		String strJasperFileName = printTypeDir + "CtgPrintCustInfo";
//		String strJasperFileName = printTypeDir + "CtgPrintItemInfoBold";
		if (strJasperFileName == null || "".equals(strJasperFileName)) {
			throw new RuntimeException("获取回执打印模板异常，请联系系统人员!");
		}
		if("ctgpdf/CtgTerminalOrderInfo".equals(printType)){
			strJasperFileName = SysConstant.P_MOD_BASE_DIR + printType
			+ SysConstant.P_MOD_FILE_SUBFIX;
		}else{
			strJasperFileName = SysConstant.P_MOD_BASE_DIR + strJasperFileName
			+ SysConstant.P_MOD_FILE_SUBFIX;
		}
		log.info(" 回执模板名称： " + strJasperFileName);

		try {
			Collection<Map<String, Object>> inFields = new ArrayList<Map<String, Object>>();
//			List tmpList = (List) printData.get("custInfos");
//			CustInfoSet custInfoSet = (CustInfoSet) tmpList.get(0);
			if(signflag.equals(SysConstant.PREVIEW_SIGN)){
				printData.put("isShowSign", "false");
				printData.put("isShowReplaceStr", "true");
			}else if(signflag.equals(SysConstant.SAVE_PDF)){
				printData.put("isShowSign", "true");
				printData.put("isShowReplaceStr", "false");
			}else{
				printData.put("isShowSign", "false");
				printData.put("isShowReplaceStr", "false");
			}
			inFields.add(printData);
//			Collection inFields = new ArrayList();
//			ItemInfoSet itemInfoSet = new ItemInfoSet();
//			itemInfoSet.setItemName("testName");
//			itemInfoSet.setItemValue("showValue");
//			Map<String, Object> tmpMap = new HashMap<String, Object>();
//			tmpMap.put("itemName", "tEsTnAmEOne");
//			tmpMap.put("itemValue", "tEsTvAlUeOne");
//			inFields.add(tmpMap);
//			tmpMap = new HashMap<String, Object>();
//			tmpMap.put("itemName", "tEsTnAmETwo");
//			tmpMap.put("itemValue", "tEsTvAlUeTwo");
//			inFields.add(tmpMap);
//			tmpMap.put("itemInfo", itemInfoSet);
////			inFields.add(itemInfoSet);
//			inFields.add(tmpMap);
			Map<String, Object> reportParams = new HashMap<String, Object>();
			reportParams.put("SUBREPORT_DIR", SysConstant.P_MOD_SUB_BASE_DIR
					+ printTypeDir);
			reportParams.put("HAS_AGREEMENT", needAgreement);
			if(signflag.equals(SysConstant.PREVIEW_SIGN)){
				return previewHtml(strJasperFileName, reportParams, inFields, 0, 0);
			}else if(signflag.equals(SysConstant.SAVE_PDF)){
				return savePdf(strJasperFileName, reportParams, inFields,0, 0,printData);
			}else if(signflag.equals(SysConstant.SAVE_NO_SIGN_PDF)){
				return saveNOSignPdf(strJasperFileName, reportParams, inFields,0, 0,printData);
			}else{
			//输出打印内容
				if (SysConstant.PRINT_TYPE_HTML.equals(printType)) {
					commonHtmlPrint(strJasperFileName, reportParams, inFields,
							response, 0, 0);
				} else {
					commonPdfPrint(strJasperFileName, reportParams, inFields,
							response, 0, 0);
				}
			}
		} catch (Exception e) {
			log.error("打印回执异常:", e);
			throw e;
		}
		return null;
	}
	private Map<String,Object> savePdf(String strJasperFileName,Map<String, Object> hasParameters,
			Collection<Map<String, Object>> lstFields, int pageWidth, int pageHeight,Map<String,Object> printData)
			throws Exception {
		Map<String,Object> ret=new HashMap<String,Object>();
        //获取Jasper模板对应的printHelper
        PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, pageWidth, pageHeight);
        //生成pdf文件
        byte[] bytes = vPdfPrintHelper.getPdfStreamWithParametersAndFields(hasParameters, lstFields);
        String orderInfo=Base64.encodeBase64String(bytes).replaceAll("\n|\r", "");
		ret.put("orderInfo", orderInfo);
        return ret;
	}

	//提供给省份回执打印信息的展示
	private Map<String,Object> saveNOSignPdf(String strJasperFileName,Map<String, Object> hasParameters,
			Collection<Map<String, Object>> lstFields, int pageWidth, int pageHeight,Map<String,Object> printData)
			throws Exception {
		Map<String,Object> ret=new HashMap<String,Object>();
        //获取Jasper模板对应的printHelper
        PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, pageWidth, pageHeight);
        //生成pdf文件
        byte[] bytes = vPdfPrintHelper.getPdfStreamWithParametersAndFieldsByNoScript(hasParameters, lstFields);
        String orderInfo=Base64.encodeBase64String(bytes).replaceAll("\n|\r", "");
		ret.put("orderInfo", orderInfo);
        return ret;
	}

	private Map<String,Object> previewHtml(String strJasperFileName,
			Map<String, Object> hasParameters,Collection<Map<String, Object>> lstFields,int pageWidth, int pageHeight){
		Map<String,Object> ret=new HashMap<String,Object>();
		try{
			PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, 0, 0);
			String htmlStr=vPdfPrintHelper.getHtmlStrWithParametersAndFields(hasParameters, lstFields);
			if(htmlStr.trim().equals("")){
				ret.put("code", "-1");
				ret.put("msg", "生成回执预览页面失败");
			}else{
				ret.put("htmlStr", htmlStr);
				ret.put("code", "0");
			}
		} catch (Exception e) {
			ret.put("code", "-2");
			ret.put("msg", e.getStackTrace());
		}
		return ret;
	}
	private void commonPdfPrint(String strJasperFileName,
			Map<String, Object> hasParameters,
			Collection<Map<String, Object>> lstFields,
			HttpServletResponse response, int pageWidth, int pageHeight)
			throws Exception {
		try {
            //获取Jasper模板对应的printHelper
            PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, pageWidth, pageHeight);

            //生成pdf文件
            byte[] bytes = vPdfPrintHelper.getPdfStreamWithParametersAndFields(hasParameters, lstFields);

            //输出到response
            if(response != null){
            	writeToResponse(bytes, strJasperFileName, response);
            }

        } catch (BusinessException exp) {
        	exp.printStackTrace();
            response.setContentType("text/html; charset=GB18030");
            response.setHeader("Content-Language", "GB18030");
            response.setHeader("encoding", "GB18030");
            response.getWriter().write(exp.getMessage());
        }
	}

	private void commonHtmlPrint(String strJasperFileName,
			Map<String, Object> hasParameters,
			Collection<Map<String, Object>> lstFields,
			HttpServletResponse response, int pageWidth, int pageHeight) throws Exception {
		try {
            //获取Jasper模板对应的printHelper
            PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, pageWidth, pageHeight);

            //生成HTML文件
           vPdfPrintHelper.getHtmlStreamWithParametersAndFields(response,hasParameters, lstFields);

        } catch (Exception exp) {
            response.setContentType("text/html; charset=GB18030");
            response.setHeader("Content-Language", "GB18030");
            response.setHeader("encoding", "GB18030");
            response.getWriter().write(exp.getMessage());
        }
	}

	private static void writeToResponse(byte[] bytes,String strJasperFileName,HttpServletResponse response) throws Exception{
        if (bytes != null && bytes.length > 0) {
            response.reset();
            response.setContentType("application/pdf;charset=GB18030");
            response.setContentLength(bytes.length);
            ServletOutputStream ouputStream = response.getOutputStream();
            ouputStream.write(bytes, 0, bytes.length);
            ouputStream.flush();
            ouputStream.close();
        }else{
            throw new Exception("对不起，根据pdf模板[" + strJasperFileName + "]，没有生成相应的pdf数据流，请检查输出参数是否正确！");
        }
    }

	public Map<String, Object> getInvoiceItems(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.INTF_GET_INVOICE_ITEMS,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>());
		} else {

		}
		resultMap.put("resultCode", db.getResultCode());
		resultMap.put("resultMsg", db.getResultMsg());
		return resultMap;
	}

	public Map<String, Object> getInvoiceTemplates(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
					throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = ServiceClient.callService(paramMap,
				PortalServiceCode.INTF_GET_INVOICE_TEMPLATES,
				optFlowNum, sessionStaff);
		try {
			resultMap.put("resultCode", db.getResultCode());
			resultMap.put("resultMsg", db.getResultMsg());
			int length = 0;
			resultMap.put("length", length);
			if (ResultCode.R_SUCCESS.equals(db.getResultCode())) {
				List<Map<String, Object>> tempList = (List<Map<String, Object>>) db.getReturnlmap().get("result");
				if (tempList != null && tempList.size() > 0) {
					length = tempList.size();
				}

				resultMap.put("length", length);
				resultMap.put("tempList", tempList);
				//把发票模板组放入缓存中
				DataRepository.getInstence().setTemplateList(tempList,sessionStaff.getPartnerId());
			}
		} catch (Exception e) {
			log.error("门户处理服务层的getInvoiceTemplates服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.GET_INVOICE_TEMPLATES, paramMap, db.getReturnlmap(), e);
		}
		return resultMap;
	}

	public Map<String, Object> saveInvoiceInfo(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.INTF_SAVE_INVOICE_INFO,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			resultMap = MapUtils.getMap(db.getReturnlmap(), "result", new HashMap<String, Object>());
		} else {

		}
		resultMap.put("resultCode", db.getResultCode());
		resultMap.put("resultMsg", db.getResultMsg());
		return resultMap;
	}

	public Map<String, Object> printInvoice(Map<String, Object> paramMap,
			String optFlowNum,
			HttpServletRequest request, HttpServletResponse response,
			Map<String, Object> templateInfoMap)
			throws Exception {
		SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
				request, SysConstant.SESSION_KEY_LOGIN_STAFF);

		String boActionTypeName = "";
		String prodId = "";
		String acctNumber = "";
		String acctId = "";
		List prodInfoList = (List) paramMap.get("prodInfo");
		if (prodInfoList != null && prodInfoList.size() > 0) {
			Map<String, Object> prodInfoMap = (Map<String, Object>) prodInfoList.get(0);
			if (prodInfoMap != null && prodInfoMap.containsKey("busiOrders")) {
				List busiOrders = (List) prodInfoMap.get("busiOrders");
				if (busiOrders != null && busiOrders.size() > 0) {
					Map busiOrderMap = (Map) busiOrders.get(0);
					boActionTypeName = MapUtils.getString(busiOrderMap, "boActionTypeName", "");
				}
			}
			prodId = MapUtils.getString(prodInfoMap, "prodId", "");
			acctNumber = MapUtils.getString(prodInfoMap, "acctCd", "");
			acctId = MapUtils.getString(prodInfoMap, "acctId", "");
		}
		List invoiceInfos = (List) paramMap.get("invoiceInfos");
		Map<String, Object> invoiceInfo = (Map<String, Object>) invoiceInfos.get(0);
		if(paramMap.get("printflag")!=null){
			boActionTypeName = MapUtils.getString(invoiceInfo, "boActionTypeName", "");
		}
		String billType = MapUtils.getString(invoiceInfo, "billType", "1");// 0-发票，1-票据
		String invoiceTitle = "";
		String acceNumber = MapUtils.getString(invoiceInfo, "acctNbr", "");
		Calendar calendar = Calendar.getInstance();
		String custOrderNbr = MapUtils.getString(invoiceInfo, "custSoNumber", "");
		List chargeItems = (List) paramMap.get("items");
		for (int i = 0; chargeItems != null && i < chargeItems.size(); i++) {
			Map item = (Map) chargeItems.get(i);
			String charge = MapUtils.getString(item, "charge", "0");
			charge = NumUtil.formatNumber(Double.parseDouble(charge), 100, 2);
			item.put("charge", charge);
			String tax = MapUtils.getString(item, "tax", "0");
			if (!"0".equals(tax)) {
				double taxDb = Double.parseDouble(tax) / 100.0;
				item.put("tax", "" + taxDb);
			}
			item.put("acceNumber", MapUtils.getString(item, "acceNumber", ""));
			item.put("custOrderNbr", custOrderNbr);
		}
		String sumCharge = MapUtils.getString(invoiceInfo, "account", "0");
		sumCharge = NumUtil.formatNumber(Double.parseDouble(sumCharge), 100, 2);
		String printType = MapUtils.getString(paramMap, "printType");
		Map<String, Object> printData = new HashMap<String, Object>();
		printData.put("invoiceTitle", invoiceTitle);
		printData.put("invoiceNbr", MapUtils.getString(invoiceInfo, "invoiceNbr", ""));
		printData.put("invoiceNum", MapUtils.getString(invoiceInfo, "invoiceNum", ""));
		printData.put("year", "" + calendar.get(Calendar.YEAR));
		printData.put("month", "" + (calendar.get(Calendar.MONTH) + 1));
		printData.put("day", "" + calendar.get(Calendar.DATE));
		printData.put("invoiceDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("soDate", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd"));
		printData.put("invoiceTime", DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd HH:mm:ss"));
		printData.put("partyName", MapUtils.getString(paramMap, "partyName", ""));
		printData.put("acceNumber", acceNumber);
		printData.put("custOrderId", MapUtils.getString(invoiceInfo, "custOrderId", ""));
		printData.put("custOrderNbr", custOrderNbr);
		printData.put("chargeItems", chargeItems);
		printData.put("payMethod", MapUtils.getString(paramMap, "payMethod", ""));
		printData.put("sumCharge", sumCharge);
		printData.put("sumChargeRMB", MapUtils.getString(invoiceInfo, "accountUpper", ""));
		printData.put("staffName", sessionStaff.getStaffName());
		printData.put("staffNumber", sessionStaff.getStaffCode());
		printData.put("channelNumber", sessionStaff.getCurrentChannelId());
		printData.put("channelName", sessionStaff.getCurrentChannelName());
		printData.put("prodId", prodId);
		printData.put("acctNumber", acctNumber);
		printData.put("acctId", acctId);
		printData.put("boActionTypeName", boActionTypeName);
		printData.put("acctId", acctId);

		//如果printData为空，则返回失败
		if (MapUtils.isEmpty(printData)) {
			return printData;
		}

		// 3. 数据驱动模板、展示打印页面
		runInvoicePrint(printData, response, printType, templateInfoMap);

		return printData;
	}


	public Map<String, Object> printOld2New(Map<String, Object> paramMap, String optFlowNum, HttpServletRequest request, HttpServletResponse response, Map<String, Object> templateInfoMap) throws Exception {
		{
			SessionStaff sessionStaff = (SessionStaff) ServletUtils.getSessionAttribute(
					request, SysConstant.SESSION_KEY_LOGIN_STAFF);

			Map<String, Object> resultMap;
			Map<String, Object> printData = new HashMap<String, Object>();
			String printType = MapUtils.getString(paramMap, "printType");
			DataBus db = InterfaceClient.callService(paramMap,
					PortalServiceCode.INTF_GET_OLD2NEW_DATA,
					optFlowNum, sessionStaff);
			if (ResultCode.R_SUCC.equals(db.getResultCode())) {
				resultMap = MapUtils.getMap(db.getReturnlmap(), "result");
				if (MapUtils.isNotEmpty(resultMap)) {
					//客户信息
					Map<String, Object> custInfoMap = new HashMap<String, Object>();
					custInfoMap = MapUtils.getMap(resultMap, "custInfo", null);
					if (MapUtils.isNotEmpty(custInfoMap)) {
						printData.put("custName", MapUtils.getString(custInfoMap, "custName", ""));
						printData.put("custIdentity", MapUtils.getString(custInfoMap, "certNumber", ""));
						printData.put("custAddress", MapUtils.getString(custInfoMap, "contactAddr", ""));
						printData.put("custPhoneNumber", MapUtils.getString(custInfoMap, "contactNbr", ""));
					}
					//员工信息
					Map<String, Object> staffInfoMap = new HashMap<String, Object>();
					staffInfoMap = MapUtils.getMap(resultMap, "staffInfo", null);
					if (MapUtils.isNotEmpty(staffInfoMap)) {
						printData.put("staffCode", MapUtils.getString(staffInfoMap, "staffCode", ""));
						printData.put("staffName", MapUtils.getString(staffInfoMap, "staffName", ""));
					}
					//iPhone代理回购协议
					List<Map<String, Object>> couponInfosList = new ArrayList<Map<String, Object>>();
					couponInfosList = (List<Map<String, Object>>) MapUtils.getObject(resultMap, "couponInfos", null);
					if (null != couponInfosList && couponInfosList.size() > 0) {
						Map<String, Object> couponInfosMap = new HashMap<String, Object>();
						couponInfosMap = couponInfosList.get(0);
						if (MapUtils.isNotEmpty(couponInfosMap)) {
							printData.put("backProductType", MapUtils.getString(couponInfosMap, "couponName", ""));
							printData.put("backProductVolume", MapUtils.getString(couponInfosMap, "couponVolume", ""));
							printData.put("backProductFrom", MapUtils.getString(couponInfosMap, "couponSource", ""));
							List<Map<String, Object>> funcTestList = new ArrayList<Map<String, Object>>();
							funcTestList = (List<Map<String, Object>>) MapUtils.getObject(couponInfosMap, "funcTest", null);
							List<StringTwoSet> stringTwoSetList = new ArrayList<StringTwoSet>();
							if (null != funcTestList && funcTestList.size() > 0) {
								for (Map<String, Object> map : funcTestList) {
									StringTwoSet stringTwoSet = new StringTwoSet();
									stringTwoSet.setStrBean0(MapUtils.getString(map, "itemName", ""));
									stringTwoSet.setStrBean1(MapUtils.getString(map, "itemValueName", ""));
									stringTwoSetList.add(stringTwoSet);
								}
							}
							printData.put("funcCheck", stringTwoSetList);
							printData.put("imei", MapUtils.getString(couponInfosMap, "imei", ""));
							printData.put("sn", MapUtils.getString(couponInfosMap, "couponNumber", ""));
							printData.put("price", MapUtils.getString(couponInfosMap, "couponPrice", "")+"元");
						}
					}
				}
				printData.put("relaId", MapUtils.getString(paramMap, "relaId", ""));
				printData.put("olNbr", MapUtils.getString(resultMap, "olNbr", ""));
				printData.put("confirmInfos", MapUtils.getString(resultMap, "confirmInfos", ""));
				printData.put("custNotice", MapUtils.getString(resultMap, "custNotice", ""));
				printData.put("serviceNotice", MapUtils.getString(resultMap, "serviceNotice", ""));
			} else {

			}

			//如果printData为空，则返回失败
			if (MapUtils.isEmpty(printData)) {
				return printData;
			}

			// 3. 数据驱动模板、展示打印页面
			runOld2NewPrint(printData, response, printType, templateInfoMap);

			return printData;
		}
	}

	protected Map<String, Object> runOld2NewPrint(Map<String, Object> printData,
			HttpServletResponse response, String printType,
			Map<String, Object> templateInfoMap) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();

		String printTypeDir;
		String strJasperFileName;
	            printTypeDir = SysConstant.P_MOD_SUB_BASE_DIR + SysConstant.P_MOD_SUB_OLD2NEW;
	            strJasperFileName = SysConstant.P_MOD_BASE_DIR + SysConstant.P_MOD_SUB_OLD2NEW
	                    + SysConstant.P_MOD_FILE_OLD2NEW + SysConstant.P_MOD_FILE_SUBFIX;

		log.debug(" 以旧换新模板名称： " + strJasperFileName);

		Collection<Map<String, Object>> inFields = new ArrayList<Map<String, Object>>();
		inFields.add(printData);

		Map<String, Object> reportParams = new HashMap<String, Object>();
		reportParams.put("SUBREPORT_DIR", printTypeDir);

		//输出打印内容
		if (SysConstant.PRINT_TYPE_HTML.equals(printType)) {
			commonHtmlPrint(strJasperFileName, reportParams, inFields,
					response, 0, 0);
		} else {
			commonPdfPrint(strJasperFileName, reportParams, inFields,
					response, 0, 0);
		}

		return resultMap;
	}

	protected Map<String, Object> runInvoicePrint(Map<String, Object> printData,
			HttpServletResponse response, String printType,
			Map<String, Object> templateInfoMap) throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();

		String printTypeDir = "";
		String strJasperFileName = "";
		 if (SysConstant.ON.equals(propertiesUtils.getMessage(SysConstant.ABS_DIRECTORY_FLAG))) {
	            String templatePath = MapUtils.getString(templateInfoMap, "templatePath");
	            String absDir = propertiesUtils.getMessage(SysConstant.ABS_DIRECTORY_KEY);
	            if (absDir.charAt(absDir.length() - 1) != '/') {
	                absDir += '/';
	            }
	            printTypeDir = SysConstant.P_FILE_PROTOCOL + absDir;

	            strJasperFileName = printTypeDir + templatePath + SysConstant.P_MOD_FILE_SUBFIX;
	            printTypeDir = strJasperFileName.substring(0, strJasperFileName.lastIndexOf("/") + 1);
	        } else {
	            printTypeDir = SysConstant.P_MOD_SUB_BASE_DIR + SysConstant.P_MOD_SUB_INVOICE;
	            strJasperFileName = SysConstant.P_MOD_BASE_DIR + SysConstant.P_MOD_SUB_INVOICE
	                    + SysConstant.P_MOD_FILE_INVOICE + SysConstant.P_MOD_FILE_SUBFIX;
	        }

		log.debug(" 发票模板名称： " + strJasperFileName);

		Collection<Map<String, Object>> inFields = new ArrayList<Map<String, Object>>();
		inFields.add(printData);

		Map<String, Object> reportParams = new HashMap<String, Object>();
		reportParams.put("SUBREPORT_DIR", printTypeDir);

		//输出打印内容
		if (SysConstant.PRINT_TYPE_HTML.equals(printType)) {
			commonHtmlPrint(strJasperFileName, reportParams, inFields,
					response, 0, 0);
		} else {
			commonPdfPrint(strJasperFileName, reportParams, inFields,
					response, 0, 0);
		}

		return resultMap;
	}


	public Map<String, Object> invalidInvoices(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.INTF_INVALID_INVOICE,
				optFlowNum, sessionStaff);
		// 服务层调用与接口层调用都成功时，返回列表；否则返回空列表
		resultMap.put("resultCode", db.getResultCode());
		resultMap.put("resultMsg", db.getResultMsg());
		return resultMap;
	}

	public Map<String, Object> getInvoiceInfo(Map<String, Object> paramMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(paramMap,
				PortalServiceCode.INTF_GET_INVOICE_INFO,
				optFlowNum, sessionStaff);
		// 鏈嶅姟灞傝皟鐢ㄤ笌鎺ュ彛灞傝皟鐢ㄩ兘鎴愬姛鏃讹紝杩斿洖鍒楄〃锛涘惁鍒欒繑鍥炵┖鍒楄〃
		if (ResultCode.R_SUCC.equals(db.getResultCode())) {
			Object obj = db.getReturnlmap().get("result");
			if (obj != null) {
				if (obj instanceof List) {
					resultMap.put("invoiceInfos", (List<Map<String, Object>>)obj);
				} else if (obj instanceof Map) {
					List<Map<String, Object>> tmpList = new ArrayList<Map<String, Object>>();
					tmpList.add((Map<String, Object>) obj);
					resultMap.put("invoiceInfos", tmpList);
				}
			}
		} else {

		}
		resultMap.put("resultCode", db.getResultCode());
		resultMap.put("resultMsg", db.getResultMsg());
		return resultMap;
	}

	/**
	 * 充值收据打印
	 */
	public Map<String, Object> printChargeReceipt(Map<String, Object> paramMap, String optFlowNum,
			HttpServletRequest request, HttpServletResponse response,
			Map<String, Object> templateInfoMap)throws Exception{

		Map<String ,Object> receiptInfo = MapUtils.getMap(paramMap, "receiptInfo", new HashMap<String, Object>());
		Calendar calendar = Calendar.getInstance();
		receiptInfo.put("year", calendar.get(Calendar.YEAR));
    	receiptInfo.put("month", calendar.get(Calendar.MONTH)+1);
    	receiptInfo.put("day", calendar.get(Calendar.DATE));

		runInvoicePrint(receiptInfo, response, MapUtils.getString(paramMap, "printType"), templateInfoMap);
		return receiptInfo;
	}

	public Map<String, Object> queryConstConfig(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_CONST_CONFIG, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = (Map<String, Object>)db.getReturnlmap().get("result");
				returnMap.put("code", ResultCode.R_SUCCESS);
				if (resultMap.get("soConstConfigs") instanceof List) {
					if(((List<Map<String, Object>>)resultMap.get("soConstConfigs")).size()>0){
						returnMap.putAll(((List<Map<String, Object>>)resultMap.get("soConstConfigs")).get(0));
					}
				}
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "公共数据查询的服务");
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.soService/querySoConstConfigByConditions服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_CONST_CONFIG, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}

	private byte[] savePdfApp(byte[] data,String html,HttpServletRequest request){
		try {
			byte[] pdfByte=null;
			String image=byte2image(data,request);
			if(image!=null){
				html = html.replace("</br>", "");
				html=html.replace("XXXXXSIGN", image);
				String pdf=convertHtmlToPdf(html,request);
				String paths=request.getRealPath("resources/image/gongz/")+"/";
				String imagePath=paths+image;
				File fileImg=new File(imagePath);
				if(fileImg.exists())
					fileImg.delete();

				String pdfPath=paths+pdf;
				pdfByte=File2byte(pdfPath);
				File filePdf=new File(pdfPath);
				if(filePdf.exists())
					filePdf.delete();
			}
			return pdfByte;
		} catch (Exception e) {
			return null;
		}
	}

	//将html保存成pdf
	private String convertHtmlToPdf(String html,HttpServletRequest request)throws Exception {
		String paths=request.getRealPath("resources/image/gongz/");
		String str= UIDGenerator.getRand()+".pdf";
		String outputFile=paths+"/"+str;
		OutputStream os = new FileOutputStream(outputFile);
        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(html);
        // 解决中文支持问题
        ITextFontResolver fontResolver = renderer.getFontResolver();
        //解决图片的相对路径问题
        renderer.getSharedContext().setBaseURL("file:/"+paths+"/");
        renderer.layout();
        renderer.createPDF(os);

        os.flush();
        os.close();
        return str;
	}

	//保存签名文件为图片
	public String byte2image(byte[] data,HttpServletRequest request){
		String paths=request.getRealPath("resources/image/gongz/");
		String str= UIDGenerator.getRand()+".jpg";
		String path=paths+"/"+str;
	    if(data.length<3||path.equals("")) return null;
	    try{
	    FileImageOutputStream imageOutput = new FileImageOutputStream(new File(path));
	    imageOutput.write(data, 0, data.length);
	    imageOutput.close();
	    log.debug("path", path);
	    } catch(Exception ex) {
	      ex.printStackTrace();
	    }
	    return str;
	  }

	/**
	 * 根据文件路径String 转为 byte[]
	 *
	 * @param filePath
	 * @return
	 */
	public byte[] File2byte(String filePath) {
		byte[] buffer = null;
		FileInputStream fis=null;
		ByteArrayOutputStream bos=null;
		try {
			File file = new File(filePath);
			fis = new FileInputStream(file);
			bos = new ByteArrayOutputStream();
			byte[] b = new byte[1024];
			int n;
			while ((n = fis.read(b)) != -1) {
				bos.write(b, 0, n);
			}
			buffer = bos.toByteArray();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}finally{
			try {
				if(fis!=null){
					fis.close();
				}
				if(bos!=null){
					bos.close();
				}
			} catch (Exception e2) {
				e2.printStackTrace();
			}
		}
		return buffer;
	}

	/**
	 * 给pdf盖公章
	 * @param pdfString BASE64编码后的PDF文件内容
	 * @param orgId 组织标识
	 * @param page 签章所在页码
	 * @param llx 签章位置。左下角X坐标
	 * @param lly 签章位置。左下角Y坐标
	 * @param urx 签章位置。右上角X坐标
	 * @param ury 签章位置。右上角Y坐标
	 * @return
	 */
	private Map<String, Object> getGZPdf(String pdfString,String orgId,String page,int llx,int lly,int urx,int ury,String optFlowNum,SessionStaff sessionStaff) throws Exception{
		Map<String, Object> returnMap = new HashMap<String, Object>();
		Map<String, Object> dataBusMap=new HashMap<String, Object>();
		dataBusMap.put("actionCode", "actionCode");
		dataBusMap.put("key", "key");
		Map<String, Object> param=new HashMap<String, Object>();
		param.put("pdfFile", pdfString);
		param.put("orgId", 0);
		param.put("fieldName", "fieldName");
		param.put("page", page);
		param.put("llx", llx);
		param.put("lly", lly);
		param.put("urx", urx);
		param.put("ury", ury);
		dataBusMap.put("param", param);
		DataBus db =null;
		try {
			db = InterfaceClient.callService(dataBusMap,
					PortalServiceCode.seal_ca, optFlowNum, sessionStaff);
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				if(ResultCode.R_SUCC.equals(resultMap.get("code"))){
					String result = resultMap.get("resultParam").toString();
					returnMap.put("code", ResultCode.R_SUCCESS);
					returnMap.put("resultParam",result);
				}else {
					returnMap.put("code", ResultCode.R_FAIL);
					returnMap.put("msg", resultMap.get("message"));
				}
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", db.getResultMsg());
			}
			return returnMap;
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.SEAL_CA,dataBusMap,db.getReturnlmap(), e);
		}
	}

	/**
	 * 构建list内容
	 * @param listMap 要构建的list对象
	 * @param hasSeq 是否需要带序列号
	 * @return 字符串
	 */
	private String buildBizReportDetailItemOrDescDto(List<Map<String, Object>> listMap, boolean hasSeq) {
		int index = 1;
		String retStr = "";
		if (null != listMap && listMap.size() == 1) {
			Map<String, Object> map = listMap.get(0);
			String itemName = MapUtils.getString(map, "itemName", "");
			String itemValue = MapUtils.getString(map, "itemValue", "");
			String sep = "";
			if (StringUtils.isNotBlank(itemName) && StringUtils.isNotBlank(itemValue)) {
				sep = SysConstant.STR_SEP;
			}
			return itemName + sep + itemValue;
		}
		int size = listMap.size();
		for (int i = 0; i < size; i++) {
			Map<String, Object> next = listMap.get(i);
			String itemName = MapUtils.getString(next, "itemName", "");
			String itemValue = MapUtils.getString(next, "itemValue", "");
			String sep = "";
			if (StringUtils.isNotBlank(itemName) && StringUtils.isNotBlank(itemValue)) {
				sep = SysConstant.STR_SEP;
			}
			retStr += (hasSeq ? index++ + SysConstant.STR_RL_BRE : "") + itemName + sep + itemValue;
			if (i != size - 1) {
				retStr += SysConstant.STR_ENT;
			}
		}
		return retStr;
	}

	/**
	 * 构建list内容
	 * @param map 要构建的list对象
	 * @param hasSeq 是否需要带序列号
	 * @return 字符串
	 */
	private String buildBizReportDetailItemAndDescDto(List<Map<String, Object>> map,boolean hasSeq) {
		List<Map<String,Object>> itemList=getBizReportDetailItemDtoList(map);
		List<Map<String,Object>> descList=getBizReportDetailDescDtoList(map);
		List<Map<String, Object>> itemDescList = new ArrayList<Map<String, Object>>();

		if (null != itemList && itemList.size() > 0) {
			for (Map<String, Object> item : itemList) {
				itemDescList.add(item);
			}
		}
		if (null != descList && descList.size() > 0) {
			for (Map<String, Object> desc : descList) {
				itemDescList.add(desc);
			}
		}

		return  buildBizReportDetailItemOrDescDto(itemDescList,hasSeq);
	}

	private String getItemAndDesc(Map<String, Object> map) {
		String retStr;
		List<Map<String, Object>> descDtoList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> itemDtoList = new ArrayList<Map<String, Object>>();

		itemDtoList = (List<Map<String, Object>>) map.get("bizReportDetailItemDto");
		descDtoList = (List<Map<String, Object>>) map.get("bizReportDetailDescDto");
		String item = "";
		if (null != itemDtoList && itemDtoList.size() == 1) {
			item += getItem(itemDtoList.get(0));
		}
		if (null != descDtoList && descDtoList.size() == 1) {
			item += (StringUtils.isEmpty(item) ? "" : SysConstant.STR_ENT) + getItem(descDtoList.get(0));
		}
		String detail=getDetail(map);
		retStr = detail + SysConstant.STR_SEP + item;
		return retStr;
	}

	private String getDetailName(Map<String,Object> map){
		return MapUtils.getString(map,"detailName","");
	}
	private String getDetailValue(Map<String,Object> map){
		return MapUtils.getString(map,"detailValue","");
	}
	private String getDetail(Map<String,Object> map){
		if(MapUtils.isEmpty(map))
			return "";
		String name=getDetailName(map);
		String value = getDetailValue(map);
		if(StringUtils.isNotBlank(name)&&StringUtils.isNotBlank(value))
			return name+SysConstant.STR_SEP+value;
		if(StringUtils.isNotBlank(name))
			return name;
		if(StringUtils.isNotBlank(value))
			return value;
		return "";
	}

	private String getItemCd(Map<String,Object> map){
		return MapUtils.getString(map,"itemCd","");
	}
	private String getItemName(Map<String,Object> map){
		return MapUtils.getString(map, "itemName", "");
	}
	private String getItemValue(Map<String, Object> map) {
		return MapUtils.getString(map, "itemValue", "");
	}

	private String getItem(Map<String, Object> map){
		if(MapUtils.isEmpty(map))
			return "";
		String name=getItemName(map);
		String value = getItemValue(map);
		if (StringUtils.isNotBlank(name) && StringUtils.isNotBlank(value)) {
			if (value.endsWith(SysConstant.STR_STO)) {
				return name + SysConstant.STR_SEP + value;
			} else {
				return name + SysConstant.STR_SEP + value + SysConstant.STR_SPI;
			}
		}
		if(StringUtils.isNotBlank(name))
			return name;
		if(StringUtils.isNotBlank(value))
			return value;
		return "";
	}

	/**
	 * 获取bizReportDetailItemDto对应的map对象
	 * @param mapList
	 * @return
	 */
	private Map<String,Object> getBizReportDetailItemDto(List<Map<String,Object>> mapList){
		if(null!=mapList&&mapList.size()>0) {
			Map<String, Object> map = mapList.get(0);
			if(MapUtils.isNotEmpty(map)) {
				List<Map<String,Object>> retListMap= (List<Map<String, Object>>) MapUtils.getObject(map, "bizReportDetailItemDto", null);
				if(null!=retListMap&&retListMap.size()>0) {
					return retListMap.get(0);
				}
			}
		}
		return null;
	}
	/**
	 * 获取bizReportDetailItemDto对应的map对象list
	 * @param mapList
	 * @return
	 */
	private List<Map<String,Object>> getBizReportDetailItemDtoList(List<Map<String,Object>> mapList) {
		List<Map<String, Object>> maps=null;
		if (null != mapList && mapList.size() > 0) {
			Map<String, Object> map = mapList.get(0);
			if (MapUtils.isNotEmpty(map)) {
				maps= (List<Map<String, Object>>) MapUtils.getObject(map, "bizReportDetailItemDto", null);
			}
		}
		return maps;
	}

	/**
	 * 获取bizReportDetailItemDto对应的map对象
	 * @param mapList
	 * @return
	 */
	private Map<String,Object> getBizReportDetailDescDto(List<Map<String,Object>> mapList){
		if(null!=mapList&&mapList.size()>0) {
			Map<String, Object> map = mapList.get(0);
			if(MapUtils.isNotEmpty(map)) {
				List<Map<String,Object>> retListMap= (List<Map<String, Object>>) MapUtils.getObject(map, "bizReportDetailDescDto", null);
				if(null!=retListMap&&retListMap.size()>0) {
					return retListMap.get(0);
				}
			}
		}
		return null;
	}
	/**
	 * 获取bizReportDetailItemDto对应的map对象list
	 * @param mapList
	 * @return
	 */
	private List<Map<String,Object>> getBizReportDetailDescDtoList(List<Map<String,Object>> mapList) {
		List<Map<String, Object>> maps=null;
		if (null != mapList && mapList.size() > 0) {
			Map<String, Object> map = mapList.get(0);
			if (MapUtils.isNotEmpty(map)) {
				maps= (List<Map<String, Object>>) MapUtils.getObject(map, "bizReportDetailDescDto", null);
			}
		}
		return maps;
	}

	/**
	 * 构建StringBeanSet的List
	 * @param mapList
	 * @return
	 */
	private List<StringBeanSet> getListStringBeanSet(List<Map<String, Object>> mapList) {
		if (null != mapList && mapList.size() > 0) {
			List<StringBeanSet> stringBeanSetList = new ArrayList<StringBeanSet>();
			for (int i = 0; i < mapList.size(); i++) {
				StringBeanSet stringBeanSet = new StringBeanSet();
				Map<String, Object> map = mapList.get(i);
				stringBeanSet.setStrBean(getItem(map));
				stringBeanSetList.add(stringBeanSet);
			}
			return stringBeanSetList;
		}
		return null;
	}

	/**
	 * 构建StringTwoSet的List
	 * @param mapList
	 * @return
	 */
	private List<StringTwoSet> getListStringTwoSet(List<Map<String, Object>> mapList) {
		if (null != mapList && mapList.size() > 0) {
			List<StringTwoSet> norOSBaseInfos = new ArrayList<StringTwoSet>();
			StringTwoSet itemTwo = null;
			for (int i = 0; i < mapList.size(); i++) {
				if (i % 2 == 0) {
					itemTwo = new StringTwoSet();
				}
				Map<String, Object> tmpMap = mapList.get(i);
				if (i % 2 == 0) {
					itemTwo.setStrBean0(getItem(tmpMap));
				} else {
					itemTwo.setStrBean1(getItem(tmpMap));
				}
				if (i % 2 == 0) {
					norOSBaseInfos.add(itemTwo);
				}
			}
			return norOSBaseInfos;
		}
		return null;
	}
	/**
	 * 组装－业务信息_合约计划订购_内容
	 * @param contMap
	 * @param key
	 * @return
	 */
	private List<OETitleContent> buildOrderEventCont_V2(Map<String, Object> contMap, String key) {
		if (MapUtils.isEmpty(contMap)) {
			return null;
		}
		List<OETitleContent> titleContentList = new ArrayList<OETitleContent>();
		if (contMap.containsKey(key)) {
			List<Map<String, Object>> agrPlanMods = (List<Map<String, Object>>) contMap.get(key);
			int index=1;
			int size=agrPlanMods.size();
			if (agrPlanMods == null || size == 0) {
				return null;
			}
			if(null!=agrPlanMods&&size==1){
				Map<String, Object> map = agrPlanMods.get(0);
				OETitleContent oeTitleContent = buildOETitleContent_V2(0, SysConstant.STR_PAU, map);
				titleContentList.add(oeTitleContent);
			} else {
				for (int i = 0; i < agrPlanMods.size(); i++) {
					Map<String, Object> map = agrPlanMods.get(i);
					OETitleContent oeTitleContent = buildOETitleContent_V2(index++, SysConstant.STR_PAU, map);
					titleContentList.add(oeTitleContent);
				}
			}
		}
		return titleContentList;
	}

	/**
	 * 构建二级标题-内容
	 *
	 * @param seq
	 * @param map
	 * @return
	 */
	private OETitleContent buildOETitleContent_V2(int seq,String separator, Map<String, Object> map){
		if(null==map||map.size()==0){
			return null;
		}
		OETitleContent oeTitleContent = new OETitleContent();

		List<StringBeanSet> strBeanTitleList = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet();
		strBeanTitle.setStrBean(buildBusiInfoTitle_V2(seq, separator, getDetailName(map)));
		strBeanTitleList.add(strBeanTitle);

		List<StringBeanSet> strBeanContentList = new ArrayList<StringBeanSet>();
		List<Map<String, Object>> bizReportDetailItemDto = (List<Map<String, Object>>) MapUtils.getObject(map, "bizReportDetailItemDto");
		if(null!=bizReportDetailItemDto&&bizReportDetailItemDto.size()>0) {
			for (Map<String, Object> itemMap : bizReportDetailItemDto) {
				StringBeanSet strBeanContent = new StringBeanSet();
				String content = getItem(itemMap);
				strBeanContent.setStrBean(content);
				strBeanContentList.add(strBeanContent);
			}
		}
		List<Map<String, Object>> bizReportDetailDescDto = (List<Map<String, Object>>) MapUtils.getObject(map, "bizReportDetailDescDto");
		if(null!=bizReportDetailDescDto&&bizReportDetailDescDto.size()>0) {
			for (Map<String, Object> descMap : bizReportDetailDescDto) {
				StringBeanSet strBeanContent = new StringBeanSet();
				String content = getItem(descMap);
				strBeanContent.setStrBean(content);
				strBeanContentList.add(strBeanContent);
			}
		}


		oeTitleContent.setOrderTitle(strBeanTitleList);
		oeTitleContent.setOrderContent(strBeanContentList);
		return oeTitleContent;
	}
	/**
	 * 单行校验
	 * @param itemMap
	 * @return true 单行，false不是单行
	 */
	private boolean isNewline(Map<String, Object> itemMap) {
		String isNewline = MapUtils.getString(itemMap, "isNewline");
		if (SysConstant.STR_Y.equals(isNewline)) {
			return true;
		}
		return false;
	}
	/**
	 * 分离单行与可合并行为两个listMap
	 * @param dataList
	 * @return
	 */
	private Map<String, Object> splitOneLine(List<Map<String, Object>> dataList) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		List<Map<String, Object>> normItemList = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> lineItemList = new ArrayList<Map<String,Object>>();
		if(null==dataList||dataList.size()==0){return retnMap;}
		for (int i = 0; i < dataList.size(); i++) {
			Map<String, Object> itemMap = dataList.get(i);
			if (isNewline(itemMap)) {
				lineItemList.add(itemMap);
			} else {
				normItemList.add(itemMap);
			}
		}
		if (normItemList.size() > 0) {
			retnMap.put("norm", normItemList);
		}
		if (lineItemList.size() > 0) {
			retnMap.put("line", lineItemList);
		}
		return retnMap;
	}

	/**
	 *新版本打印
	 * @param dataMap
	 * @param speCustInfoLen
	 * @return
	 */
	private List<OrderEventSet> parseOrderEvents_V2(Map<String, Object> dataMap, int speCustInfoLen) {
		List<OrderEventSet> orderEventSets = new ArrayList<OrderEventSet>();
		if (dataMap.containsKey("orderEvent")) {

			List<Map<String, Object>> orderEventList = (List<Map<String, Object>>) dataMap.get("orderEvent");

			//对orderEvent节点做排序处理
			Collections.sort(orderEventList, new Comparator<Map<String, Object>>() {
				public int compare(Map<String, Object> o1, Map<String, Object> o2) {
					int i1 = MapUtils.getIntValue(o1, "seq", 0);
					int i2 = MapUtils.getIntValue(o2, "seq", 0);
					return i1-i2;
				}
			});

			//20140715 处理多个产品时合并展示接入号码的需求
			//1）[开通]xxxx功能(号码：xxxxxxxxxxx ，xxxxxxxxxxx)；（xx小时内生效）；xx元/月 ；  （多号码可并列）
			orderEventList = mergeAcceNbrToServ_V2(orderEventList);

			int eventSize = orderEventList.size();
			boolean attachFlag = false;
			Map<String, Object> finalAttachMap = new HashMap<String, Object>();
			for (int i = 0; i < eventSize; i++) {
				Map<String, Object> event = orderEventList.get(i);
				String orderEventType = MapUtils.getString(event, "orderEventType", "0");
				if ("1".equals(orderEventType)) {
					finalAttachMap = getAttachForMain_V2(event, orderEventList);
					List<Map<String, Object>> list = (List<Map<String, Object>>) finalAttachMap.get("attachOneList");
					if (list != null && list.size() > 0) {
						attachFlag = true;
					}
				}
			}

			int orderEventSeq = 1;
			for (int i = 0; i < eventSize; i++) {
				Map<String, Object> event = orderEventList.get(i);
				OrderEventSet set = null;
				String orderEventType = MapUtils.getString(event, "orderEventType", "0");
				if ("1".equals(orderEventType)) {
					set = buildOrderEvent_1_V2(event, orderEventSeq, eventSize, orderEventList);
				} else if ("2".equals(orderEventType)) {
					set = buildOrderEvent_2_V2(event, orderEventSeq, eventSize);
				} else if ("3".equals(orderEventType)) {
					set = buildOrderEvent_3_V2(event, orderEventSeq, eventSize, attachFlag, (List<Map<String, Object>>) finalAttachMap.get("attachThreeList"));
				} else if ("4".equals(orderEventType)) {
					set = buildOrderEvent_4(event, orderEventSeq, eventSize);
				} else if ("5".equals(orderEventType)) {
					if (count == 1 && orderEventSeq != 1) {
						orderEventSeq--;
					}
					set = buildOrderEvent_5_V2(event, orderEventSeq, eventSize, speCustInfoLen, attachFlag);
				} else if ("6".equals(orderEventType)) {
					set = buildOrderEvent_6_V2(event, orderEventSeq, eventSize);
				}else if("8".equals(orderEventType)) {
					set = buildOrderEvent_8(event, orderEventSeq, eventSize);
				}

				if (set != null) {
					orderEventSets.add(set);
					orderEventSeq++;
				}
			}
		}
		List temp = new ArrayList();
		if(count > 1){
			for(OrderEventSet orderEventSet :  orderEventSets){
				if(orderEventSet != null &&  orderEventSet.getProdChangeList() != null &&  orderEventSet.getProdChangeList().size() > 0){
					for(OEProdChangeSet change :  orderEventSet.getProdChangeList()){
						if(change != null &&  change.getProdChangeTitle() != null &&  change.getProdChangeTitle().size() > 0){
							for(StringBeanSet set : change.getProdChangeTitle()){
								if(set.getStrBean() != null && set.getStrBean().indexOf("加装手机") !=-1 && count > 1){
									temp.add(orderEventSet);
									count -- ;
								}
							}
						}
					}
				}
			}
		}
		if(temp.size() > 0){
			orderEventSets.removeAll(temp);
		}
		//重置全局变量（原因：spring只实例化一个实例，并非每次都生成新实例）
		count = 0;
		comment = "";
		return orderEventSets;
	}


	private OrderEventSet buildOrderEvent_2_V2(Map<String, Object> event, int orderSeq, int oeSize) {
		{
			if(MapUtils.isEmpty(event)){
				return null;
			}

			OrderEventSet orderEvent = new OrderEventSet();
			// 设置分隔线
			if(orderSeq <= oeSize && orderSeq != SysConstant.INT_1){
				orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
			}

			List<OETermOfferSet> termOfferList = new ArrayList<OETermOfferSet>();
			OETermOfferSet termOfferSet = new OETermOfferSet();
			// 设置合约计划_标题
			if(event.containsKey("orderEventTitle")){
				Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
				String termOfferTitle = buildOrderEvent_2_Title(oeSize, orderSeq, titleMap);
				termOfferSet.setTermOfferTitle(termOfferTitle);
			}

			// 设置合约计划_内容
			if(event.containsKey("orderEventCont")){
				Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
				List<OETitleContent> termOfferTitleContent = buildOrderEventCont_V2(contMap, "agrPlanMods");
				if(null != termOfferTitleContent && termOfferTitleContent.size() > 0){
					termOfferSet.setTermOfferTitleContent(termOfferTitleContent);
				}
			}

			termOfferList.add(termOfferSet);
			orderEvent.setTermOfferList(termOfferList);
			return orderEvent;
		}
	}

	private OrderEventSet buildOrderEvent_1_V2(Map<String, Object> event, int orderSeq, int eventSize, List<Map<String, Object>> orderEventList) {

		if (event == null) {
			return null;
		}
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置业务信息_分隔线
		if (orderSeq <= eventSize && orderSeq != SysConstant.INT_1) {
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}

		// 设置业务信息_主销售品
		List<OEMainOfferSet> mainOfferList = new ArrayList<OEMainOfferSet>();
		OEMainOfferSet oeMainOfferSet = new OEMainOfferSet();

		//判断是否存在叠加包  BEGIN
//		有叠加包的情况：
//		1、订购了套餐外的可选包
//			规则：orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> offerInfos存在
//		2、存在加装手机或加装
//			规则：
//		3、订购了套餐外的功能产品
//			规则： orderEventType为3的附属销售品[订购、续订、变更、退订]，主销售品[退订、注销] 中，
//				    找orderEventTitle -> boActionTypeCd为7的功能产品，从中过滤掉
//				  orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> servInfos的功能产品，
//				    剩下的如果存在，就是有订购套餐外功能产品
		boolean attachFlag = false;
		boolean blockFlag = false;
		Map<String, Object> finalAttachMap = getAttachForMain_V2(event, orderEventList);

		if (MapUtils.isNotEmpty(finalAttachMap)) {
			attachFlag=true;
			// 设置业务信息_主销售品_叠加包
//			List<OSAttachOfferSet> osAttachOfferList = new ArrayList<OSAttachOfferSet>();
//
//			List<Map<String, Object>> list = (List<Map<String, Object>>) finalAttachMap.get("attachOneList");
//			OSAttachOfferSet attachOfferSet = null;
//			if (list != null && list.size() > 0) {
//				attachOfferSet = buildOE_1_AttachOffer_V2(orderSeq, finalAttachMap, event,orderEvent);
//			}
//
//
//			if (attachOfferSet != null) {
//				osAttachOfferList.add(attachOfferSet);
//				oeMainOfferSet.setOsAttachOfferList(osAttachOfferList);
//			}
			if (finalAttachMap.containsKey("blockOffers")) {
				blockFlag = true;
			}
		}
		//判断是否存在叠加包  END

		// 设置业务信息_主销售品_标题
		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
		if (event.containsKey("orderEventTitle")) {
			List<StringBeanSet> strList = new ArrayList<StringBeanSet>();
			String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
			String prodSpecName = MapUtils.getString(titleMap, "prodSpecName", "");
			String effectRule = MapUtils.getString(titleMap, "effectRule", "");
			String attachOfferSpecName = MapUtils.getString(titleMap, "attachOfferSpecName", "");
			String offerTypeName = MapUtils.getString(titleMap, "offerTypeName", "");

			StringBeanSet strBean = buildOE_1_Title_V2(eventSize, orderSeq, boActionTypeName, prodSpecName, effectRule, attachFlag, attachOfferSpecName, offerTypeName);
			strList.add(strBean);
			oeMainOfferSet.setMainOfferTitle(strList);
		}
		// 设置业务信息_主销售品_内容
		if (event.containsKey("orderEventCont")) {
			int busiOrderSeq = 1;

			// 设置业务信息_主销售品_接入号码
			List<AcceNbrNewSet> acceNbrNewList = new ArrayList<AcceNbrNewSet>();
			if (contMap != null && contMap.containsKey("userAcceNbrs")) {
				List<Map<String, Object>> userAcceNbrs = (List<Map<String, Object>>) contMap.get("userAcceNbrs");
				AcceNbrNewSet acceNbrNewSet = buildOE_1_AcceNbrNew_V2(busiOrderSeq, userAcceNbrs);
				if (null != acceNbrNewSet) {
					busiOrderSeq++;

					acceNbrNewList.add(acceNbrNewSet);

					oeMainOfferSet.setAcceNbrNewList(acceNbrNewList);
				}

			}
			//如果是积木套餐，则显示语音模块和流量模块
			if (blockFlag) {
				List<Map<String, Object>> blockOffers = (List<Map<String, Object>>) finalAttachMap.get("blockOffers");

				for (int i = 0; i < blockOffers.size(); i++) {
					Map<String, Object> offerMap = blockOffers.get(i);
					String offerTypeCd = MapUtils.getString(offerMap, "offerTypeCd", "");
					if (SysConstant.FLOW.equals(offerTypeCd)) {
						// 设置业务信息_主销售品_积木套餐语音模块
						List<OSBaseInfoSet> osBaseInfoSets = new ArrayList<OSBaseInfoSet>();
						OSBaseInfoSet osBaseInfoSet =
								buildOE_1_OSInfo_block_V2(busiOrderSeq, offerMap);
						if (osBaseInfoSet != null) {
							busiOrderSeq++;
							osBaseInfoSets.add(osBaseInfoSet);
							oeMainOfferSet.setOsBaseInfoList(osBaseInfoSets);
						}
					} else if (SysConstant.SPEECH.equals(offerTypeCd)) {
						// 设置业务信息_主销售品_积木套餐流量模块
						List<OSBaseInfoSet> osOutInfoList = new ArrayList<OSBaseInfoSet>();
						OSBaseInfoSet outInfoSet =
								buildOE_1_OSInfo_block_V2(busiOrderSeq, offerMap);
						if (outInfoSet != null) {
							busiOrderSeq++;
							osOutInfoList.add(outInfoSet);
							oeMainOfferSet.setOsBaseInfoList2(osOutInfoList);
						}
					}
				}
			} else {
				// 设置业务信息_主销售品_套餐月基本费
				List<OSBaseInfoSet> osBaseInfoSets = new ArrayList<OSBaseInfoSet>();
				if (contMap != null && contMap.containsKey("osBaseInfo")) {
					OSBaseInfoSet osBaseInfoSet =
							buildOE_1_OSInfo_V2(busiOrderSeq,
									(List<Map<String, Object>>) contMap.get("osBaseInfo"));
					if (osBaseInfoSet != null) {
						busiOrderSeq++;
						osBaseInfoSets.add(osBaseInfoSet);
						oeMainOfferSet.setOsBaseInfoList(osBaseInfoSets);
					}
				}
			}
			// 设置业务信息_主销售品_套餐超出资费
			List<OSBaseInfoSet> osOutInfoList = new ArrayList<OSBaseInfoSet>();
			if (contMap != null && contMap.containsKey("osOutInfos")) {
				OSBaseInfoSet outInfoSet =
						buildOE_1_OSInfo_V2(busiOrderSeq, (List<Map<String, Object>>) contMap.get("osOutInfos"));
				if (outInfoSet != null) {
					busiOrderSeq++;
					osOutInfoList.add(outInfoSet);
					oeMainOfferSet.setOsOutInfoList(osOutInfoList);
				}
			}

			// 设置业务信息_主销售品_订购当月资费
			List<OSOrderInfoSet> osOrderInfoList = new ArrayList<OSOrderInfoSet>();
			List<Map<String, Object>> currMouthPrice = (List<Map<String, Object>>) MapUtils.getObject(contMap, "osOrderInfo");
			if (null != currMouthPrice && currMouthPrice.size() > 0) {
				OSOrderInfoSet orderInfoSet = buildOE_1_OrderInfo_V2(busiOrderSeq, currMouthPrice);
				if (orderInfoSet != null) {
					busiOrderSeq++;
					osOrderInfoList.add(orderInfoSet);
					oeMainOfferSet.setOsOrderInfoList(osOrderInfoList);
				}
			}
			// 设置业务信息_主销售品_其它说明
			List<OSOtherInfoSet> osOtherInfoList = new ArrayList<OSOtherInfoSet>();
			if (contMap != null && contMap.containsKey("osOtherInfo")) {
				OSOtherInfoSet otherInfoSet = buildOE_1_OtherInfo_V2(busiOrderSeq,
						(List<Map<String, Object>>) contMap.get("osOtherInfo"));
				if (otherInfoSet != null) {
					busiOrderSeq++;
					osOtherInfoList.add(otherInfoSet);
					oeMainOfferSet.setOsOtherInfoList(osOtherInfoList);
				}
			}
		}

		mainOfferList.add(oeMainOfferSet);
		orderEvent.setMainOfferList(mainOfferList);
		return orderEvent;

	}

	private AcceNbrNewSet buildOE_1_AcceNbrNew_V2(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null) {
			return null;
		}
		AcceNbrNewSet newSet = new AcceNbrNewSet();
		// 设置接入号码头
		List<StringBeanSet> strBeanList = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet(getTitleName4Index(orderSeq,paramList));
		strBeanList.add(strBean);
		newSet.setAcceNbrTitle(strBeanList);

		// 设置产品属性内容
		List<OfferProdAttrsSet> offerProdInfos = new ArrayList<OfferProdAttrsSet>();
		OfferProdAttrsSet offerProdAttrsSet = new OfferProdAttrsSet();
		// 展示产品接入号
		List<StringBeanSet> acceList = new ArrayList<StringBeanSet>();
		StringBeanSet acceBean = new StringBeanSet();
		String str = getItem(getBizReportDetailItemDto(paramList));
		acceBean.setStrBean(str);
		acceList.add(acceBean);
		offerProdAttrsSet.setAcceNbrInfo(acceList);

		offerProdInfos.add(offerProdAttrsSet);
		newSet.setOfferProdInfos(offerProdInfos);
		return newSet;
	}

	/**
	 * 获取Map对象中的标题信息
	 * @param list
	 * @return 标题信息
	 */
	private String getTitleName(List<Map<String, Object>> list) {
		if (null != list && list.size() > 0) {
			Map<String, Object> acceNbrMap = list.get(0);
			return MapUtils.getString(acceNbrMap, "detailName", "");
		}
		return "";
	}

	/**
	 * 获取Map对象中的标题信息带序列号
	 * @param list
	 * @return 带序列号标题信息
	 */
	private String getTitleName4Index(int orderSeq, List<Map<String, Object>> list) {
		if (null != list && list.size() > 0) {
			Map<String, Object> map = list.get(0);
			return orderSeq + SysConstant.STR_PAU + MapUtils.getString(map, "detailName", "")+SysConstant.STR_SEP;
		}
		return "";
	}

	private OSBaseInfoSet buildOE_1_OSInfo_V2(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null || paramList.size() == 0) {
			return null;
		}
		OSBaseInfoSet osBaseInfoSet = new OSBaseInfoSet();

		// 设置(套餐月基本费/套餐超出)头
		List<StringBeanSet> baseInfoTitles = new ArrayList<StringBeanSet>();
		StringBeanSet baseInfoTitleSet = new StringBeanSet();
		String titleStr = getTitleName4Index(orderSeq, paramList);
		baseInfoTitleSet.setStrBean(titleStr);
		baseInfoTitles.add(baseInfoTitleSet);
		osBaseInfoSet.setBaseInfoTitle(baseInfoTitles);

		// 设置(套餐月基本费/套餐超出)内容
		if (null != paramList && paramList.size() > 0) {
			List<Map<String, Object>> mapList = (List<Map<String, Object>>) MapUtils.getObject(paramList.get(0), "bizReportDetailItemDto", null);
			List<Map<String, Object>> mapDescList = (List<Map<String, Object>>) MapUtils.getObject(paramList.get(0), "bizReportDetailDescDto", null);
			if(null!=mapDescList&&mapDescList.size()>0) {
				mapList.addAll(mapDescList);
			}
			Map<String, Object> normLineMap = splitOneLine(mapList);
			List<Map<String, Object>> normListMap = (List<Map<String, Object>>) normLineMap.get("norm");
			List<Map<String, Object>> lineListMap = ((List<Map<String, Object>>) normLineMap.get("line"));
			List<StringTwoSet> normList = getListStringTwoSet(normListMap);
			List<StringBeanSet> lineList = getListStringBeanSet(lineListMap);
			if (null != normList && normList.size() > 0) {
				osBaseInfoSet.setNorOSBaseInfos(normList);
			}
			if (null != lineListMap && lineListMap.size() > 0) {
				osBaseInfoSet.setLineOSBaseInfos(lineList);
			}
		}
		return osBaseInfoSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_订购当月资费
	 * @param jsonObjParam
	 * @param orderSeq
	 * @param mapList
	 * @return
	 */
	private OSOrderInfoSet buildOE_1_OrderInfo_V2(int orderSeq, List<Map<String, Object>> mapList){
		if (null == mapList || mapList.size() == 0) {
			return null;
		}

		OSOrderInfoSet orderInfoSet = new OSOrderInfoSet();

		List<StringBeanSet> orderInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(getTitleName4Index(orderSeq, mapList));
		orderInfoTitle.add(strBeanTitle);
		orderInfoSet.setOrderInfoTitle(orderInfoTitle);

		List<StringBeanSet> osOrderInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCont = new StringBeanSet(buildBizReportDetailItemOrDescDto((List<Map<String, Object>>) MapUtils.getObject(mapList.get(0),"bizReportDetailDescDto",null), false));
		osOrderInfos.add(strBeanCont);
		orderInfoSet.setOsOrderInfos(osOrderInfos);

		return orderInfoSet;
	}


	/**
	 * 组装－业务信息_主销售品_内容_其它说明
	 * @param orderSeq
	 * @param jsonArrayParam
	 * @return
	 */
	private OSOtherInfoSet buildOE_1_OtherInfo_V2(int orderSeq, List<Map<String, Object>> mapList) {
		if (mapList == null || mapList.size() == 0) {
			return null;
		}
		OSOtherInfoSet otherInfoSet = new OSOtherInfoSet();
		List<StringBeanSet> otherInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(getTitleName4Index(orderSeq, mapList));
		otherInfoTitle.add(strBeanTitle);
		otherInfoSet.setOtherInfoTitle(otherInfoTitle);

		List<StringBeanSet> osOtherInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCont = new StringBeanSet(buildBizReportDetailItemOrDescDto((List<Map<String, Object>>) MapUtils.getObject(mapList.get(0), "bizReportDetailDescDto", null), true));
		osOtherInfos.add(strBeanCont);
		otherInfoSet.setOsOtherInfos(osOtherInfos);
		return otherInfoSet;
	}

	/**
	 * 组装－业务信息_主销售品_内容_叠加包
	 * 新版，2015-6-19
	 *
	 * @param orderSeq
	 * @param event
	 * @param orderEventSets
	 * @return
	 */
	private OSAttachOfferSet buildOE_1_AttachOffer_V2(int orderSeq, Map<String, Object> paramMap, Map<String, Object> event, OrderEventSet eventSet){
		if(MapUtils.isEmpty(paramMap)){
			return null;
		}

		OSAttachOfferSet attachOfferSet = new OSAttachOfferSet();
		List<Map<String, Object>> attachThreeList = (List<Map<String, Object>>) paramMap.get("attachThreeList");
		List<OSNormOfferSet> normOfferList = new ArrayList<OSNormOfferSet>();

/*
		// 设置叠加包-标题
		List<StringBeanSet> attachOfferTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(SysConstant.INT_0, SysConstant.STR_SPE +  "叠加包"));
		attachOfferTitle.add(strBeanTitle);
		attachOfferSet.setAttachOfferTitle(attachOfferTitle);

		Map<String, Object> orderEventContParent = MapUtils.getMap(event, "orderEventCont", null);
		Map<String,Object> osAttachInfos=null;
		List<Map<String, Object>> offerInfos;

		int busiOrderSeq = SysConstant.INT_1;
		// 设置叠加包-附属
		List<Map<String, Object>> attachOneList = (List<Map<String, Object>>) paramMap.get("attachOneList");
		List<Map<String, Object>> attachTwoList = (List<Map<String, Object>>) paramMap.get("attachTwoList");
		List<Map<String, Object>> attachThreeList = (List<Map<String, Object>>) paramMap.get("attachThreeList");
		List<OSNormOfferSet> normOfferList = new ArrayList<OSNormOfferSet>();
		for (int i = 0; attachOneList != null && i < attachOneList.size(); i++) {
//			2.天翼4G手机短信包（订购次月生效，当月执行过渡期资费）
//			1）订购号码：18912345090 ；
//			2）功能费3元/月，包含国内点对点短信100条；超出资费：国内点对点短信0.1元/条。
//			3）过渡期资费：入网当月套餐月基本费按日计扣（入网当日到月底），费用四舍五入到分；套餐内容（短信）按天折算，向上取整。

			Map<String, Object> offerMap = attachOneList.get(i);
			String effectRule = MapUtils.getString(offerMap, "effectRule", "");
			String prodSpecName = MapUtils.getString(offerMap, "prodSpecName", "");
			String relaAcceNbr = MapUtils.getString(offerMap, "relaAcceNbr", "");
			String osOrderInfo = MapUtils.getString(offerMap, "osOrderInfo", "");
			String price = MapUtils.getString(offerMap, "price", "");

			OSNormOfferSet normOfferSet = new OSNormOfferSet();
			List<StringBeanSet> normOfferTitles = new ArrayList<StringBeanSet>();
			List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();

			StringBeanSet titleBean = new StringBeanSet();
			//加上月租费，取后台确定price节点内容
			String title = busiOrderSeq + SysConstant.STR_POINT + prodSpecName + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE;
			title+="".equals(price)?"":SysConstant.STR_SEP+price;
			titleBean.setStrBean(title);
			normOfferTitles.add(titleBean);
			normOfferSet.setNormOfferTitle(normOfferTitles);

			StringBeanSet commentBean = new StringBeanSet();
			int index = 1;
			String comment = "";

			Map<String, Object> orderEventCont = MapUtils.getMap(offerMap, "orderEventCont", null);

			//加装号码
			List<Map<String, Object>> userAcceNbrs = (List<Map<String, Object>>) MapUtils.getObject(orderEventCont, "userAcceNbrs", null);
			if (null != userAcceNbrs && userAcceNbrs.size() > 0) {
				comment += index++ + SysConstant.STR_RL_BRE + getItemAndDesc(userAcceNbrs.get(0));
			}

			//加装信息
			List<Map<String, Object>> osBaseInfo = (List<Map<String, Object>>) MapUtils.getObject(orderEventCont, "osBaseInfo", null);
			if (null != osBaseInfo && osBaseInfo.size() > 0) {
				Map<String, Object> osBaseInfoMap = osBaseInfo.get(0);
				comment += ("".equals(comment) ? "" : SysConstant.STR_ENT) + index++ + SysConstant.STR_RL_BRE + getDetail(osBaseInfoMap) + SysConstant.STR_SEP;
				List<Map<String, Object>> mapList = getBizReportDetailItemDtoList(osBaseInfo);
				if (null != mapList && mapList.size() > 0) {
					List<StringBeanSet> beanSetList = getListStringBeanSet(mapList);
					int size = beanSetList.size();
					for (int j = 0; j < size; j++) {
						comment += ("".equals(comment) ? "" : SysConstant.STR_ENT) + beanSetList.get(j).getStrBean();
					}
				}
			}

			commentBean.setStrBean(comment);
			normOfferComments.add(commentBean);
			normOfferSet.setNormOfferComments(normOfferComments);

			normOfferList.add(normOfferSet);
			busiOrderSeq++;
		}
		String comment1 = "";
		String donateStr = "";
		List<StringBeanSet> normOfferTitles1 = new ArrayList<StringBeanSet>();
		List<StringBeanSet> normOfferComments1 = new ArrayList<StringBeanSet>();
		OSNormOfferSet normOfferSet1 = new OSNormOfferSet();
		for (int i = 0; attachTwoList != null && i < attachTwoList.size(); i++) {
//			1.加装手机（生效规则同主套餐一致）
//			用户号码：18912340003 （副卡标识） ；功能费10元/月，可共享主套餐语音和流量。
//			赠送：来电显示和189免费邮箱。
//			2.加装无线上网卡（生效规则同主套餐一致）
//			用户号码：189xxxxxxxx （副卡标识）； 功能费5元/月，可共享主套餐的流量。
			Map<String, Object> acceNbrMap = attachTwoList.get(i);
			String acceNbr = MapUtils.getString(acceNbrMap, "acceNbr", "");
			String memberRoleCd = MapUtils.getString(acceNbrMap, "memberRoleCd", "");

			String title = "";
			if ("401".equals(memberRoleCd)) {
				if(i == 0){
					StringBeanSet titleBean = new StringBeanSet();
					title = busiOrderSeq + ".加装手机副卡（生效规则同主套餐一致）";
					titleBean.setStrBean(title);
					normOfferTitles1.add(titleBean);
					normOfferSet1.setNormOfferTitle(normOfferTitles1);
				}
			} else if ("501".equals(memberRoleCd)) {
				title = busiOrderSeq + ".加装无线上网卡（生效规则同主套餐一致）";
			}


			StringBeanSet commentBean = new StringBeanSet();
			comment1 = comment1 + "用户号码：" + acceNbr + " （新开户）（副卡） ；";
			if (i == attachTwoList.size() -1){
				comment1 = comment1.substring(0,comment1.length()-1) + ".";
			}
			Map<String, Object> itemParamMap = MapUtils.getMap(acceNbrMap, "itemParam");
			if (MapUtils.isNotEmpty(itemParamMap)) {
				String tmpItemName = MapUtils.getString(itemParamMap, "itemName", "");
				String tmpItemValue = MapUtils.getString(itemParamMap, "itemValue", "");
				String tmpItemUnit = MapUtils.getString(itemParamMap, "itemUnit", "");
				comment1 += tmpItemName + tmpItemValue + tmpItemUnit;
				if ("401".equals(memberRoleCd)) {
					comment1 += "，可共享主套餐语音和流量。";
				} else if ("501".equals(memberRoleCd)) {
					comment1 += "，可共享主套餐的流量。";
				}
			}
			donateStr = MapUtils.getString(acceNbrMap, "donateValue", "");
			if (i == attachTwoList.size() -1){
				comment1 += "\n" + donateStr;
			}
			if (i == attachTwoList.size() -1){
				commentBean.setStrBean(comment1);
				normOfferComments1.add(commentBean);
				normOfferSet1.setNormOfferComments(normOfferComments1);
				normOfferList.add(normOfferSet1);
			}
		}
*/

		if (attachThreeList != null) {
			OEAttachOfferSet oeAttachOfferSet = new OEAttachOfferSet();
			List<StringBeanSet> normOfferTitles = new ArrayList<StringBeanSet>();
			List<StringBeanSet> normOfferComments = new ArrayList<StringBeanSet>();

			StringBeanSet titleBean = new StringBeanSet();
			String title = "产品功能";
			titleBean.setStrBean(title);
			normOfferTitles.add(titleBean);
			oeAttachOfferSet.setAttachOfferTitle(normOfferTitles);
			StringBeanSet commentBean = new StringBeanSet();
			String comment = "";

			//（移动用户开通了4G功能的，4G、3G、1X上网功能一并列示，不允许单独分开列示，如下）
			//3）[开通]手机上网（4G/LTE、3G/EVDO、1x）功能（号码：xxxxxxxxxxx ，xxxxxxxxxxx）(立即生效）
			//		（移动用户未开通4G功能的，3G、1x上网功能一并列为“手机上网（3G/EVDO、1x）”，不允许分开列示，如下）
			//		4）[开通]手机上网（3G/EVDO、1x）功能（号码：xxxxxxxxxxx ，xxxxxxxxxxx）(立即生效）
			Map<String, Object> fourGMap = new HashMap<String, Object>();
			Map<String, Object> threeGMap = new HashMap<String, Object>();
			Map<String, Object> twoGMap = new HashMap<String, Object>();
			int fourInd = 0;
			int threeInd = 0;
			int twoInd = 0;
			for (int i = 0; i < attachThreeList.size(); i++) {
				Map<String, Object> servMap = attachThreeList.get(i);
				String objId = MapUtils.getString(servMap, "objId", "");
				if ("280000020".equals(objId)) {
					//4G（LTE）上网
					fourGMap = servMap;
					fourInd = i;
				} else if ("235010003".equals(objId)) {
					//3G（EVDO）上网
					threeGMap = servMap;
					threeInd = i;
				} else if ("235010008".equals(objId)) {
					//2G（1X）上网
					twoGMap = servMap;
					twoInd = i;
				}
			}
			int ind = 1;
			if (MapUtils.isNotEmpty(fourGMap) || MapUtils.isNotEmpty(threeGMap) || MapUtils.isNotEmpty(twoGMap)) {
				String actionName4 = MapUtils.getString(fourGMap, "actionName", "4");
				String actionName3 = MapUtils.getString(threeGMap, "actionName", "3");
				String actionName2 = MapUtils.getString(twoGMap, "actionName", "2");
				String effectRule4 = MapUtils.getString(fourGMap, "effectRule", "");
				String effectRule3 = MapUtils.getString(threeGMap, "effectRule", "");
				String effectRule2 = MapUtils.getString(twoGMap, "effectRule", "");
				String relaAcceNbr4 = MapUtils.getString(fourGMap, "relaAcceNbr", "");
				String relaAcceNbr3 = MapUtils.getString(threeGMap, "relaAcceNbr", "");
				String relaAcceNbr2 = MapUtils.getString(twoGMap, "relaAcceNbr", "");
				if (actionName4.equals(actionName3) && actionName4.equals(actionName2)) {
					comment += ind++ + ".[" + actionName4 + "]手机上网（4G/LTE、3G/EVDO、1x）功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
				} else {
					if (actionName4.equals(actionName3)) {
						comment += ind++ + ".[" + actionName4 + "]手机上网（4G/LTE、3G/EVDO）功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						if (!"2".equals(actionName2)) {
							comment += ind++ + ".[" + actionName2 + "]手机上网1x功能(号码：" + relaAcceNbr2 + ")；（" + effectRule2 + "）；\n";
						}
					} else if (actionName4.equals(actionName2)) {
						comment += ind++ + ".[" + actionName4 + "]手机上网（4G/LTE、1x）功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						if (!"3".equals(actionName3)) {
							comment += ind++ + ".[" + actionName3 + "]手机上网3G/EVDO功能(号码：" + relaAcceNbr3 + ")；（" + effectRule3 + "）；\n";
						}
					} else if (actionName3.equals(actionName2)) {
						comment += ind++ + ".[" + actionName3 + "]手机上网（3G/EVDO、1x）功能(号码：" + relaAcceNbr3 + ")；（" + effectRule3 + "）；\n";
						if (!"4".equals(actionName4)) {
							comment += ind++ + ".[" + actionName2 + "]手机上网4G/LTE功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						}
					} else {
						if (!"4".equals(actionName4)) {
							comment += ind++ + ".[" + actionName2 + "]手机上网4G/LTE功能(号码：" + relaAcceNbr4 + ")；（" + effectRule4 + "）；\n";
						}
						if (!"3".equals(actionName3)) {
							comment += ind++ + ".[" + actionName3 + "]手机上网3G/EVDO功能(号码：" + relaAcceNbr3 + ")；（" + effectRule3 + "）；\n";
						}
						if (!"2".equals(actionName2)) {
							comment += ind++ + ".[" + actionName2 + "]手机上网1x功能(号码：" + relaAcceNbr2 + ")；（" + effectRule2 + "）；\n";
						}
					}
				}

			}

			for (int i = 0; i < attachThreeList.size(); i++) {
				if (i == fourInd || i == threeInd || i == twoInd) {
					continue;
				}
//				5、产品功能 （当客户在订购某套餐的同时，另外开通了套餐未包含的产品功能，如来电显示，则在此列示）
//				1）[开通]xxxx功能(号码：xxxxxxxxxxx)；xx元/月 ； （xx小时内生效）；
//				2）[开通]xxxx功能(号码：xxxxxxxxxxx)；（xx小时内生效）；（对于不收费的产品功能，不列示资费）如[开通]国际长途）
				Map<String, Object> servMap = attachThreeList.get(i);

				String actionName = MapUtils.getString(servMap, "actionName", "");
				String itemName = MapUtils.getString(servMap, "itemName", "");
				String itemParam = MapUtils.getString(servMap, "itemParam", "");
				String effectRule = MapUtils.getString(servMap, "effectRule", "");
				String relaAcceNbr = MapUtils.getString(servMap, "relaAcceNbr", "");

				comment += ind++ + ".[" + actionName + "]" + itemName + "功能(号码：" + relaAcceNbr + ")；（" + effectRule + "）；\n";
			}
			if (StringUtils.isNotEmpty(comment)) {
				commentBean.setStrBean(comment);
				normOfferComments.add(commentBean);
				oeAttachOfferSet.setAttachOfferCont(normOfferComments);
				List<OEAttachOfferSet> oeAttachOfferSetList=eventSet.getAttachOfferList();
				if(null!=oeAttachOfferSetList){
					oeAttachOfferSetList.add(oeAttachOfferSet);
				}else {
					oeAttachOfferSetList = new ArrayList<OEAttachOfferSet>();
					oeAttachOfferSetList.add(oeAttachOfferSet);
					eventSet.setAttachOfferList(oeAttachOfferSetList);
				}
			}
		}
		if(null != normOfferList && normOfferList.size() > 0){
			attachOfferSet.setNormOfferList(normOfferList);
		}

		return attachOfferSet;
	}

	private String buildAttachTitle(int busiOrderSeq, String effectRule, String prodSpecName, String price) {
		String title;
		title=busiOrderSeq + SysConstant.STR_POINT + prodSpecName + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE;
		title+="".equals(price)?"":SysConstant.STR_SEP+price;
		return title;
	}

	/**
	 * 组装－业务信息_
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_6_V2(Map<String, Object> event, int orderSeq, int eventSize){
		OrderEventSet orderEvent = new OrderEventSet();
		// 设置业务信息_分隔线
		if(orderSeq <= eventSize && orderSeq != SysConstant.INT_1){
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}
		List<OEAttachOfferSet> attachOfferList = new ArrayList<OEAttachOfferSet>();
		OEAttachOfferSet set = new OEAttachOfferSet();
		List<StringBeanSet> aotList = new ArrayList<StringBeanSet>();

		Map<String, Object> titleMap = MapUtils.getMap(event, "orderEventTitle");
		if(event.containsKey("orderEventTitle")){
			String boActionTypeName = MapUtils.getString(titleMap, "boActionTypeName", "");
			String effectRule = MapUtils.getString(titleMap, "effectRule", "");
			String offerSpecName = MapUtils.getString(titleMap, "offerSpecName", "");
			StringBeanSet sbs = buildOrderEvent_6_Title_V2(eventSize, orderSeq, boActionTypeName, offerSpecName, effectRule);
			aotList.add(sbs);
		}

		if (event.containsKey("orderEventCont")) {
			Map<String, Object> map = (Map<String, Object>) event.get("orderEventCont");
			String dataKey="preFeeMods";
			List<Map<String,Object>> mapList= (List<Map<String, Object>>) MapUtils.getObject(map,"bookPlan",null);
			if(null!=mapList&&mapList.size()>0){
				dataKey="bookPlan";
			}
			List<OETitleContent> preFeeStringBeanSets = buildOrderEventCont_V2(map, dataKey);
			if (null != preFeeStringBeanSets && preFeeStringBeanSets.size() > 0) {
				set.setTitleContent(preFeeStringBeanSets);
			}
		}
		set.setAttachOfferTitle(aotList);
		attachOfferList.add(set);
		orderEvent.setAttachOfferList(attachOfferList);
		return orderEvent;
	}

	private StringBeanSet buildOE_1_Title_V2(int tolNbr, int seq, String boActionTypeName, String offerSpecName
			, String effectRule, boolean attachFlag, String attachOfferSpecName, String offerTypeName) {
		StringBeanSet strBean = new StringBeanSet();
		String titleStr = "";

		titleStr += (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);

		titleStr += StringUtils.isEmpty(boActionTypeName) ? "" :
				(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
		titleStr += StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName;

		titleStr += StringUtils.isEmpty(effectRule) ? "" :
				(SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
//		titleStr += attachFlag ? "及叠加包" : "";
//		titleStr += StringUtils.isEmpty(offerTypeName) ? "" :
//				(SysConstant.STR_ENT + SysConstant.STR_SPE + SysConstant.STR_SPE + offerTypeName + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
		strBean.setStrBean(titleStr);

		return strBean;
	}


    /**
     * 过滤赠送
     * @param mapList
     * @return
     */
    private List<Map<String, Object>> filterGive(List<Map<String, Object>> mapList) {
        if(null==mapList){
            return null;
        }
        List<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map : mapList) {
            String str = getItemCd(map);
            if(!(SysConstant.GIVE190001.equals(str)||SysConstant.GIVE190002.equals(str))){
                maps.add(map);
            }
        }
        return maps;
    }

	/**
	 * 获取赠送
	 *
	 * @param mapList
	 * @return
	 */
	private List<Map<String, Object>> getGive(List<Map<String, Object>> mapList) {
		if (null == mapList) {
			return null;
		}
		List<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> map : mapList) {
			String str = getItemCd(map);
			if (!(SysConstant.GIVE190001.equals(str) || SysConstant.GIVE190002.equals(str))) {
				List<Map<String, Object>> bizReportDetailDescDto = getBizReportDetailDescDtoList((List<Map<String, Object>>) map);
				if (null != bizReportDetailDescDto && bizReportDetailDescDto.size() > 0) {
					maps.addAll(bizReportDetailDescDto);
				}
			}
		}
		return maps;
	}
	private Map<String, Object> getAttachForMain_V2(Map<String, Object> event, List<Map<String, Object>> orderEventList) {
		//判断是否存在叠加包  BEGIN
//		有叠加包的情况：
//		1、订购了套餐外的可选包
//			规则：orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> offerInfos存在
//			并且offerInfo中的attachOfferInfos中的itemType为1。如果为2是积木套餐流量模块，为3是积木套餐语音模块
//		2、存在加装手机或加装
//			规则：
//		3、订购了套餐外的功能产品
//			规则： orderEventType为3的附属销售品[订购、续订、变更、退订]，主销售品[退订、注销] 中，
//				    找orderEventTitle -> boActionTypeCd为7的功能产品，从中过滤掉
//				  orderEventType为1的主销售品订购中的orderEventCont -> osAttachInfos -> servInfos的功能产品，
//				    再过滤掉orderEventCont -> userAcceNbrs -> [x] -> donateItems中的赠送类
//				    剩下的如果存在，就是有订购套餐外功能产品

		//获取赠送节点
		List<Map<String, Object>> giveList = new ArrayList<Map<String, Object>>();

		Map<String, Object> contMap = MapUtils.getMap(event, "orderEventCont");
		Map<String, Object> finalAttachMap = new HashMap<String, Object>();
		List<Map<String, Object>> attachOneList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> attachTwoList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> attachThreeList = new ArrayList<Map<String, Object>>();
		// seq 1
		Map<String, Object> osAttachInfos = MapUtils.getMap(contMap, "osAttachInfos");
		List<Map<String, Object>> osBaseInfo = (List<Map<String, Object>>) MapUtils.getObject(contMap, "osBaseInfo", null);
		giveList=getGiveList(osAttachInfos,osBaseInfo);
		if (MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> offerInfos = (List<Map<String, Object>>) osAttachInfos.get("offerInfos");
			List<Map<String, Object>> tmpOffers = new ArrayList<Map<String, Object>>();
			List<Map<String, Object>> blockOffers = new ArrayList<Map<String, Object>>();
			if (offerInfos != null && offerInfos.size() > 0) {
				//20140703 offerInfo中的attachOfferInfos中的itemType为1。如果为2207是积木套餐流量模块，为2102是积木套餐语音模块
				for (int i = 0; i < offerInfos.size(); i++) {
					Map<String, Object> tmpOffer = offerInfos.get(i);
					String offerTypeCd = MapUtils.getString(tmpOffer, "offerTypeCd", "");
					if (StringUtils.isNotEmpty(offerTypeCd) && (SysConstant.FLOW.equals(offerTypeCd) || SysConstant.SPEECH.equals(offerTypeCd))) {
						tmpOffer.put("offerTypeCd", offerTypeCd);
						blockOffers.add(tmpOffer);
					} else {
						tmpOffers.add(tmpOffer);
					}
				}
				attachOneList.addAll(tmpOffers);
				//如果有blockOffers，说明存在流量模块或语音模块
				if (blockOffers.size() > 0) {
					//排序，先语音模块，后流量模块
					for (int i = 0; i < blockOffers.size(); i++) {
						Map<String, Object> blockOfferMap = blockOffers.get(i);
						String offerTypeCd = MapUtils.getString(blockOfferMap, "offerTypeCd", "");
						//语音模块不在第一位，则和第一位交换
						if (SysConstant.FLOW.equals(offerTypeCd) && i >= 1) {
							Map<String, Object> flowMap = blockOffers.get(0);
							blockOffers.set(0, blockOfferMap);
							blockOffers.set(i, flowMap);
							break;
						}
					}
					finalAttachMap.put("blockOffers", blockOffers);
				}
			}
		}
		// seq 2
		List<Map<String, Object>> userAcceNbrs = (List<Map<String, Object>>) contMap.get("userAcceNbrs");
		if (userAcceNbrs != null && userAcceNbrs.size() > 0) {
			for (int i = 0; i < userAcceNbrs.size(); i++) {
				Map<String, Object> userAcceNbrMap = userAcceNbrs.get(i);
				String memberRoleCd = MapUtils.getString(userAcceNbrMap, "memberRoleCd", "");
				//如果是401加装移动电话（天翼副卡）或501加装无线宽带
				if ("401".equals(memberRoleCd) || "501".equals(memberRoleCd)) {
					attachTwoList.add(userAcceNbrMap);
				}
			}
		}
		// seq 3
		List<String> servObjIdList = new ArrayList<String>();
		if (null != giveList && giveList.size() > 0) {
			for (int i = 0; i < giveList.size(); i++) {
				Map<String, Object> tmpServInfoMap = giveList.get(i);
				servObjIdList.add(MapUtils.getString(tmpServInfoMap, "itemValue", "-1"));
			}
		}
		List<String> donateList = new ArrayList<String>();
		if (userAcceNbrs != null && userAcceNbrs.size() > 0) {
			for (int i = 0; i < userAcceNbrs.size(); i++) {
				Map<String, Object> userAcceNbrMap = userAcceNbrs.get(i);
				String acceNbr = (String) userAcceNbrMap.get("acceNbr");
				List<Map<String, Object>> donateItems = (List<Map<String, Object>>) userAcceNbrMap.get("donateItems");
				for (int j = 0; donateItems != null && j < donateItems.size(); j++) {
					String objId = MapUtils.getString(donateItems.get(j), "objId", "");
					donateList.add(objId + "-" + acceNbr);
				}
			}
		}
		for (int i = 0; i < orderEventList.size(); i++) {
			Map<String, Object> tmpOrderEventMap = orderEventList.get(i);
			String orderEventType = MapUtils.getString(tmpOrderEventMap, "orderEventType", "");
			if ("3".equals(orderEventType)) {
				Map<String, Object> tmpTitleMap = MapUtils.getMap(tmpOrderEventMap, "orderEventTitle");
				String boActionTypeCd = MapUtils.getString(tmpTitleMap, "boActionTypeCd", "");
				if ("7".equals(boActionTypeCd)) {
					List<Map<String, Object>> tmpContList = (List<Map<String, Object>>) tmpOrderEventMap.get("orderEventCont");
					for (int j = 0; tmpContList != null && j < tmpContList.size(); j++) {
						Map<String, Object> tmpContMap = tmpContList.get(j);
						String tmpObjId = MapUtils.getString(tmpContMap, "objId", "");
						String relaAcceNbr = MapUtils.getString(tmpContMap, "relaAcceNbr", "");
						if (!servObjIdList.contains(tmpObjId) && !filterProd(tmpObjId) && !donateList.contains(tmpObjId + "-" + relaAcceNbr)) {
							attachThreeList.add(tmpContMap);
						}
					}
				}
			}
		}

		if (attachOneList.size() > 0 || attachTwoList.size() > 0 || attachThreeList.size() > 0) {
			// 设置业务信息_主销售品_叠加包
			finalAttachMap.put("attachOneList", attachOneList);
			finalAttachMap.put("attachTwoList", attachTwoList);
			finalAttachMap.put("attachThreeList", attachThreeList);
		}
		//判断是否存在叠加包  END
		return finalAttachMap;
	}

	/**
	 * 提取所有赠送类信息列表
	 * @param osAttachInfos
	 * @param osBaseInfo
	 * @return
	 */
	private List<Map<String, Object>> getGiveList(Map<String, Object> osAttachInfos, List<Map<String, Object>> osBaseInfo) {
		List<Map<String, Object>> retMapList = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> osBaseInfoList = new ArrayList<Map<String, Object>>();
		if(null!=osBaseInfo&&osBaseInfo.size()>0) {
			List<Map<String, Object>> tempList=getBizReportDetailItemDtoList(osBaseInfo);
			if (null != tempList && tempList.size() > 0) {
				for (Map<String, Object> map : tempList) {
					osBaseInfoList.add(map);
				}
			}
		}

		if(MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> osAttachInfosOsBaseInfo = getOfferInfosOsBaseInfo(osAttachInfos);
			if(null!=osAttachInfosOsBaseInfo&&osAttachInfosOsBaseInfo.size()>0) {
				for (Map<String, Object> map : osAttachInfosOsBaseInfo) {
					osBaseInfoList.add(map);
				}
			}
		}
		if(null!=osBaseInfoList&&osBaseInfoList.size()>0){
			for (Map<String, Object> map : osBaseInfoList) {
				String str = getItemCd(map);
				if(SysConstant.GIVE190001.equals(str)||SysConstant.GIVE190002.equals(str)) {
					retMapList.addAll((List<Map<String,Object>>)MapUtils.getObject(map, "bizReportDetailDescDto", null));
				}
			}
		}
		return retMapList;
	}

	/**
	 * 提取所有包含赠送类信息列表
	 * @param osAttachInfos
	 * @return
	 */
	private List<Map<String, Object>> getOfferInfosOsBaseInfo(Map<String, Object> osAttachInfos) {
		List<Map<String, Object>> retMapList = new ArrayList<Map<String, Object>>();
		if(MapUtils.isNotEmpty(osAttachInfos)) {
			List<Map<String, Object>> offerInfos = (List<Map<String, Object>>) MapUtils.getObject(osAttachInfos, "offerInfos", null);
			if (null != offerInfos && offerInfos.size() > 0) {
				for (Map<String, Object> offerInfo : offerInfos) {
					Map<String, Object> orderEventCont = MapUtils.getMap(offerInfo, "orderEventCont", null);
					List<Map<String, Object>> osBaseInfoList = (List<Map<String, Object>>) MapUtils.getObject(orderEventCont, "osBaseInfo", null);
					if (null != osBaseInfoList && osBaseInfoList.size() > 0) {
						List<Map<String, Object>> tempMapList = getBizReportDetailItemDtoList(osBaseInfoList);
						for (Map<String, Object> map : tempMapList) {
							retMapList.add(map);
						}
					}
				}
			}
		}
		return retMapList;
	}

	/**
	 * 组装－业务信息_附属销售品[订购、续订、变更、退订]，主销售品[退订、注销]
	 * @param event
	 * @return
	 */
	private OrderEventSet buildOrderEvent_3_V2(Map<String, Object> event, int orderSeq, int oeSize, boolean attachFlag,List<Map<String, Object>> finalAttachMap){
		if(MapUtils.isEmpty(event)){
			return null;
		}

		OrderEventSet orderEvent = new OrderEventSet();
		// 设置分隔线
		if (orderSeq <= oeSize && orderSeq != SysConstant.INT_1) {
			orderEvent.setHasPreSplitLine(SysConstant.STR_Y);
		}

		List<OEAttachOfferSet> attachOfferList = new ArrayList<OEAttachOfferSet>();
		OEAttachOfferSet attachOfferSet = new OEAttachOfferSet();
		// 设置附属销售品业务_标题
		String boActionTypeCd = "";
		if(event.containsKey("orderEventTitle")){
			Map<String, Object> titleMap = (Map<String, Object>) event.get("orderEventTitle");
			boActionTypeCd = MapUtils.getString(titleMap, "boActionTypeCd", "");
			List<StringBeanSet> attachOfferTitle = new ArrayList<StringBeanSet>();
			boolean hasAcceNbr=false;
			if (event.get("orderEventCont") instanceof Map) {
				Map<String, Object> orderEventContMap = (Map<String, Object>) event.get("orderEventCont");
				if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "userAcceNbrs"))) {
					hasAcceNbr=true;
				}
			}
			attachOfferTitle = buildOrderEvent_3_Title_V2(oeSize, orderSeq, hasAcceNbr, titleMap);
			if (null != attachOfferTitle && attachOfferTitle.size() > 0) {
				attachOfferSet.setAttachOfferTitle(attachOfferTitle);
			}
		}
		List<StringBeanSet> attachOfferCont = new ArrayList<StringBeanSet>();
		// 设置附属销售品业务_内容
		if(event.containsKey("orderEventCont")) {
			if ("7".equals(boActionTypeCd) && finalAttachMap != null && finalAttachMap.size() > 0) {
				attachOfferCont = buildOrderEvent_3_Cont_V2(finalAttachMap);
			} else if (event.get("orderEventCont") instanceof Map) {
				int baseCount = 0;
				Map<String, Object> orderEventContMap = (Map<String, Object>) event.get("orderEventCont");
				if (orderEventContMap.size() > 1) baseCount = 1;

				//叠加包
				List<Map<String,Object>> osAttachInfosList= (List<Map<String, Object>>) MapUtils.getObject(orderEventContMap,"osAttachInfos");
				if(null!=osAttachInfosList&&osAttachInfosList.size()>0){
					List<OEPackageTitleTitleContent> oePackageTitleTitleContentList=buildOrderEvent_3_Cont_Attach_V2(baseCount,osAttachInfosList);
					if (oePackageTitleTitleContentList != null) {
						baseCount++;
						attachOfferSet.setPackageTitleContent(oePackageTitleTitleContentList);
					}
				}


				//手机号码
				List<AcceNbrBaseSet> acceNbrBaseSetList = new ArrayList<AcceNbrBaseSet>();
				if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "userAcceNbrs"))) {
					AcceNbrBaseSet acceNbrBaseSet = buildOE_3_UserAcceNbrs_V2(baseCount, (List<Map<String, Object>>) orderEventContMap.get("userAcceNbrs"));
					if (acceNbrBaseSet != null) {
						baseCount++;
						acceNbrBaseSetList.add(acceNbrBaseSet);
						attachOfferSet.setAcceNbrBaseList(acceNbrBaseSetList);
					}
				}
				//叠加包基本资费
				if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "osBaseInfo"))) {
					List<BaseAttachOfferInfosSet> baseAttachOfferInfosSetList = new ArrayList<BaseAttachOfferInfosSet>();
					BaseAttachOfferInfosSet baseAttachOfferInfosSet = buildOE_3_OsBaseInfo_V2(baseCount, (List<Map<String, Object>>) orderEventContMap.get("osBaseInfo"));
					if (baseAttachOfferInfosSet != null) {
						baseCount++;
						baseAttachOfferInfosSetList.add(baseAttachOfferInfosSet);
						attachOfferSet.setBaseAttachOfferInfosList(baseAttachOfferInfosSetList);
					}
				}
				//资费
				if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "osOrderInfo"))) {
					List<OSOrderInfoSet> osOrderInfoSetList = new ArrayList<OSOrderInfoSet>();
					OSOrderInfoSet osOrderInfoSet = buildOE_3_OrderInfo_V2(baseCount, (List<Map<String, Object>>) orderEventContMap.get("osOrderInfo"));
					if (osOrderInfoSet != null) {
						baseCount++;
						osOrderInfoSetList.add(osOrderInfoSet);
						attachOfferSet.setOsOrderInfoList(osOrderInfoSetList);
					}
				}
				//其它说明
				if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "osOtherInfo"))) {
					List<OSOtherInfoSet> osOtherInfoSetList = new ArrayList<OSOtherInfoSet>();
					OSOtherInfoSet osOtherInfoSet = buildOE_3_OtherInfo_V2(baseCount, (List<Map<String, Object>>) orderEventContMap.get("osOtherInfo"));
					if (osOtherInfoSet != null) {
						baseCount++;
						osOtherInfoSetList.add(osOtherInfoSet);
						attachOfferSet.setOsOtherInfoList(osOtherInfoSetList);
					}
				}
				//套餐优惠
				if (StringUtils.isNotBlank(MapUtils.getString(orderEventContMap, "osPrompInfo"))) {
					List<OSPrompInfoSet> osPrompInfoSetList = new ArrayList<OSPrompInfoSet>();
					OSPrompInfoSet osPrompInfoSet = buildOE_3_PrompInfo_V2(baseCount, orderEventContMap);
					if (osPrompInfoSet != null) {
						baseCount++;
						osPrompInfoSetList.add(osPrompInfoSet);
						attachOfferSet.setOsPrompInfoList(osPrompInfoSetList);
					}
				}
			} else {
				attachOfferCont = buildOrderEvent_3_Cont((List<Map<String, Object>>) event.get("orderEventCont"));
			}

			if (null != attachOfferCont && attachOfferCont.size() > 0) {
				attachOfferSet.setAttachOfferCont(attachOfferCont);
			}
		}

		attachOfferList.add(attachOfferSet);
		orderEvent.setAttachOfferList(attachOfferList);

		return orderEvent;
	}

	private List<OEPackageTitleTitleContent> buildOrderEvent_3_Cont_Attach_V2(int baseCount, List<Map<String, Object>> osAttachInfosList) {
		if(null==osAttachInfosList||osAttachInfosList.size()==0)
			return null;
		List<Map<String, Object>> mergeOsAttachInfosList = new ArrayList<Map<String, Object>>();
		mergeOsAttachInfosList=mergeOsAttachInfosList_V2(osAttachInfosList);
		int index=1;
		List<OEPackageTitleTitleContent> oePackageTitleTitleContentList = new ArrayList<OEPackageTitleTitleContent>();
		for (Map<String, Object> map : mergeOsAttachInfosList) {
			OEPackageTitleTitleContent oeTitleContent=build_3_Cont_Attach_TitleAndCont_V2(map, index++);
			oePackageTitleTitleContentList.add(oeTitleContent);
		}
		return oePackageTitleTitleContentList;
	}

	/**
	 * 多号码合并销售品展示
	 * @param osAttachInfosList
	 * @return
	 */
	private List<Map<String, Object>> mergeOsAttachInfosList_V2(List<Map<String, Object>> osAttachInfosList) {
		List<Map<String, Object>> retList = new ArrayList<Map<String, Object>>();
		Map<String, Map<String,Object>> mergeMap = new HashMap<String, Map<String, Object>>();
		if (null != osAttachInfosList && osAttachInfosList.size() > 0) {
			for (Map<String, Object> map : osAttachInfosList) {
				String offerSpecId = MapUtils.getString(map, "offerSpecId", "");
				if(mergeMap.containsKey(offerSpecId)) {
					String currAcceNbr = "";
					Map<String, Object> currMergeMap = mergeMap.get(offerSpecId);
					Map<String, Object> orderEventCont = MapUtils.getMap(currMergeMap, "orderEventCont");
					Map<String, Object> currOrderEventCont = MapUtils.getMap(map, "orderEventCont");
					List<Map<String, Object>> userAcceNbrsList = (List<Map<String, Object>>) MapUtils.getObject(currOrderEventCont, "userAcceNbrs");
					if (null!=userAcceNbrsList&&userAcceNbrsList.size()>0) {
						List<Map<String, Object>> bizReportDetailItemDto = getBizReportDetailItemDtoList(userAcceNbrsList);
						if (null!=bizReportDetailItemDto&&bizReportDetailItemDto.size()>0) {
							currAcceNbr = getItem(bizReportDetailItemDto.get(0));
						}
					}

					List<Map<String, Object>> oldUserAcceNbrsList = (List<Map<String, Object>>) MapUtils.getObject(orderEventCont, "userAcceNbrs");
					if (null != oldUserAcceNbrsList && oldUserAcceNbrsList.size() > 0) {
						List<Map<String, Object>> bizReportDetailItemDto = getBizReportDetailItemDtoList(oldUserAcceNbrsList);
						if (null != bizReportDetailItemDto && bizReportDetailItemDto.size() > 0) {
							Map<String, Object> itemMap = bizReportDetailItemDto.get(0);
							String oldAcceNbr = getItem(itemMap);
							itemMap.put("itemValue", oldAcceNbr + SysConstant.STR_PAU + currAcceNbr);
						}
					}
				}else {
					mergeMap.put(offerSpecId, map);
					retList.add(map);
				}
			}
		}
		return retList;
	}

	private OEPackageTitleTitleContent build_3_Cont_Attach_TitleAndCont_V2(Map<String, Object> map, int index) {

		if (MapUtils.isEmpty(map)) {
			return null;
		}
		OEPackageTitleTitleContent oePackageTitleTitleContent = new OEPackageTitleTitleContent();

		List<StringBeanSet> titleList = new ArrayList<StringBeanSet>();
		StringBeanSet titleBean = new StringBeanSet();
		String effectRule = MapUtils.getString(map, "effectRule", "");
		String prodSpecName = MapUtils.getString(map, "prodSpecName", "");
		String price = MapUtils.getString(map, "price", "");
		String title = buildAttachTitle_V2(index, effectRule, prodSpecName, price);
		if (StringUtils.isNotBlank(title)) {
			titleBean.setStrBean(title);
			titleList.add(titleBean);
			oePackageTitleTitleContent.setOrderTitle(titleList);
		}

		List<OETitleContent> contentList = new ArrayList<OETitleContent>();
		Map<String, Object> orderEventCont = MapUtils.getMap(map, "orderEventCont");
		if (MapUtils.isNotEmpty(orderEventCont)) {
			contentList = buildAttachCont_3_V2(orderEventCont);
			if (null!=contentList&&contentList.size()>0) {
				oePackageTitleTitleContent.setOrderContent(contentList);
			}
		}
		return oePackageTitleTitleContent;
	}

	private List<OETitleContent> buildAttachCont_3_V2(Map<String, Object> orderEventCont) {
		if(null==orderEventCont){
			return null;
		}
		List<OETitleContent> retList = new ArrayList<OETitleContent>();

		int index=1;
		boolean hasSeq=false;
		List<Map<String,Object>> userAcceNbrsStrList= (List<Map<String, Object>>) MapUtils.getObject(orderEventCont,"userAcceNbrs");
		List<Map<String,Object>> osBaseInfoList= (List<Map<String, Object>>) MapUtils.getObject(orderEventCont,"osBaseInfo");
		List<Map<String,Object>> osOtherInfoList= (List<Map<String, Object>>) MapUtils.getObject(orderEventCont,"osOtherInfo");
		List<Map<String,Object>> osPrompInfo= (List<Map<String, Object>>) MapUtils.getObject(orderEventCont,"osPrompInfo");
		if(orderEventCont.size()>0){
			if(orderEventCont.size()>1){hasSeq=true;}
			if(null!=userAcceNbrsStrList&&userAcceNbrsStrList.size()>0) {
				OETitleContent oeTitleContent = buildOETitleContent_V2(hasSeq?index++:0,SysConstant.STR_RL_BRE, userAcceNbrsStrList.get(0));
				retList.add(oeTitleContent);
			}
			if(null!=osBaseInfoList&&osBaseInfoList.size()>0) {
				OETitleContent oeTitleContent = buildOETitleContent_V2(hasSeq?index++:0,SysConstant.STR_RL_BRE, osBaseInfoList.get(0));
				retList.add(oeTitleContent);
			}
			if(null!=osOtherInfoList&&osOtherInfoList.size()>0) {
				OETitleContent oeTitleContent = buildOETitleContent_V2(hasSeq?index++:0,SysConstant.STR_RL_BRE, osOtherInfoList.get(0));
				retList.add(oeTitleContent);
			}
			if(null!=osPrompInfo&&osPrompInfo.size()>0) {
				OETitleContent oeTitleContent = buildOETitleContent_V2(hasSeq?index++:0,SysConstant.STR_RL_BRE, osPrompInfo.get(0));
				retList.add(oeTitleContent);
			}
		}
		return retList;
	}

	private String buildOsBaseInfoStr_V2(List<Map<String, Object>> osBaseInfoList) {
		String retStr="";
		if(null!=osBaseInfoList&&osBaseInfoList.size()==1){
			retStr=getDetail(osBaseInfoList.get(0))+SysConstant.STR_SEP;
			String item= buildBizReportDetailItemAndDescDto(osBaseInfoList, false);
			if(StringUtils.isNotBlank(item)){
				retStr+=SysConstant.STR_ENT+item;
			}
		}
		return retStr;
	}

	private String buildOsOtherInfoStr_V2(List<Map<String, Object>> osOtherInfoList) {
		String retStr="";
		if(null!=osOtherInfoList&&osOtherInfoList.size()==1){
		retStr=getDetail(osOtherInfoList.get(0))+SysConstant.STR_SEP;
		String item= buildBizReportDetailItemAndDescDto(osOtherInfoList, false);
			if(StringUtils.isNotBlank(item)){
				retStr+=SysConstant.STR_ENT+item;
			}
		}
		return retStr;
	}

	private String buildUserAcceNbrsStr_V2(List<Map<String, Object>> userAcceNbrsStrList) {
		String retStr="";
		if(null!=userAcceNbrsStrList&&userAcceNbrsStrList.size()==1){
			retStr=getDetail(userAcceNbrsStrList.get(0));
			List<Map<String, Object>> bizReportDetailItemDto = getBizReportDetailItemDtoList(userAcceNbrsStrList);
			if(null!=bizReportDetailItemDto&&bizReportDetailItemDto.size()==1) {
				retStr += SysConstant.STR_SEP + getItem(bizReportDetailItemDto.get(0));
			}
		}
		return retStr;
	}

	/**
	 * 组装－业务信息_附属销售品_内容_其它说明
	 * @param orderSeq
	 * @param paramList
	 * @return
	 */
	private OSOtherInfoSet buildOE_3_OtherInfo_V2(int orderSeq, List<Map<String, Object>> paramList) {
		if (paramList == null || paramList.size() == 0) {
			return null;
		}
		OSOtherInfoSet otherInfoSet = new OSOtherInfoSet();
		List<StringBeanSet> otherInfoTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanTitle = new StringBeanSet(buildBusiInfoTitle(orderSeq, getDetailName(paramList.get(0))));
		otherInfoTitle.add(strBeanTitle);
		otherInfoSet.setOtherInfoTitle(otherInfoTitle);

		List<StringBeanSet> osOtherInfos = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet(buildBizReportDetailItemAndDescDto(paramList,false));
		osOtherInfos.add(strBean);
		otherInfoSet.setOsOtherInfos(osOtherInfos);
		return otherInfoSet;
	}
	/**
	 * 组装－业务信息_附属销售品_内容_叠加包超出资费
	 * @param baseCount
	 * @param outAttachOfferInfos
	 * @return
	 */

	private OSOrderInfoSet buildOE_3_OrderInfo_V2(int baseCount, List<Map<String, Object>> outAttachOfferInfos) {
		if (outAttachOfferInfos == null || outAttachOfferInfos.size() == 0) {
			return null;
		}
		OSOrderInfoSet osOrderInfoSet = new OSOrderInfoSet();
		List<StringBeanSet> oTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCostTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, getDetailName(outAttachOfferInfos.get(0))));
		oTitle.add(strBeanCostTitle);
		osOrderInfoSet.setOrderInfoTitle(oTitle);

		List<StringBeanSet> oInfo = new ArrayList<StringBeanSet>();
		StringBeanSet strBean = new StringBeanSet(buildBizReportDetailItemAndDescDto(outAttachOfferInfos,false));
		oInfo.add(strBean);
		osOrderInfoSet.setOsOrderInfos(oInfo);
		return osOrderInfoSet;
	}


	private BaseAttachOfferInfosSet buildOE_3_OsBaseInfo_V2(int baseCount, List<Map<String, Object>> baseAttachOfferInfos) {
		if (baseAttachOfferInfos == null || baseAttachOfferInfos.size() == 0) {
			return null;
		}
		BaseAttachOfferInfosSet baseAttachOfferInfosSet = new BaseAttachOfferInfosSet();
		List<StringBeanSet> oTitle = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanCostTitle = new StringBeanSet(buildBusiInfoTitle(baseCount, getDetailName(baseAttachOfferInfos.get(0))));
		oTitle.add(strBeanCostTitle);
		baseAttachOfferInfosSet.setBaseAttachOfferTitle(oTitle);
		List<StringBeanSet> oInfo = new ArrayList<StringBeanSet>();
		StringBeanSet strBeanInfos = new StringBeanSet(buildBizReportDetailItemAndDescDto(baseAttachOfferInfos,false));
		oInfo.add(strBeanInfos);
		baseAttachOfferInfosSet.setBaseAttachOfferInfos(oInfo);
		return baseAttachOfferInfosSet;
	}


	private Map<String,Object> parseCommonInfos_V2(Map<String, Object> dataMap) {
		Map<String, Object> retnMap = new HashMap<String, Object>();
		// 公共信息－订单数据
		String olNbr = null;
		String staffName = null;
		String staffNumber = null;
		String channelName = null;
		String provName = null;
		String soDate = null;
		int speCustInfoLen = 0;
		Map<String, Object> orderListInfo = MapUtils.getMap(dataMap, "orderListInfo");
		if (MapUtils.isNotEmpty(orderListInfo)) {
			olNbr = MapUtils.getString(orderListInfo, "olNbr");
			staffName = MapUtils.getString(orderListInfo, "staffName");
			staffNumber = MapUtils.getString(orderListInfo, "staffNumber");
			channelName = MapUtils.getString(orderListInfo, "channelName");
			provName = MapUtils.getString(orderListInfo, "provName");
			soDate = MapUtils.getString(orderListInfo, "soDate");
			//设置半行长度，默认预设经验值14
			speCustInfoLen = MapUtils.getIntValue(orderListInfo, "speCustInfoLen", 14);
		}
		retnMap.put("olNbr", olNbr);
		retnMap.put("staffName", staffName);
		retnMap.put("staffNumber", staffNumber);
		retnMap.put("channelName", channelName);
		retnMap.put("speCustInfoLen", speCustInfoLen);

		// 公共信息－设置标题
		if (StringUtils.isNotEmpty(provName)) {
			List<ProvNameSet> provNameSets = new ArrayList<ProvNameSet>();
			ProvNameSet nameSet = new ProvNameSet();
			nameSet.setProvName(provName);
			provNameSets.add(nameSet);
			retnMap.put("provNames", provNameSets);
		}
		// 公共信息－受理日期
		if (StringUtils.isNotEmpty(soDate)) {
			soDate = soDate.split(SysConstant.STR_SPE)[0];
			String[] dates = soDate.split(SysConstant.STR_MINUS);
			if (null != dates && dates.length == SysConstant.INT_3) {
				retnMap.put("acceYear", dates[0]);
				retnMap.put("acceMonth", dates[1]);
				retnMap.put("acceDay", dates[2]);
			}
		}
		// 公共信息－温馨提示
		List<StringBeanSet> advtInfos = new ArrayList<StringBeanSet>();
		Object advObj = dataMap.get("advInfos");
		if (advObj != null && advObj instanceof List) {
			List advtInfoList = (List) advObj;
			if (null != advtInfoList && advtInfoList.size() > 0) {
				int index = 1;
				boolean hasSeq = false;
				if (advtInfoList.size() > 1) {
					hasSeq = true;
				}
				for (Object o : advtInfoList) {
					String preStr = hasSeq ? (index++ + SysConstant.STR_PAU) : "";
					String str = (String) o;
					StringBeanSet beanSet = new StringBeanSet(preStr + str);
					advtInfos.add(beanSet);
				}
			}
		}
		retnMap.put("advtInfos", advtInfos);

		return retnMap;
	}

	/**
	 * 构建附属标题
	 * @param busiOrderSeq
	 * @param effectRule
	 * @param prodSpecName
	 * @param price
	 * @return
	 */
	private String buildAttachTitle_V2(int busiOrderSeq, String effectRule, String prodSpecName, String price) {
		String title;
		title=busiOrderSeq + SysConstant.STR_PAU + prodSpecName + SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE;
		title+="".equals(price)?"":SysConstant.STR_SEP+price;
		return title;
	}

	/**
	 * 组装－业务信息_主销售品_内容_叠加包_服务销售品_内容(公用)
	 * @param orderSeq
	 * @param actionType
	 * @param itemName
	 * @param itemParam
	 * @param itemDesc
	 * @param effectRule
	 * @param relaAcceNbr
	 * @return
	 */
	private String buildOE_1_AttachOffer_Serv_Cont_V2(int tolNbr, int orderSeq, String actionType, String itemName, String itemParam, String itemDesc, String effectRule, String relaAcceNbr) {
		StringBuffer rstStr = new StringBuffer();
		if (tolNbr != SysConstant.INT_1) {
			rstStr.append(orderSeq + SysConstant.STR_PAU);
		}
		rstStr.append(SysConstant.STR_LM_BRE + actionType + SysConstant.STR_RM_BRE);
		rstStr.append(itemName);
		rstStr.append(SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
		rstStr.append(SysConstant.STR_SEP + relaAcceNbr);
		if (StringUtils.isNotBlank(itemParam)) {
			rstStr.append(itemParam);
		}
		rstStr.append(SysConstant.STR_SPI);

		return rstStr.toString();
	}
	/**
	 * 组装－业务信息_附属销售品_内容
	 * @param jsonArrayParam
	 * @return
	 */
	private List<StringBeanSet> buildOrderEvent_3_Cont_V2(List<Map<String, Object>> contList){
		if (contList == null || contList.size() == 0) {
			return null;
		}

		List<StringBeanSet> attachOfferList = new ArrayList<StringBeanSet>();
		int len = contList.size();
		for (int i = 0; i < len; i++) {
			Map<String, Object> contMap = contList.get(i);
			StringBeanSet strBean = new StringBeanSet();

			String actionType = MapUtils.getString(contMap, "actionName", "");
			String itemName = MapUtils.getString(contMap, "itemName", "");
			String itemParam = MapUtils.getString(contMap, "itemParam", "");
			String itemDesc = MapUtils.getString(contMap, "itemDesc", "");
			String effectRule = MapUtils.getString(contMap, "effectRule", "");
			String relaAcceNbr = MapUtils.getString(contMap, "relaAcceNbr", "");

			strBean.setStrBean(buildOE_1_AttachOffer_Serv_Cont_V2(len, i + 1, actionType, itemName, itemParam, itemDesc, effectRule, relaAcceNbr));

			attachOfferList.add(strBean);
		}

		return attachOfferList;
	}

	private StringBeanSet buildOrderEvent_6_Title_V2(int eventSize,int seq,String boActionTypeName,String offerSpecName,String effectRule) {
		StringBeanSet strBean = new StringBeanSet();
		String titleStr = "";
		titleStr +=  (ChsStringUtil.getSeqNumByInt(seq) + SysConstant.STR_PAU);
		titleStr += StringUtils.isEmpty(boActionTypeName) ? "" :
				(SysConstant.STR_LB_BRE + boActionTypeName + SysConstant.STR_RB_BRE);
		titleStr += StringUtils.isEmpty(offerSpecName) ? "" : offerSpecName;
		titleStr += StringUtils.isEmpty(effectRule) ? "" :
				(SysConstant.STR_LL_BRE + effectRule + SysConstant.STR_RL_BRE);
		strBean.setStrBean(titleStr);
		return strBean;
	}


	public static void main(String[] args) {
		Calendar calendar = Calendar.getInstance();
		String str = DateUtil.getFormatTimeString(calendar.getTime(), "yyyy/MM/dd HH:mm:ss");
		System.out.println(str + "\r" +"bb");
	}
}
