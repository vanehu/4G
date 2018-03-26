package com.al.lte.portal.common.print;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRField;

/**
 * @author Teodor Danciu (teodord@users.sourceforge.net)
 * @version $Id: ListDataSource.java,v 1.1.2.2 2006/03/15 04:44:47 quxiao Exp $
 */
public class ListDataSource implements JRDataSource {


    private Iterator   it         = null;

    private HashMap    record     = null;

    public ListDataSource(Collection collection) {
        if (collection == null)
            collection = new ArrayList();
        it = collection.iterator();
    }


    /* (non-Javadoc) 下移一条记录
     * @see net.sf.jasperreports.engine.JRDataSource#next()
     */
    public boolean next() throws JRException {
        boolean rst = it.hasNext();
        if (rst) {
            record = (HashMap) it.next();
        }
        return rst;
    }

    /**
     * 获得字段数据
     */
    public Object getFieldValue(JRField field) throws JRException {
        Object value = null;
        String fieldName = field.getName();
        value = record.get(fieldName);
        if (value ==null) value = "";
        return value;
    }

}
