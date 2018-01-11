/**
 * 
 */
package com.al.lte.portal.model;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.al.ec.serviceplatform.client.DataBus;
import com.al.ec.serviceplatform.client.ResultCode;
import com.al.ecs.common.util.DateUtil;
import com.al.ecs.common.util.DigestUtils;
import com.al.ecs.common.util.ImageUtil;
import com.al.ecs.common.util.MDA;
import com.al.ecs.exception.BusinessException;
import com.al.ecs.exception.ErrorCode;
import com.al.ecs.exception.InterfaceException;
import com.al.ecs.log.Log;
import com.al.lte.portal.common.InterfaceClient;
import com.al.lte.portal.common.PortalServiceCode;

/**
 * 实名制：照片图片处理类
 * @author ZhangYu
 */
public class Photograph {
	
	private static Log log = Log.getLog(Photograph.class);

	/**base64编码的照片*/
	private String image;
	
	/**照片或这件的签名*/
	private String signature;
	
	/**SHA-1校验密钥(不对外提供setter方法)*/
	private String appSecret;
	
	/**水印内容*/
	private String context;
	
	/**备用*/
	private Object extrea;
	
	private volatile static Photograph photograph;
	
	public Photograph(){
		super();
	}
	
	public Photograph(String context){
		super();
		this.context = context;
	}
	
	public static Photograph getInstance(){
		if (photograph == null) {
			synchronized (Photograph.class) {
				if (photograph == null) {
					photograph = new Photograph();
				}
			}
		}
		photograph.setContext(MDA.WARTER_MARKER_CONEXT + " " + DateUtil.getFormatTimeString(new Date(), "yyyy/MM/dd"));
		
		return photograph;
	}
	
	public static Photograph getNewInstance(){
		return	new Photograph(MDA.WARTER_MARKER_CONEXT + " " + DateUtil.getFormatTimeString(new Date(), "yyyy/MM/dd"));
	}
	
	/**
	 * 根据密钥appSecret对image进行signature校验
	 * @param venderId 拍照仪厂商标识ID
	 * @return true:校验成功; false:校验失败
	 */
	public boolean verifySignature(String venderId){
		boolean resultFlag = false;
		this.appSecret = MDA.VENDER_SIGNATURE.get(venderId).get("appSecret");
		
		if(this.signature != null && this.signature.equalsIgnoreCase(DigestUtils.sha1ToHex(this.image + this.appSecret))){
			resultFlag = true;
		}
		if(!resultFlag){
			log.error("拍照证件签名校验结果={}，venderId={}，signature={}", resultFlag, venderId, this.signature);
		}
		
		return resultFlag;
	}
	
	/**
	 * 添加文字水印
	 * @param base64ImageStr 以base64编码的图片字符串(包含data:image/png;base64,头信息)
	 * @param context 水印文字内容
	 * @return 添加水印后的图片byte数组
	 * @throws IOException
	 */
	public byte[] addTextWatermark(String venderId) throws IOException{
		String imageFormat = ImageUtil.getImageFormat(this.image);
		
		if(imageFormat != null){
			this.setPhotograph(ImageUtil.filterBase64ImageStr(this.image, imageFormat));
		} else{
			imageFormat = MDA.VENDER_SIGNATURE.get(venderId).get("imageFormat");
		}
		byte[] srcImage = Base64.decodeBase64(this.image);

		return ImageUtil.addTextWatermark(this.context, srcImage, imageFormat);
	}
	
	/**
	 * 添加文字水印
	 * @param base64ImageStr 以base64编码的图片字符串(包含data:image/png;base64,头信息)
	 * @param context 水印文字内容
	 * @return 添加水印后的图片，以base64编码的字符串
	 * @throws IOException
	 */
	public String addTextWatermarkMethod(String venderId) throws IOException{
		String imageFormat = ImageUtil.getImageFormat(this.image);
		
		if(imageFormat != null){
			this.image = ImageUtil.filterBase64ImageStr(this.image, imageFormat);
		} else{
			imageFormat = MDA.VENDER_SIGNATURE.get(venderId).get("imageFormat");
		}
		byte[] srcImage = Base64.decodeBase64(this.image);

		return Base64.encodeBase64String(ImageUtil.addTextWatermark(this.context, srcImage, imageFormat));
	}
	
	/**
	 * 调后台接口上传实名制拍照证件
	 * @throws Exception 
	 * @throws IOException 
	 * @throws InterfaceException 
	 */
	public Map<String, Object> uploadCustCertificate(Map<String, Object> param, SessionStaff sessionStaff) throws BusinessException, InterfaceException, IOException, Exception{	
		Map<String, Object> resultMap = new HashMap<String, Object>();
		DataBus db = InterfaceClient.callService(param, PortalServiceCode.INTF_UPLOAD_IMAGE, null, sessionStaff);
		try{
			if (ResultCode.R_SUCC.equals(StringUtils.defaultString(db.getResultCode()))) {
				resultMap = (Map<String, Object>)db.getReturnlmap();
				resultMap.put("code", ResultCode.R_SUCCESS);
			} else {
				resultMap.put("code",  ResultCode.R_FAIL);
				resultMap.put("msg", db.getResultMsg());
			}
		}catch(Exception e){
			log.error("门户处理营业受理后台的service/intf.fileOperateService/upLoadPicturesFileToFtp服务返回的数据异常", e);
			throw new BusinessException(ErrorCode.UPLOAD_CUST_CERTIFICATE, param, db.getReturnlmap(), e);
		}
		
		return resultMap;
	}
	
	public String imageResize(){
		String imageFormat = MapUtils.getString(MDA.IE8_COMPRESS_CONFIG, "COMPRESS_FORMAT", "jpeg");
		int height = MapUtils.getIntValue(MDA.IE8_COMPRESS_CONFIG, "COMPRESS_HEIGHT", 300);
		int width = MapUtils.getIntValue(MDA.IE8_COMPRESS_CONFIG, "COMPRESS_WIDTH", 400);
		return this.imageResize(imageFormat, height, width);
	}
	
	public String imageResize(String imageFormat, int height, int width){
		try {
			if(StringUtils.isBlank(imageFormat)){
				imageFormat = ImageUtil.getImageFormat(this.image);
				imageFormat = StringUtils.isBlank(imageFormat) ? "jpeg" : imageFormat;
			}
			if(StringUtils.isNotBlank(ImageUtil.getImageFormat(this.image))){
				this.image = StringUtils.substring(this.image, StringUtils.indexOf(this.image, ",") + 1);
			}
			
			byte[] srcImageBytes = Base64.decodeBase64(this.image);
			byte[] scaledImageBytes = ImageUtil.imageResize(srcImageBytes, imageFormat, height, width);
			return Base64.encodeBase64String(scaledImageBytes);
		} catch (IOException ioe) {
			log.error("图片压缩异常，异常信息：", ioe);
			return null;
		}
	}

	public String getPhotograph() {
		return image;
	}
	public void setPhotograph(String photograph) {
		this.image = photograph;
	}
	public String getSignature() {
		return signature;
	}
	public void setSignature(String signature) {
		this.signature = signature;
	}
	public String getAppSecret() {
		return appSecret;
	}
	public String getContext() {
		return context;
	}
	public void setContext(String context) {
		this.context = context;
	}
	public Object getExtrea() {
		return extrea;
	}
	public void setExtrea(Object extrea) {
		this.extrea = extrea;
	}
}
