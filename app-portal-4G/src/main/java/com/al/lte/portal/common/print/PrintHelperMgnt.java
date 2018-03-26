package com.al.lte.portal.common.print;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.al.ecs.log.Log;
import com.al.lte.portal.common.SysConstant;

public class PrintHelperMgnt {
	private final static Log log = Log.getLog(PrintHelperMgnt.class);
    private static Map mapPrintHelpers = new HashMap();
    
	/**
	 * 系统启动缓存模板文件
	 * @param moduleFileNames
	 */
	public static void initPrintHelperMgnt(List<String> moduleFileNames) {
		try {
			for (String moduleFileName : moduleFileNames) {
				PdfPrintHelper retHelper = (PdfPrintHelper) mapPrintHelpers.get(moduleFileName);
				if (retHelper == null) {
					retHelper = new PdfPrintHelper(moduleFileName, SysConstant.isAutoPrint, 0, 0);
					mapPrintHelpers.put(moduleFileName, retHelper);
					log.info("缓存模板文件 [" + moduleFileName + " ] 成功.");
				}
			}
		} catch (Exception exp) {
			log.error("缓存模板文件失败!");
		}
	}
    
    /**
     * 初始化PrintHelperMgnt
     */
    public static void resetPrintHelperMgnt(){
        mapPrintHelpers.clear();//清空缓存的PrintHelpers
    }
    
    /**
     * 获取Jasper模板对应的printHelper
     * 
     * @param strJasperFileName
     * @return
     * @throws Exception
     */
    public static PdfPrintHelper getPrintHelper(String strJasperFileName, int pageWidth, int pageHeight) throws Exception{
        PdfPrintHelper retHelper = (PdfPrintHelper)mapPrintHelpers.get(strJasperFileName);
        if(retHelper == null){
            retHelper = new PdfPrintHelper(strJasperFileName,SysConstant.isAutoPrint, pageWidth, pageHeight);
            mapPrintHelpers.put(strJasperFileName, retHelper);
        }
        return retHelper;
    }
    
    public Object getJasperInfo(){
        ArrayList obj = new ArrayList();
        Iterator iterator = mapPrintHelpers.keySet().iterator();
        while (iterator.hasNext()) {
            Object key = iterator.next();
            String strMsg = null;
            PdfPrintHelper retHelper = (PdfPrintHelper)mapPrintHelpers.get(key);
            strMsg = "       模板：" + retHelper.m_vJasperFileName + ";   大小：" + retHelper.byteJasperFile.length;
            obj.add(strMsg);
        }
        return obj;
    }
}
