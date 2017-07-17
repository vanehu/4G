package com.al.lte.portal.common.print.bill;

import java.util.List;

/**
 * 表格
 * @author neil
 *
 */
public class Table {

	/**
	 * 表格格式
	 */
	public TableFormat tableFormat;
	
	/**
	 * 行定义
	 */
	public List<RowDefine> rowDefineList;
	
	/**
	 * 列定义
	 * <br>协议中拼写错误
	 */
	public List<ColumnDefine> columnDefineList;
	
	/**
	 * 单元格
	 */
	public List<CellInfo> cellInfoList;

	public TableFormat getTableFormat() {
		return tableFormat;
	}

	public void setTableFormat(TableFormat tableFormat) {
		this.tableFormat = tableFormat;
	}

	public List<RowDefine> getRowDefineList() {
		return rowDefineList;
	}

	public void setRowDefineList(List<RowDefine> rowDefineList) {
		this.rowDefineList = rowDefineList;
	}

	public List<ColumnDefine> getColumnDefineList() {
		return columnDefineList;
	}

	public void setColumnDefineList(List<ColumnDefine> columnDefineList) {
		this.columnDefineList = columnDefineList;
	}

	public List<CellInfo> getCellInfoList() {
		return cellInfoList;
	}

	public void setCellInfoList(List<CellInfo> cellInfoList) {
		this.cellInfoList = cellInfoList;
	}
}
