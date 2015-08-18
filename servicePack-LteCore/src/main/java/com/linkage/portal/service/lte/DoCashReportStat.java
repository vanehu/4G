package com.linkage.portal.service.lte;

/**
 * 统计维度
 * 
 * @author liusd
 *
 */
public class DoCashReportStat {
    public enum Stat{
        StatArea("by_area", "AREA_CODE","AREA_NAME", "按地区"), 
        StatDate("by_date", "CREATE_DATE","TO_CHAR(CREATE_DATE, 'YYYY-MM')", "按时间"), 
        StatChannel("by_channel", "AGENT_ID","AGENT_NAME", "按渠道");

        private String statKey;
        private String statIdVal;
        private String statIdName;
        private String statDesc;

        private Stat(String key, String idVal,String idName,String desc) {
            this.statKey = key;
            this.statIdVal = idVal;
            this.statIdName = idName;
            this.statDesc = desc;
        }

        public String statIdVal() {
            return this.statIdVal;
        }

        public String statKey() {
            return this.statKey;
        }
        public String statIdName() {
            return this.statIdName;
        }
        public String statDesc() {
            return this.statDesc;
        }
    }

    public static String getIdValByKey(String key) {
        for (Stat e : Stat.values()) {
            if (e.statKey.equals(key)) {
                return e.statIdVal();
            }
        }
        return "";
    }
    public static String getIdNameByKey(String key) {
        for (Stat e : Stat.values()) {
            if (e.statKey.equals(key)) {
                return e.statIdName();
            }
        }
        return "";
    }
    public static String getDescByKey(String key) {
        for (Stat e : Stat.values()) {
            if (e.statKey.equals(key)) {
                return e.statDesc();
            }
        }
        return "";
    }
}
