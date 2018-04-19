package com.al.lte.portal.common.print.bill;

/**
 * 行定义
 * @author neil
 *
 */
public class RowDefine {

	/**
	 * 行号
	 */
	public int rowId;
	
	/**
	 * 行高（单位：0。1毫米）
	 */
	public int rowHeight;

	public int getRowId() {
		return rowId;
	}

	public void setRowId(int rowId) {
		this.rowId = rowId;
	}

	public int getRowHeight() {
		return rowHeight;
	}

	public void setRowHeight(int rowHeight) {
		this.rowHeight = rowHeight;
	}
}
