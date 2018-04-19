package com.ailk.ecsp.util;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 读取properties文件.
 */
public class PropUtil{
	private static PropUtil INSTANCE;
    private Properties propertie;
    private FileInputStream inputFile;
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    /**
     * 初始化Configuration类.
     */
    public PropUtil() {
    	propertie = new Properties();
        try {
            inputFile = new FileInputStream("");
            propertie.load(inputFile);
            inputFile.close();
        } catch (FileNotFoundException ex) {
            log.error("读取属性文件--->失败！- 原因：文件路径错误或者文件不存在");
            log.error("", ex);
        } catch (IOException ex) {
        	log.error("装载文件--->失败!");
            log.error("", ex);
        }
    }
    
    public static PropUtil getInstance(){
    	if(INSTANCE == null){
    		INSTANCE = new PropUtil();
    	}
    	return INSTANCE;
    }
    
   
    
    /**
     * 重载函数，得到key的值.
     * @param key 取得其值的键
     * @return key的值
     */
    public String getValue(String key) {
    	//系统参数级别优先
    	//得到某一属性的值
        if(propertie.containsKey(key)){
            String value = propertie.getProperty(key);
            return value;
        }else{
            return "";
        }
    }//end getValue(...)
    
    /**
     * 重载函数，得到key的值.
     * @param fileName properties文件的路径+文件名
     * @param key 取得其值的键
     * @return key的值
     */
    public String getValue(String fileName, String key){
        try {
            String value = "";
            inputFile = new FileInputStream(fileName);
            propertie.load(inputFile);
            inputFile.close();
            if(propertie.containsKey(key)){
                value = propertie.getProperty(key);
                return value;
            } else{
                return value;
            }
        } catch (FileNotFoundException e) {
            log.error("",e);
            return "";
        } catch (IOException e) {
        	log.error("",e);
            return "";
        } catch (Exception ex) {
        	log.error("",ex);
            return "";
        }
    }//end getValue(...)
   
    
}//end class ReadConfigInfo
