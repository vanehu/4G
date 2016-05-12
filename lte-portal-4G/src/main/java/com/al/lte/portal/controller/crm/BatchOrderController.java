package com.al.lte.portal.controller.crm;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.UrlPathHelper;

import com.al.ecs.common.entity.JsonResponse;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.exception.ResultConstant;
import com.al.ecs.spring.controller.BaseController;
import com.al.lte.portal.bmo.crm.BatchBmo;
import com.al.lte.portal.common.FTPServiceUtils;

@Controller("com.al.lte.portal.controller.crm.BatchOrderController")
@RequestMapping("/order/batchOrder/*")
public class BatchOrderController  extends BaseController {
	
	@Autowired
	@Qualifier("com.al.lte.portal.bmo.crm.BatchBmo")
	private BatchBmo batchBmo;
	
	@Autowired
	@Qualifier("com.al.lte.portal.common.FTPServiceUtils")
	private FTPServiceUtils ftpServiceUtils;
	
	private PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
	private UrlPathHelper urlPathHelper = new UrlPathHelper();

	@RequestMapping(value = "/batchForm", method = RequestMethod.GET)
	public void batchForm(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchImport", method = RequestMethod.POST)
	public void importData(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}


	@RequestMapping(value = "/batchImportQuery", method = RequestMethod.GET)
	public void batchImportQuery(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchImportList", method = RequestMethod.GET)
	public void batchImportList(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchOrderQueryList", method = {RequestMethod.POST})
	public void batchOrderQueryList(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchOrderExport", method = {RequestMethod.POST})
	public void batchOrderExport(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchProgressQuery", method = {RequestMethod.POST})
	public void batchProgressQuery(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchProgressQueryList", method = {RequestMethod.POST})
	public void batchProgressQueryList(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchStatusQuery", method = RequestMethod.GET)
	public void batchStatusQuery(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchReprocess", method = {RequestMethod.POST})
	public void batchReprocess(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchOperate", method = {RequestMethod.POST})
	public void batchOperate(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchOperateCancle", method = {RequestMethod.POST})
	public void batchOperateCancle(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchUpdateMain", method = {RequestMethod.POST})
	public void batchUpdateMain(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
		
	@RequestMapping(value = "/batchOrderQuery", method = RequestMethod.GET)
	public void batchOrderQuery(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchEditParty", method = RequestMethod.GET)
	public void batchOrderEditParty(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchOrderList", method = RequestMethod.GET)
	public void batchOrderList(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/batchOrderDel", method = RequestMethod.POST)
	public void checkUim(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchOrderTerminal", method = RequestMethod.GET)
	public void batchOrderTerminal(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchOrderChange", method = RequestMethod.GET)
	public void batchOrderChange(HttpServletRequest request,HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchOrderVerify", method = RequestMethod.POST)
	public void checkTerminal(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchTerminalImport", method = RequestMethod.POST)
	public void batchTerminalImport(HttpServletRequest request,HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/importBatchData", method = RequestMethod.POST)
	public void importBatchData(HttpServletRequest request,HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}

	@RequestMapping(value = "/batchOrderFlag", method = {RequestMethod.POST})
	public void batchOrderFlag(HttpServletRequest request, HttpServletResponse response) {
		this.batchDispatcher(request, response);
	}
	
	@RequestMapping(value = "/ecsBatchImport", method = RequestMethod.GET)
	public void importEcs(HttpServletRequest request, HttpServletResponse response) {
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/ecsBatchImport").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/queryEcsBatchOrder", method = {RequestMethod.POST, RequestMethod.GET})
	public void queryEcsBatchOrder(HttpServletRequest request, HttpServletResponse response) {
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/queryEcsBatchOrder").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/queryEcsBatchOrderList", method = {RequestMethod.POST, RequestMethod.GET})
	public void queryEcsBatchOrderList(HttpServletRequest request, HttpServletResponse response) {
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/queryEcsBatchOrderList").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/queryEcsBatchOrderDetail", method = {RequestMethod.POST, RequestMethod.GET})
	public void queryEcsBatchOrderDetail(HttpServletRequest request, HttpServletResponse response) {
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/queryEcsBatchOrderDetail").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/queryEcsBatchOrderDetailList", method = {RequestMethod.POST, RequestMethod.GET})
	public void queryEcsBatchOrderDetailList(HttpServletRequest request, HttpServletResponse response) {	
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/queryEcsBatchOrderDetailList").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/queryEcsRepository", method = {RequestMethod.POST, RequestMethod.GET})
	public void queryEcsRepository(HttpServletRequest request, HttpServletResponse response) {
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/queryEcsRepository").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/queryEcsRepositoryList", method = {RequestMethod.POST, RequestMethod.GET})
	public void queryEcsRepositoryList(HttpServletRequest request, HttpServletResponse response) {
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/queryEcsRepositoryList").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/ecsBatchfileImport", method = {RequestMethod.POST, RequestMethod.GET})
	public void ecsBatchfileImport(HttpServletRequest request, HttpServletResponse response){
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/ecsBatchfileImport").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@RequestMapping(value = "/ecsBatchOrderExport", method = {RequestMethod.POST, RequestMethod.GET})
	public void ecsBatchOrderExport(HttpServletRequest request, HttpServletResponse response){
		try {
			request.getRequestDispatcher("/order/batchOrder/latestVer/ecsBatchOrderExport").forward(request,response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 批量改造新老模式分发器<br/>
	 * 如果开关打开：执行文件上传FTP的新模式；否则，执行拼装报文的老模式<br/>
	 * 注：由于黑名一卡双号单需求没有新老模式，所以这里不对其进行分发控制
	 * @param request
	 * @param response
	 * @author ZhangYu
	 * @since 2016-05-02
	 */
	private void batchDispatcher(HttpServletRequest request, HttpServletResponse response){
		
//		String contextPath = request.getContextPath();
//		String path = urlPathHelper.getOriginatingRequestUri(request).substring(request.getContextPath().length());
//		String requestUri = request.getRequestURI();
//		String queryString = request.getQueryString();
//		String requestUrl = contextPath + "/order/batchOrder/latestVer/batchOrderChange";
//		response.sendRedirect(response.encodeRedirectURL(requestUrl));
		
		String originatingRequestUri = urlPathHelper.getOriginatingRequestUri(request);
		String lastOfRequestUri = originatingRequestUri.substring(originatingRequestUri.lastIndexOf("/"));
		String forwardUri = null;
		
		if("ON".equals(propertiesUtils.getMessage("BATCHVERSIONFLAG"))){
			//如果开关打开，执行文件上传FTP的新模式
			forwardUri = "/order/batchOrder/" + "latestVer" + lastOfRequestUri;
		} else{
			//否则，执行拼装报文的老模式
			forwardUri = "/order/batchOrder/" + "previousVer" + lastOfRequestUri;
		}
		
		try {
			request.getRequestDispatcher(forwardUri).forward(request,response);
//			response.sendRedirect(response.encodeRedirectURL(contextPath + forwardUri));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 批量一卡双号黑名单
	 */
	@RequestMapping(value = "/importBlacklist", method = RequestMethod.GET)
	public String importBlacklist(Model model,HttpServletRequest request,HttpSession session) {
		
		List<Map<String, Object>> timeList = batchBmo.getTimeListIn5Days();
		String batchType = request.getParameter("batchType");
		String batchTypeName  = batchBmo.getTypeNames(batchType);
		
		model.addAttribute("time", timeList);
		model.addAttribute("batchType", batchType);
		model.addAttribute("batchTypeName", batchTypeName);
		
		return "/batchOrder/batch-order-change";
	}
	
	@RequestMapping(value = "/downloadFile", method = {RequestMethod.POST})
	@ResponseBody
	public JsonResponse downloadFile(Model model, 
			@RequestParam("fileUrl") String fileUrl, 
			@RequestParam("fileName") String fileName,
			HttpServletResponse response) throws IOException {

		try {
			FtpUtils ftpUtils = new FtpUtils();
//			String fileUrl = (String) param.get("fileUrl");
//			String fileName = (String) param.get("fileName");
			String[] fileUrls = fileUrl.split(",");
			String ftpMapping = fileUrls[0];
			String newFileName = fileUrls[1];
			String filePath = fileUrls[2];
			
			//2.获取FTP服务器的具体登录信息
			//3.根据服务器映射获取对应的FTP服务器配置信息
			PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
			String ftpServiceConfig = propertiesUtils.getMessage(ftpMapping);
			String[] ftpServiceConfigs = ftpServiceConfig.split(",");
			String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
			String remotePort = ftpServiceConfigs[1];//FTP服务器端口
			String userName = ftpServiceConfigs[2];//FTP服务器用户名
			String password = ftpServiceConfigs[3];//FTP服务器密码
			
			ServletOutputStream  outputStream = response.getOutputStream();
			
			response.addHeader("Content-Disposition", "attachment;filename="+new String(fileName.getBytes("gb2312"), "ISO8859-1"));
			response.setContentType("application/binary;charset=utf-8");
			
			ftpUtils.connectFTPServer(remoteAddress,remotePort,userName,password);
			boolean isFileExist = ftpUtils.isFileExist(newFileName,filePath);
			if(isFileExist){
				ftpUtils.downloadFileByPath(filePath+newFileName, outputStream);
			}
			outputStream.close();
			return super.successed("导出成功！");
		} catch (Exception e) {
			return super.failed("导出文件异常：<br/>" + e, ResultConstant.FAILD.getCode());
		}		
	}
}
