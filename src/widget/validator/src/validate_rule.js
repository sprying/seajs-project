define(function(require, exports){
	require('./jquery.validate.js');
	require('../../../common/scripts/head/base.js');
	 jQuery.validator.addMethod('noAllunderline', function (value, element) {
	        return this.optional(element) || !/^_*$/.test(value);
	    }, '不能全为下划线');
	    jQuery.validator.addMethod('noAllNumber', function (value, element) {
	        return this.optional(element) || !/^\d+$/.test(value);
	    }, '不能全为数字');
	    
	    jQuery.validator.addMethod('noAllLetter', function (value, element) {
	        return this.optional(element) || !/^[a-zA-Z]+$/.test(value);
	    }, '不能全为字母');
	    jQuery.validator.addMethod('noBlank', function (value, element) {
	        return this.optional(element) || !/\s/.test(value);
	    }, '不能包含空格');
	    jQuery.validator.addMethod('noSamevalue', function (value, element) {
	        return this.optional(element) || !(new RegExp('^' + value[0] + '+$').test(value));
	    }, '不能为同一符号');
	    jQuery.validator.addMethod('phone', function (value, element) {
	        return this.optional(element) || /^(13[0-9]{9}|145[0-9]{8}|147[0-9]{8}|15[0-9]{9}|170[0-9]{8}|18[0-9]{9})$/.test(value)
	    }, '请输入有效的手机号');
	    
	    jQuery.validator.addMethod('illegal', function (value, element) {
	        return this.optional(element) || !/[\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\%\&\'\"\<\>]/.test(value)
	    }, '名称不能包含非法字符');
	  
	
	    jQuery.extend(jQuery.validator.messages, {
	        required: '不能为空',
	        number: '请输入数字',
	        minlength: jQuery.validator.format('不能少于{0}个字符'),
	        maxlength: jQuery.validator.format('不能超过{0}个字符')
	    });
	  
	    jQuery.validator.setDefaults({
	        highlight: function (element, errorClass, validClass) {
	        	 $(element).next().removeClass(validClass).addClass(errorClass);
	        },
	        unhighlight: function (element, errorClass, validClass) {
	        	if($(element).next().next().hasClass('error') || $(element).next().next().hasClass('valid')){
	        		$(element).next().next().remove();
	        	}
	        	
	            $(element).next().removeClass(errorClass).addClass(validClass);
	        },
	        success: function (label, element) {
	        	$(element).trigger('validPass');
	        }
	    });
});