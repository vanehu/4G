package com.al.lte.portal.bmo.crm;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.JsonUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.common.web.ServletUtils;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.DataSignTool;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;
import com.al.lte.portal.common.RedisUtil;
import com.al.lte.portal.common.SysConstant;
import com.al.lte.portal.common.print.HTMLFile2PDF;
import com.al.lte.portal.common.print.ParseFreemark;
import com.al.lte.portal.common.print.PdfPrintHelper;
import com.al.lte.portal.common.print.PdfUtils;
import com.al.lte.portal.common.print.PrintHelperMgnt;
import com.al.lte.portal.model.SessionStaff;
import com.lowagie.text.pdf.PdfReader;

/**
 * 数字签名服务实现类
 * @author linmei
 */
@Service("com.al.lte.portal.bmo.crm.SignBmo")
public class SignBmoImpl implements SignBmo{
	protected final Log log = Log.getLog(getClass());
	@SuppressWarnings("unchecked")
	public Map<String, Object> querySignInfo(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		dataBusMap.put("areaId", sessionStaff.getAreaId());
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.INTF_DOWN_PRINTFILE, optFlowNum, sessionStaff);
		Map<String, Object> returnMap = new HashMap<String, Object>();
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> datamap = new HashMap<String, Object>();
				Object result = resultMap.get("result");
				if (result instanceof List) {
					List<Map<String, Object>> tempList = (List<Map<String, Object>>) result;
					datamap = tempList.get(0);
				} else {
					datamap = (Map<String, Object>) result;
				}
				returnMap.put("code", ResultCode.R_SUCCESS);
				returnMap.putAll(datamap);
			} else {
				returnMap.put("code", ResultCode.R_FAIL);
				returnMap.put("msg", "电子回执下载服务调用失败");
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.fileOperateService/downLoadPrintFileFromFtp服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.FTP_DOWNLOAD_ERROR, dataBusMap, db.getReturnlmap(), e);
		}
		return returnMap;
	}
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryPrettyNbrInfosByOlId(Map<String, Object> dataBusMap,
			String optFlowNum, SessionStaff sessionStaff)
			throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		dataBusMap.put("areaId", sessionStaff.getAreaId());
		//log.error("dataBusMap={}", JsonUtil.toString(dataBusMap));
		DataBus db = InterfaceClient.callService(dataBusMap,
				PortalServiceCode.QUERY_PRETTYNBR_INFO, optFlowNum, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db
					.getResultCode()))) {
				Map<String, Object> resultMap = db.getReturnlmap();
				Map<String, Object> datamap = new HashMap<String, Object>();
				Object result = resultMap.get("result");
				if (result instanceof List) {
					List<Map<String, Object>> tempList = (List<Map<String, Object>>) result;
					if(tempList!=null&&tempList.size()>0){
						datamap = tempList.get(0);
					}
				} else {
					datamap = (Map<String, Object>) result;
				}
				if(datamap!=null&&datamap.size()>0){
					Object prettyNbrInfo=datamap.get("prettyNbrInfos");
					if (prettyNbrInfo instanceof List) {
						returnMap.putAll(((List<Map<String, Object>>)prettyNbrInfo).get(0));
					} else {
						returnMap.putAll((Map<String, Object>) prettyNbrInfo);
					}
				}
			}
		} catch(Exception e) {
			log.error("门户处理营业受理的service/intf.detailService/queryPrettyNbrInfosByOlId服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.QUERY_PRETTYNBR_INFO, dataBusMap, db.getReturnlmap(), e);
		}
//		returnMap.put("prettyNbr", "17708980987");
//		returnMap.put("preStore", "90");
//		returnMap.put("minCharge", "12");
//		returnMap.put("protocolPeriod", "2");
		return returnMap;
	}
	/**
     * 合成pdf等业务
     * @param resultMap
     * @param model
     * @param request
     * @throws Exception
     */
	public Map<String,Object> setPrintInfos(Map<String, Object> resultMap, 
			HttpServletRequest request, Map<String, Object> paramMap) throws Exception{
    	Map<String,Object> reObject=new HashMap<String,Object>();
    	if (MapUtils.isNotEmpty(resultMap)) {
			String htmlStr=resultMap.get("htmlStr").toString().replaceAll("</body>", "");
			htmlStr=htmlStr.replaceAll("</html>", "");
			//htmlStr=HTMLFile2PDF.replaceForSign(htmlStr);
			//htmlStr=htmlStr+"<div style=\"display:none\" id=\"signYwImgDiv\" style=\"position:absolute;\"><img  width=\"100px\" height=\"100px\" src=\"#\"/></div>";
			reObject.put("htmlStr", htmlStr);
			int i=1;
			//2.查询服务协议和靓号协议
			String fwhtmlStr="";
			byte[] fwpdf=null;
			String fw="";
			String lhhtmlStr="";
			byte[] lhpdf=null;
			String lh="";
			SessionStaff sessionStaff = (SessionStaff) ServletUtils
					.getSessionAttribute(request, SysConstant.SESSION_KEY_LOGIN_STAFF);
			String provinceCode=sessionStaff.getAreaId();
			provinceCode=provinceCode.substring(0, 3) + "0000";
			String flags=MDA.PRINTFTL_FLAG.get("PRINTFTL-"+provinceCode);
			//log.debug("flags={}", flags);
			Map<String,Object> pp=new HashMap<String,Object>();
			String yewPdf= resultMap.get("orderInfo").toString();
			//pp.put("yewPdf", yewPdf);
			String lhhtmlFlag="OFF";
			String fwhtmlFlag="OFF";
			if(flags!=null&&!"".equals(flags)){
				fwhtmlFlag=flags.split(",")[0];
				Map<String,Object> param1=new HashMap<String,Object>();
				param1.put("custName", resultMap.get("custName"));
				param1.put("areaName",DataSignTool.getAreaName(sessionStaff.getCurrentAreaId(), sessionStaff));
				param1.put("dateYear", DateUtil.nowYear());
				param1.put("dateMonth", DateUtil.nowMonth());
				param1.put("dateDay", DateUtil.nowDayOfMonth());
				if("ON".equals(fwhtmlFlag)){
					param1.put("totalPage", flags.split(",")[2]);
					fwhtmlStr=ParseFreemark.parseTemplate(param1,flags.split(",")[4]);
					fwpdf=HTMLFile2PDF.createPdfToByte(fwhtmlStr,param1);
					fwhtmlStr=fwhtmlStr.replaceAll("</body>", "").replaceAll("</html>", "");
					//fwhtmlStr=fwhtmlStr.replaceAll("<!--", "").replaceAll("-->", "");
					fwhtmlStr=fwhtmlStr+HTMLFile2PDF.doWithHtml(param1,"fwsign");
					//fwhtmlStr=fwhtmlStr+"<div  style=\"display:none\" id=\"signFwImgDiv\" style=\"position:absolute;\"><img width=\"100px\" height=\"100px\" src=\"#\"/></div>";
					if(fwpdf!=null){
						i++;
						fw=Base64.encodeBase64String(fwpdf).replaceAll("\n|\r", "");
						//pp.put("fwpdf", fwpdf);
					}
				}
				//3.封装拼凑预览的html
				lhhtmlFlag=flags.split(",")[1];
				if("ON".equals(lhhtmlFlag)){
					Map<String,Object> param2=queryPrettyNbrInfosByOlId(paramMap,
							null,sessionStaff);
					if(param2!=null&&param2.size()>0){
						param2.putAll(param1);
						param1.put("totalPage", flags.split(",")[3]);
						lhhtmlStr=ParseFreemark.parseTemplate(param2,flags.split(",")[5]);
						lhpdf=HTMLFile2PDF.createPdfToByte(lhhtmlStr,param1);
						lhhtmlStr=lhhtmlStr.replaceAll("</body>", "").replaceAll("</html>", "");
						//lhhtmlStr=lhhtmlStr.replaceAll("<!--", "").replaceAll("-->", "");
						lhhtmlStr=lhhtmlStr+HTMLFile2PDF.doWithHtml(param1,"lhsign");
						//lhhtmlStr=lhhtmlStr+"<div style=\"display:none\" id=\"signLhImgDiv\" style=\"position:absolute;left:120px;top:10px\"><img  width=\"100px\" height=\"100px\" src=\"#\"/></div>";
						if(lhpdf!=null){
							i++;
							lh=Base64.encodeBase64String(lhpdf).replaceAll("\n|\r", "");
							//pp.put("lhpdf", lhpdf);
						}
					}
				}
				if(i>1){
					String[] list=new String[i];
					int j=0;
					list[j]=yewPdf;
					if(fw!=null&&!"".equals(fw)){
						j++;
						list[j]=fw;
					}
					if(lh!=null&&!"".equals(lh)){
						j++;
						list[j]=lh;
					}
					Map<String,Object> re=PdfUtils.mergePdfFiles(list);
					yewPdf=re.get("byte").toString();
					//yewPage业务受理pdf页码
					j=0;
					pp.put("yewPage", re.get("page"+j));
					if(fw!=null&&!"".equals(fw)){
						j++;
						pp.put("fwPage", re.get("page"+j));
					}
					if(lh!=null&&!"".equals(lh)){
						j++;
						pp.put("lhPage", re.get("page"+j));
					}
				}else{
					byte[] file=Base64.decodeBase64(yewPdf);
					PdfReader reader = new PdfReader(file);
					int n = reader.getNumberOfPages();
					pp.put("yewPage",n);
				}
			}else{
				byte[] file=Base64.decodeBase64(yewPdf);
				PdfReader reader = new PdfReader(file);
				int n = reader.getNumberOfPages();
				pp.put("yewPage",n);
			}
			//yewPdf最后合成的pdf，有可能只有一个协议，有可能多个
			pp.put("mgrPdf", yewPdf);
			reObject.put("pp", pp);
			if(!"".equals(fwhtmlStr)){
				reObject.put("fwhtmlFlag", "ON");
			}else{
				reObject.put("fwhtmlFlag", "OFF");
			}
			if(!"".equals(lhhtmlStr)){
				reObject.put("lhhtmlFlag", "ON");
			}else{
				reObject.put("lhhtmlFlag", "OFF");
			}
			reObject.put("lhhtmlStr", lhhtmlStr);
			reObject.put("fwhtmlStr", fwhtmlStr);
		}
		return reObject;
    }
	/**
	 * 预览pdf回执
	 */
	public void commonPdfPrint(String flag,Map<String,Object> paramMap,
			HttpServletRequest request,HttpServletResponse response)throws Exception {
			Object obj=RedisUtil.get("mgrPdf_"+ paramMap.get("olId").toString());
			Map<String,Object> orderInfo=null;
			if(obj!=null){
				String pdfStr="";
				orderInfo=(Map<String,Object>)obj;
				if("1".equals(flag)&&orderInfo.get("yewPdf")!=null){
					pdfStr=orderInfo.get("yewPdf").toString();
				}
				if("2".equals(flag)&&orderInfo.get("fwpdf")!=null){
					pdfStr=orderInfo.get("fwpdf").toString();
				}
				if("3".equals(flag)&&orderInfo.get("lhpdf")!=null){
					pdfStr=orderInfo.get("lhpdf").toString();
				}
				try {
					if(!"".equals(pdfStr)){
			            byte[] bytes =Base64.decodeBase64(pdfStr);
	
			            //输出到response
			            if(response != null){
			            	writeToResponse(bytes,response);
			            }
					}else{
						throw new Exception("对不起，从缓存中获取回执异常");
					}

		        } catch (Exception exp) {
		        	exp.printStackTrace();
		            response.setContentType("text/html; charset=GB18030");
		            response.setHeader("Content-Language", "GB18030");
		            response.setHeader("encoding", "GB18030");
		            response.getWriter().write(exp.getMessage());
		        }
			}else{
				throw new Exception("对不起，从缓存中获取回执异常");
			}

	}
	private static void writeToResponse(byte[] bytes,HttpServletResponse response) throws Exception{
        if (bytes != null && bytes.length > 0) {
            response.reset();
            response.setContentType("application/pdf;charset=GB18030");
            response.setContentLength(bytes.length);
            ServletOutputStream ouputStream = response.getOutputStream();
            ouputStream.write(bytes, 0, bytes.length);
            ouputStream.flush();
            ouputStream.close();
        }else{
            throw new Exception("对不起，从缓存中获取回执异常");
        }
    }
}
