package com.ailk.ecsp.core.manager;

import java.net.URLClassLoader;

import com.ailk.ecsp.mybatis.model.Pack;

public interface PackManager {
	
	public void initialize();
	
	public void reloadAllPack();
	
	public int reloadPack(String packCode);
	
	public URLClassLoader createClassLoader(Pack pack);
	
	public URLClassLoader createClassLoader(String packCode);
	
	public URLClassLoader createClassLoader(String clazzPath,String packCode);
	
}
