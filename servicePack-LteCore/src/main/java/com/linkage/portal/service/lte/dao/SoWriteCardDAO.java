package com.linkage.portal.service.lte.dao;



import java.util.Map;

import com.al.ec.serviceplatform.client.DataMap;
/**
 * 卡资源数据库接口
 * @author xuj
 *
 */
public interface SoWriteCardDAO {

	/**
	 * 根据卡商编码查找其动态链接库信息
	 * @param dataBus
	 * @return
	 * @throws Exception
	 */
	public Map<String,Object> getCardDllInfo(DataMap dataBus) throws Exception;
	/**
     * 现场写卡--获取密码
     * @param factoryCode 厂商
     * @param keyType 密钥类型
     */
    public String getPasswordKey(String factoryCode,String keyType)throws Exception;
    
    /**
     * 查找对应密钥
     * @param CryptIndex
     * @return
     * @throws Exception
     */
    public String getRscKey(String CryptIndex)throws Exception;
    /**
     * 查找卡商组件鉴权密钥
     * @param factoryCode
     * @return
     * @throws Exception
     */
    public String getDllKey(String factoryCode)throws Exception;
    
    public Map writeWriteCardLog(Map map);
}
