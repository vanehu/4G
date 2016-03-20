package com.al.lte.portal.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

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
	 * 上传文件到FTP服务器，单台服务器(测试环境或者多台FTP服务器不具备的情况下使用)
	 * @param fileInputStream
	 * @param uploadFileName
	 * @param batchType
	 * @return uploadResult 上传成功后，则返回服务器配置信息和上传结果，上传失败则只返回上传结果不返回服务器配置信息
	 * @author ZhangYu 2016-03-09
	 * @throws IOException 
	 * @throws Exception 
	 */
	public Map<String, Object> fileUpload2FTP(InputStream fileInputStream, String uploadFileName, String batchType) throws IOException, Exception{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();

		//0.生成上传文件名
		String suffix = uploadFileName.substring(uploadFileName.lastIndexOf("."));//文件后缀名
		String newUploadFileName = batchType + "_" + UIDGenerator.getRand() + suffix;
		
		//1.从配置文件获取服务器配置信息
		String ftpRemotePath = propertiesUtils.getMessage("FTPREMOTEPATH");//访问FTP的路径
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
	 * 上传文件到FTP服务器，服务器集群，目前配置为6台翼销售服务器</br>
	 * 按照5个省一台服务器规划，当一台服务器故障，则顺序读取下一台服务器上传文件，具体策略是：</br>
	 * 当前FTP服务器上传文件失败，重新尝试多次(默认尝试3次)；</br>
	 * 如果仍然上传文件失败，则根据各省与FTP服务器映射关系，上传到另一台FTP服务器；</br>
	 * 如果另一台仍然上传失败，则重新尝试多次(默认尝试3次)；后续以此类推...直至上传文件成功或者所有配置的FTP服务器上传失败
	 * @param fileInputStream
	 * @param uploadFileName
	 * @param batchType
	 * @param provinceCode 省份编码
	 * @return uploadResult 上传成功后，则返回服务器配置信息和上传结果，上传失败则只返回上传结果不返回服务器配置信息
	 * @author ZhangYu 2016-03-17
	 * @throws IOException
	 * @throws Exception 
	 */
	public Map<String, Object> fileUpload2FTP4Cluster(InputStream fileInputStream, String uploadFileName, String batchType, String provinceCode) throws Exception{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();
		String ftpMapping = null;
		
		//0.生成上传文件名
		String suffix = uploadFileName.substring(uploadFileName.lastIndexOf("."));// 文件后缀名
		String newUploadFileName = batchType + "_" + UIDGenerator.getRand() + suffix;

		// 获取服务器配置信息
		//1.访问FTP的路径
		String ftpRemotePath = propertiesUtils.getMessage("FTPREMOTEPATH");
		//2.根据省份编码provinceCode获取该省对应的服务器映射
		provinceCode = provinceCode.substring(0, 3) + "0000";
		ftpMapping = propertiesUtils.getMessage("FTP_" + provinceCode);
		//3.根据服务器映射获取对应的FTP服务器配置信息
		String ftpServiceConfig = propertiesUtils.getMessage(ftpMapping);
		//4.如果连获取FTP配置信息都失败就不要再继续了
		if (ftpRemotePath == null || ftpServiceConfig == null || ftpMapping == null) {
			throw new Exception("FTP服务器配置信息获取失败，请检查配置文件");
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
		
		//7.连接某一台FTP服务器失败后，连续尝试多次连接，如果仍然失败，则返回错误信息
		for(int i = retryTimes + 1; i > 0; i--){
			if (!ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
				uploadResult = this.fileUploadMethod(uploadParam);
			} else if(ResultCode.R_SUCCESS.equals(uploadResult.get("code"))){
				break;
			}
		}
		
		//8.如果仍然失败，则开始循环遍历其他所有的FTP服务器，直至上传成功；若所有FTP服务器连接失败，则返回错误信息
		if (!ResultCode.R_SUCCESS.equals(uploadResult.get("code"))) {
			uploadResult = this.switchFTPServerAfterFail(uploadParam, ftpServiceConfig);
		}

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
	 */
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
				
				//5.覆盖掉上一台无法连接的FTP服务器配置信息(文件名、输入流等仍可复用)
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
	 * 上传文件主方法
	 * @param uploadParam
	 * @return
	 * @author ZhangYu 2016-03-17
	 * @throws IOException 
	 * @throws Exception 
	 */
	private Map<String, Object> fileUploadMethod(Map<String, Object> uploadParam) throws IOException, Exception{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();

		//1.获取FTP服务器配置信息以及文件数据流
		String remoteAddress = uploadParam.get("remoteAddress").toString();
		String remotePort = uploadParam.get("remotePort").toString();
		String userName = uploadParam.get("userName").toString();
		String password = uploadParam.get("password").toString();
		String ftpRemotePath = uploadParam.get("ftpRemotePath").toString();
		String newUploadFileName = uploadParam.get("newUploadFileName").toString();
		InputStream fileInputStream = (InputStream) uploadParam.get("fileInputStream");
		
		//2.连接FTP服务器
		FtpUtils ftpUtils = new FtpUtils();
		boolean ftpConnectFlag = ftpUtils.connectFTPServer(remoteAddress, remotePort, userName, password);
		if(ftpConnectFlag){
			//3.改变FTP服务器路径
			boolean changePathFlag = ftpUtils.changeWorkingDirectory(ftpRemotePath);
			if(changePathFlag){
				//4.上传文件
				boolean uploadFileFlag = ftpUtils.uploadFileToFtpServer(newUploadFileName, fileInputStream);
				if(uploadFileFlag){
					//5.如果文件上传成功，此时封装FTP服务器信息返回给后台，后台据此获取Excel文件
					Map<String, Object> ftpInfos = new HashMap<String, Object>();
					ftpInfos.put("ftpServiceIp", remoteAddress);
					ftpInfos.put("servicePort", remotePort);
					ftpInfos.put("filePath", ftpRemotePath);
					ftpInfos.put("fileName", newUploadFileName);
					uploadResult.put("ftpInfos", ftpInfos);
					uploadResult.put("code", ResultCode.R_SUCCESS);
				} else{
					uploadResult.put("code", ResultCode.R_FAILURE);
					uploadResult.put("mess", "文件上传失败");
				}
			} else{
				uploadResult.put("code", ResultCode.R_FAILURE);
				uploadResult.put("mess", "FTP服务器路径切换失败");
			}
		} else{
			uploadResult.put("code", ResultCode.R_FAILURE);
			uploadResult.put("mess", "FTP服务器连接失败");
		}

		//6.不管是否上传成功，关闭服务器连接
		ftpUtils.closeFTPServerConnect();
		
		return uploadResult;
	}
	
	/**
	 * 循环遍历所有FTP服务器的配置信息
	 * @return ftpServiceConfigLists 以 ArrayList返回所有FTP服务器的配置信息
	 * @author ZhangYu 2016-03-17
	 */
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
}
