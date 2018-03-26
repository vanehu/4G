package com.al.lte.portal.common.print.bill;

/**
 * 列定义
 * <br>协议中错误拼写为colume_define
 * @author neil
 *
 */
public class ColumnDefine {

	/**
	 * 列号
	 */
	public int columnId;
	
	/**
	 * 列宽（单位：0。1毫米）
	 */
	public int columnWidth;

	public int getColumnId() {
		return columnId;
	}

	public void setColumnId(int columnId) {
		this.columnId = columnId;
	}

	public int getColumnWidth() {
		return columnWidth;
	}

	public void setColumnWidth(int columnWidth) {
		this.columnWidth = columnWidth;
	}
}
