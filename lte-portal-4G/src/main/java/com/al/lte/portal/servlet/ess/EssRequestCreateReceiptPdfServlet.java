package com.al.lte.portal.servlet.ess;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;
import net.sf.json.util.JSONUtils;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.exception.Result;
import com.al.lte.portal.bmo.print.PrintBmo;
import com.al.lte.portal.common.FTPServiceUtils;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.PdfPrintHelper;
import com.al.lte.portal.common.print.PrintHelperMgnt;

/**
 * ESS调用，自动生成pdf文件，无需营业员点击打印
 * 
 * @author YangBin
 */
public class EssRequestCreateReceiptPdfServlet extends HttpServlet implements
		Servlet {

	private static Logger log = LoggerFactory
			.getLogger(EssRequestCreateReceiptPdfServlet.class);

	private static final long serialVersionUID = 3736992329808737292L;
	private static final String BUSI_TYPE_1 = "1";

	private static final int RESULT_CODE_SUCESS = 0;
	private static final int RESULT_CODE_FAIL = -1;
	private static final String RESPONSE_CODE_SUCESS = "0000";
	private static final String RESPONSE_CODE_FAIL = "9999";
	private static final String RESPONSE_TYPE_SUCESS = "0";
	private static final String RESPONSE_TYPE_FAIL = "1";
	private static final String RESPONSE_DESC_SUCESS = "success";
	private static final String RESPONSE_DESC_FAIL = "failure";

	// 响应
	private static final String ACTION_CODE = "1";

	private String ftpServiceUtilsClass = null;
	private String printBmoClass = null;
	private FTPServiceUtils ftpServiceUtils = null;
	private PrintBmo printBmo = null;

	public EssRequestCreateReceiptPdfServlet() {
		super();
	}

	public void init(ServletConfig config) throws ServletException {
		super.init(config);

		ftpServiceUtilsClass = getInitParameter("ftpServiceUtilsClass");
		printBmoClass = getInitParameter("printBmoClass");

		try {
			ftpServiceUtils = (FTPServiceUtils) Class.forName(ftpServiceUtilsClass).newInstance();
			printBmo = (PrintBmo) Class.forName(printBmoClass).newInstance();
		} catch (Exception e) {
			e.printStackTrace();
			throw new ServletException(e);
		}
	}

	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		BufferedReader reader = null;
		String line;
		StringBuffer xmlStringBuffer = new StringBuffer();
		try {
			reader = request.getReader();
			while ((line = reader.readLine()) != null) {
				xmlStringBuffer.append(line);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		Result result = new Result(0, "成功！");
		String responseXmlStr = null;
		String transactionId = null;
		// 获取请求报文
		String xmlStr = xmlStringBuffer.toString();

		try {
			Document xmlDoc = DocumentHelper.parseText(xmlStr.replaceAll(">\\s+<", "><"));
			transactionId = xmlDoc.selectSingleNode("//TransactionID").getText();
			String requestParamJson = xmlDoc.selectSingleNode("//SvcCont").getText();

			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap = JsonUtil.toObject(requestParamJson, Map.class);

			// 增加几个参数
			String areaId = (String) paramMap.get("areaId");
			paramMap.put("dbKeyWord", areaId.subSequence(0, 3) + "0000");
			Long timeNumber = System.currentTimeMillis();
			paramMap.put("soNbr", timeNumber.toString());// 没啥用途
			paramMap.put("chargeItems", "");// 默认为 “” 没啥用途
			// busiType 固定为 1
			paramMap.put("busiType", BUSI_TYPE_1);
			
			String busiType = MapUtils.getString(paramMap, "busiType");
			String printType = MapUtils.getString(paramMap, "printType");// 请求参数中没传，为 null
			String agreement = MapUtils.getString(paramMap, "needAgreement");// 请求参数中没传，为 null
			// 0:打印 1:数字签名预览 2:生成pdf保存 3:生成未签名的pdf文件保存 4:手机端数字签名预览 5:保存客手机端的pdf文件
			String signFlag = MapUtils.getString(paramMap, "signFlag");// 请求参数中没传，为 null
			if (signFlag == null) {
				signFlag = "0";
			}
			boolean needAgreement = SysConstant.STR_Y.equals(agreement);
			Map<String, Object> params = new HashMap<String, Object>();
			params.putAll(paramMap);
			if (params.get("signStr") != null) {
				params.remove("signStr");
			}
			if (params.get("signFlag") != null) {
				params.remove("signFlag");
			}
			Map<String, Object> printData = new HashMap<String, Object>();
			if (SysConstant.BUSI_TYPE_CRM_COMMON.equals(busiType)) {
				printData = printBmo.getVoucherData4EssRequestCreateReceiptPdf( paramMap, needAgreement, null, request);
			}
			// 如果printData为异常，则返回失败
			String resultCode = MapUtils.getString(printData, "resultCode");
			if (resultCode != null && !ResultCode.R_SUCC.equals(resultCode)) {
				result.setCode(-1);
				String resultMsg = MapUtils.getString(printData, "resultMsg");
				result.setMsg(resultMsg);
				responseXmlStr = createResponseXml(result, transactionId);
				response.setCharacterEncoding("UTF-8");
				InputStream is = new ByteArrayInputStream(responseXmlStr.getBytes("UTF-8"));
				responseXmlStr = getStreamString(is,"UTF-8",result);
				response.getWriter().write(responseXmlStr);
				response.getWriter().flush();
				return;
			}

			// 数据驱动模板
			String printTypeDir = SysConstant.P_MOD_SUB_CTG_PDF;
			String strJasperFileName = printTypeDir + SysConstant.P_MOD_FILE_CRM_COMMON;
			if (strJasperFileName == null || "".equals(strJasperFileName)) {
				throw new RuntimeException("获取回执打印模板异常，请联系系统人员!");
			}
			strJasperFileName = SysConstant.P_MOD_BASE_DIR + strJasperFileName + SysConstant.P_MOD_FILE_SUBFIX;
			log.info(" 回执模板名称： " + strJasperFileName);

			Collection<Map<String, Object>> inFields = new ArrayList<Map<String, Object>>();
			printData.put("isShowSign", "false");
			printData.put("isShowReplaceStr", "false");
			inFields.add(printData);
			Map<String, Object> reportParams = new HashMap<String, Object>();
			reportParams.put("SUBREPORT_DIR", SysConstant.P_MOD_SUB_BASE_DIR + printTypeDir);
			reportParams.put("HAS_AGREEMENT", needAgreement);

			// 获取Jasper模板对应的printHelper
			PdfPrintHelper vPdfPrintHelper = PrintHelperMgnt.getPrintHelper(strJasperFileName, 0, 0);

			// 生成pdf文件
			byte[] bytes = vPdfPrintHelper.getPdfStreamWithParametersAndFields(reportParams, inFields, null, null);
			// 快销卡需要上传PDF文件
			Map<String, Object> printDataMap = new HashMap<String, Object>();
			Iterator<Map<String, Object>> it = inFields.iterator();
			while (it.hasNext()) {
				printDataMap = (Map<String, Object>) it.next();
			}

			String orderType = (String)printDataMap.get("orderType");
			if(StringUtils.isBlank(orderType)){
				orderType = MapUtils.getString(paramMap, "orderType");
			}
			if (orderType.equals("preInstall")
					|| orderType.equals("offerChange")
					|| orderType.equals("newInstall")
					|| orderType.equals("addCard")
					|| orderType.equals("changeRoleMember")) {
				// 预装和主套餐变更需要上传协议单
				// 20170912 新增 新装、补换卡 订单需要上传协议单
				// 20171115 因接入类订单类型拆分出了changeRoleMember，导致未上传pdf文件至服务器，现增加changeRoleMember订单类型上传
				String extCustOrderId = (String) printDataMap.get("extCustOrderId");
				if(StringUtils.isBlank(extCustOrderId)){
					extCustOrderId = MapUtils.getString(paramMap, "extCustOrderId");
				}
				String extSystem = (String) printDataMap.get("extSystem");
				if(StringUtils.isBlank(extSystem)){
					extSystem = MapUtils.getString(paramMap, "extSystem");
				}
				InputStream fileInputStream = new ByteArrayInputStream(bytes);
				String uploadFileName = extCustOrderId + extSystem + ".pdf";
				Map<String, Object> ftpEvidenceFileResultMap = ftpServiceUtils.pdfFileFTP(fileInputStream, uploadFileName);
				String ftpDealCode = (String)ftpEvidenceFileResultMap.get("code");
				if(!ResultCode.R_SUCCESS.equals(ftpDealCode)){
					result.setCode(RESULT_CODE_FAIL);
					result.setMsg((String)ftpEvidenceFileResultMap.get("mess"));
				}
			}

		} catch (Exception e) {
			log.error("ESS请求生成登记单pdf文件异常:", e);
			if(e instanceof InterfaceException){
				result.setMsg(((InterfaceException)e).getErrStack());
			}else{
				result.setMsg(e.getMessage());
			}
			result.setCode(RESULT_CODE_FAIL);
		}

		responseXmlStr = createResponseXml(result, transactionId);
		response.setCharacterEncoding("UTF-8");
		InputStream is = new ByteArrayInputStream(responseXmlStr.getBytes("UTF-8"));
		responseXmlStr = getStreamString(is,"UTF-8",result);
		response.getWriter().write(responseXmlStr);
		response.getWriter().flush();

	}

	private String createResponseXml(Result result, String transactionId) {
		String repType = RESPONSE_TYPE_SUCESS;
		String repCode = RESPONSE_CODE_SUCESS;
		String repDesc = RESPONSE_DESC_SUCESS;

		JSONObject rspJson = new JSONObject();
		rspJson.put("resultCode", "0");
		if (RESULT_CODE_SUCESS != result.getCode()) {
			rspJson.put("resultCode", RESULT_CODE_FAIL);
			repType = RESPONSE_TYPE_FAIL;
			repCode = RESPONSE_CODE_FAIL;
			repDesc = RESPONSE_DESC_FAIL;
		}
		rspJson.put("resultMsg", result.getMsg());
		String rtJson = JSONUtils.valueToString(rspJson);
		String responseTime = new SimpleDateFormat("yyyyMMddHHmmss")
				.format(new Date());

		StringBuilder sb = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
		sb.append("<ContractRoot>");
		sb.append("<TcpCont>");
		sb.append("<TransactionID>").append(transactionId).append("</TransactionID>");
		sb.append("<ActionCode>").append(ACTION_CODE).append("</ActionCode>");
		sb.append("<RspTime>").append(responseTime).append("</RspTime>");
		sb.append("<Response>");
		sb.append("<RspType>").append(repType).append("</RspType>");
		sb.append("<RspCode>").append(repCode).append("</RspCode>");
		sb.append("<RspDesc>").append(repDesc).append("</RspDesc>");
		sb.append("</Response>");
		sb.append("</TcpCont>");

		sb.append("<SvcCont>");
		sb.append("<![CDATA[");
		sb.append(rtJson);
		sb.append("]]>");
		sb.append("</SvcCont>");
		sb.append("</ContractRoot>");
		return sb.toString();
	}
	
	/**
	 * 将一个输入流转化为字符串
	 */
	public static String getStreamString(InputStream tInputStream,String charsetName,Result result) {
		if (tInputStream != null) {
			try {
				// GB18030
				// UTF-8
				BufferedReader tBufferedReader = new BufferedReader(new InputStreamReader(tInputStream, charsetName));
				StringBuffer tStringBuffer = new StringBuffer();
				String sTempOneLine = new String("");
				while ((sTempOneLine = tBufferedReader.readLine()) != null) {
					tStringBuffer.append(sTempOneLine);
				}
				return tStringBuffer.toString();
			} catch (Exception ex) {
				ex.printStackTrace();
				result.setCode(RESULT_CODE_FAIL);
				result.setMsg(ex.getMessage());
			}
		}
		return null;
	}

}
