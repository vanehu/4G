package com.al.lte.portal.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * 门户上传文件到FTP服务器工具类
 * @author ZhangYu 2016-03-08
 *
 */
public interface FTPServiceUtils {
	
	/**
	 * 上传文件到FTP服务器，单台服务器
	 * @param fileInputStream
	 * @param uploadFileName
	 * @param batchType
	 * @return 上传成功后，则返回
	 * @author ZhangYu 2016-03-09
	 * @throws IOException 
	 * @throws Exception 
	 */
	public Map<String, Object> fileUpload2FTP(InputStream fileInputStream, String uploadFileName, String batchType) throws IOException, Exception;
	
	/**
	 * 上传文件到FTP服务器，服务器集群，目前配置为6台翼销售服务器</br>
	 * 按照5个省一台服务器规划，当一台服务器故障，则顺序读取下一台服务器上传文件
	 * @param fileInputStream
	 * @param provinceCode 省份编码
	 * @return
	 * @author ZhangYu
	 */
	public Map<String, Object> fileUpload2FTP4Cluster(InputStream fileInputStream, String uploadFileName, String batchType, String provinceCode) throws Exception;
}
