/**
 * 图像处理
 */
CommonUtils.regNamespace("Image");
Image = (function() {
	
	var provinceConfigList = null;
	
	var _commonUtils = {
		_quality		: null,
		_scale			: null,
		_imageBase64	: null,
		_scaledWidth	: null,
		_scaledHeight	: null,
		_scaledFormat	: null,
		_resultImage	: null,
		
		setParams : function(scale, imageBase64, scaledFormat, quality, scaledWidth, scaledHeight){
			if(ec.util.isObj(imageBase64)){
				this._imageBase64 = imageBase64;
			}else{
				throw new Error("设置参数(原始图像)错误");
			}
			if(ec.util.isObj(scale) && scale > 0 && scale < 1){
				this._scale = scale;
			}else{
				this._scale = parseFloat(provinceConfigList[0]);
			}
			if(ec.util.isObj(quality) && quality > 0 && quality <= 1){
				this._quality = quality;
			}else{
				this._quality = parseFloat(provinceConfigList[1]);
			}
			if(ec.util.isObj(scaledFormat)){
				this._scaledFormat = scaledFormat;
			}else{
				this._scaledFormat = provinceConfigList[2];
			}
			if(ec.util.isObj(scaledHeight) && scaledHeight > 0){
				this._scaledHeight = scaledHeight;
			}else{
				this._scaledHeight = parseFloat(provinceConfigList[3]);
			}
			if(ec.util.isObj(scaledWidth) && scaledWidth > 0){
				this._scaledWidth = scaledWidth;
			}else{
				this._scaledWidth = parseFloat(provinceConfigList[4]);
			}
		},
		
		compress : function(){
			if(ec.util.isObj(this._scaledWidth) && ec.util.isObj(this._scaledHeight) && this._scaledWidth > 0 && this._scaledHeight > 0){
				this.compressByFixed();
			} else{
				this.compressByScale();
			}
		},
		
		compressByScale : function(){
			var $image = $("<img/>").prop('src', this._imageBase64);
			var originWidth = $image[0].width;
		    var originHeight = $image[0].height;

			var canvas = document.createElement("canvas");
			canvas.width = originWidth * this._scale;
			canvas.height = originHeight * this._scale;
			
			var drawer = canvas.getContext("2d");
			drawer.drawImage($image[0], 0, 0, canvas.width, canvas.height);
			this._resultImage = canvas.toDataURL(this._scaledFormat, this._quality);
		},
		
		compressByFixed : function(){
			var $image = $("<img/>").prop('src', this._imageBase64);
			var canvas = document.createElement("canvas");
			canvas.width = this._scaledWidth;
			canvas.height = this._scaledHeight;
			
			var drawer = canvas.getContext("2d");
			drawer.drawImage($image[0], 0, 0, canvas.width, canvas.height);
			this._resultImage = canvas.toDataURL(this._scaledFormat, this._quality);
		},
		
		getResult : function(){
			return this._resultImage;
		},
		
		getCompressImageByDefault : function(imageBase64){
			var isCompress = this.isNeedCompress(provinceConfigList[5] + imageBase64);
			
			if(isCompress){
				this.setParams(null, provinceConfigList[5] + imageBase64, null, null, null, null);
				this.compress();
				return this.getResult();
			}else{
				return imageBase64;
			}
		},
		
		isNeedCompress : function(imageBase64){
			var result = false;
			
			if(provinceConfigList[6] == "ON"){
				var $image = $("<img/>").prop('src', imageBase64);
				var originWidth = parseFloat($image[0].width);
			    var originHeight = parseFloat($image[0].height);
			    var thresholdWidth = parseFloat(provinceConfigList[7]);
			    var thresholdHeight = parseFloat(provinceConfigList[8]);
			    
			    if(originWidth >= thresholdWidth || originHeight >= thresholdHeight){
			    	result = true;
			    }
			}
			
			return result;
		}
	};
	
	var _init = function(){
		provinceConfigList = query.common.queryPropertiesMapValue("FACE_VERIFY_COMPRESS_CONFIG", "FACE_VERIFY_COMPRESS_" + String(OrderInfo.staff.areaId).substr(0, 3));
	};
	
	return {
		init		:_init,
		commonUtils: _commonUtils
	}
})();
$(function(){
	Image.init();
});