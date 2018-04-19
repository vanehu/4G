package com.al.ecs.common.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.ObjectInputStream;

/**
 * 实体类的工具方法支持.
 * <P>
 * @author tangzhengyu
 *
 */
public class EntityUtil {

	public static final int BUFFER_LEN = 4096;
	private static char[] cacheByteBuffer = new char[BUFFER_LEN];
	private static boolean cacheByteBufferUsed = false;
	
	/**
	 * 从流中将二进制内容反序列化java obj.
	 * <P>
	 * @param inputStream
	 * @return Object
	 * @throws ClassNotFoundException
	 * @throws IOException
	 */
	public static Object getObject(InputStream inputStream) throws ClassNotFoundException, IOException {
		ObjectInputStream ois = null;
		try {
			ois = new ObjectInputStream(inputStream);
			Object obj = ois.readObject();
			return obj;
		} finally {
			if (ois != null) {
				ois.close();
			}
			if (inputStream != null) {
				inputStream.close();
			}
		}
	}

	/**
	 * 流转换成字符串.
	 * @param inputStream
	 * @param charset
	 * @return String
	 * @throws IOException
	 */
	public static String getString(InputStream inputStream, String charset) throws IOException {
		BufferedReader in = null;
		//char[]使用频繁,尽量使用缓存的char[],减少垃圾回收,优化无极限!
		char[] buffer = getCachedByteBuffer();
		try {
			in = new BufferedReader(new InputStreamReader(inputStream, charset));
	        StringBuilder sb = new StringBuilder();
	        
	        int len = 0;
	        while ((len = in.read(buffer)) > 0) {
	            sb.append(buffer, 0, len);
	        }
			return sb.toString();
		} finally {
			if (in != null) {
				in.close();
			}
			if (inputStream != null) {
				inputStream.close();
			}
			releaseCachedByteBuffer(buffer);
		}
	}
	
	/**
	 * 取得char[]数组,别的线程已经在用的话，只好自己new一个罗.
	 * <P>
	 * @return char[] 
	 * @author tangzhengyu
	 */
    private static synchronized char[] getCachedByteBuffer() {
        synchronized(cacheByteBuffer) {
            if (!cacheByteBufferUsed) {
            	cacheByteBufferUsed = true;
                return cacheByteBuffer;
            }
        }
        
        return new char[BUFFER_LEN];
    }

    /**
     * 是否cached的char[].
     * <P>
     * @param buffer
     */
    private static void releaseCachedByteBuffer(char[] buffer) {
        synchronized(cacheByteBuffer) {
            if (buffer == cacheByteBuffer) {
            	cacheByteBufferUsed = false;
            }
        }
    }
}
