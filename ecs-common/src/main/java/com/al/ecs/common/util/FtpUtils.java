package com.al.ecs.common.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPReply;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.SftpException;

/** 
 * FTP客户端工具类.
 * 使用org.apache.commons.net.ftp,com.jcraft.jsch包.
 * @author chenhr
 * @version 1.0.0
 * @since 2015-12-01
 */
public class FtpUtils {

	private static final Logger LOG = LoggerFactory.getLogger(FtpUtils.class);
	
		//ftp客户端
		private FTPClient ftpClient;
		public Map<String, Object> errMsgMap = new HashMap<String, Object>();
		
		/**
		 * 连接服务器
		 * 
		 * @param remotePath
		 */
		@SuppressWarnings("finally")
		public boolean connectFTPServer(String remoteAddress, String remotePort, String userName, String password) throws IOException {
			boolean flag = false;
			try {
				ftpClient = new FTPClient();

				// 判断资源文件的端口,为空或者等0使用FTPServer默认端口
				if (remotePort == null || 0 == Integer.parseInt(remotePort)) {
					ftpClient.connect(remoteAddress);
				} else {
					ftpClient.connect(remoteAddress, Integer.parseInt(remotePort));
				}

				//int reply = ftpClient.getReplyCode();

				if (!FTPReply.isPositiveCompletion(ftpClient.getReplyCode())) {
					closeFTPServerConnect();
					LOG.debug("FTP server refused connection.");
				}

				// 登录FTPServer
				if(ftpClient.login(userName, password)){
					ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
					flag = true;
//					LOG.debug(" login success !!!");
				}
				
				ftpClient.enterLocalPassiveMode();
				ftpClient.setFileTransferMode(FTP.STREAM_TRANSFER_MODE);
				ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
			} catch (IOException e) {
				errMsgMap.put("connectErrMsg",  ExceptionUtils.getFullStackTrace((Throwable) e));
				flag = false;
				LOG.error(" not login !!! flag = {}", flag);
				LOG.error("connectServer IOException : {}", e);
			} finally {
				return flag;
			}
		}
		
		/**
		 * 改变服务器路径
		 * 
		 * @param remotePath
		 * @return
		 */
		@SuppressWarnings("finally")
		public boolean changeWorkingDirectory(String remotePath) throws IOException {
			boolean flag = false;
			try {
				flag = ftpClient.changeWorkingDirectory(remotePath);
//				LOG.debug("set working directory successful !!! ");
			} catch (IOException e) {
				errMsgMap.put("changeDirErrMsg",  ExceptionUtils.getFullStackTrace((Throwable) e));
				flag = false;
				LOG.error("set working directory failed !!! flag = {}", flag);
				LOG.error("changeWorkingDirectory IOException : {}", e);
			} finally {
				return flag;
			}
		}
		
		/**
		 * 上传文件主程序
		 * 
		 * @param file
		 * @throws Exception 
		 */
		@SuppressWarnings({ "finally", "static-access" })
		public boolean uploadFileToFtpServer(String fileName, InputStream is) throws Exception {
//			InputStream is = null;
			boolean flag = false;
			try {
//				is = new BufferedInputStream(new FileInputStream(file));
				
				String destinationFileName = new String(fileName.getBytes("GBK"), ftpClient.DEFAULT_CONTROL_ENCODING);
				flag = ftpClient.storeFile(destinationFileName, is);
				if (flag) {
//					LOG.debug("upload success !!!");
				} else {
//					LOG.debug("upload failed !!!");
				}
			} catch (Exception e) {
				errMsgMap.put("uploadErrMsg", ExceptionUtils.getFullStackTrace((Throwable) e));
				flag = false;
				LOG.error("not upload !!!");
				LOG.error("uploadFileFrom IOException : {}", e);
			} finally {
				this.closeFTPServerConnect();
				return flag;
			}
		}
		
		 /**
	     * 检查远程是否存在文件  
	     * @param remoteFileName 远程文件名
	     * @return
	     * @throws IOException
	     * boolean
	     */
	    @SuppressWarnings({ "static-access", "finally" })
		public boolean isFileExist(String remoteFileName, String localPath){
	     boolean isFileExist = false;     
		 FTPFile[] files = null;
		 try {
				 if(!StringUtils.isEmpty(remoteFileName)){
					ftpClient.enterLocalPassiveMode();
					//检查远程是否存在文件  
					files = ftpClient.listFiles(localPath + new String(remoteFileName.getBytes("GBK"), ftpClient.DEFAULT_CONTROL_ENCODING));
					if(files != null && files.length >= 1){  
				        isFileExist = true;
				     }
				 }
			} catch (UnsupportedEncodingException e) {
				isFileExist = false;      
				LOG.error("isFileExist UnsupportedEncodingException : {}",e);
			} catch (IOException e) {
				isFileExist = false;      
				LOG.error("isFileExist IOException : {}", e);
			} finally {
			     return isFileExist;
			}
	    }
	    
	    /**
		 * 下载单个文件
		 * @param fileName   文件名
		 * @param localPath  文件路径
		 */
		@SuppressWarnings({ "static-access", "finally" })
		public boolean downloadFileByPath(String fileName, OutputStream os) {
			boolean flag = false;
//			OutputStream os = null;
			try {
//				os = new BufferedOutputStream(new FileOutputStream(localPath + tempFileName));
				// 从FTPServer上下载文件
				flag = ftpClient.retrieveFile(new String(fileName.getBytes("GBK"), ftpClient.DEFAULT_CONTROL_ENCODING), os);
				if (flag) {
//					LOG.debug("download success !!! ");
				} else {
					LOG.debug("download failed !!! ");
				}
			} catch (IOException e) {
				flag = false;
				LOG.error("not download !!! ");
				LOG.error("downloadFileByPath IOException : {}", e);
			} finally {
//				try {
//					os.close();
//				} catch (IOException e) {
//					flag = false;
//					log.error("downloadFileByPath IOException : {}", e);
//				} finally {
//					os = null;
//				}
				return flag;
			}
		}
		
		/**
		 * 关闭服务器连接
		 */
		public void closeFTPServerConnect() throws Exception{
			try {
				if(ftpClient != null){
					if(ftpClient.isConnected()){
						try{
							ftpClient.logout();
						} catch (IOException e) {
							LOG.error("closeFTPServerConnect logout IOException : {}", e);
						} 
						try{
							ftpClient.disconnect();
						} catch (IOException e) {
							LOG.error("closeFTPServerConnect disconnect IOException : {}", e);
						} 
					}
				}
//				LOG.debug("disconnect success !!!");
			} catch (Exception e) {
				LOG.error("not disconnect !!! ");
				LOG.error("closeFTPServerConnect IOException : {}", e);
			} finally {
				ftpClient = null;
			}
		}
		
		/**
		 * 删除服务器上文件 zhousi
		 */
		public boolean deleteFileOnFTP(String filePath) throws Exception{
			boolean flag=false;
			try {
				if(ftpClient != null){
				flag=ftpClient.deleteFile(filePath);
				}
//				LOG.debug("delete success !!!");
			} catch (Exception e) {
				LOG.error("not delete !!! ");
				LOG.error("deleteFilesOnFTPServer IOException : {}", e);
			}
			return flag;
		}

	/**
     * SFTP连接,默认22端口.
     * @param host
     * @param username
     * @param password
     * @return
     */
    public static ChannelSftp connect(String host, String username,
        String password) {
        return connect(host, username, password, null);
    }

	/**
	 * SFTP连接,默认22端口.
	 * @param host
	 * @param username
	 * @param password
	 * @param path
	 * @return
	 */
	public static ChannelSftp connect(String host, String username,
	    String password, String path) {
	    ChannelSftp sftp = null;
	    try {
	        JSch jsch = new JSch();
	        Session sshSession = jsch.getSession(username, host);
	        LOG.info("Session created.");
	        sshSession.setPassword(password);
	        Properties sshConfig = new Properties();
	        sshConfig.put("StrictHostKeyChecking", "no");
	        sshSession.setConfig(sshConfig);
	        sshSession.connect();
	        LOG.info("Session connected.");
	        LOG.info("Opening Channel.");
	        Channel channel = sshSession.openChannel("sftp");
	        channel.connect();
	        sftp = (ChannelSftp) channel;
	        LOG.info("Connected to {}", host);
	        if (StringUtils.isNotBlank(path)) {
	            sftp.cd(path);
	            LOG.info("Entry to {}", path);
	        }
	    } catch(Exception e) {
	        LOG.error(host + " connect failure!!! " + e.getMessage(), e);
	    }
	    return sftp;
	}

	/**
	 * SFTP断开.
	 * @param sftp
	 */
	public static void disconnect(ChannelSftp sftp) {
	    if (null != sftp) {
            if (sftp.isConnected()) {
                sftp.disconnect();
                LOG.info("sftp is closed.");
            } else if (sftp.isClosed()) {
                LOG.info("sftp is closed already.");
            }
	    }
	}

	/**
	 * 上传本地文件到服务器.
	 * @param sftp
	 * @param uploadFileName
	 */
	public static void upload(ChannelSftp sftp, String uploadFileName) {
        try {
            File file = new File(uploadFileName);
            if (file.isFile()) {
                LOG.info("localFile: {}", file.getAbsolutePath());
                sftp.put(new FileInputStream(file), file.getName());
                LOG.info("Upload down for {}", uploadFileName);
            }
        } catch (FileNotFoundException e) {
            LOG.error(uploadFileName + "; File not found!!! " + e.getMessage(), e);
        } catch (SftpException e) {
            LOG.error(uploadFileName + "; upload failure!!! " + e.getMessage(), e);
        }
	}

	/**
	 * 从服务器下载文件到本地.
	 * @param sftp
	 * @param sourceFileName
	 * @param destinationFileName
	 */
	public static void download(ChannelSftp sftp, String sourceFileName, String destinationFileName) {
	    try {
            File file = new File(destinationFileName);
            if (file.isDirectory()) {
                destinationFileName = file.getPath() + File.separatorChar + sourceFileName;
                LOG.info("Download for {}", destinationFileName);
                file = new File(destinationFileName);
            }
            sftp.get(sourceFileName, new FileOutputStream(file));
            LOG.info("{}; download success!!! ", sourceFileName);
        } catch (Exception e) {
            LOG.error(sourceFileName + "; download failure!!! " + e.getMessage(), e);
        }
	}

	/**
	 * 连接服务器.
	 * @server：服务器名字
	 * @user：用户名
	 * @password：密码
	 * @path：服务器上的路径
	 * @return
	 */
	public static FTPClient connectServer(String server, String user,
	    String password, String path) {
	    FTPClient ftpClient = new FTPClient();
		try {
			ftpClient.connect(server);
			if (ftpClient.login(user, password)) {
			    LOG.info("{} connectServer success!!! ", server);
			    if (StringUtils.isNotBlank(path)) {
			        if (ftpClient.changeWorkingDirectory(path)) {
			            LOG.info("Set working directory successful!!! ");
			        } else {
			            LOG.info("Set working directory failure!!! ");
			        }
			    }
			} else {
			    LOG.info("{} connectServer failure!!! ", server);
			}
		} catch (Exception e) {
		    LOG.error(server + " connectServer failure!!! " + e.getMessage(), e);
		}
		return ftpClient;
	}

	/**
	 * 连接服务器.
	 * @server：服务器名字
	 * @port: 端口
	 * @user：用户名
	 * @password：密码
	 * @path：服务器上的路径
	 * @return
	 */
	public static FTPClient connectServer(String server, int port,
	    String user, String password, String path) {
	    FTPClient ftpClient = new FTPClient();
		try {
			ftpClient.connect(server, port);
			if (ftpClient.login(user, password)) {
			    LOG.warn("{} connectServer success!!! ", server);
			    if (StringUtils.isNotBlank(path)) {
                    if (ftpClient.changeWorkingDirectory(path)) {
                        LOG.info(" Set working directory successful!!! ");
                    } else {
                        LOG.info(" Set working directory failure!!! ");
                    }
                }
			} else {
			    LOG.info("{} connectServer failure!!! ", server);
			}
		} catch (Exception e) {
		    LOG.error(server + " connectServer failure!!! " + e.getMessage(), e);
		}
		return ftpClient;
	}

	/**
	 * 关闭连接
	 * @param ftpClient
	 */
	public static void closeConnect(FTPClient ftpClient) {
		try {
			ftpClient.disconnect();
			LOG.info("CloseConnect success!!! ");
		} catch (Exception e) {
		    LOG.error("CloseConnect failure!!! " + e.getMessage(), e);
		}
	}

	/**
	 * 上传本地文件到服务器.
	 * @param ftpClient
	 * @param uploadFileName
	 */
	public static void upload(FTPClient ftpClient, String uploadFileName) {
		try {
			File uploadFile = new File(uploadFileName);
			FileInputStream fis = new FileInputStream(uploadFile);
			// 上传本地文件到服务器上(文件名以'temp_'开头，当上传完毕后，名字改为正式名)
			String filenames = "temp_" + UIDGenerator.getRand();
			boolean flag = ftpClient.storeFile(filenames, fis);
			LOG.info("{}; upload flag ====> {}", uploadFileName, flag);
			if (flag) {
			    LOG.info("{}; upload success!!! ", uploadFileName);
				// 上传完毕后，名字改为正式名(该方法在远程有效，本地不用此方法，而用renameTo方法)
				ftpClient.rename(uploadFileName, filenames);
			}
			// 关闭文件流
			fis.close();
		} catch (Exception e) {
		    LOG.error(uploadFileName + "; upload failure!!! " + e.getMessage(), e);
		}
	}

	/**
	 * 从服务器下载文件到本地.
	 * @param ftpClient
	 * @param SourceFileName
	 * @param destinationFileName
	 */
	public static void download(FTPClient ftpClient, String SourceFileName, String destinationFileName) {
		try {
			File temp_file = new File(SourceFileName);
			File dest_file = new File(destinationFileName);		
			FileOutputStream fos = new FileOutputStream(temp_file);
			// 从服务器上下载文件
			String filenames = "temp_" + UIDGenerator.getRand();
			boolean flag = ftpClient.retrieveFile(filenames, fos);
			LOG.info("{}; download flag ====> {}", SourceFileName, flag);
			// 关闭文件流
			fos.close();
			if (flag) {
				// 本地rename,前提是先关闭文件流
				temp_file.renameTo(dest_file);
				LOG.info("{}; download success!!! ", SourceFileName);
			}
		} catch (Exception e) {
		    LOG.error(SourceFileName + "; download failure!!! " + e.getMessage(), e);
		}
	}

}
