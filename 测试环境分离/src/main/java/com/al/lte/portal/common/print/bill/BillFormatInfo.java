package com.al.lte.portal.common.print.bill;

import java.util.List;

/**
 * 帐单类信息组
 * @author neil
 *
 */
public class BillFormatInfo {

	/**
	 * 纸张宽度（单位：毫米）
	 */
	public int paperWidth;
	
	/**
	 * 纸张高度（单位：毫米）
	 */
	public int paperHeight;
	
	/**
	 * 页列表
	 */
	public List<SheetInfo> sheetInfoList;

	public int getPaperWidth() {
		return paperWidth;
	}

	public void setPaperWidth(int paperWidth) {
		this.paperWidth = paperWidth;
	}

	public int getPaperHeight() {
		return paperHeight;
	}

	public void setPaperHeight(int paperHeight) {
		this.paperHeight = paperHeight;
	}

	public List<SheetInfo> getSheetInfoList() {
		return sheetInfoList;
	}

	public void setSheetInfoList(List<SheetInfo> sheetInfoList) {
		this.sheetInfoList = sheetInfoList;
	}

}
