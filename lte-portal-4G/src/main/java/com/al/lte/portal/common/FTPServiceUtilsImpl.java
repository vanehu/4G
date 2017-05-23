package com.al.lte.portal.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.al.common.utils.DateUtil;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;

/**
 * 上传文件到FTP服务器工具类</br>
 * 该类主要提供两个方法：1.上传文件到指定的单台服务器(测试环境使用单台FTP服务器)方法；2.通过全国各省与多台FTP服务器的映射，将文件上传到某一台FTP服务器。</br>
 * FTP服务器的配置信息从配置文件获取
 * @author ZhangYu 2016-03-10
 *
 */
@Service("com.al.lte.portal.common.FTPServiceUtils")
public class FTPServiceUtilsImpl implements FTPServiceUtils {
	
	private static Log log = Log.getLog(FTPServiceUtils.class);
	private PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
	final private int retryTimes = Integer.parseInt(propertiesUtils.getMessage("RETRYTIMES"));//当上传Excel文件失败后重试次数	
	
	/**
	 * 上传文件到FTP服务器，单台服务器(194测试环境或者多台FTP服务器不具备的情况下使用)
	 * @param fileInputStream
	 * @param uploadFileName
	 * @param batchType
	 * @return uploadResult 上传成功后，则返回服务器配置信息和上传结果，上传失败则只返回上传结果不返回服务器配置信息
	 * @author ZhangYu 2016-03-09
	 * @throws IOException 
	 * @throws Exception 
	 */
	public Map<String, Object> fileUpload2FTP(InputStream fileInputStream, String uploadFileName, String batchType) throws IOException{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();

		//0.生成上传文件名
		String suffix = uploadFileName.substring(uploadFileName.lastIndexOf("."));//文件后缀名
		String newUploadFileName = batchType + "_" + UIDGenerator.getRand() + suffix;
		
		//1.从配置文件获取服务器配置信息
		String ftpRemotePath = propertiesUtils.getMessage("FTPREMOTEPATH");//访问FTP的路径
		if(batchType=="evidenceFile"){//黑名单自己文件上传到/blackListEvidenceFile目录下
			ftpRemotePath = propertiesUtils.getMessage("FTPBLACKLISTPATH");//访问FTP的路径
		}
		String ftpServiceConfig = propertiesUtils.getMessage("FTPSERVICECONFIG");
		if(ftpRemotePath == null || ftpServiceConfig == null){
			throw new IOException("FTP服务器配置信息获取失败，请检查配置文件");
		}
		
		//2.获取FTP服务器的具体登录信息
		String[] ftpServiceConfigs = ftpServiceConfig.split(",");
		String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
		String remotePort = ftpServiceConfigs[1];//FTP服务器端口
		String userName = ftpServiceConfigs[2];//FTP服务器用户名
		String password = ftpServiceConfigs[3];//FTP服务器密码
		
		log.debug("FTP服务器配置信息  = {}", remoteAddress+","+remotePort+","+userName+","+password);
		
		//3.封装参数
		Map<String, Object> uploadParam = new HashMap<String, Object>();
		uploadParam.put("remoteAddress", remoteAddress);
		uploadParam.put("remotePort", remotePort);
		uploadParam.put("userName", userName);
		uploadParam.put("password", password);
		uploadParam.put("ftpRemotePath", ftpRemotePath);
		uploadParam.put("fileInputStream", fileInputStream);
		uploadParam.put("newUploadFileName", newUploadFileName);
		uploadParam.put("oldUploadFileName", uploadFileName);
		uploadParam.put("ftpConfigFlag", "FTPSERVICECONFIG");
		
		//5.上传文件，如果不成功则重新尝试上传
		for(int i = retryTimes + 1; i > 0; i--){
			if (!ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
				uploadResult = this.fileUploadMethod(uploadParam);
			} else if(ResultCode.R_SUCCESS.equals(uploadResult.get("code"))){
				break;
			}
		}

		return uploadResult;
	}
	
	/**
	 * 上传文件到FTP服务器，生产环境为多台FTP服务器<br/>
	 * 目前生产环境配置为6台FTP服务器，其中3台面向全国受理批量业务的文件上传，另外3台分别备用FTP服务器。按照10省一台服务器规划，
	 * 根据各省订单量大小，将全国32省(包含虚拟省)分为3组，分别对应3台FTP服务器。具体策略是：</br>
	 * 1.FTP-1对应10省，FTP-2对应10省，FTP-3对应12省；<br/>
	 * 2.如若当前FTP服务器上传文件失败，则重新尝试多次(默认尝试3次)；</br>
	 * 3.如果仍然上传文件失败，则返回错误信息。</br>
	 * @param fileInputStream
	 * @param uploadFileName
	 * @param batchType
	 * @param provinceCode 省份编码
	 * @return uploadResult 上传成功后，则返回服务器配置信息和上传结果，上传失败则只返回上传结果不返回服务器配置信息
	 * @author ZhangYu 2016-03-17
	 * @throws IOException
	 * @throws Exception 
	 */
	public Map<String, Object> fileUpload2FTP4Cluster(InputStream fileInputStream, String uploadFileName, String batchType, String provinceCode) throws IOException{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();
		
		//0.生成上传文件名
		provinceCode = provinceCode.substring(0, 3) + "0000";
		String suffix = uploadFileName.substring(uploadFileName.lastIndexOf("."));// 文件后缀名
		String newUploadFileName = provinceCode + "_" + batchType + "_" + UIDGenerator.getRand() + suffix;

		// 获取服务器配置信息
		//1.根据省份编码provinceCode获取该省对应的服务器映射
		String ftpMapping = propertiesUtils.getMessage("FTP_" + provinceCode);
		if(ftpMapping == null){
			//如果对应省份的FTP映射获取失败，则获取默认配置项
			ftpMapping = propertiesUtils.getMessage("FTP_Default");
			if(ftpMapping == null){
				//如果默认配置项仍获取失败，抛出异常
				throw new IOException("FTP服务器映射配置信息获取失败[FTP_Default/FTP_" + provinceCode + ":" + ftpMapping + "]，请检查配置文件。");
			}
		}
		
		//2.根据服务器映射获取对应的FTP服务器配置信息
		String ftpServiceConfig = propertiesUtils.getMessage(ftpMapping);
		
		//3.访问FTP的路径
		String ftpRemotePath = propertiesUtils.getMessage("FTPREMOTEPATH");
		if(batchType=="evidenceFile"){//黑名单文件上传到/blackListEvidenceFile目录下
			ftpRemotePath = propertiesUtils.getMessage("FTPBLACKLISTPATH");//访问FTP的路径
		}
		
		//4.如果连获取FTP配置信息都失败就不要再继续了
		if (ftpRemotePath == null || ftpServiceConfig == null) {
			throw new IOException("FTP服务器配置信息获取失败[" + ftpMapping + "/FTPREMOTEPATH/FTPBLACKLISTPATH]，请检查配置文件。");
		}
		
		//5.获取FTP服务器的具体登录信息
		String[] ftpServiceConfigs = ftpServiceConfig.split(",");
		String remoteAddress = ftpServiceConfigs[0];// FTP服务器地址(IP)
		String remotePort = ftpServiceConfigs[1];// FTP服务器端口
		String userName = ftpServiceConfigs[2];// FTP服务器用户名
		String password = ftpServiceConfigs[3];// FTP服务器密码
		
		log.debug("FTP服务器配置信息  = {}", remoteAddress+","+remotePort+","+userName+","+password);
		
		//6.封装参数
		Map<String, Object> uploadParam = new HashMap<String, Object>();
		uploadParam.put("remoteAddress", remoteAddress);
		uploadParam.put("remotePort", remotePort);
		uploadParam.put("userName", userName);
		uploadParam.put("password", password);
		uploadParam.put("ftpRemotePath", ftpRemotePath);
		uploadParam.put("fileInputStream", fileInputStream);
		uploadParam.put("newUploadFileName", newUploadFileName);
		uploadParam.put("oldUploadFileName", uploadFileName);
		uploadParam.put("ftpConfigFlag", ftpMapping);
		
		//7.连接某一台FTP服务器失败后，连续尝试多次连接，如果仍然失败，则返回错误信息
		for(int i = retryTimes + 1; i > 0; i--){
			if (!ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
				uploadResult = this.fileUploadMethod(uploadParam);
			} else if(ResultCode.R_SUCCESS.equals(uploadResult.get("code"))){
				break;
			}
		}
		
		//8.如果仍然失败，则开始循环遍历其他所有的FTP服务器，直至上传成功；若所有FTP服务器连接失败，则返回错误信息
		/*if (!ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
			uploadResult = this.switchFTPServerAfterFail(uploadParam, ftpServiceConfig);
		}*/

		return uploadResult;
	}
	
	/**
	 * 如果同一台FTP服务器连接失败，尝试次后仍然失败，则调用此方法连接下一台服务器，直至上传成功；若全部服务器连接失败，则返回错误信息
	 * @param uploadParam
	 * @param ftpServiceConfig
	 * @return
	 * @throws IOException
	 * @throws Exception
	 * @author ZhangYu 2016-03-18
	 * @deprecated 因方案调整，该方法不再满足需求，不建议使用
	 */
	@SuppressWarnings("unused")
	@Deprecated
	private Map<String, Object> switchFTPServerAfterFail(Map<String, Object> uploadParam, String ftpServiceConfig) throws IOException, Exception{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();
		//1.获取所有FTP服务器配置信息
		List<String> ftpServiceConfigLists = this.getFTPServiceConfigList();
		
		//2.循环遍历每一台FTP服务器，尝试上传文件
		for(int j = 0; j < ftpServiceConfigLists.size(); j++){
			String ftpServiceConfig2try = ftpServiceConfigLists.get(j);
			if(ftpServiceConfig2try.equals(ftpServiceConfig)){
				//3.已经尝试连接过的FTP服务器从List中去除，不再尝试连接
				ftpServiceConfigLists.remove(j);
			}else{
				ftpServiceConfig = ftpServiceConfig2try;
				
				//4.获取FTP服务器的配置信息
				String[] ftpServiceConfigs = ftpServiceConfig.split(",");
				String remoteAddress = ftpServiceConfigs[0];// FTP服务器地址(IP)
				String remotePort = ftpServiceConfigs[1];// FTP服务器端口
				String userName = ftpServiceConfigs[2];// FTP服务器用户名
				String password = ftpServiceConfigs[3];// FTP服务器密码

				log.debug("FTP服务器配置信息  = {}", remoteAddress + "," + remotePort + "," + userName + "," + password);
				
				//5.覆盖掉上一台无法连接的FTP服务器配置信息(文件名、输入流等仍继续复用)
				uploadParam.put("remoteAddress", remoteAddress);
				uploadParam.put("remotePort", remotePort);
				uploadParam.put("userName", userName);
				uploadParam.put("password", password);
				
				//6.连接某一台FTP服务器失败后，连续尝试3次连接，如果仍然失败，则返回错误信息
				for(int i = retryTimes + 1; i > 0; i--){
					if (!ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
						uploadResult = this.fileUploadMethod(uploadParam);
					} else if(ResultCode.R_SUCCESS.equals(uploadResult.get("code"))){
						break;
					}
				}
				
				//7.如果上传文件至服务器成功，则停止循环遍历其他FTP服务器
				if (ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
					break;
				}
			}
		}
		
		return uploadResult;
	}
	
	/**
	 * 上传文件主方法<br/>
	 * 注：由于上传一次失败后，仍要继续尝试上传(默认最多3次)，如果失败一次即抛出异常，则不方便继续尝试上传，所以将异常信息进行封装，不会抛出
	 * @param uploadParam
	 * @return
	 * @author ZhangYu 2016-03-17
	 * @throws IOException 
	 * @throws Exception 
	 */
	private Map<String, Object> fileUploadMethod(Map<String, Object> uploadParam) {
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();

		//1.获取FTP服务器配置信息以及文件数据流
		String remoteAddress = uploadParam.get("remoteAddress").toString();
		String remotePort = uploadParam.get("remotePort").toString();
		String userName = uploadParam.get("userName").toString();
		String password = uploadParam.get("password").toString();
		String ftpRemotePath = uploadParam.get("ftpRemotePath").toString();
		String newUploadFileName = uploadParam.get("newUploadFileName").toString();
		String oldUploadFileName = uploadParam.get("oldUploadFileName").toString();
		String ftpConfigFlag = uploadParam.get("ftpConfigFlag").toString();
		InputStream fileInputStream = (InputStream) uploadParam.get("fileInputStream");
		
		FtpUtils ftpUtils = new FtpUtils();
		
		//2.连接FTP服务器
		Map<String, Object> ftpInfos = new HashMap<String, Object>();
		//FTP服务器信息字符串，用于发生异常时返回FTP信息，以便定位
		String ftpInfosStr = "[" + remoteAddress + "," + remotePort + "," + userName + "," + ftpRemotePath + "]";
		boolean ftpConnectFlag = ftpUtils.connectFTPServer(remoteAddress, remotePort, userName, password);
		if(ftpConnectFlag){
			//3.切换FTP服务器路径
			boolean essFtpUpload = false;
			if (ftpRemotePath.contains("ess_yyyyMMdd")) {
				essFtpUpload = true;
				ftpRemotePath = ftpRemotePath.split("ess_yyyyMMdd")[0];
			}
			
			boolean changePathFlag = ftpUtils.changeWorkingDirectory(ftpRemotePath);
			if (essFtpUpload) {
				//生成当天的目录
				String yyyyMMdd = DateUtil.getNowII();
				ftpUtils.makeDirectory(yyyyMMdd);
				changePathFlag = ftpUtils.changeWorkingDirectory(ftpRemotePath + yyyyMMdd);
			}
			
			if(changePathFlag){
				//4.上传文件
				boolean uploadFileFlag = ftpUtils.uploadFileToFtpServer(newUploadFileName, fileInputStream);
				if(uploadFileFlag){
					//5.如果文件上传成功，此时封装FTP服务器信息返回给后台，后台据此获取Excel文件
					ftpInfos.put("ftpServiceIp", remoteAddress);
					ftpInfos.put("servicePort", remotePort);
					ftpInfos.put("filePath", ftpRemotePath);
					ftpInfos.put("fileName", newUploadFileName);
					ftpInfos.put("oldUploadFileName", oldUploadFileName);
					ftpInfos.put("ftpConfigFlag", ftpConfigFlag);
					uploadResult.put("ftpInfos", ftpInfos);
					uploadResult.put("code", ResultCode.R_SUCCESS);
				} else{
					uploadResult.put("code", ResultCode.R_FAILURE);
					uploadResult.put("mess", "文件上传失败：<br/>" + ftpInfosStr + ftpUtils.errMsgMap.get("uploadErrMsg"));
				}
			} else{
				uploadResult.put("code", ResultCode.R_FAILURE);
				uploadResult.put("mess", "FTP服务器路径切换失败：<br/>s" + ftpInfosStr + ftpUtils.errMsgMap.get("changeDirErrMsg"));
			}
		} else{
			uploadResult.put("code", ResultCode.R_FAILURE);
			uploadResult.put("mess", "FTP服务器连接失败：<br/>" + ftpInfosStr + ftpUtils.errMsgMap.get("connectErrMsg"));
		}

		return uploadResult;
	}
	
	/**
	 * 循环遍历所有FTP服务器的配置信息
	 * @return ftpServiceConfigLists 以 ArrayList返回所有FTP服务器的配置信息
	 * @author ZhangYu 2016-03-17
	 * @deprecated 因方案调整，该方法不再满足需求，不再适用
	 */
	@Deprecated
	private List<String> getFTPServiceConfigList(){
		int flag = 1;
		List<String> ftpServiceConfigLists = new ArrayList<String>();
		while(true){
			String ftpServiceConfig = propertiesUtils.getMessage("FTPSERVICECONFIG_" + flag);
			if(ftpServiceConfig != null && !"".equals(ftpServiceConfig)){
				ftpServiceConfigLists.add(ftpServiceConfig);
			}else{
				break;
			}
			flag++;
		}
		
		return ftpServiceConfigLists;
	}
	
	/**
	 * 快销卡上传pdf文件
	 */
	public Map<String, Object> pdfFileFTP(InputStream fileInputStream, String uploadFileName) throws IOException{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();		
		//1.从配置文件获取服务器配置信息
		String ftpRemotePath = propertiesUtils.getMessage("ESSFTPREMOTEPATH");//访问FTP的路径
		String ftpServiceConfig = propertiesUtils.getMessage("ESSFTPSERVICECONFIG");
		if(ftpRemotePath == null || ftpServiceConfig == null){
			throw new IOException("FTP服务器配置信息获取失败，请检查配置文件");
		}
		
		//2.获取FTP服务器的具体登录信息
		String[] ftpServiceConfigs = ftpServiceConfig.split(",");
		String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
		String remotePort = ftpServiceConfigs[1];//FTP服务器端口
		String userName = ftpServiceConfigs[2];//FTP服务器用户名
		String password = ftpServiceConfigs[3];//FTP服务器密码
		
		log.debug("FTP服务器配置信息  = {}", remoteAddress+","+remotePort+","+userName+","+password);
		
		//3.封装参数
		Map<String, Object> uploadParam = new HashMap<String, Object>();
		uploadParam.put("remoteAddress", remoteAddress);
		uploadParam.put("remotePort", remotePort);
		uploadParam.put("userName", userName);
		uploadParam.put("password", password);
		uploadParam.put("ftpRemotePath", ftpRemotePath);
		uploadParam.put("fileInputStream", fileInputStream);
		uploadParam.put("newUploadFileName", uploadFileName);
		uploadParam.put("oldUploadFileName", uploadFileName);
		uploadParam.put("ftpConfigFlag", "FTPSERVICECONFIG");
		
		//4.上传文件，如果不成功则重新尝试上传
		for(int i = retryTimes + 1; i > 0; i--){
			if (!ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
				uploadResult = this.fileUploadMethod(uploadParam);
			} else if(ResultCode.R_SUCCESS.equals(uploadResult.get("code"))){
				break;
			}
		}

		return uploadResult;
	}
}
