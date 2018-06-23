package com.al.ecs.common.util;

import org.apache.commons.lang3.ArrayUtils;

/**
 * 数组对象工具 类 .
 * <P>
 * @author liusd
 * @version V1.0 2013-5-23
 * @createDate  2013-5-23 上午9:59:20
 * @copyRight 亚信联创电信EC研发部
 */
public class ArrayUtil {
    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(String[] srcArray, String[] compareArray, boolean isCheckAll) {
        for (String s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(int[] srcArray, int[] compareArray, boolean isCheckAll) {
        for (int s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(float[] srcArray, float[] compareArray, boolean isCheckAll) {
        for (float s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(double[] srcArray, double[] compareArray, boolean isCheckAll) {
        for (double s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(long[] srcArray, long[] compareArray, boolean isCheckAll) {
        for (long s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(char[] srcArray, char[] compareArray, boolean isCheckAll) {
        for (char s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(short[] srcArray, short[] compareArray, boolean isCheckAll) {
        for (short s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(byte[] srcArray, byte[] compareArray, boolean isCheckAll) {
        for (byte s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @return
     * @see
     */
    public static boolean contains(Object[] srcArray, Object[] compareArray, boolean isCheckAll) {
        for (Object s : compareArray) {
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 判断compareArray 数组是否在srcArray数组中存在，
     * isCheckAll=true 是必须全部存在，返回true
     * isCheckAll=false 只要一个不存就是返回false
     * @param srcArray 源数组
     * @param compareArray 比对数组
     * @param isCheckAll 全比对标识
     * @param isIgnoreCase 是否大小写区分
     * @return
     * @see
     */
    public static boolean contains(String[] srcArray, String[] compareArray, boolean isCheckAll, boolean isIgnoreCase) {
        for (String s : compareArray) {
            s = isIgnoreCase ? s.toLowerCase() : s;
            if (isCheckAll) {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            } else {
                if (!ArrayUtils.contains(srcArray, s)) {
                    return false;
                }
            }
        }
        return true;
    }
}
