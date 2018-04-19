package com.ailk.ecsp.core.manager;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.Iterator;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ailk.ecsp.core.DataRepository;
import com.ailk.ecsp.mybatis.mapper.PackMapper;
import com.ailk.ecsp.mybatis.model.Pack;

@Component
public class PackManagerImpl implements PackManager{

	protected static Logger log = LoggerFactory.getLogger(PackManagerImpl.class);

	@Autowired
	private PackMapper packMapper;
	
	/**
	 * 初始化所有包
	 */
	public void initialize(){
		
		List<Pack> list = packMapper.queryAllPacks();
		for (Iterator<Pack> iterator = list.iterator(); iterator.hasNext();) {
			Pack pack = (Pack) iterator.next();
			DataRepository.getInstence().addPack(pack);
			URLClassLoader loader = createClassLoader(pack);
			if(loader!=null){
				DataRepository.getInstence().addPackClassLoader(pack.getPackCode(), loader);
			}
		}
	}
	
	public void reloadAllPack(){
		DataRepository.getInstence().getAllPackClassLoaders().clear();
		DataRepository.getInstence().clearPack();
		initialize();
	}
	
	public int reloadPack(String packCode){
		try{
			Pack pack = packMapper.findPack(packCode);
			if(pack==null){
				log.error("","包不存在，请在数据库中进行配置！");
				return 1;
			}
			DataRepository.getInstence().delPack(packCode);
			DataRepository.getInstence().addPack(pack);
			URLClassLoader loader = createClassLoader(pack);
			if (null != loader) {
				DataRepository.getInstence().delPackClassLoader(packCode);
				DataRepository.getInstence().addPackClassLoader(packCode, loader);
				return 0;
			}
		}catch (Exception e) {
			log.error("创建 URLClassLoader失败,packCode:"+packCode, e);
		}
		return 2;
	}
	
	public URLClassLoader createClassLoader(Pack pack){
		if(pack!=null){
			String libPath = DataRepository.getInstence().getWebParam().getServiceLibPath(); 
			return createClassLoader(libPath + pack.getPackPath(), pack.getPackCode());
		}
		return null;
	}
	
	public URLClassLoader createClassLoader(String packCode){
		Pack pack = DataRepository.getInstence().getPack(packCode);
		return createClassLoader(pack);
	}
	
	public URLClassLoader createClassLoader(String clazzPath,String packCode){
		URLClassLoader loader = null;
		log.debug("###PackPath:{} ",clazzPath);
		try{
			URL[] url = new URL[1];
			url[0] = new URL("File:"+clazzPath);
			loader = new URLClassLoader(url, Thread.currentThread().getContextClassLoader());
		}catch (Exception e) {
			log.error("创建 URLClassLoader失败,"+clazzPath, e);
		}
		if(loader==null){
			log.error("##{}不存在",clazzPath);
		}
		return loader;
	}

	private void extracted(String clazzPath) {
		{
			log.error(clazzPath + "不存在");
		}
	}
	
}
