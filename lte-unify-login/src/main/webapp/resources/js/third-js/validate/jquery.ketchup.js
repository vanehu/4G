/*
  jQuery Ketchup Plugin - Tasty Form Validation
  ---------------------------------------------
  
  Version 0.3.2 - 31. Jan 2011
    - Fixed another IE problem (by https://github.com/philippbosch)
  Version 0.3.1 - 12. Jan 2011
    - Check if error-container exists (by Emil Marashliev)
    - Make it work in IE6/7 (by https://github.com/hellokingdom)
  Version 0.3   - 06. Jan 2011
    - Rewritten from scratch
  Version 0.1   - 12. Feb 2010
    - Initial release
  
  Copyright (c) 2011 by Sebastian Senf:
    http://mustardamus.com/
    http://usejquery.com/
    http://twitter.com/mustardamus

  Dual licensed under the MIT and GPL licenses:
    http://www.opensource.org/licenses/mit-license.php
    http://www.gnu.org/licenses/gpl.html

  Demo: http://demos.usejquery.com/ketchup-plugin/
  Repo: http://github.com/mustardamus/ketchup-plugin
*/
/**
 * 此插件已被我修改过 
 */
(function($) {
  $.ketchup = {
    defaults: {
	  delimit           : ",",                                   //参数分割符
      attribute           : 'data-validate',                //look in that attribute for an validation string
      validateIndicator   : 'validate',                     //in the validation string this indicates the validations eg validate(required)
      eventIndicator      : 'on',                           //in the validation string this indicates the events when validations get fired eg on(blur)
      validateEvents      : 'blur',                         //the default event when validations get fired on every field
      bindElement    : null,//如果不是submit提交，则为当前按钮提交元素
      bindElementByClass : null, //根据类名绑定元素
	  bindEvent:"click",
      targetPosition  : "leftdown", // leftdown,rightdown,centerdown,centerup
	  validateElements    : ['input', 'textarea', 'select'],//check this fields in the form for a validation string on the attribute
      createErrorContainer: null,                           //function to create the error container (can also be set via $.ketchup.createErrorContainer(fn))
      showErrorContainer  : null,                           //function to show the error container (can also be set via $.ketchup.showErrorContainer(fn))
      hideErrorContainer  : null,                           //function to hide the error container (can also be set via $.ketchup.hideErrorContainer(fn))
      addErrorMessages    : null,                            //function to add error messages to the error container (can also be set via $.ketchup.addErrorMessages(fn))
      removeErrorContainer:null,							// remove all error container
      hideAllErrorContainer:null// hide all error container
    },
    dataNames: {
      validationString    : 'ketchup-validation-string',
      validations         : 'ketchup-validations',
      events              : 'ketchup-events',
      elements            : 'ketchup-validation-elements',
      container           : 'ketchup-container'
    },
    validations           : {},
    helpers               : {},
    
    
    validation: function() {
      var message, func,
          arg1 = arguments[1];
      
      if(typeof arg1 == 'function') {
        func    = arg1;
      } else {
        message = arg1;
        func    = arguments[2];
      }
          
      this.validations[arguments[0]] = {
        message: message,
        func   : func,
        init   : arguments[3] || function(form, el) {}
      };
      
      return this;
    },
    
    
    message: function(name, message) {
      this.addMessage(name, message);
      return this;
    },
    
    
    messages: function(messages) {
      for(name in messages) {
        this.addMessage(name, messages[name]);
      }
      
      return this;
    },
    
    
    addMessage: function(name, message) {
      if(this.validations[name]) {
        this.validations[name].message = message;
      }
    },
    
    
    helper: function(name, func) {
      this.helpers[name] = func;
      return this;
    },
    
    
    init: function(form, options, fields) {      
          this.options = options;
      var self         = this,
          valEls       = this.initFunctions().initFields(form, fields);
      
      valEls.each(function() {
        var el = $(this);
        
        self.bindValidationEvent(form, el)
            .callInitFunctions(form, el);
      });
          
      form.data(this.dataNames.elements, valEls);
      this.bindFormSubmit(form);
	  this.bindFormReset(form);
    },
    
    
    initFunctions: function() {
      var opt       = this.options,
          initFuncs = [
                        'createErrorContainer',
                        'showErrorContainer',
                        'hideErrorContainer',
                        'addErrorMessages',
                        'removeErrorContainer',
                        'hideAllErrorContainer'
                      ];

      for(var f = 0; f < initFuncs.length; f++) {
        var funcName = initFuncs[f];
    
        if(!opt[funcName]) {
          opt[funcName] = this[funcName];
        }
      }
      
      return this;
    },
    
    
    initFields: function(form, fields) {
      var self      = this,
          dataNames = this.dataNames,
          valEls    = $(!fields ? this.fieldsFromForm(form) : this.fieldsFromObject(form, fields));
      
      valEls.each(function() {
        var el   = $(this),
            vals = self.extractValidations(el.data(dataNames.validationString), self.options.validateIndicator);
        
        el.data(dataNames.validations, vals);
      });
      
      return valEls;
    },
    
    
    callInitFunctions: function(form, el) {
      var vals = el.data(this.dataNames.validations);
      
      for(var i = 0; i < vals.length; i++) {
        vals[i].init.apply(this.helpers, [form, el]);
      }
    },
    
    
    fieldsFromForm: function(form) {
      var self      = this,
          opt       = this.options,
          dataNames = this.dataNames,
          valEls    = opt.validateElements,
          retArr    = [];
          valEls    = typeof valEls == 'string' ? [valEls] : valEls;
      
      for(var i = 0; i < valEls.length; i++) {
        var els = form.find(valEls[i] + '[' + opt.attribute + '*=' + opt.validateIndicator + ']');
        
        els.each(function() {
          var el     = $(this),
              attr   = el.attr(opt.attribute),
              events = self.extractEvents(attr, opt.eventIndicator);

          el.data(dataNames.validationString, attr).data(dataNames.events, events ? events : opt.validateEvents);
        });
        
        retArr.push(els.get());
      } 
      
      return this.normalizeArray(retArr);
    },
    
    
    fieldsFromObject: function(form, fields) {
      var opt       = this.options,
          dataNames = this.dataNames,
          retArr    = [];
      
      for(s in fields) {
        var valString, events;
        
        if(typeof fields[s] == 'string') {
          valString = fields[s];
          events    = opt.validateEvents;
        } else {
          valString = fields[s][0];
          events    = fields[s][1];
        }
        
        var valEls    = form.find(s);
            valString = this.mergeValidationString(valEls, valString);
            events    = this.mergeEventsString(valEls, events);
        
        valEls.data(dataNames.validationString, opt.validateIndicator + '(' + valString + ')')
              .data(dataNames.events, events);

        retArr.push(valEls.get());
      }
      
      return this.normalizeArray(retArr);
    },
    
    
    mergeEventsString: function(valEls, events) {
      var oldEvents = valEls.data(this.dataNames.events),
          newEvents = '';
      
      if(oldEvents) {
        var eveArr = oldEvents.split(' ');
        
        for(var i = 0; i < eveArr.length; i++) {
          if(events.indexOf(eveArr[i]) == -1) {
            newEvents += ' ' + eveArr[i];
          }
        }
      }
      
      return $.trim(events + newEvents);
    },
    
    
    mergeValidationString: function(valEls, newValString) {
      var opt          = this.options,
          valString    = valEls.data(this.dataNames.validationString),
          buildValFunc = function(validation) {
                           var ret = validation.name;
                           
                           if(validation.arguments.length) {
                             ret = ret + '(' + validation.arguments.join(',') + ')';
                           }
                           
                           return ret;
                         },
          inVals       = function(valsToCheck, val) {
                           for(var i = 0; i < valsToCheck.length; i++) {
                             if(valsToCheck[i].name == val.name) {
                               return true;
                             }
                           }
                         };
      
      if(valString) {
        var newVals      = this.extractValidations(opt.validateIndicator + '(' + newValString + ')', opt.validateIndicator),
            oldVals      = this.extractValidations(valString, opt.validateIndicator);
            newValString = '';
        
        for(var o = 0; o < oldVals.length; o++) {
          newValString += buildValFunc(oldVals[o]) + ',';
        }
        
        for(var n = 0; n < newVals.length; n++) {
          if(!inVals(oldVals, newVals[n])) {
            newValString += buildValFunc(newVals[n]) + ',';
          }
        }
      }
      
      return newValString;
    },
    
    
    bindFormSubmit: function(form) {
      var self = this,
          opt  = this.options;
	  if(opt.bindElement){
		  var bindEvent= !!opt.bindEvent?opt.bindEvent:"click";
		  if(typeof opt.bindElement=="string"){
			  opt.bindElement=opt.bindElement.indexOf("#")>=0?opt.bindElement:("#"+opt.bindElement);
			  opt.bindElement=$(opt.bindElement);
		  }
		  opt.bindElement.unbind(bindEvent).bind(bindEvent,function(event){
			  event.preventDefault();
			  var result=self.allFieldsValid(form, true);
			  //如果提供了事件对象，则这是一个非IE浏览器
			  if (event.stopPropagation){
				//因此它支持W3C的 stopPropagation()方法
				event.stopPropagation();
			  } else{
				//否则，我们需要使用IE的方式来取消事件冒泡
				event.cancelBubble = true;
			  }
			  return result;
		  });
	  }else if(opt.bindElementByClass){
		  var bindEvent= !!opt.bindEvent?opt.bindEvent:"click";
		  if(typeof opt.bindElementByClass=="string"){
			  opt.bindElementByClass=opt.bindElementByClass.indexOf(".")>=0?opt.bindElementByClass:("."+opt.bindElementByClass);
			  opt.bindElementByClass=$(opt.bindElementByClass);
		  }
		  opt.bindElementByClass.unbind(bindEvent).bind(bindEvent,function(event){
			  event.preventDefault();
			  var result=self.allFieldsValid(form, true);
			  //如果提供了事件对象，则这是一个非IE浏览器
			  if (event.stopPropagation){
				//因此它支持W3C的 stopPropagation()方法
				event.stopPropagation();
			  } else{
				//否则，我们需要使用IE的方式来取消事件冒泡
				event.cancelBubble = true;
			  }
			  return result;
		  });
	  } else {
		  form.submit(function() {
			return self.allFieldsValid(form, true);
		  });
	  }
    },
    
    bindFormReset: function(form) {
		var self = this;
		form.find("input:reset").click(function() {
			form.data(self.dataNames.elements).each(function() {    
				$(this).removeClass("ketchup-input-error");  
			});
		});
		$('.ketchup-error').each(function() {
    		$(this).css({"opacity": 0}).hide();
    	});
    },
    allFieldsValid: function(form, triggerEvents) {
      var self  = this,
          tasty = true;
      
      form.data(this.dataNames.elements).each(function() {          
        var el = $(this);
        
        if(self.validateElement(el, form) != true) {
          if(triggerEvents == true) {
            self.triggerValidationEvents(el);
          }
          
          tasty = false;
        }
      });

      form.trigger('formIs' + (tasty ? 'Valid' : 'Invalid'), [form]);
      
      return tasty;
    },
    
    
    bindValidationEvent: function(form, el) {      
      var self      = this,
          opt       = this.options,
          dataNames = this.dataNames,
          events    = el.data(dataNames.events).split(' ');
      for(var i = 0; i < events.length; i++) {
        el.bind('ketchup.' + events[i], function(event) {
        	var tasty     = self.validateElement(el, form),
        	container = el.data(dataNames.container);
        	if(tasty != true) {
	    		if(!container) {
	    			container = opt.createErrorContainer(form, el,event.namespace);
	    			el.data(dataNames.container, container);
	    		}                   	 
	    		opt.addErrorMessages(form, el, container, tasty);
				el.addClass("ketchup-input-error"); 
				
				if(event.namespace !="blur"){
					opt.showErrorContainer(form, el, container);
				} else {
					el.one("click",function(){
						 opt.showErrorContainer(form, el, container);
					});
				}
				el.one("blur",function(){
					opt.hideErrorContainer(form, el, container);
				});
          } else {
            if(container){
				el.removeClass("ketchup-input-error");  
              opt.hideErrorContainer(form, el, container);
            }
          }
        });
        
        this.bindValidationEventBridge(el, events[i]);
      }
      
      return this;
    },
    
    
    bindValidationEventBridge: function(el, event) {
      el.bind(event, function() {
        el.trigger('ketchup.' + event);
      });
    },
    
    
    validateElement: function(el, form) {
      var tasty = [],
          vals  = el.data(this.dataNames.validations),
          args  = [form, el, ($.trim(el.val()))];

      for(var i = 0; i < vals.length; i++) {
        if(!vals[i].func.apply(this.helpers, args.concat(vals[i].arguments))) {
          tasty.push(vals[i].message);
        }
      }
      
      form.trigger('fieldIs' + (tasty.length ? 'Invalid' : 'Valid'), [form, el]);
      
      return tasty.length ? tasty : true;
    },
    
    
    elementIsValid: function(el) {
      var dataNames = this.dataNames;
      
      if(el.data(dataNames.validations)) {
        var form = el.parentsUntil('form').last().parent();
		var  isValid=(this.validateElement(el, form) == true ? true : false);
			if(isValid){
				el.removeClass("ketchup-input-error");  
			} else {
				el.addClass("ketchup-input-error");  
			}
			return isValid;
      } else if(el.data(dataNames.elements)) {
        return this.allFieldsValid(el);
      }
      
      return null;
    },
    
    
    triggerValidationEvents: function(el) {
      var events = el.data(this.dataNames.events).split(' ');
      
      for(var e = 0; e < events.length; e++) {
        el.trigger('ketchup.' + events[e]);
      }
    },
    
    
    extractValidations: function(toExtract, indicator) { //I still don't know regex
      var fullString   = toExtract.substr(toExtract.indexOf(indicator) + indicator.length + 1),
          tempStr      = '',
          tempArr      = [],
          openBrackets = 0,
          validations  = [];
      
      for(var i = 0; i < fullString.length; i++) {
        switch(fullString.charAt(i)) {
          case '(':
            tempStr += '(';
            openBrackets++;
            break;
          case ')':
            if(openBrackets) {
              tempStr += ')';
              openBrackets--;
            } else {
              tempArr.push($.trim(tempStr));
            }
            break;
          case ',':
            if(openBrackets) {
              tempStr += ',';
            } else {
              tempArr.push($.trim(tempStr));
              tempStr = '';
            }
            break;
          default:
            tempStr += fullString.charAt(i);
            break;
        }
      }
      
      for(var v = 0; v < tempArr.length; v++) {
        var hasArgs = tempArr[v].indexOf('('),
            valName = tempArr[v],
            valArgs = [];
            
        if(hasArgs != -1) {
          valName = $.trim(tempArr[v].substr(0, hasArgs));
		  var valArgStr=tempArr[v].substr(valName.length);
		  if(this.defaults.delimit===","){
			  if(valArgStr.indexOf("^") >0 && valArgStr.indexOf("$")>0){
				   valArgs = $.map(tempArr[v].substr(valName.length+1).split("$"), function(n,i) {
					   if(i==0){
						   var j=n.indexOf("^");
						   if((j+1) !=n.indexOf("\\")){
							   n=n.substring(0,j+1)+"\\"+n.substring(j+1);
						   }
						   return $.trim(n+"$");
					   } else {
						   return  $.trim(n.replace('(', '').replace(')', ''));
					   }
				  });
			  } else {
				  valArgs = $.map(tempArr[v].substr(valName.length).split(this.defaults.delimit), function(n) {
					return $.trim(n.replace('(', '').replace(')', ''));
				  });
			  }
		  }else {
			  valArgs = $.map(valArgStr.split(this.defaults.delimit), function(n) {
				return $.trim(n.replace('(', '').replace(')', ''));
			  });
		  }
        }
        //'required:提示信息'
        var valNameArray = valName.split(":");
        valName=valNameArray[0];
        var valFunc = this.validations[valName];
 
        if(valFunc && valFunc.message) {
          var message = valFunc.message;
          //扩展自定义提示信息
          if(valNameArray[1]){
        	  message =valNameArray[1];
          }
          for(var a = 1; a <= valArgs.length; a++) {
            message = message.replace('{arg' + a + '}', valArgs[a - 1]);
          }
          
          validations.push({
            name     : valName,
            arguments: valArgs,
            func     : valFunc.func,
            message  : message,
            init     : valFunc.init
          });
        }
      }
      
      return validations;
    },
    
    
    extractEvents: function(toExtract, indicator) {
      var events = false,
          pos    = toExtract.indexOf(indicator + '(');
      
      if(pos != -1) {
        events = toExtract.substr(pos + indicator.length + 1).split(')')[0];
      }

      return events;
    },
    
    
    normalizeArray: function(array) {
      var returnArr = [];
      
      for(var i = 0; i < array.length; i++) {
        for(var e = 0; e < array[i].length; e++) {
          if(array[i][e]) {
            returnArr.push(array[i][e]);
          }
        }
      }
      
      return returnArr;
    },
    
    
    createErrorContainer: function(form, el,eventName) {
      if(typeof form == 'function') {
        this.defaults.createErrorContainer = form;
        return this;
      } else {
		var elOffset = el.offset(); 
		var leftTip=elOffset.left;
		var topTip= elOffset.top;
		var sw=Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
		if(this.targetPosition=="leftdown"){
				leftTip=(elOffset.left + el.outerWidth()+100)>sw?elOffset.left + el.outerWidth()/2-50: elOffset.left + el.outerWidth()- 20;
		} else if(this.targetPosition=="rightdown"){
				leftTip=elOffset.left > el.outerWidth()?(elOffset.left-el.outerWidth()+50):elOffset.left/2-20;
		}else if(this.targetPosition=="centerdown" || this.targetPosition=="centerup"){
				leftTip=elOffset.left +el.outerWidth()/20-10;
		}
		if(this.targetPosition.indexOf("up")>0){
				topTip=topTip+el.outerHeight()+50;
		}
		if(leftTip<0) {
			leftTip=5;
		}
		var atrType=el.attr("type");
		if(atrType=="radio" || atrType=="checkbox"){
			var num=$("input[type="+atrType+"][name='"+el.attr("name")+"']",form).size();
			leftTip=leftTip-20*num;
		}
		if(this.targetPosition.indexOf("up")>0){
			if(eventName=="blur"){
				return $('<div class="ketchup-error"><span class='+this.targetPosition+'></span><ul></ul></div>')
				.css({
						top : topTip,
						left: leftTip,
						opacity: 0,
						display: "none"
			 	}).appendTo('body');
			} else {
				return $('<div class="ketchup-error"><span class='+this.targetPosition+'></span><ul></ul></div>')
						.css({
								top : topTip,
								left: leftTip
					 	}).appendTo('body');
			}
		} else {
			if(eventName=="blur"){
				return $('<div class="ketchup-error"><ul></ul><span class='+this.targetPosition+'></span></div>')
				.css({
					top : topTip,
					left: leftTip,
					opacity: 0,
					display: "none"
				}).appendTo('body');
			} else {
				return $('<div class="ketchup-error"><ul></ul><span class='+this.targetPosition+'></span></div>')
				.css({
					top : topTip,
					left: leftTip
				}).appendTo('body');	
			}

		
		}
      }

    },
    
    
    showErrorContainer: function(form, el, container) {
      if(typeof form == 'function') {
        this.defaults.showErrorContainer = form;
        return this;
      } else {
		  if(el.attr("type")=="radio" || el.attr("type")=="checkbox"){
			  $('.ketchup-error').each(function() {
				  if($(this).index() !=container.index())
					  $(this).hide();
		       });
		  }
		  if(this.targetPosition.indexOf("up")>0){
			  	container.show().animate({
					 top    : el.offset().top +el.outerHeight()+1,
					opacity: 1
				  }, 'fast');
		  } else {
			  container.show().animate({
					 top    : el.offset().top - container.height(),
					opacity: 1
				  }, 'fast');
		  }

      }
    },
    
    
    hideErrorContainer: function(form, el, container) {
      if(typeof form == 'function') {
        this.defaults.hideErrorContainer = form;
        return this;
      } else {
    	  if(el.attr("type")=="radio" || el.attr("type")=="checkbox"){
			  $('.ketchup-error').each(function() {
				  if($(this).index() !=container.index())
					  $(this).hide();
		         });
		  }
		   if(this.targetPosition.indexOf("up")>0){
			  	container.show().animate({
					 top    : el.offset().top +container.height(),
					opacity: 0
				  }, 'fast', function() {
				  container.hide();
				});
		  } else {
				container.animate({
				  top    : el.offset().top,
				  opacity: 0
				}, 'fast', function() {
				  container.hide();
				});
		  }
      }
    },
    
    removeErrorContainer:function(form){
    	var self = this;
    	if(self.dataNames && self.dataNames.elements && $.isArray(self.dataNames.elements)){
    		if(form.data(self.dataNames.elements)){
        		form.data(self.dataNames.elements).each(function() { 
        			$(this).data(self.dataNames.container,null);
        			$(this).removeClass("ketchup-input-error");  
        		});
    		}
    	}
    	$('.ketchup-error').each(function() {
    		$(this).remove();
    	});
    },
    hideAllErrorContainer:function(form){
    	var self = this;
    	if(self.dataNames && self.dataNames.elements && $.isArray(self.dataNames.elements)){
    		if(form.data(self.dataNames.elements)){
        		form.data(self.dataNames.elements).each(function() { 
        			$(this).removeClass("ketchup-input-error");  
        		});
    		}
    	}
    	$('.ketchup-error').each(function() {
    		$(this).css({"opacity": 0}).hide();
    	});
    },
    
    addErrorMessages: function(form, el, container, messages) {
      if(typeof form == 'function') {
        this.defaults.addErrorMessages = form;
        return this;
      } else {
        var list = container.children('ul');
        
        list.html('');
        
        for(var i = 0; i < messages.length; i++) {
        	$('<li>'+messages[i]+'</li>').appendTo(list);
        }
      }
    }
  };
  
  
  $.fn.ketchup = function(options, fields) {
    var el = $(this);
    
    if(typeof options == 'string') {
      switch(options) {
        case 'validate':
          $.ketchup.triggerValidationEvents(el);
          break;
        case 'isValid':
          return $.ketchup.elementIsValid(el);
          break;
      }
    } else {
      this.each(function() {
        $.ketchup.init(el, $.extend({}, $.ketchup.defaults, options), fields);
      });
    }
    
    return this;
  };
})(jQuery);