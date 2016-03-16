package com.al.lte.portal.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.FtpUtils;
import com.al.ecs.common.util.PropertiesUtils;
import com.al.ecs.common.util.UIDGenerator;
import com.al.ecs.common.web.SpringContextUtil;
import com.al.ecs.log.Log;

/**
 * 门户上传文件到FTP服务器工具类实现类
 * @author ZhangYu 2016-03-10
 *
 */
@Service("com.al.lte.portal.common.FTPServiceUtils")
public class FTPServiceUtilsImpl implements FTPServiceUtils {
	
	private static Log log = Log.getLog(FTPServiceUtils.class);
	private int retryTimes = 3;//当上传Excel文件失败后重试3次	
	/**
	 * 上传文件到FTP服务器，单台服务器
	 * @param fileInputStream
	 * @param uploadFileName
	 * @param batchType
	 * @param retryTimes
	 * @return 上传成功后，则返回服务器配置信息和上传结果，上传失败则只返回上传结果不返回服务器配置信息
	 * @author ZhangYu 2016-03-09
	 * @throws IOException 
	 * @throws Exception 
	 */
	public Map<String, Object> fileUpload2FTP(InputStream fileInputStream, String uploadFileName, String batchType) throws IOException, Exception{
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		
		//生成上传文件名
		String suffix = uploadFileName.substring(uploadFileName.lastIndexOf("."));//文件后缀名
		String fileName2Upload = batchType + "_" + UIDGenerator.getRand() + suffix;
		
		//获取服务器配置信息
		String ftpRemotePath = propertiesUtils.getMessage("FTPREMOTEPATH");//访问FTP的路径
		String[] ftpServiceConfigs = propertiesUtils.getMessage("FTPSERVICECONFIG").split(",");
		String remoteAddress = ftpServiceConfigs[0];//FTP服务器地址(IP)
		String remotePort = ftpServiceConfigs[1];//FTP服务器端口
		String userName = ftpServiceConfigs[2];//FTP服务器用户名
		String password = ftpServiceConfigs[3];//FTP服务器密码
		
//		log.debug("FTP服务器配置信息  = {}", remoteAddress+","+remotePort+","+userName+","+password);
		
		//连接FTP服务器
		FtpUtils ftpUtils = new FtpUtils();
		boolean ftpConnectFlag = ftpUtils.connectFTPServer(remoteAddress, remotePort, userName, password);
		if(ftpConnectFlag){
			//改变FTP服务器路径
			boolean changePathFlag = ftpUtils.changeWorkingDirectory(ftpRemotePath);
			if(changePathFlag){
				//上传文件
				boolean uploadFileFlag = ftpUtils.uploadFileToFtpServer(fileName2Upload, fileInputStream);
				if(uploadFileFlag){
					Map<String, Object> ftpInfos = new HashMap<String, Object>();//调后台
					ftpInfos.put("ftpServiceIp", remoteAddress);
					ftpInfos.put("servicePort", remotePort);
					ftpInfos.put("filePath", ftpRemotePath);
					ftpInfos.put("fileName", fileName2Upload);
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

		//不管是否上传成功，关闭服务器连接
		ftpUtils.closeFTPServerConnect();
		
		//上传失败后重新尝试再上传
		if (ResultCode.R_FAILURE.equals(uploadResult.get("code"))) {
			while (retryTimes > 0) {
				retryTimes--;
				this.fileUpload2FTP(fileInputStream, uploadFileName, batchType);
			}
		}

		return uploadResult;
	}
	
	/**
	 * 上传文件到FTP服务器，服务器集群，目前配置为6台翼销售服务器</br>
	 * 按照5个省一台服务器规划，当一台服务器故障，则顺序读取下一台服务器，上传文件
	 * @param fileInputStream
	 * @param provinceCode 省份编码
	 * @return
	 * @author ZhangYu
	 */
	public Map<String, Object> fileUpload2FTP4Cluster(InputStream fileInputStream, String provinceCode){
		
		Map<String, Object> uploadResult = new HashMap<String, Object>();
		PropertiesUtils propertiesUtils = (PropertiesUtils) SpringContextUtil.getBean("propertiesUtils");
		
		
		return uploadResult;
	}
}
