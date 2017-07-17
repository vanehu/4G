package com.al.lte.portal.common.print.bill;

import java.util.List;

/**
 * 页列表
 * @author neil
 *
 */
public class SheetInfo {

	/**
	 * 页码
	 */
	public int page;
	
	/**
	 * 块列表
	 */
	public List<BlockInfo> blockInfoList;

	public int getPage() {
		return page;
	}

	public void setPage(int page) {
		this.page = page;
	}

	public List<BlockInfo> getBlockInfoList() {
		return blockInfoList;
	}

	public void setBlockInfoList(List<BlockInfo> blockInfoList) {
		this.blockInfoList = blockInfoList;
	}
}
