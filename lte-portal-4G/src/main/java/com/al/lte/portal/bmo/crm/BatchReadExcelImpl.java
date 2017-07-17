package com.al.lte.portal.bmo.crm;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import com.al.ecs.log.Log;
import com.al.lte.portal.model.BatchExcelTask;

/**
 * 多线程同步解析Excel
 * @author ZhangYu 2016-04-10
 * @update 2017-03-13
 *
 */
public class BatchReadExcelImpl implements BatchReadExcel, Runnable {
	private static Log log = Log.getLog(BatchReadExcelImpl.class);
	
	private volatile BatchExcelTask batchExcelTask;
	
	private volatile Sheet sheet = null;//这是一个表单
	private volatile Row row = null;//Excel的一行
	private volatile boolean cellIsNull = true;//用于跳过Excel没有数据的空行
	private volatile String cellValue = "";//单元格的值
	private volatile Cell cellTemp = null;//这是一个单元格，用于跳过Excel没有数据的空行
	private volatile Cell cell = null;//这是一个单元格
	private volatile StringBuffer strBuffer = new StringBuffer();
	private volatile int fromIndex = 0;
	private volatile int toIndex = 0;
	private volatile int sheetIndex = 0;

	/**
	 * ReadExcel构造器
	 */
	public BatchReadExcelImpl(BatchExcelTask batchExcelTask, int fromIndex, int toIndex, int sheetIndex) {
		this.toIndex 		= toIndex;
		this.fromIndex 		= fromIndex;
		this.sheetIndex 	= sheetIndex;
		this.batchExcelTask = batchExcelTask;
	}

	//synchronized
	public void run() {
		boolean ifContinue = true;
		this.sheet = this.batchExcelTask.getWorkbook().getSheetAt(this.sheetIndex);
		for (int i = this.fromIndex == 0 ? 1 : this.fromIndex; i <= this.toIndex && ifContinue; i++) {
			row = sheet.getRow(i);
			if (row != null) {
				cellIsNull = true;
				for (int k = 0; k < this.batchExcelTask.getTotalColumns(); k++) {
					cellTemp = row.getCell(k);
					if (cellTemp != null) {
						if (this.batchExcelTask.checkExcelCellValid(cellTemp)) {
							cellIsNull = false;// 如果当前行的每一列不为空，则遍历，否则跳过该行
						}
					}
				}

				if (cellIsNull) {
					continue;
				}

				for (int j = 0; j < this.batchExcelTask.getTotalColumns(); j++) {
					strBuffer.setLength(0);
					cell = row.getCell(j);
					cellValue = this.batchExcelTask.checkExcelCellValue(cell);
					if (this.batchExcelTask.ifNeedStrictCheck(j)) {
						if (cell != null) {
							// 必填校验
							if (!this.batchExcelTask.checkExcelCellValid(cell)) {
								strBuffer.append("<br/>【第");
								strBuffer.append(i + 1);
								strBuffer.append("行，第");
								strBuffer.append((j + 1));
								strBuffer.append("列】");
								strBuffer.append(this.batchExcelTask.getColumnName(j));
								strBuffer.append("单元格为空或单元格非文本格式");
								ifContinue = this.ifErrorDataCacheOver(strBuffer) ? false : true;
								break;
							}
							// 重复校验
							if (this.batchExcelTask.ifNeedRepeatCheck(j)) {
								if (this.batchExcelTask.ifRepeat(j, cellValue)) {
									strBuffer.append("<br/>【第");
									strBuffer.append(i + 1);
									strBuffer.append("行，第");
									strBuffer.append((j + 1));
									strBuffer.append("列】");
									strBuffer.append(this.batchExcelTask.getColumnName(j));
									strBuffer.append(cellValue);
									strBuffer.append("数据重复，请检查");
									ifContinue = this.ifErrorDataCacheOver(strBuffer) ? false : true;
									break;
								}
							}
							// 正则校验
							if (this.batchExcelTask.ifNeedRegExpCheck(j)) {
								if (!this.batchExcelTask.checkCellValueRegExp(j, cellValue)) {
									strBuffer.append("<br/>【第");
									strBuffer.append(i + 1);
									strBuffer.append("行，第");
									strBuffer.append((j + 1));
									strBuffer.append("列】");
									strBuffer.append(this.batchExcelTask.getColumnName(j));
									strBuffer.append(cellValue);
									strBuffer.append("填写不符合规范，请检查");
									ifContinue = this.ifErrorDataCacheOver(strBuffer) ? false : true;
									break;
								}
							}
						} else {
							strBuffer.append("<br/>【第");
							strBuffer.append(i + 1);
							strBuffer.append("行，第");
							strBuffer.append((j + 1));
							strBuffer.append("列】");
							strBuffer.append(this.batchExcelTask.getColumnName(j));
							strBuffer.append("单元格为空或单元格非文本格式");
							ifContinue = this.ifErrorDataCacheOver(strBuffer) ? false : true;
							break;
						}
					} else if (this.batchExcelTask.ifNeedGovEntCheck(j)) {//政企必填
						if (!this.batchExcelTask.checkCellValueRegExp(j, cellValue)) {//再校验单元格的值
							strBuffer.append("<br/>【第");
							strBuffer.append(i + 1);
							strBuffer.append("行，第");
							strBuffer.append((j + 1));
							strBuffer.append("列】");
							strBuffer.append(this.batchExcelTask.getColumnName(j));
							strBuffer.append(cellValue);
							strBuffer.append("不符合填写规范，请检查");
							ifContinue = this.ifErrorDataCacheOver(strBuffer) ? false : true;
							break;
						}
					} else{//政企非必填，如果填则校验
						
					}
				}
			}
		}
		log.debug("portalBatch-批量解析Excel，[{},{}]区间解析完毕", this.fromIndex, this.toIndex);
		this.batchExcelTask.getCountDownLatch().countDown();
		log.debug("portalBatch-批量解析Excel，剩余线程数={}", this.batchExcelTask.getCountDownLatch().getCount());
	}
	
	private boolean ifErrorDataCacheOver(StringBuffer stringBuffer){
		boolean isRedLigth = this.batchExcelTask.isRedLigth();
		
		if (!isRedLigth) {
			if (stringBuffer.length() > 0) {
				this.batchExcelTask.setErrorData(stringBuffer);
			}
		}
		
		return isRedLigth;
	}
}