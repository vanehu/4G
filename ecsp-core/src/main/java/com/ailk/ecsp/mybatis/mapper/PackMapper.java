package com.ailk.ecsp.mybatis.mapper;

import java.util.List;
import java.util.Map;
import com.ailk.ecsp.mybatis.model.Pack;

public interface PackMapper {
	
	public Pack findPack(String packCode);
	
	public List<Pack> queryAllPacks();
	
	public List<Pack> queryPacksByType(String packType);
	
    public int insertPack(Pack pack);
	
    public List<Pack> queryPack(Map<String,String> param);
    
	public int queryPackCount();
	
	public int deletePack(Long packId);
	
	public int updatePack(Pack pack);
	
}